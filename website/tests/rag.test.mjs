import test from 'node:test';
import assert from 'node:assert/strict';
import {retrieve,retrievalMetrics} from '../.test-dist/rag-workbench.js';
test('retrieval filters owner and version before top k',()=>{
 const docs=[{id:'private',owner:'b',version:1,current:1,text:'java java java'},{id:'stale',owner:'a',version:1,current:2,text:'java java java'},{id:'current',owner:'a',version:2,current:2,text:'java works'}];
 assert.deepEqual(retrieve(docs,'a','java',2,1).map(c=>c.documentId),['current']);
});
test('metrics deduplicate chunks and empty retrieval does not pass',()=>{
 assert.deepEqual(retrievalMetrics([{documentId:'a'},{documentId:'a'},{documentId:'b'}],['a','c']),{precision:.5,recall:.5});
 assert.deepEqual(retrievalMetrics([],['a']),{precision:0,recall:0});
 assert.throws(()=>retrieve([],'a','query',0,1));
});
