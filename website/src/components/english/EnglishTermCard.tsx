"use client";
import { useState } from 'react';
import { english } from '@/lib/english';
import { emptyTerm, type EnglishProgress, type EnglishTerm } from '@/lib/english-core';
import EnglishPractice, { type EnglishSave } from './EnglishPractice';
import SpeakButton from './SpeakButton';

export default function EnglishTermCard({ term, progress, save, disabled }: { term: EnglishTerm; progress: EnglishProgress; save: EnglishSave; disabled: boolean }) {
    const [revealed, setRevealed] = useState(false), row = progress.terms[term.id] ?? emptyTerm();
    function reveal() {
        setRevealed(true);
        const now = new Date().toISOString();
        void save(latest => ({ ...latest, terms: { ...latest.terms, [term.id]: { ...(latest.terms[term.id] ?? emptyTerm()), seenAt: latest.terms[term.id]?.seenAt ?? now } } }));
    }
    function confirmSentence() {
        const sentence = row.sentence, now = new Date().toISOString();
        void save(latest => {
            const previous = latest.terms[term.id] ?? emptyTerm();
            if (previous.sentence !== sentence || !sentence.trim()) throw Error('Sentence changed');
            return { ...latest, terms: { ...latest.terms, [term.id]: { ...previous, usedAt: now } } };
        });
    }
    return <article className="learning-card english-term" id={term.id}><h2 lang="en">{term.term}</h2><p>Đã xem: {row.seenAt ? 'có' : 'chưa'} · Trả lời/nhớ được: {row.recalledAt ? 'có' : 'chưa'} · Tự dùng trong câu: {row.usedAt ? 'có' : 'chưa'}</p>
        <button type="button" onClick={reveal}>Mở nghĩa và ví dụ</button>
        {revealed && <><p>{term.meaning}</p><p lang="en" className="english-example">{term.example}</p><p>{term.translation}</p><SpeakButton text={term.term} /><SpeakButton text={term.example} label="Nghe câu ví dụ" /></>}
        <label><input type="checkbox" disabled={disabled} checked={row.reviewNeeded} onChange={event => {
            const checked = event.target.checked, now = new Date().toISOString();
            void save(latest => ({ ...latest, terms: { ...latest.terms, [term.id]: { ...(latest.terms[term.id] ?? emptyTerm()), reviewNeeded: checked, dueAt: checked ? latest.terms[term.id]?.dueAt ?? now : latest.terms[term.id]?.dueAt ?? null } } }));
        }} />Thêm vào danh sách cần ôn</label>
        <EnglishPractice exercise={english.exercises.find(e => e.termId === term.id)!} progress={progress} save={save} disabled={disabled} />
        <EnglishPractice exercise={english.exercises.find(e => e.id === `FILL-${term.id}`)!} progress={progress} save={save} disabled={disabled} />
        <fieldset disabled={disabled}><label>Tự viết một câu sử dụng “{term.term}”<textarea lang="en" maxLength={2000} value={row.sentence} onChange={event => {
            const sentence = event.target.value;
            void save(latest => ({ ...latest, terms: { ...latest.terms, [term.id]: { ...(latest.terms[term.id] ?? emptyTerm()), sentence, usedAt: null } } }));
        }} /></label><button type="button" disabled={disabled || !row.sentence.trim()} onClick={confirmSentence}>Tôi đã đối chiếu câu với nghĩa của từ</button></fieldset>
        <small>Văn phong trung tính/kỹ thuật. Câu tự viết được bạn đối chiếu; không chấm tự động.</small>
    </article>;
}
