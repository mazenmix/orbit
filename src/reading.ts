export type Contact={transit:string;natal:string;angle:number;orb:number;applying:boolean};
export function compareContacts(current:Contact[],previous:Contact[]){
 const key=(e:Contact)=>[e.transit,e.natal,e.angle].join(':');
 // Invalid or repeated identities otherwise produce false "stable" results:
 // Math.abs(NaN - orb) is NaN, which never passes the change threshold.
 const validate=(rows:readonly Contact[],label:string)=>{
  const ids=new Set<string>();
  for(const e of rows){
   if(typeof e.transit!=='string'||!e.transit.trim()||typeof e.natal!=='string'||!e.natal.trim()||
    ![0,60,90,120,180].includes(e.angle)||!Number.isFinite(e.orb)||e.orb<0||
    typeof e.applying!=='boolean')throw Error('Invalid '+label+' astronomical contact');
   const id=key(e);
   if(ids.has(id))throw Error('Repeated '+label+' astronomical contact: '+id);
   ids.add(id);
  }
 };
 validate(current,'current');
 validate(previous,'previous');
 const old=new Map(previous.map(e=>[key(e),e]));
 const now=new Set(current.map(key));
 const entered=current.filter(e=>!old.has(key(e))).map(key);
 const exited=previous.filter(e=>!now.has(key(e))).map(key);
 const changed=current.flatMap(e=>{const p=old.get(key(e));return p&&(Math.abs(e.orb-p.orb)>=.02||e.applying!==p.applying)?[{contact:key(e),orbBefore:Number(p.orb.toFixed(3)),orbNow:Number(e.orb.toFixed(3)),applying:e.applying}]:[]});
 return {entered,exited,changed,stable:!entered.length&&!exited.length&&!changed.length};
}
/** Compare complete calculated sets before bounding the transmitted examples.
 * Ranking churn in a short explanation packet must not invent an ingress/exit. */
export function boundedComparison(current:Contact[],previous:Contact[],limit=12){
 if(!Number.isInteger(limit)||limit<1||limit>12)throw Error('Invalid comparison limit');
 const full=compareContacts(current,previous);
 const totals={entered:full.entered.length,exited:full.exited.length,changed:full.changed.length};
 return {...full,entered:full.entered.slice(0,limit),exited:full.exited.slice(0,limit),changed:full.changed.slice(0,limit),totals,
  scope:'all-computed-contacts' as const,truncated:Object.values(totals).some(n=>n>limit)};
}
export function optionalComparison(current:Contact[],readPrevious:()=>Contact[]){
 try{return boundedComparison(current,readPrevious())}catch{return null}
}
export function distinctParagraphs(text:string){
 const seen=new Set<string>();
 return text.split(/\n\s*\n/).filter(p=>{const key=p.toLocaleLowerCase().replace(/[\s\p{P}\p{S}]+/gu,'');if(!key||seen.has(key))return false;seen.add(key);return true}).join('\n\n');
}
