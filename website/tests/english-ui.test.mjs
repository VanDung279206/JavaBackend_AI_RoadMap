import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url), ts = require('typescript');
const core = require('../.test-dist/english-core.js');
const catalogue = JSON.parse(readFileSync('src/generated/english.json', 'utf8'));
const code = file => ts.transpileModule(readFileSync('src/components/english/' + file + '.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
function render(file, props, states = [], refs = []) {
    const module = { exports: {} }, buttons = [], inputs = [];
    let stateIndex = 0, refIndex = 0;
    runInNewContext(code(file), { module, exports: module.exports, require(name) {
        if (name === 'react') return { useId: () => 'test-label', useRef: value => { const index = refIndex++; return refs[index] ?? (refs[index] = { current: value }); }, useState: initial => [stateIndex < states.length ? states[stateIndex++] : initial, () => {}] };
        if (name === 'react/jsx-runtime') { const runtime = require(name); return { ...runtime, ...Object.fromEntries(['jsx', 'jsxs'].map(method => [method, (type, props, key) => { if (type === 'button') buttons.push(props); if (type === 'input') inputs.push(props); return runtime[method](type, props, key); }])) }; }
        if (name === '@/lib/english-core') return core;
        if (name === '@/lib/english') return { english: catalogue };
        if (name === './SpeakButton' || name === './EnglishPractice') return { default: () => null };
        throw Error('Unexpected ' + name);
    } });
    const html = require('react-dom/server').renderToStaticMarkup(require('react').createElement(module.exports.default, props));
    return { html, inputs, button: label => buttons.find(b => b.children === label) };
}
function saving(actual) {
    return { rejected: false, value: actual, async save(change) { try { this.value = core.parseEnglish(change(this.value), catalogue); return true; } catch { this.rejected = true; return false; } } };
}
test('stale objective grading cannot score an answer changed by another tab', () => {
    const exercise = catalogue.exercises.find(e => e.id === 'P1-FILL');
    const progress = { ...core.emptyEnglish(), exercises: { [exercise.id]: { ...core.emptyExercise(), answer: 'argument' } } };
    const actual = structuredClone(progress); actual.exercises[exercise.id].answer = 'new input';
    const store = saving(actual), ui = render('EnglishPractice', { exercise, progress, disabled: false, save: store.save.bind(store) });
    ui.button('Kiểm tra câu trả lời').onClick();
    assert.equal(store.rejected, true); assert.equal(store.value.exercises[exercise.id].checkedAt, null);
    assert.equal(store.value.exercises[exercise.id].answer, 'new input');
    assert.ok(!ui.html.includes('Xem đáp án sau khi làm'));
});
test('a stale writing confirmation checks both text and commit, leaving newer evidence unverified', () => {
    const task = catalogue.writers.find(w => w.id === 'WRITE-1');
    for (const patch of [{ text: 'Changed text.' }, { commit: 'fix: changed commit' }]) {
        const progress = { ...core.emptyEnglish(), writing: { [task.id]: { ...core.emptyWriting(), text: 'The method returns a list.', commit: 'feat: add a method' } } };
        const actual = structuredClone(progress); Object.assign(actual.writing[task.id], patch);
        const store = saving(actual), ui = render('EnglishWriting', { task, progress, disabled: false, save: store.save.bind(store) });
        ui.button('Tôi đã tự đối chiếu bài viết').onClick();
        assert.equal(store.rejected, true); assert.equal(store.value.writing[task.id].reviewedAt, null);
        for (const [key, value] of Object.entries(patch)) assert.equal(store.value.writing[task.id][key], value);
    }
});
test('term self-use cannot certify a sentence replaced in another tab', () => {
    const term = catalogue.terms[0], progress = { ...core.emptyEnglish(), terms: { [term.id]: { ...core.emptyTerm(), sentence: 'The class stores data.' } } };
    const actual = structuredClone(progress); actual.terms[term.id].sentence = 'New sentence.';
    const store = saving(actual), ui = render('EnglishTermCard', { term, progress, disabled: false, save: store.save.bind(store) });
    ui.button('Tôi đã đối chiếu câu với nghĩa của từ').onClick();
    assert.equal(store.rejected, true); assert.equal(store.value.terms[term.id].usedAt, null);
});
test('a rated flashcard locks answer editing and another rating in the same attempt', async () => {
    let calls = 0;
    const ui = render('EnglishReview', { term: catalogue.terms[0], progress: core.emptyEnglish(), disabled: false, save: async () => { calls++; return true; } }, ['my answer', true, true, 'saved', false]);
    assert.equal(ui.inputs[0].disabled, true);
    assert.equal(ui.button('Mở đáp án flashcard').disabled, true);
    assert.equal(ui.button('Nhớ được').disabled, true);
    await ui.button('Nhớ được').onClick();
    assert.equal(calls, 0);
});
test('a flashcard refuses duplicate clicks while saving and disables input during pending writes', async () => {
    let calls = 0, finish;
    const props = { term: catalogue.terms[0], progress: core.emptyEnglish(), disabled: false, save: () => { calls++; return new Promise(resolve => { finish = resolve; }); } };
    const ui = render('EnglishReview', props, ['my answer', true, false, '', false]);
    ui.button('Mở đáp án flashcard').onClick();
    const first = ui.button('Nhớ được').onClick();
    await ui.button('Nhớ được').onClick();
    assert.equal(calls, 1); finish(true); await first;
    assert.equal(render('EnglishReview', props, ['my answer', true, false, '', true]).inputs[0].disabled, true);
});

test('a revealed flashcard rejects another tab review even after receiving its updated progress', async () => {
    const term = catalogue.terms[0], progress = core.emptyEnglish();
    const store = saving(progress), refs = [];
    const props = { term, progress, disabled: false, save: store.save.bind(store) };
    const stale = render('EnglishReview', props, ['my answer', true, false, '', false], refs);
    stale.button('Mở đáp án flashcard').onClick();
    const fresh = render('EnglishReview', props, ['my answer', true, false, '', false]);
    fresh.button('Mở đáp án flashcard').onClick();
    await fresh.button('Nhớ được').onClick();
    const saved = structuredClone(store.value);
    const updated = render('EnglishReview', { ...props, progress: store.value }, ['my answer', true, false, '', false], refs);
    await updated.button('Nhớ dễ').onClick();
    assert.equal(store.rejected, true);
    assert.deepEqual(store.value, saved);
    assert.equal(store.value.terms[term.id].reviews.length, 1);
});

test('rating merges unrelated sentence edits without treating them as a review conflict', async () => {
    const term = catalogue.terms[0], progress = core.emptyEnglish();
    const actual = core.emptyEnglish(); actual.terms[term.id] = { ...core.emptyTerm(), sentence: 'An independent edit.' };
    const store = saving(actual);
    const ui = render('EnglishReview', { term, progress, disabled: false, save: store.save.bind(store) }, ['my answer', true, false, '', false]);
    ui.button('Mở đáp án flashcard').onClick();
    await ui.button('Nhớ được').onClick();
    assert.equal(store.rejected, false);
    assert.equal(store.value.terms[term.id].sentence, 'An independent edit.');
    assert.equal(store.value.terms[term.id].reviews.length, 1);
});

test('requesting review brings a previously scheduled term into the due queue immediately', () => {
    const term = catalogue.terms[0];
    const scheduled = core.scheduleReview(core.emptyTerm(), 'easy', '2099-01-01T00:00:00.000Z');
    const progress = { ...core.emptyEnglish(), terms: { [term.id]: scheduled } };
    const store = saving(progress);
    const ui = render('EnglishTermCard', { term, progress, disabled: false, save: store.save.bind(store) });
    assert.equal(core.dueTerms(catalogue, progress, new Date().toISOString()).length, 0);
    ui.inputs.find(input => input.type === 'checkbox').onChange({ target: { checked: true } });
    assert.deepEqual(core.dueTerms(catalogue, store.value, '2026-10-10T00:00:00.000Z').map(t => t.id), [term.id], 'manual requests must not wait for the 30-second UI clock tick');
    assert.deepEqual(store.value.terms[term.id].reviews, scheduled.reviews);
    assert.equal(store.value.terms[term.id].intervalDays, scheduled.intervalDays);
});
