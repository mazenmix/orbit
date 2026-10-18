import {exactCrossings,type SkyReader} from './timing.ts';
export type MoonSunState={sunLongitude:number;moonLongitude:number;moonLatitude:number};
export type MoonSunReader=(instant:Date)=>MoonSunState;
export type Lunation={at:Date;phase:'new'|'full';moonLatitude:number;nearNode:boolean;screeningThresholdDegrees:number};
/** A numerical NEW/FULL MOON and lunar-node proximity scanner.
 * Near-node lunations are NOT verified solar/lunar eclipses: global visibility,
 * occultation geometry, contact times and eclipse types require a dedicated
 * Swiss eclipse search API that the current WASM wrapper does not expose.
 */
export function scanLunations(from:Date,days:number,read:MoonSunReader):Lunation[]{
 if(!Number.isFinite(+from)||!Number.isInteger(days)||days<1||days>180)throw Error('Invalid scan range');
 const until=new Date(+from+days*86400000);
 const memo=new Map<number,MoonSunState>();
 const sample=(instant:Date)=>{const key=+instant;let s=memo.get(key);if(!s){s=read(instant);if(![s.sunLongitude,s.moonLongitude,s.moonLatitude].every(Number.isFinite))throw Error('Missing lunar or solar ephemeris');memo.set(key,s)}return s};
 const sky:SkyReader=d=>{const s=sample(d);return [{id:'Sun',longitude:s.sunLongitude},{id:'Moon',longitude:s.moonLongitude}]};
 const threshold=2; // liberal candidate screening, not an eclipse detection threshold
 const results:Lunation[]=[];
 for(const [angle,phase] of [[0,'new'],[180,'full']] as const){
  const events=exactCrossings(sky,'Moon','Sun',angle,from,until,4);
  for(const event of events){
   const lat=sample(event.time).moonLatitude;
   results.push({at:event.time,phase,moonLatitude:Number(lat.toFixed(4)),nearNode:Math.abs(lat)<=threshold,screeningThresholdDegrees:threshold});
  }
 }
 return results.sort((a,b)=>+a.at-(+b.at));
}
