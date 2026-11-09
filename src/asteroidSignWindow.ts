import type {AsteroidSwiss} from './asteroidRuntime.ts';

/** Measured (not extrapolated) zodiac sign stay for a numbered asteroid.
 * The 0–100 gauge tracks elapsed TIME between exact sign boundary crossings,
 * including stations, retrogrades, and short re-entries into an old sign.
 */
export type AsteroidSignWindow={enteredAt:number;ingressAt:number;sign:number};
export type AsteroidSignGauge={percent:number;remainingMs:number;band:'green'|'orange'|'red'};
const DAY=86_400_000, HOUR=3_600_000;
const sign=(lon:number)=>Math.floor((((lon%360)+360)%360)/30);
export function asteroidGaugeBand(percent:number):AsteroidSignGauge['band']{
 return percent<=60?'green':percent<=90?'orange':'red';
}
export function asteroidSignGauge(window:AsteroidSignWindow,at:Date):AsteroidSignGauge|null{
 const now=+at;
 if(!Number.isFinite(now)||!Number.isFinite(window.enteredAt)||!Number.isFinite(window.ingressAt)||
  window.ingressAt<=window.enteredAt||now<window.enteredAt||now>=window.ingressAt)return null;
 const percent=Math.min(100,Math.max(0,Math.round(100*(now-window.enteredAt)/(window.ingressAt-window.enteredAt))));
 return {percent,remainingMs:Math.max(0,window.ingressAt-now),band:asteroidGaugeBand(percent)};
}

/** Asynchronous Swiss-Ephemeris sign-ingress search. A bounded step that
 * adapts to measured motion detects the FIRST crossing in each direction.
 * No linear future-speed estimate is used for dates or for percentages.
 */
export async function findAsteroidSignWindow(
 swiss:Pick<AsteroidSwiss,'calc_ut'>,swissBodyId:number,at:Date,
 options:{maxDays?:number;yieldEvery?:number}={}
):Promise<AsteroidSignWindow>{
 if(!Number.isFinite(+at)||!Number.isInteger(swissBodyId)||swissBodyId<10001)throw Error('Invalid asteroid sign inquiry');
 const maxDays=options.maxDays??560;
 if(!Number.isFinite(maxDays)||maxDays<=0)throw Error('Invalid sign search window');
 const yieldEvery=options.yieldEvery??24;
 const cache=new Map<number,{longitude:number;speed:number;sign:number}>();
 let queries=0;
 const read=async(time:number)=>{
  const cached=cache.get(time);if(cached)return cached;
  if(++queries%yieldEvery===0)await new Promise<void>(resolve=>setTimeout(resolve,0));
  const jd=time/DAY+2440587.5;
  const row=swiss.calc_ut(jd,swissBodyId,2|256);
  if(!row||!Number.isFinite(row[0])||!Number.isFinite(row[3]))throw Error('Swiss asteroid position is unavailable');
  const result={longitude:((row[0]%360)+360)%360,speed:row[3],sign:sign(row[0])};
  cache.set(time,result);
  return result;
 };
 const starting=await read(+at),currentSign=starting.sign;
 const limit=maxDays*DAY;
 const crossing=async(direction:1|-1)=>{
  let previous=+at;
  for(;;){
   const previousRow=await read(previous);
   // Keep adjacent samples within roughly 1.2° at the observed speed;
   // two-day cap handles slow-moving and briefly stationary asteroids.
   const step=Math.min(2*DAY,Math.max(HOUR,1.2/Math.max(Math.abs(previousRow.speed),.025)*DAY));
   const next=previous+direction*step;
   if(Math.abs(next-(+at))>limit)throw Error('No verified sign boundary within search horizon');
   const row=await read(next);
   if(row.sign!==currentSign){
    let lo=Math.min(previous,next),hi=Math.max(previous,next);
    for(let i=0;hi-lo>60_000&&i<40;i++){
     const mid=(lo+hi)/2,value=await read(mid);
     if(direction===1){
      if(value.sign===currentSign)lo=mid;else hi=mid;
     }else{
      if(value.sign===currentSign)hi=mid;else lo=mid;
     }
    }
    return Math.round((lo+hi)/2);
   }
   previous=next;
  }
 };
 const enteredAt=await crossing(-1),ingressAt=await crossing(1);
 if(!(enteredAt<=+at&&+at<ingressAt))throw Error('Verified asteroid ingress interval is inconsistent');
 return {enteredAt,ingressAt,sign:currentSign};
}
