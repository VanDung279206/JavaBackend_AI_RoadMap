"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import CourseMarkdown from './CourseMarkdown';
import catalogue from '@/generated/catalogue.json';
import { useLearning } from '@/lib/learning-store';
import { emptyLesson, lessonRecommendations, localKey, parseLessons, prerequisitesMet, type LessonProgress } from '@/lib/course-core';
import { useLocalDraft } from '@/lib/useLocalDraft';
import { downloadText } from '@/lib/download';
import DraftBackup from './DraftBackup';
import { englishLink } from '@/lib/english';

const steps = ['Bài học', 'Luyện tập', 'Áp dụng vào dự án', 'Kiểm tra cuối chặng'];
const empty: LessonProgress = {};
const parse = (input: unknown) => parseLessons(input, catalogue.lessons.map(item => item.id));
const mergeBackup = (latest: LessonProgress, imported: LessonProgress) => ({ ...latest, ...imported });
const describeBackup = (value: LessonProgress) => `${Object.keys(value).length} bài: ${Object.keys(value).join(', ') || 'không có bài'}. Bằng chứng là tự đối chiếu, không cấp PASS từ worker.`;
export default function PhaseLearning({ phase }: { phase: string }) {
    const state = useLearning();
    return <Workspace key={`${state.owner}:${phase}`} phase={phase} />;
}
function Workspace({ phase }: { phase: string }) {
    const state = useLearning();
    const store = useLocalDraft(state.owner === undefined ? null : localKey('lessons', state.owner), empty, parse);
    const course = catalogue.courses.find(item => item.phase === phase)!;
    const lessons = useMemo(() => catalogue.lessons.filter(item => course.lesson_ids.includes(item.id)), [course.lesson_ids]);
    const exercises = catalogue.exercises.filter(item => item.phase === phase);
    const [step, setStep] = useState(0), [selected, setSelected] = useState(lessons[0].id), [level, setLevel] = useState('all');
    useEffect(() => {
        function selectHash() {
            const hash = decodeURIComponent(window.location.hash.slice(1));
            if (lessons.some(item => item.id === hash)) { setSelected(hash); setStep(0); }
        }
        selectHash(); window.addEventListener('hashchange', selectHash);
        return () => window.removeEventListener('hashchange', selectHash);
    }, [lessons]);
    const lesson = lessons.find(item => item.id === selected)!;
    const progress = store.value[lesson.id] ?? emptyLesson();
    const recommendations = lessonRecommendations(lessons, state.entries).slice(0, 3);
    const practiced = lesson.exercise_ids.filter(id => state.entries[id]?.status === 'self_completed');
    const verified = lesson.exercise_ids.filter(id => state.verified.includes(id));
    function choose(id: string) { setSelected(id); window.history.replaceState(null, '', `#${id}`); }
    function patch(value: Partial<typeof progress>) {
        const id = lesson.id;
        void store.save(latest => {
            const next = latest[id] ?? emptyLesson();
            if (value.checkedAt && next.evidence !== progress.evidence) throw Error('Evidence changed before confirmation');
            return { ...latest, [id]: { ...next, ...value } };
        });
    }
    function exportBackup() {
        const backup = store.backup();
        if (backup !== null) downloadText('lesson-progress.json', backup, 'application/json');
    }
    const filtered = exercises.filter(item => level === 'all' || (level === 'pilot' ? item.track === 'java-pilot' : ('kind' in item && item.kind === level)));
    return <>
        <nav className="course-steps" aria-label="Bốn phần học chặng">{steps.map((label, index) => <button type="button" key={label} aria-current={step === index ? 'step' : undefined} onClick={() => setStep(index)}><span>{index + 1}</span>{label}</button>)}</nav>
        <div className="learning-actions"><Link href={`/docs/${phase}`}>Tất cả bài tập & tiến độ</Link><Link href="/today">Lịch học và ôn lỗi</Link><Link href="/projects/mine">Dự án của tôi</Link></div>
        <aside className="learning-card"><h2>Tiếng Anh của chặng này</h2><p>Học thuật ngữ, đọc hợp đồng và viết vài câu về bài bạn đang làm.</p><div className="learning-actions"><Link href={englishLink(phase, 'vocabulary')}>Từ vựng</Link><Link href={englishLink(phase, 'reading')}>Đọc và luyện câu</Link><Link href={englishLink(phase, 'writing')}>Viết và giải thích code</Link></div></aside>
        {step === 0 && <>
            {recommendations.length > 0 && <aside className="learning-card"><h2>Bài học nên xem lại</h2><p>Dựa trên bài cần ôn và tag lỗi đang mắc.</p>{recommendations.map(item => <button key={item.id} onClick={() => choose(item.id)}>{item.id} · lỗi liên quan {item.exerciseIds.join(', ')}</button>)}</aside>}
            <div className="course-layout"><aside className="course-index"><h2>Bài học nhỏ</h2><ol>{lessons.map(item => <li key={item.id}><button aria-current={selected === item.id ? 'page' : undefined} onClick={() => choose(item.id)}>{item.title}<small>{store.value[item.id]?.read ? 'Đã đọc' : 'Chưa đọc'}</small></button></li>)}</ol></aside>
                <article className="learning-card course-lesson"><CourseMarkdown>{lesson.markdown}</CourseMarkdown>
                    <details key={lesson.id}><summary>Đối chiếu câu trả lời hiểu bài</summary><p>{lesson.answer}</p></details>
                    <div className="lesson-progress"><h2>Đọc → làm → kiểm chứng</h2><p>Đã đọc: {progress.read ? 'có' : 'chưa'} · Đã làm bài: {practiced.length}/{lesson.exercise_ids.length} · Đạt test từ worker: {verified.length}/{lesson.exercise_ids.length}</p>
                        <label><input type="checkbox" checked={progress.read} disabled={!store.ready || store.blocked} onChange={event => patch({ read: event.target.checked })} />Đánh dấu đã đọc</label>
                        <p>Đã đọc và bằng chứng bên dưới lưu trên thiết bị theo tài khoản/khách, chưa đồng bộ máy chủ. Bài đã làm dùng tiến độ hiện có. Tự đối chiếu không cấp verified PASS hoặc điểm xếp hạng.</p>
                        <label>Lệnh chạy, input, expected/actual và giải thích kết quả<textarea maxLength={20000} disabled={!store.ready || store.blocked} value={progress.evidence} onChange={event => patch({ evidence: event.target.value, checkedAt: null })} /></label>
                        <button disabled={!store.ready || store.blocked || !progress.evidence.trim()} onClick={() => patch({ checkedAt: new Date().toISOString() })}>Xác nhận đã kiểm chứng kết quả trên máy</button>
                        {progress.checkedAt && <p>Đã kiểm chứng (tự đối chiếu): {new Date(progress.checkedAt).toLocaleString('vi-VN', { timeZone: 'Asia/Bangkok' })}</p>}
                        <p role="status">{store.error || (!store.ready ? 'Đang tải…' : store.saving ? 'Đang lưu… Chờ lưu xong để tải bản sao JSON.' : 'Đã lưu trên thiết bị.')}</p>
                        <div className="learning-actions"><button disabled={!store.ready || (store.saving && !store.blocked)} onClick={exportBackup}>Tải bản lưu bài học</button>{lesson.exercise_ids.map(id => <Link key={id} href={`/docs/${catalogue.exercises.find(item => item.id === id)!.phase}#${id}`}>Làm {id}</Link>)}</div>
                    </div>
                    <div className="learning-actions"><button onClick={() => { const next = lessons[lessons.findIndex(item => item.id === selected) + 1]; if (next) choose(next.id); else setStep(1); }}>{selected === lessons[lessons.length - 1].id ? 'Chuyển sang luyện tập' : 'Bài học tiếp theo'}</button></div>
                </article></div>
        </>}
        {step === 1 && <section><h2>Luyện tập từ đọc hiểu đến thử thách</h2><p>{phase === '01_Java' ? 'Thí điểm 20 bài: 6 đọc hiểu/có hướng dẫn, 6 tự triển khai, 4 kết hợp, 2 debug và 2 thử thách. Nhánh nâng cao mở khi tự xác nhận đủ bài tiên quyết.' : 'Dùng bộ bài hiện có; đọc bài học nền trước khi tăng độ khó.'}</p>
            {phase === '01_Java' && <label>Lọc bài<select value={level} onChange={event => setLevel(event.target.value)}>{[['all', 'Tất cả'], ['pilot', '20 bài thí điểm'], ['read', '1. Đọc hiểu'], ['guided', '2. Có hướng dẫn'], ['implement', '3. Tự triển khai'], ['combine', '4. Kết hợp'], ['debug', 'Debug'], ['challenge', '5. Thử thách']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
            <div className="learning-grid">{filtered.map(item => { const challenge = 'kind' in item && item.kind === 'challenge'; const ready = prerequisitesMet(item.prerequisites, state.entries); return <article className="learning-card" key={item.id}><h3>{item.id} — {item.title}</h3>{'level' in item && <p>{item.level} · {item.required ? 'Bắt buộc' : 'Mở rộng'}</p>}{'skill' in item && <p>Kỹ năng: {item.skill}</p>}<p>Tiên quyết: {item.prerequisites.join(', ') || 'không'}</p>{challenge && !ready ? <p>Nhánh mở rộng chưa mở: hoàn thành bài tiên quyết trong tiến độ.</p> : <Link href={`/docs/${phase}#${item.id}`}>Mở đề, gợi ý và kiểm tra →</Link>}</article>; })}</div>
        </section>}
        {step === 2 && <section className="learning-card"><CourseMarkdown>{course.applicationMarkdown}</CourseMarkdown><div className="learning-actions"><Link href="/projects">Xem dự án mẫu</Link><Link className="button-primary" href="/projects/mine">Tạo hoặc sửa đề cương của tôi →</Link></div></section>}
        {step === 3 && <section className="learning-card"><h2>Kiểm tra cuối chặng</h2><p>Làm với dữ liệu mới, lưu bài nộp và bằng chứng trước khi mở đối chiếu. Có thể làm đề mẫu như lab hoặc chuyển entity sang dự án riêng, giữ nguyên kỹ năng và ca lỗi cần kiểm. Tự chấm không cấp verified PASS.</p><CourseMarkdown>{course.examMarkdown}</CourseMarkdown><details><summary>Mở hướng dẫn chấm sau khi tự làm</summary><CourseMarkdown>{course.examSolution}</CourseMarkdown></details></section>}
        <DraftBackup store={store} parse={parse} describe={describeBackup} merge={mergeBackup} maxBytes={4 * 1024 * 1024} policy="Các bài có trong file sẽ thay thế bản lưu của các bài đó; các bài khác được giữ nguyên. Tiến độ bài tập và verified từ worker không thay đổi." />
    </>;
}
