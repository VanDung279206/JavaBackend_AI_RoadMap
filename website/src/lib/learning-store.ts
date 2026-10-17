"use client";
import {useEffect,useSyncExternalStore} from 'react';
import catalogue from '@/generated/catalogue.json';
import {supabase} from './supabase';
import {emptyEntry,importGuest,mergeRemote,parseStoredEntries,storageKey,type Entries,type Entry} from './progress-core';
type Snapshot = {owner:string|null|undefined; entries:Entries; verified:string[]; loading:boolean; message:string};
const initial:Snapshot={owner:undefined,entries:{},verified:[],loading:true,message:''};
let snapshot=initial;
const listeners=new Set<()=>void>();
let started=false, epoch=0;
const syncing=new Set<string>();
const unreadable=new Set<string>();
const valid=new Map(catalogue.exercises.map(e=>[e.id,e]));
function publish(patch:Partial<Snapshot>) { snapshot={...snapshot,...patch}; listeners.forEach(fn=>fn()); }
function read(owner:string|null):Entries {
 const raw=localStorage.getItem(storageKey(owner));
 if (raw===null) {
  if(owner) return {};
  const legacy:Entries={};
  for(const phase of catalogue.phases) {
   const old=JSON.parse(localStorage.getItem(`progress_${phase.slug}`)||'{}');
   for(const [id,done] of Object.entries(old)) if(valid.get(id)?.phase===phase.slug && done===true) legacy[id]={...emptyEntry(),status:'self_completed',pending:true};
  }
  return legacy;
 }
 return parseStoredEntries(JSON.parse(raw),[...valid.keys()]);
}
function persist(owner:string|null,entries:Entries) { localStorage.setItem(storageKey(owner),JSON.stringify(entries)); }
function readForWrite(owner:string|null):Entries|null {
 try {return read(owner);}
 catch {
  unreadable.add(storageKey(owner));
  publish({message:'Không đọc được bản dự phòng. Đã khóa ghi để giữ dữ liệu; xuất bản dự phòng trong bộ nhớ trình duyệt trước khi sửa.'});
  return null;
 }
}
function syncMessage(entries:Entries) {
 const waiting=Object.values(entries).filter(e=>e.pending);
 if(waiting.some(e=>e.conflict))return 'Có xung đột. Chọn bản máy chủ hoặc giữ bản trên thiết bị.';
 return waiting.length?'Đã lưu trên thiết bị; đang chờ đồng bộ.':'Đã đồng bộ với máy chủ.';
}
async function load(owner:string|null) {
 const version=++epoch;
 publish({owner,entries:{},verified:[],loading:true,message:''});
 let local:Entries;
 try {local=read(owner); unreadable.delete(storageKey(owner));publish({entries:local});}
 catch {unreadable.add(storageKey(owner));publish({loading:false,message:'Không đọc được bản dự phòng. Đã khóa ghi để giữ dữ liệu; xuất bản dự phòng trong bộ nhớ trình duyệt trước khi sửa.'});return;}
 if(!owner) {publish({loading:false});return;}
 try {
  const [{data,error},{data:passed,error:proofError}]=await Promise.all([
   supabase.from('progress').select('exercise_id,phase,status,revision,due_at,hint_level,error_tags').eq('user_id',owner),
   supabase.from('submissions').select('exercise_id').eq('user_id',owner).eq('intent','submit').eq('verdict','PASS').not('test_version','is',null).not('finished_at','is',null)
  ]);
  if(version!==epoch)return;
  if(error)throw error;
  const remote:Entries=Object.fromEntries((data||[]).filter(r=>valid.get(r.exercise_id)?.phase===r.phase).map(r=>[r.exercise_id,{status:r.status,revision:r.revision,due_at:r.due_at,hint_level:r.hint_level,error_tags:r.error_tags}]));
  // A different tab may have saved while the request was in flight, before
  // its storage event reached this tab. Re-read immediately before merging.
  try {local=read(owner);}
  catch {
   unreadable.add(storageKey(owner));
   publish({loading:false,message:'Không đọc được bản dự phòng. Đã khóa ghi để giữ dữ liệu; xuất bản dự phòng trong bộ nhớ trình duyệt trước khi sửa.'});
   return;
  }
  const entries=mergeRemote(local,remote);persist(owner,entries);
  publish({entries,verified:(passed||[]).map(r=>r.exercise_id),loading:false,message:proofError?'Không tải được kết quả kiểm chứng.':Object.values(entries).some(e=>e.conflict)?'Có xung đột. Chọn bản máy chủ hoặc giữ bản trên thiết bị.':''});
  void sync();
 }catch {if(version===epoch)publish({loading:false,message:'Chưa tải được máy chủ; đang dùng bản dự phòng của tài khoản này.'});}
}
export async function sync() {
 const owner=snapshot.owner,version=epoch;
 if(!owner || unreadable.has(storageKey(owner)) || syncing.has(owner))return;
 syncing.add(owner);
 let completed=false;
 try {
  for(const id of Object.keys(snapshot.entries)) {
   if(version!==epoch)return;
   const entry=snapshot.entries[id];
   if(!entry?.pending||entry.conflict)continue;
   const e=valid.get(id)!;
   const {data,error}=await supabase.rpc('save_learning_progress',{p_owner:owner,p_phase:e.phase,p_exercise_id:id,p_status:entry.status,p_revision:entry.revision,p_due_at:entry.due_at,p_hint_level:entry.hint_level,p_error_tags:entry.error_tags});
   if(version!==epoch)return;
   // Storage events can arrive after this response. Merge the acknowledgement
   // into the persisted queue, never the snapshot captured before the RPC.
   let entries=readForWrite(owner);if(!entries)return;
   const current=entries[id];
   if(error){
    if(error.message.includes('PROGRESS_CONFLICT')) {
     if(current?.pending&&current.revision===entry.revision) {
      entries={...entries,[id]:{...current,conflict:true}};persist(owner,entries);
     }
     publish({entries,message:syncMessage(entries)});
    } else publish({entries,message:'Đã lưu trên thiết bị; chưa đồng bộ. Sẽ thử lại khi có mạng.'});
    return;
   }
   const row=Array.isArray(data)?data[0]:data;
   if(!row||!Number.isSafeInteger(row.revision)||row.revision!==entry.revision+1)throw Error('Invalid progress acknowledgement');
   // Another tab may already have acknowledged a later revision or removed
   // this entry. An older response must not recreate or downgrade it.
   if(!current||current.revision!==entry.revision) {publish({entries,message:syncMessage(entries)});continue;}
   const unchanged=JSON.stringify(current)===JSON.stringify(entry);
   const next={...current,revision:row.revision,pending:!unchanged,conflict:unchanged?false:current.conflict};
   entries={...entries,[id]:next};persist(owner,entries);publish({entries,message:syncMessage(entries)});
  }
  if(version!==epoch)return;
  completed=true;
  publish({message:syncMessage(snapshot.entries)});
 }catch {if(version===epoch)publish({message:'Chưa xác nhận đồng bộ. Kiểm tra mạng và bộ nhớ thiết bị.'});}
 finally {
  syncing.delete(owner);
  // Retry a successful pass if any exercise was queued while it was running.
  // Failed RPCs and conflicts wait for reconnect/manual action, avoiding a busy loop.
  const pending=Object.values(snapshot.entries).some(e=>e.pending&&!e.conflict);
  if((completed&&version===epoch&&pending)||(version!==epoch&&snapshot.owner===owner&&!snapshot.loading))queueMicrotask(()=>void sync());
 }
}
export function updateEntry(id:string,patch:Partial<Entry>) {
 if(snapshot.owner===undefined||snapshot.loading||unreadable.has(storageKey(snapshot.owner))||!valid.has(id))return false;
 const latest=readForWrite(snapshot.owner);if(!latest)return false;
 const entry={...(latest[id]||emptyEntry()),...patch,pending:true};
 entry.hint_level=Math.max(latest[id]?.hint_level||0,entry.hint_level);
 if(!['not_started','in_progress','self_completed','needs_review'].includes(entry.status))return false;
 const entries={...latest,[id]:entry};
 try {persist(snapshot.owner,entries);publish({entries,message:'Đã lưu trên thiết bị.'});void sync();return true;}
 catch {publish({message:'Lưu thất bại: bộ nhớ thiết bị không khả dụng. Thay đổi chưa được lưu.'});return false;}
}
export function importGuestProgress() {
 if(!snapshot.owner||snapshot.loading||unreadable.has(storageKey(snapshot.owner)))return;
 const latest=readForWrite(snapshot.owner);if(!latest)return;
 try {const entries=importGuest(latest,read(null));persist(snapshot.owner,entries);publish({entries,message:'Đã nhập bài chưa có trong tài khoản; giữ nguyên các bài đã có.'});void sync();}
 catch {publish({message:'Không nhập được dữ liệu khách.'});}
}
export function importReviewProgress(entries:Entries,expectedOwner:string|null,original:string) {
 if(snapshot.owner!==expectedOwner||snapshot.loading||unreadable.has(storageKey(expectedOwner)))return false;
 try {
  const latest=readForWrite(expectedOwner);if(!latest)return false;
  const merged=importGuest(latest,entries);
  localStorage.setItem(storageKey(expectedOwner)+':review-import:'+Date.now(),original);
  persist(expectedOwner,merged);publish({entries:merged,message:'Đã nhập lịch ôn; giữ bài đã có. Pass từ CLI chỉ là tự khai báo.'});void sync();return true;
 }catch {publish({message:'Không lưu được lịch ôn; dữ liệu trên file gốc không thay đổi.'});return false;}
}
export async function resolveConflict(id:string,keepLocal:boolean) {
 const owner=snapshot.owner,version=epoch;
 if(!owner||snapshot.loading||!valid.has(id)||unreadable.has(storageKey(owner)))return;
 const baseline=JSON.stringify(snapshot.entries[id]);
 try {
  const {data,error}=await supabase.from('progress').select('status,revision,due_at,hint_level,error_tags').eq('user_id',owner).eq('exercise_id',id).maybeSingle();
  if(version!==epoch)return;
  if(error){publish({message:'Chưa tải được bản máy chủ để giải quyết xung đột.'});return;}
  const entries=readForWrite(owner);if(!entries)return;
  if(!entries[id]||JSON.stringify(entries[id])!==baseline) {
   publish({entries,message:'Bài đã thay đổi trong khi tải bản máy chủ. Xem lại dữ liệu rồi chọn lại để tránh ghi đè.'});
   return;
  }
  const remote:Entry=data?parseStoredEntries({[id]:data},[id])[id]:emptyEntry();
  const next=keepLocal?{...entries[id],revision:remote.revision,pending:true,conflict:false}:remote;
  const merged={...entries,[id]:next};persist(owner,merged);publish({entries:merged,message:'Đã chọn bản dữ liệu.'});void sync();
 }catch {if(version===epoch)publish({message:'Không lưu được lựa chọn. Dữ liệu hiện tại được giữ nguyên.'});}
}

function start() {
 if(started)return;started=true;
 let authSeen=false;
 supabase.auth.onAuthStateChange((_event,session)=>{authSeen=true;const owner=session?.user.id??null;if(snapshot.owner!==owner)void load(owner);});
 supabase.auth.getSession().then(({data,error})=>{if(!authSeen){if(error)publish({loading:false,message:'Không xác định được phiên đăng nhập.'});else void load(data.session?.user.id??null);}});
 window.addEventListener('online',()=>{if(snapshot.owner!==undefined)void load(snapshot.owner);});
 window.addEventListener('storage',e=>{if(snapshot.owner!==undefined&&e.key===storageKey(snapshot.owner))void load(snapshot.owner);});
}
export function useLearning() {
 const value=useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},()=>snapshot,()=>initial);
 useEffect(()=>{start();},[]);
 return value;
}
