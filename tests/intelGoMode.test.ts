import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {derivedMetrics} from '../src/metrics.ts';
import type {Category} from '../src/math.ts';

const main=readFileSync('src/main.ts','utf8');
const css=readFileSync('src/focus.css','utf8');
const indicatorIds=['sexuality','love','emotional','career'] as const;
const inputs:Record<Category,number>={overview:56,career:74,love:83,communication:65,energy:38,emotions:47,recovery:55,timing:61};

test('calculated quick gauges track chart score changes rather than hard-coded numbers',()=>{
 const original=derivedMetrics(inputs);
 const values=new Map(original.map(m=>[m.id,m.value]));
 for(const id of indicatorIds){assert.ok(values.has(id),id);assert.ok(Number.isFinite(values.get(id)));}
 assert.equal(values.get('sexuality'),62);
 assert.equal(values.get('love'),83);
 assert.equal(values.get('emotional'),47);
 assert.equal(values.get('career'),74);
 const modified=derivedMetrics({...inputs,love:19});
 assert.notEqual(modified.find(x=>x.id==='sexuality')?.value,values.get('sexuality'));
 assert.notEqual(modified.find(x=>x.id==='love')?.value,values.get('love'));
});

test('Go Mode is a standalone top-level destination immediately after People',()=>{
 assert.match(main,/const primaryRoutes=\['today','chart','people','go','travelmode','calendar','more'\]/);
 assert.match(main,/go:\(\)=>t\('Go Mode','Go Mode'\)/);
 assert.match(main,/case 'intel':case 'go':inner=goModePage\(\)/);
 assert.match(main,/if\(route==='intel'\)return 'go'/);
 assert.match(main,/nav\(primaryRoutes\)/);
 assert.match(main,/nav\(primaryRoutes,true\)/);
 const group=main.slice(main.indexOf('function morePage(){'),main.indexOf('function scoresHTML('));
 assert.ok(!group.includes("card('intel'"),'Go Mode should not live under More');
 assert.ok(!main.includes("data-intel-tab"),'No internal indicators/Go tabs should remain');
});

test('Go Mode contains all 29 metrics, all four daily gauges and all four decision cards on one screen',()=>{
 const start=main.indexOf('function goModePage(){');
 const end=main.indexOf('function asteroidsPage(){',start);
 const view=main.slice(start,end);
 assert.ok(start>0&&end>start);
 assert.match(view,/data-section="go"/);
 assert.match(view,/todayQuickGauges\(r,true\)/);
 assert.match(view,/derivedMetrics\(sky\.scores\)/);
 assert.match(view,/goModes\(indicators\)/);
 assert.match(view,/mx-go-mode-decisions/);
 assert.match(view,/mx-go-mode-indicators/);
 assert.match(view,/go-grid/);
 assert.match(view,/metrics-grid/);
 assert.match(view,/indicators\.map\(m=>/);
 assert.match(view,/go\.map\(d=>/);
 assert.match(view,/mxGoNarrative/);
 assert.match(view,/goCards\+renderGoLifeGauges\(sky\.scores,categories\)\+allIndicators/);
 for(const id of indicatorIds)assert.ok(main.includes("id:'"+id+"'"),id);
 const metrics=derivedMetrics(inputs);
 assert.equal(metrics.length,29,'All 29 computed indices are available');
});

test('Today replaces its top gauges with a professional current-sky wheel in both UI modes',()=>{
 const focused=main.slice(main.indexOf('function focusedToday()'),main.indexOf('function focusedCalendar()'));
 const classic=main.slice(main.indexOf('function today(){'),main.indexOf('function trend(',main.indexOf('function today(){')));
 const sky=main.slice(main.indexOf('function todaySkyWheel('),main.indexOf('function focusedToday()'));
 const live=main.slice(main.indexOf('function updateLiveSkyWheel('),main.indexOf('function refreshLiveBody('));
 assert.match(focused,/todaySkyWheel\(r\)/);
 assert.match(classic,/todaySkyWheel\(r\)/);
 assert.ok(classic.indexOf('right-column') < classic.indexOf('todaySkyWheel(r)'), 'Today wheel is placed inside the left-side rail, not in a separate top row');
 assert.match(css,/#live-view-body \.mx-today-compact\{/);
 assert.doesNotMatch(focused,/todayQuickGauges\(r\)/);
 assert.doesNotMatch(classic,/todayQuickGauges\(r\)/);
 assert.match(sky,/chart-layout chart-expanded mx-today-sky-layout/);
 assert.match(sky,/wheel\(r\.current\)/);
 assert.match(sky,/id="expand-sky-wheel"/);
 assert.match(live,/if\(todayWheel\)reconcileLiveHTML\(todayWheel,html\)/);
 assert.match(live,/if\(enlarged\)reconcileLiveHTML\(enlarged,html\)/);
 assert.match(css,/\.mx-today-sky-layout/);
 assert.ok(!classic.includes('sky-card'),'Avoid duplicate sky wheels on Today');
});


test('Go Mode recommendations stay compact and use actual chart evidence',()=>{
 const start=main.indexOf('function mxGoNarrative(');
 const end=main.indexOf('/** Compact Go Mode indicator gauge',start);
 const narrative=main.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.doesNotMatch(narrative,/signalStory\(/,'Do not duplicate the long transit story inside every Go card');
 assert.doesNotMatch(narrative,/story\.good|story\.action/,'Never concatenate verbose story paragraphs');
 assert.match(narrative,/memo\.strongest\.transit\.id/,'Cue must come from strongest computed transit');
 assert.match(narrative,/memo\.complete/,'Missing evidence must be disclosed');
 assert.match(narrative,/memo\.sensitive/,'Sensitive scores must be qualified');
 assert.match(narrative,/memo\.mixed/,'Conflicting evidence must be qualified');
 for(const domain of ['work','social','relationships','travel'])assert.ok(narrative.includes(domain+':{'),domain);
});
