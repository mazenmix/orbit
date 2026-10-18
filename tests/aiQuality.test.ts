import test from 'node:test';import assert from 'node:assert/strict';
import {conciseAI,unsafeAIGuesses,reviewGeneratedAdvice} from '../src/aiQuality.ts';
const ctx={language:'ar' as const,support:{transit:'Venus',natal:'Sun',angle:120,orb:.23,applying:true},challenge:{transit:'Saturn',natal:'Moon',angle:90,orb:.8,applying:false},events:[]};
test('Qwen3 cleanup removes private reasoning and repeated paragraphs',()=>{
 assert.equal(conciseAI('<think>private thoughts</think>جواب واحد.\n\nجواب واحد.\n\nجواب ثاني.'),'جواب واحد.\n\nجواب ثاني.');
});
test('unsupported probability, secret desires, eclipse and invented exact date trigger grounded fallback',()=>{
 for(const x of ['هذا مضمون 90%','she secretly wants you','الكسوف الجاي سيؤثر عليك','2027-05-13 سيتصل بيك']){
  const out=reviewGeneratedAdvice(x,ctx);
  assert.equal(out.fallback,true,x);assert.ok(out.problems.length);
  assert.ok(out.text.includes('الزهرة'));assert.ok(out.text.includes('زحل'));
 }
});
test('safe source-based two-paragraph text passes unchanged',()=>{
 const msg='اتصال الزهرة مع الشمس داعم ضمن نموذجنا الرمزي، لكنه ما يضمن حدوث شي.\n\nيمكنك مراجعة موقف واحد بوضوح.';
 assert.equal(reviewGeneratedAdvice(msg,ctx).text,msg);
});
test('only actually supplied eclipse date is accepted in a model explanation',()=>{
 const present={...ctx,events:[{kind:'solar',type:'total',maximum:'2027-08-02T10:00:00.000Z'}]};
 assert.deepEqual(unsafeAIGuesses('الكسوف بتاريخ 2027-08-02، والنتيجة مو مضمونة.',present),[]);
 assert.ok(unsafeAIGuesses('الكسوف بتاريخ 2027-02-06',present).length);
});
