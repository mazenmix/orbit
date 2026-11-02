import test from 'node:test';
import assert from 'node:assert/strict';
import {relationshipBrief} from '../src/relationshipBrief.ts';
import {synastryPlainReading} from '../src/relationshipPlain.ts';
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
 assert.match(item.attraction.ar,/^الجاذبية · الزهرة والمريخ بتثليث؛/);
 assert.doesNotMatch(item.attraction.ar,/الجاذبية هنا تتعلق بطبيعة التفاعل/);
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

test('bespoke synastry stories never append an unrelated second paragraph for the same contact',()=>{
 const harmonious=aspect('Venus','Mars',120);
 const challenge=aspect('Sun','Neptune',90);
 const item=relationshipBrief([harmonious,challenge]);
 assert.equal(item.harmony.ar,synastryPlainReading(harmonious,'harmony').meaning.ar);
 assert.equal(item.challenge.ar,synastryPlainReading(challenge,'challenge').meaning.ar);
 assert.match(item.harmony.ar,/الزهرة بالمريخ/);
 assert.match(item.challenge.ar,/التوقعات/);
});
test('unrecognized synastry objects do not display engine template-warning text',()=>{
 const item=relationshipBrief([aspect('MysteryBody','AnotherBody',60)]);
 assert.doesNotMatch(item.harmony.ar,/ما عنده قراءة مخصصة|ماكو زاوية محسوبة مدعومة/);
 assert.doesNotMatch(item.harmony.en,/no verified object-specific narrative/i);
});
