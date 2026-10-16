"use client";
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { localKey } from '@/lib/course-core';
import { downloadText } from '@/lib/download';
import { projectConflictKey, projectSyncKey, syncProject, type ProjectDecision, type ProjectSyncResult } from '@/lib/project-sync';
import type { ProjectDraft } from '@/lib/project-core';

type Store = { value: ProjectDraft; ready: boolean; saving: boolean; blocked: boolean; raw: () => string | null; restore: (value: unknown, baseline: string | null) => Promise<boolean> };
const initial: ProjectSyncResult = { state: 'pending', message: 'Đã lưu trên thiết bị; đang chờ đồng bộ dự án.' };
export default function ProjectCloudSync({ owner, store }: { owner: string | null | undefined; store: Store }) {
    const [result, setResult] = useState(initial), [busy, setBusy] = useState(false);
    const latest = useRef(store);
    const trigger = useRef<((decision?: ProjectDecision) => void) | null>(null);
    useEffect(() => {
        if (!owner) return;
        let active = true, running = false, queued = false;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const schedule = () => { clearTimeout(timer); timer = setTimeout(() => { void run(); }, 750); };
        async function run(decision?: ProjectDecision) {
            if (!active) return;
            if (running) { queued = true; return; }
            if (!latest.current.ready || latest.current.blocked || latest.current.saving) return;
            if (!navigator.locks) { setResult({ state: 'error', message: 'Trình duyệt cần hỗ trợ Web Locks và HTTPS để đồng bộ an toàn.' }); return; }
            running = true; queued = false; setBusy(true);
            try {
                const next = await navigator.locks.request(`project-cloud:${owner}`, { mode: 'exclusive' }, () => syncProject({
                    owner: owner!, active: () => active,
                    local: { raw: () => localStorage.getItem(localKey('project', owner!)), busy: () => !latest.current.ready || latest.current.saving || latest.current.blocked,
                        restore: (value, baseline) => latest.current.restore(value, baseline) },
                    storage: localStorage,
                    remote: {
                        async load(id) {
                            const { data, error } = await supabase.from('project_drafts').select('content,revision').eq('user_id', id).abortSignal(AbortSignal.timeout(15000)).maybeSingle();
                            if (error) throw error; return data;
                        },
                        async save(id, revision, content) {
                            const { data, error } = await supabase.rpc('save_project_draft', { p_owner: id, p_revision: revision, p_content: content }).abortSignal(AbortSignal.timeout(15000));
                            if (error) throw error;
                            return Array.isArray(data) ? data[0] : data;
                        },
                    },
                }, decision));
                if (active) { setResult(next); if (next.state === 'pending') queued = true; }
            } catch {
                if (active) setResult({ state: 'error', message: 'Chưa xác nhận đồng bộ dự án. Bản lưu trên thiết bị được giữ nguyên; thử lại khi có mạng.' });
            } finally {
                running = false;
                if (active) { setBusy(false); if (queued) schedule(); }
            }
        }
        trigger.current = decision => { if (decision) { clearTimeout(timer); void run(decision); } else schedule(); };
        const storageChanged = (event: StorageEvent) => { if (event.key === null || [localKey('project', owner), projectSyncKey(owner)].includes(event.key)) schedule(); };
        window.addEventListener('online', schedule);
        window.addEventListener('storage', storageChanged);
        const interval = setInterval(schedule, 30000);
        schedule();
        return () => { active = false; trigger.current = null; clearTimeout(timer); clearInterval(interval); window.removeEventListener('online', schedule); window.removeEventListener('storage', storageChanged); };
    }, [owner]);
    useEffect(() => {
        latest.current = store;
        trigger.current?.();
    }, [store]);
    if (!owner) return <p>Khách lưu dự án trên thiết bị. Đăng nhập để đồng bộ giữa các thiết bị; bản khách chỉ chuyển qua tài khoản khi bạn chủ động nhập JSON.</p>;
    const disabled = busy || !store.ready || store.saving || store.blocked;
    const conflict = result.conflict;
    const message = result.state === 'synced' && result.localRaw !== store.raw() ? initial.message : result.message;
    return <section className="learning-card project-cloud-sync" aria-label="Đồng bộ dự án">
        <h2>Đồng bộ dự án giữa thiết bị</h2>
        <p>Bản nháp luôn lưu trên thiết bị trước. Đồng bộ riêng theo tài khoản; checklist tự ghi không cấp kết quả kiểm chứng.</p>
        <p role="status">{busy ? 'Đang kiểm tra và đồng bộ dự án…' : store.saving ? 'Đang lưu thay đổi trên thiết bị…' : message}</p>
        <button disabled={disabled} onClick={() => trigger.current?.()}>Đồng bộ lại dự án</button>
        {conflict && <div><h3>Chọn bản dự án muốn giữ</h3><p>Trên thiết bị: {conflict.local.name || '(chưa đặt tên)'}. Trên máy chủ: {conflict.remote.name || '(chưa đặt tên)'}. Lựa chọn thay toàn bộ bản nháp, gồm đề cương và checklist.</p>
            <div className="learning-actions"><button onClick={() => downloadText('project-device.json', JSON.stringify(conflict.local), 'application/json')}>Tải bản thiết bị</button><button onClick={() => downloadText('project-server.json', JSON.stringify(conflict.remote), 'application/json')}>Tải bản máy chủ</button>
                <button disabled={disabled} onClick={() => trigger.current?.({ choice: 'local', conflict })}>Giữ bản thiết bị và thay bản máy chủ</button><button disabled={disabled} onClick={() => trigger.current?.({ choice: 'remote', conflict })}>Dùng bản máy chủ trên thiết bị này</button></div>
            <p>Hai bản được lưu dự phòng trên thiết bị trước khi thay thế. Chỉ giữ cặp xung đột gần nhất; tải JSON nếu cần lưu lâu hơn.</p>
        </div>}
        <button disabled={busy} onClick={() => {
            try {
                const raw = localStorage.getItem(projectConflictKey(owner));
                if (raw) downloadText('project-conflict-backup.json', raw, 'application/json');
                else setResult({ ...result, message: 'Chưa có cặp bản dự phòng xung đột trên thiết bị này.' });
            } catch { setResult({ state: 'error', message: 'Không đọc được bản dự phòng. Kiểm tra bộ nhớ trình duyệt.' }); }
        }}>Tải cặp bản dự phòng xung đột gần nhất</button>
    </section>;
}
