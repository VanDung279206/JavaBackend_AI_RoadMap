"use client";
import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useLearning } from '@/lib/learning-store';
import { localKey } from '@/lib/course-core';
import { useLocalDraft } from '@/lib/useLocalDraft';
import { criteria, emptyProject, generateOutline, parseProject, projectIdeas, scopeReady, type ProjectDraft, type ProjectField } from '@/lib/project-core';
import { downloadText } from '@/lib/download';

const empty = emptyProject();
const steps = ['Chọn vấn đề', 'Chốt phạm vi', 'Thiết kế', 'Chia mốc', 'Bằng chứng & đề cương'];
const fields: [ProjectField, string, string][][] = [
    [['name', 'Tên dự án', 'Ví dụ: Góc mượn đồ'], ['audience', 'Ứng dụng phục vụ ai?', 'Một nhóm người dùng cụ thể'], ['problem', 'Vấn đề cần giải quyết', 'Họ đang mất thời gian hoặc gặp khó khăn gì?'], ['objective', 'Mục tiêu và dấu hiệu thành công', 'Ứng dụng giúp họ làm việc gì?']],
    [['feature1', 'Chức năng chính 1', 'Một thao tác hoàn chỉnh'], ['feature2', 'Chức năng chính 2', 'Một thao tác hoàn chỉnh'], ['feature3', 'Chức năng chính 3', 'Một thao tác hoàn chỉnh'], ['difference', 'Một điểm khác biệt', 'Điểm bạn muốn tự thiết kế'], ['later', 'Những phần để sau', 'Giới hạn phạm vi phiên bản đầu']],
    [['stories', 'User stories và điều kiện chấp nhận', 'Là [vai trò], tôi muốn [thao tác] để [lợi ích]. Thêm ca đúng và ca lỗi. Để trống để tạo khung từ ba chức năng.'], ['data', 'Dữ liệu và liên kết', 'Entity, field, ID, quan hệ, version và vòng đời'], ['rules', 'Quy tắc nghiệp vụ và quyền', 'Invariant, vai trò/owner và ai được đọc/ghi'], ['api', 'API', 'Method/path, request/response, status, pagination'], ['errors', 'Tình huống lỗi', 'Dữ liệu sai, trùng, không tồn tại, vượt quyền, stale update, timeout']],
    [['java', 'Mốc Java', 'Một entity và một invariant trên CLI; validation, collections, save/load'], ['sql', 'Mốc HTTP & SQL', 'Hợp đồng, schema, constraints, JOIN, transaction'], ['spring', 'Mốc Spring Boot', 'Request qua các lớp, DI, DTO, validation, persistence'], ['quality', 'Mốc kiểm thử & vận hành', 'Test, quyền, config, Docker và CI'], ['ai', 'Mốc AI theo nhu cầu', 'Chức năng có ích hoặc lab gateway riêng; fake, output validation, timeout/retry'], ['rag', 'Mốc RAG', 'Gắn vào dự án hoặc dataset/lab riêng; nguồn, thiếu dữ liệu, đánh giá']],
    [['repository', 'Repository và commit', 'Đường dẫn đến bản tự triển khai'], ['tests', 'Test và kết quả thực', 'Lệnh, phiên bản, output, ca biên và lỗi'], ['run', 'Hướng dẫn chạy', 'Clone sạch, env mẫu, lệnh start/test'], ['demo', 'Demo', 'Luồng thành công và một luồng lỗi'], ['decisions', 'Giải thích quyết định thiết kế', 'Ít nhất ba lựa chọn, phương án khác và giới hạn']],
];
export default function ProjectPlanner() {
    const state = useLearning();
    return <Planner key={state.owner === undefined ? 'loading' : state.owner ?? 'guest'} />;
}
function Planner() {
    const state = useLearning();
    const store = useLocalDraft(state.owner === undefined ? null : localKey('project', state.owner), empty, parseProject);
    const [step, setStep] = useState(0), [message, setMessage] = useState('');
    const draft = store.value;
    function update(patch: Partial<ProjectDraft>) {
        const saved = store.save({ ...draft, ...patch });
        setMessage(saved ? 'Đã lưu trên thiết bị trong phạm vi tài khoản/khách này.' : 'Chưa lưu được thay đổi.');
    }
    function generate() {
        update({ outline: generateOutline(draft), previousOutline: draft.outline });
    }
    const locked = !store.ready || !!store.error;
    return <>
        <nav className="course-steps planner-steps" aria-label="Năm bước tạo dự án">{steps.map((label, index) => <button key={label} aria-current={step === index ? 'step' : undefined} onClick={() => setStep(index)}><span>{index + 1}</span>{label}</button>)}</nav>
        <p>Dữ liệu lưu trên thiết bị, tách tài khoản và khách, chưa đồng bộ máy chủ. Tải đề cương và bản JSON để giữ bản sao hoặc chuyển thiết bị.</p>
        <p role="status">{store.error || (!store.ready ? 'Đang tải bản lưu…' : message)}</p>
        {step === 0 && <div className="learning-grid">{projectIdeas.map(idea => <article className="learning-card" key={idea.title}><h2>{idea.title}</h2><p>Quy tắc: {idea.rule}</p><p>Sáng tạo: {idea.direction}</p><button disabled={locked} onClick={() => update({ name: idea.title })}>Dùng tên gợi mở</button></article>)}</div>}
        <section className="learning-card planner-form"><h2>{step + 1}. {steps[step]}</h2><p>{step === 3 ? 'Để trống mốc để đề cương dùng gợi ý theo kỹ năng; sửa lại theo sản phẩm của bạn.' : 'Điền theo nhu cầu của bạn. Có thể chuyển bước và sửa bất kỳ phần nào.'}</p>
            <fieldset disabled={locked}>{fields[step].map(([field, label, placeholder]) => <label key={field}>{label}<textarea value={draft[field]} placeholder={placeholder} maxLength={50000} onChange={event => update({ [field]: event.target.value })} /></label>)}
                {step === 3 && <label>RAG được thực hiện ở đâu?<select value={draft.ragMode} onChange={event => update({ ragMode: event.target.value as ProjectDraft['ragMode'] })}><option value="lab">Lab riêng, sản phẩm chưa cần hỏi đáp tài liệu</option><option value="project">Trong dự án, gắn với một user story cần tài liệu</option></select></label>}
                {step === 4 && <><h3>Checklist đánh giá theo kỹ năng</h3><p>Chỉ đánh dấu khi có bằng chứng; mẫu dữ liệu hoặc đề cương được tạo chưa chứng minh kỹ năng.</p>{criteria.map((criterion, index) => <label key={criterion}><input type="checkbox" checked={draft.checklist[index]} onChange={event => update({ checklist: draft.checklist.map((value, i) => i === index ? event.target.checked : value) })} />{criterion}</label>)}</>}
            </fieldset>
            <div className="learning-actions">{step > 0 && <button onClick={() => setStep(step - 1)}>Bước trước</button>}{step < 4 && <button onClick={() => setStep(step + 1)}>Bước tiếp theo →</button>}<Link href="/projects">Tham khảo dự án mẫu</Link></div>
        </section>
        {step === 4 && <section className="learning-card"><h2>Đề cương có thể chỉnh sửa</h2><p>Điền tên, người dùng, vấn đề, mục tiêu, ba chức năng, điểm khác biệt và phần để sau để tạo khung. Phần chưa thiết kế được ghi “Cần bổ sung”; không tự đánh dấu hoàn thành.</p><button disabled={locked || !scopeReady(draft)} onClick={generate}>{draft.outline ? 'Tạo lại từ thông tin hiện tại' : 'Tạo đề cương'}</button>{draft.previousOutline && <button disabled={locked} onClick={() => update({ outline: draft.previousOutline, previousOutline: draft.outline })}>Khôi phục đề cương trước khi tạo lại</button>}
            <label>Chỉnh đề cương Markdown<textarea className="project-outline" disabled={locked} value={draft.outline} maxLength={50000} onChange={event => update({ outline: event.target.value })} /></label>
            <div className="learning-actions"><button disabled={!draft.outline.trim()} onClick={() => downloadText('my-project.md', draft.outline)}>Tải đề cương Markdown</button><button disabled={!store.ready} onClick={() => downloadText('my-project-backup.json', store.raw() ?? JSON.stringify(draft), 'application/json')}>Tải bản lưu JSON</button></div>
            {draft.outline && <details><summary>Xem trước đề cương</summary><div className="prose exercise-prose"><ReactMarkdown>{draft.outline}</ReactMarkdown></div></details>}
            <p>Chỉnh Markdown là sửa bản đề cương độc lập. Tạo lại sẽ dùng thông tin ở năm bước; bạn có thể khôi phục bản trước. Checklist trong Markdown cập nhật khi tạo lại, không tự đồng bộ từ sửa văn bản.</p>
        </section>}
    </>;
}
