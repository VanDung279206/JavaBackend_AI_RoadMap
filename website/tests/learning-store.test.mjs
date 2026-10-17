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
function sharedLocks(){
 const queues=new Map();
 return {request(name,options,action){
  const previous=queues.get(name)??Promise.resolve(),signal=options.signal;
  const queued=previous.catch(()=>{}).then(()=>{if(signal?.aborted)throw Error('cancelled');return action();});
  queues.set(name,queued.catch(()=>{}));
  if(!signal)return queued;
  let cancel;const stopped=new Promise((_,reject)=>{cancel=()=>reject(Error('cancelled'));signal.addEventListener('abort',cancel,{once:true});if(signal.aborted)cancel();});
  return Promise.race([queued,stopped]).finally(()=>signal.removeEventListener('abort',cancel));
 }};
}
async function hold(locks,name){let release,entered;const acquired=new Promise(resolve=>{entered=resolve;});const finished=locks.request(name,{mode:'exclusive'},()=>{entered();return new Promise(resolve=>{release=resolve;});});await acquired;return async()=>{release();await finished;};}
function harness(remoteIds=[], options={}){
 const storage=options.storage??new Map(),calls=[],observations=[],handlers=new Map();
 let authChange,getSnapshot,subscribed=false;
 const module={exports:{}};
 const locks=options.locks??sharedLocks();
 const rows=remoteIds.map(id=>({exercise_id:id,phase:'00_setup',...core.emptyEntry(),revision:3}));
 const supabase={
  auth:{onAuthStateChange(fn){authChange=fn;},getSession:async()=>({data:{session:{user:{id:'account-a'}}},error:null})},
  from(table){
   let owner;
   const query={abortSignal(){return this;},select(){return this;},maybeSingle(){return options.single?options.single():Promise.resolve({data:null,error:null});},eq(key,value){if(key==='user_id')owner=value;return this;},not(){return this;},
    then(resolve,reject){return (table==='progress' && options.progress ? options.progress() : Promise.resolve({data:table==='progress'&&owner==='account-a'?rows:[],error:null})).then(resolve,reject);}};
   return query;
  },
  rpc(name,args){
   assert.equal(name,'save_learning_progress');
   const response=new Promise(resolve=>calls.push({args,resolve}));response.abortSignal=()=>response;return response;
  }
 };
 runInNewContext(compiled,{
  module,exports:module.exports,queueMicrotask,AbortController,
  navigator:{locks:options.noLocks?undefined:locks},
  localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
  window:{addEventListener(name,fn){handlers.set(name,fn);}},
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
   if(name==='./project-request')return require('../.test-dist/project-request.js');
   throw Error('Unexpected dependency '+name);
  }
 });
 const store=module.exports;
 store.useLearning();
 return {store,calls,observations,storage,locks,state:()=>getSnapshot(),
  event(name,event){handlers.get(name)?.(event);},
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
 await h.store.updateEntry('P0.1',{status:'in_progress'});
 await until(()=>h.calls.length===1);
 await h.store.updateEntry('P0.2',{status:'needs_review'});
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
 const h=harness();await ready(h);await h.store.updateEntry('P0.1',{status:'in_progress'});
 await h.store.updateEntry('P0.1',{status:'needs_review'});h.answer(0);
 await until(()=>h.calls.length===2);
 assert.equal(h.calls[1].args.p_status,'needs_review');assert.equal(h.calls[1].args.p_revision,1);
 h.answer(1);await until(()=>!h.state().entries['P0.1'].pending);
 assert.equal(h.state().entries['P0.1'].status,'needs_review');assert.equal(h.state().entries['P0.1'].revision,2);
 assertNoFalseCompletion(h);
});
test('RPC failure stops automatic retry and a later manual sync drains both entries',async()=>{
 const h=harness();await ready(h);await h.store.updateEntry('P0.1',{status:'in_progress'});
 await h.store.updateEntry('P0.2',{status:'needs_review'});h.answer(0,{message:'Network unavailable'});
 await tick();await tick();assert.equal(h.calls.length,1);
 const retry=h.store.sync();await until(()=>h.calls.length===2);h.answer(1);
 await until(()=>h.calls.length===3);h.answer(2);await retry;
 assert.ok(Object.values(h.state().entries).every(e=>!e.pending));assertNoFalseCompletion(h);
});
test('a progress conflict stays pending without a retry loop or a completion message',async()=>{
 const h=harness();await ready(h);await h.store.updateEntry('P0.1',{status:'in_progress'});
 h.answer(0,{message:'PROGRESS_CONFLICT'});await tick();await tick();
 assert.equal(h.calls.length,1);assert.equal(h.state().entries['P0.1'].conflict,true);
 assert.equal(h.state().entries['P0.1'].pending,true);assertNoFalseCompletion(h);
});
test('switching account during an RPC never sends the old queue as the new owner',async()=>{
 const h=harness();await ready(h);await h.store.updateEntry('P0.1',{status:'in_progress'});
 await h.store.updateEntry('P0.2',{status:'needs_review'});h.account('account-b');
 await ready(h);h.answer(0);await tick();await tick();
 assert.equal(h.calls.length,1);assert.equal(h.state().owner,'account-b');
 assert.equal(Object.keys(h.state().entries).length,0);
 assert.equal(JSON.parse(h.storage.get(core.storageKey('account-a')))['P0.2'].pending,true);
});


test('a remote reload preserves a draft written by another tab while the request is in flight', async () => {
 let finish;
 const h=harness([], {progress:()=>new Promise(resolve=>{finish=resolve;})});
 await until(()=>Boolean(finish));
 const key=core.storageKey('account-a');
 h.storage.set(key,JSON.stringify({'P0.1':{...core.emptyEntry(),status:'needs_review',pending:true}}));
 // The other tab's storage event has not been delivered yet.
 finish({data:[],error:null});
 await ready(h);
 assert.equal(h.state().entries['P0.1']?.status,'needs_review');
 assert.equal(JSON.parse(h.storage.get(key))['P0.1']?.status,'needs_review');
 await until(()=>h.calls.length===1);h.answer(0);
 await until(()=>!h.state().entries['P0.1'].pending);
});

test('a corrupt draft appearing during remote load is preserved and blocks subsequent writes', async () => {
 let finish;
 const h=harness([], {progress:()=>new Promise(resolve=>{finish=resolve;})});
 await until(()=>Boolean(finish));
 const key=core.storageKey('account-a');h.storage.set(key,'{broken');
 finish({data:[],error:null});await ready(h);
 assert.equal(h.storage.get(key),'{broken');
 assert.equal(await h.store.updateEntry('P0.1',{status:'in_progress'}),false);
 assert.equal(h.calls.length,0);
});

for (const response of ['success', 'conflict']) test(`an RPC ${response} preserves a different exercise edited in another tab before its storage event`, async () => {
 const h=harness();await ready(h);await h.store.updateEntry('P0.1',{status:'in_progress'});
 const key=core.storageKey('account-a'),entries=JSON.parse(h.storage.get(key));
 entries['P0.2']={...core.emptyEntry(),status:'needs_review',pending:true};
 h.storage.set(key,JSON.stringify(entries));
 h.answer(0,response==='conflict'?{message:'PROGRESS_CONFLICT'}:null);
 await until(()=>response==='conflict'?h.state().entries['P0.1'].conflict:h.calls.length===2);
 assert.equal(JSON.parse(h.storage.get(key))['P0.2']?.status,'needs_review');
 assert.equal(h.state().entries['P0.2']?.status,'needs_review');
 if(response==='success'){assert.equal(h.calls[1].args.p_exercise_id,'P0.2');h.answer(1);await until(()=>!h.state().entries['P0.2'].pending);}
});

test('an RPC acknowledgement rebases an unseen edit to the same exercise instead of clearing it', async () => {
 const h=harness();await ready(h);await h.store.updateEntry('P0.1',{status:'in_progress'});
 const key=core.storageKey('account-a'),entries=JSON.parse(h.storage.get(key));
 entries['P0.1'].status='needs_review';h.storage.set(key,JSON.stringify(entries));h.answer(0);
 await until(()=>h.calls.length===2);
 assert.equal(h.calls[1].args.p_status,'needs_review');assert.equal(h.calls[1].args.p_revision,1);
 h.answer(1);await until(()=>!h.state().entries['P0.1'].pending);
 assert.equal(JSON.parse(h.storage.get(key))['P0.1'].status,'needs_review');
});

for (const response of ['success', 'conflict']) test(`an old RPC ${response} cannot downgrade a newer revision saved by another tab`, async () => {
 const h=harness();await ready(h);await h.store.updateEntry('P0.1',{status:'in_progress'});
 const key=core.storageKey('account-a'),entries=JSON.parse(h.storage.get(key));
 entries['P0.1']={...entries['P0.1'],status:'self_completed',revision:5,pending:false,conflict:false};
 const raw=JSON.stringify(entries);h.storage.set(key,raw);h.answer(0,response==='conflict'?{message:'PROGRESS_CONFLICT'}:null);
 await until(()=>h.state().entries['P0.1'].revision===5);
 assert.equal(h.storage.get(key),raw);assert.equal(h.state().entries['P0.1'].pending,false);
 assert.equal(h.state().entries['P0.1'].conflict,false);assert.equal(h.calls.length,1);
});

for(const raw of ['{broken',''])test(`an RPC acknowledgement preserves corrupt storage (${JSON.stringify(raw)}) and blocks further writes`,async()=>{
 const h=harness();await ready(h);await h.store.updateEntry('P0.1',{status:'in_progress'});
 const key=core.storageKey('account-a');h.storage.set(key,raw);h.answer(0);await tick();await tick();
 assert.equal(h.storage.get(key),raw);assert.equal(await h.store.updateEntry('P0.2',{status:'needs_review'}),false);
 assert.equal(h.calls.length,1);
});

for(const keepLocal of [true,false])test(`conflict resolution (${keepLocal?'local':'remote'}) keeps a same-exercise edit made while fetching`,async()=>{
 let finish;const h=harness([],{single:()=>new Promise(resolve=>{finish=resolve;})});
 await ready(h);await h.store.updateEntry('P0.1',{status:'in_progress'});h.answer(0,{message:'PROGRESS_CONFLICT'});
 await until(()=>h.state().entries['P0.1'].conflict);
 const selection=h.store.resolveConflict('P0.1',keepLocal),key=core.storageKey('account-a');
 const entries=JSON.parse(h.storage.get(key));entries['P0.1'].status='needs_review';
 const raw=JSON.stringify(entries);h.storage.set(key,raw);
 finish({data:{...core.emptyEntry(),revision:3,status:'self_completed'},error:null});await selection;
 assert.equal(h.storage.get(key),raw);assert.equal(h.state().entries['P0.1'].status,'needs_review');
 assert.match(h.state().message,/đã thay đổi/);assert.equal(h.calls.length,1);
});

test('conflict resolution merges its selection into other exercises freshly saved by another tab',async()=>{
 let finish;const h=harness([],{single:()=>new Promise(resolve=>{finish=resolve;})});
 await ready(h);await h.store.updateEntry('P0.1',{status:'in_progress'});h.answer(0,{message:'PROGRESS_CONFLICT'});
 await until(()=>h.state().entries['P0.1'].conflict);
 const selection=h.store.resolveConflict('P0.1',false),key=core.storageKey('account-a');
 const entries=JSON.parse(h.storage.get(key));entries['P0.2']={...core.emptyEntry(),status:'needs_review',pending:true};
 h.storage.set(key,JSON.stringify(entries));finish({data:{...core.emptyEntry(),revision:3,status:'self_completed'},error:null});await selection;
 assert.equal(JSON.parse(h.storage.get(key))['P0.2']?.status,'needs_review');
 await until(()=>h.calls.length===2);h.answer(1);await until(()=>!h.state().entries['P0.2'].pending);
 assert.equal(h.state().entries['P0.1'].revision,3);
});

test('an old RPC acknowledgement never recreates an entry removed in another tab',async()=>{
 const h=harness();await ready(h);await h.store.updateEntry('P0.1',{status:'in_progress'});
 const key=core.storageKey('account-a');h.storage.set(key,'{}');h.answer(0);await tick();await tick();
 assert.equal(h.storage.get(key),'{}');assert.equal(h.state().entries['P0.1'],undefined);assert.equal(h.calls.length,1);
});

test('an invalid server acknowledgement cannot mark progress as synchronized',async()=>{
 for(const data of [null,{revision:0},{revision:5},{revision:1.5}]){
  const h=harness();await ready(h);await h.store.updateEntry('P0.1',{status:'in_progress'});
  const key=core.storageKey('account-a'),raw=h.storage.get(key);h.calls[0].resolve({data,error:null});await tick();await tick();
  assert.equal(h.storage.get(key),raw);assert.equal(h.state().entries['P0.1'].pending,true);assertNoFalseCompletion(h);assert.equal(h.calls.length,1);
 }
});

test('a rejected conflict lookup and an invalid remote row leave persisted progress unchanged',async()=>{
 for(const lookup of [()=>Promise.reject(Error('offline')),()=>Promise.resolve({data:{revision:3},error:null})]){
  const h=harness([],{single:lookup});await ready(h);await h.store.updateEntry('P0.1',{status:'in_progress'});
  h.answer(0,{message:'PROGRESS_CONFLICT'});await until(()=>h.state().entries['P0.1'].conflict);
  const key=core.storageKey('account-a'),raw=h.storage.get(key);
  await h.store.resolveConflict('P0.1',false);assert.equal(h.storage.get(key),raw);assert.equal(h.calls.length,1);
 }
});

test('corrupt storage discovered while resolving a conflict remains intact and blocks writes',async()=>{
 let finish;const h=harness([],{single:()=>new Promise(resolve=>{finish=resolve;})});await ready(h);
 await h.store.updateEntry('P0.1',{status:'in_progress'});h.answer(0,{message:'PROGRESS_CONFLICT'});
 await until(()=>h.state().entries['P0.1'].conflict);
 const selection=h.store.resolveConflict('P0.1',false),key=core.storageKey('account-a');h.storage.set(key,'{broken');
 finish({data:{...core.emptyEntry(),revision:3},error:null});await selection;
 assert.equal(h.storage.get(key),'{broken');assert.equal(await h.store.updateEntry('P0.2',{status:'needs_review'}),false);
});

test('a local status change keeps unseen fields and other exercises from the persisted queue',async()=>{
 const h=harness();await ready(h);const key=core.storageKey('account-a');
 const entries={'P0.1':{...core.emptyEntry(),revision:4,hint_level:3,error_tags:['validation']},'P0.2':{...core.emptyEntry(),status:'self_completed',revision:2}};
 h.storage.set(key,JSON.stringify(entries));
 assert.equal(await h.store.updateEntry('P0.1',{status:'needs_review',hint_level:1}),true);
 const saved=JSON.parse(h.storage.get(key));assert.equal(saved['P0.1'].revision,4);assert.equal(saved['P0.1'].hint_level,3);
 assert.deepEqual(saved['P0.1'].error_tags,['validation']);assert.equal(saved['P0.2'].status,'self_completed');
 h.answer(0);await until(()=>!h.state().entries['P0.1'].pending);
});

for(const kind of ['guest','review'])test(`${kind} import preserves account progress not yet delivered by a storage event`,async()=>{
 const h=harness();await ready(h);const key=core.storageKey('account-a');
 h.storage.set(key,JSON.stringify({'P0.1':{...core.emptyEntry(),status:'self_completed',revision:4}}));
 const imported={'P0.1':{...core.emptyEntry(),status:'needs_review'},'P0.2':{...core.emptyEntry(),status:'in_progress'}};
 if(kind==='guest'){h.storage.set(core.storageKey(null),JSON.stringify(imported));await h.store.importGuestProgress();}
 else assert.equal(await h.store.importReviewProgress(imported,'account-a','original review file'),true);
 const saved=JSON.parse(h.storage.get(key));assert.equal(saved['P0.1'].status,'self_completed');assert.equal(saved['P0.1'].revision,4);
 assert.equal(saved['P0.2'].status,'in_progress');h.answer(0);await until(()=>!h.state().entries['P0.2'].pending);
});

test('native-style write lock queues independent tab edits and rereads after acquisition',async()=>{
 const storage=new Map(),locks=sharedLocks(),a=harness([],{storage,locks}),b=harness([],{storage,locks});await ready(a);await ready(b);
 const key=core.storageKey('account-a'),release=await hold(locks,`progress:${key}`);
 const first=a.store.updateEntry('P0.1',{status:'needs_review'}),second=b.store.updateEntry('P0.2',{status:'in_progress'});
 try{assert.equal(a.state().saving,true);assert.equal(b.state().saving,true);assert.equal(storage.has(key),true);assert.deepEqual(JSON.parse(storage.get(key)),{});}
 finally{await release();}
 assert.deepEqual(await Promise.all([first,second]),[true,true]);
 const saved=JSON.parse(storage.get(key));assert.equal(saved['P0.1'].status,'needs_review');assert.equal(saved['P0.2'].status,'in_progress');
 a.answer(0,{message:'offline'});await until(()=>b.calls.length===1);b.answer(0,{message:'offline'});
});

test('switching account cancels a queued write before the lock is released',async()=>{
 const h=harness();await ready(h);const key=core.storageKey('account-a'),before=h.storage.get(key),release=await hold(h.locks,`progress:${key}`);
 const saved=h.store.updateEntry('P0.1',{status:'needs_review'});h.account('account-b');await ready(h);
 assert.equal(await saved,false);assert.equal(h.storage.get(key),before);assert.equal(h.calls.length,0);assert.equal(h.state().saving,false);
 await release();await tick();assert.equal(h.storage.get(key),before);
});

test('lack of Web Locks refuses writes and preserves the original bytes',async()=>{
 const h=harness([],{noLocks:true});await ready(h);const key=core.storageKey('account-a'),before=h.storage.get(key);
 assert.equal(await h.store.updateEntry('P0.1',{status:'needs_review'}),false);assert.equal(h.storage.get(key),before);assert.equal(h.calls.length,0);assert.match(h.state().message,/Web Locks/);
});

test('waiting for a cloud lock never blocks local writes',async()=>{
 const h=harness();await ready(h);const release=await hold(h.locks,'learning-sync:account-a');
 assert.equal(await h.store.updateEntry('P0.1',{status:'needs_review'}),true);assert.equal(h.calls.length,0);
 assert.equal(await h.store.updateEntry('P0.2',{status:'in_progress'}),true);assert.equal(h.state().saving,false);
 await release();await until(()=>h.calls.length===1);h.answer(0);await until(()=>h.calls.length===2);h.answer(1);await until(()=>!h.state().entries['P0.2'].pending);
});

test('an ACK waits for the short write lock and merges a queued edit before clearing pending',async()=>{
 const h=harness();await ready(h);await h.store.updateEntry('P0.1',{status:'in_progress'});
 const key=core.storageKey('account-a'),release=await hold(h.locks,`progress:${key}`);
 const edit=h.store.updateEntry('P0.1',{status:'needs_review'});h.answer(0);await tick();
 assert.equal(JSON.parse(h.storage.get(key))['P0.1'].revision,0);await release();assert.equal(await edit,true);
 await until(()=>h.calls.length===2);assert.equal(h.calls[1].args.p_status,'needs_review');assert.equal(h.calls[1].args.p_revision,1);
 h.answer(1);await until(()=>!h.state().entries['P0.1'].pending);
});

test('cloud serialization sends a shared pending entry once across two tabs',async()=>{
 const storage=new Map(),locks=sharedLocks(),a=harness([],{storage,locks}),b=harness([],{storage,locks});await ready(a);await ready(b);
 await a.store.updateEntry('P0.1',{status:'in_progress'});await until(()=>a.calls.length===1);
 b.event('storage',{key:core.storageKey('account-a')});await tick();assert.equal(b.calls.length,0);
 a.answer(0);await until(()=>!a.state().entries['P0.1'].pending);await tick();assert.equal(b.calls.length,0);
});

test('storage events refresh local progress without restarting a network load or invalidating queued writes',async()=>{
 let loads=0;const h=harness([],{progress:async()=>{loads++;return {data:[],error:null};}});await ready(h);
 const key=core.storageKey('account-a'),release=await hold(h.locks,`progress:${key}`),saved=h.store.updateEntry('P0.1',{status:'needs_review'});
 h.storage.set(key,JSON.stringify({'P0.2':{...core.emptyEntry(),status:'self_completed'}}));h.event('storage',{key});assert.equal(loads,1);
 await release();assert.equal(await saved,true);assert.equal(JSON.parse(h.storage.get(key))['P0.2'].status,'self_completed');
 await until(()=>h.calls.length===1);h.answer(0);await until(()=>!h.state().entries['P0.1'].pending);
});

test('leaving warns about a queued progress write and clears after it is saved',async()=>{
 const h=harness();await ready(h);const release=await hold(h.locks,`progress:${core.storageKey('account-a')}`);
 const saved=h.store.updateEntry('P0.1',{status:'in_progress'}),event={prevented:false,preventDefault(){this.prevented=true;}};
 h.event('beforeunload',event);assert.equal(event.prevented,true);await release();await saved;
 const finished={prevented:false,preventDefault(){this.prevented=true;}};h.event('beforeunload',finished);assert.equal(finished.prevented,false);
 h.answer(0);await until(()=>!h.state().entries['P0.1'].pending);
});

test('a successful ACK clears an obsolete conflict flag when its payload has not changed',async()=>{
 const h=harness();await ready(h);await h.store.updateEntry('P0.1',{status:'in_progress'});
 const key=core.storageKey('account-a'),entries=JSON.parse(h.storage.get(key));entries['P0.1'].conflict=true;h.storage.set(key,JSON.stringify(entries));
 h.answer(0);await until(()=>!h.state().entries['P0.1'].pending);
 assert.equal(h.state().entries['P0.1'].conflict,false);assert.equal(h.calls.length,1);
});
