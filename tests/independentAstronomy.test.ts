import test from 'node:test';
import assert from 'node:assert/strict';
import SwissEph from 'swisseph-wasm';
import {chart,defaultProfile,setEngineForTests,birthInstant,zonedInstant} from '../src/engine.ts';

/** Independent numerical fixture:
 * Values were computed outside this repository with PySwissEph 2.10.03,
 * calc_ut(jd, body_id, SEFLG_SWIEPH|SEFLG_SPEED). The separate environment
 * had no Swiss data files and reported SEFLG_MOSEPH|SEFLG_SPEED (260);
 * MX Astro uses bundled Swiss ephemeris files. Therefore this is an
 * independent *cross-algorithm sanity check* at 0.001 degrees, not an
 * assertion of identical ephemeris backends or universal accuracy.
 * Existing native-swetest comparisons test the bundled Swiss backend at 1e-6°.
 */
const reference=[
 {date:'1985-03-29T16:20:00Z',points:[[8.9229903,0.9881775],[98.9956695,12.7477015],[17.2386259,-0.5480954],[17.3054841,-0.577577],[40.4430266,0.7164046],[310.5450756,0.1734619],[237.7190395,-0.0359424],[257.9662061,-0.005844],[273.6054592,0.0035939],[214.0352817,-0.0247234]]},
 {date:'2024-02-29T23:55:00Z',points:[[340.8859998,1.0036134],[220.4401563,12.1490569],[342.3178749,1.8918189],[316.4887243,1.2378211],[312.9144661,0.774368],[41.3136333,0.1706084],[339.912776,0.1221359],[49.5791189,0.0284215],[356.7403633,0.036755],[301.2159039,0.0263771]]},
 {date:'2026-11-02T20:45:00Z',points:[[220.4425065,1.0010984],[143.3665637,13.651299],[224.4322114,-1.2672783],[205.3744345,-0.4383124],[139.5551052,0.4974804],[144.5458295,0.1171557],[9.1709813,-0.0608645],[64.6075325,-0.0371562],[2.0454546,-0.020275],[303.1432988,0.0084144]]},
 {date:'2030-01-01T00:00:00Z',points:[[280.6023444,1.0195426],[238.421511,14.6030788],[279.456951,-1.3626544],[289.5470044,-0.5500347],[314.7013322,0.7861158],[230.5745616,0.176027],[48.3976924,-0.0334039],[75.5576341,-0.0372933],[8.3780708,0.0073491],[309.1648044,0.0280289]]}
] as const;
const bodies=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const swe=new SwissEph();
await swe.initSwissEph();
setEngineForTests(swe as any);
for(const sample of reference){
 test('independent native PySwissEph numerical benchmark: '+sample.date,()=>{
  const result=chart(new Date(sample.date),defaultProfile,false,false);
  assert.equal(result.points.length,10);
  for(let i=0;i<bodies.length;i++){
   const point=result.points.find(p=>p.id===bodies[i]);
   assert.ok(point,bodies[i]);
   const [longitude,speed]=sample.points[i];
   assert.ok(Math.abs(point.longitude-longitude)<.001,
    bodies[i]+' longitude mismatch at '+sample.date+': '+point.longitude+' vs '+longitude);
   assert.ok(Math.abs(point.speed-speed)<.002,
    bodies[i]+' velocity mismatch at '+sample.date+': '+point.speed+' vs '+speed);
   assert.equal(Math.floor(point.longitude/30),Math.floor(longitude/30),
    bodies[i]+' sign mismatch at '+sample.date);
   assert.equal(Math.sign(point.speed),Math.sign(speed),
    bodies[i]+' retrograde polarity mismatch at '+sample.date);
  }
 });
}
test('Baghdad historical local time is converted to the appropriate UTC instant',()=>{
 const profile={...defaultProfile,date:'1985-03-29',time:'19:20',zone:'Asia/Baghdad',city:'Baghdad'};
 assert.equal(birthInstant(profile).toISOString(),'1985-03-29T16:20:00.000Z');
 const nearMidnight=zonedInstant('2024-02-29T23:55','Etc/UTC');
 assert.equal(nearMidnight.toISOString(),'2024-02-29T23:55:00.000Z');
});
