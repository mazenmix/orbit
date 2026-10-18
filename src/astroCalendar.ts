import {aspects,normalize,distance,type Evidence,type Point} from './math.ts';
export type CalendarColor='green'|'yellow'|'red';
export type AstroCalendarDay={iso:string;year:number;month:number;day:number;weekday:number;monthKey:string};
export type AstroCalendarRating={
 value:number;color:CalendarColor;favorableWeight:number;challengingWeight:number;considered:number;
 strongestSupport:Evidence|null;strongestChallenge:Evidence|null;
};
/** User-facing fortune palette is a transparent *astrological* interpretation of
 * precisely calculated natal-transit aspects, not a measurement of real luck.
 * We do not invent contacts or label a day dangerous/unsafe.
 *
 * Trines and sextiles contribute favorable symbolism. Squares and oppositions
 * contribute challenging symbolism. Conjunctions are favorable when Venus/
 * Jupiter is transiting, challenging for Mars/Saturn/Pluto/Uranus; other
 * conjunctions are neutral. Applying contacts have a small salience boost.
 * A contact's score already incorporates planet relevance and proximity; we
 * also expose the actual angular orb and the summed weights in the day detail.
 */
export function fortuneContactTone(e:Evidence): -1|0|1{
 if(e.angle===60||e.angle===120)return 1;
 if(e.angle===90||e.angle===180)return -1;
 if(e.angle===0){
  if(e.transit.id==='Venus'||e.transit.id==='Jupiter')return 1;
  if(['Mars','Saturn','Pluto','Uranus'].includes(e.transit.id))return -1;
 }
 return 0;
}
export function fortuneContactWeight(e:Evidence):number{
 if(!Number.isFinite(e.orb)||!Number.isFinite(e.maximumOrb)||!Number.isFinite(e.weight)||
    e.maximumOrb<=0||e.orb<0||e.orb>e.maximumOrb||e.weight<0||e.weight>1)
  throw Error('Invalid calculated aspect');
 const proximity=Math.max(0,1-e.orb/e.maximumOrb);
 const relevance=['Sun','Moon','Ascendant'].includes(e.natal.id)?1.13:
  ['Venus','Jupiter'].includes(e.natal.id)?1.08:1;
 return e.weight*(.45+.55*proximity)*(e.applying?1.08:1)*relevance;
}
/** Consistent, monotonic user-selected thresholds. Values are integers:
 * 1–30 red; 31–70 yellow; 71–99 green. 30 and 70 are inclusive below.
 */
export function calendarColorForScore(value:number):CalendarColor{
 if(!Number.isInteger(value)||value<1||value>99)throw Error('Invalid astrological index');
 return value<=30?'red':value<=70?'yellow':'green';
}
export function colorizeAstroDay(evidence:readonly Evidence[]):AstroCalendarRating{
 let favorableWeight=0,challengingWeight=0,strongestSupport:Evidence|null=null,strongestChallenge:Evidence|null=null;
 let highestSupport=0,highestChallenge=0,considered=0;
 for(const e of evidence){
  const tone=fortuneContactTone(e);
  if(tone===0)continue;
  const weight=fortuneContactWeight(e);
  considered++;
  if(tone===1){favorableWeight+=weight;if(weight>highestSupport){strongestSupport=e;highestSupport=weight}}
  else {challengingWeight+=weight;if(weight>highestChallenge){strongestChallenge=e;highestChallenge=weight}}
 }
 // Neutral (50) if no active aspects. Shrink extreme scores when evidence is
 // sparse so that a single weak contact never looks like certain good/bad luck.
 const balance=(favorableWeight-challengingWeight)/(favorableWeight+challengingWeight+1.1);
 const value=Math.max(1,Math.min(99,Math.round(50+44*balance)));
 return {
  value,color:calendarColorForScore(value),
  favorableWeight:Number(favorableWeight.toFixed(3)),
  challengingWeight:Number(challengingWeight.toFixed(3)),considered,
  strongestSupport,strongestChallenge
 };
}

/** Three evenly spaced checks across the local day, instead of a noon-only
 * snapshot. A complete major-planet vector is mandatory for each check. */
export const CALENDAR_SAMPLE_HOURS=[4,12,20] as const;
const primaryBodies=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'] as const;
export type CalendarChart={points:readonly Point[];asc?:number|null;mc?:number|null};
export type CalendarSample={hour:(typeof CALENDAR_SAMPLE_HOURS)[number];evidence:readonly Evidence[]};
export type CalendarDayRating=AstroCalendarRating & {
 sampleHours:number[];sampleScores:number[];minimum:number;maximum:number;
 strongestSupportHour:number|null;strongestChallengeHour:number|null;
};
function bodyMap(c:CalendarChart,required:readonly string[]):Map<string,Point>{
 const byName=new Map<string,Point>();
 for(const pt of c.points){
  if(!required.includes(pt.id))continue;
  if(byName.has(pt.id))throw Error('Duplicate ephemeris body: '+pt.id);
  if(!Number.isFinite(pt.longitude)||pt.longitude<0||pt.longitude>=360||!Number.isFinite(pt.speed))throw Error('Invalid ephemeris coordinates for '+pt.id);
  byName.set(pt.id,pt);
 }
 for(const id of required)if(!byName.has(id))throw Error('Missing required ephemeris body: '+id);
 return byName;
}
/** Contacts are calculated independently for all ten primary transiting
 * bodies, not from report.evidence (which caps its strongest 48 contacts and
 * also includes minor bodies). Unknown birth time never contributes a
 * fabricated natal Moon or Ascendant/MC to the calendar.
 */
export function calendarMomentEvidence(current:CalendarChart,natal:CalendarChart,at:Date,knownTime:boolean):Evidence[]{
 if(!Number.isFinite(+at))throw Error('Invalid calendar sample instant');
 const transit=bodyMap(current,primaryBodies);
 const natalRequired=knownTime?primaryBodies:primaryBodies.filter(id=>id!=='Moon');
 const birth=bodyMap(natal,natalRequired);
 const fixed:Point[]=[...natalRequired.map(id=>birth.get(id)!)];
 if(knownTime)for(const [id,longitude] of [['Ascendant',natal.asc],['MC',natal.mc]] as const){
  if(longitude!==null&&longitude!==undefined){
   if(!Number.isFinite(longitude)||longitude<0||longitude>=360)throw Error('Invalid natal '+id);
   fixed.push({id,symbol:id==='MC'?'MC':'ASC',longitude,speed:0});
  }
 }
 const results:Evidence[]=[];
 for(const id of primaryBodies){
  // A six-hour linear lookahead can jump over the Moon's exact contact and
  // invert "applying". Use a one-minute derivative at the actual longitude
  // and keep only the observed orb; no fictitious time-of-exactness.
  for(const contact of aspects([transit.get(id)!],fixed,at)){
   const step=Math.sign(contact.transit.speed)*Math.min(Math.abs(contact.transit.speed)/1440,contact.orb/3);
   const oneMinute=normalize(contact.transit.longitude+step);
   const nextOrb=Math.abs(distance(oneMinute,contact.natal.longitude)-contact.angle);
   results.push({...contact,applying:nextOrb+1e-10<contact.orb,exact:null});
  }
 }
 return results;
}
/** Mean of verified checkpoints, with the sampled range shown to users.
 * This preserves a neutral score for no evidence and exposes intraday
 * variation instead of claiming the local-noon value describes 24 hours.
 */
export function calendarDaySynthesis(samples:readonly CalendarSample[]):CalendarDayRating{
 if(samples.length!==CALENDAR_SAMPLE_HOURS.length||
    samples.some((s,i)=>s.hour!==CALENDAR_SAMPLE_HOURS[i]))throw Error('Incomplete or unordered calendar day samples');
 const rated=samples.map(s=>colorizeAstroDay(s.evidence));
 const value=Math.round(rated.reduce((sum,r)=>sum+r.value,0)/rated.length);
 let strongestSupport:Evidence|null=null,strongestChallenge:Evidence|null=null;
 let strongestSupportHour:number|null=null,strongestChallengeHour:number|null=null;
 let supportWeight=0,challengeWeight=0;
 for(let i=0;i<rated.length;i++){
  const r=rated[i],hour=samples[i].hour;
  if(r.strongestSupport){
   const w=fortuneContactWeight(r.strongestSupport);
   if(w>supportWeight){supportWeight=w;strongestSupport=r.strongestSupport;strongestSupportHour=hour}
  }
  if(r.strongestChallenge){
   const w=fortuneContactWeight(r.strongestChallenge);
   if(w>challengeWeight){challengeWeight=w;strongestChallenge=r.strongestChallenge;strongestChallengeHour=hour}
  }
 }
 return {
  value,color:calendarColorForScore(value),
  sampleHours:samples.map(s=>s.hour),sampleScores:rated.map(r=>r.value),
  minimum:Math.min(...rated.map(r=>r.value)),maximum:Math.max(...rated.map(r=>r.value)),
  favorableWeight:Number((rated.reduce((sum,r)=>sum+r.favorableWeight,0)/rated.length).toFixed(3)),
  challengingWeight:Number((rated.reduce((sum,r)=>sum+r.challengingWeight,0)/rated.length).toFixed(3)),
  considered:rated.reduce((sum,r)=>sum+r.considered,0),
  strongestSupport,strongestChallenge,strongestSupportHour,strongestChallengeHour
 };
}

/** Exactly twelve calendar months from the visitor's today (exclusive of the
 * same date next year). Leap years and month lengths are handled in UTC. */
export function astroCalendarDays(today:string):AstroCalendarDay[]{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(today))throw Error('Invalid calendar anchor');
 const [y,m,d]=today.split('-').map(Number);
 const first=new Date(Date.UTC(y,m-1,d));
 if(first.toISOString().slice(0,10)!==today)throw Error('Invalid calendar date');
 const end=new Date(Date.UTC(y,m-1+12,d));
 const days:AstroCalendarDay[]=[];
 for(let time=+first;time<+end;time+=86400000){
  const at=new Date(time),year=at.getUTCFullYear(),month=at.getUTCMonth()+1,day=at.getUTCDate();
  days.push({iso:at.toISOString().slice(0,10),year,month,day,weekday:(at.getUTCDay()+6)%7,monthKey:year+'-'+String(month).padStart(2,'0')});
 }
 return days;
}
