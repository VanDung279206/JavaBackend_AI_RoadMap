export const projectFields = ['name', 'audience', 'problem', 'objective', 'feature1', 'feature2', 'feature3', 'difference', 'later', 'stories', 'data', 'rules', 'api', 'errors', 'java', 'sql', 'spring', 'quality', 'ai', 'rag', 'repository', 'tests', 'run', 'demo', 'decisions'] as const;
export type ProjectField = typeof projectFields[number];
export const PROJECT_FIELD_LIMIT = 50000;
// Inputs appear once; generated stories can repeat audience/objective three
// times and each of the three features once. Reserve room for template text.
export const PROJECT_OUTLINE_LIMIT = (projectFields.length + 9) * PROJECT_FIELD_LIMIT + 10000;
export const criteria = ['Thiết kế dữ liệu hợp lý', 'API rõ ràng', 'Xử lý lỗi', 'Kiểm thử', 'Quyền truy cập', 'Khả năng chạy lại'];
export type ProjectDraft = Record<ProjectField, string> & { ragMode: 'project' | 'lab'; outline: string; previousOutline: string; checklist: boolean[] };
export function emptyProject(): ProjectDraft {
    return { ...Object.fromEntries(projectFields.map(field => [field, ''])) as Record<ProjectField, string>, ragMode: 'lab', outline: '', previousOutline: '', checklist: criteria.map(() => false) };
}
export function parseProject(value: unknown): ProjectDraft {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Invalid project backup');
    const draft = value as ProjectDraft;
    for (const field of projectFields) if (typeof draft[field] !== 'string' || draft[field].length > PROJECT_FIELD_LIMIT) throw Error('Invalid project field');
    for (const field of ['outline', 'previousOutline'] as const) if (typeof draft[field] !== 'string' || draft[field].length > PROJECT_OUTLINE_LIMIT) throw Error('Invalid project outline');
    if (!['lab', 'project'].includes(draft.ragMode) || !Array.isArray(draft.checklist) || draft.checklist.length !== criteria.length || draft.checklist.some(item => typeof item !== 'boolean')) throw Error('Invalid project checklist');
    return { ...Object.fromEntries(projectFields.map(field => [field, draft[field]])) as Record<ProjectField, string>, ragMode: draft.ragMode, outline: draft.outline, previousOutline: draft.previousOutline, checklist: [...draft.checklist] };
}
export function scopeReady(draft: ProjectDraft) {
    return ['name', 'audience', 'problem', 'objective', 'feature1', 'feature2', 'feature3', 'difference', 'later'].every(field => draft[field as ProjectField].trim());
}
const text = (value: string) => value.trim() || '[Cần bổ sung]';
export function generateOutline(draft: ProjectDraft) {
    if (!scopeReady(draft)) throw Error('Define the problem and scope first');
    const features = [draft.feature1, draft.feature2, draft.feature3];
    const stories = draft.stories.trim() || features.map(feature => `- Là ${draft.audience.trim()}, tôi muốn ${feature.trim()} để ${draft.objective.trim()}.\n  Điều kiện chấp nhận: [đầu vào/đầu ra bình thường và một ca lỗi].`).join('\n');
    const milestones: [string, ProjectField, string][] = [
        ['Java', 'java', 'CLI cho một entity, validation, collections và save/load; nộp input/output và ca lỗi.'],
        ['HTTP & SQL', 'sql', 'Hợp đồng cho ba chức năng, schema/constraints, JOIN, transaction và dữ liệu sau restart.'],
        ['Spring Boot', 'spring', 'Controller/service/repository, DI, DTO, validation, paging và persistence; test request và rollback.'],
        ['Kiểm thử & vận hành', 'quality', 'Unit/integration, ma trận quyền với hai danh tính, config, Docker healthcheck và CI URL/commit.'],
        ['AI', 'ai', 'Chức năng phù hợp nhu cầu hoặc lab gateway; fake deterministic, prompt, validation, timeout/retry; ghi rõ fake/live.'],
        ['RAG', 'rag', draft.ragMode === 'lab' ? 'Lab riêng: dataset nhỏ, chunking, retrieval, citation; 5 câu hỏi gồm thiếu dữ liệu/ngoài quyền, đo recall và chất lượng câu trả lời riêng.' : 'Trong dự án: chunking, retrieval theo quyền, citation/version; bộ đánh giá gồm nguồn sai, thiếu dữ liệu và stale update.'],
    ];
    return `# ${draft.name.trim()}\n\n## Người dùng, vấn đề và mục tiêu\n\n- Người dùng: ${text(draft.audience)}\n- Vấn đề: ${text(draft.problem)}\n- Mục tiêu: ${text(draft.objective)}\n\n## Phạm vi\n\n${features.map((feature, index) => `${index + 1}. ${feature.trim()}`).join('\n')}\n\nĐiểm khác biệt: ${text(draft.difference)}\n\nĐể sau: ${text(draft.later)}\n\n## User stories và điều kiện chấp nhận\n\n${stories}\n\n## Thiết kế\n\n### Dữ liệu và liên kết\n\n${text(draft.data)}\n\n### Quy tắc nghiệp vụ và quyền\n\n${text(draft.rules)}\n\n### API: method/path, payload, status\n\n${text(draft.api)}\n\n### Tình huống lỗi\n\n${text(draft.errors)}\n\n## Mốc theo chặng\n\n${milestones.map(([name, field, fallback]) => `### ${name}\n\n${draft[field].trim() || fallback}\n\n- [ ] Chạy được và giải thích được\n- [ ] Lưu commit, lệnh chạy, expected/actual, ca lỗi và demo`).join('\n\n')}\n\nAI/RAG: ${draft.ragMode === 'lab' ? 'RAG bằng lab riêng; giải thích vì sao sản phẩm không cần hỏi đáp tài liệu.' : 'RAG gắn với nhu cầu dự án; ghi user story cần retrieval.'}\n\n## Bằng chứng\n\n- Repository/commit: ${text(draft.repository)}\n- Test và kết quả: ${text(draft.tests)}\n- Hướng dẫn chạy: ${text(draft.run)}\n- Demo: ${text(draft.demo)}\n- Quyết định thiết kế: ${text(draft.decisions)}\n\n## Checklist kỹ năng chung\n\n${criteria.map((criterion, index) => `- [${draft.checklist[index] ? 'x' : ' '}] ${criterion}: có bằng chứng và giải thích được`).join('\n')}\n\nChấm từng kỹ năng 0 (thiếu), 1 (có nhưng thiếu ca biên/bằng chứng), 2 (tái hiện và giải thích được). Đề cương/checklist tự ghi không cấp verified PASS.\n`;
}
export const projectIdeas = [
    { title: 'Mượn đồ trong cộng đồng', rule: 'Không đặt trùng thời gian; bàn giao và hoàn trả.', direction: 'Danh sách chờ, điều kiện bàn giao.' },
    { title: 'Tổ chức nhóm học', rule: 'Vai trò, lịch học và trạng thái tham gia.', direction: 'Ghép lịch phù hợp, hỏi đáp tài liệu.' },
    { title: 'Theo dõi chi tiêu', rule: 'Danh mục, ngân sách và giao dịch.', direction: 'Báo cáo theo mục tiêu cá nhân.' },
];
