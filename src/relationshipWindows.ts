import type {Category,Dimension} from './math.ts';
import {Temporal} from '@js-temporal/polyfill';
export type RelationshipWindow={day:Date;message:number;date:number;steadiness:number;best:'message'|'date';messageTheme:'communication';dateTheme:'love';source:{communication:number;love:number;energy:number;emotions:number}};
const bound=(n:number)=>Math.max(1,Math.min(99,Math.round(n)));
/** A descriptive comparison of symbolic calendar samples with static synastry.
 * This CANNOT infer if/when someone will contact, consent, meet or reply.
 */
export function relationshipWindows(from:Date,dimensions:Record<Dimension,number>,read:(date:Date)=>Record<Category,number>,days=21,zone?:string):RelationshipWindow[]{
 if(!Number.isFinite(+from)||!Number.isInteger(days)||days<1||days>31)throw Error('Invalid relationship window');
 // A missing or corrupt compatibility dimension otherwise makes NaN survive
 // Math.min/Math.max clamping and appear as a calculated daily forecast.
 const required:readonly Dimension[]=['attraction','sexual','emotional','communication','stability','conflict'];
 if(required.some(key=>!Number.isFinite(dimensions[key])||dimensions[key]<1||dimensions[key]>99))
  throw Error('Invalid relationship compatibility dimension');
 const results:RelationshipWindow[]=[];
 // When a historical IANA zone is supplied, sample at noon on each *local* calendar date.
 // This avoids labeling a different local day across daylight-saving transitions.
 const firstLocal=zone?Temporal.Instant.fromEpochMilliseconds(+from).toZonedDateTimeISO(zone).toPlainDate():null;
 for(let i=0;i<days;i++){
  const day=firstLocal?new Date(firstLocal.add({days:i}).toPlainDateTime({hour:12}).toZonedDateTime(zone!,{disambiguation:'reject'}).epochMilliseconds):new Date(+from+i*86400000);
  const scores=read(day);
  if(!scores||!['love','communication','energy','emotions'].every(c=>{
   const value=scores[c as Category];
   return Number.isFinite(value)&&value>=1&&value<=99;
  }))throw Error('Missing or invalid symbolic relationship calendar score');
  const message=bound(scores.communication*.58+dimensions.communication*.27+dimensions.stability*.15);
  const date=bound(scores.love*.48+scores.energy*.12+dimensions.attraction*.25+dimensions.emotional*.15);
  const steadiness=bound(dimensions.stability*.54+(100-dimensions.conflict)*.26+scores.emotions*.20);
  results.push({day,message,date,steadiness,best:date>message?'date':'message',messageTheme:'communication',dateTheme:'love',source:{communication:scores.communication,love:scores.love,energy:scores.energy,emotions:scores.emotions}});
 }
 return results;
}
export function bestWindows(list:readonly RelationshipWindow[],mode:'message'|'date',count=3){
 if(!list.length||!Number.isInteger(count)||count<1||count>10||!['message','date'].includes(mode)||
  list.some(row=>!Number.isFinite(+row.day)||!Number.isFinite(row[mode])||row[mode]<1||row[mode]>99))
  throw Error('Invalid relationship ranking');
 return [...list].sort((a,b)=>b[mode]-a[mode]||+a.day-+b.day).slice(0,count);
}
