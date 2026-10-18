export type Contact={transit:string;natal:string;angle:number;orb:number;applying:boolean};
export function compareContacts(current:Contact[],previous:Contact[]){
 const key=(e:Contact)=>[e.transit,e.natal,e.angle].join(':');
 const old=new Map(previous.map(e=>[key(e),e]));
 const now=new Set(current.map(key));
 const entered=current.filter(e=>!old.has(key(e))).map(key);
 const exited=previous.filter(e=>!now.has(key(e))).map(key);
 const changed=current.flatMap(e=>{const p=old.get(key(e));return p&&(Math.abs(e.orb-p.orb)>=.02||e.applying!==p.applying)?[{contact:key(e),orbBefore:Number(p.orb.toFixed(3)),orbNow:Number(e.orb.toFixed(3)),applying:e.applying}]:[]});
 return {entered,exited,changed,stable:!entered.length&&!exited.length&&!changed.length};
}
export function distinctParagraphs(text:string){
 const seen=new Set<string>();
 return text.split(/\n\s*\n/).filter(p=>{const key=p.toLocaleLowerCase().replace(/[\s\p{P}\p{S}]+/gu,'');if(!key||seen.has(key))return false;seen.add(key);return true}).join('\n\n');
}
