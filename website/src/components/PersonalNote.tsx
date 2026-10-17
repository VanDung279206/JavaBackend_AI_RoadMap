"use client";
import {useEffect,useRef,useState} from 'react';
import {useLearning} from '@/lib/learning-store';
import {supabase} from '@/lib/supabase';
import {projectRequest as requestWithDeadline} from '@/lib/project-request';
export default function PersonalNote({resourceKey}:{resourceKey:string}) {
 const {owner}=useLearning();
 // Remount on identity/resource changes so no previous user's note remains visible.
 return <Note key={`${owner}:${resourceKey}`} owner={owner} resourceKey={resourceKey}/>;
}
function Note({owner,resourceKey}:{owner:string|null|undefined;resourceKey:string}) {
 const [note,setNote]=useState(''),[bookmarked,setBookmarked]=useState(false),[message,setMessage]=useState('');
 const [phase,setPhase]=useState<'loading'|'ready'|'saving'|'load-error'>('loading'),[retry,setRetry]=useState(0);
 const lifetime=useRef<AbortController|null>(null),saving=useRef(false);
 useEffect(()=>{
  if(!owner)return;
  const controller=new AbortController();lifetime.current=controller;
  void (async()=>{
   try{
    const {data,error}=await requestWithDeadline(controller.signal,signal=>supabase.from('learning_notes').select('note,bookmarked').eq('user_id',owner).eq('resource_key',resourceKey).abortSignal(signal).maybeSingle());
    if(controller.signal.aborted)return;
    if(error)throw error;
    if(data!==null&&(!data||typeof data.note!=='string'||typeof data.bookmarked!=='boolean'))throw Error('Invalid note response');
    setNote(data?.note??'');setBookmarked(data?.bookmarked??false);setMessage('');setPhase('ready');
   }catch{if(!controller.signal.aborted){setMessage('Chưa tải được ghi chú. Hãy thử tải lại ghi chú.');setPhase('load-error');}}
  })();
  return()=>{controller.abort();if(lifetime.current===controller)lifetime.current=null;};
 },[owner,resourceKey,retry]);
 async function save(){
  const controller=lifetime.current;
  if(!owner||phase!=='ready'||saving.current||!controller||controller.signal.aborted)return;
  saving.current=true;setPhase('saving');setMessage('Đang lưu ghi chú…');
  try{
   const {error}=await requestWithDeadline(controller.signal,signal=>supabase.from('learning_notes').upsert({user_id:owner,resource_key:resourceKey,note,bookmarked,updated_at:new Date().toISOString()}).abortSignal(signal));
   if(error)throw error;
   if(!controller.signal.aborted)setMessage('Đã lưu ghi chú và dấu trang.');
  }catch{if(!controller.signal.aborted)setMessage('Lưu thất bại; nội dung đang nhập vẫn ở đây.');}
  finally{saving.current=false;if(!controller.signal.aborted)setPhase('ready');}
 }
 return <details className="learning-card"><summary>Đánh dấu & ghi chú cá nhân</summary>{!owner?<p>Đăng nhập để lưu ghi chú riêng cho tài khoản.</p>:<><label><input type="checkbox" checked={bookmarked} disabled={phase!=='ready'} onChange={e=>setBookmarked(e.target.checked)}/> Đánh dấu tài liệu</label><label>Ghi chú<textarea maxLength={10000} value={note} disabled={phase!=='ready'} onChange={e=>setNote(e.target.value)}/></label><button disabled={phase!=='ready'} onClick={()=>void save()}>Lưu ghi chú</button>{phase==='load-error'&&<button onClick={()=>{setPhase('loading');setMessage('Đang tải ghi chú…');setRetry(value=>value+1);}}>Tải lại ghi chú</button>}<p role="status">{message}</p></>}</details>;
}
