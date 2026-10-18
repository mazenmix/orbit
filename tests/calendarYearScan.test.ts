import test from 'node:test';
import assert from 'node:assert/strict';
import SwissEph from 'swisseph-wasm';
import {setEngineForTests,chart,birthInstant,zonedInstant,localValue,defaultProfile} from '../src/engine.ts';
import {calendarMomentEvidence,calendarDaySynthesis,calendarColorForScore,CALENDAR_SAMPLE_HOURS,astroCalendarDays} from '../src/astroCalendar.ts';
const sw=new SwissEph();await sw.initSwissEph();setEngineForTests(sw as any);
const base={...defaultProfile,id:'year-scan',name:'Calendar QA',date:'1985-03-29',time:'19:20',city:'Baghdad',zone:'Asia/Baghdad',lat:33.3152,lon:44.3661,known:true};
test('full rolling calendar year has 365 complete days: real Swiss ephemeris sampled 3 times/day',()=>{
 const natal=chart(birthInstant(base),base),days=astroCalendarDays('2026-10-18');
 assert.equal(days.length,365);
 const colors=new Set<string>();let aspects=0;
 for(const day of days){
  const samples=CALENDAR_SAMPLE_HOURS.map(hour=>{
   const wall=day.iso+'T'+String(hour).padStart(2,'0')+':00';
   const at=zonedInstant(wall,base.zone);
   assert.equal(localValue(at,base.zone).slice(0,16),wall,day.iso+' local date mismatch');
   const current=chart(at,base,false,false);
   assert.equal(current.points.length,10,'missing core planet at '+wall);
   const e=calendarMomentEvidence(current,natal,at,base.known);
   aspects+=e.length;
   assert.ok(e.every(x=>Number.isFinite(x.orb)&&Number.isFinite(x.weight)&&x.orb<=x.maximumOrb));
   return {hour,evidence:e};
  });
  const rating=calendarDaySynthesis(samples);
  colors.add(rating.color);
  assert.equal(rating.color,calendarColorForScore(rating.value),day.iso+' grade mismatch');
  assert.equal(rating.sampleScores.length,3);
  assert.ok(Number.isInteger(rating.value)&&rating.value>=1&&rating.value<=99,day.iso+' invalid');
  assert.ok(rating.minimum<=rating.value&&rating.value<=rating.maximum,day.iso+' range mismatch');
 }
 assert.ok(aspects>days.length,'all-year aspect scan is unexpectedly empty');
 assert.ok(colors.size>=2,'a whole year of personal ephemerides should not collapse to one grade');
});
test('leap day and 23/25-hour DST transitions preserve local 3-point sampling',()=>{
 const cases=[
  ['2028-02-29','Asia/Baghdad',33.3152,44.3661],
  ['2027-03-14','America/Denver',39.7392,-104.9903],
  ['2027-11-07','America/Denver',39.7392,-104.9903],
  ['2027-03-28','Europe/London',51.5074,-.1278],
  ['2027-10-31','Europe/London',51.5074,-.1278],
  ['2027-01-01','Asia/Manila',14.5995,120.9842]
 ] as const;
 for(const [iso,zone,lat,lon] of cases){
  const p={...base,zone,lat,lon},natal=chart(birthInstant(p),p);
  const inputs=CALENDAR_SAMPLE_HOURS.map(hour=>{
   const wall=iso+'T'+String(hour).padStart(2,'0')+':00',at=zonedInstant(wall,zone);
   assert.equal(localValue(at,zone).slice(0,16),wall);
   const ev=calendarMomentEvidence(chart(at,p,false,false),natal,at,true);
   return {hour,evidence:ev};
  });
  const rating=calendarDaySynthesis(inputs);
  assert.ok(rating.minimum<=rating.maximum);
  assert.equal(rating.color,calendarColorForScore(rating.value));
 }
});
