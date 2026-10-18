import {exactCrossings,type SkyReader,type ExactEvent} from './timing.ts';
import type {Evidence} from './math.ts';

/** Refine a natal transit against a *fixed natal longitude* by resampling
 * the real transiting body. Unlike linear orb/speed projections, this handles
 * retrograde reversal and can return multiple exact contacts.
 */
export type ExactNatalResult={checkedFrom:Date;checkedUntil:Date;events:ExactEvent[];nearest:ExactEvent|null;searchedDays:number};
export function refineNatalTransit(evidence:Pick<Evidence,'transit'|'natal'|'angle'>,at:Date,read:SkyReader,days=21):ExactNatalResult{
 if(!Number.isFinite(+at)||!Number.isInteger(days)||days<1||days>90)throw Error('Invalid timing search range');
 const natal=evidence.natal.longitude;
 if(!Number.isFinite(natal))throw Error('Invalid natal longitude');
 const fixed='__fixed_natal__';
 const from=new Date(+at-days*86400000),until=new Date(+at+days*86400000);
 // Faster Moon needs dense sampling; planets use 4h increments.
 const stepHours=evidence.transit.id==='Moon'?1:4;
 const positions:SkyReader=instant=>{
  const real=read(instant).find(p=>p.id===evidence.transit.id);
  if(!real)throw Error('Ephemeris body not available; cannot refine');
  return [{id:evidence.transit.id,longitude:real.longitude},{id:fixed,longitude:natal}];
 };
 const events=exactCrossings(positions,evidence.transit.id,fixed,evidence.angle,from,until,stepHours);
 const nearest=events.length?[...events].sort((a,b)=>Math.abs(+a.time-(+at))-Math.abs(+b.time-(+at)))[0]:null;
 return {checkedFrom:from,checkedUntil:until,events,nearest,searchedDays:days};
}
