import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {emptyProject,parseProject}=require('../.test-dist/project-core.js');
const {syncProject,projectSyncKey,projectConflictKey}=require('../.test-dist/project-sync.js');
const draft=name=>({...emptyProject(),name});
async function until(check){const deadline=Date.now()+5000;while(Date.now()<deadline){if(check())return;await new Promise(resolve=>setTimeout(resolve,5));}assert.ok(check(),'expected asynchronous checkpoint');}
function server(initial=null){
 return {row:initial,offline:false,lostAck:false,writes:0,
  async load(){if(this.offline)throw Error('offline');return structuredClone(this.row);},
  async save(owner,revision,content){
   if(this.offline)throw Error('offline');
   if(revision!==(this.row?.revision??0))throw Error('PROJECT_CONFLICT');
   this.row={content:parseProject(content),revision:revision+1};this.writes++;
   if(this.lostAck){this.lostAck=false;throw Error('lost response');}return structuredClone(this.row);
  }
 };
}
function device(cloud,value=null,owner='account-a'){
 const storage=new Map();let raw=value===null?null:JSON.stringify(value),active=true,busy=false;
 const adapter={owner,active:()=>active,local:{raw:()=>raw,busy:()=>busy,async restore(value,baseline){if(raw!==baseline||busy)return false;raw=JSON.stringify(parseProject(value));return true;}},
  storage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
  remote:{load:id=>cloud.load(id),save:(...args)=>cloud.save(...args)}};
 return {adapter,storage,edit:value=>{raw=JSON.stringify(value);},raw:()=>raw,value:()=>raw===null?null:JSON.parse(raw),
  stop:()=>{active=false;},busy:value=>{busy=value;},sync:decision=>syncProject(adapter,decision),
  meta:()=>JSON.parse(storage.get(projectSyncKey(owner))??'null')};
}
test('old account-local project is uploaded without changing its device bytes',async()=>{
 const cloud=server(),d=device(cloud,draft('Old local project')),raw=d.raw();
 const result=await d.sync();assert.equal(result.state,'synced');assert.equal(result.localRaw,raw);
 assert.equal(d.raw(),raw);assert.equal(cloud.row.content.name,'Old local project');assert.equal(d.meta().revision,1);
});
test('a new device pulls the existing project and its original checklist and outline',async()=>{
 const value={...draft('Remote'),outline:'# My plan',checklist:[true,false,false,false,false,false]};
 const cloud=server({revision:3,content:value}),d=device(cloud);
 assert.equal((await d.sync()).state,'synced');assert.deepEqual(d.value(),value);assert.equal(cloud.writes,0);assert.equal(d.meta().revision,3);
});
test('two existing different drafts require a choice instead of automatic migration overwrite',async()=>{
 const cloud=server({revision:1,content:draft('Remote')}),d=device(cloud,draft('Legacy local'));
 const result=await d.sync();assert.equal(result.state,'conflict');assert.equal(cloud.writes,0);
 assert.equal(d.value().name,'Legacy local');assert.equal(result.conflict.remote.name,'Remote');
});
test('offline edits survive reload and are uploaded after reconnect',async()=>{
 const cloud=server(),d=device(cloud,draft('Initial'));await d.sync();
 cloud.offline=true;d.edit(draft('Offline edit'));assert.equal((await d.sync()).state,'error');
 const reloaded=device(cloud,d.value());for(const [key,value]of d.storage)reloaded.storage.set(key,value);
 cloud.offline=false;assert.equal((await reloaded.sync()).state,'synced');assert.equal(cloud.row.content.name,'Offline edit');
});
test('typing during a pending upload stays queued and never reports false completion',async()=>{
 const cloud=server(),d=device(cloud,draft('First'));let release;
 const original=cloud.save.bind(cloud);cloud.save=async(...args)=>{await new Promise(resolve=>{release=resolve;});return original(...args);};
 const sync=d.sync();await until(()=>release);d.edit(draft('Second'));release();
 assert.equal((await sync).state,'pending');assert.equal(d.value().name,'Second');assert.equal(cloud.row.content.name,'First');
 cloud.save=original;assert.equal((await d.sync()).state,'synced');assert.equal(cloud.row.content.name,'Second');assert.equal(cloud.row.revision,2);
});
test('an edit made while loading remote data postpones the merge',async()=>{
 const cloud=server({revision:1,content:draft('Remote')}),d=device(cloud);let release;
 cloud.load=()=>new Promise(resolve=>{release=resolve;});const sync=d.sync();await until(()=>release);
 d.edit(draft('Typed during fetch'));release(cloud.row);assert.equal((await sync).state,'pending');assert.equal(d.value().name,'Typed during fetch');
});
test('losing an acknowledgement after server commit does not duplicate a revision on retry',async()=>{
 const cloud=server(),d=device(cloud,draft('Sent once'));cloud.lostAck=true;
 assert.equal((await d.sync()).state,'error');assert.equal(d.meta(),null);assert.equal(cloud.row.revision,1);
 assert.equal((await d.sync()).state,'synced');assert.equal(cloud.writes,1);assert.equal(d.meta().revision,1);
});
for(const choice of ['local','remote'])test(`conflict resolution (${choice}) archives both copies before replacing either`,async()=>{
 const cloud=server({revision:2,content:draft('Server version')}),d=device(cloud,draft('Device version'));
 const {conflict}=await d.sync();assert.equal((await d.sync({choice,conflict})).state,'synced');
 const archived=JSON.parse(d.storage.get(projectConflictKey('account-a')));
 assert.equal(archived.local.name,'Device version');assert.equal(archived.remote.name,'Server version');
 assert.equal(d.value().name,choice==='local'?'Device version':'Server version');assert.equal(cloud.row.content.name,d.value().name);
});
for(const side of ['local','remote'])test(`a stale conflict choice cannot overwrite a newer ${side} edit`,async()=>{
 const cloud=server({revision:2,content:draft('Remote')}),d=device(cloud,draft('Local'));
 const {conflict}=await d.sync();
 if(side==='local')d.edit(draft('New local'));else cloud.row={revision:3,content:draft('New remote')};
 assert.equal((await d.sync({choice:'remote',conflict})).state,'conflict');assert.equal(cloud.writes,0);
 assert.equal(d.value().name,side==='local'?'New local':'Local');
});
test('failure to archive conflict copies prevents destructive resolution',async()=>{
 const cloud=server({revision:1,content:draft('Remote')}),d=device(cloud,draft('Local'));const {conflict}=await d.sync();
 d.adapter.storage.setItem=()=>{throw Error('QuotaExceededError');};
 assert.equal((await d.sync({choice:'remote',conflict})).state,'error');assert.equal(d.value().name,'Local');assert.equal(cloud.row.content.name,'Remote');
});
test('a clean device accepts a later remote revision, and refuses a stale remote snapshot',async()=>{
 const cloud=server(),d=device(cloud,draft('First'));await d.sync();
 cloud.row={revision:2,content:draft('From another device')};assert.equal((await d.sync()).state,'synced');assert.equal(d.value().name,'From another device');
 cloud.row={revision:1,content:draft('Older snapshot')};assert.equal((await d.sync()).state,'conflict');assert.equal(d.value().name,'From another device');
});
test('a missing local key with retained metadata restores the server copy rather than clearing it',async()=>{
 const cloud=server(),d=device(cloud,draft('Keep this'));await d.sync();
 const reloaded=device(cloud);for(const [key,value]of d.storage)reloaded.storage.set(key,value);
 assert.equal((await reloaded.sync()).state,'synced');assert.equal(reloaded.value().name,'Keep this');assert.equal(cloud.writes,1);
});
test('changing accounts during fetch cancels all local changes and metadata writes',async()=>{
 const cloud=server({revision:1,content:draft('Private remote')}),d=device(cloud);let release;
 cloud.load=()=>new Promise(resolve=>{release=resolve;});const sync=d.sync();await until(()=>release);d.stop();release(cloud.row);
 assert.equal((await sync).state,'cancelled');assert.equal(d.raw(),null);assert.equal(d.storage.size,0);
});
test('changing accounts during upload does not acknowledge into the old device snapshot',async()=>{
 const cloud=server(),d=device(cloud,draft('Old account'));let release;
 cloud.save=()=>new Promise(resolve=>{release=resolve;});const sync=d.sync();await until(()=>release);d.stop();release({revision:1,content:draft('Old account')});
 assert.equal((await sync).state,'cancelled');assert.equal(d.meta(),null);
});
test('corrupt metadata, local payload or remote payload blocks sync without discarding data',async()=>{
 for(const kind of ['metadata','local','remote']){
  const cloud=server(),d=device(cloud,draft('Keep local'));
  if(kind==='metadata')d.storage.set(projectSyncKey('account-a'),'null');
  if(kind==='local')d.edit({name:'Invalid'});
  if(kind==='remote')cloud.row={revision:1,content:{name:'Invalid'}};
  const raw=d.raw();assert.equal((await d.sync()).state,'error',kind);assert.equal(d.raw(),raw);assert.equal(cloud.writes,0);
 }
});
test('pending device writes prevent remote operations and remain retryable',async()=>{
 const cloud=server(),d=device(cloud,draft('Local'));d.busy(true);
 assert.equal((await d.sync()).state,'pending');assert.equal(cloud.writes,0);d.busy(false);assert.equal((await d.sync()).state,'synced');
});
test('two devices cannot silently overwrite a concurrent first upload',async()=>{
 const cloud=server(),a=device(cloud,draft('A')),b=device(cloud,draft('B'));
 const states=await Promise.all([a.sync(),b.sync()]);assert.ok(states.some(result=>result.state==='synced'));assert.equal(cloud.writes,1);
 const loser=cloud.row.content.name==='A'?b:a;assert.equal((await loser.sync()).state,'conflict');assert.equal(cloud.writes,1);
});
