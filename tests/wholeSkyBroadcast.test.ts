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
 assert.match(briefing.movement,/يقترب/);
 assert.equal(briefing.next?.first,'Mercury');
 assert.equal(briefing.planets.length,10);
 assert.doesNotMatch(briefing.title+' '+briefing.meaning+' '+briefing.action,/°|[0-9]\.[0-9]|تربيع|تسديس|تثليث/);
});
test('Sky text is stable until real phase/event/planet change; no random clock cycling',()=>{
 const at=new Date(BASE+3*HOUR);
 const events:WholeSkyOccurrence[]=[{kind:'aspect',at:new Date(+at+HOUR),first:'Mercury',second:'Venus',angle:60}];
 const one=wholeSkyBroadcast(sample(at),events,at,'ar');
 assert.deepEqual(wholeSkyBroadcast(sample(at),events,at,'ar'),one);
 const after=wholeSkyBroadcast(sample(new Date(+at+2*HOUR)),events,new Date(+at+2*HOUR),'ar');
 assert.notEqual(one.title,after.title);
 const language=occurrenceLanguage(events[0],'ar');
 assert.doesNotMatch(language.title+' '+language.description,/°|[0-9]\.[0-9]|تسديس/);
});
test('Today UI uses whole-sky stream in simple and Pro, not lunar-only selection',()=>{
 const main=readFileSync('src/main.ts','utf8');
 const focus=main.slice(main.indexOf('function focusedToday(){'),main.indexOf('/** A stable daily scan'));
 const pro=main.slice(main.indexOf('function today(){'),main.indexOf('function trend('));
 for(const key of ['currentWholeSky()','planetLiveStatus(brief)','wholeSkyEventItems(brief.upcoming','wholeSkyEventItems(brief.latest'])assert.ok(focus.includes(key),key);
 assert.match(pro,/sky=currentWholeSky\(\)/);
 assert.match(focus,/الأحداث الفلكية القادمة · كل الكواكب/);
 assert.match(main,/scanWholeSky\(selected,at=>chart\(at,active,false,false\)\.points\)/);
 assert.match(main,/const LIVE_CONTENT_INTERVAL_MS:Record<string,number>=\{today:10000/);
 assert.doesNotMatch(focus,/momentNarrative\(|todaySkyBrief\(|orb.toFixed/);
});
