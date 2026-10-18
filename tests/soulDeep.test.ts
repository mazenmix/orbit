import test from 'node:test';import assert from 'node:assert/strict';
import {soulDeep,soulDeepFor} from '../src/soulDeep.ts';
test('200 substantive different deep-analysis cases exist in natural Arabic and English',()=>{
 assert.equal(soulDeep.length,200);
 assert.equal(new Set(soulDeep.map(x=>x.ar)).size,200);
 assert.equal(new Set(soulDeep.map(x=>x.en)).size,200);
 assert.match(soulDeepFor(1).ar,/تختار/);
 assert.match(soulDeepFor(200).en,/aspiration/);
});
