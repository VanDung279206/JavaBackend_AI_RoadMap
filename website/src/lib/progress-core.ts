export type LearningStatus = 'not_started' | 'in_progress' | 'self_completed' | 'needs_review';
export type Entry = { status: LearningStatus; revision: number; due_at: string | null; hint_level: number; error_tags: string[]; pending?: boolean; conflict?: boolean };
export type Entries = Record<string, Entry>;
export const emptyEntry = (): Entry => ({status:'not_started',revision:0,due_at:null,hint_level:0,error_tags:[]});
export const storageKey = (owner: string | null) => `roadmap-v3:${owner ? `user:${owner}` : 'guest'}`;
export function parseStoredEntries(input:unknown,ids:string[]):Entries {
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid backup');
 const entries:Entries={};
 for(const [id,value] of Object.entries(input)) {
  if(!ids.includes(id)||!value||typeof value!=='object')throw Error('Invalid backup exercise');
  const e=value as Entry;
  if(!['not_started','in_progress','self_completed','needs_review'].includes(e.status)||!Number.isSafeInteger(e.revision)||e.revision<0||!Number.isInteger(e.hint_level)||e.hint_level<0||e.hint_level>3||!Array.isArray(e.error_tags)||e.error_tags.length>14||e.error_tags.some(t=>typeof t!=='string')||e.error_tags.join(',').length>500||(e.due_at!==null&&(typeof e.due_at!=='string'||!Number.isFinite(Date.parse(e.due_at))))||(e.pending!==undefined&&typeof e.pending!=='boolean')||(e.conflict!==undefined&&typeof e.conflict!=='boolean'))throw Error('Invalid backup entry');
  entries[id]={status:e.status,revision:e.revision,due_at:e.due_at,hint_level:e.hint_level,error_tags:e.error_tags,pending:e.pending,conflict:e.conflict};
 }
 return entries;
}
export function mergeRemote(local: Entries, remote: Entries): Entries {
 const result = {...remote};
 for (const [id,e] of Object.entries(local)) {
  if (e.pending) result[id] = {...e,conflict:e.revision !== (remote[id]?.revision ?? 0)};
 }
 return result;
}
export function importGuest(account: Entries, guest: Entries): Entries {
 const result = {...account};
 for (const [id,e] of Object.entries(guest)) {
  // Existing account progress always wins. Explicit import never overwrites it.
  if (!result[id]) result[id] = {...e,revision:0,pending:true,conflict:false};
 }
 return result;
}
export function parseReviewImport(input:unknown,ids:string[],tags:string[]):Entries {
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Expected review-state dictionary');
 const entries:Entries={};
 for(const [id,value] of Object.entries(input)){
  if(!ids.includes(id)||!value||typeof value!=='object')throw Error(`Unknown exercise ${id}`);
  const row=value as Record<string,unknown>;
  if(!['pass','partial','fail'].includes(String(row.result)))throw Error(`Invalid result ${id}`);
  const due=String(row.due),hint=Number(row.hint??0),active=row.active_tags??[];
  if(!/^\d{4}-\d{2}-\d{2}$/.test(due)||!Number.isFinite(Date.parse(due))||new Date(due).toISOString().slice(0,10)!==due||!Number.isInteger(hint)||hint<0||hint>3||!Array.isArray(active)||active.some(t=>typeof t!=='string'||!tags.includes(t)))throw Error(`Invalid review ${id}`);
  entries[id]={...emptyEntry(),status:row.result==='pass'?'self_completed':row.result==='fail'?'needs_review':'in_progress',hint_level:hint,due_at:due+'T00:00:00+07:00',error_tags:active,pending:true};
 }
 return entries;
}
export function recommend(exercises: {id:string;prerequisites:string[]}[], entries: Entries, today: string) {
 return exercises.flatMap(e => {
  const p = entries[e.id];
  if (p?.status === 'needs_review') return [{id:e.id,rank:0,reason:'Bài đang sai hoặc cần ôn'}];
  if (p?.due_at && Date.parse(p.due_at) <= Date.parse(today+'T23:59:59.999+07:00')) return [{id:e.id,rank:1,reason:'Đến hạn ôn theo lịch Asia/Bangkok'}];
  if (p?.status === 'in_progress') return [{id:e.id,rank:2,reason:'Tiếp tục bài đang làm'}];
  if ((!p || p.status==='not_started') && e.prerequisites.every(id=>entries[id]?.status==='self_completed')) return [{id:e.id,rank:3,reason:'Đã tự xác nhận kiến thức tiên quyết; thử bài mới'}];
  return [];
 }).sort((a,b)=>a.rank-b.rank || a.id.localeCompare(b.id));
}
