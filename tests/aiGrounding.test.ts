import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewGeneratedAdvice,unsafeAIGuesses,groundedFallback} from '../src/aiQuality.ts';
import {onRequestPost} from '../functions/api/explain.ts';
const support={transit:'Venus',natal:'Sun',angle:120,orb:.23,applying:true};
const challenge={transit:'Saturn',natal:'Moon',angle:90,orb:.8,applying:false};
const ctx={language:'ar' as const,support,challenge,events:[],evidence:[support,challenge],strict:true};
test('localized percentage, false placement, invented body, degree and wrong aspect all fall back to calculated evidence',()=>{
 for(const text of ['احتمال النجاح ٩٩٫٥٪','نسبة رجوعها ۹۰٪','Venus in Aries makes you lucky','زحل في برج الثور','Jupiter will bring good news','Venus square Sun at 90°','الزهرة تربيع الشمس','Venus trine Sun at 8°','البيت السابع يتفعل','راح تتصل بتاريخ ١٣/٥/٢٠٢٧']){
  const out=reviewGeneratedAdvice(text,ctx);assert.equal(out.fallback,true,text);assert.ok(out.problems.length);
  assert.match(out.text,/الزهرة/);assert.match(out.text,/زحل/);
 }
});
test('both correct contact descriptions and mixed context pass without replacing useful text',()=>{
 const text='Venus trine Sun with orb 0.23° is applying, while Saturn square Moon with orb 0.80° is separating. The symbolic reading is mixed.\n\nTry one clear request and check the actual response.';
 assert.deepEqual(unsafeAIGuesses(text,ctx),[]);
 assert.equal(reviewGeneratedAdvice(text,ctx).fallback,false);
});
test('a missing counter-factor or generic ungrounded prose is replaced rather than presented as a trusted explanation',()=>{
 assert.equal(reviewGeneratedAdvice('You are special and lucky.',ctx).fallback,true);
 assert.equal(reviewGeneratedAdvice('Venus trine Sun is favorable.',ctx).fallback,true);
});
test('verified fallback actions adapt to the actual target domain rather than repeating generic advice',()=>{
 const forTarget=(natal:string)=>groundedFallback({...ctx,language:'en',support:null,challenge:{...challenge,natal}}).split('\n\n')[1];
 assert.match(forTarget('Mercury'),/clear request/);
 assert.match(forTarget('MC'),/commitment/);
 assert.match(forTarget('Venus'),/actual response/);
 assert.match(forTarget('Mars'),/actual effort/);
 assert.equal(new Set(['Mercury','MC','Venus','Mars','Moon'].map(forTarget)).size,5);
});
test('Arabic aspect descriptions use normalized Arabic letters and diacritics',()=>{
 const text='الزُهرة تثليث الشمس، لكن زحل تربيع القمر؛ الدلالات متعاكسة ضمن القراءة الرمزية.';
 assert.deepEqual(unsafeAIGuesses(text,ctx),[]);
});
test('real model failure: a separating contact cannot be described as applying, and another pair cannot authorize its orb',()=>{
 const context={...ctx,support:{...support,applying:false},evidence:[{...support,applying:false},challenge]};
 for(const text of ['Venus trine Sun is applying with orb 0.23°. However Saturn square Moon is separating with orb 0.80°. This is a symbolic reading.','Venus trine Sun is separating with orb 0.80°. This is a symbolic reading. However Saturn square Moon is separating with orb 0.80°. This is a symbolic reading.']){
  assert.equal(reviewGeneratedAdvice(text,context).fallback,true,text);
 }
 const safe='Venus trine Sun is separating with orb 0.23°. However Saturn square Moon is separating with orb 0.80°. This is a symbolic reading.';
 assert.deepEqual(unsafeAIGuesses(safe,context),[]);
});
test('real model failure: misleading Arabic translations and unsupported time-comparison claims are rejected',()=>{
 for(const text of ['الزهرة تثليث الشمس، مع مدار 0.23 درجة وتاثير مطبق، لكن زحل تربيع القمر.','Venus trine Sun and Saturn square Moon give mixed symbolic themes. No major new shifts are indicated.']){
  assert.equal(reviewGeneratedAdvice(text,ctx).fallback,true,text);
 }
 const text='Venus trine Sun and Saturn square Moon give mixed symbolic themes. No major new shifts are indicated.';
 assert.equal(reviewGeneratedAdvice(text,{...ctx,comparisonAvailable:true}).fallback,false);
});
test('correct body and aspect names cannot authorize the opposite symbolic classification',()=>{
 for(const text of [
  'Venus trine Sun is challenging. Saturn square Moon is supportive. This symbolic reading is mixed.',
  'الزهرة تثليث الشمس اتصال متحدي. زحل تربيع القمر اتصال داعم. القراءة الرمزية مختلطة.'
 ]){
  const result=reviewGeneratedAdvice(text,ctx);
  assert.equal(result.fallback,true);
  assert.ok(result.problems.includes('wrong-contact-interpretation'));
 }
 const correct='Venus trine Sun is supportive. Saturn square Moon is challenging. This is a mixed symbolic reading.';
 assert.deepEqual(unsafeAIGuesses(correct,ctx),[]);
});
test('a model cannot name a counter-factor and then deny that any counter-evidence exists',()=>{
 for(const text of [
  'Venus trine Sun and Saturn square Moon form a symbolic reading. However, it is entirely favorable with no challenging contacts.',
  'الزهرة تثليث الشمس وزحل تربيع القمر ضمن القراءة الرمزية، لكن جميع الاتصالات داعمة.'
 ]){
  const result=reviewGeneratedAdvice(text,ctx);
  assert.equal(result.fallback,true);
  assert.ok(result.problems.includes('denied-counter-evidence'));
 }
});
const req=(evidence:unknown[])=>new Request('https://orbit.example/api/explain',{method:'POST',headers:{origin:'https://orbit.example','content-type':'application/json'},body:JSON.stringify({language:'en',evidence})});
test('AI endpoint rejects duplicated aspects, impossible per-body orbs and invented transiting angles before inference',async()=>{
 let calls=0;const env={AI:{run:async()=>{calls++;return {response:'unused'}}}};
 const base={...support,weight:.8};
 for(const evidence of [[base,base],[{...base,transit:'Moon',orb:.81}],[{...base,transit:'Ascendant'}]]){
  assert.equal((await onRequestPost({request:req(evidence),env})).status,400);
 }
 assert.equal(calls,0);
});
