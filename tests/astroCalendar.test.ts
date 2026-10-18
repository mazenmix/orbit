import test from 'node:test';
import assert from 'node:assert/strict';
import {astroCalendarDays,colorizeAstroDay} from '../src/astroCalendar.ts';
const v=(x:number)=>({overview:x,career:x,love:x,communication:x,energy:x,emotions:x,recovery:x,timing:x});
test('astrological traffic legend has monotonic, bounded grades',()=>{
 assert.deepEqual(['green','yellow','orange','red'].map((_,i)=>colorizeAstroDay(v([90,60,50,18][i])).color),['green','yellow','orange','red']);
 assert.throws(()=>colorizeAstroDay({...v(50),timing:NaN}));
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
