import catalogue from '@/generated/catalogue.json';
export type PlaygroundLanguage = "java" | "postgresql";
export type PlaygroundSeed = {language:PlaygroundLanguage;filename:string};
export function getPlaygroundSeed(id:string):PlaygroundSeed|null {
 const language=catalogue.exercises.find(e=>e.id===id)?.playground;
 if(language!=="java"&&language!=="postgresql")return null;
 return {language,filename:language==='java'?'Main.java':'commands.sql'};
}
