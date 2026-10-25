import test from 'node:test';
import assert from 'node:assert/strict';
import {groundedPlainFallback,reviewGeneratedAdvice} from '../src/aiQuality.ts';
import {onRequestPost} from '../functions/api/explain.ts';

const factor=(transit:string,natal:string,angle:number,orb=.3)=>({transit,natal,angle,orb,applying:true});
const packet=(transit:string,natal:string,angle=90)=>({
 language:'ar' as const,
 support:null,
 challenge:factor(transit,natal,angle),
 evidence:[factor(transit,natal,angle)],
 events:[],
 strict:true,
 plainLanguage:true
});
const banned=/(?:تربيع|تثليث|تسديس|اقتران|مقابلة|اورب|أورب|\d+(?:\.\d+)?\s*°|أكيد راح|تحبك بالسر)/i;

test('rejected AI prose uses two actual contact identifiers rather than screenshot boilerplate',()=>{
 const a=groundedPlainFallback({...packet('Saturn','Moon'),support:factor('Venus','Mercury',120)});
 const b=groundedPlainFallback({...packet('Mars','Venus'),support:factor('Jupiter','MC',60)});
 assert.match(a,/مراسلة|معلومة/);
 assert.match(a,/الضغط|الراحة/);
 assert.match(b,/مهني|شغلك|المسار/);
 assert.match(b,/التقارب|الحدود/);
 assert.notEqual(a,b);
 assert.doesNotMatch(a,/هسه يمكن يفيدك تراجع/);
 assert.doesNotMatch(b,/هسه يمكن يفيدك تراجع/);
 assert.doesNotMatch(a,banned);
 assert.doesNotMatch(b,banned);
});
test('natal target and moving factor both alter the full interpretation',()=>{
 const natal=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','Ceres','Pallas','Juno','Vesta','Pholus','Ascendant','MC'];
 const moving=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','Ceres','Pallas','Juno','Vesta','Pholus'];
 const outputs=moving.flatMap(t=>natal.map(n=>groundedPlainFallback(packet(t,n))));
 assert.equal(new Set(outputs).size,moving.length*natal.length,'Distinct verified pairs cannot all collapse to a canned reply');
 assert.ok(outputs.every(s=>s.length>200),'Each contact needs a concrete, substantial interpretation');
 for(const output of outputs){assert.doesNotMatch(output,banned);assert.doesNotMatch(output,/NaN|undefined|null/);}
});
test('no evidence fails closed rather than inventing personal insight',()=>{
 const text=groundedPlainFallback({...packet('Mars','Venus'),support:null,challenge:null,evidence:[]});
 assert.match(text,/ما وصلتني اتصالات/);
 assert.doesNotMatch(text,/مبادرة|شعورك|حظك/);
});
test('AI safety refusal returns pair-specific prose and preserves the rejection reason',()=>{
 const a=reviewGeneratedAdvice('راح تتصل بيك أكيد',packet('Saturn','Moon'));
 const b=reviewGeneratedAdvice('راح تتصل بيك أكيد',packet('Mercury','MC'));
 assert.equal(a.fallback,true);assert.equal(b.fallback,true);
 assert.notEqual(a.text,b.text);assert.ok(a.problems.length);
});
const request=(evidence:any[])=>new Request('https://orbit.test/api/explain',{
 method:'POST',headers:{origin:'https://orbit.test','content-type':'application/json'},
 body:JSON.stringify({language:'ar',calculatedAt:'2026-10-25T11:00:00.000Z',evidence})
});
test('server fallback differs across verified chart packets when upstream is generic',async()=>{
 const env={AI:{run:async()=>({response:'You are special. Today is beautiful.'})}};
 const e=(t:string,n:string)=>[{transit:t,natal:n,angle:90,orb:.35,applying:true,weight:.86}];
 const a=await onRequestPost({request:request(e('Saturn','Moon')),env});
 const b=await onRequestPost({request:request(e('Mercury','MC')),env});
 assert.equal(a.status,200);assert.equal(b.status,200);
 const x=await a.json() as any,y=await b.json() as any;
 assert.equal(x.quality,'grounded-fallback');assert.equal(y.quality,'grounded-fallback');
 assert.notEqual(x.explanation,y.explanation);
 assert.match(x.explanation,/الضغط|الراحة/);
 assert.match(y.explanation,/المسار المهني/);
});
