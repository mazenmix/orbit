import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {personalSkyStory} from '../src/personalSkyNarrative.ts';
import type {WholeSkyOccurrence} from '../src/wholeSkyBroadcast.ts';
import type {Chart} from '../src/engine.ts';
import type {Point} from '../src/math.ts';
const NOW=new Date('2026-10-24T17:00:00.000Z');
const natal=(offset=0,known=true):Chart=>({
 date:new Date('1985-03-29T16:20:00.000Z'),
 points:[
  {id:'Sun',symbol:'☉',longitude:10,speed:0},
  {id:'Moon',symbol:'☽',longitude:120,speed:0},
  {id:'Mercury',symbol:'☿',longitude:150,speed:0},
  {id:'Venus',symbol:'♀',longitude:220,speed:0}
 ],
 cusps:known?Array.from({length:12},(_,i)=>(offset+i*30)%360):[],
 asc:known?offset:null,mc:known?(offset+270)%360:null,missing:[]
});
const sky:Point[]=[
 {id:'Sun',symbol:'☉',longitude:220,speed:1},
 {id:'Moon',symbol:'☾',longitude:55,speed:13},
 {id:'Mercury',symbol:'☿',longitude:210,speed:2},
 {id:'Venus',symbol:'♀',longitude:180.3,speed:1},
 {id:'Mars',symbol:'♂',longitude:290,speed:.8}
];
const ingress:WholeSkyOccurrence={kind:'ingress',at:new Date(+NOW-2*3600000),first:'Venus',sign:6};
const make=(event:WholeSkyOccurrence,n:Chart=natal(),knownBirthTime=true,at=NOW)=>
 personalSkyStory({event,at,natal:n,skyAtEvent:sky,knownBirthTime,lang:'ar'});

test('Venus ingress into Libra gives distinct natal partnership vs finances vs travel forecasts',()=>{
 const partnership=make(ingress,natal(0));  // Libra is house seven
 const finance=make(ingress,natal(150));   // Libra is house two
 const travel=make(ingress,natal(300));   // Libra is house nine
 assert.equal(partnership.personal,true);
 assert.match(partnership.focus,/شراكات|العلاقات|الاتفاقات/);
 assert.match(finance.focus,/مصاريف|الدخل/);
 assert.match(travel.focus,/سفر|الدراسة/);
 assert.notEqual(partnership.now,finance.now);
 assert.notEqual(finance.next,travel.next);
 assert.notEqual(partnership.action,finance.action);
 assert.ok(partnership.now.length>80&&partnership.next.length>80);
 assert.match(partnership.next,/الأيام الجاية/);
 assert.match(partnership.next,/توازن|الأخذ والعطاء/);
});
test('The event changes personal meaning according to transit planet, sign and natal house',()=>{
 const venus=make(ingress),mercury=make({...ingress,first:'Mercury',sign:2});
 assert.notEqual(venus.now,mercury.now);
 assert.notEqual(venus.next,mercury.next);
 assert.match(venus.title,/الزهرة/);
 assert.match(mercury.title,/عطارد/);
});
test('Upcoming and elapsed events have truthful different staging, with no promise of external result',()=>{
 const future=make({...ingress,at:new Date(+NOW+3600000)});
 const past=make(ingress);
 assert.match(future.now,/قبل هالحدث/);
 assert.doesNotMatch(past.now,/قبل هالحدث/);
 assert.doesNotMatch(future.now+future.next,/راح تتصل|أكيد راح|شخص راح يرجع/);
});
test('Unknown birth time does not invent Placidus houses',()=>{
 const n=natal(0,false);
 const story=make(ingress,n,false);
 assert.equal(story.personal,false);
 assert.match(story.focus,/وقت الميلاد مو مؤكد/);
 assert.doesNotMatch(story.now,/بخريطتك هذا يرتبط/);
});
test('Actual natal contact may add a verified second topic, not imaginary orb math',()=>{
 const event:WholeSkyOccurrence={kind:'aspect',first:'Venus',second:'Mercury',angle:120,at:NOW};
 const withContact:Chart={...natal(0),points:[{id:'Sun',symbol:'☉',longitude:180.2,speed:0}]};
 const reading=make(event,withContact);
 assert.match(reading.next,/بخريطتك هذا يلامس موضوع/);
 assert.doesNotMatch(reading.now+reading.next,/[°]|تربيع|تثليث|تسديس|أورب|درجة/);
});
test('Today cards and main hero use personal context rather than general copy',()=>{
 const main=readFileSync('src/main.ts','utf8');
 const feed=main.slice(main.indexOf('function wholeSkyEventItems('),main.indexOf('function planetLiveStatus('));
 assert.match(feed,/personalEventStory\(e\)/);
 assert.match(feed,/story\.now/);
 assert.match(feed,/story\.next/);
 assert.match(feed,/story\.action/);
 assert.match(feed,/story\.focus/);
 assert.doesNotMatch(feed,/line\.description|line\.action/);
 const today=main.slice(main.indexOf('function focusedToday(){'),main.indexOf('/** A stable daily scan'));
 assert.match(today,/mainPersonalEvent\(brief\)/);
 assert.match(today,/personalized\.next/);
 const pro=main.slice(main.indexOf('function today(){'),main.indexOf('function trend('));
 assert.match(pro,/mainPersonalEvent\(sky\)/);
 assert.match(pro,/personal\.next/);
});

test('Moon-Jupiter event never inherits weeks-long Jupiter narrative',()=>{
 const event:WholeSkyOccurrence={kind:'aspect',first:'Moon',second:'Jupiter',angle:120,at:NOW};
 const story=make(event);
 assert.doesNotMatch(story.next,/بالأسابيع الجاية|in the coming weeks/i);
 assert.match(story.next,/الاتصال القمري/);
 assert.match(story.now,/زاوية داعمة رمزياً/);
});
test('retrograde ingress describes revisiting a sign without promising a reunion',()=>{
 const event:WholeSkyOccurrence={...ingress,retrograde:true};
 const story=make(event);
 assert.match(story.title,/رجع متراجعاً/);
 assert.match(story.now,/عودة أثناء التراجع/);
 assert.doesNotMatch(story.now+story.next,/أكيد يرجع|حتتصل|شخص راح يرجع/);
});
