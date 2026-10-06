"use client";
import ReviewImport from '@/components/ReviewImport';
import Link from 'next/link';
import { useState } from 'react';
import catalogue from '@/generated/catalogue.json';
import { useLearning, updateEntry } from '@/lib/learning-store';
import { recommend, bangkokDate } from '@/lib/progress-core';
import { lessonRecommendations } from '@/lib/course-core';
export default function Today() {
    const state = useLearning(), [filter, setFilter] = useState('');
    const date = bangkokDate(new Date());
    const choices = recommend(catalogue.exercises, state.entries, date).slice(0, 8);
    const lessons = lessonRecommendations(catalogue.lessons, state.entries).slice(0, 4);
    return <main className="page-shell">
        <header className="page-heading"><h1>Hôm nay học gì?</h1><p>Ưu tiên bài đang sai, đến hạn, đang làm, rồi bài mới đủ kiến thức tiên quyết theo tiến độ tự khai báo.</p><div className="learning-actions"><Link href="/skills">Bản đồ & kiểm tra đầu vào</Link><Link href="/lab">Bàn thử nghiệm RAG</Link><Link href="/learn/01_Java">Học chặng Java</Link><Link href="/projects/mine">Dự án của tôi</Link></div></header>
        <ReviewImport /><p role="status">{state.loading ? 'Đang tải tiến độ…' : state.message}</p>
        {!state.loading && lessons.length > 0 && <section className="learning-card"><h2>Xem lại bài học theo lỗi</h2><p>Gợi ý theo bài cần ôn và tag lỗi đang mắc.</p><div className="learning-actions">{lessons.map(item => <Link key={item.id} href={`/learn/${item.phase}#${item.id}`}>{catalogue.lessons.find(lesson => lesson.id === item.id)!.title} · {item.exerciseIds.join(', ')}</Link>)}</div></section>}
        <div className="learning-grid">{!state.loading && choices.map(choice => {
            const exercise = catalogue.exercises.find(item => item.id === choice.id)!;
            return <article className="learning-card" key={exercise.id}><h2><Link href={`/docs/${exercise.phase}#${exercise.id}`}>{exercise.id} — {exercise.title}</Link></h2><p>{choice.reason}</p><p>Tag: {exercise.tags.join(', ')}</p><button onClick={() => updateEntry(exercise.id, { status: 'in_progress' })}>Bắt đầu</button><label>Hẹn ôn<input type="date" value={state.entries[exercise.id]?.due_at ? bangkokDate(state.entries[exercise.id].due_at!) : ''} onChange={event => updateEntry(exercise.id, { due_at: event.target.value ? event.target.value + 'T00:00:00+07:00' : null })} /></label></article>;
        })}</div>
        <h2>{catalogue.sessions.length} buổi học</h2><p>Mỗi mốc có thể chia thành nhiều phiên, nhất là các bài nền tảng Java; hoàn thành kỹ năng trước khi chuyển chặng.</p><label>Lọc buổi học<input value={filter} onChange={event => setFilter(event.target.value)} /></label>
        {catalogue.sessions.filter(session => `${session.id} ${session.title}`.toLowerCase().includes(filter.toLowerCase())).map(session => <details className="learning-card" key={session.id}><summary>{session.id} — {session.title}</summary><p>{session.required}</p><p>Bằng chứng: {session.evidence}</p><p>Mở rộng: {session.extension}</p><div className="learning-actions">{session.lesson_ids.map(id => { const lesson = catalogue.lessons.find(item => item.id === id)!; return <Link key={id} href={`/learn/${lesson.phase}#${id}`}>Học {lesson.title}</Link>; })}{session.exercise_ids.map(id => { const exercise = catalogue.exercises.find(item => item.id === id)!; return <Link key={id} href={`/docs/${exercise.phase}#${id}`}>{id}</Link>; })}</div></details>)}
    </main>;
}
