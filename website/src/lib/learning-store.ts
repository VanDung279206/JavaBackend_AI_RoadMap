"use client";
import {useEffect,useSyncExternalStore} from 'react';
import catalogue from '@/generated/catalogue.json';
import {supabase} from './supabase';
import {projectRequest as requestWithDeadline} from './project-request';
import {emptyEntry,importGuest,mergeRemote,parseStoredEntries,storageKey,type Entries,type Entry} from './progress-core';

type Snapshot = {owner:string|null|undefined; entries:Entries; verified:string[]; loading:boolean; saving:boolean; message:string};
const initial:Snapshot={owner:undefined,entries:{},verified:[],loading:true,saving:false,message:''};
let snapshot=initial;
const listeners=new Set<()=>void>();
let started=false, epoch=0, loadId=0;
let lifetime=new AbortController();
const syncing=new Set<string>();
const unreadable=new Set<string>();
const writes=new Map<string,number>();
const valid=new Map(catalogue.exercises.map(e=>[e.id,e]));
const ids=[...valid.keys()];
function publish(patch:Partial<Snapshot>) {
 snapshot={...snapshot,...patch};
 snapshot.saving=snapshot.owner!==undefined&&(writes.get(storageKey(snapshot.owner))??0)>0;
 listeners.forEach(fn=>fn());
}
function read(owner:string|null):Entries {
 const raw=localStorage.getItem(storageKey(owner));
 if(raw===null) {
  if(owner)return {};
  const legacy:Entries={};
  for(const phase of catalogue.phases) {
   const old=JSON.parse(localStorage.getItem(`progress_${phase.slug}`)||'{}');
   for(const [id,done] of Object.entries(old))if(valid.get(id)?.phase===phase.slug&&done===true)legacy[id]={...emptyEntry(),status:'self_completed',pending:true};
  }
  return legacy;
 }
 return parseStoredEntries(JSON.parse(raw),ids);
}
function persist(owner:string|null,entries:Entries) {localStorage.setItem(storageKey(owner),JSON.stringify(entries));}
function readForWrite(owner:string|null):Entries|null {
 try{return read(owner);}
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
type Mutation={entries:Entries;message?:string;verified?:string[];loading?:boolean;persist?:boolean};
// Every progress write uses this short lock, including load/ACK/import paths.
// Never hold it over a request: editing must work while another tab is offline.
async function mutate(owner:string|null,version:number,change:(latest:Entries)=>Mutation|null):Promise<boolean> {
 if(version!==epoch||snapshot.owner!==owner||unreadable.has(storageKey(owner)))return false;
 if(!navigator.locks) {publish({message:'Trình duyệt cần hỗ trợ Web Locks và HTTPS để lưu tiến độ an toàn.'});return false;}
 const key=storageKey(owner),signal=lifetime.signal;
 writes.set(key,(writes.get(key)??0)+1);publish({});
 try {
  return await navigator.locks.request(`progress:${key}`,{mode:'exclusive',signal},()=>{
   if(version!==epoch||snapshot.owner!==owner||unreadable.has(key))return false;
   const latest=readForWrite(owner);if(!latest)return false;
   const result=change(latest);if(!result)return false;
   const {persist:save=true,...patch}=result;
   const entries=parseStoredEntries(patch.entries,ids);
   if(save)persist(owner,entries);
   publish({...patch,entries,message:patch.message??syncMessage(entries)});
   return true;
  });
 }catch {
  if(version===epoch)publish({message:'Lưu thất bại: bộ nhớ thiết bị không khả dụng. Thay đổi chưa được lưu.'});
  return false;
 }finally {
  const count=(writes.get(key)??1)-1;
  if(count)writes.set(key,count);else writes.delete(key);
  publish({});
 }
}
async function load(owner:string|null) {
 if(snapshot.owner!==owner) {lifetime.abort();lifetime=new AbortController();epoch++;}
 const version=epoch,request=++loadId,signal=lifetime.signal;
 publish({owner,entries:{},verified:[],loading:true,message:''});
 const local=readForWrite(owner);
 if(!local){publish({loading:false});return;}
 unreadable.delete(storageKey(owner));publish({entries:local});
 if(!owner){publish({loading:false});return;}
 try {
  const [{data,error},{data:passed,error:proofError}]=await Promise.all([
   requestWithDeadline(signal,abort=>supabase.from('progress').select('exercise_id,phase,status,revision,due_at,hint_level,error_tags').eq('user_id',owner).abortSignal(abort)),
   requestWithDeadline(signal,abort=>supabase.from('submissions').select('exercise_id').eq('user_id',owner).eq('intent','submit').eq('verdict','PASS').not('test_version','is',null).not('finished_at','is',null).abortSignal(abort))
  ]);
  if(version!==epoch||request!==loadId)return;
  if(error)throw error;
  const remote=parseStoredEntries(Object.fromEntries((data||[]).filter(r=>valid.get(r.exercise_id)?.phase===r.phase).map(r=>[r.exercise_id,{status:r.status,revision:r.revision,due_at:r.due_at,hint_level:r.hint_level,error_tags:r.error_tags}])),ids);
  const merged=await mutate(owner,version,latest=>{
   if(request!==loadId)return null;
   const entries=mergeRemote(latest,remote);
   return {entries,verified:(passed||[]).map(r=>r.exercise_id),loading:false,message:proofError?'Không tải được kết quả kiểm chứng.':syncMessage(entries)};
  });
  if(version!==epoch||request!==loadId)return;
  if(!merged)publish({loading:false});else void sync();
 }catch {if(version===epoch&&request===loadId)publish({loading:false,message:'Chưa tải được máy chủ; đang dùng bản dự phòng của tài khoản này.'});}
}
export async function sync() {
 const owner=snapshot.owner,version=epoch,signal=lifetime.signal;
 if(!owner||snapshot.loading||unreadable.has(storageKey(owner))||syncing.has(owner))return;
 if(!navigator.locks){publish({message:'Trình duyệt cần hỗ trợ Web Locks và HTTPS để đồng bộ an toàn.'});return;}
 syncing.add(owner);
 let completed=false;
 try {
  await navigator.locks.request(`learning-sync:${owner}`,{mode:'exclusive',signal},async()=>{
   for(;;) {
    if(version!==epoch)return;
    const queue=readForWrite(owner);if(!queue)return;
    publish({entries:queue});
    const item=Object.entries(queue).find(([,entry])=>entry.pending&&!entry.conflict);
    if(!item){completed=true;publish({message:syncMessage(queue)});return;}
    const [id,entry]=item,e=valid.get(id)!;
    const {data,error}=await requestWithDeadline(signal,abort=>supabase.rpc('save_learning_progress',{p_owner:owner,p_phase:e.phase,p_exercise_id:id,p_status:entry.status,p_revision:entry.revision,p_due_at:entry.due_at,p_hint_level:entry.hint_level,p_error_tags:entry.error_tags}).abortSignal(abort));
    if(version!==epoch)return;
    if(error) {
     await mutate(owner,version,entries=>{
      const current=entries[id];
      if(error.message.includes('PROGRESS_CONFLICT')) {
       if(current?.pending&&current.revision===entry.revision)return {entries:{...entries,[id]:{...current,conflict:true}}};
       return {entries,persist:false};
      }
      return {entries,persist:false,message:'Đã lưu trên thiết bị; chưa đồng bộ. Sẽ thử lại khi có mạng.'};
     });
     return;
    }
    const row=Array.isArray(data)?data[0]:data;
    if(!row||!Number.isSafeInteger(row.revision)||row.revision!==entry.revision+1)throw Error('Invalid progress acknowledgement');
    const saved=await mutate(owner,version,entries=>{
     const current=entries[id];
     if(!current||current.revision!==entry.revision)return {entries,persist:false};
     const unchanged=current.status===entry.status&&current.due_at===entry.due_at&&current.hint_level===entry.hint_level&&JSON.stringify(current.error_tags)===JSON.stringify(entry.error_tags);
     const next={...current,revision:row.revision,pending:!unchanged,conflict:unchanged?false:current.conflict};
     return {entries:{...entries,[id]:next}};
    });
    if(!saved)return;
   }
  });
 }catch {if(version===epoch)publish({message:'Chưa xác nhận đồng bộ. Kiểm tra mạng và bộ nhớ thiết bị.'});}
 finally {
  syncing.delete(owner);
  const pending=Object.values(snapshot.entries).some(e=>e.pending&&!e.conflict);
  if((completed&&version===epoch&&pending)||(version!==epoch&&snapshot.owner===owner&&!snapshot.loading))queueMicrotask(()=>void sync());
 }
}
export async function updateEntry(id:string,patch:Partial<Entry>):Promise<boolean> {
 const owner=snapshot.owner,version=epoch;
 if(owner===undefined||snapshot.loading||!valid.has(id))return false;
 const saved=await mutate(owner,version,latest=>{
  const entry={...(latest[id]||emptyEntry()),...patch,pending:true};
  entry.hint_level=Math.max(latest[id]?.hint_level||0,entry.hint_level);
  return {entries:{...latest,[id]:entry},message:'Đã lưu trên thiết bị.'};
 });
 if(saved)void sync();return saved;
}
export async function importGuestProgress():Promise<boolean> {
 const owner=snapshot.owner,version=epoch;
 if(!owner||snapshot.loading)return false;
 const saved=await mutate(owner,version,latest=>({entries:importGuest(latest,read(null)),message:'Đã nhập bài chưa có trong tài khoản; giữ nguyên các bài đã có.'}));
 if(saved)void sync();return saved;
}
export async function importReviewProgress(entries:Entries,expectedOwner:string|null,original:string):Promise<boolean> {
 const version=epoch;
 if(snapshot.owner!==expectedOwner||snapshot.loading)return false;
 const saved=await mutate(expectedOwner,version,latest=>{
  const merged=importGuest(latest,parseStoredEntries(entries,ids));
  localStorage.setItem(storageKey(expectedOwner)+':review-import:'+Date.now(),original);
  return {entries:merged,message:'Đã nhập lịch ôn; giữ bài đã có. Pass từ CLI chỉ là tự khai báo.'};
 });
 if(saved)void sync();return saved;
}
export async function resolveConflict(id:string,keepLocal:boolean) {
 const owner=snapshot.owner,version=epoch,signal=lifetime.signal;
 if(!owner||snapshot.loading||!valid.has(id)||unreadable.has(storageKey(owner)))return;
 const baseline=JSON.stringify(snapshot.entries[id]);
 try {
  const {data,error}=await requestWithDeadline(signal,abort=>supabase.from('progress').select('status,revision,due_at,hint_level,error_tags').eq('user_id',owner).eq('exercise_id',id).abortSignal(abort).maybeSingle());
  if(version!==epoch)return;
  if(error)throw error;
  const remote:Entry=data?parseStoredEntries({[id]:data},[id])[id]:emptyEntry();
  const saved=await mutate(owner,version,entries=>{
   if(!entries[id]||JSON.stringify(entries[id])!==baseline) {
    publish({entries,message:'Bài đã thay đổi trong khi tải bản máy chủ. Xem lại dữ liệu rồi chọn lại để tránh ghi đè.'});return null;
   }
   const next=keepLocal?{...entries[id],revision:remote.revision,pending:true,conflict:false}:remote;
   return {entries:{...entries,[id]:next},message:'Đã chọn bản dữ liệu.'};
  });
  if(saved)void sync();
 }catch {if(version===epoch)publish({message:'Không lưu được lựa chọn. Dữ liệu hiện tại được giữ nguyên.'});}
}
function refreshLocal() {
 const owner=snapshot.owner;if(owner===undefined)return;
 const entries=readForWrite(owner);if(!entries)return;
 unreadable.delete(storageKey(owner));publish({entries});
 if(!snapshot.loading)void sync();
}
function start() {
 if(started)return;started=true;
 let authSeen=false;
 supabase.auth.onAuthStateChange((_event,session)=>{authSeen=true;const owner=session?.user.id??null;if(snapshot.owner!==owner)void load(owner);});
 supabase.auth.getSession().then(({data,error})=>{if(!authSeen){if(error)publish({loading:false,message:'Không xác định được phiên đăng nhập.'});else void load(data.session?.user.id??null);}}).catch(()=>{if(!authSeen)publish({loading:false,message:'Không xác định được phiên đăng nhập.'});});
 window.addEventListener('online',()=>{if(snapshot.owner!==undefined)void load(snapshot.owner);});
 window.addEventListener('storage',e=>{if(snapshot.owner!==undefined&&(e.key===null||e.key===storageKey(snapshot.owner)))refreshLocal();});
 window.addEventListener('beforeunload',event=>{if(writes.size){event.preventDefault();event.returnValue='';}});
}
export function useLearning() {
 const value=useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},()=>snapshot,()=>initial);
 useEffect(()=>{start();},[]);
 return value;
}
