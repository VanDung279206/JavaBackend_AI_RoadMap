import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const { parseProject, emptyProject } = require('../.test-dist/project-core.js');
const { parseLessons } = require('../.test-dist/course-core.js');
const compiled = ts.transpileModule(readFileSync('src/lib/useLocalDraft.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const plannerCode = ts.transpileModule(readFileSync('src/components/ProjectPlanner.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
function renderPlanner(store) {
    const module = { exports: {} };
    runInNewContext(plannerCode, {
        module, exports: module.exports,
        require(name) {
            if (name === 'react') return { useState: initial => [typeof initial === 'number' ? 4 : initial, () => {}] };
            if (name === 'react/jsx-runtime') return require(name);
            if (name === 'next/link' || name === 'react-markdown') return { default: () => null };
            if (name === '@/lib/learning-store') return { useLearning: () => ({ owner: null }) };
            if (name === '@/lib/useLocalDraft') return { useLocalDraft: () => store };
            if (name === '@/lib/project-core') return require('../.test-dist/project-core.js');
            if (name === '@/lib/course-core') return require('../.test-dist/course-core.js');
            if (name === '@/lib/download') return { downloadText: () => {} };
            throw Error(`Unexpected import: ${name}`);
        },
    });
    return require('react-dom/server').renderToStaticMarkup(require('react').createElement(module.exports.default));
}
function sharedBrowser() {
    const storage = new Map(), queues = new Map();
    const locks = { request(name, options, action) {
        assert.equal(options.mode, 'exclusive');
        const result = (queues.get(name) ?? Promise.resolve()).then(action);
        queues.set(name, result.catch(() => {}));
        return result;
    } };
    return { storage, locks, failWrite: false };
}
function harness(browser = sharedBrowser()) {
    const { storage } = browser, handlers = [], module = { exports: {} };
    runInNewContext(compiled, {
        module, exports: module.exports,
        navigator: { locks: browser.locks },
        localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => {
            if (browser.failWrite) throw Error('QuotaExceededError');
            storage.set(key, value);
        } },
        window: { addEventListener: (name, handler) => handlers.push(handler) },
        require(name) {
            assert.equal(name, 'react');
            return { useMemo: fn => fn(), useEffect: fn => fn(), useSyncExternalStore: (_subscribe, get) => get() };
        },
    });
    return { storage, hook: module.exports.useLocalDraft, changed(key) { handlers.forEach(handler => handler({ key })); } };
}
test('local project draft survives refresh and never leaks into guest or another account', async () => {
    const h = harness(), initial = emptyProject();
    const get = key => h.hook(key, initial, parseProject);
    get('user:a');
    assert.equal(await get('user:a').save(latest => ({ ...latest, name: 'My project' })), true);
    get('guest'); get('user:b');
    assert.equal(get('guest').value.name, '');
    assert.equal(get('user:b').value.name, '');
    assert.equal(get('user:a').value.name, 'My project');
    const fresh = harness(); fresh.storage.set('user:a', h.storage.get('user:a'));
    fresh.hook('user:a', initial, parseProject);
    assert.equal(fresh.hook('user:a', initial, parseProject).value.name, 'My project');
});
test('corrupt local data locks writes and remains exportable; a storage update recovers', async () => {
    const h = harness(), key = 'lessons:guest', initial = {}, parse = value => parseLessons(value, ['JAVA01']);
    h.storage.set(key, '{broken'); h.hook(key, initial, parse);
    const store = h.hook(key, initial, parse);
    assert.ok(store.error); assert.equal(store.blocked, true); assert.equal(store.raw(), '{broken');
    assert.equal(await store.save(latest => ({ ...latest, JAVA01: { read: true, evidence: '', checkedAt: null } })), false);
    assert.equal(h.storage.get(key), '{broken');
    h.storage.set(key, '{}'); h.changed(key);
    assert.equal(h.hook(key, initial, parse).error, '');
    assert.equal(h.hook(key, initial, parse).blocked, false);
    assert.equal(await h.hook(key, initial, parse).save(latest => ({ ...latest, JAVA01: { read: true, evidence: '', checkedAt: null } })), true);
});
test('unresolved session cannot persist and different draft schemas have independent initial state', async () => {
    const h = harness();
    const lessons = h.hook(null, {}, value => parseLessons(value, ['JAVA01']));
    const project = h.hook(null, emptyProject(), parseProject);
    assert.equal(project.value.name, '');
    assert.equal(await lessons.save(latest => latest), false);
    assert.equal(await project.save(emptyProject), false);
    assert.equal(h.storage.size, 0);
});

test('two tabs preserve separate lessons and fields without receiving any storage events', async () => {
    const browser = sharedBrowser(), a = harness(browser), b = harness(browser);
    const initial = {}, key = 'lessons:guest', parse = value => parseLessons(value, ['JAVA01', 'JAVA02']);
    a.hook(key, initial, parse); b.hook(key, initial, parse);
    const patch = (tab, id, fields) => tab.hook(key, initial, parse).save(latest => ({
        ...latest, [id]: { ...(latest[id] ?? { read: false, evidence: '', checkedAt: null }), ...fields },
    }));
    assert.deepEqual(await Promise.all([patch(a, 'JAVA01', { read: true }), patch(b, 'JAVA02', { read: true })]), [true, true]);
    assert.deepEqual(Object.keys(JSON.parse(browser.storage.get(key))).sort(), ['JAVA01', 'JAVA02']);
    assert.deepEqual(await Promise.all([patch(a, 'JAVA01', { evidence: 'java JAVA01' }), patch(b, 'JAVA01', { read: false })]), [true, true]);
    const saved = JSON.parse(browser.storage.get(key));
    assert.equal(saved.JAVA01.read, false);
    assert.equal(saved.JAVA01.evidence, 'java JAVA01');
    assert.equal(saved.JAVA02.read, true);
});

test('two tabs merge project fields and checklist changes against the latest stored draft', async () => {
    const browser = sharedBrowser(), a = harness(browser), b = harness(browser), key = 'project:guest', initial = emptyProject();
    a.hook(key, initial, parseProject); b.hook(key, initial, parseProject);
    const save = (tab, change) => tab.hook(key, initial, parseProject).save(change);
    assert.deepEqual(await Promise.all([
        save(a, latest => ({ ...latest, name: 'Nhóm học' })),
        save(b, latest => ({ ...latest, data: 'Group -> Member' })),
    ]), [true, true]);
    await Promise.all([0, 1].map((index, tab) => save(tab ? b : a, latest => ({ ...latest, checklist: latest.checklist.map((item, i) => i === index ? true : item) }))));
    const saved = JSON.parse(browser.storage.get(key));
    assert.equal(saved.name, 'Nhóm học'); assert.equal(saved.data, 'Group -> Member');
    assert.deepEqual(saved.checklist.slice(0, 2), [true, true]);
});

test('typing is visible immediately and queued edits survive earlier save completions', async () => {
    const h = harness(), key = 'project:guest', initial = emptyProject();
    const get = () => h.hook(key, initial, parseProject);
    get();
    const first = get().save(latest => ({ ...latest, name: 'J' }));
    assert.equal(get().value.name, 'J');
    const second = get().save(latest => ({ ...latest, name: 'Java' }));
    assert.equal(get().value.name, 'Java');
    await first;
    assert.equal(get().value.name, 'Java');
    await second;
    assert.equal(JSON.parse(h.storage.get(key)).name, 'Java');
    const before = get().value.checklist[0];
    const toggle = get().save(latest => ({ ...latest, checklist: latest.checklist.map((item, i) => i === 0 ? !item : item) }));
    const field = get().save(latest => ({ ...latest, problem: 'Typing' }));
    assert.equal(get().value.checklist[0], !before);
    await Promise.all([toggle, field]);
    assert.equal(get().value.checklist[0], !before);
});

test('validation, generation and quota failures allow correction and retry', async () => {
    const browser = sharedBrowser(), h = harness(browser), key = 'project:guest', initial = emptyProject();
    const get = () => h.hook(key, initial, parseProject);
    get();
    assert.equal(await get().save(latest => ({ ...latest, name: 'Valid' })), true);
    const before = h.storage.get(key);
    assert.equal(await get().save(latest => ({ ...latest, name: 'x'.repeat(50001) })), false);
    assert.ok(get().error); assert.equal(get().blocked, false); assert.equal(h.storage.get(key), before);
    assert.equal(await get().save(() => { throw Error('generation failed'); }), false);
    assert.equal(get().blocked, false);
    browser.failWrite = true;
    assert.equal(await get().save(latest => ({ ...latest, name: 'Not saved' })), false);
    assert.equal(get().blocked, false); assert.equal(h.storage.get(key), before);
    browser.failWrite = false;
    assert.equal(await get().save(latest => ({ ...latest, name: 'Corrected' })), true);
    assert.equal(get().error, ''); assert.equal(get().value.name, 'Corrected');
});

test('planner form stays editable after generation failure but locks when the stored data is corrupt', async () => {
    const h = harness(), key = 'project:guest', initial = emptyProject();
    const get = () => h.hook(key, initial, parseProject);
    get();
    assert.equal(await get().save(() => { throw Error('generation failed'); }), false);
    const html = renderPlanner(get());
    assert.ok(html.includes('Lưu thất bại'));
    assert.ok(!/<fieldset[^>]*disabled/.test(html));
    assert.ok(!/<textarea[^>]*disabled/.test(html));
    assert.equal(await get().save(latest => ({ ...latest, repository: 'Corrected' })), true);
    h.storage.set(key, '{broken'); h.changed(key);
    assert.match(renderPlanner(get()), /<fieldset[^>]*disabled/);
});

test('a corrupt draft discovered inside the write lock is preserved even before storage events arrive', async () => {
    const h = harness(), key = 'project:guest', initial = emptyProject();
    h.hook(key, initial, parseProject);
    h.storage.set(key, '{broken');
    assert.equal(await h.hook(key, initial, parseProject).save(latest => ({ ...latest, name: 'Overwrite' })), false);
    assert.equal(h.storage.get(key), '{broken');
    assert.equal(h.hook(key, initial, parseProject).blocked, true);
});

test('unsupported lock API refuses unsafe writes and leaves the existing draft exportable', async () => {
    const browser = sharedBrowser(); browser.locks = undefined;
    const h = harness(browser), initial = emptyProject();
    h.storage.set('project', JSON.stringify({ ...initial, name: 'Original' }));
    h.hook('project', initial, parseProject);
    assert.equal(await h.hook('project', initial, parseProject).save(latest => ({ ...latest, name: 'Overwrite' })), false);
    assert.equal(JSON.parse(h.hook('project', initial, parseProject).raw()).name, 'Original');
    assert.match(h.hook('project', initial, parseProject).error, /Web Locks/);
});
