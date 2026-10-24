import test from 'node:test';
import assert from 'node:assert/strict';
import {shiftGoTime} from '../src/goTimeNavigation.ts';
import {readFileSync} from 'node:fs';
const source=readFileSync('src/main.ts','utf8');

test('Go Mode time travel preserves Baghdad minutes and supports both directions',()=>{
 const instant=new Date('2026-10-24T15:35:00.000Z');
 const hour=shiftGoTime(instant,'Asia/Baghdad','-hour');
 const day=shiftGoTime(instant,'Asia/Baghdad','-day');
 assert.equal(hour.toISOString(),'2026-10-24T14:35:00.000Z');
 assert.equal(day.toISOString(),'2026-10-23T15:35:00.000Z');
 assert.equal(shiftGoTime(hour,'Asia/Baghdad','+hour').toISOString(),instant.toISOString());
 assert.equal(shiftGoTime(day,'Asia/Baghdad','+day').toISOString(),instant.toISOString());
});

test('Moving one calendar day keeps wall time through Denver daylight-saving transition',()=>{
 const afterDST=new Date('2026-11-01T12:00:00.000Z'); // 05:00 MST after fall-back
 const previous=shiftGoTime(afterDST,'America/Denver','-day'); // 05:00 MDT
 assert.equal(previous.toISOString(),'2026-10-31T11:00:00.000Z');
 assert.equal(shiftGoTime(previous,'America/Denver','+day').toISOString(),afterDST.toISOString());
});

test('Go Mode renders timestamp picker and all quick jumps before its gauges',()=>{
 const go=source.slice(source.indexOf('function goModePage(){'),source.indexOf('function travelSymbol(',source.indexOf('function goModePage(){')));
 const nav=source.slice(source.indexOf('function sharedModeTimeNavigation(){'),source.indexOf('function goModePage(){'));
 assert.match(nav,/id="go-time-form"/);
 assert.match(nav,/id="go-time-input"/);
 assert.match(nav,/type="datetime-local"/);
 assert.match(nav,/localValue\(selected,active\.zone\)/);
 assert.match(nav,/data-go-time-shift="-day"/);
 assert.match(nav,/data-go-time-shift="-hour"/);
 assert.match(nav,/data-go-time-shift="\+day"/);
 assert.match(nav,/data-go-time-shift="\+hour"/);
 assert.match(nav,/data-now/);
 assert.match(go,/const timeNav=sharedModeTimeNavigation\(\)/);
 assert.match(go,/timeNav\+gauges\+goCards\+renderGoLifeGauges\(r\.scores\)\+allIndicators/);
});

test('Go Mode time picker recalculates every indicator using selected timezone and pinned moment',()=>{
 const binding=source.slice(source.indexOf('function bind(){'),source.indexOf('function on(',source.indexOf('function bind(){')));
 assert.match(binding,/\[data-go-time-shift\]/);
 assert.match(binding,/shiftGoTime\(selected,active\.zone/);
 assert.match(binding,/go-time-form/);
 assert.match(binding,/zonedInstant\(String\(new FormData\(goTimeForm\)\.get\('moment'\)\),active\.zone\)/);
 assert.match(binding,/updateTime\(.*true\)/);
 assert.match(source,/const indicators=derivedMetrics\(data!\.scores\)/);
 assert.match(source,/function updateTime\(at:Date,pin=true\)/);
 assert.match(source,/if\(liveTimePinned\)return;/);
});

test('Go time navigation uses IANA zones, not browser zone',()=>{
 assert.throws(()=>shiftGoTime(new Date(NaN),'Asia/Baghdad','-day'));
 assert.notEqual(shiftGoTime(new Date('2026-10-24T12:00:00Z'),'Asia/Baghdad','+hour').valueOf(),new Date('2026-10-24T12:00:00Z').valueOf());
});

test('Travel Mode has identical time selector above its 12 recalculated gauges',()=>{
 const go=source.slice(source.indexOf('function goModePage(){'),source.indexOf('function travelSymbol(',source.indexOf('function goModePage(){')));
 const travel=source.slice(source.indexOf('function travelModePage(){'),source.indexOf('function asteroidsPage(){'));
 const nav=source.slice(source.indexOf('function sharedModeTimeNavigation(){'),source.indexOf('function goModePage(){'));
 assert.match(go,/const timeNav=sharedModeTimeNavigation\(\)/);
 assert.match(travel,/sharedModeTimeNavigation\(\)\+sections/);
 assert.match(nav,/id="go-time-form"/);
 assert.match(nav,/data-now/);
 assert.match(nav,/data-go-time-shift="-day"/);
 assert.match(nav,/data-go-time-shift="-hour"/);
 assert.match(nav,/data-go-time-shift="\+hour"/);
 assert.match(nav,/data-go-time-shift="\+day"/);
 assert.match(travel,/derivedMetrics\(data!\.scores\)/);
 assert.match(travel,/quickGaugeCard\(metric,travelSymbol\(id\),undefined,id\)/);
 const src=readFileSync('src/focus.css','utf8');
 assert.match(src,/#live-view-body \.mx-go-time-nav\{/);
});
