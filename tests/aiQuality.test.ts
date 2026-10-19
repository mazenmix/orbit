import test from 'node:test';import assert from 'node:assert/strict';
import {conciseAI,unsafeAIGuesses,reviewGeneratedAdvice,unsupportedOutcomeClaims,hasSymbolicFraming} from '../src/aiQuality.ts';
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
test('shared claim review rejects localized probability, future certainty, private desire and diagnosis',()=>{
 for(const [text,code] of [
  ['احتمال النجاح ٩٠ بالمية','unfounded-percentage'],['النسبة ۸۵٪','unfounded-percentage'],
  ['You will marry this year.','unsupported-future-outcome'],['راح يتصل بيك باچر','unsupported-future-outcome'],
  ['She loves you.','private-intent-claim'],['هو يرغب بيك جنسياً','private-intent-claim'],
  ['You have depression.','unsupported-diagnosis'],['عندك اكتئاب','unsupported-diagnosis']
 ])assert.ok(unsupportedOutcomeClaims(text).includes(code),text);
});
test('a negated guarantee cannot hide another certainty claim even in the same sentence',()=>{
 for(const text of ['Not guaranteed, but you certainly will succeed.','No guarantee and you will definitely succeed.','مو مضمون لكن أكيد راح تنجح','غير مضمون وأكيد راح تنجح'])
  assert.ok(unsupportedOutcomeClaims(text).includes('unsupported-certainty'),text);
 for(const text of ['Symbolic interpretation; not guaranteed.','لا نثبت نتيجة؛ هذا مو مضمون.'])
  assert.deepEqual(unsupportedOutcomeClaims(text),[]);
 assert.equal(hasSymbolicFraming('This is a symbolic reflection.'),true);
 assert.equal(hasSymbolicFraming('هذه قراءة رمزية للمراجعة.'),true);
 assert.equal(hasSymbolicFraming('These are established personality facts.'),false);
});
