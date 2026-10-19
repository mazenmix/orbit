import test from 'node:test';import assert from 'node:assert/strict';
import {chartStories,transitOverview,profileAddress,partnerArabic,actionForGender} from '../src/chartNarrative.ts';
import type {Report} from '../src/engine.ts';
test('natal chart has seven distinct descriptive areas with signs and actions',()=>{const bodies=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'];const c={date:new Date(),asc:10,mc:100,cusps:[],points:bodies.map((id,i)=>({id,symbol:'◉',longitude:i*34,speed:1})),missing:[]};const result=chartStories(c);assert.equal(result.length,7);assert.equal(new Set(result.map(x=>x.titleAr)).size,7);assert.ok(result.every(x=>x.ar.length>45&&x.actionAr.length>20))});
test('male and female profile labels vary grammatically, missing gender stays unspecified',()=>{assert.equal(profileAddress({name:'A',sex:'female'}),'صاحبة الخارطة');assert.equal(profileAddress({name:'B',sex:'male'}),'صاحب الخارطة');assert.equal(profileAddress({name:'C'}),'الشخص صاحب الخارطة')});

test('Partner sex option changes Iraqi pronouns without changing any astrology calculations',()=>{
 assert.equal(partnerArabic('ما نكدر نعرف رغبتها وأحلامها ولا شنو مريح إلها','male'),'ما نكدر نعرف رغبته وأحلامه ولا شنو مريح إله');
 assert.equal(partnerArabic('ما نكدر نعرف رغبتها وأحلامها','female'),'ما نكدر نعرف رغبتها وأحلامها');
 assert.ok(partnerArabic('ما نكدر نعرف رغبتها').includes('الرغبة الشخصية'));
 assert.equal(actionForGender('راجع شعورك','female'),'راجعي شعورك');
});
test('generic natal highlights share the unknown-time and finite-coordinate gate',()=>{
 const chart={date:new Date(),asc:null,mc:null,cusps:[],missing:[],points:[
  {id:'Sun',symbol:'☉',longitude:10,speed:1},{id:'Moon',symbol:'☾',longitude:20,speed:13},
  {id:'Mars',symbol:'♂',longitude:30,speed:NaN}
 ]};
 assert.equal(chartStories(chart).length,2);
 const result=chartStories(chart,false);
 assert.equal(result.length,1);
 assert.equal(result[0].titleEn,'Identity & decisions');
});
test('an empty contact set cannot turn default or bonus scores into a dominant personal theme',()=>{
 const text=transitOverview({evidence:[],scores:{career:99,love:50}} as unknown as Report);
 assert.match(text.en,/No calculated close contact/);
 assert.ok(!text.en.includes('emphasizes work'));
});
