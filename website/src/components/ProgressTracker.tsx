"use client";
import {useLearning,updateEntry,resolveConflict,importGuestProgress,sync} from '@/lib/learning-store';
import type {LearningStatus} from '@/lib/progress-core';
export default function ProgressTracker({exercises}:{phase:string;exercises:{id:string;label:string}[]}) {
 const state=useLearning();
 return <section className="tracker-panel" aria-busy={state.loading}><h2>Tiến độ tự khai báo</h2><p>Đạt kiểm thử chỉ xuất hiện khi có bài nộp được runner xác minh. Tự đánh dấu không cấp điểm kiểm chứng.</p>
 <p role="status">{state.loading?'Đang tải…':state.message}</p>
 {state.owner && <div className="learning-actions"><button onClick={importGuestProgress} disabled={state.loading}>Nhập tiến độ khách (chỉ bài chưa có)</button><button onClick={()=>void sync()}>Đồng bộ lại</button></div>}
 <div className="tracker-exercises">{exercises.map(e=><div className="learning-progress-row" key={e.id}><label htmlFor={'status-'+e.id}>{e.label}</label><select id={'status-'+e.id} disabled={state.loading} value={state.entries[e.id]?.status||'not_started'} onChange={event=>updateEntry(e.id,{status:event.target.value as LearningStatus,due_at:event.target.value==='needs_review'?new Date().toISOString():null})}><option value="not_started">Chưa làm</option><option value="in_progress">Đang làm</option><option value="self_completed">Tự đánh dấu hoàn thành</option><option value="needs_review">Cần ôn</option></select>{state.verified.includes(e.id)&&<strong>Đạt kiểm thử</strong>}{state.entries[e.id]?.pending&&<span>Chưa đồng bộ</span>}{state.entries[e.id]?.conflict&&<div><span>Xung đột · </span><button onClick={()=>void resolveConflict(e.id,false)}>Dùng bản máy chủ</button><button onClick={()=>void resolveConflict(e.id,true)}>Giữ bản thiết bị</button></div>}</div>)}</div></section>;
}
