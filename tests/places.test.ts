import test from 'node:test';import assert from 'node:assert/strict';
import {parseCities,onRequestGet} from '../functions/api/places.ts';
test('location service accepts resolved real coordinates and historical IANA zone only',()=>{
 const c=parseCities([{name:'Baghdad',admin1:'Baghdad',country:'Iraq',latitude:33.3152,longitude:44.3661,timezone:'Asia/Baghdad',id:98182}]);
 assert.equal(c.length,1);assert.equal(c[0].zone,'Asia/Baghdad');assert.equal(c[0].lat,33.3152);
 assert.equal(parseCities([{name:'Fake',latitude:NaN,longitude:100,timezone:'UTC',id:1}]).length,0);
});
test('geocoder enforces bounds, returns mapped records and avoids arbitrary outbound URL',async()=>{
 assert.equal((await onRequestGet({request:new Request('https://a.test/api/places?q=A')})).status,400);
 const original=globalThis.fetch;let outgoing='';
 try{globalThis.fetch=async(url)=>{outgoing=String(url);return new Response(JSON.stringify({results:[{name:'Manila',country:'Philippines',latitude:14.6,longitude:120.9,timezone:'Asia/Manila',id:99}]}))};
 const r=await onRequestGet({request:new Request('https://a.test/api/places?q=Manila')});
 assert.equal((await r.json()).results[0].zone,'Asia/Manila');assert.ok(outgoing.includes('geocoding-api.open-meteo.com'));
 }finally{globalThis.fetch=original}
});
