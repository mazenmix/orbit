import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {birthInstant, type Profile} from '../src/engine.ts';
const sample:Profile={id:'baghdad-utc',name:'Imported UTC birth',date:'1985-03-29',time:'19:20',zone:'Etc/UTC',city:'Baghdad',lat:33.3152,lon:44.3661,known:true,kind:'self'};
test('a city label never rewrites a saved IANA birth timezone or instant',()=>{
 const input=structuredClone(sample);
 assert.equal(birthInstant(input).toISOString(),'1985-03-29T19:20:00.000Z');
 assert.equal(input.zone,'Etc/UTC');
 const ui=readFileSync('src/main.ts','utf8');
 assert.doesNotMatch(ui,/p\.zone==='Etc\/UTC'\?\{\.\.\.p,zone:'Asia\/Baghdad'\}/);
});
