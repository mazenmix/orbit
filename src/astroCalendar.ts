import {aspects,type Evidence,type Point} from './math.ts';
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
 * 1–29 red; 30–70 yellow; 71–99 green. Both 30 and 70 are yellow.
 */
export function calendarColorForScore(value:number):CalendarColor{
 if(!Number.isInteger(value)||value<1||value>99)throw Error('Invalid astrological index');
 return value<30?'red':value<=70?'yellow':'green';
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
  // Same instantaneous-motion rubric as Today and Time Machine.
  results.push(...aspects([transit.get(id)!],fixed,at));
 }
 return results;
}
/** Average only checkpoints with actual relevant contacts. A checkpoint
 * without evidence is unavailable, not a neutral 50; no evidence across all
 * samples yields a hidden (considered=0) internal unavailable sentinel.
 */
export function calendarDaySynthesis(samples:readonly CalendarSample[]):CalendarDayRating{
 if(samples.length!==CALENDAR_SAMPLE_HOURS.length||
    samples.some((s,i)=>s.hour!==CALENDAR_SAMPLE_HOURS[i]))throw Error('Incomplete or unordered calendar day samples');
 const rated=samples.map(s=>colorizeAstroDay(s.evidence));
 const supported=rated.filter(r=>r.considered>0);
 const value=supported.length?Math.round(supported.reduce((sum,r)=>sum+r.value,0)/supported.length):0;
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
  value,color:supported.length?calendarColorForScore(value):'yellow',
  sampleHours:samples.map(s=>s.hour),sampleScores:rated.map(r=>r.considered>0?r.value:0),
  minimum:supported.length?Math.min(...supported.map(r=>r.value)):0,
  maximum:supported.length?Math.max(...supported.map(r=>r.value)):0,
  favorableWeight:Number((supported.length?supported.reduce((sum,r)=>sum+r.favorableWeight,0)/supported.length:0).toFixed(3)),
  challengingWeight:Number((supported.length?supported.reduce((sum,r)=>sum+r.challengingWeight,0)/supported.length:0).toFixed(3)),
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
 // Constrain a Feb 29 anniversary to Feb 28, rather than overflowing to Mar 1.
 const lastDay=new Date(Date.UTC(y+1,m,0)).getUTCDate();
 const end=new Date(Date.UTC(y+1,m-1,Math.min(d,lastDay)));
 const days:AstroCalendarDay[]=[];
 for(let time=+first;time<+end;time+=86400000){
  const at=new Date(time),year=at.getUTCFullYear(),month=at.getUTCMonth()+1,day=at.getUTCDate();
  days.push({iso:at.toISOString().slice(0,10),year,month,day,weekday:(at.getUTCDay()+6)%7,monthKey:year+'-'+String(month).padStart(2,'0')});
 }
 return days;
}

/** The 12 visible calendar cards start with the current month and end with
 * the eleventh following month, in chronological order. A rolling 365-day
 * source may include a thirteenth partial month; that extra card is omitted.
 */
export function firstTwelveCalendarMonths(days:readonly AstroCalendarDay[]):AstroCalendarDay[]{
 const monthKeys=new Set<string>();
 const result:AstroCalendarDay[]=[];
 for(const day of days){
  if(!monthKeys.has(day.monthKey)){
   if(monthKeys.size===12)break;
   monthKeys.add(day.monthKey);
  }
  result.push(day);
 }
 return result;
}

/** Explicit Monday-first grid coordinates prevent RTL parent layouts from
 * moving date cells under the wrong weekday header.
 * weekday zero is Monday and six is Sunday.
 */
export function astroCalendarGridPosition(firstWeekday:number,dayOffset:number):{column:number;row:number}{
 if(!Number.isInteger(firstWeekday)||firstWeekday<0||firstWeekday>6||
    !Number.isInteger(dayOffset)||dayOffset<0)throw Error('Invalid calendar grid position');
 const index=firstWeekday+dayOffset;
 return {column:index%7+1,row:Math.floor(index/7)+1};
}
