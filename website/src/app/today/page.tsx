"use client";
import ReviewImport from "@/components/ReviewImport";
import Link from 'next/link';
import {useState} from 'react';
import catalogue from '@/generated/catalogue.json';
import {useLearning,updateEntry} from '@/lib/learning-store';
import {recommend,bangkokDate} from '@/lib/progress-core';
export default function Today() {
 const state=useLearning();const [filter,setFilter]=useState('');
 const date=bangkokDate(new Date());
 const choices=recommend(catalogue.exercises,state.entries,date).slice(0,8);
 return <main className="page-shell"><header className="page-heading"><h1>Hôm nay học gì?</h1><p>Ưu tiên bài đang sai, đến hạn, đang làm, rồi bài mới đủ kiến thức tiên quyết theo tiến độ tự khai báo.</p><div className="learning-actions"><Link href="/skills">Bản đồ & kiểm tra đầu vào</Link><Link href="/lab">Bàn thử nghiệm RAG</Link></div></header><ReviewImport/><p role="status">{state.loading?'Đang tải tiến độ…':state.message}</p><div className="learning-grid">{!state.loading&&choices.map(c=>{const e=catalogue.exercises.find(e=>e.id===c.id)!;return <article className="learning-card" key={e.id}><h2><Link href={`/docs/${e.phase}#${e.id}`}>{e.id} — {e.title}</Link></h2><p>{c.reason}</p><p>Tag: {e.tags.join(', ')}</p><button onClick={()=>updateEntry(e.id,{status:'in_progress'})}>Bắt đầu</button><label>Hẹn ôn<input type="date" value={state.entries[e.id]?.due_at?bangkokDate(state.entries[e.id].due_at!):''} onChange={event=>updateEntry(e.id,{due_at:event.target.value?event.target.value+'T00:00:00+07:00':null})}/></label></article>;})}</div><h2>{catalogue.sessions.length} buổi học</h2><label>Lọc buổi học<input value={filter} onChange={e=>setFilter(e.target.value)}/></label>{catalogue.sessions.filter(s=>`${s.id} ${s.title}`.toLowerCase().includes(filter.toLowerCase())).map(s=><details className="learning-card" key={s.id}><summary>{s.id} — {s.title}</summary><p>{s.required}</p><p>Bằng chứng: {s.evidence}</p><p>Mở rộng: {s.extension}</p><div className="learning-actions">{s.exercise_ids.map(id=>{const e=catalogue.exercises.find(e=>e.id===id)!;return <Link key={id} href={`/docs/${e.phase}#${id}`}>{id}</Link>;})}</div></details>)}</main>;
}
