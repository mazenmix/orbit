import test from 'node:test';
import assert from 'node:assert/strict';
import {momentNarrative} from '../src/momentNarrative.ts';
import type {Evidence} from '../src/math.ts';
import {readFileSync} from 'node:fs';
const factor=(target:string,angle:number,orb:number,applying:boolean):Evidence=>({
 id:'Moon-'+target,transit:{id:'Moon',symbol:'☾',longitude:51,speed:13.3},
 natal:{id:target,symbol:target,longitude:100,speed:0},angle,orb,applying,maximumOrb:1.4,weight:.74,exact:null
});
test('Different exact Moon contacts produce different short, practical readings',()=>{
 const a=momentNarrative(factor('Jupiter',60,.67,false),'ar');
 const b=momentNarrative(factor('Mars',120,.67,false),'ar');
 assert.ok(a&&b);
 assert.notEqual(a.title,b.title);
 assert.notEqual(a.effect,b.effect);
 assert.notEqual(a.action,b.action);
 assert.match(a.action,/فرصة/);
 assert.match(b.action,/خطوة/);
});
test('Narrative reacts to real applying, close and separating phase changes',()=>{
 const far=momentNarrative(factor('Jupiter',60,.67,true),'ar')!;
 const near=momentNarrative(factor('Jupiter',60,.04,true),'ar')!;
 const after=momentNarrative(factor('Jupiter',60,.67,false),'ar')!;
 assert.notEqual(far.phase,near.phase);
 assert.notEqual(far.phase,after.phase);
 assert.notEqual(far.action,after.action);
 assert.equal(far.orbText,'0.670°');
 assert.equal(near.orbText,'0.040°');
});
test('No fabricated narrative for unsupported aspect or invalid ephemeris',()=>{
 assert.equal(momentNarrative(factor('Jupiter',31,.4,true),'ar'),null);
 assert.equal(momentNarrative(factor('Jupiter',60,NaN,true),'ar'),null);
});
test('Home reading consumes calculated phase and orb; content refresh stays at most 15 seconds',()=>{
 const main=readFileSync('src/main.ts','utf8');
 assert.match(main,/momentNarrative\(factor,lang\)/);
 assert.match(main,/const LIVE_CONTENT_INTERVAL_MS:Record<string,number>=\{today:15000/);
 assert.match(main,/setInterval\(\(\)=>refreshLiveView\(\),1000\)/);
 assert.match(main,/data-live-orb=/);
});
