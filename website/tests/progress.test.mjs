import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyEntry,storageKey,mergeRemote,importGuest,recommend,parseReviewImport,parseStoredEntries,bangkokDate} from '../.test-dist/progress-core.js';
test('review date stays in Bangkok after PostgreSQL serializes the timestamp in UTC',()=>{
 assert.equal(bangkokDate('2026-10-02T17:00:00Z'),'2026-10-03');
 assert.equal(bangkokDate('2026-10-03T00:00:00+07:00'),'2026-10-03');
 assert.equal(bangkokDate('2026-10-02T16:59:59Z'),'2026-10-02');
});
test('corrupt backup is rejected as a whole and cannot forge verified evidence',()=>{
 assert.throws(()=>parseStoredEntries({x:{...emptyEntry(),revision:null}},['x']));
 assert.throws(()=>parseStoredEntries({x:emptyEntry(),unknown:emptyEntry()},['x']));
 assert.throws(()=>parseStoredEntries({x:{...emptyEntry(),status:'tested_pass'}},['x']));
 assert.throws(()=>parseStoredEntries({x:{...emptyEntry(),error_tags:'invalid'}},['x']));
 assert.equal(parseStoredEntries({x:{...emptyEntry(),verified:true}},['x']).x.verified,undefined);
});
test('account and guest namespaces never collide',()=>{assert.equal(new Set([storageKey(null),storageKey('a'),storageKey('b'),storageKey('guest')]).size,4);});
test('offline edit survives refresh and flags stale remote revision',()=>{
 const local={x:{...emptyEntry(),revision:1,status:'needs_review',pending:true}};
 const remote={x:{...emptyEntry(),revision:2,status:'self_completed'}};
 const merged=mergeRemote(local,remote);assert.equal(merged.x.status,'needs_review');assert.equal(merged.x.conflict,true);assert.equal(merged.x.pending,true);
});
test('current revision is safe to sync and clean records follow remote',()=>{
 assert.equal(mergeRemote({x:{...emptyEntry(),revision:1,pending:true}},{x:{...emptyEntry(),revision:1}}).x.conflict,false);
 assert.equal(mergeRemote({x:{...emptyEntry(),revision:1}},{x:{...emptyEntry(),revision:2}}).x.revision,2);
});
test('explicit guest import preserves account conflicts, resets guest revision',()=>{
 const account={x:{...emptyEntry(),status:'needs_review',revision:3}};
 const guest={x:{...emptyEntry(),status:'self_completed'},y:{...emptyEntry(),revision:8,status:'self_completed'}};
 const merged=importGuest(account,guest);assert.equal(merged.x,account.x);assert.equal(merged.y.revision,0);assert.equal(merged.y.pending,true);
});
test('today ranks error, due, active, eligible new and excludes locked',()=>{
 const exercises=['error','due','active','new'].map(id=>({id,prerequisites:[]}));exercises.push({id:'locked',prerequisites:['missing']});
 const entries={error:{...emptyEntry(),status:'needs_review'},due:{...emptyEntry(),status:'self_completed',due_at:'2026-10-01'},active:{...emptyEntry(),status:'in_progress'}};
 assert.deepEqual(recommend(exercises,entries,'2026-10-03').map(e=>e.id),['error','due','active','new']);
});
test('CLI import never grants verified status and rejects unknown IDs and malformed dates',()=>{
 const row={result:'pass',due:'2026-10-03',hint:0,active_tags:[]};
 assert.equal(parseReviewImport({P1:row},['P1'],[]).P1.status,'self_completed');
 assert.throws(()=>parseReviewImport({FAKE:row},['P1'],[]));
 assert.throws(()=>parseReviewImport({P1:{...row,due:'2026-02-31'}},['P1'],[]));
 assert.throws(()=>parseReviewImport({P1:{...row,result:'tested_pass'}},['P1'],[]));
});
