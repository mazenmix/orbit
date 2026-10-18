import test from 'node:test';import assert from 'node:assert/strict';
import {soulThemes,getSoulTheme} from '../src/soulThemes.ts';
test('full 25 × 8 corpus contains 200 authored, bilingual, topical interpretations and distinct actions',()=>{
 assert.equal(soulThemes.length,200);
 for(const key of ['focusAr','focusEn','actionAr','actionEn'] as const){
  assert.equal(new Set(soulThemes.map(x=>x[key])).size,200,key+' must have no duplicated entries');
  assert.ok(soulThemes.every(x=>x[key].length>=25));
 }
 assert.match(getSoulTheme(1).focusAr,/قناعت/);
 assert.match(getSoulTheme(200).actionAr,/هدف/);
});
