import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
const require=createRequire(import.meta.url), ts=require('typescript');
const urlModule={exports:{}};
runInNewContext(ts.transpileModule(readFileSync('src/lib/resource-url.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:urlModule,exports:urlModule.exports,URL});
const compiled=ts.transpileModule(readFileSync('src/components/admin/AdminResourceQueue.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const resource={id:'resource-a',title:'A resource',purpose:'reference',phase_slug:'01_Java',description:'A shared reference document.',resource_type:'file',file_path:'owner/a.pdf',source_url:null,submitted_by:'owner',created_at:'2026-10-16T00:00:00Z'};
function harness({items=[resource],result={data:{id:resource.id,file_path:resource.file_path},error:null},removeError=null,loadResult=null}={}) {
 const states=[items,{},'',false,'',''],refs=[],effects=[],calls={remove:[],signed:[],updates:[],errors:[]};
 let stateIndex=0,refIndex=0,buttons=[],anchors=[],text='',operation='load';
 const chain={update(value){operation='update';calls.updates.push(value);return this;},eq(){return this;},order(){return this;},limit(){operation='load';return this;},select(){return this;},maybeSingle(){return this;},then(resolve,reject){return (operation==='load' ? (loadResult ? loadResult() : Promise.resolve({data:items,error:null})) : (typeof result==='function'?result():Promise.resolve(result))).then(resolve,reject);}};
 const storage={remove(paths){calls.remove.push(paths);return Promise.resolve({error:removeError});},createSignedUrls(paths){calls.signed.push(paths);return Promise.resolve({data:paths.map(path=>({path,signedUrl:'https://storage.example/'+path})),error:null});},createSignedUrl(path){calls.signed.push([path]);return Promise.resolve({data:{signedUrl:'https://storage.example/'+path},error:null});}};
 const module={exports:{}};
 runInNewContext(compiled,{module,exports:module.exports,URL,Date,window:{requestAnimationFrame:()=>1,cancelAnimationFrame(){}},require(name){
  if(name==='react')return {useState(initial){const i=stateIndex++;if(!(i in states))states[i]=initial;return [states[i],value=>{states[i]=typeof value==='function'?value(states[i]):value;}];},useRef(initial){const i=refIndex++;return refs[i]??(refs[i]={current:initial});},useCallback:fn=>fn,useEffect:fn=>effects.push(fn)};
  if(name==='react/jsx-runtime')return {jsx:element,jsxs:element};
  if(name==='lucide-react')return {ArrowUpRight:()=>null,Check:()=>null,RefreshCw:()=>null,X:()=>null};
  if(name==='@/generated/catalogue.json')return {default:{phases:[{slug:'01_Java',title:'Java'}]}};
  if(name==='@/lib/supabase')return {supabase:{from:()=>chain,storage:{from:()=>storage}}};
  if(name==='@/lib/resource-url')return urlModule.exports;
  throw Error('Unexpected dependency '+name);
 }});
 function element(type,props){if(type==='button')buttons.push(props);if(type==='a')anchors.push(props);return {type,props};}
 function render(){stateIndex=refIndex=0;buttons=[];anchors=[];const tree=module.exports.default({reviewerId:'admin-a'});text=JSON.stringify(tree);return {buttons,anchors,text};}
 render();
 return {calls,states,render,button:label=>{const button=buttons.find(b=>JSON.stringify(b.children).includes(label));return {...button,async onClick(){await button.onClick();await new Promise(resolve=>setImmediate(resolve));}};}};
}

test('a stale rejection cannot delete a file approved by another reviewer',async()=>{
 const h=harness({result:{data:null,error:null}});
 await h.button('Từ chối').onClick();
 assert.equal(h.calls.remove.length,0);
 assert.equal(h.states[0].length,1);
 assert.match(h.render().text,/đã được xử lý|thay đổi/);
});
test('a rejection deletes only the file returned by the successful conditional update',async()=>{
 const h=harness({result:{data:{id:resource.id,file_path:'owner/current.pdf'},error:null}});
 await h.button('Từ chối').onClick();
 assert.deepEqual(Array.from(h.calls.remove[0]),['owner/current.pdf']);
 assert.equal(h.states[0].length,0);assert.equal(h.states[2],'');
});
test('a rejected moderation request releases the guard and permits another attempt',async()=>{
 let fail=true;
 const h=harness({result:()=>fail?Promise.reject(Error('network')):Promise.resolve({data:{id:resource.id,file_path:resource.file_path},error:null})});
 await h.button('Duyệt và đăng').onClick();
 assert.equal(h.states[2],'');assert.ok(h.states[4]);
 fail=false;await h.button('Duyệt và đăng').onClick();assert.equal(h.states[0].length,0);
});
test('moderation guards all rows against concurrent double clicks',async()=>{
 let finish;const h=harness({items:[resource,{...resource,id:'resource-b'}],result:()=>new Promise(resolve=>{finish=resolve;})});
 const first=h.button('Duyệt và đăng').onClick();await new Promise(resolve=>setImmediate(resolve));
 const buttons=h.render().buttons.filter(b=>JSON.stringify(b.children).includes('Từ chối'));
 assert.ok(buttons.every(b=>b.disabled));
 await buttons[1].onClick();assert.equal(h.calls.updates.length,1);
 finish({data:{id:resource.id,file_path:resource.file_path},error:null});await first;
});
test('unsafe community source and preview URLs are never rendered as links',()=>{
 for(const unsafe of ['javascript:alert(1)','data:text/html,<script>alert(1)</script>','//attacker.example','http://insecure.example']){
  const h=harness({items:[{...resource,source_url:unsafe,preview_url:unsafe}]});
  assert.equal(h.render().anchors.length,0,unsafe);
 }
 const h=harness({items:[{...resource,resource_type:'link',file_path:null,source_url:'https://docs.example/page'}]});
 assert.equal(h.render().anchors[0].href,'https://docs.example/page');
});


test('queue loading signs all file previews in one request and retains links',async()=>{
 const h=harness({items:[resource,{...resource,id:'resource-b',file_path:'owner/b.pdf'}, {...resource,id:'link',resource_type:'link',file_path:null,source_url:'https://docs.example'}]});
 await h.button('Làm mới').onClick();
 assert.equal(h.calls.signed.length,1);
 assert.deepEqual(Array.from(h.calls.signed[0]),['owner/a.pdf','owner/b.pdf']);
 assert.equal(h.states[3],false);assert.equal(h.states[0].length,3);
 assert.equal(h.states[0][1].preview_url,'https://storage.example/owner/b.pdf');
});
test('a late refresh cannot resurrect a moderated row',async()=>{
 let finish;const h=harness({loadResult:()=>new Promise(resolve=>{finish=resolve;})});
 const load=h.button('Làm mới').onClick();await new Promise(resolve=>setImmediate(resolve));
 await h.button('Duyệt và đăng').onClick();assert.equal(h.states[0].length,0);
 finish({data:[resource],error:null});await load;await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.states[0].length,0);assert.equal(h.states[3],false);
});
test('a thrown queue load stops the spinner and remains retryable',async()=>{
 let fail=true;const h=harness({loadResult:()=>fail?Promise.reject(Error('offline')):Promise.resolve({data:[resource],error:null})});
 await h.button('Làm mới').onClick();assert.equal(h.states[3],false);assert.ok(h.states[4]);
 fail=false;await h.button('Làm mới').onClick();assert.equal(h.states[0].length,1);assert.equal(h.states[4],'');
});
test('file cleanup failure preserves the committed rejection and shows a specific error',async()=>{
 const h=harness({removeError:Error('offline')});await h.button('Từ chối').onClick();
 assert.equal(h.states[0].length,0);assert.equal(h.states[2],'');
 assert.match(h.states[4],/Đã từ chối/);assert.match(h.states[5],/Đã từ chối/);
});
