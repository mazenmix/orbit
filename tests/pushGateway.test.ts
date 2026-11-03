import test from 'node:test';import assert from 'node:assert/strict';
import {onRequestGet,onRequestPost,pushSchema} from '../functions/api/push.ts';
const site='https://mxastro.pages.dev',body={action:'subscribe',deviceId:'d'.repeat(22),secret:'s'.repeat(43),subscription:{endpoint:'https://evil.test/steal',keys:{p256dh:'bad',auth:'bad'}},zone:'Asia/Manila',moon:true,daily:true,hourly:true,events:[]};
const request=(value:unknown,origin=site)=>new Request(site+'/api/push',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(value)});
test('Push backend discloses missing binding and scheduler rather than pretending to send closed-app alerts',async()=>{
 const status=await onRequestGet({env:{}}).json();assert.equal(status.configured,false);assert.equal(status.schedulerEnabled,false);
 assert.equal((await onRequestPost({request:request(body),env:{}})).status,503);
});
test('External push endpoint and invalid browser credentials rejected',async()=>{
 const env={MX_SYNC_DB:{exec:async()=>{},prepare:()=>({bind:()=>({first:async()=>null})})} as any,MX_VAPID_PUBLIC_KEY:'public'};
 assert.equal((await onRequestPost({request:request(body,'https://evil.test'),env})).status,403);
 assert.equal((await onRequestPost({request:request({...body,deviceId:'short'}),env})).status,400);
 assert.equal((await onRequestPost({request:request(body),env})).status,400);
});
test('D1 schema declares per-device capability and unique sent event key for deduplication',()=>{
 assert.match(pushSchema(),/device_id TEXT PRIMARY KEY/);
 assert.match(pushSchema(),/PRIMARY KEY\(device_id,event_id\)/);
});

test('push test cooldown is claimed atomically even for simultaneous requests',async()=>{
 const secret='s'.repeat(43),deviceId='d'.repeat(22);
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(secret));
 const verifier=Array.from(new Uint8Array(bytes)).map(x=>x.toString(16).padStart(2,'0')).join('');
 const row={device_id:deviceId,verifier,subscription:'{}',updated_at:new Date(Date.now()-60000).toISOString()};
 let claims=0;
 const db={exec:async()=>{},prepare:(sql:string)=>({bind:(...args:any[])=>({
  first:async()=>({...row}),
  run:async()=>{
   assert.match(sql,/updated_at<=\?/);
   const [now,id,hash,cutoff]=args;
   if(id!==row.device_id||hash!==row.verifier||row.updated_at>cutoff)return {meta:{changes:0}};
   row.updated_at=now;claims++;return {meta:{changes:1}};
  }
 })})};
 const env={MX_SYNC_DB:db as any,MX_VAPID_PUBLIC_KEY:'public',MX_VAPID_PRIVATE_JWK:'invalid'};
 const testBody={action:'test',deviceId,secret};
 const responses=await Promise.all([onRequestPost({request:request(testBody),env}),onRequestPost({request:request(testBody),env})]);
 assert.equal(claims,1,'Only one request may acquire the cooldown');
 assert.equal(responses.filter(response=>response.status===429).length,1);
 // The other attempt reaches the sender and fails on the deliberately invalid key.
 assert.equal(responses.filter(response=>response.status===503).length,1);
 assert.equal((await onRequestPost({request:request(testBody),env})).status,429);
});
