import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {skyAspectExplanation} from '../src/skyAtmosphere.ts';

test('Time Machine uses exact, pair-sensitive event titles and no generic topic harmony',()=>{
 const main=readFileSync('src/main.ts','utf8');
 const begin=main.indexOf('function focusedTime(){');
 const end=main.indexOf('function morePage(){',begin);
 assert.ok(begin>=0&&end>begin);
 const reading=main.slice(begin,end);
 assert.match(reading,/skyAspectExplanation\(factor!\.transit\.id,factor!\.natal\.id,factor!\.angle/);
 assert.match(reading,/planet\(factor\.transit\.id\)\+' '\+aspect\(factor\.angle\)/);
 assert.doesNotMatch(reading,/esc\(info\.title\)<\/strong><small>\+'\+esc\(info\.action\)/);
 const squares=[
  skyAspectExplanation('Mercury','Mars',90),
  skyAspectExplanation('Moon','Sun',90),
  skyAspectExplanation('Venus','Saturn',90)
 ];
 assert.equal(new Set(squares).size,3);
});
