import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileEnglish, validateEnglish } from '../../scripts/english-content.mjs';
const read = file => readFileSync(new URL('../../' + file, import.meta.url), 'utf8').replaceAll('\r\n', '\n');
const learning = JSON.parse(read('learning/catalogue.json'));
const published = JSON.parse(read('website/src/generated/english.json'));
test('website catalogue exactly matches Markdown, authored curriculum and observed fixture output', () => {
    assert.deepEqual(compileEnglish(read, learning), published);
    const observed = JSON.parse(read('english/observed-errors.json'));
    for (const error of published.errors) assert.equal(error.output, observed.find(e => e.id === error.id).output);
    const edited = compileEnglish(file => file === 'english/GLOSSARY.md' ? read(file).replace('This method returns a list.', 'This method returns an empty list.') : read(file), learning);
    assert.notDeepEqual(edited, published, 'source edits must invalidate the generated catalogue');
});
test('six phases have a reading, three different practice objectives and a coding application; DSA remains available', () => {
    assert.equal(published.terms.length, 72); assert.equal(published.errors.length, 8);
    for (const unit of published.units.filter(u => u.number)) {
        const practices = published.exercises.filter(e => e.phase === unit.phase && e.section === 'practice');
        assert.ok(published.readings.some(r => r.phase === unit.phase));
        assert.ok(new Set(practices.map(e => e.kind)).size >= 3);
        assert.ok(new Set(practices.map(e => e.level)).size >= 3);
        assert.ok(unit.exerciseIds.every(id => learning.exercises[id]));
    }
    assert.equal(published.terms.filter(t => t.phase === 'dsa').length, 12);
    for (const term of published.terms) assert.ok(published.exercises.some(e => e.id === `FILL-${term.id}`));
    for (const error of published.errors) assert.equal(published.exercises.filter(e => e.id === `ERROR-${error.id}` || e.id.startsWith(`ERROR-${error.id}-`)).length, 4);
    assert.equal(published.guides.length, 4);
    assert.ok(published.guides.some(g => g.markdown.includes('provided that')));
    assert.ok(published.guides.some(g => g.markdown.includes('Verification: command')));
});
test('authored error questions must quote a type and diagnostic present in the observed fixture', () => {
    const curriculum = JSON.parse(read('english/curriculum.json'));
    curriculum.errors[3].type = 'java.lang.IllegalStateException';
    assert.throws(() => compileEnglish(file => file === 'english/curriculum.json' ? JSON.stringify(curriculum) : read(file), learning), /contradicts observed log E04/);
});
test('registered term IDs survive wording edits and unregistered terms cannot silently create a new ID', () => {
    const curriculum = JSON.parse(read('english/curriculum.json'));
    const id = curriculum.termIds['01_Java:class'];
    curriculum.termIds['01_Java:Java class'] = id;
    delete curriculum.termIds['01_Java:class'];
    const edited = file => file === 'english/GLOSSARY.md' ? read(file).replace('| class |', '| Java class |') : read(file);
    assert.throws(() => compileEnglish(edited, learning), /Register a stable term ID/);
    const data = compileEnglish(file => file === 'english/curriculum.json' ? JSON.stringify(curriculum) : edited(file), learning);
    assert.equal(data.terms[0].id, id);
    assert.equal(data.terms[0].term, 'Java class');
});
test('validator rejects duplicate IDs, orphan links, empty content and unusable answer keys', () => {
    const reject = mutate => { const data = structuredClone(published); mutate(data); assert.throws(() => validateEnglish(data, learning)); };
    reject(d => d.terms.push(d.terms[0]));
    reject(d => d.terms[0].phase = 'unknown');
    reject(d => d.units[0].exerciseIds.push('MISSING'));
    reject(d => d.errors[0].exerciseIds.push('MISSING'));
    reject(d => d.exercises[0].termId = 'MISSING');
    reject(d => d.exercises.find(e => e.kind === 'choice').answers = ['MISSING']);
    reject(d => d.exercises.find(e => e.kind === 'reorder').tokens = ['wrong']);
    reject(d => d.readings[0].translation = '');
    reject(d => d.errors[0].output = '');
    reject(d => d.writers[0].model = '');
    reject(d => d.pairs[0].example = '');
    reject(d => d.units[0].phase = d.units[1].phase);
});
