import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {checkExport} from './check-export.mjs';

test('export check rejects missing Phase 0 and unconnected exercise tools',()=>{
 const output=mkdtempSync(path.join(tmpdir(),'roadmap-export-'));
 try{
  const catalogue={phases:[{slug:'00_setup'}],exercises:[{id:'P0.1',phase:'00_setup'}]};
  for(const route of ['today','skills','lab','auth/reset']){
   const file=path.join(output,route+'.html');mkdirSync(path.dirname(file),{recursive:true});writeFileSync(file,'page');
  }
  assert.deepEqual(checkExport(output,catalogue),['Missing exported route /docs/00_setup']);
  mkdirSync(path.join(output,'docs'));writeFileSync(path.join(output,'docs/00_setup.html'),'<span>P0.1</span>');
  assert.equal(checkExport(output,catalogue).length,2);
  writeFileSync(path.join(output,'docs/00_setup.html'),'<span>P0.1</span> Chạy thử / Nộp bài Gia sư gợi ý theo cấp');
  assert.deepEqual(checkExport(output,catalogue),[]);
 }finally{
  assert.ok(path.resolve(output).startsWith(path.resolve(tmpdir())+path.sep));
  rmSync(output,{recursive:true});
 }
});

test('course export rejects a missing four-step course and personal project route',()=>{
 const output=mkdtempSync(path.join(tmpdir(),'roadmap-course-export-'));
 try{
  for(const route of ['today','skills','lab','auth/reset']){
   const file=path.join(output,route+'.html');mkdirSync(path.dirname(file),{recursive:true});writeFileSync(file,'page');
  }
  const catalogue={phases:[],exercises:[],courses:[{phase:'01_Java'}]};
  assert.deepEqual(checkExport(output,catalogue),['Missing exported route /learn/01_Java','Missing exported route /projects/mine']);
  mkdirSync(path.join(output,'learn'));mkdirSync(path.join(output,'projects'));
  writeFileSync(path.join(output,'learn/01_Java.html'),'Bài học Luyện tập');
  writeFileSync(path.join(output,'projects/mine.html'),'Dự án của tôi');
  assert.equal(checkExport(output,catalogue).length,2);
  writeFileSync(path.join(output,'learn/01_Java.html'),'Bài học Luyện tập Áp dụng vào dự án Kiểm tra cuối chặng');
  assert.deepEqual(checkExport(output,catalogue),[]);
 }finally{
  assert.ok(path.resolve(output).startsWith(path.resolve(tmpdir())+path.sep));
  rmSync(output,{recursive:true});
 }
});
