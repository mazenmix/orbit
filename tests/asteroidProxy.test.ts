import test from 'node:test';import assert from 'node:assert/strict';
import {onRequestGet} from '../functions/api/asteroid.ts';
const req=(number:string)=>({request:new Request('https://mxastro.pages.dev/api/asteroid?number='+encodeURIComponent(number))});
test('server disallows open-proxy abuse and unknown asteroid numbers',async()=>{
 assert.equal((await onRequestGet(req('https://evil.com'))).status,400);
 assert.equal((await onRequestGet(req('-1'))).status,400);
 assert.equal((await onRequestGet(req('100000'))).status,404);
});
test('allowlisted asteroid returns binary only, no unvalidated remote URL',async()=>{
 const original=globalThis.fetch;
 try{
  let target='';
  globalThis.fetch=async u=>{target=String(u);return new Response(new Uint8Array(2000),{status:200})};
  const response=await onRequestGet(req('433'));
  assert.equal(response.status,200);assert.match(response.headers.get('content-type')??'',/octet-stream/);
  assert.ok(target.endsWith('/ast0/se00433s.se1'));
  assert.equal((await response.arrayBuffer()).byteLength,2000);
 }finally{globalThis.fetch=original}
});
test('nonexistent or truncated files fail closed',async()=>{
 const original=globalThis.fetch;
 try{globalThis.fetch=async()=>new Response(new Uint8Array(25),{status:200});
  assert.equal((await onRequestGet(req('433'))).status,502);
 }finally{globalThis.fetch=original}
});
