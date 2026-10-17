"use client";
import {useEffect,useRef,useState,type ChangeEvent} from 'react';
import catalogue from '@/generated/catalogue.json';
import {useLearning,importReviewProgress} from '@/lib/learning-store';
import {parseReviewImport,type Entries} from '@/lib/progress-core';
type Preview={entries:Entries;raw:string;name:string};
export default function ReviewImport(){const {owner}=useLearning();return <Import key={owner===undefined?'loading':owner??'guest'} owner={owner}/>;}
function Import({owner}:{owner:string|null|undefined}) {
 const [preview,setPreview]=useState<Preview|null>(null),[message,setMessage]=useState(''),[phase,setPhase]=useState<'idle'|'reading'|'applying'>('idle');
 const generation=useRef(0),currentPreview=useRef<Preview|null>(null),applying=useRef(false);
 useEffect(()=>()=>{generation.current++;currentPreview.current=null;},[]);
 async function read(event:ChangeEvent<HTMLInputElement>){
  const file=event.target.files?.[0];event.target.value='';
  if(!file||owner===undefined||applying.current)return;
  const ticket=++generation.current;
  currentPreview.current=null;setPreview(null);setPhase('reading');setMessage('Đang đọc file lịch ôn…');
  try{
   if(file.size>1024*1024)throw Error('File quá 1 MB');
   const raw=await file.text();
   if(ticket!==generation.current)return;
   const entries=parseReviewImport(JSON.parse(raw),catalogue.exercises.map(e=>e.id),Object.keys(catalogue.tags));
   const next={entries,raw,name:file.name};currentPreview.current=next;setPreview(next);
   setMessage(`Đọc được ${Object.keys(entries).length} bài. Kiểm tra tài khoản trước khi nhập.`);
  }catch{if(ticket===generation.current)setMessage('File review-state.json không hợp lệ, có ID/tag lạ hoặc quá 1 MB. Chưa nhập dữ liệu.');}
  finally{if(ticket===generation.current)setPhase('idle');}
 }
 async function apply(){
  if(owner===undefined||!preview||currentPreview.current!==preview||applying.current)return;
  const ticket=generation.current;applying.current=true;setPhase('applying');setMessage('Đang nhập lịch ôn…');
  try{
   const saved=await importReviewProgress(preview.entries,owner,preview.raw);
   if(ticket!==generation.current)return;
   if(saved){currentPreview.current=null;setPreview(null);setMessage('Đã nhập lịch ôn vào đúng phạm vi đã chọn.');}
   else setMessage('Chưa nhập được lịch ôn. Xem trạng thái tiến độ rồi thử lại.');
  }catch{if(ticket===generation.current)setMessage('Chưa nhập được lịch ôn. Xem trạng thái tiến độ rồi thử lại.');}
  finally{applying.current=false;if(ticket===generation.current)setPhase('idle');}
 }
 return <details className="learning-card"><summary>Nhập lịch ôn từ CLI</summary><p>Chọn progress/review-state.json do scripts/review.py tạo. Chỉ nhập bài chưa có trong tài khoản hiện tại; giữ bản gốc và không cấp đạt kiểm thử.</p><label>File lịch ôn<input type="file" accept=".json,application/json" disabled={owner===undefined||phase==='applying'} onChange={e=>void read(e)}/></label><p>{owner?'Đích: tài khoản đang đăng nhập':'Đích: khách trên thiết bị'}</p>{preview&&<><p>File đã chọn: {preview.name}</p><button disabled={owner===undefined||phase!=='idle'} onClick={()=>void apply()}>Nhập {Object.keys(preview.entries).length} bài (giữ bài đã có)</button></>}<p role="status">{message}</p></details>;
}
