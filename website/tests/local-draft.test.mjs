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
function harness() {
    const storage = new Map(), handlers = [], module = { exports: {} };
    runInNewContext(compiled, {
        module, exports: module.exports,
        localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
        window: { addEventListener: (name, handler) => handlers.push(handler) },
        require(name) {
            assert.equal(name, 'react');
            return { useMemo: fn => fn(), useEffect: fn => fn(), useSyncExternalStore: (_subscribe, get) => get() };
        },
    });
    return { storage, hook: module.exports.useLocalDraft, changed(key) { handlers.forEach(handler => handler({ key })); } };
}
test('local project draft survives refresh and never leaks into guest or another account', () => {
    const h = harness(), initial = emptyProject();
    const get = key => h.hook(key, initial, parseProject);
    get('user:a');
    assert.equal(get('user:a').save({ ...initial, name: 'My project' }), true);
    get('guest'); get('user:b');
    assert.equal(get('guest').value.name, '');
    assert.equal(get('user:b').value.name, '');
    assert.equal(get('user:a').value.name, 'My project');
    const fresh = harness(); fresh.storage.set('user:a', h.storage.get('user:a'));
    fresh.hook('user:a', initial, parseProject);
    assert.equal(fresh.hook('user:a', initial, parseProject).value.name, 'My project');
});
test('corrupt local data locks writes and remains exportable; a storage update recovers', () => {
    const h = harness(), key = 'lessons:guest', initial = {}, parse = value => parseLessons(value, ['JAVA01']);
    h.storage.set(key, '{broken'); h.hook(key, initial, parse);
    const store = h.hook(key, initial, parse);
    assert.ok(store.error); assert.equal(store.raw(), '{broken');
    assert.equal(store.save({ JAVA01: { read: true, evidence: '', checkedAt: null } }), false);
    assert.equal(h.storage.get(key), '{broken');
    h.storage.set(key, '{}'); h.changed(key);
    assert.equal(h.hook(key, initial, parse).error, '');
    assert.equal(h.hook(key, initial, parse).save({ JAVA01: { read: true, evidence: '', checkedAt: null } }), true);
});
test('unresolved session cannot persist and different draft schemas have independent initial state', () => {
    const h = harness();
    const lessons = h.hook(null, {}, value => parseLessons(value, ['JAVA01']));
    const project = h.hook(null, emptyProject(), parseProject);
    assert.equal(project.value.name, '');
    assert.equal(lessons.save({}), false);
    assert.equal(project.save(emptyProject()), false);
    assert.equal(h.storage.size, 0);
});
