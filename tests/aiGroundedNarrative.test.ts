import test from 'node:test';
import assert from 'node:assert/strict';
import {groundedPlainFallback,reviewGeneratedAdvice,calculatedNarrativeFactors} from '../src/aiQuality.ts';
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

const generic='هاي قراءة رمزية: يمكن تحتاج ترتب أولوياتك وتسمع وجهة نظر مختلفة، لكن القرار يبقى مرتبط بالمعلومات اللي عندك. اختار خطوة صغيرة تگدر تغيّرها، دوّن شنو صار فعلاً، وراجع النتيجة قبل ما توسّع الخطة.';
test('a long symbolic boilerplate paragraph cannot pass two unrelated calculated targets',async()=>{
 for(const [transit,natal] of [['Saturn','Moon'],['Mercury','MC']]){
  const context=packet(transit,natal);
  const local=reviewGeneratedAdvice(generic,context);
  assert.equal(local.fallback,true);
  assert.ok(local.problems.some(code=>code.startsWith('missing-factor-meaning:')));
  const response=await onRequestPost({request:request([{...context.challenge,weight:.86}]),env:{AI:{run:async()=>({response:generic})}}});
  const body=await response.json();
  assert.equal(body.quality,'grounded-fallback');assert.equal(body.review.grounded,false);
  assert.notEqual(body.explanation,generic);
 }
});
test('concrete plain-language meaning passes without reader-facing planet names',()=>{
 const text='قراءة رمزية: إذا ضغط النقاش عليك عاطفياً، راجع مسؤولياتك وحدود قدرتك قبل الرد حتى ما تحمل نفسك فوق طاقتك. خذ استراحة قصيرة وارجع للرسالة، وبعدها شوف إذا صار طلبك أوضح.';
 assert.equal(reviewGeneratedAdvice(text,packet('Saturn','Moon')).fallback,false);
 assert.equal(reviewGeneratedAdvice(text,packet('Mercury','MC')).fallback,true);
});
test('structured grounding must quote actual prose linking the supplied target and driver',async()=>{
 const context=packet('Saturn','Moon'),contact=calculatedNarrativeFactors(context)[0].contact;
 const explanation='إذا صار نقاش يضغط عليك عاطفياً، راجع مسؤولياتك وحدود قدرتك قبل الرد حتى ما تحمل نفسك فوق طاقتك. خذ استراحة وارجع للرسالة، وبعدها شوف إذا صار طلبك أوضح.';
 let calls=0;
 const env={AI:{run:async(_model:string,payload:any)=>{
  calls++;
  const plan=JSON.parse(payload.messages[1].content.split('\n/no_think')[0]).interpretationPlan;
  assert.equal(plan[0].contact,contact);assert.match(plan[0].targetMeaning,/عاطف/);assert.match(plan[0].driverMeaning,/مسؤول/);
  return {response:JSON.stringify({explanation,grounding:[{contact,excerpt:explanation}]})};
 }}};
 const response=await onRequestPost({request:request([{...context.challenge,weight:.86}]),env});
 const body=await response.json();
 assert.equal(response.status,200);assert.equal(body.quality,'reviewed-model');assert.equal(calls,1);
 assert.ok(body.explanation.startsWith('قراءة رمزية: '));
 assert.deepEqual(body.review.adjustments,['symbolic-framing']);
 assert.ok(body.review.modelReasonCodes.includes('missing-symbolic-framing'));
 assert.equal(body.review.status,'passed-bounded-checks');
});
test('contact IDs alone and fabricated grounding excerpts cannot authorize generic or unrelated prose',()=>{
 const context=packet('Saturn','Moon'),contact=calculatedNarrativeFactors(context)[0].contact;
 const actual='قراءة رمزية: إذا ضغط النقاش عليك عاطفياً، راجع مسؤولياتك وحدود قدرتك قبل الرد حتى ما تحمل نفسك فوق طاقتك. خذ استراحة وراجع النتيجة.';
 for(const [text,links] of [
  [generic,[{contact,excerpt:generic}]],
  [generic,[{contact,excerpt:actual}]],
  [actual,[{contact:'Mercury:MC:90',excerpt:actual}]],
  [actual,[{contact,excerpt:'قراءة رمزية'}]],
 ] as const){
  assert.equal(reviewGeneratedAdvice(text,{...context,semanticLinks:links}).fallback,true);
 }
});
test('every leading factor must retain its own meaning rather than borrowing the other factor',()=>{
 const challengeOnly='قراءة رمزية: إذا ضغط النقاش عليك عاطفياً، راجع مسؤولياتك وحدود قدرتك قبل الرد حتى ما تحمل نفسك فوق طاقتك. لكن لا تحول أول انطباع إلى حكم نهائي.';
 const context={...packet('Saturn','Moon'),support:factor('Jupiter','MC',120)};
 const result=reviewGeneratedAdvice(challengeOnly,context);
 assert.equal(result.fallback,true);assert.ok(result.problems.includes('missing-factor-meaning:Jupiter:MC:120'));
});
test('empty or only neutral packets fail before model inference',async()=>{
 let calls=0;const env={AI:{run:async()=>{calls++;return {response:generic}}}};
 for(const evidence of [[],[{...factor('Sun','Moon',0),weight:.8}]]){
  const response=await onRequestPost({request:request(evidence),env});
  assert.equal(response.status,422);assert.equal((await response.json()).code,'INSUFFICIENT_EVIDENCE');
 }
 assert.equal(calls,0);
});
test('malformed nonempty structured model output retains a safe evidence reading and rejection reason',async()=>{
 const response=await onRequestPost({request:request([{...factor('Saturn','Moon',90),weight:.8}]),env:{AI:{run:async()=>({response:'{"explanation":'})}}});
 const body=await response.json();
 assert.equal(response.status,200);assert.equal(body.quality,'grounded-fallback');
 assert.ok(body.review.reasonCodes.includes('invalid-model-structure'));
 assert.doesNotMatch(body.explanation,/explanation/);assert.match(body.explanation,/رمزي/);
});
test('fallback has one symbolic frame and no repeated precision boilerplate',()=>{
 const text=groundedPlainFallback({...packet('Saturn','Moon'),support:factor('Venus','Mercury',120)});
 assert.equal((text.match(/رمزي/g)??[]).length,1);
 assert.doesNotMatch(text,/هذا الاتصال قريب جداً|الحساب يجمعه|دقته الحسابية/);
 assert.match(text,/مراسلة|معلومة/);assert.match(text,/الضغط والراحة/);
});
