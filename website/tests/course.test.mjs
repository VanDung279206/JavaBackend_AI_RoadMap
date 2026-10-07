import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { emptyEntry } = require('../.test-dist/progress-core.js');
const { parseLessons, lessonRecommendations, prerequisitesMet, localKey } = require('../.test-dist/course-core.js');
const { emptyProject, parseProject, scopeReady, generateOutline, projectFields, PROJECT_FIELD_LIMIT, PROJECT_OUTLINE_LIMIT } = require('../.test-dist/project-core.js');
const catalogue = JSON.parse(readFileSync('src/generated/catalogue.json', 'utf8'));

test('lesson reading/evidence stays independent of exercise completion and verified results', () => {
    const lessons = parseLessons({ JAVA01: { read: true, evidence: '', checkedAt: null } }, ['JAVA01']);
    assert.equal(lessons.JAVA01.read, true);
    assert.equal(lessons.JAVA01.checkedAt, null);
    assert.equal(prerequisitesMet(['JP01'], {}), false);
    assert.throws(() => parseLessons({ JAVA01: { read: true, evidence: ' ', checkedAt: new Date().toISOString() } }, ['JAVA01']));
    assert.throws(() => parseLessons({ Unknown: { read: true, evidence: '', checkedAt: null } }, ['JAVA01']));
    assert.throws(() => parseLessons([], ['JAVA01']));
    assert.notEqual(localKey('lessons', null), localKey('lessons', 'account-a'));
    assert.notEqual(localKey('project', 'account-a'), localKey('project', 'account-b'));
});
test('an unresolved duplicate error recommends foundations and a resolved error drops out', () => {
    const entries = { JP08: { ...emptyEntry(), status: 'needs_review', error_tags: ['duplicates'] } };
    assert.ok(lessonRecommendations(catalogue.lessons, entries).some(item => item.id === 'JAVA06'));
    entries.JP08.status = 'self_completed';
    assert.deepEqual(lessonRecommendations(catalogue.lessons, entries), []);
    assert.equal(prerequisitesMet(['JP08'], entries), true);
});
test('pilot distribution and prerequisite links match the learning progression', () => {
    const pilot = catalogue.exercises.filter(item => item.track === 'java-pilot');
    assert.equal(pilot.length, 20);
    assert.equal(pilot.filter(item => ['read', 'guided'].includes(item.kind)).length, 6);
    for (const [kind, count] of [['implement', 6], ['combine', 4], ['debug', 2], ['challenge', 2]]) assert.equal(pilot.filter(item => item.kind === kind).length, count);
    assert.equal(pilot.filter(item => item.required).length, 18);
    assert.equal(catalogue.courses.length, 6);
    assert.equal(catalogue.sessions.length, 32);
    for (const item of pilot) {
        assert.ok(item.markdown.includes('Tiêu chí hoàn thành'));
        assert.ok(item.solution.includes('```java'));
        assert.equal(item.hints.length, 3);
    }
    for (const lesson of catalogue.lessons) {
        assert.ok(lesson.markdown.includes('Diễn giải từng bước'));
        assert.ok(lesson.markdown.includes('Kiểm tra hiểu bài'));
        assert.ok(lesson.exercise_ids.every(id => catalogue.exercises.some(item => item.id === id)));
    }
    const sessionIds = new Set(catalogue.sessions.slice(2, 6).flatMap(session => session.exercise_ids));
    for (const exercise of pilot.filter(item => item.required)) assert.ok(sessionIds.has(exercise.id));
});
test('project generation uses chosen scope, retains lab choice and leaves evidence unchecked', () => {
    const draft = emptyProject();
    assert.equal(scopeReady(draft), false);
    assert.throws(() => generateOutline(draft));
    Object.assign(draft, { name: 'Nhóm học', audience: 'sinh viên', problem: 'lịch trùng', objective: 'chốt lịch', feature1: 'tạo nhóm', feature2: 'đăng ký', feature3: 'chọn lịch', difference: 'ghép lịch', later: 'chat' });
    assert.equal(scopeReady(draft), true);
    const outline = generateOutline(draft);
    assert.ok(outline.includes('1. tạo nhóm\n2. đăng ký\n3. chọn lịch'));
    assert.ok(outline.includes('Là sinh viên'));
    assert.ok(outline.includes('RAG bằng lab riêng'));
    assert.ok(!outline.includes('- [x]'));
    assert.equal((outline.match(/### (Java|HTTP & SQL|Spring Boot|Kiểm thử & vận hành|AI|RAG)\n/g) ?? []).length, 6);
    draft.ragMode = 'project'; draft.stories = 'User story tùy chọn'; draft.java = 'CLI lịch học';
    const customized = generateOutline(draft);
    assert.ok(customized.includes('User story tùy chọn'));
    assert.ok(customized.includes('CLI lịch học'));
    assert.ok(customized.includes('RAG gắn với nhu cầu dự án'));
    assert.equal(parseProject(JSON.parse(JSON.stringify(draft))).name, 'Nhóm học');
    assert.throws(() => parseProject({ ...draft, checklist: [true] }));
    assert.throws(() => parseProject({ ...draft, name: null }));
});

test('valid large project inputs always produce a persistable editable outline', () => {
    const draft = emptyProject();
    for (const field of projectFields) draft[field] = 'x';
    draft.data = 'x'.repeat(49000);
    const outline = generateOutline(parseProject(draft));
    assert.ok(outline.length > PROJECT_FIELD_LIMIT);
    assert.equal(parseProject({ ...draft, outline, previousOutline: outline }).outline, outline);
    for (const field of projectFields) draft[field] = 'x'.repeat(PROJECT_FIELD_LIMIT);
    for (const stories of [draft.stories, '']) {
        const largest = { ...draft, stories };
        const generated = generateOutline(parseProject(largest));
        assert.ok(generated.length <= PROJECT_OUTLINE_LIMIT);
        assert.equal(parseProject({ ...largest, outline: generated, previousOutline: generated }).outline.length, generated.length);
    }
    assert.throws(() => parseProject({ ...draft, data: 'x'.repeat(PROJECT_FIELD_LIMIT + 1) }));
    assert.throws(() => parseProject({ ...draft, outline: 'x'.repeat(PROJECT_OUTLINE_LIMIT + 1) }));
});
