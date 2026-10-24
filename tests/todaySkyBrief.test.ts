import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {currentSkyContacts,todaySkyBrief,todayEventPlain} from '../src/todaySkyBrief.ts';
import type {Point} from '../src/math.ts';
import type {LunarWindow,ExactEvent} from '../src/timing.ts';

const at=new Date('2026-10-24T18:00:00.000Z');
const event=(offsetHours:number,target:string,angle:number):ExactEvent=>({
 time:new Date(+at+offsetHours*3600000),transit:'Moon',target,angle,phase:angle
});
const moonWindow=(sign=0,isVoid=false,events:ExactEvent[]=[event(-1,'Mercury',60),event(2,'Venus',120)]):LunarWindow=>({
 at,sign,enteredAt:new Date(+at-18*3600000),ingressAt:new Date(+at+28*3600000),
 vocStartsAt:new Date(+at+20*3600000),isVoid,lastAspect:events.at(-1)??null,
 events,convention:'Test'
});
const sky=(moonLon=10,venusLon=85):Point[]=>[
 {id:'Moon',longitude:moonLon,speed:13.2,symbol:'☾'},
 {id:'Sun',longitude:200,speed:1,symbol:'☉'},
 {id:'Venus',longitude:venusLon,speed:1.2,symbol:'♀'},
 {id:'Mercury',longitude:110,speed:1.1,symbol:'☿'},
 {id:'Mars',longitude:320,speed:.7,symbol:'♂'}
];

test('Recent and upcoming Swiss-sourced lunar events appear without invented times',()=>{
 const brief=todaySkyBrief(sky(),moonWindow(),at,'ar');
 assert.equal(brief.recent?.label,'القمر ويّه عطارد');
 assert.equal(brief.next?.label,'القمر ويّه الزهرة');
 assert.equal(brief.next?.time.toISOString(),'2026-10-24T20:00:00.000Z');
 assert.match(brief.title,/القمر/);
 assert.ok(brief.action.length>15);
 assert.ok(brief.identity);
});

test('Headline changes as the exact approaching lunar event becomes active, then separates',()=>{
 const approaching=sky(10,70.7); // lunar separation approaches sixty degrees
 const separating=sky(10,69.3);
 const one=todaySkyBrief(approaching,moonWindow(),at,'ar');
 const two=todaySkyBrief(separating,moonWindow(),at,'ar');
 assert.notEqual(one.movement,two.movement);
 assert.notEqual(one.identity,two.identity);
 assert.equal(currentSkyContacts(approaching)[0].applying,true);
 assert.equal(currentSkyContacts(separating)[0].applying,false);
});

test('Moon sign ingress and void transition change actual message, not random prose',()=>{
 const before=todaySkyBrief(sky(),moonWindow(0,false,[]),at,'ar');
 const changed=todaySkyBrief(sky(38),moonWindow(1,false,[]),at,'ar');
 const voc=todaySkyBrief(sky(),moonWindow(0,true,[]),at,'ar');
 assert.notEqual(before.title,changed.title);
 assert.notEqual(before.title,voc.title);
 assert.match(voc.title,/خالي المسار/);
 assert.deepEqual(todaySkyBrief(sky(),moonWindow(0,false,[]),at,'ar'),before);
});

test('Human sky-event explanations contain no orbital degrees, geometry words or fabricated outcomes',()=>{
 const moon=todayEventPlain({kind:'moon-aspect',target:'Venus',angle:120},'ar');
 const personal=todayEventPlain({kind:'personal-aspect',transit:'Mars',target:'Jupiter',angle:90},'ar');
 const ing=todayEventPlain({kind:'moon-ingress',nextSign:1},'ar');
 for(const story of [moon,personal,ing]){
  assert.doesNotMatch(story.label+' '+story.description+' '+story.action,/[°%]|\b\d+(?:\.\d+)?\b|تثليث|تسديس|تربيع|مقابلة|اقتران/);
  assert.ok(story.label&&story.action);
 }
 assert.notEqual(moon.description,personal.description);
 assert.throws(()=>todayEventPlain({kind:'moon-aspect',target:'Venus',angle:42},'ar'));
});

test('Live Today page consumes sky state, not a stale natal-contact headline',()=>{
 const main=readFileSync('src/main.ts','utf8');
 const focus=main.slice(main.indexOf('function focusedToday(){'),main.indexOf('/** A stable daily scan',main.indexOf('function focusedToday(){')));
 const pro=main.slice(main.indexOf('function today(){'),main.indexOf('function trend(',main.indexOf('function today(){')));
 assert.match(focus,/brief=currentWholeSky\(\)/);
 assert.match(focus,/brief\.upcoming/);
 assert.match(focus,/brief\.latest/);
 assert.match(focus,/data-sky-reading-id/);
 assert.match(focus,/mx-sky-live-checked/);
 assert.doesNotMatch(focus,/orb\.toFixed|momentNarrative|momentProof|mx-focus-technical|focus-refine-peak|data-live-orb/);
 assert.match(pro,/sky=currentWholeSky\(\)/);
 assert.match(main,/const LIVE_CONTENT_INTERVAL_MS:Record<string,number>=\{today:10000/);
 assert.match(main,/setInterval\(\(\)=>refreshLiveView\(\),1000\)/);
 assert.match(main,/todayEventPlain\(e\.reading,lang\)/);
});
