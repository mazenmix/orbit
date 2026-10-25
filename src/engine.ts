import {Temporal} from '@js-temporal/polyfill';
import {calculateEclipses,type EclipseAPI} from './realEclipses.ts';
import type {AsteroidSwiss} from './asteroidRuntime.ts';
import {auxiliaryNodes,natalDerivedAngles} from './auxiliaryPoints.ts';
import {bodies,normalize,aspects,signals,scores,houseNumber,synastry,compatibilityScore,compatibilityHasEvidence,type Point,type Dimension} from './math.ts';
export type Profile={id:string;name:string;date:string;time:string;zone:string;lat:number;lon:number;city:string;known:boolean;kind:'self'|'dating'|'work'|'friend'|'family';sex?:'male'|'female'};
export const defaultProfile:Profile={id:'demo',name:'Demo',date:'2000-01-01',time:'12:00',zone:'Etc/UTC',lat:51.4779,lon:0,city:'Greenwich',known:true,kind:'self'};
export const CALCULATION_VERSION='2026-10-19.2';
export function birthInstant(p:Profile){return new Date(Temporal.PlainDateTime.from(`${p.date}T${p.known?p.time:'12:00'}`).toZonedDateTime(p.zone,{disambiguation:'reject'}).epochMilliseconds)}
export function zonedInstant(value:string,zone:string){return new Date(Temporal.PlainDateTime.from(value).toZonedDateTime(zone,{disambiguation:'reject'}).epochMilliseconds)}
export function localValue(date:Date,zone:string){return Temporal.Instant.fromEpochMilliseconds(+date).toZonedDateTimeISO(zone).toPlainDateTime().toString().slice(0,16)}
export function validateProfile(p:Profile){
 if(!p||typeof p.id!=='string'||!p.id||p.id.length>100||typeof p.name!=='string'||typeof p.city!=='string'||p.city.length>100||typeof p.zone!=='string'||typeof p.known!=='boolean'||!['self','dating','work','friend','family'].includes(p.kind))throw Error('Invalid profile fields.');
 if(p.sex!==undefined&&!['male','female'].includes(p.sex))throw Error('Invalid Male/Female profile setting.');
 if(typeof p.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||typeof p.time!=='string'||!/^\d{2}:\d{2}$/.test(p.time))throw Error('Invalid birth date or time.');
 if(!p.name.trim()||p.name.length>80)throw Error('Enter a name (1–80 characters).');
 if(!Number.isFinite(p.lat)||!Number.isFinite(p.lon)||Math.abs(p.lat)>90||Math.abs(p.lon)>180)throw Error('Invalid latitude / longitude.');
 const d=birthInstant(p);if(d.getUTCFullYear()<1800||d.getUTCFullYear()>2399)throw Error('Supported birth years: 1800–2399.');return p;
}
// Loaded as a same-origin vendored ES module, keeping WASM/data URL resolution intact.
type Swiss=EclipseAPI & {initSwissEph:()=>Promise<void>;calc_ut:(jd:number,id:number,flags:number)=>Float64Array;houses:(jd:number,lat:number,lon:number,sys:string)=>{cusps:number[];ascmc:number[];error?:string};julday:(y:number,m:number,d:number,h:number)=>number;version:()=>string};
let swiss:Swiss;
export async function initEngine(){const mod=await (window as unknown as {mxSwissReady:Promise<{default:new()=>Swiss}>}).mxSwissReady;swiss=new mod.default();await swiss.initSwissEph();return swiss.version()}
export function setEngineForTests(value:Swiss){swiss=value}
export function asteroidSwissRuntime(){if(!swiss)throw Error('Swiss ephemeris is not initialized');return swiss as unknown as AsteroidSwiss}
export function confirmedEclipses(at:Date,count=2,coords?:{lat:number;lon:number},local=false){if(at.getUTCFullYear()<1800||at.getUTCFullYear()>2399)throw Error('Eclipse date outside supported range');return calculateEclipses(swiss,at,count,coords,local)}
export function julianDay(date:Date){if(!Number.isFinite(+date))throw Error('Invalid date');return +date/86400000+2440587.5}
function checkDate(at:Date){if(!Number.isFinite(+at)||at.getUTCFullYear()<1800||at.getUTCFullYear()>2399)throw Error('Supported dates: 1800–2399.')}
export function sunMoonState(at:Date){if(at.getUTCFullYear()<1800||at.getUTCFullYear()>2399)throw Error('Supported dates: 1800–2399');const jd=julianDay(at),flags=2|256;const sun=swiss.calc_ut(jd,0,flags),moon=swiss.calc_ut(jd,1,flags);if(!sun||!moon||![sun[0],moon[0],moon[1]].every(Number.isFinite))throw Error('Sun or Moon ephemeris unavailable');return {sunLongitude:normalize(sun[0]),moonLongitude:normalize(moon[0]),moonLatitude:moon[1]}}
export type Chart={date:Date;points:Point[];cusps:number[];asc:number|null;mc:number|null;vertex?:number|null;missing:string[]};
export function chart(at:Date,p:Profile,minor=false,withHouses=p.known):Chart{
 checkDate(at);
 if(!Number.isFinite(p.lat)||!Number.isFinite(p.lon)||Math.abs(p.lat)>90||Math.abs(p.lon)>180)throw Error('Invalid chart coordinates');
 const jd=julianDay(at),missing:string[]=[],points:Point[]=[];
 for(const [id,name,,symbol] of bodies.slice(0,minor?16:10)){
  try{
   const value=swiss.calc_ut(jd,id,2|256);
   if(!value||value.length<4||![value[0],value[3]].every(Number.isFinite))throw Error('Invalid position or velocity');
   points.push({id:name,symbol,longitude:normalize(value[0]),speed:value[3]});
  }catch{
   if(id<10)throw Error('Required ephemeris unavailable: '+name);
   missing.push(name);
  }
 }
 let cusps:number[]=[],asc:number|null=null,mc:number|null=null,vertex:number|null=null;
 // Placidus is undefined at polar latitudes: never silently substitute a house system.
 if(withHouses&&p.known&&Math.abs(p.lat)<66){
  const h=swiss.houses(jd,p.lat,p.lon,'P');
  if(!h||h.error)throw Error(h?.error??'House calculation failed');
  const raw=Array.from(h.cusps).slice(1,13);
  if(raw.length!==12||!raw.every(Number.isFinite)||![h.ascmc[0],h.ascmc[1]].every(Number.isFinite))throw Error('Invalid Placidus cusps or angles');
  cusps=raw.map(normalize);asc=normalize(h.ascmc[0]);mc=normalize(h.ascmc[1]);
  // Swiss houses() ascmc[3] contains the astronomical Vertex, when present.
  vertex=Number.isFinite(h.ascmc[3])?normalize(h.ascmc[3]):null;
  if(new Set(cusps).size!==12)throw Error('Degenerate Placidus cusps');
 }
 return {date:at,points,cusps,asc,mc,vertex,missing};
}
export const targets=(c:Chart)=>[...c.points,...(c.asc===null?[]:[{id:'Ascendant',symbol:'ASC',longitude:c.asc,speed:0}]),...(c.mc===null?[]:[{id:'MC',symbol:'MC',longitude:c.mc,speed:0}])];
export function annualHouse(p:Profile,at:Date){if(!p.known||+at<+birthInstant(p))return 0;const birth=Temporal.Instant.fromEpochMilliseconds(+birthInstant(p)).toZonedDateTimeISO(p.zone),moment=Temporal.Instant.fromEpochMilliseconds(+at).toZonedDateTimeISO(p.zone);return (birth.until(moment,{largestUnit:'years'}).years%12)+1}
export function report(p:Profile,at:Date){
 validateProfile(p);
 // Calculate the six built-in minor-body natal positions in the same Swiss
 // snapshot as the major bodies. Keep the original ten-body indicator rubric
 // unchanged: extra evidence is available for inspection, not invented scoring.
 const natalAll=chart(birthInstant(p),p,true),major=new Set(bodies.slice(0,10).map(b=>b[1]));
 const natal={...natalAll,points:natalAll.points.filter(point=>major.has(point.id as typeof bodies[number][1])),missing:[] as string[]};
 const natalMinor=natalAll.points.filter(point=>!major.has(point.id as typeof bodies[number][1]));
 const current=chart(at,p,true);
 const evidence=aspects(current.points,targets(natal).filter(point=>p.known||point.id!=='Moon'),at);
 const supplementalEvidence=aspects(current.points,natalMinor,at);
 const nodeReader=(moment:Date)=>(id:number)=>swiss.calc_ut(julianDay(moment),id,2|256);
 const natalNodes=auxiliaryNodes(nodeReader(natalAll.date)),currentNodes=auxiliaryNodes(nodeReader(at));
 const angles=natalDerivedAngles(natalAll,p.known);
 const auxiliaryNatal=[...natalNodes.points,...angles.points];
 // Additional verified longitudinal contacts are kept separate from the
 // existing symbolic index model until weights and meanings are specified.
 const auxiliaryEvidence=aspects(current.points,auxiliaryNatal,at);
 const items=signals(evidence),house=natal.asc===null?0:annualHouse(p,at);
 return {at,natal,current,evidence,supplementalNatal:natalMinor,
  supplementalEvidence,supplementalMissing:{natal:natalAll.missing,transit:current.missing},
  auxiliaryNatal,auxiliaryCurrent:currentNodes.points,auxiliaryEvidence,
  auxiliaryMissing:{natal:[...natalNodes.missing,...angles.missing],transit:currentNodes.missing},
  signals:items,scores:scores(items,house),house,
  complete:current.missing.length===0&&natalAll.missing.length===0};
}
export type Report=ReturnType<typeof report>;
export function compatibility(a:Profile,b:Profile){
 validateProfile(a);validateProfile(b);
 const allA=chart(birthInstant(a),a,true),allB=chart(birthInstant(b),b,true);
 const major=new Set(bodies.slice(0,10).map(body=>body[1]));
 const ac={...allA,points:allA.points.filter(p=>major.has(p.id as typeof bodies[number][1])),missing:[] as string[]};
 const bc={...allB,points:allB.points.filter(p=>major.has(p.id as typeof bodies[number][1])),missing:[] as string[]};
 const ap=targets(ac).filter(p=>p.id!=='MC'&&(a.known||p.id!=='Moon'));
 const bp=targets(bc).filter(p=>p.id!=='MC'&&(b.known||p.id!=='Moon'));
 const evidence=synastry(ap,bp);
 // Secondary contacts are mathematically inspectable but must not silently
 // change the old six compatibility scores or claim partner intentions.
 const supplement=(owner:Profile,all:Chart,core:Chart)=>{
  if(!owner.known)return [] as Point[];
  const nodes=auxiliaryNodes(id=>swiss.calc_ut(julianDay(all.date),id,2|256)).points;
  const angles=natalDerivedAngles(all,true).points;
  const omittedMC=targets(core).filter(p=>p.id==='MC');
  return [...all.points.filter(p=>!major.has(p.id as typeof bodies[number][1])),...nodes,...angles,...omittedMC];
 };
 const extrasA=supplement(a,allA,ac),extrasB=supplement(b,allB,bc);
 const supplementalEvidence=synastry([...ap,...extrasA],[...bp,...extrasB])
   .filter(e=>extrasA.some(p=>p.id===e.first.id)||extrasB.some(p=>p.id===e.second.id));
 const bonus={attraction:0,sexual:0,emotional:0,stability:0},overlays:{owner:string;planet:string;house:number}[]=[];
 for(const [points,cusps,owner] of [[bp,ac.cusps,a.name],[ap,bc.cusps,b.name]] as const)for(const point of points.filter(p=>['Venus','Mars','Moon','Pluto','Sun'].includes(p.id))){const h=houseNumber(point.longitude,[...cusps]);if([5,7,8].includes(h)){overlays.push({owner,planet:point.id,house:h});if(h===5)bonus.attraction+=2.5;if(h===7){bonus.attraction+=2;bonus.stability+=1.8}if(h===8){bonus.sexual+=3.2;bonus.emotional+=.8}}}
 const dimensions=Object.fromEntries((['attraction','sexual','emotional','communication','stability','conflict'] as Dimension[]).map(d=>[d,compatibilityScore(d,evidence,d==='emotional'&&(!a.known||!b.known)?.68:1,bonus[d as keyof typeof bonus]??0)])) as Record<Dimension,number>;
 // Role 'dating' describes the person's relationship to the profile owner,
 // not a romantic relationship between two arbitrary saved contacts.
 const d=dimensions,romantic=(a.kind==='self'&&b.kind==='dating')||(b.kind==='self'&&a.kind==='dating');
 const kinds:Dimension[]=['attraction','sexual','emotional','communication','stability','conflict'];
 const coverage=Object.fromEntries(kinds.map(kind=>{
  const viaAspect=compatibilityHasEvidence(kind,evidence);
  const viaHouse=kind==='attraction'?overlays.some(e=>e.house===5||e.house===7):
   kind==='sexual'?overlays.some(e=>e.house===8):
   kind==='emotional'?overlays.some(e=>e.house===8):
   kind==='stability'?overlays.some(e=>e.house===7):false;
  return [kind,romantic||!['attraction','sexual'].includes(kind)?viaAspect||viaHouse:false];
 })) as Record<Dimension,boolean>;
 // An overall percentage would silently incorporate default 50s when a
 // required relationship dimension has no contributing chart evidence.
 const overallCovered=(romantic?kinds:kinds.filter(x=>!['attraction','sexual'].includes(x))).every(x=>coverage[x]);const overall=Math.round(romantic?d.attraction*.2+d.sexual*.2+d.emotional*.2+d.communication*.16+d.stability*.16+(100-d.conflict)*.08:d.emotional*.30+d.communication*.35+d.stability*.25+(100-d.conflict)*.10);
 if(!romantic){dimensions.attraction=0;dimensions.sexual=0}
 return {a:ac,b:bc,evidence,supplementalEvidence,additionalMissing:{first:allA.missing,second:allB.missing},overlays,dimensions,overall,romantic,coverage,overallCovered};
}
