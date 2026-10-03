"use client";
import {useEffect,useState} from 'react';
import catalogue from '@/generated/catalogue.json';
import {useLearning,updateEntry} from '@/lib/learning-store';
import {supabase} from '@/lib/supabase';
import PersonalNote from './PersonalNote';
type Attempt={id:string;intent:string;verdict:string;source:string;diagnostics:Record<string,unknown>;created_at:string;test_version:string|null};
export default function LearningTools({exerciseId}:{exerciseId:string}) {
 const state=useLearning();
 return <Tools key={`${state.owner}:${exerciseId}`} exerciseId={exerciseId}/>;
}
function Tools({exerciseId}:{exerciseId:string}) {
 const state=useLearning(), exercise=catalogue.exercises.find(e=>e.id===exerciseId)!;
 const [hint,setHint]=useState(0),[source,setSource]=useState(''),[prediction,setPrediction]=useState(''),[cause,setCause]=useState(''),[tag,setTag]=useState(exercise.tags[0]||'validation');
 const [attempts,setAttempts]=useState<Attempt[]>([]),[message,setMessage]=useState(''),[saving,setSaving]=useState(false);
 useEffect(()=>{let active=true;if(state.owner)supabase.from('submissions').select('*').eq('user_id',state.owner).eq('exercise_id',exerciseId).order('created_at',{ascending:false}).limit(30).then(({data,error})=>{if(active){setAttempts((data||[]) as Attempt[]);if(error)setMessage('Không tải được lịch sử nộp bài.');}});return()=>{active=false;};},[state.owner,exerciseId]);
 async function submit(intent:'run'|'submit') {
  if(!state.owner){setMessage('Đăng nhập để lưu từng lần chạy/nộp.');return;}
  setSaving(true);
  try {const {data,error}=await supabase.rpc('submit_learning_attempt',{p_owner:state.owner,p_phase:exercise.phase,p_exercise_id:exerciseId,p_source:source,p_intent:intent});if(error)throw error;const attempt=(Array.isArray(data)?data[0]:data) as Attempt;setAttempts(old=>[attempt,...old]);setMessage(`${attempt.verdict}: Đã lưu lần ${intent==='run'?'chạy thử':'nộp bài'}. Chưa có runner cô lập được cấu hình; chưa chạy test.`);}
  catch {setMessage('Không lưu được lần nộp. Mã vẫn nằm trong ô nhập; thử lại sau.');}
  finally{setSaving(false);}
 }
 function recordError(){
  if(!prediction.trim()||!cause.trim()){setMessage('Ghi dự đoán và nguyên nhân trước khi lưu nhật ký.');return;}
  try{const key=`error-clinic:${state.owner||'guest'}`;const old=JSON.parse(localStorage.getItem(key)||'[]');old.push({exerciseId,prediction,cause,tag,hint,date:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(old));updateEntry(exerciseId,{status:'needs_review',error_tags:[tag],hint_level:hint,due_at:new Date(Date.now()+86400000).toISOString()});setMessage('Đã lưu nhật ký lỗi trên thiết bị, trong phạm vi tài khoản này.');}catch{setMessage('Không lưu được nhật ký lỗi.');}
 }
 return <div className="learning-tools">
 <section className="learning-card"><h3>Gia sư gợi ý theo cấp</h3><p>Gợi ý bám hợp đồng bài; mức hỗ trợ đã dùng được lưu vào tiến độ. AI không cấp kết quả đạt.</p><div className="learning-actions">{exercise.hints.map((_,i)=><button key={i} onClick={()=>{setHint(i+1);updateEntry(exerciseId,{hint_level:Math.max(i+1,state.entries[exerciseId]?.hint_level||0)});}}>Gợi ý {i+1}</button>)}</div>{hint>0&&<p>{exercise.hints[hint-1]}</p>}{!exercise.hints.length&&<p>Bài này chưa có bộ gợi ý ba cấp.</p>}</section>
 {exercise.track==='debug'&&<section className="learning-card"><h3>Phòng khám lỗi</h3><p>Chạy mã cố ý sai trong <code>debug/starter/Bugs.java</code> bằng lệnh bên dưới, quan sát lỗi rồi sửa starter và chạy lại.</p><pre>{exercise.check.command}</pre><label>Dự đoán trước khi chạy<textarea value={prediction} onChange={e=>setPrediction(e.target.value)}/></label><label>Nguyên nhân, kết quả thực tế và bản sửa<textarea value={cause} onChange={e=>setCause(e.target.value)}/></label><label>Tag lỗi<select value={tag} onChange={e=>setTag(e.target.value)}>{Object.entries(catalogue.tags).map(([id,label])=><option key={id} value={id}>{id} — {label}</option>)}</select></label><button onClick={recordError}>Lưu nhật ký và hẹn ôn</button></section>}
 <section className="learning-card"><h3>Chạy thử / Nộp bài</h3><p><strong>BLOCKED:</strong> Website tĩnh chưa có runner Java/Maven cô lập. Có thể lưu lần nộp; không có kết quả đạt giả lập. Trình chạy nhúng ở trên chỉ hỗ trợ thử mã.</p><label>Mã nguồn hoặc nội dung bài nộp<textarea className="submission-source" maxLength={120000} value={source} onChange={e=>setSource(e.target.value)} spellCheck={false}/></label><div className="learning-actions"><button disabled={saving||!source.trim()} onClick={()=>void submit('run')}>Chạy thử</button><button disabled={saving||!source.trim()} onClick={()=>void submit('submit')}>Nộp bài</button></div><p role="status">{message}</p><h4>Lịch sử 30 lần gần nhất</h4>{attempts.map(a=><details key={a.id}><summary>{new Date(a.created_at).toLocaleString('vi')} · {a.intent} · {a.verdict}</summary><pre>{JSON.stringify(a.diagnostics,null,2)}</pre><pre>{a.source}</pre></details>)}</section>
 <PersonalNote resourceKey={`exercise:${exerciseId}`}/></div>;
}
