import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {getEventListeners} from 'node:events';
const require=createRequire(import.meta.url),ts=require('typescript');
const code=ts.transpileModule(readFileSync('src/lib/project-request.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
function harness(){
 const timers=new Map(),module={exports:{}};
 runInNewContext(code,{module,exports:module.exports,AbortController,setTimeout(fn,delay){assert.equal(delay,15000);const token=Symbol();timers.set(token,fn);return token;},clearTimeout(token){timers.delete(token);}});
 return {run:module.exports.projectRequest,timers,expire(){for(const fn of timers.values())fn();}};
}
test('a project deadline releases the caller even when SDK authentication ignores the fetch signal',async()=>{
 const h=harness(),parent=new AbortController();let signal,finish;
 const pending=h.run(parent.signal,value=>{signal=value;return new Promise(resolve=>{finish=resolve;});});
 h.expire();await assert.rejects(pending,/timed out/);assert.equal(signal.aborted,true);
 assert.equal(h.timers.size,0);assert.equal(getEventListeners(parent.signal,'abort').length,0);
 finish('late SDK response');await Promise.resolve();
});
test('unmount cancels both the operation and the wait without relying on SDK cooperation',async()=>{
 const h=harness(),parent=new AbortController();let signal;
 const pending=h.run(parent.signal,value=>{signal=value;return new Promise(()=>{});});
 parent.abort();await assert.rejects(pending,/cancelled/);assert.equal(signal.aborted,true);assert.equal(h.timers.size,0);
 assert.equal(getEventListeners(parent.signal,'abort').length,0);
});
test('already cancelled lifetimes never start an SDK request',async()=>{
 const h=harness(),parent=new AbortController();parent.abort();let calls=0;
 await assert.rejects(h.run(parent.signal,()=>{calls++;return Promise.resolve();}),/cancelled/);
 assert.equal(calls,0);assert.equal(h.timers.size,0);
});
test('successful requests and SDK errors clean up deadline timers and abort listeners',async()=>{
 for(const fails of [false,true]){
  const h=harness(),parent=new AbortController();const operation=h.run(parent.signal,()=>fails?Promise.reject(Error('network')):Promise.resolve('acknowledged'));
  if(fails)await assert.rejects(operation,/network/);else assert.equal(await operation,'acknowledged');
  assert.equal(h.timers.size,0);assert.equal(getEventListeners(parent.signal,'abort').length,0);
 }
});
