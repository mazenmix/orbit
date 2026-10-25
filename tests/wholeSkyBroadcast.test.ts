import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {scanWholeSky,wholeSkyBroadcast,occurrenceLanguage,FULL_SKY_BODIES,type WholeSkyOccurrence} from '../src/wholeSkyBroadcast.ts';
import type {Point} from '../src/math.ts';
const BASE=Date.parse('2026-10-24T00:00:00Z'),HOUR=3600000;
const sample=(t:Date):Point[]=>{
 const h=(+t-BASE)/HOUR;
 const lon:Record<string,number>={Sun:210+h*.04,Moon:5+h*.55,Mercury:29.5+h*.1,Venus:90,Mars:160,Jupiter:248,Saturn:307,Uranus:340,Neptune:277,Pluto:190};
 return FULL_SKY_BODIES.map(id=>({id,symbol:'•',longitude:lon[id],speed:id==='Moon'?13.2:id==='Mercury'?2.4:id==='Sun'?.96:0}));
};
test('All ten major bodies must come from actual valid ephemeris points',()=>{
 const points=sample(new Date(BASE));
 const out=wholeSkyBroadcast(points,[],new Date(BASE),'ar');
 assert.equal(out.planets.length,10);
 assert.ok(out.planets.some(p=>p.id==='Sun'));
 assert.ok(out.planets.some(p=>p.id==='Pluto'));
 assert.throws(()=>wholeSkyBroadcast(points.filter(p=>p.id!=='Saturn'),[],new Date(BASE),'ar'),/Saturn/);
});
test('Whole-sky streams render exactly the verified 2, 3, 5 or 10+ events, without filler or 4/6 caps',()=>{
 const at=new Date(BASE),past=(n:number):WholeSkyOccurrence[]=>Array.from({length:n},(_,i)=>({
  kind:'aspect',at:new Date(+at-(i+1)*HOUR),first:'Sun',second:'Moon',angle:0
 }));
 const future=(n:number):WholeSkyOccurrence[]=>Array.from({length:n},(_,i)=>({
  kind:'aspect',at:new Date(+at+(i+1)*HOUR),first:'Moon',second:'Venus',angle:120
 }));
 for(const n of [0,2,3,5,10,13]){
  const sky=wholeSkyBroadcast(sample(at),[...past(n),...future(n)],at,'ar');
  assert.equal(sky.latest.length,n,'Recent list must have precisely the calculated events');
  assert.equal(sky.upcoming.length,n,'Upcoming list must have precisely the calculated events');
  assert.ok(sky.latest.every(x=>+x.at<=+at));
  assert.ok(sky.upcoming.every(x=>+x.at>+at));
  if(n>0){
   assert.equal(+sky.latest[0].at,+at-HOUR,'Recent events newest first');
   assert.equal(+sky.upcoming[0].at,+at+HOUR,'Upcoming events earliest first');
  }
 }
});
test('Today scans sufficient actual sky history for the recent-events grid',()=>{
 const main=readFileSync('src/main.ts','utf8');
 assert.match(main,/scanWholeSky\(selected,at=>chart\(at,active,false,false\)\.points,72,48\)/);
 const focus=main.slice(main.indexOf('function focusedToday(){'),main.indexOf('/** A stable daily scan'));
 assert.match(focus,/wholeSkyEventItems\(brief\.latest,[^\n]*,true\)/);
});
test('Exact whole-sky roots include NON-lunar Mercury-Venus contact and Mercury sign ingress',()=>{
 const events=scanWholeSky(new Date(BASE+3*HOUR),sample,5,9);
 const contact=events.find(x=>x.kind==='aspect'&&x.first==='Mercury'&&x.second==='Venus'&&x.angle===60);
 const ingress=events.find(x=>x.kind==='ingress'&&x.first==='Mercury'&&x.sign===1);
 assert.ok(contact,'exact Mercury–Venus contact must not be hidden by the Moon');
 assert.ok(ingress,'real Mercury sign transition must appear');
 assert.ok(Math.abs(+contact!.at-(BASE+5*HOUR))<60000,'contact timestamp numerically refined');
 assert.ok(Math.abs(+ingress!.at-(BASE+5*HOUR))<60000,'ingress timestamp numerically refined');
});
test('Station direction is refined from signed real ephemeris velocity',()=>{
 const station=BASE+2*HOUR;
 const read=(date:Date):Point[]=>sample(date).map(p=>p.id==='Mars'?{...p,longitude:160+Math.pow((+date-station)/HOUR,2)*.003,speed:((+date-station)/HOUR)*.144}:p);
 const events=scanWholeSky(new Date(station),read,5,5);
 const changed=events.find(e=>e.kind==='station'&&e.first==='Mars');
 assert.ok(changed,'actual sign change of speed');
 assert.equal(changed!.retrograde,false);
 assert.ok(Math.abs(+changed!.at-station)<60000);
});
test('An actual nonlunar event can drive the headline while all planets remain visible',()=>{
 const at=new Date(BASE+3*HOUR);
 const events:WholeSkyOccurrence[]=[{kind:'aspect',at:new Date(+at+HOUR),first:'Mercury',second:'Venus',angle:60}];
 const briefing=wholeSkyBroadcast(sample(at),events,at,'ar');
 assert.match(briefing.title,/عطارد.*الزهرة/);
 assert.match(briefing.title,/دا يقترب/);
 assert.equal(briefing.next?.first,'Mercury');
 assert.equal(briefing.planets.length,10);
 assert.doesNotMatch(briefing.title+' '+briefing.meaning+' '+briefing.action,/°|[0-9]\.[0-9]/);
});
test('Sky text is stable until real phase/event/planet change; no random clock cycling',()=>{
 const at=new Date(BASE+3*HOUR);
 const events:WholeSkyOccurrence[]=[{kind:'aspect',at:new Date(+at+HOUR),first:'Mercury',second:'Venus',angle:60}];
 const one=wholeSkyBroadcast(sample(at),events,at,'ar');
 assert.deepEqual(wholeSkyBroadcast(sample(at),events,at,'ar'),one);
 const after=wholeSkyBroadcast(sample(new Date(+at+2*HOUR)),events,new Date(+at+2*HOUR),'ar');
 assert.notEqual(one.title,after.title);
 const language=occurrenceLanguage(events[0],'ar');
 assert.match(language.title,/تسديس/); assert.doesNotMatch(language.description,/°|[0-9]\.[0-9]/);
});
test('Today UI uses whole-sky stream in simple and Pro, not lunar-only selection',()=>{
 const main=readFileSync('src/main.ts','utf8');
 const focus=main.slice(main.indexOf('function focusedToday(){'),main.indexOf('/** A stable daily scan'));
 const pro=main.slice(main.indexOf('function today(){'),main.indexOf('function trend('));
 for(const key of ['currentWholeSky()','planetLiveStatus(brief)','wholeSkyEventItems(brief.upcoming','wholeSkyEventItems(brief.latest'])assert.ok(focus.includes(key),key);
 assert.match(pro,/sky=currentWholeSky\(\)/);
 assert.match(focus,/الأحداث الفلكية القادمة · كل الكواكب/);
 assert.match(main,/scanWholeSky\(selected,at=>chart\(at,active,false,false\)\.points,72,48\)/);
 assert.match(main,/const LIVE_CONTENT_INTERVAL_MS:Record<string,number>=\{today:10000/);
 assert.doesNotMatch(focus,/momentNarrative\(|todaySkyBrief\(|orb.toFixed/);
});


test('Mercury retrograde addresses reader with message and booking advice, no mechanical explanations',()=>{
 const mercury=occurrenceLanguage({kind:'station',at:new Date(BASE),first:'Mercury',retrograde:true},'ar');
 assert.match(mercury.title,/عطارد.*التراجع/);
 assert.match(mercury.description,/المواعيد|المراسلات/);
 assert.match(mercury.action,/موعد|رسالة/);
 assert.doesNotMatch(mercury.description,/جهة الحركة|ظاهرية|تبدّل فلكي محسوب|المواضع|الرياضيات|الزاوية|درج/);
 const venus=occurrenceLanguage({kind:'station',at:new Date(BASE),first:'Venus',retrograde:true},'ar');
 assert.match(venus.description,/العلاقات|المصاريف/);
 assert.notEqual(mercury.description,venus.description);
});

test('Planet sign entries and every sky event carry a distinct practical personal step',()=>{
 const at=new Date(BASE);
 const events=[
  {kind:'ingress',first:'Venus',sign:6,at},
  {kind:'aspect',first:'Moon',second:'Jupiter',angle:120,at},
  {kind:'aspect',first:'Mercury',second:'Venus',angle:60,at},
  {kind:'station',first:'Mars',retrograde:false,at}
 ] as const;
 const readings=events.map(e=>occurrenceLanguage(e,'ar'));
 assert.equal(readings.length,4);
 for(const row of readings){
  assert.ok(row.description.length>36);
  assert.ok(row.action.length>12);
  assert.doesNotMatch(row.description+' '+row.action,/تغيّرت جهة الحركة|الحركة الظاهرية|تبدّل فلكي محسوب|اتصال فلكي بين|الفكرة الرمزية|حركة كوكبية|المعادلة|رياضيات|°/);
 }
 assert.notEqual(readings[0].description,readings[1].description);
 assert.notEqual(readings[1].description,readings[2].description);
 assert.notEqual(readings[2].description,readings[3].description);
});

test('Today planet cards have station-based progress and independent live countdowns',()=>{
 const main=readFileSync('src/main.ts','utf8');
 const ui=main.slice(main.indexOf('function planetLiveStatus('),main.indexOf('function focusedToday()'));
 const clocks=main.slice(main.indexOf('function tickPlanetMotionGauges('),main.indexOf('function focusedToday()'));
 const css=readFileSync('src/focus.css','utf8');
 assert.match(ui,/remainingMotionPercent/);
 assert.match(ui,/motionTimeRemaining/);
 assert.match(ui,/data-motion-start/);
 assert.match(ui,/data-motion-end/);
 assert.match(ui,/if\(!isPermanent&&period/);
 assert.match(ui,/else if\(!isPermanent\)/);
 assert.doesNotMatch(ui,/mx-motion-permanent/);
 assert.match(ui,/progress max="100"/);
 assert.match(ui,/is-retrograde/);
 assert.match(clocks,/data-motion-percent/);
 assert.match(main,/tickPlanetMotionGauges\(liveTimePinned\?\+selected:now\)/);
 assert.match(css,/\.mx-sky-planet\.is-retrograde .mx-motion-meter progress/);
});
test('Live event cards show What to do in readable user-directed Arabic',()=>{
 const main=readFileSync('src/main.ts','utf8');
 const section=main.slice(main.indexOf('function wholeSkyEventItems('),main.indexOf('function planetLiveStatus('));
 assert.match(section,/story\.now/);
 assert.match(section,/story\.next/);
 assert.match(section,/story\.action/);
 assert.match(section,/mx-sky-feed-action/);
 assert.match(section,/شنو تسوي؟/);
 const css=readFileSync('src/focus.css','utf8');
 assert.match(css,/mx-sky-feed-action/);
});

test('English event readings remain available for direct guidance',()=>{
 const texts=[
  occurrenceLanguage({kind:'station',first:'Mercury',at:new Date(BASE),retrograde:true},'en'),
  occurrenceLanguage({kind:'ingress',first:'Venus',sign:6,at:new Date(BASE)},'en'),
  occurrenceLanguage({kind:'aspect',first:'Sun',second:'Saturn',angle:90,at:new Date(BASE)},'en')
 ];
 for(const x of texts){assert.ok(x.description.length>20&&x.action.length>10)}
});

test('Retrograde status is vivid orange; direct and station remain separately legible',()=>{
 const main=readFileSync('src/main.ts','utf8');
 const css=readFileSync('src/focus.css','utf8');
 const grid=main.slice(main.indexOf('function planetLiveStatus('),main.indexOf('function focusedToday(){'));
 assert.match(grid,/actualSpeed/);
 assert.match(grid,/isRetro/);
 assert.match(grid,/is-retrograde/);
 assert.match(grid,/is-direct/);
 assert.match(grid,/data-motion-mode/);
 assert.match(css,/\.mx-sky-planet small\.is-retrograde\{/);
 assert.match(css,/color:#ff870a/);
 assert.match(css,/font-weight:900/);
 assert.match(css,/\.mx-sky-planet small\.is-station\{/);
 assert.match(css,/\.mx-sky-planet small\.is-direct\{/);
});

test('retrograde sign crossings retain direction instead of generic direct ingress',()=>{
 const read=(at:Date)=>sample(at).map(p=>{
  if(p.id!=='Venus')return p;
  const h=(+at-BASE)/HOUR;
  return {...p,longitude:210.25-h*.05,speed:-1.2};
 });
 const events=scanWholeSky(new Date(BASE+3*HOUR),read,5,8);
 const ingress=events.find(e=>e.kind==='ingress'&&e.first==='Venus'&&e.sign===6);
 assert.ok(ingress,'Retrograde return from Scorpio into Libra must be recognized');
 assert.equal(ingress!.retrograde,true);
 assert.match(occurrenceLanguage(ingress!,'ar').title,/عادت متراجعة إلى الميزان/);
 assert.match(occurrenceLanguage(ingress!,'en').title,/returned retrograde to Libra/);
});
test('Moon-Sun conjunction is a New Moon while opposition is a Full Moon',()=>{
 const at=new Date(BASE);
 for(const [angle,arabic,english] of [[0,'محاق القمر','New Moon'],[180,'اكتمال القمر','Full Moon']] as const){
  const sky={kind:'aspect',at,first:'Sun',second:'Moon',angle} as const;
  assert.match(occurrenceLanguage(sky,'ar').title,new RegExp(arabic));
  assert.match(occurrenceLanguage(sky,'en').title,new RegExp(english));
 }
 const difficult=occurrenceLanguage({kind:'aspect',at,first:'Moon',second:'Mars',angle:90},'ar');
 assert.match(difficult.title,/تربيع/);
});

test('Compact planetary gauges omit redundant copy and keep percentages and countdowns on one row',()=>{
 const main=readFileSync('src/main.ts','utf8');
 const ui=main.slice(main.indexOf('function planetLiveStatus('),main.indexOf('/** Update the numerical display every second'));
 const css=readFileSync('src/focus.css','utf8');
 assert.doesNotMatch(ui,/مباشر دائماً|Always direct|المتبقي من الفترة|Phase remaining|يرجع مباشر خلال|Turns direct in|يبدأ التراجع خلال|Turns retrograde in/);
 assert.match(ui,/isPermanent\?'':'<small/);
 assert.match(ui,/mx-motion-meter-head"><b data-motion-percent/);
 assert.match(ui,/mx-motion-countdown"><time data-motion-countdown/);
 assert.match(css,/\.mx-motion-meter-head\{[\s\S]*?justify-content:center/);
 assert.match(css,/\.mx-motion-countdown time\{[\s\S]*?white-space:nowrap/);
 assert.match(main,/tickPlanetMotionGauges/);
});

