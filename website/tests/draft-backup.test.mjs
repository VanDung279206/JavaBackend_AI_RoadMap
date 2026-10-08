import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url), ts = require('typescript');
const { emptyProject, parseProject } = require('../.test-dist/project-core.js');
const code = ts.transpileModule(readFileSync('src/components/DraftBackup.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
function importer() {
    const states = [], controls = [], calls = [], module = { exports: {} };
    let index = 0, succeed = true;
    const store = { ready: true, saving: false, blocked: false, raw: () => 'original bytes', async restore(...args) { calls.push(args); return succeed; } };
    runInNewContext(code, {
        module, exports: module.exports,
        require(name) {
            if (name === 'react') return { useState(initial) {
                const slot = index++;
                if (!(slot in states)) states[slot] = initial;
                return [states[slot], next => { states[slot] = typeof next === 'function' ? next(states[slot]) : next; }];
            } };
            assert.equal(name, 'react/jsx-runtime');
            const runtime = require(name);
            return { ...runtime, ...Object.fromEntries(['jsx', 'jsxs'].map(method => [method, (type, props, key) => {
                if (type === 'input' || type === 'button') controls.push({ type, ...props });
                return runtime[method](type, props, key);
            }])) };
        },
    });
    function render() {
        index = 0; controls.length = 0;
        const html = require('react-dom/server').renderToStaticMarkup(require('react').createElement(module.exports.default, {
            store, parse: parseProject, describe: value => `Dự án: ${value.name}`, maxBytes: 1000, policy: 'Thay thế dự án hiện tại.',
        }));
        return { html, file: controls.find(item => item.type === 'file'), apply: controls.find(item => item.children === 'Áp dụng bản lưu đã chọn'), cancel: controls.find(item => item.children === 'Hủy nhập') };
    }
    return { store, calls, render, fail() { succeed = false; } };
}
const fileEvent = file => ({ target: { files: [file], value: 'fake-path' } });
const validFile = () => ({ name: 'my-project-backup.json', size: 900, text: async () => JSON.stringify({ ...emptyProject(), name: 'Imported project' }) });

test('import previews validated content, can cancel, and only applies on explicit selection', async () => {
    const h = importer(), event = fileEvent(validFile());
    await h.render().file.onChange(event);
    assert.equal(event.target.value, '');
    assert.match(h.render().html, /Imported project/);
    assert.equal(h.calls.length, 0);
    h.render().cancel.onClick();
    assert.equal(h.render().apply, undefined); assert.equal(h.calls.length, 0);
    await h.render().file.onChange(fileEvent(validFile()));
    await h.render().apply.onClick();
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0][0].name, 'Imported project');
    assert.equal(h.calls[0][1], 'original bytes');
    assert.equal(h.render().apply, undefined);
    assert.match(h.render().html, /Đã nhập và lưu/);
});

test('invalid JSON, wrong schema, unreadable and oversized files never mutate the draft', async () => {
    const h = importer();
    for (const text of [async () => '{broken', async () => '{}', async () => { throw Error('cannot read'); }]) {
        await h.render().file.onChange(fileEvent({ name: 'bad.json', size: 50, text }));
        assert.equal(h.render().apply, undefined);
        assert.match(h.render().html, /Dữ liệu hiện tại được giữ nguyên/);
    }
    await h.render().file.onChange(fileEvent({ name: 'large.json', size: 1001, text() { assert.fail('Oversized file must not be read'); } }));
    assert.equal(h.calls.length, 0);
});

test('import is disabled while saving or blocked and keeps a failed preview for retry', async () => {
    const h = importer();
    for (const field of ['saving', 'blocked']) {
        h.store[field] = true;
        const view = h.render(); assert.equal(view.file.disabled, true);
        await view.file.onChange(fileEvent(validFile()));
        assert.equal(h.render().apply, undefined);
        h.store[field] = false;
    }
    await h.render().file.onChange(fileEvent(validFile()));
    h.fail(); await h.render().apply.onClick();
    assert.ok(h.render().apply);
    assert.match(h.render().html, /Chưa nhập được/);
});
