import test from 'node:test';
import assert from 'node:assert/strict';
import {relationshipBrief} from '../src/relationshipBrief.ts';
import type {SynastryEvidence} from '../src/math.ts';
const p=(id:string)=>({id,symbol:'·',longitude:100,speed:0});
const aspect=(a:string,b:string,angle:number,orb=.5,influence=.9):SynastryEvidence=>({first:p(a),second:p(b),angle,orb,influence});
test('Venus-Mars trine produces direct attraction and sexual-chemistry statements, without numerical probability',()=>{
 const item=relationshipBrief([aspect('Venus','Mars',120)]);
 assert.match(item.attraction.ar,/الجاذبية/);
 assert.match(item.sexual.ar,/جنسية/);
 assert.match(item.sexual.ar,/الزهرة والمريخ/);
 assert.match(item.sexual.en,/sexual chemistry/);
 assert.doesNotMatch(item.sexual.ar,/\d+%|مؤكد|حتصير/);
 assert.ok(item.sexualContact);
});
test('sexual square is described as potentially intense but conflicting, not a guaranteed result',()=>{
 const item=relationshipBrief([aspect('Mars','Venus',90)]);
 assert.match(item.sexual.ar,/شدّ/);
 assert.match(item.sexual.en,/friction/);
 assert.doesNotMatch(item.sexual.ar,/تأكيد/);
});
test('missing sexual and attraction evidence does not display default percentages as facts',()=>{
 const item=relationshipBrief([aspect('Mercury','Saturn',120)]);
 assert.equal(item.attractionContact,null);
 assert.equal(item.sexualContact,null);
 assert.match(item.sexual.ar,/ماكو اتصال قريب/);
 assert.match(item.attraction.en,/No close calculated aspect/);
});
test('harmony chooses distinct aspect when there is one apart from strongest sexual contact',()=>{
 const sexual=aspect('Venus','Mars',120,.5,.9);
 const other=aspect('Moon','Sun',60,.8,.76);
 const item=relationshipBrief([sexual,other]);
 assert.equal(item.sexualContact,sexual);
 assert.equal(item.harmonyContact,other);
});
test('challenge copy stays specific to a calculated Sun-Neptune square',()=>{
 const item=relationshipBrief([aspect('Sun','Neptune',90)]);
 assert.match(item.challengeTitle.ar,/التوقعات/);
 assert.match(item.challenge.ar,/التربيع/);
 assert.match(item.challengeAction.ar,/التوقعات/);
});
