import type {Category,Dimension} from './math.ts';
import {Temporal} from '@js-temporal/polyfill';
export type RelationshipWindow={day:Date;message:number;date:number;steadiness:number;best:'message'|'date';messageTheme:'communication';dateTheme:'love';source:{communication:number;love:number;energy:number;emotions:number}};
const bound=(n:number)=>Math.max(1,Math.min(99,Math.round(n)));
/** A descriptive comparison of symbolic calendar samples with static synastry.
 * This CANNOT infer if/when someone will contact, consent, meet or reply.
 */
export function relationshipWindows(from:Date,dimensions:Record<Dimension,number>,read:(date:Date)=>Record<Category,number>,days=21,zone?:string):RelationshipWindow[]{
 if(!Number.isFinite(+from)||!Number.isInteger(days)||days<1||days>31)throw Error('Invalid relationship window');
 const results:RelationshipWindow[]=[];
 // When a historical IANA zone is supplied, sample at noon on each *local* calendar date.
 // This avoids labeling a different local day across daylight-saving transitions.
 const firstLocal=zone?Temporal.Instant.fromEpochMilliseconds(+from).toZonedDateTimeISO(zone).toPlainDate():null;
 for(let i=0;i<days;i++){
  const day=firstLocal?new Date(firstLocal.add({days:i}).toPlainDateTime({hour:12}).toZonedDateTime(zone!,{disambiguation:'reject'}).epochMilliseconds):new Date(+from+i*86400000);
  const scores=read(day);
  if(!['love','communication','energy','emotions'].every(c=>Number.isFinite(scores[c as Category])))throw Error('Missing symbolic relationship calendar score');
  const message=bound(scores.communication*.58+dimensions.communication*.27+dimensions.stability*.15);
  const date=bound(scores.love*.48+scores.energy*.12+dimensions.attraction*.25+dimensions.emotional*.15);
  const steadiness=bound(dimensions.stability*.54+(100-dimensions.conflict)*.26+scores.emotions*.20);
  results.push({day,message,date,steadiness,best:date>message?'date':'message',messageTheme:'communication',dateTheme:'love',source:{communication:scores.communication,love:scores.love,energy:scores.energy,emotions:scores.emotions}});
 }
 return results;
}
export function bestWindows(list:readonly RelationshipWindow[],mode:'message'|'date',count=3){
 if(!list.length||!Number.isInteger(count)||count<1||count>10)throw Error('Invalid relationship ranking');
 return [...list].sort((a,b)=>b[mode]-a[mode]||+a.day-+b.day).slice(0,count);
}
