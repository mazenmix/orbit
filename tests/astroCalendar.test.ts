import test from 'node:test';import assert from 'node:assert/strict';
import {astroCalendarDays,firstTwelveCalendarMonths,astroCalendarGridPosition,colorizeAstroDay,calendarColorForScore,fortuneContactWeight,fortuneContactTone} from '../src/astroCalendar.ts';
const aspect=(angle:number,transit='Venus',orb=.1,weight=.9)=>({
 id:transit+'-'+angle+'-Sun',transit:{id:transit,symbol:'✦',longitude:100,speed:1},
 natal:{id:'Sun',symbol:'☉',longitude:100,speed:0},angle,orb,maximumOrb:2,applying:true,weight,exact:null
});
test('three fortune colors follow exact inclusive thresholds and aspect strengths',()=>{
 const green=colorizeAstroDay([aspect(120),aspect(60,'Jupiter')]);
 const yellow=colorizeAstroDay([aspect(120,'Venus',.6,.5)]);
 const orange=colorizeAstroDay([aspect(120),aspect(90,'Saturn')]);
 const red=colorizeAstroDay([aspect(90,'Saturn'),aspect(180,'Mars')]);
 assert.deepEqual([green.color,yellow.color,orange.color,red.color],['green','yellow','yellow','red']);
 assert.ok(green.value>yellow.value&&yellow.value>orange.value&&orange.value>red.value);
 assert.equal(green.strongestSupport?.transit.id,'Venus');
 assert.equal(red.strongestChallenge?.transit.id,'Saturn');
});
test('applying and closer aspects carry stronger symbolic weight',()=>{
 assert.ok(fortuneContactWeight(aspect(120,'Venus',.1))>fortuneContactWeight(aspect(120,'Venus',1.8)));
 assert.ok(fortuneContactWeight(aspect(90,'Saturn',.3))>fortuneContactWeight({...aspect(90,'Saturn',.3),applying:false}));
});
test('unknown or neutral contacts do not fabricate favorable luck',()=>{
 assert.deepEqual(colorizeAstroDay([]).color,'yellow');
 assert.equal(colorizeAstroDay([]).value,50);
 assert.equal(fortuneContactTone(aspect(0,'Mercury')),0);
 assert.equal(fortuneContactTone(aspect(0,'Venus')),1);
 assert.equal(fortuneContactTone(aspect(0,'Saturn')),-1);
 assert.throws(()=>colorizeAstroDay([aspect(120,'Venus',3)]));
 assert.throws(()=>colorizeAstroDay([{...aspect(90),weight:NaN}]));
});
test('rolling 12-month calendar handles real day counts and leap years',()=>{
 const ordinary=astroCalendarDays('2026-10-18');
 assert.equal(ordinary[0].iso,'2026-10-18');assert.equal(ordinary.at(-1)?.iso,'2027-10-17');assert.equal(ordinary.length,365);
 const leap=astroCalendarDays('2027-10-18');
 assert.equal(leap.length,366);assert.ok(leap.some(x=>x.iso==='2028-02-29'));
 assert.throws(()=>astroCalendarDays('2026-02-31'));
});
test('calendar month groups and week offsets remain day-accurate',()=>{
 const days=astroCalendarDays('2026-10-18');
 assert.equal(days[0].weekday,6);assert.equal(days[0].monthKey,'2026-10');
 assert.equal(days.find(x=>x.iso==='2026-11-01')?.weekday,6);
 assert.ok(new Set(days.map(x=>x.monthKey)).size>=12);
});

test('threshold boundary and monotonic color grade',()=>{
 const samples=[1,15,29,30,31,50,69,70,71,85,99];
 const colors=['red','red','red','red','yellow','yellow','yellow','yellow','green','green','green'];
 assert.deepEqual(samples.map(calendarColorForScore),colors);
 for(const invalid of [NaN,-1,0,100,15.5,Infinity])assert.throws(()=>calendarColorForScore(invalid));
});

test('exactly 12 visible chronological month cards, October left through September, no thirteenth October',()=>{
 const rolling=astroCalendarDays('2026-10-24');
 const visible=firstTwelveCalendarMonths(rolling);
 const keys=[...new Set(visible.map(x=>x.monthKey))];
 assert.equal(keys.length,12);
 assert.deepEqual(keys,['2026-10','2026-11','2026-12','2027-01','2027-02','2027-03','2027-04','2027-05','2027-06','2027-07','2027-08','2027-09']);
 assert.equal(visible[0].iso,'2026-10-24');
 assert.equal(visible.at(-1)?.iso,'2027-09-30');
 assert.equal(visible.find(x=>x.iso==='2026-10-24')?.weekday,5); // Saturday in Monday-first grid
 assert.equal(visible.find(x=>x.iso==='2026-11-01')?.weekday,6); // Sunday remains at right
 assert.ok(visible.length<rolling.length);
});
test('display limit handles the new year and leap February without reversing dates',()=>{
 const visible=firstTwelveCalendarMonths(astroCalendarDays('2027-10-24'));
 assert.equal(new Set(visible.map(x=>x.monthKey)).size,12);
 assert.ok(visible.some(x=>x.iso==='2028-02-29'));
 assert.ok(visible.every((v,i)=>i===0||v.iso>visible[i-1].iso));
});

test('calendar cells align to explicit Monday-through-Sunday columns even under RTL parent',()=>{
 const october=astroCalendarDays('2026-10-24');
 const first=october[0];
 assert.equal(first.weekday,5); // Saturday
 assert.deepEqual(astroCalendarGridPosition(first.weekday,0),{column:6,row:1}); // Sat Oct 24
 assert.deepEqual(astroCalendarGridPosition(first.weekday,1),{column:7,row:1}); // Sun Oct 25
 assert.deepEqual(astroCalendarGridPosition(first.weekday,2),{column:1,row:2}); // Mon Oct 26
 const novFirst=october.find(x=>x.iso==='2026-11-01');
 assert.equal(novFirst?.weekday,6);
 assert.deepEqual(astroCalendarGridPosition(6,0),{column:7,row:1}); // Sun Nov 1
 assert.deepEqual(astroCalendarGridPosition(6,1),{column:1,row:2}); // Mon Nov 2
 for(let offset=0;offset<35;offset++){
  const p=astroCalendarGridPosition(5,offset);
  assert.ok(p.column>=1&&p.column<=7&&p.row>=1);
 }
 for(const args of [[-1,0],[7,0],[0,-1],[NaN,0],[2,1.5]])assert.throws(()=>astroCalendarGridPosition(args[0],args[1]));
});
