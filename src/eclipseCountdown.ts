/** Precise calendar-month countdown to a Swiss Ephemeris eclipse maximum.
 * Months use clamped UTC calendar anniversaries; days/hours/minutes are elapsed time.
 * The instant is timezone-independent, so the display is the same on every device.
 */
export type EclipseCountdown = {months:number;days:number;hours:number;minutes:number};
export function eclipseCountdownParts(now:number,target:number):EclipseCountdown{
 if(!Number.isFinite(now)||!Number.isFinite(target))throw Error('Invalid eclipse countdown time');
 if(target<=now)return {months:0,days:0,hours:0,minutes:0};
 const from=new Date(now),until=new Date(target);
 const monthAt=(offset:number)=>{
  const date=new Date(Date.UTC(from.getUTCFullYear(),from.getUTCMonth()+offset,1,from.getUTCHours(),from.getUTCMinutes(),from.getUTCSeconds(),from.getUTCMilliseconds()));
  const lastDay=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();
  date.setUTCDate(Math.min(from.getUTCDate(),lastDay));
  return +date;
 };
 let months=(until.getUTCFullYear()-from.getUTCFullYear())*12+until.getUTCMonth()-from.getUTCMonth();
 while(months>0&&monthAt(months)>target)months--;
 let remaining=target-monthAt(months);
 const days=Math.floor(remaining/86400000);remaining-=days*86400000;
 const hours=Math.floor(remaining/3600000);remaining-=hours*3600000;
 const minutes=Math.floor(remaining/60000);
 return {months,days,hours,minutes};
}
