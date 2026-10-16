import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
const require=createRequire(import.meta.url),ts=require('typescript');
const compiled=ts.transpileModule(readFileSync('src/components/command/SearchCommand.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
test('global search reuses its index across renders and preserves accent-insensitive matches',()=>{
 let open=true,query='',stateIndex=0,reads=0,buttons=[];
 const catalogue={default:{lessons:[],tags:{},get exercises(){reads++;return [{id:'SQLB03',title:'Đếm tài liệu',phase:'02_Http-Sql',markdown:'Cursor giữ đúng thứ tự',tags:[]}];}}};
 const module={exports:{}};
 runInNewContext(compiled,{module,exports:module.exports,require(name){
  if(name==='react')return {useState:()=>[stateIndex++===0?open:query,()=>{}],useEffect(){},useCallback:fn=>fn};
  if(name==='next/navigation')return {useRouter:()=>({push(){}})};
  if(name==='@/generated/catalogue.json')return catalogue;
  if(name==='@/generated/english.json')return {default:{units:[],terms:[],errors:[]}};
  if(name==='react/jsx-runtime')return {jsx:element,jsxs:element};
  throw Error(name);
 }});
 function element(type,props){if(type==='button')buttons.push(props);return {type,props};}
 const indexReads=reads;
 for(const text of ['ĐẾM TÀI LIỆU','dem tai lieu','  SQLB03  ','cursor giu dung']){
  query=text;stateIndex=0;buttons=[];module.exports.default();
  assert.ok(buttons.some(b=>b.children==='SQLB03 — Đếm tài liệu'),text);
 }
 open=false;stateIndex=0;assert.equal(module.exports.default(),null);
 assert.equal(reads,indexReads,'typing or closing must not rebuild the catalogue index');
});
