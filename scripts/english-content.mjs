// Markdown remains the source for the existing glossary, readings and error logs.
const cells = line => line.split('|').slice(1, -1).map(value => value.trim().replace(/^`|`$/g, '').replace(/^“|”$/g, ''));
const rows = source => source.split('\n').filter(line => line.startsWith('| ') && !line.startsWith('| ---')).map(cells);
export function compileEnglish(read, learning) {
    const curriculum = JSON.parse(read('english/curriculum.json'));
    if (curriculum.version !== 1) throw Error('Unknown English curriculum version');
    const units = curriculum.units;
    const phaseByNumber = Object.fromEntries(units.filter(u => u.number).map(u => [u.number, u.phase]));
    const glossary = read('english/GLOSSARY.md');
    const terms = [];
    for (const section of glossary.split(/(?=^## )/m)) {
        const match = /^## Phase (\d+)/.exec(section);
        const phase = match ? phaseByNumber[match[1]] : section.startsWith('## DSA') ? 'dsa' : null;
        if (!phase) continue;
        for (const [term, meaning, example, translation] of rows(section).slice(1)) {
            const id = curriculum.termIds?.[`${phase}:${term}`];
            if (!id) throw Error(`Register a stable term ID: ${phase}:${term}`);
            terms.push({ id, phase, term, meaning, example, translation, level: 'Nhận diện từ', source: 'english/GLOSSARY.md' });
        }
    }
    const readings = read('english/READING_PRACTICE.md').split(/(?=^## Phase )/m).slice(1).map(section => {
        const number = /^## Phase (\d+)/.exec(section)?.[1];
        const text = /^“(.+)”$/m.exec(section)?.[1];
        const translation = /<details><summary>[^\n]+<\/summary>\n\n([\s\S]+?)\n\n<\/details>/.exec(section)?.[1];
        return { id: `READ-${number}`, phase: phaseByNumber[number], text, translation, questions: /^Câu hỏi: (.+)$/m.exec(section)?.[1], source: 'english/READING_PRACTICE.md' };
    });
    const coding = read('english/CODING_TASKS.md');
    const writers = rows(coding.split('## Sửa')[0]).slice(1).map(([number, task, commit, model]) => ({ id: `WRITE-${number}`, phase: phaseByNumber[number] || '00_setup', task, commit, model, source: 'english/CODING_TASKS.md' }));
    writers.push({ id: 'WRITE-DSA', phase: 'dsa', task: 'Giải thích một thuật toán bạn đã thực hiện: đầu ra, cấu trúc dữ liệu, invariant, độ phức tạp và ca biên đã chạy.', commit: 'test: cover an empty input', model: 'The function returns … . I keep … in a … . The invariant is … . The time complexity is … because … . I checked … .', source: 'english/CODING_TASKS.md' });
    const corrections = rows(coding.split('## Sửa những câu dễ viết sai')[1].split('## Cặp từ')[0]).slice(1);
    const exercises = [...curriculum.exercises];
    corrections.forEach(([bad, good, explanation], index) => {
        exercises.push({ id: `FIX-${index + 1}`, phase: curriculum.correctionPhases[index], section: 'writing', kind: 'correct', level: 'Sửa câu', prompt: `Sửa câu: ${bad}`, answers: good.split(' / ').map(value => value.replace(/^`|`$/g, '')), explanation, source: 'english/CODING_TASKS.md' });
    });
    for (const [index, term] of terms.entries()) {
        const pool = terms.filter(other => other.phase === term.phase && other.id !== term.id);
        const options = [term, ...pool.slice(index % pool.length, index % pool.length + 3)];
        for (const other of pool) if (options.length < 4 && !options.includes(other)) options.push(other);
        const rotate = index % 4;
        const ordered = [...options.slice(rotate), ...options.slice(0, rotate)];
        exercises.push({ id: `VOC-${term.id}`, phase: term.phase, section: 'vocabulary', kind: 'choice', termId: term.id, level: 'Nhận diện từ', prompt: `“${term.term}” có nghĩa gì trong ngữ cảnh lập trình?`, options: ordered.map(item => ({ id: item.id, label: item.meaning })), answers: [term.id], explanation: `${term.example} — ${term.translation}`, source: term.source });
        const pattern = new RegExp(`\\b${term.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        const prompt = pattern.test(term.example) ? `Điền từ/cụm từ: ${term.example.replace(pattern, '____')} Gợi ý: ${term.meaning}.` : `Điền thuật ngữ tương ứng với nghĩa: ${term.meaning}. Câu gợi ý: ${term.example}`;
        exercises.push({ id: `FILL-${term.id}`, phase: term.phase, section: 'vocabulary', kind: 'fill', level: 'Dùng từ trong câu', prompt, answers: [term.term], explanation: `${term.term}: ${term.example} — ${term.translation}`, source: term.source });
    }
    const clinic = read('english/ERROR_CLINIC.md');
    const observed = JSON.parse(read('english/observed-errors.json'));
    const errors = clinic.split(/(?=^## E\d\d)/m).slice(1).map(section => {
        const id = /^## (E\d\d)/.exec(section)?.[1];
        const values = Object.fromEntries(rows(section).slice(1));
        const log = observed.find(item => item.id === id);
        const meta = curriculum.errors.find(item => item.id === id);
        if (!log || !meta) throw Error(`Missing error fixture ${id}`);
        const diagnosticType = meta.type?.replace('compiler error: ', '');
        if (!diagnosticType || !log.output.includes(diagnosticType) || !meta.detail || !log.output.includes(meta.detail)) throw Error(`Error question contradicts observed log ${id}`);
        for (const [suffix, prompt, right, wrong, explanation] of [
            ['TYPE', 'Xác định loại lỗi trong log.', meta.type, ['Một lỗi HTTP 401', 'Một lỗi vi phạm foreign key'], `Loại lỗi được ghi trong diagnostic: ${meta.type}.`],
            ['DETAIL', `Thông tin “${meta.detail}” cho biết gì?`, meta.detailMeaning, ['Tất cả các test đã chạy thành công', 'Đây là kết quả đúng sau khi sửa bài của bạn'], `Thông tin cần chú ý: ${meta.detail}. ${meta.detailMeaning}.`],
            ['CAUSE', 'Nguyên nhân trong fixture này là gì?', meta.cause, ['Chỉ cần bỏ mọi validation để sửa lỗi', 'Mọi lỗi đều do mạng và có thể retry vô hạn'], meta.cause],
        ]) {
            const options = [{ id: 'right', label: right }, ...wrong.map((label, index) => ({ id: `other-${index}`, label }))];
            const shift = (Number(id.slice(1)) + suffix.length) % options.length;
            exercises.push({ id: `ERROR-${id}-${suffix}`, phase: meta.phase, section: 'error', kind: 'choice', level: 'Đọc lỗi từng bước', prompt, options: [...options.slice(shift), ...options.slice(0, shift)], answers: ['right'], explanation, source: 'english/curriculum.json' });
        }
        exercises.push({ id: `ERROR-${id}`, phase: meta.phase, section: 'error', kind: 'choice', level: 'Đọc lỗi', prompt: meta.question, options: meta.options, answers: [meta.answer], explanation: values['Chẩn đoán và cách xử lý'], source: 'english/ERROR_CLINIC.md' });
        writers.push({ id: `WRITE-${id}`, phase: meta.phase, task: `Viết 1–3 câu về ${id}: nguyên nhân, bước sửa và kết quả bạn thực sự đã kiểm. ${values['Tự giải thích']}`, commit: '', model: values['Mô tả bằng tiếng Anh'], source: 'english/ERROR_CLINIC.md' });
        return { id, phase: meta.phase, output: log.output, meaning: values['Nghĩa trong fixture'], diagnosis: values['Chẩn đoán và cách xử lý'], model: values['Mô tả bằng tiếng Anh'], question: values['Tự giải thích'], exerciseIds: values['Bài liên quan'].split(',').map(s => s.trim()), source: 'english/ERROR_CLINIC.md' };
    });
    const glossaryPairs = rows(glossary.split('## Các cặp dễ nhầm')[1]).slice(1).map(([pair, difference, mnemonic]) => ({ pair, difference, mnemonic, example: curriculum.pairExamples[pair], source: 'english/GLOSSARY.md' }));
    const codingPairs = rows(coding.split('## Cặp từ, mẹo nhớ và một câu chứa cả hai')[1].split('## Mẫu dùng')[0]).slice(1).map(([pair, difference, mnemonic, example]) => ({ pair, difference, mnemonic, example, source: 'english/CODING_TASKS.md' }));
    const guides = [
        { id: 'sentence-patterns', section: 'reading', title: 'Cấu trúc câu nên nhận diện', markdown: read('english/READING_PRACTICE.md').split('## Cấu trúc câu nên nhận diện')[1].trim(), source: 'english/READING_PRACTICE.md' },
        { id: 'debug-report', section: 'errors', title: 'Từ thường gặp và mẫu báo lỗi có bằng chứng', markdown: clinic.split('## Phân biệt các từ thường gặp')[1].trim(), source: 'english/ERROR_CLINIC.md' },
        { id: 'dsa-writing', section: 'writing', title: 'Mẫu giải thích DSA', markdown: coding.split('## Mẫu dùng với mọi DSA')[1].trim(), source: 'english/CODING_TASKS.md' },
        { id: 'term-context', section: 'vocabulary', title: 'Ngữ cảnh và nguồn thuật ngữ', markdown: glossary.slice(glossary.indexOf('Ví dụ dùng cặp:')).trim(), source: 'english/GLOSSARY.md' },
    ];
    const result = { version: 1, units, terms, readings, errors, writers, exercises, guides, pairs: [...glossaryPairs, ...codingPairs] };
    validateEnglish(result, learning);
    return result;
}
export function validateEnglish(data, learning) {
    const phases = new Set(learning.phases.map(p => p.slug));
    const learningIds = new Set(Object.keys(learning.exercises));
    if (data.version !== 1 || new Set(data.units.map(u => u.phase)).size !== data.units.length) throw Error('Invalid English units/version');
    const unitPhases = new Set(data.units.map(u => u.phase));
    for (const group of ['units', 'terms', 'readings', 'errors', 'writers', 'exercises']) {
        const ids = new Set();
        for (const item of data[group]) {
            if (typeof item.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(item.id) || ids.has(item.id) || !phases.has(item.phase) || !unitPhases.has(item.phase) || (!item.source && group !== 'units')) throw Error(`Invalid ${group} ID/phase/source: ${item.id}`);
            ids.add(item.id);
        }
    }
    if (data.terms.length < 72 || data.readings.length !== 6 || data.errors.length !== 8) throw Error('English source content is incomplete');
    for (const term of data.terms) for (const field of ['term', 'meaning', 'example', 'translation']) if (!term[field]?.trim()) throw Error(`Missing ${field}: ${term.id}`);
    for (const reading of data.readings) if (!reading.text || !reading.translation) throw Error(`Missing reading ${reading.id}`);
    for (const pair of data.pairs) if (!pair.example) throw Error(`Missing pair example: ${pair.pair}`);
    for (const error of data.errors) for (const id of error.exerciseIds) if (!learningIds.has(id)) throw Error(`Unknown linked exercise ${id}`);
    for (const error of data.errors) if (!error.output || !error.meaning || !error.diagnosis || !error.model || !error.question) throw Error(`Incomplete error ${error.id}`);
    for (const writer of data.writers) if (!writer.task || !writer.model) throw Error(`Incomplete writing ${writer.id}`);
    for (const guide of data.guides) if (!guide.id || !guide.markdown || !guide.source) throw Error('Incomplete source guide');
    for (const task of data.exercises) {
        for (const field of ['context', 'hint']) if (task[field] !== undefined && (typeof task[field] !== 'string' || !task[field].trim() || task[field].length > 10000)) throw Error(`Invalid ${field}: ${task.id}`);
        if (!['choice', 'fill', 'reorder', 'correct'].includes(task.kind) || !['vocabulary', 'reading', 'practice', 'writing', 'error'].includes(task.section) || !task.prompt || !task.explanation || !task.answers?.length || task.answers.some(x => typeof x !== 'string' || !x.trim())) throw Error(`Invalid task: ${task.id}`);
        if (task.termId && !data.terms.some(t => t.id === task.termId)) throw Error(`Invalid term link ${task.id}`);
        if (task.kind === 'choice' && (!task.options || task.options.length < 2 || task.options.some(o => !o.id || !o.label) || new Set(task.options.map(o => o.id)).size !== task.options.length || task.answers.some(a => !task.options.some(o => o.id === a)))) throw Error(`Invalid choices ${task.id}`);
        if (task.kind === 'reorder' && (!task.tokens?.length || !task.answers.some(a => a.split(' ').sort().join(' ') === task.tokens.flatMap(t => t.split(' ')).sort().join(' ')))) throw Error(`Invalid ordering ${task.id}`);
    }
    for (const unit of data.units) {
        if (!unit.title || !unit.objective || !unit.prerequisite || !unit.explanation || !unit.application) throw Error(`Incomplete unit ${unit.id}`);
        for (const id of unit.exerciseIds) if (!learningIds.has(id)) throw Error(`Invalid unit link ${id}`);
        if (unit.number && (!data.readings.some(r => r.phase === unit.phase) || data.exercises.filter(e => e.phase === unit.phase && e.section === 'practice').length < 3)) throw Error(`Incomplete practice ${unit.id}`);
    }
}
