"use client";
import { useId } from 'react';
import { emptyWriting, type EnglishCatalogue, type EnglishProgress } from '@/lib/english-core';
import type { EnglishSave } from './EnglishPractice';

export default function EnglishWriting({ task, progress, save, disabled }: { task: EnglishCatalogue['writers'][number]; progress: EnglishProgress; save: EnglishSave; disabled: boolean }) {
    const row = progress.writing[task.id] ?? emptyWriting(), id = useId();
    function edit(patch: { text?: string; commit?: string }) {
        void save(latest => ({ ...latest, writing: { ...latest.writing, [task.id]: { ...(latest.writing[task.id] ?? emptyWriting()), ...patch, reviewedAt: null } } }));
    }
    function confirm() {
        const text = row.text, commit = row.commit, now = new Date().toISOString();
        void save(latest => {
            const previous = latest.writing[task.id] ?? emptyWriting();
            if (previous.text !== text || previous.commit !== commit || !text.trim()) throw Error('Writing changed before confirmation');
            return { ...latest, writing: { ...latest.writing, [task.id]: { ...previous, reviewedAt: now } } };
        });
    }
    return <section className="english-writing" aria-labelledby={id}><h3 id={id}>Tự giải thích code · {task.id}</h3><p>{task.task}</p>
        <fieldset disabled={disabled}>{task.commit && <label>Commit mô tả đúng thay đổi của bạn<input lang="en" maxLength={500} value={row.commit} placeholder="feat: … / fix: … / test: …" onChange={event => edit({ commit: event.target.value })} /></label>}<label>Bài viết tiếng Anh<textarea lang="en" maxLength={5000} rows={5} value={row.text} placeholder="The method returns … . I checked … ." onChange={event => edit({ text: event.target.value })} /></label>
            <p>Tự kiểm: có chủ ngữ và động từ; thuật ngữ đúng ngữ cảnh; mô tả khớp code; nêu input, expected/actual và kết quả thực chạy. Dùng 1 câu trước, rồi tăng tới 3–5 câu.</p>
            <button type="button" disabled={disabled || !row.text.trim()} onClick={confirm}>Tôi đã tự đối chiếu bài viết</button>
        </fieldset>
        {row.text.trim() && <details><summary>Đối chiếu mẫu sau khi tự viết</summary>{task.commit && <code lang="en">{task.commit}</code>}<p lang="en">{task.model}</p><p>Thay dữ liệu trong mẫu bằng điều bạn thực hiện. Tự đối chiếu không phải kết quả chấm ngữ pháp tự động hay phản hồi AI.</p></details>}
        {row.reviewedAt && <p>Đã tự đối chiếu bản hiện tại. Sửa nội dung sẽ yêu cầu đối chiếu lại.</p>}
    </section>;
}
