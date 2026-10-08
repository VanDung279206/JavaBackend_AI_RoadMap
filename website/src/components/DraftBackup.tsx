"use client";
import { useState, type ChangeEvent } from 'react';

type Props<T> = {
    store: {
        ready: boolean; saving: boolean; blocked: boolean;
        raw: () => string | null;
        restore: (input: unknown, baseline: string | null, merge?: (latest: T, imported: T) => T) => Promise<boolean>;
    };
    parse: (input: unknown) => T;
    describe: (value: T) => string;
    merge?: (latest: T, imported: T) => T;
    maxBytes: number;
    policy: string;
};
export default function DraftBackup<T>({ store, parse, describe, merge, maxBytes, policy }: Props<T>) {
    const [preview, setPreview] = useState<{ value: T; baseline: string | null; filename: string } | null>(null);
    const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
    const disabled = !store.ready || store.saving || store.blocked || busy;
    async function choose(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file || disabled) return;
        const baseline = store.raw();
        setPreview(null); setBusy(true); setMessage('Đang đọc file…');
        try {
            if (file.size > maxBytes) throw Error('File too large');
            const value = parse(JSON.parse(await file.text()));
            setPreview({ value, baseline, filename: file.name });
            setMessage('File hợp lệ. Xem trước rồi chọn áp dụng; dữ liệu chưa được thay đổi.');
        } catch {
            setMessage('Không đọc được bản lưu hợp lệ hoặc file quá lớn. Dữ liệu hiện tại được giữ nguyên.');
        } finally { setBusy(false); }
    }
    async function apply() {
        if (!preview || disabled) return;
        setBusy(true);
        try {
            const restored = await store.restore(preview.value, preview.baseline, merge);
            setMessage(restored ? 'Đã nhập và lưu bản sao trên thiết bị trong phạm vi tài khoản/khách hiện tại.' : 'Chưa nhập được. Xem trạng thái lưu phía trên; chọn lại file nếu dữ liệu đã thay đổi.');
            if (restored) setPreview(null);
        } catch {
            setMessage('Không nhập được bản lưu. Bạn có thể chọn lại file và thử lại.');
        } finally { setBusy(false); }
    }
    return <section className="learning-card">
        <h2>Nhập bản lưu JSON</h2>
        <p>Chọn bản JSON đã tải từ thiết bị khác. {policy} Bạn có thể tải bản hiện tại trước khi áp dụng.</p>
        {store.blocked && <p>Bản hiện tại đang bị khóa ghi. Tải bản gốc để giữ dữ liệu trước khi xử lý lỗi bộ nhớ trình duyệt.</p>}
        <label>Chọn file JSON<input type="file" accept=".json,application/json" disabled={disabled} onChange={choose} /></label>
        <p role="status">{message}</p>
        {preview && <div><h3>Xem trước: {preview.filename}</h3><p>{describe(preview.value)}</p><p>{policy}</p>
            <div className="learning-actions"><button disabled={disabled} onClick={apply}>Áp dụng bản lưu đã chọn</button><button disabled={busy} onClick={() => { setPreview(null); setMessage('Đã hủy nhập; dữ liệu hiện tại được giữ nguyên.'); }}>Hủy nhập</button></div>
        </div>}
    </section>;
}
