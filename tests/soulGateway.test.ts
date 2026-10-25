import test from 'node:test';import assert from 'node:assert/strict';
import {onRequestPost} from '../functions/api/soul.ts';
import {detectInventedNatalText} from '../src/soulGrounding.ts';
const site='https://mxastro.pages.dev';
const v={topicId:1,language:'ar',evidence:[{planet:'Sun',longitude:10,sign:0,house:1,retrograde:false,angle:null},{planet:'Moon',longitude:100,sign:3,house:4,retrograde:false,angle:null}]};
const req=(body:unknown,origin=site)=>new Request(site+'/api/soul',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
test('Soul Qwen3 request is opt-in, same-origin and rejects made-up natal signs and bodies',async()=>{
 let called=false;const env={AI:{run:async()=>{called=true;return {response:'not reached'}}}};
 assert.equal((await onRequestPost({request:req(v,'https://attacker.invalid'),env})).status,403);
 assert.equal((await onRequestPost({request:req({...v,evidence:[{...v.evidence[0],sign:5}]}),env})).status,400);
 assert.equal((await onRequestPost({request:req({...v,evidence:[{...v.evidence[0],planet:'Secret fetish'}]}),env})).status,400);
 assert.equal(called,false);
});
test('Soul Qwen3 receives only allowed topics and actual numeric evidence, never name or birth metadata',async()=>{
 let requestPayload:any;
 const answer={summary:'الشمس بالحمل رمزياً تشير للمبادرة.',detailedAnalysis:'يظهر التفسير من الشمس في الحمل والقمر في السرطان، وهما مؤشرات رمزية يختلف دور كل واحد منهما في بناء القرار.',strengths:['التعبير عن المبادرة','فهم الحاجة للأمان'],challenges:['الاندفاع أحياناً','سوء فهم الآخرين'],practicalInsights:['دوّن موقفاً فعلياً وقارنه','اسأل شخصاً تثق بيه'],reflectionQuestions:['شنو السلوك الحقيقي اللي لاحظته؟']};
 const env={AI:{run:async(_model:string,payload:any)=>{requestPayload=payload;return {response:JSON.stringify(answer)}}}};
 const resp=await onRequestPost({request:req({...v,name:'SECRET PERSON',birthDate:'1985-03-29',privateReflections:'PRIVATE'}),env});
 assert.equal(resp.status,200);
 const result=await resp.json();
 assert.equal(result.topicId,1);assert.deepEqual(result.astrologicalEvidence,v.evidence);
 assert.ok(!JSON.stringify(requestPayload).includes('SECRET PERSON'));assert.ok(!JSON.stringify(requestPayload).includes('1985-03-29'));
 assert.ok(!JSON.stringify(requestPayload).includes('PRIVATE'));
});
test('Invalid model response cannot override locally calculated Soul DNA interpretations',async()=>{
 const env={AI:{run:async()=>({response:'not JSON'})}};
 assert.equal((await onRequestPost({request:req(v),env})).status,502);
});

test('Qwen3 repeated clauses are replaced by a labeled editorial fallback',async()=>{
 const duplicate='نفس الكلام ينكتب في الخلاصة والتحليل العميق ويصير تكرار مزعج';
 const response={summary:duplicate,detailedAnalysis:duplicate,strengths:['فرصة للاختبار العملي'],challenges:['تجنب القفز للاستنتاجات'],practicalInsights:['اسأل الطرف المعني مباشرة'],reflectionQuestions:['شنو السلوك اللي تأكدت منه؟']};
 const env={AI:{run:async()=>({response:JSON.stringify(response)})}};
 const result=await onRequestPost({request:req(v),env});
 assert.equal(result.status,200);
 const body=await result.json();
 assert.equal(body.quality,'verified-editorial-fallback');
 assert.equal(body.fallbackReason,'repetition');
 assert.ok(!JSON.stringify(body).includes(duplicate));
});

test('nested personal fields are stripped and aspect geometry is checked before inference',async()=>{
 let packet='';
 const env={AI:{run:async(_model:string,payload:unknown)=>{packet=JSON.stringify(payload);return {response:'not JSON'}}}};
 const input={...v,evidence:v.evidence.map(p=>({...p,privateNote:'NESTED PRIVATE',birthDate:'PRIVATE BIRTH'}))};
 await onRequestPost({request:req(input),env});
 assert.ok(packet.includes('computedAspects'));
 assert.ok(!packet.includes('NESTED PRIVATE')&&!packet.includes('PRIVATE BIRTH'));
 packet='';
 const fabricated={...v,evidence:[{...v.evidence[0],angle:{planet:'Moon',type:0,orb:0}},v.evidence[1]]};
 assert.equal((await onRequestPost({request:req(fabricated),env})).status,400);
 assert.equal(packet,'');
});

test('a summary copied inside a longer analysis is excluded as repeated content',async()=>{
 const summary='نراجع أسلوب اتخاذ القرار من خلال مواقف متكررة تشمل معلومات واضحة وخيارات مختلفة';
 const response={summary,detailedAnalysis:'تفسير إضافي: '+summary+' قبل تعميم أي استنتاج.',strengths:['تحديد الأولوية'],challenges:['تأجيل الحسم'],practicalInsights:['دوّن تجربة حديثة'],reflectionQuestions:['ما المعلومة التي غيرت قرارك؟']};
 const env={AI:{run:async()=>({response:JSON.stringify(response)})}};
 const result=await onRequestPost({request:req(v),env});
 assert.equal(result.status,200);
 assert.equal((await result.json()).fallbackReason,'repetition');
});
test('one relevant placement is insufficient and never reaches the model',async()=>{
 let calls=0;const env={AI:{run:async()=>{calls++;return {response:'not reached'}}}};
 const result=await onRequestPost({request:req({...v,evidence:[v.evidence[0]]}),env});
 assert.equal(result.status,422);
 assert.equal((await result.json()).code,'INSUFFICIENT_EVIDENCE');
 assert.equal(calls,0);
});
test('topic-irrelevant and unknown-time-sensitive placements cannot authorize an inference',async()=>{
 let calls=0;const env={AI:{run:async()=>{calls++;return {response:'not reached'}}}};
 const unrelated=await onRequestPost({request:req({...v,evidence:[v.evidence[0],{...v.evidence[1],planet:'Venus'}]}),env});
 assert.equal(unrelated.status,400);
 assert.equal((await unrelated.json()).code,'UNRELATED_EVIDENCE');
 const unknown=await onRequestPost({request:req({...v,birthTimeKnown:false}),env});
 assert.equal(unknown.status,400);
 assert.equal((await unknown.json()).code,'UNKNOWN_BIRTH_TIME');
 assert.equal(calls,0);
});
const symbolicAnswer={summary:'رمزياً قد تقارن بين المبادرة والحاجة للأمان.',detailedAnalysis:'الشمس في الحمل والقمر في السرطان موضعان محسوبان، ومعانيهما الشخصية محاور للمراجعة وليست صفات مثبتة عنك.',strengths:['اقتراح خيار قابل للتجربة'],challenges:['الخلط بين الانطباع والمعلومة'],practicalInsights:['سجّل ما حدث قبل تفسيره'],reflectionQuestions:['ما الدليل الذي قد يغيّر رأيك؟']};
test('numerically correct natal evidence cannot authorize probabilities, diagnoses or private-person claims',async()=>{
 for(const claim of ['نسبة النجاح ٩٠ بالمية','You will marry this year.','She loves you.','You have depression.']){
  const env={AI:{run:async()=>({response:JSON.stringify({...symbolicAnswer,detailedAnalysis:symbolicAnswer.detailedAnalysis+' '+claim})})}};
  const result=await onRequestPost({request:req({...v,birthTimeKnown:true}),env});
  assert.equal(result.status,200);
  const body=await result.json();
  assert.equal(body.fallbackReason,'unsupported-claim',claim);
  assert.equal(body.contentOrigin,'editorial-interpretation');
  assert.equal(body.provenance.predictionValidated,false);
  assert.equal(body.provenance.outputReview.status,'editorial-replacement');
  assert.ok(!JSON.stringify(body).includes(claim));
 }
});
test('natal responses disclose their symbolic origin and bounded checks; missing symbolic framing is excluded',async()=>{
 const env={AI:{run:async()=>({response:JSON.stringify(symbolicAnswer)})}};
 const resp=await onRequestPost({request:req({...v,birthTimeKnown:true}),env});
 const body=await resp.json();
 assert.equal(body.quality,'source-grounded-model');
 assert.equal(body.contentOrigin,'generated-interpretation');
 assert.equal(body.provenance.origin,'client-ephemeris-placements');
 assert.equal(body.provenance.predictionValidated,false);
 assert.equal(body.provenance.birthTimeKnown,true);
 assert.equal(body.provenance.outputReview.status,'passed-bounded-checks');
 assert.ok(Number.isFinite(Date.parse(body.provenance.reviewedAt)));
 const noFrame={...symbolicAnswer,summary:'هذه صفات ثابتة حسب مواضع الشمس والقمر.'};
 const rejected=await onRequestPost({request:req(v),env:{AI:{run:async()=>({response:JSON.stringify(noFrame)})}}});
 assert.equal((await rejected.json()).fallbackReason,'unsupported-claim');
});

test('ordinary Arabic and English placement paraphrases cannot swap two authorized signs',async()=>{
 for(const claim of [
  'الشمس موجودة في السرطان','برج الشمس هو السرطان','القمر يقع في الحمل',
  'الشمس تقع ببرج السرطان','السرطان هو برج الشمس','Sun is in Cancer','Moon is positioned in Aries',
  'قمرك بالعقرب','شمسك بالسرطان','وقمرچ بالحمل','شمسج بالسرطان',
 ]){
  const errors=detectInventedNatalText([claim],v.evidence);
  assert.ok(errors.some(code=>code.startsWith('wrong-planet-sign:')),claim);
  const env={AI:{run:async()=>({response:{...symbolicAnswer,detailedAnalysis:'هذه قراءة رمزية للمراجعة، '+claim+'، ثم قارن المعنى بمواقفك من دون اعتباره صفة ثابتة.'}})}};
  const response=await onRequestPost({request:req(v),env});const body=await response.json();
  assert.equal(response.status,200);assert.equal(body.quality,'verified-editorial-fallback',claim);
  assert.equal(body.fallbackReason,'natal-evidence',claim);
 }
});
test('correct placement paraphrases remain valid and do not cross a clause to the next planet',()=>{
 for(const claim of [
  'الشمس موجودة في الحمل، والقمر يقع في السرطان',
  'برج الشمس هو الحمل. القمر موجود في السرطان.',
  'الشمس تعبر عن المبادرة، والقمر في السرطان.',
  'Sun is located in Aries; Moon is in Cancer.',
  "Sun's sign is Aries, and Moon is positioned in Cancer.",
  'الشمس موجودة في البيت الأول، والقمر يقع في البيت الرابع',
  'قمرك بالسرطان، وشمسك بالحمل','قمرچ بالسرطان وشمسج بالحمل',
 ])assert.deepEqual(detectInventedNatalText([claim],v.evidence),[],claim);
});
test('a planet cannot borrow another supplied house through ordinary location prose',()=>{
 for(const claim of ['الشمس موجودة في البيت الرابع','القمر يقع في البيت الأول','Sun is positioned in house 4'])
  assert.ok(detectInventedNatalText([claim],v.evidence).some(code=>code.startsWith('wrong-planet-house:')),claim);
 assert.ok(detectInventedNatalText(['ونبتون يضيف موضوعاً جديداً'],v.evidence).includes('invented-planet:Neptune'));
});
