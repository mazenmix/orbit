import test from 'node:test';
import assert from 'node:assert/strict';
import {relationshipBrief} from '../src/relationshipBrief.ts';
import {relationshipEditorial} from '../src/relationshipEditorial.ts';
import type {SynastryEvidence} from '../src/math.ts';
const planet=(id:string)=>({id,symbol:'·',longitude:100,speed:0});
const aspect=(a:string,b:string,angle:number,orb=.5,influence=.9):SynastryEvidence=>({first:planet(a),second:planet(b),angle,orb,influence});

test('One Venus-Mars aspect gives two different topics without fake extra evidence',()=>{
 const brief=relationshipBrief([aspect('Venus','Mars',120)]);
 const reading=relationshipEditorial(brief);
 assert.match(reading.attraction.body.ar,/المودة/);
 assert.match(reading.sexual.body.ar,/الحميمية/);
 assert.notEqual(reading.attraction.body.ar,reading.sexual.body.ar);
 assert.equal(reading.sexual.sharedSource,true);
 assert.equal(reading.attraction.sharedSource,false);
 assert.match(reading.attraction.source!.ar,/0\.50°/);
 assert.equal(reading.harmony,null);
 assert.equal(reading.challenge,null);
});
test('Harmony and challenge must use independent, mathematically named contacts',()=>{
 const romantic=aspect('Venus','Mars',120,.40,.95);
 const harmony=aspect('Mercury','Mercury',60,.60,.81);
 const challenge=aspect('Sun','Neptune',90,.72,.8);
 const reading=relationshipEditorial(relationshipBrief([romantic,harmony,challenge]));
 assert.match(reading.harmony!.body.ar,/الأفكار/);
 assert.match(reading.challenge!.body.ar,/التوقعات/);
 assert.match(reading.harmony!.source!.ar,/عطارد/);
 assert.match(reading.challenge!.source!.ar,/□/);
 assert.notEqual(reading.harmony!.source!.ar,reading.attraction.source!.ar);
 assert.notEqual(reading.challenge!.source!.ar,reading.harmony!.source!.ar);
});
test('One challenging sexual aspect is not recycled into a separate challenge card',()=>{
 const reading=relationshipEditorial(relationshipBrief([aspect('Mars','Venus',90)]));
 assert.ok(reading.attraction.body.ar.includes('مبادرة')||reading.attraction.body.ar.includes('المودة'));
 assert.ok(reading.sexual.body.ar.includes('الحميمية'));
 assert.equal(reading.challenge,null);
});
test('No matching aspects should never invent desire, harmony or conflict',()=>{
 const reading=relationshipEditorial(relationshipBrief([]));
 assert.equal(reading.attraction.contact,null);
 assert.equal(reading.sexual.contact,null);
 assert.equal(reading.attraction.source,null);
 assert.equal(reading.harmony,null);
 assert.equal(reading.challenge,null);
});
test('Reverse planet order stays legible and does not change topic selection',()=>{
 const a=relationshipEditorial(relationshipBrief([aspect('Mars','Venus',60)]));
 const b=relationshipEditorial(relationshipBrief([aspect('Venus','Mars',60)]));
 assert.equal(a.attraction.body.ar,b.attraction.body.ar);
 assert.equal(a.sexual.body.en,b.sexual.body.en);
 assert.match(a.attraction.source!.en,/Mars/);
});
