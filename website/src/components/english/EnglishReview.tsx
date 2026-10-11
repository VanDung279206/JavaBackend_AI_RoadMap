"use client";
import { useRef, useState } from 'react';
import { emptyTerm, englishReviewState, scheduleReview, type EnglishProgress, type EnglishTerm, type Rating } from '@/lib/english-core';
import type { EnglishSave } from './EnglishPractice';
import SpeakButton from './SpeakButton';

export default function EnglishReview({ term, progress, save, disabled, ratedInSession = false, sessionAnswer = '', onRated }: { term: EnglishTerm; progress: EnglishProgress; save: EnglishSave; disabled: boolean; ratedInSession?: boolean; sessionAnswer?: string; onRated?: (state: string, answer: string) => void }) {
    const [answer, setAnswer] = useState(sessionAnswer), [revealed, setRevealed] = useState(false), [rated, setRated] = useState(false), [message, setMessage] = useState('');
    const saving = useRef(false);
    const baseline = useRef<string | null>(null);
    const [busy, setBusy] = useState(false);
    const row = progress.terms[term.id] ?? emptyTerm();
    const locked = rated || ratedInSession;
    async function rate(rating: Rating) {
        if (!revealed || !answer.trim() || locked || saving.current || baseline.current === null) return;
        saving.current = true; setBusy(true);
        const now = new Date().toISOString();
        const expected = baseline.current;
        let conflict = false;
        let savedState = '';
        const saved = await save(latest => {
            const previous = latest.terms[term.id] ?? emptyTerm();
            if (englishReviewState(previous) !== expected) { conflict = true; throw Error('Review changed after reveal'); }
            const next = scheduleReview(previous, rating, now);
            savedState = englishReviewState(next);
            return { ...latest, terms: { ...latest.terms, [term.id]: next } };
        });
        if (saved) { setRated(true); onRated?.(savedState, answer); setMessage('Đã lưu lượt ôn và ngày ôn tiếp theo.'); }
        else {
            if (conflict) { baseline.current = null; setRevealed(false); }
            setMessage(conflict ? 'Lịch ôn đã thay đổi ở tab khác hoặc sau khi nhập bản lưu. Mở lại đáp án để bắt đầu lượt mới.' : 'Chưa lưu được lượt ôn. Kiểm tra trạng thái lưu và thử lại.');
        }
        saving.current = false; setBusy(false);
    }
    return <article className="learning-card english-flashcard"><h2 lang="en">{term.term}</h2><p>Tự giải thích nghĩa trước khi mở đáp án. Đánh giá dưới đây là mức nhớ bạn tự chọn.</p>
        <label>Nghĩa bạn nhớ<input disabled={disabled || busy || locked} maxLength={2000} value={answer} onChange={event => { setAnswer(event.target.value); baseline.current = null; setRevealed(false); setMessage(''); }} /></label><button type="button" disabled={disabled || busy || locked || !answer.trim()} onClick={() => { baseline.current = englishReviewState(row); setRevealed(true); }}>Mở đáp án flashcard</button>
        {(revealed || ratedInSession) && <><p>{term.meaning}</p><p lang="en">{term.example}</p><p>{term.translation}</p><SpeakButton text={term.example} /><div className="learning-actions">{([['again', 'Chưa nhớ'], ['hard', 'Nhớ khó'], ['good', 'Nhớ được'], ['easy', 'Nhớ dễ']] as const).map(([rating, label]) => <button type="button" key={rating} disabled={disabled || locked || busy} onClick={() => rate(rating)}>{label}</button>)}</div></>}
        <p role="status">{message || (ratedInSession ? 'Đã lưu lượt ôn và ngày ôn tiếp theo.' : '')}</p>{row.dueAt && <p>Ôn tiếp: {new Date(row.dueAt).toLocaleString('vi-VN', { timeZone: 'Asia/Bangkok' })}</p>}
        {row.reviews.length > 0 && <details><summary>Lịch sử ôn ({row.reviews.length} lượt gần nhất)</summary><ol>{row.reviews.slice().reverse().map((review, i) => <li key={i}>{new Date(review.at).toLocaleString('vi-VN', { timeZone: 'Asia/Bangkok' })} · {{ again: 'Chưa nhớ', hard: 'Nhớ khó', good: 'Nhớ được', easy: 'Nhớ dễ' }[review.rating]}</li>)}</ol></details>}
    </article>;
}
