import test from 'node:test';import assert from 'node:assert/strict';
import {annualOutlook} from '../src/annual.ts';
import {categories} from '../src/math.ts';
test('annual outlook samples real per-month chart scores and highlights changes, not fabricated dates',()=>{
 const start=new Date('2026-10-18T12:00:00Z'),read=(at:Date)=>({scores:Object.fromEntries(categories.map((c,i)=>[c,c==='love'?50+at.getUTCMonth():48-i])) as any,house:at.getUTCMonth()%12+1});
 const rows=annualOutlook(start,12);
 assert.equal(rows.length,12);assert.equal(rows[0].at.toISOString(),'2026-10-15T12:00:00.000Z');
 assert.equal(rows[1].at.getUTCMonth(),10);assert.equal(rows[2].at.getUTCFullYear(),2026);
 assert.equal(rows[3].at.getUTCFullYear(),2027);
 assert.ok(rows.some(x=>x.best==='love'));
});
test('rejects invalid calendar requests and unsupported score values',()=>{
 assert.throws(()=>annualOutlook(new Date('oops'),()=>({scores:{} as any,house:1})));
 assert.throws(()=>annualOutlook(new Date(),()=>({scores:{} as any,house:1})));
 assert.throws(()=>annualOutlook(new Date(),()=>({scores:{} as any,house:1}),35));
});
