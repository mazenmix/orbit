import test from 'node:test';import assert from 'node:assert/strict';
import {reviewEvidence} from '../src/decision.ts';
import type {Evidence} from '../src/math.ts';
const fact=(id:string,angle:number,weight=.8)=>({transit:{id,longitude:0,symbol:'?',speed:0},natal:{id:'Moon',longitude:0,symbol:'?',speed:0},angle,weight,orb:.2,maximumOrb:2,applying:true,exact:null} as Evidence);
test('contradictory supportive/challenging evidence forces MIXED and preserves both factors',()=>{
 const d=reviewEvidence([fact('Venus',120,.9),fact('Saturn',90,.85)]);
 assert.equal(d.tone,'mixed');assert.equal(d.contradictory,true);assert.equal(d.topChallenge?.transit.id,'Saturn');
 assert.equal(d.topSupport?.transit.id,'Venus');assert.ok(d.positive>0&&d.negative>0);
});
test('one-sided support, challenge and unclassifiable evidence remain distinct',()=>{
 assert.equal(reviewEvidence([fact('Venus',120)]).tone,'supportive');
 assert.equal(reviewEvidence([fact('Saturn',90)]).tone,'challenging');
 assert.equal(reviewEvidence([fact('Sun',0)]).tone,'unclear');
 assert.equal(reviewEvidence([]).tone,'insufficient');
});
test('invalid weights never manufacture influential factors',()=>{
 assert.equal(reviewEvidence([fact('Sun',120,NaN),fact('Sun',120,2)]).tone,'insufficient');
});
