import test from 'node:test';import assert from 'node:assert/strict';
import {onRequestGet,onRequestPost} from '../functions/api/sync.ts';
const site='https://mxastro.pages.dev',code={slot:'z'.repeat(22),secret:'s'.repeat(43)};
const send=(body:unknown,origin=site)=>new Request(site+'/api/sync',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
test('Cloudflare D1 not configured is explicit and never pretends to sync',async()=>{
 assert.equal((await onRequestGet({env:{}}).json()).configured,false);
 const r=await onRequestPost({request:send({action:'pull',...code}),env:{}});
 assert.equal(r.status,503);assert.equal((await r.json()).code,'SYNC_NOT_CONFIGURED');
});
test('Cross-origin and invalid forged unencrypted records are rejected before touching storage',async()=>{
 const env={MX_SYNC_DB:{} as any};
 assert.equal((await onRequestPost({request:send({action:'pull',...code},'https://attacker.test'),env})).status,403);
 assert.equal((await onRequestPost({request:send({action:'push',...code,revision:0,encrypted:{profiles:['private']} }),env})).status,400);
 assert.equal((await onRequestPost({request:send({action:'pull',...code,secret:'short'}),env})).status,400);
});
