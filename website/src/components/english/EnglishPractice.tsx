"use client";
import { useId } from 'react';
import { emptyExercise, gradeExercise, orderedIndices, emptyTerm, type EnglishExercise, type EnglishProgress } from '@/lib/english-core';

export type EnglishSave = (change: (latest: EnglishProgress) => EnglishProgress) => Promise<boolean>;
export default function EnglishPractice({ exercise, progress, save, disabled }: { exercise: EnglishExercise; progress: EnglishProgress; save: EnglishSave; disabled: boolean }) {
    const row = progress.exercises[exercise.id] ?? emptyExercise(), labelId = useId();
    const indices = orderedIndices(row.answer, exercise.tokens?.length ?? 0);
    function edit(answer: string) {
        void save(latest => ({ ...latest, exercises: { ...latest.exercises, [exercise.id]: { ...(latest.exercises[exercise.id] ?? emptyExercise()), answer, correct: null, checkedAt: null, checkedAnswer: null } } }));
    }
    function check() {
        const answer = row.answer, now = new Date().toISOString();
        void save(latest => {
            const previous = latest.exercises[exercise.id] ?? emptyExercise();
            if (previous.answer !== answer) throw Error('Answer changed before checking');
            const correct = gradeExercise(exercise, answer);
            const next = { ...latest, exercises: { ...latest.exercises, [exercise.id]: { ...previous, checkedAnswer: answer, correct, checkedAt: now, attempts: previous.attempts + 1 } } };
            if (correct && exercise.termId) next.terms = { ...latest.terms, [exercise.termId]: { ...(latest.terms[exercise.termId] ?? emptyTerm()), recalledAt: now } };
            return next;
        });
    }
    return <section className="english-practice" aria-labelledby={labelId}>
        <p className="eyebrow">{exercise.level} · {exercise.id}</p><h3 id={labelId}>{exercise.prompt}</h3>
        <fieldset disabled={disabled}>
            {exercise.kind === 'choice' ? <div className="english-choices">{exercise.options!.map(option => <label key={option.id}><input type="radio" name={labelId} value={option.id} checked={row.answer === option.id} onChange={() => edit(option.id)} />{option.label}</label>)}</div> : exercise.kind === 'reorder' ? <>
                <p lang="en" className="english-order" aria-label="Câu đã sắp xếp">{indices.map(i => exercise.tokens![i]).join(' ') || '…'}</p>
                <div className="learning-actions">{exercise.tokens!.map((token, index) => <button type="button" key={index} disabled={disabled || indices.includes(index)} onClick={() => edit(JSON.stringify([...indices, index]))}>{token}</button>)}</div>
                <button type="button" disabled={disabled || indices.length === 0} onClick={() => edit(JSON.stringify(indices.slice(0, -1)))}>Bỏ từ cuối</button>
            </> : <label>Câu trả lời{exercise.kind === 'correct' ? <textarea lang="en" maxLength={5000} value={row.answer} onChange={event => edit(event.target.value)} /> : <input lang="en" maxLength={5000} value={row.answer} onChange={event => edit(event.target.value)} />}</label>}
            <button type="button" disabled={disabled || !row.answer.trim() || (exercise.kind === 'reorder' && indices.length !== exercise.tokens!.length)} onClick={check}>Kiểm tra câu trả lời</button>
        </fieldset>
        {row.checkedAt && <div className={row.correct ? 'english-feedback correct' : 'english-feedback retry'} role="status"><strong>{row.correct ? 'Đúng theo đáp án của bài.' : exercise.kind === 'correct' ? 'Chưa khớp những cách sửa được bài này hỗ trợ. Câu khác có thể cần tự đối chiếu thêm.' : 'Chưa đúng. Đọc giải thích rồi thử lại.'}</strong><p>{exercise.explanation}</p><details><summary>Xem đáp án sau khi làm</summary><p lang="en">{exercise.kind === 'choice' ? exercise.options!.filter(o => exercise.answers.includes(o.id)).map(o => o.label).join(' / ') : exercise.answers.join(' / ')}</p></details><small>{row.attempts} lần kiểm tra · Chấm theo đáp án cố định, không cấp verified PASS của bài lập trình.</small></div>}
    </section>;
}
