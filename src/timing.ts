/** Deterministic lunar timing and root searches. Numeric positions must come from Swiss Ephemeris.
 * Conventional VOC: the period after the Moon's final exact Ptolemaic aspect
 * to Sun, Mercury, Venus, Mars, Jupiter or Saturn until the next sign ingress.
 * Chosen convention is explicit, because astrologers use different rules.
 */
export type SkyBody={id:string;longitude:number};
export type SkyReader=(time:Date)=>SkyBody[];
export type ExactEvent={time:Date;transit:string;target:string;angle:number;phase:number};
export type LunarWindow={at:Date;sign:number;enteredAt:Date;ingressAt:Date;vocStartsAt:Date;isVoid:boolean;lastAspect:ExactEvent|null;events:ExactEvent[];convention:string};
const HOUR=3600000;
const zodiac=(longitude:number)=>Math.floor((((longitude%360)+360)%360)/30);
const error=(longitude:number,target:number)=>((((longitude-target)%360)+540)%360)-180;
const phases=(angle:number)=>angle===0?[0]:angle===180?[180]:[angle,-angle];
const classic=['Sun','Mercury','Venus','Mars','Jupiter','Saturn'];
const aspects=[0,60,90,120,180];
export function bisectAngle(fn:(ms:number)=>number,a:number,b:number,minutes=1){
 let fa=fn(a),fb=fn(b);
 if(!Number.isFinite(fa)||!Number.isFinite(fb)||fa*fb>0||Math.abs(fa-fb)>180)return null;
 for(let i=0;i<50&&b-a>minutes*60000;i++){
  const mid=(a+b)/2,fm=fn(mid);
  if(!Number.isFinite(fm))return null;
  if(fa*fm<=0){b=mid;fb=fm}else{a=mid;fa=fm}
 }
 return new Date(Math.round((a+b)/2/60000)*60000);
}
export function exactCrossings(read:SkyReader,transit:string,target:string,angle:number,from:Date,to:Date,stepHours=3):ExactEvent[]{
 if(+to<=+from||!aspects.includes(angle)||stepHours<=0)throw Error('Invalid exact-crossing scan');
 const cache=new Map<number,SkyBody[]>();
 const positions=(t:number)=>{let p=cache.get(t);if(!p){p=read(new Date(t));cache.set(t,p)}return p};
 const diff=(ms:number,phase:number)=>{const p=positions(ms),a=p.find(b=>b.id===transit),b=p.find(b=>b.id===target);if(!a||!b)throw Error('Missing ephemeris body');return error(a.longitude-b.longitude,phase)};
 const events:ExactEvent[]=[];
 for(const phase of phases(angle)){
  let previous=+from,prev=diff(previous,phase);
  for(let t=Math.min(+to,previous+stepHours*HOUR);t>previous;t=Math.min(+to,t+stepHours*HOUR)){
   const next=diff(t,phase);
   if(prev*next<=0&&Math.abs(prev-next)<180){
    const time=bisectAngle(x=>diff(x,phase),previous,t);
    if(time&&!events.some(e=>Math.abs(+e.time-+time)<120000))events.push({time,transit,target,angle,phase});
   }
   if(t===+to)break;
   previous=t;prev=next;
  }
 }
 return events.sort((a,b)=>+a.time-+b.time);
}
export function lunarWindow(at:Date,read:SkyReader):LunarWindow{
 if(!Number.isFinite(+at))throw Error('Invalid instant');
 const cache=new Map<number,SkyBody[]>();
 const get=(ms:number)=>{let v=cache.get(ms);if(!v){v=read(new Date(ms));cache.set(ms,v)}return v};
 const moon=(ms:number)=>{const v=get(ms).find(p=>p.id==='Moon');if(!v)throw Error('Moon ephemeris unavailable');return v.longitude};
 const current=zodiac(moon(+at));
 const ingress=(dir:1|-1)=>{
  let previous=+at;
  for(let i=1;i<=48;i++){
   const next=+at+dir*i*2*HOUR;
   if(zodiac(moon(next))!==current){
    const boundary=(dir===1?(current+1)%12:current)*30;
    const [start,end]=dir===1?[previous,next]:[next,previous];
    const exact=bisectAngle(t=>error(moon(t),boundary),start,end);
    if(!exact)throw Error('Could not refine lunar ingress');
    return exact;
   }
   previous=next;
  }
  throw Error('Lunar ingress outside 96-hour scan; cannot certify VOC');
 };
 const enteredAt=ingress(-1),ingressAt=ingress(1);
 const start=new Date(+enteredAt+60000),end=new Date(+ingressAt-60000);
 const events:ExactEvent[]=[];
 for(const planet of classic){
  if(!get(+at).some(p=>p.id===planet))continue;
  for(const angle of aspects){
   events.push(...exactCrossings(d=>get(+d),'Moon',planet,angle,start,end,3));
  }
 }
 events.sort((a,b)=>+a.time-+b.time);
 const lastAspect=events.length?events[events.length-1]:null;
 const vocStartsAt=lastAspect?.time??enteredAt;
 return {at,sign:current,enteredAt,ingressAt,vocStartsAt,isVoid:+at>=+vocStartsAt,lastAspect,events,
  convention:'Major aspects 0°, 60°, 90°, 120°, 180° to Sun, Mercury, Venus, Mars, Jupiter, Saturn; geocentric tropical longitude'};
}
