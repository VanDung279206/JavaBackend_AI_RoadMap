import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const ts = createRequire(import.meta.url)('typescript');
const compiled = ts.transpileModule(readFileSync('src/lib/download.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
test('Markdown export clicks a UTF-8 file with the edited text and releases its object URL', async () => {
    const module = { exports: {} }, events = [];
    let blob, timer;
    const link = { click() { events.push(['click', this.download, this.href]); }, remove() { events.push(['remove']); } };
    runInNewContext(compiled, {
        module, exports: module.exports, Blob,
        URL: { createObjectURL(value) { blob = value; return 'blob:project'; }, revokeObjectURL(url) { events.push(['revoke', url]); } },
        document: { createElement(tag) { assert.equal(tag, 'a'); return link; }, body: { appendChild(value) { assert.equal(value, link); } } },
        window: { setTimeout(fn) { timer = fn; } },
    });
    const edited = '# Dự án\n\nĐặt lịch không được trùng thời gian.\n';
    module.exports.downloadText('my-project.md', edited);
    assert.equal(await blob.text(), edited);
    assert.equal(blob.type, 'text/markdown;charset=utf-8');
    assert.deepEqual(events, [['click', 'my-project.md', 'blob:project'], ['remove']]);
    timer(); assert.deepEqual(events.at(-1), ['revoke', 'blob:project']);
});
