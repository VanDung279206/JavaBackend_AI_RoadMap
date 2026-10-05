"use client";
import {useEffect,useState} from 'react';
import {useLearning} from '@/lib/learning-store';
import {supabase} from '@/lib/supabase';
export default function PersonalNote({resourceKey}:{resourceKey:string}) {
 const {owner}=useLearning();
 // Remount on identity/resource changes so no previous user's note remains visible.
 return <Note key={`${owner}:${resourceKey}`} owner={owner} resourceKey={resourceKey}/>;
}
function Note({owner,resourceKey}:{owner:string|null|undefined;resourceKey:string}) {
 const [note,setNote]=useState(''),[bookmarked,setBookmarked]=useState(false),[message,setMessage]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{
  let active=true;
  if(owner===undefined)return;
  if(!owner){Promise.resolve().then(()=>{if(active)setLoading(false);});return()=>{active=false;};}
  supabase.from('learning_notes').select('note,bookmarked').eq('user_id',owner).eq('resource_key',resourceKey).maybeSingle().then(({data,error})=>{if(!active)return;if(error)setMessage('Chưa tải được ghi chú; thử tải lại trang.');else{setNote(data?.note||'');setBookmarked(data?.bookmarked||false);setLoading(false);}});
  return()=>{active=false;};
 },[owner,resourceKey]);
 async function save(){if(!owner||loading)return;setLoading(true);const {error}=await supabase.from('learning_notes').upsert({user_id:owner,resource_key:resourceKey,note,bookmarked,updated_at:new Date().toISOString()});setMessage(error?'Lưu thất bại; nội dung đang nhập vẫn ở đây.':'Đã lưu ghi chú và dấu trang.');setLoading(false);}
 return <details className="learning-card"><summary>Đánh dấu & ghi chú cá nhân</summary>{!owner?<p>Đăng nhập để lưu ghi chú riêng cho tài khoản.</p>:<><label><input type="checkbox" checked={bookmarked} disabled={loading} onChange={e=>setBookmarked(e.target.checked)}/> Đánh dấu tài liệu</label><label>Ghi chú<textarea maxLength={10000} value={note} disabled={loading} onChange={e=>setNote(e.target.value)}/></label><button disabled={loading} onClick={()=>void save()}>Lưu ghi chú</button><p role="status">{message}</p></>}</details>;
}
