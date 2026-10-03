"use client";
import {useState} from 'react';
import catalogue from '@/generated/catalogue.json';
import {useLearning,importReviewProgress} from '@/lib/learning-store';
import {parseReviewImport,type Entries} from '@/lib/progress-core';
export default function ReviewImport(){const {owner}=useLearning();return <Import key={owner??'guest'} owner={owner}/>;}
function Import({owner}:{owner:string|null|undefined}) {
 const [preview,setPreview]=useState<Entries|null>(null),[raw,setRaw]=useState(''),[message,setMessage]=useState('');
 async function read(file?:File){if(!file)return;try{if(file.size>1024*1024)throw Error('File quá 1 MB');const text=await file.text();const entries=parseReviewImport(JSON.parse(text),catalogue.exercises.map(e=>e.id),Object.keys(catalogue.tags));setPreview(entries);setRaw(text);setMessage(`Đọc được ${Object.keys(entries).length} bài. Kiểm tra tài khoản trước khi nhập.`);}catch{setPreview(null);setMessage('File review-state.json không hợp lệ, có ID/tag lạ hoặc quá 1 MB. Chưa nhập dữ liệu.');}}
 return <details className="learning-card"><summary>Nhập lịch ôn từ CLI</summary><p>Chọn progress/review-state.json do scripts/review.py tạo. Chỉ nhập bài chưa có trong tài khoản hiện tại; giữ bản gốc và không cấp đạt kiểm thử.</p><label>File lịch ôn<input type="file" accept=".json,application/json" onChange={e=>void read(e.target.files?.[0])}/></label><p>{owner?'Đích: tài khoản đang đăng nhập':'Đích: khách trên thiết bị'}</p>{preview&&<button disabled={owner===undefined} onClick={()=>{if(owner!==undefined&&importReviewProgress(preview,owner,raw)){setPreview(null);setMessage('Đã nhập lịch ôn vào đúng phạm vi đã chọn.');}}}>Nhập {Object.keys(preview).length} bài (giữ bài đã có)</button>}<p role="status">{message}</p></details>;
}
