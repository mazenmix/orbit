import type {Category} from './math.ts';
export type CalendarColor='green'|'yellow'|'orange'|'red';
export type AstroCalendarDay={iso:string;year:number;month:number;day:number;weekday:number;monthKey:string};
export type AstroCalendarRating={value:number;color:CalendarColor};
/** Astrological visualization only. Four grades describe a *symbolic* mid-day
 * score, never an actual risk warning or empirical prediction of good/bad luck.
 */
export function colorizeAstroDay(scores:Record<Category,number>):AstroCalendarRating{
 const domain=(k:Category)=>{const n=scores[k];if(!Number.isFinite(n)||n<1||n>99)throw Error('Invalid day score');return n};
 const value=Math.round((2*domain('overview')+2*domain('timing')+domain('love')+domain('career')+domain('communication')+domain('energy')+domain('emotions')+domain('recovery'))/10);
 return {value,color:value>=68?'green':value>=56?'yellow':value>=44?'orange':'red'};
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
