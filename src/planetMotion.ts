import {bisectAngle} from './timing.ts';
import type {Point} from './math.ts';

/** Retrograde stations are the zero crossings of geocentric ecliptic longitude
 * velocity from the Swiss ephemeris. Sun and Moon have no retrograde cycle.
 * A past and a future root are required to compute a meaningful percentage.
 */
export const STATION_BODIES=['Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'] as const;
export type StationBody=typeof STATION_BODIES[number];
export type MotionCycle={id:StationBody;retrograde:boolean;startedAt:Date|null;endsAt:Date|null};
type SpeedPoint=Pick<Point,'id'|'speed'>;
const DAY=86400000,STEP_DAYS=5,MAX_DAYS=1000;
const clamp=(value:number)=>Math.max(0,Math.min(100,value));
export function remainingMotionPercent(start:number,end:number,now:number):number|null{
 if(![start,end,now].every(Number.isFinite)||end<=start)return null;
 return Math.round(clamp(100*(end-now)/(end-start)));
}
/** Calendar-aware years and months (no fixed 30-day month assumption). */
function addMonthsUTC(date:Date,months:number):Date{
 const year=date.getUTCFullYear(),month=date.getUTCMonth()+months;
 const day=date.getUTCDate();
 const first=new Date(Date.UTC(year,month,1,date.getUTCHours(),date.getUTCMinutes(),date.getUTCSeconds(),date.getUTCMilliseconds()));
 const end=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
 first.setUTCDate(Math.min(day,end));
 return first;
}
export function motionTimeRemaining(now:number,end:number,language:'ar'|'en',compact=false):string{
 if(!Number.isFinite(now)||!Number.isFinite(end))return language==='ar'?'الوقت غير متاح':'Time unavailable';
 if(now>=end)return compact?(language==='ar'?'انتهى':'Ended'):(language==='ar'?'انتهت الفترة':'Period ended');
 const base=new Date(now);
 let months=0;
 while(months<120&&+addMonthsUTC(base,months+1)<=end)months++;
 const years=Math.floor(months/12),calendarMonths=months%12;
 const rest=end-(+addMonthsUTC(base,months));
 const days=Math.floor(rest/DAY),hours=Math.floor(rest%DAY/3600000),minutes=Math.ceil(rest%3600000/60000);
 const words=language==='ar'
  ?[[years,'سنة'],[calendarMonths,'شهر'],[days,'يوم'],[hours,'ساعة'],[minutes,'دقيقة']] as const
  :[[years,'y'],[calendarMonths,'mo'],[days,'d'],[hours,'h'],[minutes,'min']] as const;
 const significant=words.filter(([n])=>n>0);
 if(compact){
  const abbreviations=language==='ar'?['سنة','ش','ي','س','د']:['y','mo','d','h','m'];
  const compactUnits=words.map(([n],i)=>[n,abbreviations[i]] as const).filter(([n])=>n>0);
  return (compactUnits.length?compactUnits.slice(0,3):[[1,language==='ar'?'د':'m']]).map(([n,unit])=>String(n)+unit).join(' · ');
 }
 return (significant.length?significant.slice(0,3):[[1,language==='ar'?'دقيقة':'min']]).map(([n,unit])=>n+' '+unit).join(' · ');
}
/** Search in both directions in five-day steps and refine the two *actual*
 * speed-sign crossing times to approximately one minute.
 *
 * Chunk scheduling is supplied by the UI so the search cannot monopolize the
 * browser's main thread while it samples months/years of ephemeris positions.
 */
export async function scanMotionCycles(
 at:Date,
 read:(date:Date)=>readonly SpeedPoint[],
 yieldToUI?:()=>Promise<void>,
 ids:readonly StationBody[]=STATION_BODIES
):Promise<MotionCycle[]>{
 if(!Number.isFinite(+at))throw Error('Invalid motion phase instant');
 if(!ids.length)return [];
 const now=+at,cache=new Map<number,Map<StationBody,number>>();
 const sample=(ms:number)=>{
  let found=cache.get(ms);
  if(!found){
   const points=read(new Date(ms));
   found=new Map();
   for(const id of ids){
    const values=points.filter(p=>p.id===id);
    if(values.length!==1||!Number.isFinite(values[0].speed))throw Error('Missing verified planet speed: '+id);
    found.set(id,values[0].speed);
   }
   cache.set(ms,found);
  }
  return found;
 };
 const nowSpeed=sample(now);
 const result=ids.map(id=>({id,retrograde:nowSpeed.get(id)!<0,startedAt:null,endsAt:null} as MotionCycle));
 let nearPast=nowSpeed,nearFuture=nowSpeed;
 let nearPastAt=now,nearFutureAt=now;
 for(let days=STEP_DAYS;days<=MAX_DAYS;days+=STEP_DAYS){
  const oldTime=now-days*DAY,newTime=now+days*DAY;
  const past=sample(oldTime),future=sample(newTime);
  for(const period of result){
   const id=period.id;
   if(!period.startedAt&&((past.get(id)!<0)!==(nearPast.get(id)!<0))){
    const root=bisectAngle(ms=>sample(ms).get(id)!,oldTime,nearPastAt,1);
    if(root)period.startedAt=root;
   }
   if(!period.endsAt&&((future.get(id)!<0)!==(nearFuture.get(id)!<0))){
    const root=bisectAngle(ms=>sample(ms).get(id)!,nearFutureAt,newTime,1);
    if(root)period.endsAt=root;
   }
  }
  if(result.every(p=>p.startedAt&&p.endsAt))break;
  nearPast=past;nearFuture=future;nearPastAt=oldTime;nearFutureAt=newTime;
  if(yieldToUI&&days%(STEP_DAYS*6)===0)await yieldToUI();
 }
 // The interface must not manufacture dates or percentage for missing roots.
 return result;
}
