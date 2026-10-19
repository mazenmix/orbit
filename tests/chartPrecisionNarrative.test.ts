import test from 'node:test';import assert from 'node:assert/strict';
import {precisionChartStories,precisionChartSignature} from '../src/chartPrecisionNarrative.ts';
const asChart=(a:number,b:number)=>({date:new Date('2026-10-18T10:00Z'),asc:null,mc:null,cusps:[],missing:[],points:[{id:'Sun',symbol:'☉',longitude:a,speed:1},{id:'Venus',symbol:'♀',longitude:b,speed:1}]});
test('different birth charts produce different exact-degree and aspect narratives',()=>{
 const a=asChart(10,13),b=asChart(10,80);
 const first=precisionChartStories(a),second=precisionChartStories(b);
 assert.equal(first.length,2);
 assert.notEqual(first[0].ar,second[0].ar);
 assert.notEqual(precisionChartSignature(a),precisionChartSignature(b));
 assert.match(first[0].ar,/3.00°/);
});
test('unknown birth time does not invent houses',()=>{
 const natal=asChart(20,35);
 const result=precisionChartStories(natal,undefined,[],false);
 assert.ok(result.every(x=>x.house===null&&!x.ar.includes('بالبيت')));
});
test('chart dossiers do not add unsupported contacts',()=>{
 const res=precisionChartStories(asChart(0,45));
 assert.match(res[0].ar,/ماكو اتصال ولادي/);
});
test('unknown birth time excludes Moon both as a dossier and as another planet’s closest contact',()=>{
 const natal=asChart(0,45);
 natal.points.push({id:'Moon',symbol:'☾',longitude:.1,speed:13});
 const known=precisionChartStories(natal);
 assert.equal(known.find(p=>p.id==='Sun')?.aspect,'Moon');
 const unknown=precisionChartStories(natal,undefined,[],false);
 assert.deepEqual(unknown.map(p=>p.id),['Sun','Venus']);
 assert.ok(unknown.every(p=>p.aspect!=='Moon'&&!p.ar.includes('القمر')));
 assert.equal(unknown.find(p=>p.id==='Sun')?.aspect,null);
});
test('nonfinite speed and invalid longitude cannot supply narrated placements or contacts',()=>{
 const natal=asChart(0,45);
 natal.points.push({id:'Moon',symbol:'☾',longitude:.1,speed:NaN},{id:'Mars',symbol:'♂',longitude:Infinity,speed:1});
 const result=precisionChartStories(natal);
 assert.deepEqual(result.map(p=>p.id),['Sun','Venus']);
 assert.ok(result.every(p=>p.aspect===null));
});
