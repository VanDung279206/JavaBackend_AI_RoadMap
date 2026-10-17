import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
const require=createRequire(import.meta.url),ts=require('typescript');
const catalogue=JSON.parse(readFileSync('src/generated/catalogue.json','utf8'));
const core=require('../.test-dist/progress-core.js');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const text=value=>Array.isArray(value)?value.map(text).join(''):value&&typeof value==='object'?text(value.props?.children):String(value??'');
function harness(kind){
 const source=kind==='import'?'ReviewImport':'PersonalNote',module={exports:{}},states=[],refs=[],effects=[],controls=[],calls=[];
 let stateIndex=0,refIndex=0,effectIndex=0,queued=[],importResult=async()=>true;
 let load=async()=>({data:{note:'Original note',bookmarked:true},error:null}),save=async()=>({error:null});
 const compiled=ts.transpileModule(readFileSync(`src/components/${source}.tsx`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 runInNewContext(compiled,{module,exports:module.exports,AbortController,require(name){
  if(name==='react')return {
   useState(initial){const i=stateIndex++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return [states[i],value=>{states[i]=typeof value==='function'?value(states[i]):value;}];},
   useRef(initial){const i=refIndex++;return refs[i]??(refs[i]={current:initial});},
   useEffect(fn,deps){const i=effectIndex++,prior=effects[i];if(!prior||deps.some((value,index)=>value!==prior.deps[index])){effects[i]={deps,cleanup:prior?.cleanup};queued.push(()=>{effects[i].cleanup?.();effects[i].cleanup=fn();});}}
  };
  if(name==='react/jsx-runtime'){
   const runtime=require(name);return {...runtime,...Object.fromEntries(['jsx','jsxs'].map(method=>[method,(type,props,key)=>{if(['input','button','textarea'].includes(type))controls.push({type,...props});return runtime[method](type,props,key);}]))};
  }
  if(name==='@/generated/catalogue.json')return {default:catalogue};
  if(name==='@/lib/progress-core')return core;
  if(name==='@/lib/project-request')return require('../.test-dist/project-request.js');
  if(name==='@/lib/learning-store')return {useLearning:()=>({owner:'account-a'}),importReviewProgress(...args){calls.push({kind:'import',args});return importResult(...args);}};
  if(name==='@/lib/supabase')return {supabase:{from(table){
   assert.equal(table,'learning_notes');const call={kind:'load'};
   const query={select(){return this;},eq(){return this;},maybeSingle(){return this;},upsert(value){call.kind='save';call.value=value;return this;},abortSignal(signal){call.signal=signal;return this;},then(resolve,reject){calls.push(call);return (call.kind==='save'?save(call):load(call)).then(resolve,reject);}};return query;
  }}};
  throw Error('Unexpected dependency '+name);
 }});
 function render(){
  stateIndex=refIndex=effectIndex=0;controls.length=0;
  const html=require('react-dom/server').renderToStaticMarkup(require('react').createElement(module.exports.default,{resourceKey:'exercise:P0.1'}));
  const pending=queued;queued=[];for(const effect of pending)effect();
  return {html,file:controls.find(item=>item.type==='file'),apply:controls.find(item=>item.type==='button'&&text(item.children).startsWith('Nhập ')),note:controls.find(item=>item.type==='textarea'),bookmark:controls.find(item=>item.type==='checkbox'),button:label=>controls.find(item=>item.type==='button'&&text(item.children)===label)};
 }
 const unmount=()=>{for(const effect of effects)effect?.cleanup?.();};
 return {calls,render,unmount,setImport(fn){importResult=fn;},setLoad(fn){load=fn;},setSave(fn){save=fn;}};
}
const row={result:'pass',due:'2026-10-18',hint:0,active_tags:[]};
const payload=id=>JSON.stringify({[id]:row});
const file=(name,id,read)=>({name,size:200,text:read??(async()=>payload(id))});
const event=source=>({target:{files:[source],value:'selected-path'}});
async function loaded(h){h.render();for(let i=0;i<30;i++){await tick();if(!h.render().note?.disabled)return;}assert.fail('note did not load');}

test('choosing a new review file immediately invalidates the old preview and stale apply handler',async()=>{
 const h=harness('import');await h.render().file.onChange(event(file('first.json','P0.1')));await tick();
 const stale=h.render().apply,pending=deferred();h.render().file.onChange(event(file('second.json','P0.2',()=>pending.promise)));
 try{const view=h.render();assert.ok(!view.apply||view.apply.disabled);await stale.onClick();await tick();assert.equal(h.calls.length,0);}
 finally{pending.resolve(payload('P0.2'));await tick();}
 await h.render().apply.onClick();await tick();assert.deepEqual(Object.keys(h.calls[0].args[0]),['P0.2']);assert.equal(h.calls[0].args[2],payload('P0.2'));
});

test('out-of-order review reads apply only the most recently selected file',async()=>{
 const h=harness('import'),first=deferred(),second=deferred();
 h.render().file.onChange(event(file('slow.json','P0.1',()=>first.promise)));h.render().file.onChange(event(file('latest.json','P0.2',()=>second.promise)));
 second.resolve(payload('P0.2'));await tick();first.resolve(payload('P0.1'));await tick();
 await h.render().apply.onClick();await tick();assert.deepEqual(Object.keys(h.calls[0].args[0]),['P0.2']);assert.equal(h.calls[0].args[2],payload('P0.2'));
});

test('a stale read failure cannot clear the valid newer review preview',async()=>{
 const h=harness('import'),first=deferred();h.render().file.onChange(event(file('slow.json','P0.1',()=>first.promise)));
 h.render().file.onChange(event(file('latest.json','P0.2')));await tick();first.reject(Error('cannot read old file'));await tick();
 assert.ok(h.render().apply);await h.render().apply.onClick();await tick();assert.deepEqual(Object.keys(h.calls[0].args[0]),['P0.2']);
});

test('review selection resets the file input so the same file can be chosen again',async()=>{
 const h=harness('import'),selected=event(file('review.json','P0.1'));h.render().file.onChange(selected);await tick();assert.equal(selected.target.value,'');
});

test('review import guards duplicate clicks before React rerenders',async()=>{
 const h=harness('import'),pending=deferred();h.setImport(()=>pending.promise);h.render().file.onChange(event(file('review.json','P0.1')));await tick();
 const apply=h.render().apply;apply.onClick();apply.onClick();await tick();
 try{assert.equal(h.calls.length,1);}finally{pending.resolve(true);await tick();}
});

test('a rejected review import releases busy state and keeps the preview available for retry',async()=>{
 const h=harness('import');h.setImport(async()=>{throw Error('write rejected');});h.render().file.onChange(event(file('review.json','P0.1')));await tick();
 h.render().apply.onClick();await tick();assert.equal(h.render().apply.disabled,false);assert.match(h.render().html,/Không nhập được|Chưa nhập được/);
 h.setImport(async()=>true);h.render().apply.onClick();await tick();assert.equal(h.render().apply,undefined);
});

test('rejected note loading stays read-only and offers an in-place retry',async t=>{
 const h=harness('note');t.after(h.unmount);h.setLoad(async()=>{throw Error('offline');});h.render();await tick();
 const view=h.render();assert.equal(view.note.disabled,true);assert.ok(view.button('Tải lại ghi chú'));
 h.setLoad(async()=>({data:{note:'Existing server note',bookmarked:true},error:null}));view.button('Tải lại ghi chú').onClick();await loaded(h);assert.equal(h.render().note.value,'Existing server note');
});

test('rejected note save unlocks the editor, retains text and bookmark, and can retry',async t=>{
 const h=harness('note');t.after(h.unmount);await loaded(h);h.render().note.onChange({target:{value:'Unsaved note'}});h.render().bookmark.onChange({target:{checked:false}});
 h.setSave(async()=>{throw Error('network rejected');});h.render().button('Lưu ghi chú').onClick();await tick();
 const view=h.render();assert.equal(view.note.disabled,false);assert.equal(view.note.value,'Unsaved note');assert.equal(view.bookmark.checked,false);assert.match(view.html,/Lưu thất bại/);
 h.setSave(async()=>({error:null}));view.button('Lưu ghi chú').onClick();await tick();assert.match(h.render().html,/Đã lưu ghi chú/);
});

test('note saving has a live guard against duplicate clicks',async t=>{
 const h=harness('note'),pending=deferred();t.after(h.unmount);await loaded(h);h.setSave(()=>pending.promise);
 const button=h.render().button('Lưu ghi chú');button.onClick();button.onClick();await tick();
 try{assert.equal(h.calls.filter(call=>call.kind==='save').length,1);}finally{pending.resolve({error:null});await tick();}
});

test('unmount aborts the note SDK request and ignores its late response',async()=>{
 const h=harness('note'),pending=deferred();h.setLoad(()=>pending.promise);h.render();await tick();h.unmount();
 try{assert.equal(h.calls[0].signal?.aborted,true);}finally{pending.resolve({data:{note:'Late private note',bookmarked:true},error:null});await tick();}
});

test('an invalid note payload does not enable editing an unknown server note',async t=>{
 const h=harness('note');t.after(h.unmount);h.setLoad(async()=>({data:{note:123,bookmarked:'yes'},error:null}));h.render();await tick();
 assert.equal(h.render().note.disabled,true);assert.ok(h.render().button('Tải lại ghi chú'));assert.equal(h.calls.filter(call=>call.kind==='save').length,0);
});
