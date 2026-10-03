export type SourceDoc={id:string;owner:string;version:number;current:number;text:string};
export type Chunk={id:string;documentId:string;version:number;text:string;score:number};
const words=(text:string)=>text.toLowerCase().match(/[\p{L}\p{N}]+/gu)||[];
export function retrieve(docs:SourceDoc[],owner:string,query:string,size:number,k:number):Chunk[]{
 if(!Number.isInteger(size)||size<2||size>100||!Number.isInteger(k)||k<1||k>10)throw Error('Invalid configuration');
 const terms=new Set(words(query)),chunks:Chunk[]=[];
 for(const doc of docs.filter(d=>d.owner===owner&&d.version===d.current)){
  const tokens=doc.text.split(/\s+/).filter(Boolean);
  for(let start=0;start<tokens.length;start+=size){const text=tokens.slice(start,start+size).join(' '),unique=new Set(words(text));const score=[...terms].filter(t=>unique.has(t)).length;if(score)chunks.push({id:`${doc.id}:v${doc.version}:${start}`,documentId:doc.id,version:doc.version,text,score});}
 }
 return chunks.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,k);
}
export function retrievalMetrics(chunks:Chunk[],expected:string[]){
 const ids=new Set(chunks.map(c=>c.documentId)),relevant=new Set(expected),hits=[...ids].filter(id=>relevant.has(id)).length;
 return {precision:ids.size?hits/ids.size:0,recall:relevant.size?hits/relevant.size:0};
}
