import type {Evidence} from './math.ts';
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
