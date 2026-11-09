import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import SwissEph from 'swisseph-wasm';
import {chart,defaultProfile,setEngineForTests,sunMoonState} from '../src/engine.ts';
import {bodies,distance} from '../src/math.ts';
import {lunarWindow} from '../src/timing.ts';
import {lunarMansionWindow} from '../src/moonMansions.ts';
import {scanLunations} from '../src/eclipse.ts';

const fixture=JSON.parse(await fs.readFile(new URL('./fixtures/audit-native-20261109.json',import.meta.url),'utf8'));
const swiss=new SwissEph();await swiss.initSwissEph();setEngineForTests(swiss as any);
for(const sample of fixture.samples)test('independent native vector and three-location Placidus check: '+sample.at,()=>{
 const current=chart(new Date(sample.at),defaultProfile,true,false);
 assert.equal(current.points.length,sample.points.length);
 for(const expected of sample.points){
  const name=bodies.find(body=>body[0]===expected.id)![1];
  const actual=current.points.find(point=>point.id===name)!;
  assert.ok(actual,name+' must be present');
  assert.ok(distance(actual.longitude,expected.longitude)<1e-7,name+' longitude');
  assert.ok(Math.abs(actual.speed-expected.speed)<1e-7,name+' speed');
 }
 for(const place of sample.houses){
  const c=chart(new Date(sample.at),{...defaultProfile,lat:place.lat,lon:place.lon});
  assert.equal(c.cusps.length,12);
  c.cusps.forEach((value,i)=>assert.ok(distance(value,place.cusps[i])<1e-7,'cusp '+(i+1)));
  assert.ok(distance(c.asc!,place.asc)<1e-7,'Ascendant');
  assert.ok(distance(c.mc!,place.mc)<1e-7,'Midheaven');
 }
});
test('November lunar events and mansion transition agree with independent native roots within two seconds',()=>{
 const at=new Date('2026-11-09T09:00:00Z');
 const read=(date:Date)=>chart(date,defaultProfile,false,false).points;
 const near=(actual:Date,expected:string)=>assert.ok(Math.abs(+actual-Date.parse(expected))<2000,actual.toISOString()+' vs '+expected);
 const win=lunarWindow(at,read),roots=fixture.roots;
 const contact=(target:string,angle:number)=>win.events.find(e=>e.target===target&&e.angle===angle)!.time;
 near(contact('Sun',0),roots.newMoon);
 near(contact('Mars',90),roots.moonMarsSquare);
 near(contact('Jupiter',90),roots.moonJupiterSquare);
 near(win.vocStartsAt,roots.moonJupiterSquare);
 near(win.ingressAt,roots.moonSagittariusIngress);
 near(lunarMansionWindow(at,date=>read(date).find(p=>p.id==='Moon')!.longitude).exitsAt,roots.mansion19Ingress);
 const phases=scanLunations(new Date('2026-11-09T00:00:00Z'),2,sunMoonState);
 assert.equal(phases.length,1);assert.equal(phases[0].phase,'new');
 near(phases[0].at,roots.newMoon);
});
