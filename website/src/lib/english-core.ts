export type EnglishUnit = { id: string; phase: string; number?: string; title: string; objective: string; prerequisite: string; explanation: string; application: string; exerciseIds: string[] };
export type EnglishTerm = { id: string; phase: string; term: string; meaning: string; example: string; translation: string; level: string; source: string };
export type EnglishExercise = { id: string; phase: string; section: string; kind: 'choice' | 'fill' | 'reorder' | 'correct'; level: string; prompt: string; context?: string; hint?: string; options?: { id: string; label: string }[]; tokens?: string[]; answers: string[]; explanation: string; source: string; termId?: string };
export type EnglishCatalogue = {
    version: number; units: EnglishUnit[]; terms: EnglishTerm[]; exercises: EnglishExercise[];
    readings: { id: string; phase: string; text: string; translation: string; questions: string; source: string }[];
    writers: { id: string; phase: string; task: string; commit: string; model: string; source: string }[];
    errors: { id: string; phase: string; output: string; meaning: string; diagnosis: string; model: string; question: string; exerciseIds: string[]; source: string }[];
    pairs: { pair: string; difference: string; mnemonic: string; example: string; source: string }[];
    guides: { id: string; section: string; title: string; markdown: string; source: string }[];
};
export type Rating = 'again' | 'hard' | 'good' | 'easy';
export type TermProgress = { seenAt: string | null; recalledAt: string | null; sentence: string; usedAt: string | null; reviewNeeded: boolean; dueAt: string | null; intervalDays: number; reviews: { at: string; rating: Rating }[] };
export type ExerciseProgress = { answer: string; checkedAnswer: string | null; correct: boolean | null; checkedAt: string | null; attempts: number };
export type WritingProgress = { text: string; commit: string; reviewedAt: string | null };
export type EnglishProgress = { version: 1; terms: Record<string, TermProgress>; exercises: Record<string, ExerciseProgress>; readings: Record<string, { readAt: string | null }>; writing: Record<string, WritingProgress> };
// Includes escaped UTF-8 text and duplicated answer/checkedAnswer in a full backup.
export const ENGLISH_BACKUP_MAX_BYTES = 32 * 1024 * 1024;
export const normalizeEnglishSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
export const emptyTerm = (): TermProgress => ({ seenAt: null, recalledAt: null, sentence: '', usedAt: null, reviewNeeded: false, dueAt: null, intervalDays: 0, reviews: [] });
export const emptyExercise = (): ExerciseProgress => ({ answer: '', checkedAnswer: null, correct: null, checkedAt: null, attempts: 0 });
export const emptyWriting = (): WritingProgress => ({ text: '', commit: '', reviewedAt: null });
export const emptyEnglish = (): EnglishProgress => ({ version: 1, terms: {}, exercises: {}, readings: {}, writing: {} });
const ratings: Rating[] = ['again', 'hard', 'good', 'easy'];
const object = (value: unknown): Record<string, unknown> => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Invalid English backup object');
    return value as Record<string, unknown>;
};
function string(value: unknown, limit: number): string {
    if (typeof value !== 'string' || value.length > limit) throw Error('Invalid English text');
    return value;
}
function date(value: unknown): string | null {
    if (value === null) return null;
    if (typeof value !== 'string' || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) throw Error('Invalid English date');
    return value;
}
function integer(value: unknown, max: number): number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > max) throw Error('Invalid English count');
    return value;
}
function boolean(value: unknown): boolean {
    if (typeof value !== 'boolean') throw Error('Invalid English flag');
    return value;
}
export function parseEnglish(input: unknown, catalogue: EnglishCatalogue): EnglishProgress {
    const root = object(input);
    if (root.version !== 1) throw Error('Unknown English backup version');
    const result = emptyEnglish();
    function each(group: keyof Omit<EnglishProgress, 'version'>, valid: string[], parse: (row: Record<string, unknown>, id: string) => void) {
        const ids = new Set(valid);
        for (const [id, row] of Object.entries(object(root[group]))) {
            if (!ids.has(id)) throw Error(`Unknown English ID ${id}`);
            parse(object(row), id);
        }
    }
    each('terms', catalogue.terms.map(t => t.id), (row, id) => {
        if (!Array.isArray(row.reviews) || row.reviews.length > 50) throw Error('Invalid English review history');
        const sentence = string(row.sentence, 2000), usedAt = date(row.usedAt);
        if (usedAt && !sentence.trim()) throw Error('Missing sentence evidence');
        result.terms[id] = { seenAt: date(row.seenAt), recalledAt: date(row.recalledAt), sentence, usedAt, reviewNeeded: boolean(row.reviewNeeded), dueAt: date(row.dueAt), intervalDays: integer(row.intervalDays, 3650), reviews: row.reviews.map(value => {
            const item = object(value), at = date(item.at);
            if (!at || !ratings.includes(item.rating as Rating)) throw Error('Invalid English rating');
            return { at, rating: item.rating as Rating };
        }) };
    });
    each('exercises', catalogue.exercises.map(e => e.id), (row, id) => {
        const answer = string(row.answer, 5000), checkedAnswer = row.checkedAnswer === null ? null : string(row.checkedAnswer, 5000);
        const correct = row.correct === null ? null : boolean(row.correct), checkedAt = date(row.checkedAt);
        if ((correct === null) !== (checkedAt === null) || (correct === null) !== (checkedAnswer === null) || (checkedAnswer !== null && answer !== checkedAnswer)) throw Error('Stale English answer');
        // Imported objective results are recomputed from the public answer key.
        if (correct !== null && gradeExercise(catalogue.exercises.find(e => e.id === id)!, answer) !== correct) throw Error('Inconsistent English result');
        result.exercises[id] = { answer, checkedAnswer, correct, checkedAt, attempts: integer(row.attempts, 1000000) };
    });
    each('readings', catalogue.readings.map(r => r.id), (row, id) => { result.readings[id] = { readAt: date(row.readAt) }; });
    each('writing', catalogue.writers.map(w => w.id), (row, id) => {
        const text = string(row.text, 5000), commit = string(row.commit, 500), reviewedAt = date(row.reviewedAt);
        if (reviewedAt && !text.trim()) throw Error('Missing English writing');
        result.writing[id] = { text, commit, reviewedAt };
    });
    return result;
}
export const normalizeAnswer = (value: string) => value.normalize('NFKC').replace(/[‘’]/g, "'").trim().replace(/\s+/g, ' ').replace(/[.!?]$/, '').toLowerCase();
export function orderedIndices(answer: string, size: number): number[] {
    try {
        const value: unknown = JSON.parse(answer);
        if (Array.isArray(value) && value.every(i => Number.isInteger(i) && i >= 0 && i < size) && new Set(value).size === value.length) return value;
    } catch { /* A blank or invalid draft is not a complete ordered sentence. */ }
    return [];
}
export function gradeExercise(exercise: EnglishExercise, answer: string): boolean {
    if (!answer.trim()) return false;
    if (exercise.kind === 'choice') return exercise.answers.includes(answer);
    if (exercise.kind === 'reorder') {
        const indices = orderedIndices(answer, exercise.tokens!.length);
        if (indices.length !== exercise.tokens!.length) return false;
        answer = indices.map(i => exercise.tokens![i]).join(' ');
    }
    return exercise.answers.some(expected => normalizeAnswer(expected) === normalizeAnswer(answer));
}
export function scheduleReview(previous: TermProgress, rating: Rating, now: string): TermProgress {
    if (!ratings.includes(rating) || !date(now)) throw Error('Invalid review');
    const days = rating === 'again' ? 0 : rating === 'hard' ? Math.max(1, Math.round(previous.intervalDays * 1.2)) : rating === 'good' ? previous.intervalDays === 0 ? 1 : Math.max(3, previous.intervalDays * 2) : Math.max(4, Math.round(previous.intervalDays * 2.5));
    const intervalDays = Math.min(3650, days);
    return { ...previous, seenAt: previous.seenAt ?? now, recalledAt: rating === 'good' || rating === 'easy' ? now : previous.recalledAt, reviewNeeded: rating === 'again' || rating === 'hard', intervalDays, dueAt: new Date(Date.parse(now) + (intervalDays === 0 ? 10 * 60000 : intervalDays * 86400000)).toISOString(), reviews: [...previous.reviews, { at: now, rating }].slice(-50) };
}
export function dueTerms(catalogue: EnglishCatalogue, progress: EnglishProgress, now: string): EnglishTerm[] {
    return catalogue.terms.filter(term => {
        const row = progress.terms[term.id];
        return row && (row.dueAt ? row.dueAt <= now : row.reviewNeeded);
    }).sort((a, b) => (progress.terms[a.id].dueAt ?? '').localeCompare(progress.terms[b.id].dueAt ?? '') || a.id.localeCompare(b.id));
}
export type EnglishLearningSection = 'vocabulary' | 'reading' | 'writing';
export function englishUnitStatus(catalogue: EnglishCatalogue, progress: EnglishProgress, phase: string) {
    const tasks = catalogue.exercises.filter(e => e.phase === phase && e.section !== 'error');
    const readings = catalogue.readings.filter(r => r.phase === phase);
    const writers = catalogue.writers.filter(w => w.phase === phase && !catalogue.errors.some(error => w.id === `WRITE-${error.id}`));
    const completed = tasks.filter(e => progress.exercises[e.id]?.correct === true).length + readings.filter(r => progress.readings[r.id]?.readAt).length + writers.filter(w => progress.writing[w.id]?.reviewedAt).length;
    let nextSection: EnglishLearningSection | null = null;
    if (tasks.some(e => e.section === 'vocabulary' && progress.exercises[e.id]?.correct !== true)) nextSection = 'vocabulary';
    else if (readings.some(r => !progress.readings[r.id]?.readAt) || tasks.some(e => ['reading', 'practice'].includes(e.section) && progress.exercises[e.id]?.correct !== true)) nextSection = 'reading';
    else if (tasks.some(e => e.section === 'writing' && progress.exercises[e.id]?.correct !== true) || writers.some(w => !progress.writing[w.id]?.reviewedAt)) nextSection = 'writing';
    return { completed, total: tasks.length + readings.length + writers.length, nextSection };
}
export function nextEnglishUnit(catalogue: EnglishCatalogue, progress: EnglishProgress, activePhase?: string): EnglishUnit {
    const candidates = activePhase ? [...catalogue.units.filter(u => u.phase === activePhase), ...catalogue.units.filter(u => u.phase !== activePhase)] : catalogue.units;
    return candidates.find(unit => englishUnitStatus(catalogue, progress, unit.phase).nextSection !== null) ?? candidates[0];
}
export function englishStats(progress: EnglishProgress) {
    return { seen: Object.values(progress.terms).filter(t => t.seenAt).length, recalled: Object.values(progress.terms).filter(t => t.recalledAt).length, used: Object.values(progress.terms).filter(t => t.usedAt).length, correct: Object.values(progress.exercises).filter(e => e.correct).length, writing: Object.values(progress.writing).filter(w => w.reviewedAt).length };
}
