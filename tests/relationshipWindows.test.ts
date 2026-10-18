import test from 'node:test';import assert from 'node:assert/strict';
import {relationshipWindows,bestWindows} from '../src/relationshipWindows.ts';
import {categories} from '../src/math.ts';
const d={attraction:75,sexual:65,emotional:62,communication:70,stability:58,conflict:35};
test('relationship timing genuinely samples requested daily symbolic context, no claimed mutual intention',()=>{
 const rows=relationshipWindows(new Date('2026-10-18T15:00:00Z'),d,at=>Object.fromEntries(categories.map((c)=>[c,c==='communication'?at.getUTCDate()%2?70:40:55])) as any,14);
 assert.equal(rows.length,14);assert.ok(rows[0].message!==rows[1].message);
 assert.equal(bestWindows(rows,'message',3).length,3);
 assert.ok(bestWindows(rows,'message',3).every(x=>x.message>=rows[1].message));
});
test('invalid window lengths and missing symbolic domains are rejected',()=>{
 assert.throws(()=>relationshipWindows(new Date(),d,()=>({} as any)));
 assert.throws(()=>relationshipWindows(new Date(),d,()=>({} as any),90));
});
