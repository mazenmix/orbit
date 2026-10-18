import test from 'node:test';import assert from 'node:assert/strict';
import {chartStories,profileAddress,partnerArabic,actionForGender} from '../src/chartNarrative.ts';
test('natal chart has seven distinct descriptive areas with signs and actions',()=>{const bodies=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'];const c={date:new Date(),asc:10,mc:100,cusps:[],points:bodies.map((id,i)=>({id,symbol:'◉',longitude:i*34,speed:1})),missing:[]};const result=chartStories(c);assert.equal(result.length,7);assert.equal(new Set(result.map(x=>x.titleAr)).size,7);assert.ok(result.every(x=>x.ar.length>45&&x.actionAr.length>20))});
test('male and female profile labels vary grammatically, missing gender stays unspecified',()=>{assert.equal(profileAddress({name:'A',sex:'female'}),'صاحبة الخارطة');assert.equal(profileAddress({name:'B',sex:'male'}),'صاحب الخارطة');assert.equal(profileAddress({name:'C'}),'الشخص صاحب الخارطة')});

test('Partner sex option changes Iraqi pronouns without changing any astrology calculations',()=>{
 assert.equal(partnerArabic('ما نكدر نعرف رغبتها وأحلامها ولا شنو مريح إلها','male'),'ما نكدر نعرف رغبته وأحلامه ولا شنو مريح إله');
 assert.equal(partnerArabic('ما نكدر نعرف رغبتها وأحلامها','female'),'ما نكدر نعرف رغبتها وأحلامها');
 assert.ok(partnerArabic('ما نكدر نعرف رغبتها').includes('الرغبة الشخصية'));
 assert.equal(actionForGender('راجع شعورك','female'),'راجعي شعورك');
});
