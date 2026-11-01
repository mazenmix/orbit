import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequestPost} from '../functions/api/soul.ts';
const site='https://mxastro.pages.dev';
const evidence=[
 {planet:'Sun',longitude:9.1,sign:0,house:7,retrograde:false,angle:null},
 {planet:'Moon',longitude:109,sign:3,house:10,retrograde:false,angle:null}
];
const send=async(run:()=>Promise<unknown>)=>{
 const request=new Request(site+'/api/soul',{method:'POST',headers:{Origin:site,'Content-Type':'application/json'},body:JSON.stringify({topicId:1,language:'ar',evidence})});
 const response=await onRequestPost({request,env:{AI:{run}}});
 return {status:response.status,data:await response.json() as any};
};
test('malformed Qwen3 output is replaced by a verified source-grounded editorial narrative',async()=>{
 const result=await send(async()=>({response:'<think>draft</think> unrelated text without JSON'}));
 assert.equal(result.status,200);
 assert.equal(result.data.quality,'verified-editorial-fallback');
 assert.equal(result.data.fallbackReason,'invalid-structure');
 assert.ok(result.data.summary.length>15);
 assert.ok(result.data.astrologicalEvidence.length===2);
});
test('provider failure gives evidence-limited text, not HTTP 502',async()=>{
 const result=await send(async()=>{throw Error('model timeout')});
 assert.equal(result.status,200);
 assert.equal(result.data.quality,'verified-editorial-fallback');
 assert.equal(result.data.fallbackReason,'service-error');
 assert.ok(Array.isArray(result.data.practicalInsights));
});
test('incomplete Qwen3 JSON is replaced, not displayed as if verified',async()=>{
 const result=await send(async()=>({response:{summary:'one sentence only'}}));
 assert.equal(result.status,200);
 assert.equal(result.data.quality,'verified-editorial-fallback');
 assert.equal(result.data.fallbackReason,'invalid-structure');
});
