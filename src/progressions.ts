import {normalize,type Point} from './math.ts';
import {exactCrossings,type SkyReader} from './timing.ts';
const DAY=86400000;
const TROPICAL_YEAR=365.2422;
/** Secondary progression convention: 1 ephemeris day after birth per tropical year lived.
 * This is a symbolic astrological technique, distinct from live planetary transits.
 */
export function secondaryInstant(born:Date,asOf:Date){
 if(!Number.isFinite(+born)||!Number.isFinite(+asOf)||+asOf<+born)throw Error('Secondary progressions require a date after birth');
 const ageYears=(+asOf-(+born))/(TROPICAL_YEAR*DAY);
 return {ageYears,ephemerisTime:new Date(+born+ageYears*DAY)};
}
export function solarArcDegrees(natalSun:number,progressedSun:number){
 if(!Number.isFinite(natalSun)||!Number.isFinite(progressedSun))throw Error('Invalid solar longitudes');
 return normalize(progressedSun-natalSun);
}
export function directedNatal(points:readonly Point[],arc:number):Point[]{
 if(!Number.isFinite(arc))throw Error('Invalid solar arc');
 return points.map(p=>({...p,longitude:normalize(p.longitude+arc),speed:0}));
}
export function solarReturnNear(approx:Date,natalSun:number,read:SkyReader):Date|null{
 if(!Number.isFinite(+approx))throw Error('Invalid anniversary');
 const from=new Date(+approx-7*DAY),to=new Date(+approx+7*DAY);
 const extra:SkyReader=date=>[...read(date),{id:'NatalSun',longitude:natalSun}];
 const crossings=exactCrossings(extra,'Sun','NatalSun',0,from,to,6);
 return crossings.sort((a,b)=>Math.abs(+a.time-(+approx))-Math.abs(+b.time-(+approx)))[0]?.time??null;
}
