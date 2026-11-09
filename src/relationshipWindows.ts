import type {Category,Dimension} from './math.ts';
import {Temporal} from '@js-temporal/polyfill';
export type RelationshipWindow={day:Date;message:number|null;date:number|null;steadiness:number|null;best:'message'|'date'|null;messageTheme:'communication';dateTheme:'love';source:{communication:number;love:number;energy:number;emotions:number}};
type DailyReading={scores:Record<Category,number>;signals:readonly {category:Category}[]};
type WindowOptions={romantic:boolean;coverage:Record<Dimension,boolean>};
const bound=(n:number)=>Math.max(1,Math.min(99,Math.round(n)));
/** A descriptive comparison of symbolic calendar samples with static synastry.
 * This CANNOT infer if/when someone will contact, consent, meet or reply.
 */
export function relationshipWindows(from:Date,dimensions:Record<Dimension,number>,read:(date:Date)=>DailyReading,days=21,zone?:string,options?:WindowOptions):RelationshipWindow[]{
 if(!Number.isFinite(+from)||!Number.isInteger(days)||days<1||days>31)throw Error('Invalid relationship window');
 // A missing or corrupt compatibility dimension otherwise makes NaN survive
 // Math.min/Math.max clamping and appear as a calculated daily forecast.
 const romantic=options?.romantic??true;
 const required:readonly Dimension[]=romantic?['attraction','sexual','emotional','communication','stability','conflict']:['emotional','communication','stability','conflict'];
 if(required.some(key=>!Number.isFinite(dimensions[key])||dimensions[key]<1||dimensions[key]>99))
  throw Error('Invalid relationship compatibility dimension');
 const results:RelationshipWindow[]=[];
 // When a historical IANA zone is supplied, sample at noon on each *local* calendar date.
 // This avoids labeling a different local day across daylight-saving transitions.
 const firstLocal=zone?Temporal.Instant.fromEpochMilliseconds(+from).toZonedDateTimeISO(zone).toPlainDate():null;
 for(let i=0;i<days;i++){
  const day=firstLocal?new Date(firstLocal.add({days:i}).toPlainDateTime({hour:12}).toZonedDateTime(zone!,{disambiguation:'reject'}).epochMilliseconds):new Date(+from+i*86400000);
  const reading=read(day),scores=reading?.scores;
  if(!scores||!['love','communication','energy','emotions'].every(c=>{
   const value=scores[c as Category];
   return Number.isFinite(value)&&value>=1&&value<=99;
  }))throw Error('Missing or invalid symbolic relationship calendar score');
  if(!Array.isArray(reading.signals))throw Error('Missing relationship calendar evidence coverage');
  const observed=new Set(reading.signals.map(s=>s.category));
  const covered=(...keys:Dimension[])=>keys.every(key=>options===undefined||options.coverage[key]===true);
  // Static compatibility plus a neutral default cannot establish a dated
  // opportunity. Require evidence for EVERY input of the selected formula.
  const message=observed.has('communication')&&covered('communication','stability')?
   bound(scores.communication*.58+dimensions.communication*.27+dimensions.stability*.15):null;
  const date=romantic&&observed.has('love')&&observed.has('energy')&&covered('attraction','emotional')?
   bound(scores.love*.48+scores.energy*.12+dimensions.attraction*.25+dimensions.emotional*.15):null;
  const steadiness=observed.has('emotions')&&covered('stability','conflict')?
   bound(dimensions.stability*.54+(100-dimensions.conflict)*.26+scores.emotions*.20):null;
  const best=date===null?(message===null?null:'message'):message===null||date>message?'date':'message';
  results.push({day,message,date,steadiness,best,messageTheme:'communication',dateTheme:'love',source:{communication:scores.communication,love:scores.love,energy:scores.energy,emotions:scores.emotions}});
 }
 return results;
}
export function bestWindows(list:readonly RelationshipWindow[],mode:'message'|'date',count=3){
 if(!Number.isInteger(count)||count<1||count>10||!['message','date'].includes(mode)||
  list.some(row=>{
   const value=row[mode];
   return !Number.isFinite(+row.day)||(value!==null&&(!Number.isFinite(value)||value<1||value>99));
  }))
  throw Error('Invalid relationship ranking');
 return list.filter(row=>row[mode]!==null).sort((a,b)=>b[mode]!-a[mode]!||+a.day-+b.day).slice(0,count);
}
