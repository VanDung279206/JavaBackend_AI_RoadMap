"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DraftBackup from '@/components/DraftBackup';
import { useLearning } from '@/lib/learning-store';
import { useEnglishProgress } from '@/lib/useEnglishProgress';
import { english, englishLink, parseEnglishBackup } from '@/lib/english';
import { dueTerms, englishStats, nextEnglishUnit, englishUnitStatus, normalizeEnglishSearch, ENGLISH_BACKUP_MAX_BYTES, type EnglishProgress, type EnglishTerm } from '@/lib/english-core';
import { downloadText } from '@/lib/download';
import coding from '@/generated/catalogue.json';
import EnglishTermCard from './EnglishTermCard';
import EnglishPractice from './EnglishPractice';
import EnglishWriting from './EnglishWriting';
import EnglishReview from './EnglishReview';
import SpeakButton from './SpeakButton';
import EnglishGuide from './EnglishGuide';
import { useEnglishClock } from '@/lib/useEnglishClock';

const tabs = [['overview', 'Tổng quan'], ['vocabulary', 'Từ vựng'], ['reading', 'Đọc hiểu'], ['errors', 'Đọc thông báo lỗi'], ['writing', 'Viết và giải thích code'], ['review', 'Ôn tập']] as const;
type Section = typeof tabs[number][0];
const describe = (value: EnglishProgress) => { const stats = englishStats(value); return `${stats.seen} từ đã xem, ${stats.correct} câu đúng theo đáp án, ${stats.writing} bài viết đã tự đối chiếu. Không cấp verified PASS của bài lập trình.`; };

function LinkedReading({ text, terms }: { text: string; terms: EnglishTerm[] }) {
    const escaped = terms.map(t => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).sort((a, b) => b.length - a.length);
    if (!escaped.length) return <p lang="en" className="english-reading">{text}</p>;
    const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
    return <p lang="en" className="english-reading">{text.split(pattern).map((part, index) => {
        const term = terms.find(t => t.term.toLowerCase() === part.toLowerCase());
        return term ? <span className="english-inline-term" key={index}><button type="button" aria-label={`Tra nghĩa ${part}`} popoverTarget={`meaning-${term.id}-${index}`}>{part}</button><span popover="auto" id={`meaning-${term.id}-${index}`} lang="vi"><strong>{term.term}</strong><br /><span>{term.meaning}</span><br /><span>{term.translation}</span></span></span> : part;
    })}</p>;
}
export default function EnglishWorkspace() {
    const learning = useLearning();
    return <Workspace key={learning.owner === undefined ? 'loading' : learning.owner ?? 'guest'} />;
}
function Workspace() {
    const store = useEnglishProgress();
    const [phase, setPhase] = useState('01_Java'), [section, setSection] = useState<Section>('overview');
    const [reviewMode, setReviewMode] = useState<'due' | 'all'>('due');
    const [query, setQuery] = useState(''), [neededOnly, setNeededOnly] = useState(false), [page, setPage] = useState(0), [reviewPage, setReviewPage] = useState(0);
    useEffect(() => {
        function fromHash() {
            try {
                const [nextPhase, nextSection, termId] = decodeURIComponent(window.location.hash.slice(1)).split('/');
                if (nextPhase === 'all' || english.units.some(u => u.phase === nextPhase)) setPhase(nextPhase);
                if (tabs.some(([id]) => id === nextSection)) setSection(nextSection as Section);
                const term = english.terms.find(t => t.id === termId);
                setQuery(term?.term ?? ''); setPage(0); setReviewPage(0); setReviewMode('due');
            } catch { /* Keep a usable default when a pasted hash is malformed. */ }
        }
        function followLesson(event: MouseEvent) {
            if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            const anchor = (event.target as Element).closest('a');
            if (!anchor || anchor.target === '_blank') return;
            const url = new URL(anchor.href);
            if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.hash) {
                event.preventDefault(); window.location.hash = url.hash; fromHash();
            }
        }
        fromHash(); window.addEventListener('hashchange', fromHash); window.addEventListener('popstate', fromHash);
        document.addEventListener('click', followLesson, true);
        return () => { window.removeEventListener('hashchange', fromHash); window.removeEventListener('popstate', fromHash); document.removeEventListener('click', followLesson, true); };
    }, []);
    function choose(nextPhase: string, nextSection: Section) {
        setPhase(nextPhase); setSection(nextSection); setQuery(''); setPage(0); setReviewPage(0); setReviewMode('due');
        window.history.replaceState(null, '', `#${nextPhase}/${nextSection}`);
    }
    const progress = store.value, disabled = !store.ready || store.blocked;
    const now = useEnglishClock(), due = dueTerms(english, progress, now), stats = englishStats(progress);
    const next = nextEnglishUnit(english, progress, phase === 'all' ? undefined : phase);
    const nextStatus = englishUnitStatus(english, progress, next.phase);
    const inPhase = (item: { phase: string }) => phase === 'all' || item.phase === phase;
    const terms = english.terms.filter(inPhase);
    const phaseDue = due.filter(inPhase);
    const reviewTerms = reviewMode === 'all' ? terms : phaseDue;
    const currentReviewPage = Math.min(reviewPage, Math.max(0, Math.ceil(reviewTerms.length / 8) - 1));
    const visibleTerms = terms.filter(t => (!neededOnly || progress.terms[t.id]?.reviewNeeded) && normalizeEnglishSearch(`${t.term} ${t.meaning}`).includes(normalizeEnglishSearch(query)));
    const currentPage = Math.min(page, Math.max(0, Math.ceil(visibleTerms.length / 8) - 1));
    const unit = english.units.find(u => u.phase === phase);
    function exportBackup() {
        const backup = store.backup();
        if (backup !== null) downloadText('english-progress.json', backup, 'application/json');
    }
    return <>
        <p className="english-scope">Tiến độ tiếng Anh lưu trên thiết bị, riêng cho {store.owner ? 'tài khoản hiện tại' : 'khách'}. Dùng JSON để chuyển thiết bị. Kết quả chọn/điền/sắp câu chấm theo đáp án; bài tự viết và mức nhớ do bạn đối chiếu, không cấp verified PASS lập trình.</p>
        <p role="status" aria-live="polite">{store.error || (!store.ready ? 'Đang tải tiến độ tiếng Anh…' : store.saving ? 'Đang lưu… Chờ lưu xong để tải bản sao JSON.' : store.raw() === null ? 'Chưa có tiến độ đã lưu. Bắt đầu làm bài để lưu trên thiết bị.' : 'Đã lưu tiến độ tiếng Anh trên thiết bị.')}</p>
        <div className="english-toolbar"><label>Chủ đề<select value={phase} onChange={event => choose(event.target.value, section)}><option value="all">Tất cả chủ đề</option>{english.units.map(u => <option key={u.id} value={u.phase}>{u.title}</option>)}</select></label><button type="button" disabled={!store.ready || (store.saving && !store.blocked)} onClick={exportBackup}>Tải tiến độ tiếng Anh JSON</button></div>
        <nav className="course-steps english-tabs" aria-label="Các khu học tiếng Anh">{tabs.map(([id, label]) => <button type="button" key={id} aria-current={section === id ? 'page' : undefined} onClick={() => choose(phase, id)}>{label}</button>)}</nav>
        {unit && section !== 'overview' && <aside className="learning-card english-unit-intro"><h2>{unit.title}</h2><p><strong>Mục tiêu:</strong> {unit.objective}</p><p><strong>Chuẩn bị:</strong> {unit.prerequisite}</p><p>{unit.explanation}</p><p><strong>Áp dụng:</strong> {unit.application}</p><div className="learning-actions">{unit.exerciseIds.map(id => <Link key={id} href={`/docs/${coding.exercises.find(e => e.id === id)!.phase}#${id}`}>Mở bài {id}</Link>)}</div></aside>}
        {section === 'overview' && <>
            <div className="english-stats" aria-label="Tiến độ tiếng Anh"><p><strong>{stats.seen}/{english.terms.length}</strong>Từ đã xem</p><p><strong>{stats.recalled}</strong>Từ trả lời/nhớ được</p><p><strong>{stats.used}</strong>Từ tự dùng trong câu</p><p><strong>{stats.correct}/{english.exercises.length}</strong>Bài đúng theo đáp án</p></div>
            <section className="learning-card"><h2>Tiếp tục học trong 10–15 phút</h2><p>{store.ready ? `${due.length} từ đến hạn hoặc được chọn ôn ngay.` : 'Đang tải lịch ôn…'}</p><div className="learning-actions"><button type="button" disabled={disabled} onClick={() => due.length ? choose('all', 'review') : nextStatus.nextSection ? choose(next.phase, nextStatus.nextSection) : choose('all', 'review')}>{due.length ? 'Ôn từ đến hạn' : nextStatus.nextSection ? `Tiếp tục: ${next.title}` : 'Đã hoàn thành các chặng · Mở lịch ôn'}</button><button type="button" onClick={() => choose('all', 'review')}>Mở lịch ôn</button></div><p>Học từ → hiểu câu → hoàn thành câu → đọc đoạn → tự viết → giải thích code. Có thể bắt đầu ở bất kỳ chặng phù hợp với bài lập trình đang làm.</p></section>
            <div className="learning-grid">{english.units.map(u => <article className="learning-card" key={u.id}><h2>{u.title}</h2><p>{u.objective}</p><p>{u.prerequisite}</p><p>Nhiệm vụ chặng: {englishUnitStatus(english, progress, u.phase).completed}/{englishUnitStatus(english, progress, u.phase).total} (đáp án đúng, đã đọc và bài viết tự đối chiếu).</p><div className="learning-actions">{english.terms.some(t => t.phase === u.phase) && <Link href={englishLink(u.phase, 'vocabulary')}>Học từ</Link>}{english.readings.some(r => r.phase === u.phase) && <Link href={englishLink(u.phase, 'reading')}>Đọc và luyện câu</Link>}<Link href={englishLink(u.phase, 'writing')}>Tự giải thích code</Link></div></article>)}</div>
        </>}
        {section === 'vocabulary' && <>
            <div className="english-toolbar"><label>Tìm từ hoặc nghĩa<input value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} /></label><label><input type="checkbox" checked={neededOnly} onChange={event => { setNeededOnly(event.target.checked); setPage(0); }} />Chỉ từ trong danh sách cần ôn</label></div>
            <p>{visibleTerms.length} thuật ngữ. Phát âm dùng giọng có sẵn trên thiết bị; chưa bổ sung IPA khi chưa có nguồn kiểm chứng.</p>
            {visibleTerms.length === 0 && <p>Chưa có từ phù hợp bộ lọc. Chọn chủ đề khác hoặc bỏ bộ lọc cần ôn. Chủ đề cài đặt dùng các mẫu compile/run trong phần viết.</p>}
            <div className="learning-grid">{visibleTerms.slice(currentPage * 8, currentPage * 8 + 8).map(term => <EnglishTermCard key={term.id} term={term} progress={progress} save={store.save} disabled={disabled} />)}</div>
            {visibleTerms.length > 8 && <div className="learning-actions"><button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Trang trước</button><span>Trang {currentPage + 1}/{Math.ceil(visibleTerms.length / 8)}</span><button type="button" disabled={(currentPage + 1) * 8 >= visibleTerms.length} onClick={() => setPage(currentPage + 1)}>Trang sau</button></div>}
            <section className="learning-card"><h2>Cặp dễ nhầm và mẹo nhớ</h2><div className="english-table-scroll"><table><thead><tr><th>Cặp từ</th><th>Phân biệt</th><th>Mẹo nhớ</th><th>Câu dùng cả hai</th></tr></thead><tbody>{english.pairs.map(pair => <tr key={pair.pair}><td lang="en">{pair.pair}</td><td>{pair.difference}</td><td>{pair.mnemonic}</td><td lang="en">{pair.example}</td></tr>)}</tbody></table></div></section>
        </>}
        {section === 'reading' && <>
            <h2>Luyện câu trước khi đọc đoạn</h2>{english.exercises.filter(e => inPhase(e) && e.section === 'practice').map(exercise => <EnglishPractice key={exercise.id} exercise={exercise} progress={progress} save={store.save} disabled={disabled} />)}
            {english.readings.filter(inPhase).length === 0 && <p>Chủ đề này dùng từ vựng và bài viết. Chọn một trong sáu chặng chính để luyện đọc đoạn.</p>}
            {english.readings.filter(inPhase).map(reading => <article className="learning-card" key={reading.id}><h2>Bài đọc {reading.id}</h2><p>Đoạn do người soạn viết để luyện kỹ thuật. Đọc tiếng Anh, tra từ rồi tự trả lời trước khi mở bản dịch.</p><LinkedReading text={reading.text} terms={english.terms.filter(t => t.phase === reading.phase)} /><p><strong>Tự trả lời trước khi đối chiếu:</strong> {reading.questions} {reading.phase === '01_Java' && 'Output được mô tả thế nào?'}</p><SpeakButton text={reading.text} label="Nghe bài đọc" /><details><summary>Mở bản dịch khi cần đối chiếu</summary><p>{reading.translation}</p></details><label><input type="checkbox" disabled={disabled} checked={!!progress.readings[reading.id]?.readAt} onChange={event => {
                const readAt = event.target.checked ? new Date().toISOString() : null;
                void store.save(latest => ({ ...latest, readings: { ...latest.readings, [reading.id]: { readAt } } }));
            }} />Tôi đã đọc đoạn này</label>{english.exercises.filter(e => e.phase === reading.phase && e.section === 'reading').map(exercise => <EnglishPractice key={exercise.id} exercise={exercise} progress={progress} save={store.save} disabled={disabled} />)}</article>)}
        </>}
        {section === 'errors' && <><p>Tám log dưới đây đến từ fixture cố ý gây lỗi. Test fixture chỉ kiểm diagnostic, không xác nhận bạn đã sửa code đúng. Đọc loại lỗi → dòng code liên quan → nguyên nhân → bước sửa → chạy lại và ghi kết quả thực.</p>
            {english.errors.filter(inPhase).length === 0 && <p>Chưa có fixture cho chủ đề này. Chọn tất cả chủ đề để học đủ tám tình huống.</p>}
            {english.errors.filter(inPhase).map(error => <article className="learning-card" key={error.id}><h2>{error.id} · Đọc thông báo lỗi</h2><pre className="english-error-log" lang="en">{error.output}</pre>{english.exercises.filter(e => e.id === `ERROR-${error.id}` || e.id.startsWith(`ERROR-${error.id}-`)).map(exercise => <EnglishPractice key={exercise.id} exercise={exercise} progress={progress} save={store.save} disabled={disabled} />)}{progress.exercises[`ERROR-${error.id}`]?.checkedAt && <details><summary>Đối chiếu thông tin quan trọng và bước xử lý</summary><p>{error.meaning}</p><p>{error.diagnosis}</p><p>{error.question}</p></details>}<div className="learning-actions">{error.exerciseIds.map(id => <Link key={id} href={`/docs/${coding.exercises.find(e => e.id === id)!.phase}#${id}`}>Áp dụng vào {id}</Link>)}</div><EnglishWriting task={english.writers.find(w => w.id === `WRITE-${error.id}`)!} progress={progress} save={store.save} disabled={disabled} /></article>)}</>}
        {section === 'writing' && <>
            <section className="learning-card"><h2>Từ một câu đến giải thích code</h2><p>Bắt đầu với “The method returns …”. Thêm cách làm, lý do và “I checked …” với input/expected/actual. Sau đó viết commit đúng với thay đổi và 3–5 câu giải thích. Câu kỹ thuật nên dùng thuật ngữ nhất quán và tránh khẳng định mức bảo đảm chưa kiểm được.</p></section>
            {english.exercises.filter(e => inPhase(e) && e.section === 'writing').map(exercise => <EnglishPractice key={exercise.id} exercise={exercise} progress={progress} save={store.save} disabled={disabled} />)}
            {english.writers.filter(w => inPhase(w) && !english.errors.some(error => w.id === `WRITE-${error.id}`)).map(task => <article className="learning-card" key={task.id}><EnglishWriting task={task} progress={progress} save={store.save} disabled={disabled} /></article>)}
        </>}
        {section === 'review' && <>
            <h2>Ôn tập đến hạn</h2><p>Tự trả lời trước khi mở nghĩa. Chưa nhớ: ôn lại sau 10 phút; nhớ khó: tăng chậm; nhớ được/dễ: giãn lịch. Lịch này là gợi ý cá nhân theo mức nhớ tự chọn.</p>
            <div className="learning-actions"><button type="button" aria-pressed={reviewMode === 'due'} onClick={() => { setReviewMode('due'); setReviewPage(0); }}>Đến hạn ({phaseDue.length})</button><button type="button" aria-pressed={reviewMode === 'all'} onClick={() => { setReviewMode('all'); setReviewPage(0); }}>Luyện thêm tất cả từ</button></div>
            {reviewMode === 'due' && phaseDue.length === 0 && <p role="status">Đã hết từ đến hạn trong chủ đề này. Chọn “Luyện thêm tất cả từ” nếu muốn ôn ngoài lịch.</p>}
            {reviewMode === 'all' && <p>Luyện thêm ngoài lịch: chọn mức nhớ vẫn cập nhật ngày ôn tiếp theo. Mỗi flashcard chỉ ghi một mức nhớ trong lượt này.</p>}
            {reviewMode === 'all' && terms.length === 0 && <p>Chủ đề này chưa có flashcard. Chọn một chủ đề có từ vựng hoặc tất cả chủ đề.</p>}
            <div className="learning-grid">{reviewTerms.slice(currentReviewPage * 8, currentReviewPage * 8 + 8).map(term => <EnglishReview key={term.id} term={term} progress={progress} save={store.save} disabled={disabled} />)}</div>
            {reviewTerms.length > 8 && <div className="learning-actions"><button type="button" disabled={currentReviewPage === 0} onClick={() => setReviewPage(currentReviewPage - 1)}>Nhóm flashcard trước</button><span>Nhóm {currentReviewPage + 1}/{Math.ceil(reviewTerms.length / 8)}</span><button type="button" disabled={(currentReviewPage + 1) * 8 >= reviewTerms.length} onClick={() => setReviewPage(currentReviewPage + 1)}>Nhóm flashcard tiếp</button></div>}
        </>}
        {english.guides.filter(guide => guide.section === section).map(guide => <section className="learning-card" key={guide.id}><h2>{guide.title}</h2><EnglishGuide markdown={guide.markdown} /></section>)}
        <DraftBackup store={store} parse={parseEnglishBackup} describe={describe} maxBytes={ENGLISH_BACKUP_MAX_BYTES} policy="Áp dụng thay thế toàn bộ tiến độ tiếng Anh bằng bản đã chọn. Nếu bản hiện tại thay đổi từ lúc xem trước, nhập sẽ bị từ chối để giữ thay đổi mới." />
    </>;
}
