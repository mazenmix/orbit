import test from 'node:test';import assert from 'node:assert/strict';
import {astroCalendarDays,colorizeAstroDay,calendarColorForScore,fortuneContactWeight,fortuneContactTone} from '../src/astroCalendar.ts';
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
