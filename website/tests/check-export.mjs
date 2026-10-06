import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function checkExport(output,catalogue){
 const errors=[];
 function html(route){
  const file=[path.join(output,route+'.html'),path.join(output,route,'index.html')].find(existsSync);
  if(!file){errors.push('Missing exported route /'+route);return '';}
  return readFileSync(file,'utf8');
 }
 for(const route of ['today','skills','lab','auth/reset'])html(route);
 for(const course of catalogue.courses||[]){
  const content=html('learn/'+course.phase);
  if(content)for(const label of ['Bài học','Luyện tập','Áp dụng vào dự án','Kiểm tra cuối chặng'])if(!content.includes(label))errors.push('Missing course step '+label+' in '+course.phase);
 }
 if(catalogue.courses?.length){
  const content=html('projects/mine');
  if(content&&!content.includes('Dự án của tôi'))errors.push('Missing personal project planner');
 }
 for(const phase of catalogue.phases){
  const content=html('docs/'+phase.slug);
  if(!content)continue;
  for(const exercise of catalogue.exercises.filter(e=>e.phase===phase.slug)){
   if(!content.includes('>'+exercise.id+'<'))errors.push('Missing exercise navigation '+exercise.id);
  }
  for(const text of ['Chạy thử / Nộp bài','Gia sư gợi ý theo cấp']){
   if(!content.includes(text))errors.push('Missing learning tools in /docs/'+phase.slug+': '+text);
  }
 }
 return errors;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const website=fileURLToPath(new URL('..',import.meta.url));
 const catalogue=JSON.parse(readFileSync(path.join(website,'src/generated/catalogue.json'),'utf8'));
 const errors=checkExport(path.join(website,'out'),catalogue);
 if(errors.length){errors.forEach(e=>console.error('FAIL',e));process.exitCode=1;}
 else console.log(`PASS exported routes: ${catalogue.phases.length} tracks, ${catalogue.exercises.length} exercises, ${catalogue.courses?.length||0} courses, projects/mine, today/skills/lab/auth/reset`);
}
