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
