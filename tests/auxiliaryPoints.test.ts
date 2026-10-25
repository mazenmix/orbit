import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import SwissEph from 'swisseph-wasm';
import {auxiliaryNodes,natalDerivedAngles,auxiliaryName} from '../src/auxiliaryPoints.ts';
import {setEngineForTests,report,defaultProfile,chart,type Chart} from '../src/engine.ts';
import {normalize} from '../src/math.ts';

test('mean and true lunar nodes are distinct, their southern counterparts exactly opposite',()=>{
 const data=auxiliaryNodes(id=>new Float64Array(id===10?[51,0,0,-.05]:[53,0,0,.03]));
 assert.deepEqual(data.missing,[]);
 assert.deepEqual(data.points.map(p=>p.id),['MeanNorthNode','MeanSouthNode','TrueNorthNode','TrueSouthNode']);
 for(let i=0;i<4;i+=2){
  assert.equal(data.points[i+1].longitude,normalize(data.points[i].longitude+180));
  assert.equal(data.points[i+1].speed,data.points[i].speed);
  assert.equal(data.points[i+1].source,'opposite-derived');
 }
 assert.notEqual(data.points[0].longitude,data.points[2].longitude);
 assert.notEqual(auxiliaryName('MeanNorthNode',true),auxiliaryName('TrueNorthNode',true));
});

test('node ephemeris gaps do not fabricate or substitute the other definition',()=>{
 const data=auxiliaryNodes(id=>id===10?new Float64Array([20,0,0,-.03]):null);
 assert.deepEqual(data.points.map(p=>p.id),['MeanNorthNode','MeanSouthNode']);
 assert.deepEqual(data.missing,['TrueNorthNode','TrueSouthNode']);
 const invalid=auxiliaryNodes(()=>new Float64Array([NaN,0,0,1]));
 assert.equal(invalid.points.length,0);
 assert.equal(invalid.missing.length,4);
});

test('derived angles only exist with reliable time, cusps and Swiss Vertex',()=>{
 const base:Chart={date:new Date('1985-03-29Z'),points:[],cusps:Array.from({length:12},(_,i)=>i*30),asc:350,mc:265,vertex:67,missing:[]};
 const derived=natalDerivedAngles(base,true);
 assert.deepEqual(derived.points.map(p=>p.id),['Descendant','IC','Vertex']);
 assert.deepEqual(derived.points.map(p=>p.longitude),[170,85,67]);
 assert.equal(natalDerivedAngles(base,false).points.length,0);
 const polar=natalDerivedAngles({...base,asc:null,mc:null,vertex:null},true);
 assert.equal(polar.points.length,0);
 assert.deepEqual(polar.missing,['Descendant','IC','Vertex']);
});

const swe=new SwissEph();await swe.initSwissEph();setEngineForTests(swe as never);
test('actual Swiss mean/true nodes are calculated for natal and selected sky',()=>{
 const at=new Date('2026-10-25T10:00:00Z');
 const r=report(defaultProfile,at);
 const nat=chart(r.natal.date,defaultProfile,true);
 const mean=swe.calc_ut(at.valueOf()/86400000+2440587.5,10,2|256);
 const real=swe.calc_ut(at.valueOf()/86400000+2440587.5,11,2|256);
 assert.ok(mean&&real);
 assert.ok(r.auxiliaryCurrent.some(x=>x.id==='MeanNorthNode'&&Math.abs(x.longitude-normalize(mean[0]))<1e-7));
 assert.ok(r.auxiliaryCurrent.some(x=>x.id==='TrueNorthNode'&&Math.abs(x.longitude-normalize(real[0]))<1e-7));
 assert.ok(r.auxiliaryNatal.some(x=>x.id==='Descendant'&&Math.abs(x.longitude-normalize(nat.asc!+180))<1e-7));
 assert.ok(r.auxiliaryNatal.some(x=>x.id==='IC'&&Math.abs(x.longitude-normalize(nat.mc!+180))<1e-7));
 assert.ok(r.auxiliaryEvidence.every(x=>r.auxiliaryNatal.some(p=>p.id===x.natal.id)));
});

test('existing evidence view does not hide newly calculated node and angle data',()=>{
 const source=readFileSync('src/main.ts','utf8');
 const pane=source.slice(source.indexOf('function evidencePage(){'),source.indexOf('function zoneChoices('));
 for(const part of ['r.auxiliaryNatal.map','r.auxiliaryCurrent.map','r.auxiliaryEvidence.map','r.auxiliaryMissing.natal'])assert.ok(pane.includes(part),part);
});
