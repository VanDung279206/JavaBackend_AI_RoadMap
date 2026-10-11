import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url), ts = require('typescript');
const core = require('../.test-dist/english-core.js');
const { localKey } = require('../.test-dist/course-core.js');
const catalogue = JSON.parse(readFileSync('src/generated/english.json', 'utf8'));
const parse = value => core.parseEnglish(value, catalogue), empty = core.emptyEnglish();
const code = ts.transpileModule(readFileSync('src/lib/useLocalDraft.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
function browser() {
    const storage = new Map(), queues = new Map();
    return { storage, fail: false, locks: { request(name, _options, callback) {
        const result = (queues.get(name) ?? Promise.resolve()).then(callback);
        queues.set(name, result.catch(() => {})); return result;
    } } };
}
function tab(shared) {
    const module = { exports: {} }, listeners = [];
    runInNewContext(code, { module, exports: module.exports, navigator: { locks: shared.locks },
        localStorage: { getItem: key => shared.storage.get(key) ?? null, setItem: (key, value) => { if (shared.fail) throw Error('Quota'); shared.storage.set(key, value); } },
        window: { addEventListener: (type, fn) => listeners.push({ type, fn }) },
        require: () => ({ useMemo: fn => fn(), useEffect: fn => fn(), useSyncExternalStore: (_subscribe, get) => get() }),
    });
    return { get(key) { module.exports.useLocalDraft(key, empty, parse); return module.exports.useLocalDraft(key, empty, parse); }, storageEvent(key) { listeners.filter(l => l.type === 'storage').forEach(l => l.fn({ key })); } };
}
const term = catalogue.terms[0].id;
const write = (t, key, fields) => t.get(key).save(latest => ({ ...latest, terms: { ...latest.terms, [term]: { ...(latest.terms[term] ?? core.emptyTerm()), ...fields } } }));
async function hold(shared, key) {
    let release, entered;
    const ready = new Promise(resolve => { entered = resolve; });
    const held = shared.locks.request(`draft:${key}`, {}, () => { entered(); return new Promise(resolve => { release = resolve; }); });
    await ready; return async () => { release(); await held; };
}
test('English progress reloads completely and guest/accounts/coding areas remain isolated', async () => {
    const b = browser(), a = tab(b), key = localKey('english', 'a');
    await write(a, key, { sentence: 'The class stores a title.' });
    await a.get(key).save(latest => ({ ...latest, writing: { 'WRITE-1': { text: 'I checked the output.', commit: 'test: check output', reviewedAt: null } }, readings: { 'READ-1': { readAt: '2026-10-09T10:00:00.000Z' } } }));
    const reloaded = tab(b);
    assert.equal(reloaded.get(key).value.terms[term].sentence, 'The class stores a title.');
    assert.equal(reloaded.get(key).value.writing['WRITE-1'].commit, 'test: check output');
    for (const other of [localKey('english', null), localKey('english', 'b'), localKey('lessons', 'a')]) assert.equal(b.storage.has(other), false);
    assert.deepEqual(reloaded.get(localKey('english', null)).value, empty);
    assert.deepEqual(reloaded.get(localKey('english', 'b')).value, empty);
    assert.equal(await reloaded.get(null).save(latest => latest), false);
});
test('two English tabs merge independent sections and fields under the same lock', async () => {
    const b = browser(), a = tab(b), c = tab(b), key = localKey('english', null);
    assert.deepEqual(await Promise.all([write(a, key, { sentence: 'The class stores data.' }), write(c, key, { reviewNeeded: true })]), [true, true]);
    await Promise.all([
        a.get(key).save(latest => ({ ...latest, readings: { ...latest.readings, 'READ-1': { readAt: '2026-10-09T10:00:00.000Z' } } })),
        c.get(key).save(latest => ({ ...latest, writing: { ...latest.writing, 'WRITE-1': { ...core.emptyWriting(), text: 'The class stores data.' } } })),
    ]);
    const saved = parse(JSON.parse(b.storage.get(key)));
    assert.equal(saved.terms[term].sentence, 'The class stores data.'); assert.equal(saved.terms[term].reviewNeeded, true);
    assert.ok(saved.readings['READ-1'].readAt); assert.ok(saved.writing['WRITE-1'].text);
    a.storageEvent(key); assert.deepEqual(JSON.parse(JSON.stringify(a.get(key).value)), saved);
});
test('queued English typing is visible immediately while backup waits for every successful write', async () => {
    const b = browser(), a = tab(b), key = localKey('english', null), release = await hold(b, key);
    const oldHandler = a.get(key), first = write(a, key, { sentence: 'T' }), second = write(a, key, { sentence: 'The class stores data.' });
    assert.equal(a.get(key).value.terms[term].sentence, 'The class stores data.');
    assert.equal(a.get(key).saving, true); assert.equal(oldHandler.backup(), null);
    await release(); await first;
    assert.equal(a.get(key).value.terms[term].sentence, 'The class stores data.');
    await second;
    assert.equal(a.get(key).saving, false); assert.equal(parse(JSON.parse(oldHandler.backup())).terms[term].sentence, 'The class stores data.');
});
test('English import validates before writing and refuses a preview after another tab changed storage', async () => {
    const b = browser(), a = tab(b), c = tab(b), key = localKey('english', null);
    await write(a, key, { sentence: 'Original sentence.' });
    const baseline = a.get(key).raw(), imported = parse(JSON.parse(baseline)); imported.terms[term].sentence = 'Imported sentence.';
    const release = await hold(b, key);
    const newer = write(c, key, { sentence: 'Newer sentence.' });
    const restore = a.get(key).restore(imported, baseline);
    await release(); assert.equal(await newer, true); assert.equal(await restore, false);
    assert.match(a.get(key).error, /thay đổi/); assert.equal(parse(JSON.parse(b.storage.get(key))).terms[term].sentence, 'Newer sentence.');
    assert.equal(await a.get(key).restore({ ...empty, version: 2 }, a.get(key).raw()), false);
    assert.equal(parse(JSON.parse(b.storage.get(key))).terms[term].sentence, 'Newer sentence.');
    assert.equal(await a.get(key).restore(imported, a.get(key).raw()), true);
    assert.equal(tab(b).get(key).value.terms[term].sentence, 'Imported sentence.');
});
test('failed English writes never report saved optimistic values, corrupt bytes remain exportable', async () => {
    const b = browser(), a = tab(b), key = localKey('english', null);
    await write(a, key, { sentence: 'Saved sentence.' }); const before = b.storage.get(key);
    b.fail = true; assert.equal(await write(a, key, { sentence: 'Unsaved edit.' }), false);
    assert.ok(a.get(key).error); assert.equal(a.get(key).saving, false); assert.equal(a.get(key).backup(), before);
    b.fail = false; b.storage.set(key, '{corrupt'); a.storageEvent(key);
    assert.equal(a.get(key).blocked, true); assert.equal(a.get(key).backup(), '{corrupt');
    assert.equal(await write(a, key, { sentence: 'Overwrite?' }), false); assert.equal(b.storage.get(key), '{corrupt');
});
test('unsupported Web Locks refuses unsafe English writes without losing existing data', async () => {
    const b = browser(); b.storage.set(localKey('english', null), JSON.stringify(empty)); b.locks = undefined;
    const a = tab(b), key = localKey('english', null);
    assert.equal(await write(a, key, { sentence: 'Cannot persist.' }), false);
    assert.match(a.get(key).error, /khóa ghi/); assert.equal(a.get(key).backup(), JSON.stringify(empty));
});
