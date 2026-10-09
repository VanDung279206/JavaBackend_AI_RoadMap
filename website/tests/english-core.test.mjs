import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { emptyEnglish, emptyTerm, emptyExercise, emptyWriting, parseEnglish, gradeExercise, orderedIndices, scheduleReview, dueTerms, nextEnglishUnit, englishStats } = require('../.test-dist/english-core.js');
const { selectEnglishVoice, speechAvailable } = require('../.test-dist/english-speech.js');
const catalogue = JSON.parse(readFileSync('src/generated/english.json', 'utf8'));
const now = '2026-10-09T10:00:00.000Z';
const parse = value => parseEnglish(value, catalogue);
const task = id => catalogue.exercises.find(e => e.id === id);
test('Vietnamese search treats Đ/đ, accents and capitalization consistently', () => {
    const { normalizeEnglishSearch } = require('../.test-dist/english-core.js');
    for (const value of ['Đối tượng cụ thể', 'đối tượng cụ thể', 'ĐỐI TƯỢNG CỤ THỂ', 'doi tuong cu the']) assert.equal(normalizeEnglishSearch(value), 'doi tuong cu the');
    assert.equal(normalizeEnglishSearch('Parameter'), normalizeEnglishSearch('parameter'));
});
function rightAnswer(e) {
    if (e.kind !== 'reorder') return e.answers[0];
    const remaining = e.tokens.map((token, index) => ({ token, index }));
    return JSON.stringify(e.answers[0].split(' ').map(token => {
        const index = remaining.findIndex(item => item.token === token);
        assert.notEqual(index, -1, e.id);
        return remaining.splice(index, 1)[0].index;
    }));
}
test('all published answer keys are accepted and blank answers are rejected', () => {
    for (const e of catalogue.exercises) {
        assert.equal(gradeExercise(e, rightAnswer(e)), true, e.id);
        assert.equal(gradeExercise(e, ''), false, e.id);
    }
});
test('answer matching accepts documented alternatives, spacing, case and terminal punctuation', () => {
    assert.equal(gradeExercise(task('FIX-3'), '  The   test PASSED!  '), true);
    assert.equal(gradeExercise(task('FIX-3'), 'The test passes.'), true);
    assert.equal(gradeExercise(task('FIX-3'), 'The test is pass.'), false);
    assert.equal(gradeExercise(task('P6-FILL'), 'IDs'), true);
    assert.equal(gradeExercise(task('P6-FILL'), 'id'), true);
    assert.equal(gradeExercise(task('P6-FILL'), 'citation'), false);
    const e = task('READ-5-Q1');
    assert.equal(gradeExercise(e, 'Không; chỉ khi policy cho phép'), false, 'choice requires an actual option ID');
});
test('ordering preserves repeated words and rejects incomplete, reused or forged token indices', () => {
    const e = task('P3-ORDER');
    assert.equal(gradeExercise(e, rightAnswer(e)), true);
    for (const answer of ['[2,4,0,1]', '[2,4,0,0,1]', '[2,4,0,3,99]', '["2",4,0,3,1]', 'The repository loads the entity.']) assert.equal(gradeExercise(e, answer), false);
    assert.deepEqual(orderedIndices('[0,0]', 2), []);
    assert.equal(gradeExercise(task('P5-ORDER'), '[5,0,2,1,3,4]'), false, 'not changes the policy meaning');
});
test('backup validation rejects unknown IDs, malformed dates, excessive text and fabricated scores', () => {
    assert.deepEqual(parse(emptyEnglish()), emptyEnglish());
    for (const bad of [null, [], {}, { ...emptyEnglish(), version: 2 }, { ...emptyEnglish(), terms: { UNKNOWN: emptyTerm() } }, { ...emptyEnglish(), writing: { 'WRITE-1': { ...emptyWriting(), text: 'x'.repeat(5001) } } }, { ...emptyEnglish(), terms: { [catalogue.terms[0].id]: { ...emptyTerm(), dueAt: '2026-10-09' } } }]) assert.throws(() => parse(bad));
    const e = task('P1-FILL'), record = { ...emptyExercise(), answer: 'wrong', checkedAnswer: 'wrong', checkedAt: now, correct: true, attempts: 1 };
    assert.throws(() => parse({ ...emptyEnglish(), exercises: { [e.id]: record } }), /Inconsistent/);
    assert.throws(() => parse({ ...emptyEnglish(), exercises: { [e.id]: { ...record, correct: false, checkedAnswer: 'argument' } } }), /Stale/);
    assert.equal(parse({ ...emptyEnglish(), exercises: { [e.id]: { ...record, correct: false } } }).exercises[e.id].correct, false);
});
test('self-assessment requires evidence and review history is bounded', () => {
    const id = catalogue.terms[0].id;
    for (const row of [{ ...emptyTerm(), usedAt: now }, { ...emptyTerm(), reviews: [{ at: now, rating: 'pass' }] }, { ...emptyTerm(), reviews: Array(51).fill({ at: now, rating: 'good' }) }, { ...emptyTerm(), intervalDays: -1 }]) assert.throws(() => parse({ ...emptyEnglish(), terms: { [id]: row } }));
    assert.throws(() => parse({ ...emptyEnglish(), writing: { 'WRITE-1': { ...emptyWriting(), reviewedAt: now } } }));
    assert.equal(parse({ ...emptyEnglish(), writing: { 'WRITE-1': { ...emptyWriting(), text: 'The method returns a list.', reviewedAt: now } } }).writing['WRITE-1'].reviewedAt, now);
});
test('review schedule adapts to memory rating, caps growth and retains the latest 50 reviews', () => {
    const initial = emptyTerm();
    assert.equal(scheduleReview(initial, 'again', now).dueAt, '2026-10-09T10:10:00.000Z');
    assert.equal(scheduleReview(initial, 'hard', now).intervalDays, 1);
    const good = scheduleReview(initial, 'good', now);
    assert.equal(good.intervalDays, 1); assert.equal(good.recalledAt, now);
    assert.equal(scheduleReview(good, 'good', now).intervalDays, 3);
    assert.equal(scheduleReview(initial, 'easy', now).intervalDays, 4);
    const capped = scheduleReview({ ...initial, intervalDays: 3650, reviews: Array(50).fill({ at: now, rating: 'hard' }) }, 'easy', now);
    assert.equal(capped.intervalDays, 3650); assert.equal(capped.reviews.length, 50); assert.equal(capped.reviews.at(-1).rating, 'easy');
    assert.throws(() => scheduleReview(initial, 'unknown', now));
    assert.throws(() => scheduleReview(initial, 'good', 'invalid'));
});
test('due selection includes immediate review requests but respects a future hard/again schedule', () => {
    const [a, b, c] = catalogue.terms;
    const p = { ...emptyEnglish(), terms: { [a.id]: { ...emptyTerm(), reviewNeeded: true }, [b.id]: scheduleReview(emptyTerm(), 'hard', now), [c.id]: { ...emptyTerm(), dueAt: now } } };
    assert.deepEqual(dueTerms(catalogue, p, now).map(t => t.id), [a.id, c.id]);
    assert.equal(dueTerms(catalogue, p, '2026-10-10T10:00:00.000Z').length, 3);
});
test('viewed, recalled, used and objective/self-assessed results remain distinct', () => {
    const [a, b, c] = catalogue.terms;
    const p = { ...emptyEnglish(), terms: { [a.id]: { ...emptyTerm(), seenAt: now }, [b.id]: { ...emptyTerm(), recalledAt: now }, [c.id]: { ...emptyTerm(), sentence: 'This method returns a list.', usedAt: now } }, exercises: { 'P1-FILL': { ...emptyExercise(), correct: true } }, writing: { 'WRITE-1': { ...emptyWriting(), text: 'I checked the output.', reviewedAt: now } } };
    assert.deepEqual(englishStats(p), { seen: 1, recalled: 1, used: 1, correct: 1, writing: 1 });
    assert.equal('verified' in parse({ ...emptyEnglish(), verified: ['P1.1'] }), false);
});
test('next lesson prioritizes the active coding phase, then skips a completed unit', () => {
    const p = emptyEnglish(), phase = '05_AI';
    assert.equal(nextEnglishUnit(catalogue, p, phase).phase, phase);
    for (const e of catalogue.exercises.filter(e => e.phase === phase && ['practice', 'reading'].includes(e.section))) p.exercises[e.id] = { ...emptyExercise(), correct: true };
    const r = catalogue.readings.find(r => r.phase === phase); p.readings[r.id] = { readAt: now };
    p.writing['WRITE-5'] = { ...emptyWriting(), text: 'I checked retries.', reviewedAt: now };
    assert.notEqual(nextEnglishUnit(catalogue, p, phase).phase, phase);
    assert.equal(nextEnglishUnit(catalogue, emptyEnglish(), '00_setup').phase, '00_setup');
    assert.equal(nextEnglishUnit(catalogue, emptyEnglish(), 'dsa').phase, 'dsa');
});
test('speech selects English only and degrades safely when unsupported or voices are absent', () => {
    assert.equal(speechAvailable(null), false);
    assert.equal(speechAvailable({ getVoices: () => [] }), false);
    assert.equal(selectEnglishVoice([{ lang: 'vi-VN' }, { lang: 'fr-FR' }]), null);
    const uk = { lang: 'en-GB' }, us = { lang: 'en-US' };
    assert.equal(selectEnglishVoice([uk, us]), us);
    assert.equal(selectEnglishVoice([{ lang: 'vi-VN' }, uk]), uk);
});

test('a maximum-size validated English backup fits the import limit, including escaped checked answers', () => {
    const { ENGLISH_BACKUP_MAX_BYTES } = require('../.test-dist/english-core.js');
    const p = emptyEnglish(), text = '\u0000'.repeat(5000);
    for (const e of catalogue.exercises) p.exercises[e.id] = { ...emptyExercise(), answer: text, checkedAnswer: text, correct: false, checkedAt: now, attempts: 1 };
    for (const t of catalogue.terms) p.terms[t.id] = { ...emptyTerm(), sentence: '\u0000'.repeat(2000), reviews: Array(50).fill({ at: now, rating: 'again' }) };
    for (const w of catalogue.writers) p.writing[w.id] = { ...emptyWriting(), text, commit: '\u0000'.repeat(500) };
    const validated = parse(p), encoded = JSON.stringify(validated);
    assert.ok(Buffer.byteLength(encoded) <= ENGLISH_BACKUP_MAX_BYTES);
    assert.deepEqual(parse(JSON.parse(encoded)), validated);
});
