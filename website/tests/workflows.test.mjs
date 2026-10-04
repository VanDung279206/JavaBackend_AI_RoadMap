import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createRequire} from 'node:module';
// js-yaml is already installed by the locked ESLint dependency.
const {load}=createRequire(import.meta.url)('js-yaml');
test('all GitHub workflows parse as YAML and contain valid action steps',()=>{
 for(const name of readdirSync('../.github/workflows').filter(n=>/\.ya?ml$/.test(n))){
  const workflow=load(readFileSync('../.github/workflows/'+name,'utf8'));
  assert.ok(workflow.on,name+' needs triggers');
  assert.ok(workflow.jobs,name+' needs jobs');
  for(const job of Object.values(workflow.jobs)){
   assert.ok(Array.isArray(job.steps),name+' needs steps');
   for(const step of job.steps)assert.notEqual(Boolean(step.run),Boolean(step.uses),name+' step needs run or uses');
  }
 }
});
