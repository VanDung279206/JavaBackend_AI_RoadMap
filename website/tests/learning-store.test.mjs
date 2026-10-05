import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';

const require=createRequire(import.meta.url);
const ts=require('typescript');
const core=require('../.test-dist/progress-core.js');
const catalogue=JSON.parse(readFileSync('src/generated/catalogue.json','utf8'));
// Execute the production store, with only browser/React/Supabase adapters replaced.
const compiled=ts.transpileModule(readFileSync('src/lib/learning-store.ts','utf8'),{
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}
}).outputText;
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function until(predicate){
 for(let i=0;i<30;i++){if(predicate())return;await tick();}
 assert.ok(predicate(),'store did not reach the expected state');
}
function harness(remoteIds=[]){
 const storage=new Map(),calls=[],observations=[];
 let authChange,getSnapshot,subscribed=false;
 const module={exports:{}};
 const rows=remoteIds.map(id=>({exercise_id:id,phase:'00_setup',...core.emptyEntry(),revision:3}));
 const supabase={
  auth:{onAuthStateChange(fn){authChange=fn;},getSession:async()=>({data:{session:{user:{id:'account-a'}}},error:null})},
  from(table){
   let owner;
   const query={select(){return this;},eq(key,value){if(key==='user_id')owner=value;return this;},not(){return this;},
    then(resolve,reject){return Promise.resolve({data:table==='progress'&&owner==='account-a'?rows:[],error:null}).then(resolve,reject);}};
   return query;
  },
  rpc(name,args){
   assert.equal(name,'save_learning_progress');
   return new Promise(resolve=>calls.push({args,resolve}));
  }
 };
 runInNewContext(compiled,{
  module,exports:module.exports,queueMicrotask,
  localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
  window:{addEventListener(){}},
  require(name){
   if(name==='react')return {
    useEffect(fn){fn();},useSyncExternalStore(subscribe,get){
     getSnapshot=get;
     if(!subscribed){subscribed=true;subscribe(()=>observations.push(getSnapshot()));}
     return get();
    }
   };
   if(name==='@/generated/catalogue.json')return catalogue;
   if(name==='./supabase')return {supabase};
   if(name==='./progress-core')return core;
   throw Error('Unexpected dependency '+name);
  }
 });
 const store=module.exports;
 store.useLearning();
 return {store,calls,observations,storage,state:()=>getSnapshot(),
  answer(index,error=null){const call=calls[index];call.resolve({data:{revision:call.args.p_revision+1},error});},
  account(owner){authChange('SIGNED_IN',{user:{id:owner}});}
 };
}
async function ready(h){await until(()=>!h.state().loading);}
function assertNoFalseCompletion(h){
 for(const state of h.observations){
  if(state.message==='Đã đồng bộ với máy chủ.')assert.ok(!Object.values(state.entries).some(e=>e.pending),'completion was reported with pending entries');
 }
}
for(const existing of [false,true])test(`sync drains another exercise edited during an RPC (${existing?'already clean':'new ID'})`,async()=>{
 const h=harness(existing?['P0.1','P0.2']:[]);await ready(h);
 h.store.updateEntry('P0.1',{status:'in_progress'});
 await until(()=>h.calls.length===1);
 h.store.updateEntry('P0.2',{status:'needs_review'});
 h.answer(0);
 await until(()=>h.calls.length===2);
 assert.deepEqual(h.calls.map(c=>c.args.p_exercise_id),['P0.1','P0.2']);
 assert.equal(h.state().entries['P0.2'].pending,true);
 assert.notEqual(h.state().message,'Đã đồng bộ với máy chủ.');
 h.answer(1);await until(()=>!h.state().entries['P0.2'].pending);
 assert.equal(JSON.parse(h.storage.get(core.storageKey('account-a')))['P0.2'].pending,false);
 assertNoFalseCompletion(h);
});
test('an edit to the in-flight exercise keeps its new content and advances revision',async()=>{
 const h=harness();await ready(h);h.store.updateEntry('P0.1',{status:'in_progress'});
 h.store.updateEntry('P0.1',{status:'needs_review'});h.answer(0);
 await until(()=>h.calls.length===2);
 assert.equal(h.calls[1].args.p_status,'needs_review');assert.equal(h.calls[1].args.p_revision,1);
 h.answer(1);await until(()=>!h.state().entries['P0.1'].pending);
 assert.equal(h.state().entries['P0.1'].status,'needs_review');assert.equal(h.state().entries['P0.1'].revision,2);
 assertNoFalseCompletion(h);
});
test('RPC failure stops automatic retry and a later manual sync drains both entries',async()=>{
 const h=harness();await ready(h);h.store.updateEntry('P0.1',{status:'in_progress'});
 h.store.updateEntry('P0.2',{status:'needs_review'});h.answer(0,{message:'Network unavailable'});
 await tick();await tick();assert.equal(h.calls.length,1);
 const retry=h.store.sync();await until(()=>h.calls.length===2);h.answer(1);
 await until(()=>h.calls.length===3);h.answer(2);await retry;
 assert.ok(Object.values(h.state().entries).every(e=>!e.pending));assertNoFalseCompletion(h);
});
test('a progress conflict stays pending without a retry loop or a completion message',async()=>{
 const h=harness();await ready(h);h.store.updateEntry('P0.1',{status:'in_progress'});
 h.answer(0,{message:'PROGRESS_CONFLICT'});await tick();await tick();
 assert.equal(h.calls.length,1);assert.equal(h.state().entries['P0.1'].conflict,true);
 assert.equal(h.state().entries['P0.1'].pending,true);assertNoFalseCompletion(h);
});
test('switching account during an RPC never sends the old queue as the new owner',async()=>{
 const h=harness();await ready(h);h.store.updateEntry('P0.1',{status:'in_progress'});
 h.store.updateEntry('P0.2',{status:'needs_review'});h.account('account-b');
 await ready(h);h.answer(0);await tick();await tick();
 assert.equal(h.calls.length,1);assert.equal(h.state().owner,'account-b');
 assert.equal(Object.keys(h.state().entries).length,0);
 assert.equal(JSON.parse(h.storage.get(core.storageKey('account-a')))['P0.2'].pending,true);
});
