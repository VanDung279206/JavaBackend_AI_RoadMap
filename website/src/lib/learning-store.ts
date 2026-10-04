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
 if (!raw) {
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
   if(!entry.pending||entry.conflict)continue;
   const e=valid.get(id)!;
   const {data,error}=await supabase.rpc('save_learning_progress',{p_owner:owner,p_phase:e.phase,p_exercise_id:id,p_status:entry.status,p_revision:entry.revision,p_due_at:entry.due_at,p_hint_level:entry.hint_level,p_error_tags:entry.error_tags});
   if(version!==epoch)return;
   if(error){
    if(error.message.includes('PROGRESS_CONFLICT')) {
     const entries={...snapshot.entries,[id]:{...snapshot.entries[id],conflict:true}};persist(owner,entries);publish({entries,message:'Xung đột: một phiên khác đã sửa bài này.'});
    } else publish({message:'Đã lưu trên thiết bị; chưa đồng bộ. Sẽ thử lại khi có mạng.'});
    return;
   }
   const row=Array.isArray(data)?data[0]:data;
   const current=snapshot.entries[id];
   // Do not discard an edit made while the network request was in flight.
   const next=current===entry?{...entry,revision:row.revision,pending:false,conflict:false}:{...current,revision:row.revision};
   const entries={...snapshot.entries,[id]:next};persist(owner,entries);publish({entries,message:syncMessage(entries)});
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
 const entry={...(snapshot.entries[id]||emptyEntry()),...patch,pending:true};
 entry.hint_level=Math.max(snapshot.entries[id]?.hint_level||0,entry.hint_level);
 if(!['not_started','in_progress','self_completed','needs_review'].includes(entry.status))return false;
 const entries={...snapshot.entries,[id]:entry};
 try {persist(snapshot.owner,entries);publish({entries,message:'Đã lưu trên thiết bị.'});void sync();return true;}
 catch {publish({message:'Lưu thất bại: bộ nhớ thiết bị không khả dụng. Thay đổi chưa được lưu.'});return false;}
}
export function importGuestProgress() {
 if(!snapshot.owner||snapshot.loading||unreadable.has(storageKey(snapshot.owner)))return;
 try {const entries=importGuest(snapshot.entries,read(null));persist(snapshot.owner,entries);publish({entries,message:'Đã nhập bài chưa có trong tài khoản; giữ nguyên các bài đã có.'});void sync();}
 catch {publish({message:'Không nhập được dữ liệu khách.'});}
}
export function importReviewProgress(entries:Entries,expectedOwner:string|null,original:string) {
 if(snapshot.owner!==expectedOwner||snapshot.loading||unreadable.has(storageKey(expectedOwner)))return false;
 try {
  const merged=importGuest(snapshot.entries,entries);
  localStorage.setItem(storageKey(expectedOwner)+':review-import:'+Date.now(),original);
  persist(expectedOwner,merged);publish({entries:merged,message:'Đã nhập lịch ôn; giữ bài đã có. Pass từ CLI chỉ là tự khai báo.'});void sync();return true;
 }catch {publish({message:'Không lưu được lịch ôn; dữ liệu trên file gốc không thay đổi.'});return false;}
}
export async function resolveConflict(id:string,keepLocal:boolean) {
 const owner=snapshot.owner,version=epoch;if(!owner||unreadable.has(storageKey(owner)))return;
 const {data,error}=await supabase.from('progress').select('status,revision,due_at,hint_level,error_tags').eq('user_id',owner).eq('exercise_id',id).maybeSingle();
 if(version!==epoch)return;
 if(error){publish({message:'Chưa tải được bản máy chủ để giải quyết xung đột.'});return;}
 const remote:Entry=data?{status:data.status,revision:data.revision,due_at:data.due_at,hint_level:data.hint_level,error_tags:data.error_tags}:emptyEntry();
 const next=keepLocal?{...snapshot.entries[id],revision:remote.revision,pending:true,conflict:false}:remote;
 try {const entries={...snapshot.entries,[id]:next};persist(owner,entries);publish({entries,message:'Đã chọn bản dữ liệu.'});void sync();}
 catch {publish({message:'Không lưu được lựa chọn.'});}
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
