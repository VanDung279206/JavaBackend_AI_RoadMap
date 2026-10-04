"use client";
import {useState,type FormEvent} from 'react';
import {supabase} from '@/lib/supabase';
export default function ResetPassword(){
 const [password,setPassword]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);try{const {data,error:sessionError}=await supabase.auth.getSession();if(sessionError||!data.session)throw Error('Liên kết hết hạn hoặc chưa có phiên xác thực. Yêu cầu email mới.');const {error}=await supabase.auth.updateUser({password});if(error)throw error;setPassword('');setMessage('Đã đổi mật khẩu.');}catch{setMessage('Chưa đổi được mật khẩu. Kiểm tra liên kết email và thử lại.');}finally{setBusy(false);}}
 return <main className="page-shell"><h1>Đặt lại mật khẩu</h1><form className="learning-card" onSubmit={submit}><label>Mật khẩu mới<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={busy}>Lưu mật khẩu</button><p role="status">{message}</p></form></main>;
}
