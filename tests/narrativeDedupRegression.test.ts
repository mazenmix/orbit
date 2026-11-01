import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {skyAspectExplanation} from '../src/skyAtmosphere.ts';

const main=()=>readFileSync('src/main.ts','utf8');

test('Today has exactly one navigation link to full Lunar aspect timelines',()=>{
 const src=main();
 const start=src.indexOf('function wholeSkyEventItems(');
 const end=src.indexOf('// Station timelines',start);
 const events=src.slice(start,end);
 assert.match(events,/compact\?\(alreadyExplained\?'':/);
 assert.ok(src.includes('class="secondary mx-events-lunar-link"'));
 const focused=src.slice(src.indexOf('function focusedToday(){'),src.indexOf('function focusedTime(){'));
 assert.equal(focused.split('mx-events-lunar-link').length-1,1);
});
test('Evidence prints identical decision sensitivity paragraph once per screen',()=>{
 const src=main();
 const evidence=src.slice(src.indexOf('function evidencePage(){'),src.indexOf('function zoneChoices(',src.indexOf('function evidencePage(){')));
 assert.match(evidence,/shownDecisionReasons=new Set<string>\(\)/);
 assert.match(evidence,/uniqueDecision\?/);
 assert.match(evidence,/shownDecisionReasons\.add\(decisionKey\)/);
 assert.match(evidence,/digest\.sensitive\?'source-sensitivity':decision/);
});
test('Now clarifies overview base 92 vs derived overview 58 instead of two identically named scores',()=>{
 const src=main(),now=src.slice(src.indexOf('function nowPage(){'),src.indexOf('function nowTimeNavigation(',src.indexOf('function nowPage(){'))>0?src.indexOf('function nowTimeNavigation(',src.indexOf('function nowPage(){')):src.indexOf('function nowPage(){')+3200);
 assert.ok(now.includes('الصورة العامة · الأساسي'));
 assert.ok(now.includes('الصورة العامة · المركّب'));
});
test('all 8 secondary points have an aspect-specific narrative per 10 leading planets',()=>{
 const points=['Ascendant','MC','Chiron','Ceres','Pallas','Juno','Vesta','Pholus'];
 const planets=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
 const angles=[0,60,90,120,180];
 for(const extra of points){
  const values=new Set<string>();
  for(const planet of planets){
   const stories=angles.map(angle=>skyAspectExplanation(planet,extra,angle));
   assert.equal(new Set(stories).size,5,planet+' → '+extra);
   for(const story of stories){
    assert.ok(story.length>=90,planet+' '+extra);
    assert.doesNotMatch(story,/انسجام بين|التنسيق بينهم أسهل رمزياً|تأكد شنو حسّيت وشنو صار فعلاً/);
    values.add(story);
   }
  }
  assert.equal(values.size,50,extra);
 }
 assert.match(skyAspectExplanation('Sun','MC',60),/الشغل والسمعة/);
 assert.match(skyAspectExplanation('Mercury','Ascendant',90),/رسالة أو نقاش/);
 assert.match(skyAspectExplanation('Moon','Chiron',180),/نقطة حساسة/);
});
