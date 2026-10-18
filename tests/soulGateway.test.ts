import test from 'node:test';import assert from 'node:assert/strict';
import {onRequestPost} from '../functions/api/soul.ts';
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
