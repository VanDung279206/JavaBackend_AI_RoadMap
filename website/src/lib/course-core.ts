import type { Entries } from './progress-core';

export type LessonProgress = Record<string, { read: boolean; evidence: string; checkedAt: string | null }>;
export const emptyLesson = () => ({ read: false, evidence: '', checkedAt: null });
export const localKey = (area: string, owner: string | null) => `roadmap-v2:${area}:${owner ? `user:${owner}` : 'guest'}`;
export function parseLessons(input: unknown, ids: string[]): LessonProgress {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Invalid lesson backup');
    const result: LessonProgress = {};
    for (const [id, value] of Object.entries(input)) {
        if (!ids.includes(id) || !value || typeof value !== 'object') throw Error('Invalid lesson ID');
        const row = value as LessonProgress[string];
        if (typeof row.read !== 'boolean' || typeof row.evidence !== 'string' || row.evidence.length > 20000 || (row.checkedAt !== null && (typeof row.checkedAt !== 'string' || !Number.isFinite(Date.parse(row.checkedAt)) || !row.evidence.trim()))) throw Error('Invalid lesson evidence');
        result[id] = { read: row.read, evidence: row.evidence, checkedAt: row.checkedAt };
    }
    return result;
}
export function lessonRecommendations(lessons: { id: string; phase: string; tags: string[]; exercise_ids: string[] }[], entries: Entries) {
    const active = Object.entries(entries).filter(([, row]) => row.status === 'needs_review' || (row.status !== 'self_completed' && row.error_tags.length > 0));
    return lessons.flatMap(lesson => {
        const errors = active.filter(([id, row]) => lesson.exercise_ids.includes(id) || lesson.tags.some(tag => row.error_tags.includes(tag)));
        return errors.length ? [{ id: lesson.id, phase: lesson.phase, exerciseIds: errors.map(([id]) => id), score: errors.length }] : [];
    }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
export function prerequisitesMet(prerequisites: string[], entries: Entries) {
    return prerequisites.every(id => entries[id]?.status === 'self_completed');
}
