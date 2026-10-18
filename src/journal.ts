import type {Category} from './math.ts';
import {isVaultConfigured,vaultOpened,vaultJournal,replaceVaultJournal} from './vault.ts';
/** Local-only private relationship log. Its contents are NEVER included in Qwen prompts.
 * This storage is not encrypted at rest; export inside encrypted backup when desired.
 */
export type InteractionKind='message'|'call'|'meeting'|'note';
export type Outcome='positive'|'neutral'|'difficult';
export type JournalEntry={id:string;personId:string;at:string;kind:InteractionKind;outcome:Outcome;note:string;symbolicIndex:number|null;indexDomain:Category|null};
const key='mx.orbit.journal.v1';
const kinds=['message','call','meeting','note'];
const outcomes=['positive','neutral','difficult'];
export function checkJournal(entry:JournalEntry){
 if(!entry||typeof entry.id!=='string'||entry.id.length<1||entry.id.length>100||typeof entry.personId!=='string'||entry.personId.length<1||entry.personId.length>100)throw Error('Invalid journal identity');
 if(!kinds.includes(entry.kind)||!outcomes.includes(entry.outcome))throw Error('Invalid journal classification');
 if(typeof entry.note!=='string'||entry.note.length>500||!entry.note.trim())throw Error('Note must contain 1–500 characters');
 if(typeof entry.at!=='string'||!Number.isFinite(Date.parse(entry.at))||new Date(entry.at).toISOString()!==entry.at)throw Error('Invalid journal timestamp');
 if(entry.symbolicIndex!==null&&(!Number.isInteger(entry.symbolicIndex)||entry.symbolicIndex<1||entry.symbolicIndex>99))throw Error('Invalid symbolic score');
 if(entry.indexDomain!==null&&!['overview','career','love','communication','energy','emotions','recovery','timing'].includes(entry.indexDomain))throw Error('Invalid index domain');
 if((entry.symbolicIndex===null)!==(entry.indexDomain===null))throw Error('Domain and score must both be known or absent');
 return entry;
}
export function readJournal():JournalEntry[]{
 if(vaultOpened())return vaultJournal();if(isVaultConfigured())throw Error('Encrypted vault locked');
 try{const stored=JSON.parse(localStorage.getItem(key)??'[]');if(!Array.isArray(stored))return [];return stored.slice(-250).filter((e:JournalEntry)=>{try{checkJournal(e);return true}catch{return false}})}
 catch{return []}
}
export function writeJournal(items:JournalEntry[]){
 if(!Array.isArray(items)||items.length>250)throw Error('Too many journal entries');
 items.forEach(checkJournal);const ids=new Set(items.map(x=>x.id));if(ids.size!==items.length)throw Error('Duplicate journal ID');
 if(vaultOpened()){replaceVaultJournal(items);return}if(isVaultConfigured())throw Error('Encrypted vault locked');
 localStorage.setItem(key,JSON.stringify(items));
}
export type JournalSummary={total:number;positive:number;neutral:number;difficult:number;observedIndexCount:number;positiveMeanIndex:number|null;difficultMeanIndex:number|null};
export function summarizeJournal(items:readonly JournalEntry[]):JournalSummary{
 const sample=items.filter(e=>e.symbolicIndex!==null);
 const mean=(tone:Outcome)=>{const v=sample.filter(e=>e.outcome===tone).map(e=>e.symbolicIndex!);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):null};
 return {total:items.length,positive:items.filter(e=>e.outcome==='positive').length,neutral:items.filter(e=>e.outcome==='neutral').length,difficult:items.filter(e=>e.outcome==='difficult').length,observedIndexCount:sample.length,positiveMeanIndex:mean('positive'),difficultMeanIndex:mean('difficult')};
}

/** Parse imported journal only if all observations belong to imported profiles.
 * Reject oversized or tampered backups atomically before mutating any storage.
 */
export function parseJournalBackup(value:unknown,profileIds:ReadonlySet<string>):JournalEntry[]{
 if(value===undefined)return [];
 if(!Array.isArray(value)||value.length>250)throw Error('Invalid imported journal');
 const seen=new Set<string>(),result:JournalEntry[]=[];
 for(const candidate of value){
  const entry=checkJournal(candidate as JournalEntry);
  if(!profileIds.has(entry.personId))throw Error('Journal refers to an unknown profile');
  if(seen.has(entry.id))throw Error('Duplicate imported journal ID');
  seen.add(entry.id);result.push(entry);
 }
 return result;
}
