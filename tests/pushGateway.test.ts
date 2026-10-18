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
