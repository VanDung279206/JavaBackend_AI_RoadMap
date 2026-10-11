import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileEnglish } from './english-content.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replaceAll('\r\n', '\n');
const data = compileEnglish(read, JSON.parse(read('learning/catalogue.json')));
const output = JSON.stringify(data, null, 2) + '\n';
const target = path.join(root, 'website/src/generated/english.json');
if (process.argv.includes('--check')) {
    if (!fs.existsSync(target) || read('website/src/generated/english.json') !== output) throw Error('Stale English catalogue');
} else fs.writeFileSync(target, output);
console.log(`PASS English: ${data.terms.length} terms, ${data.readings.length} readings, ${data.errors.length} error fixtures, ${data.exercises.length} practices`);
