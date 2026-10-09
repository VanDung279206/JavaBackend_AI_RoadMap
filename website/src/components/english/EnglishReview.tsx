"use client";
import { useRef, useState } from 'react';
import { emptyTerm, scheduleReview, type EnglishProgress, type EnglishTerm, type Rating } from '@/lib/english-core';
import type { EnglishSave } from './EnglishPractice';
import SpeakButton from './SpeakButton';

export default function EnglishReview({ term, progress, save, disabled }: { term: EnglishTerm; progress: EnglishProgress; save: EnglishSave; disabled: boolean }) {
    const [answer, setAnswer] = useState(''), [revealed, setRevealed] = useState(false), [rated, setRated] = useState(false), [message, setMessage] = useState('');
    const saving = useRef(false);
    const [busy, setBusy] = useState(false);
    const row = progress.terms[term.id] ?? emptyTerm();
    async function rate(rating: Rating) {
        if (!revealed || !answer.trim() || rated || saving.current) return;
        saving.current = true; setBusy(true);
        const now = new Date().toISOString();
        const saved = await save(latest => ({ ...latest, terms: { ...latest.terms, [term.id]: scheduleReview(latest.terms[term.id] ?? emptyTerm(), rating, now) } }));
        if (saved) { setRated(true); setMessage('Đã lưu lượt ôn và ngày ôn tiếp theo.'); }
        else setMessage('Chưa lưu được lượt ôn. Kiểm tra trạng thái lưu và thử lại.');
        saving.current = false; setBusy(false);
    }
    return <article className="learning-card english-flashcard"><h2 lang="en">{term.term}</h2><p>Tự giải thích nghĩa trước khi mở đáp án. Đánh giá dưới đây là mức nhớ bạn tự chọn.</p>
        <label>Nghĩa bạn nhớ<input maxLength={2000} value={answer} onChange={event => { setAnswer(event.target.value); setRevealed(false); setRated(false); }} /></label><button type="button" disabled={!answer.trim()} onClick={() => setRevealed(true)}>Mở đáp án flashcard</button>
        {revealed && <><p>{term.meaning}</p><p lang="en">{term.example}</p><p>{term.translation}</p><SpeakButton text={term.example} /><div className="learning-actions">{([['again', 'Chưa nhớ'], ['hard', 'Nhớ khó'], ['good', 'Nhớ được'], ['easy', 'Nhớ dễ']] as const).map(([rating, label]) => <button type="button" key={rating} disabled={disabled || rated || busy} onClick={() => rate(rating)}>{label}</button>)}</div></>}
        <p role="status">{message}</p>{row.dueAt && <p>Ôn tiếp: {new Date(row.dueAt).toLocaleString('vi-VN', { timeZone: 'Asia/Bangkok' })}</p>}
        {row.reviews.length > 0 && <details><summary>Lịch sử ôn ({row.reviews.length} lượt gần nhất)</summary><ol>{row.reviews.slice().reverse().map((review, i) => <li key={i}>{new Date(review.at).toLocaleString('vi-VN', { timeZone: 'Asia/Bangkok' })} · {{ again: 'Chưa nhớ', hard: 'Nhớ khó', good: 'Nhớ được', easy: 'Nhớ dễ' }[review.rating]}</li>)}</ol></details>}
    </article>;
}
