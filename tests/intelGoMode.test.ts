import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {derivedMetrics} from '../src/metrics.ts';
import type {Category} from '../src/math.ts';

const main=readFileSync('src/main.ts','utf8');
const css=readFileSync('src/focus.css','utf8');
const indicatorIds=['sexuality','love','emotional','career'] as const;
const inputs:Record<Category,number>={overview:56,career:74,love:83,communication:65,energy:38,emotions:47,recovery:55,timing:61};

test('all four restored gauges are drawn from real category indices, not fixed sample scores',()=>{
 const metrics=derivedMetrics(inputs);
 const values=new Map(metrics.map(m=>[m.id,m.value]));
 for(const id of indicatorIds){assert.ok(values.has(id),id);assert.ok(Number.isFinite(values.get(id)));}
 assert.equal(values.get('sexuality'),62); // love 83, energy 38, communication 65
 assert.equal(values.get('love'),83);
 assert.equal(values.get('emotional'),47);
 assert.equal(values.get('career'),74);
 const changed=derivedMetrics({...inputs,love:19});
 assert.notEqual(changed.find(x=>x.id==='sexuality')?.value,values.get('sexuality'));
 assert.notEqual(changed.find(x=>x.id==='love')?.value,values.get('love'));
});

test('Go Mode is a new, accessible and working tab of MX Intelligence',()=>{
 const start=main.indexOf('function intelPage(){');
 const end=main.indexOf('function asteroidsPage(){',start);
 const view=main.slice(start,end);
 assert.ok(start>0&&end>start);
 assert.match(view,/role="tablist"/);
 assert.match(view,/data-intel-tab="go"/);
 assert.match(view,/data-intel-tab="indicators"/);
 assert.match(view,/role="tabpanel"/);
 assert.match(view,/todayQuickGauges\(r,true\)/);
 assert.match(view,/intelTab==='go'\?goMarkup:indicatorsMarkup/);
 assert.match(view,/goModes\(indicators\)/);
 assert.match(main,/\[data-intel-tab\]/);
 assert.match(main,/intelTab=next/);
 assert.match(main,/body.innerHTML=content\(\);bind\(\)/);
 for(const id of indicatorIds)assert.ok(main.includes("id:'"+id+"'"),id);
 assert.match(css,/\.mx-intel-tabs/);
 assert.match(css,/@media\(max-width:440px\)/);
});

test('Today keeps existing four gauges while Go Mode also houses them and leaves original matrix intact',()=>{
 const focused=main.slice(main.indexOf('function focusedToday()'),main.indexOf('function focusedCalendar()'));
 const classic=main.slice(main.indexOf('function today(){'),main.indexOf('function trend(',main.indexOf('function today(){')));
 const intel=main.slice(main.indexOf('function intelPage(){'),main.indexOf('function asteroidsPage(){'));
 assert.match(focused,/todayQuickGauges\(r\)/);
 assert.match(classic,/todayQuickGauges\(r\)/);
 assert.match(intel,/29-indicator matrix/);
 assert.match(intel,/go-grid/);
 assert.match(intel,/mxGoNarrative/);
 assert.match(intel,/todayQuickGauges\(r,true\)/);
});
