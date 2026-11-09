import test from 'node:test';import assert from 'node:assert/strict';
import {relationshipWindows,bestWindows} from '../src/relationshipWindows.ts';
import {categories} from '../src/math.ts';
const observed=(scores:any)=>({scores,signals:categories.map(category=>({category}))});
const d={attraction:75,sexual:65,emotional:62,communication:70,stability:58,conflict:35};
test('relationship timing genuinely samples requested daily symbolic context, no claimed mutual intention',()=>{
 const rows=relationshipWindows(new Date('2026-10-18T15:00:00Z'),d,at=>observed(Object.fromEntries(categories.map((c)=>[c,c==='communication'?at.getUTCDate()%2?70:40:55])) as any),14);
 assert.equal(rows.length,14);assert.ok(rows[0].message!==rows[1].message);
 assert.equal(bestWindows(rows,'message',3).length,3);
 assert.ok(bestWindows(rows,'message',3).every(x=>x.message!>=rows[1].message!));
});
test('invalid window lengths and missing symbolic domains are rejected',()=>{
 assert.throws(()=>relationshipWindows(new Date(),d,()=>({} as any)));
 assert.throws(()=>relationshipWindows(new Date(),d,()=>({} as any),90));
});

test('local calendar days sample noon in historical timezone even through DST',()=>{
 const marks:Date[]=[];
 const rows=relationshipWindows(new Date('2026-10-31T17:00:00Z'),d,at=>{marks.push(at);return observed(Object.fromEntries(categories.map(c=>[c,55])) as any)},4,'America/Denver');
 assert.deepEqual(marks.map(x=>new Intl.DateTimeFormat('en-US',{timeZone:'America/Denver',day:'numeric',hour:'numeric',hour12:false}).format(x)),['31, 12','1, 12','2, 12','3, 12']);
 assert.equal(rows[0].source.communication,55);
 assert.equal(rows[0].source.energy,55);
});

test('relationship windows reject invalid compatibility inputs before suggesting a date',()=>{
 const input=()=>observed(Object.fromEntries(categories.map(c=>[c,50])) as any);
 const date=new Date('2026-11-02T12:00:00Z');
 for(const [key,value] of [['communication',NaN],['stability',Infinity],['attraction',-1],['conflict',120],['sexual',undefined]] as const)
  assert.throws(()=>relationshipWindows(date,{...d,[key]:value} as any,input,2),/Invalid relationship compatibility/);
 assert.throws(()=>relationshipWindows(date,d,()=>({...input(),scores:{...input().scores,love:NaN}}),1),/invalid symbolic/);
 assert.throws(()=>relationshipWindows(date,d,()=>({...input(),scores:{...input().scores,energy:120}}),1),/invalid symbolic/);
 const valid=relationshipWindows(date,d,input,2);
 assert.ok(valid.every(x=>[x.message,x.date,x.steadiness].every(v=>Number.isFinite(v)&&v!>=1&&v!<=99)));
 assert.throws(()=>bestWindows([{...valid[0],message:NaN}], 'message'),/Invalid relationship ranking/);
 assert.throws(()=>bestWindows(valid,'bogus' as any),/Invalid relationship ranking/);
});

const coverage={attraction:true,sexual:true,emotional:true,communication:true,stability:true,conflict:true};
test('neutral placeholders never become ranked message or meeting windows',()=>{
 const from=new Date('2026-11-09T12:00:00Z');
 const rows=relationshipWindows(from,d,()=>({scores:Object.fromEntries(categories.map(c=>[c,50])) as any,signals:[]}),3);
 assert.ok(rows.every(row=>row.message===null&&row.date===null&&row.steadiness===null&&row.best===null));
 assert.deepEqual(bestWindows(rows,'message'),[]);
 assert.deepEqual(bestWindows(rows,'date'),[]);
 assert.deepEqual(bestWindows([],'message'),[]);
});
test('message coverage is independent of unrelated romantic dimensions',()=>{
 const from=new Date('2026-11-09T12:00:00Z');
 const input=()=>({scores:Object.fromEntries(categories.map(c=>[c,70])) as any,signals:[{category:'communication' as const}]});
 const friends=relationshipWindows(from,{...d,attraction:0,sexual:0},input,2,undefined,{romantic:false,coverage:{...coverage,attraction:false,sexual:false}});
 assert.ok(friends.every(row=>row.message!==null&&row.date===null));
 assert.equal(bestWindows(friends,'message').length,2);
 assert.deepEqual(bestWindows(friends,'date'),[]);
 const missingStability=relationshipWindows(from,d,input,2,undefined,{romantic:true,coverage:{...coverage,stability:false}});
 assert.deepEqual(bestWindows(missingStability,'message'),[]);
});
test('meeting ranking requires both timed source categories and relevant static dimensions',()=>{
 const from=new Date('2026-11-09T12:00:00Z');
 const scores=Object.fromEntries(categories.map(c=>[c,80])) as any;
 const partial=relationshipWindows(from,d,()=>({scores,signals:[{category:'love'}]}),2);
 assert.deepEqual(bestWindows(partial,'date'),[],'missing energy must not silently use 50');
 const full=()=>({scores,signals:[{category:'love' as const},{category:'energy' as const}]});
 assert.equal(bestWindows(relationshipWindows(from,d,full,2),'date').length,2);
 const noAttraction=relationshipWindows(from,d,full,2,undefined,{romantic:true,coverage:{...coverage,attraction:false}});
 assert.deepEqual(bestWindows(noAttraction,'date'),[]);
});
