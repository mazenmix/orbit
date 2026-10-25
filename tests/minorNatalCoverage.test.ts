import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import SwissEph from 'swisseph-wasm';
import {chart,birthInstant,defaultProfile,report,setEngineForTests,targets} from '../src/engine.ts';
import {aspects,signals,scores} from '../src/math.ts';

const swe=new SwissEph();await swe.initSwissEph();setEngineForTests(swe as never);
const time=new Date('2026-10-25T10:00:00Z');

test('all six built-in minor bodies have actual natal coordinates and complete per-target transit contacts',()=>{
 const r=report(defaultProfile,time);
 const minor=['Chiron','Ceres','Pallas','Juno','Vesta','Pholus'];
 assert.equal(r.natal.points.length,10,'original ten-body natal wheel remains intact');
 assert.deepEqual(r.supplementalNatal.map(x=>x.id),minor);
 assert.deepEqual(r.supplementalMissing,{natal:[],transit:[]});
 for(const point of r.supplementalNatal){
  assert.ok(Number.isFinite(point.longitude)&&Number.isFinite(point.speed));
 }
 const natal=chart(birthInstant(defaultProfile),defaultProfile,true);
 const expected=aspects(r.current.points,natal.points.filter(p=>minor.includes(p.id)),time);
 assert.deepEqual(r.supplementalEvidence,expected);
 assert.equal(r.complete,true);
});

test('the existing eight derived indices remain based only on their original core geometry',()=>{
 const r=report(defaultProfile,time);
 const core=aspects(r.current.points,targets(r.natal),time);
 assert.deepEqual(r.evidence,core);
 assert.deepEqual(r.signals,signals(core));
 assert.deepEqual(r.scores,scores(signals(core),r.house));
});

test('unknown birth time omits house/ascendant claims and never duplicates core contacts',()=>{
 const p={...defaultProfile,known:false};
 const r=report(p,time);
 assert.deepEqual(r.natal.cusps,[]);
 assert.equal(r.natal.asc,null);
 assert.ok(r.supplementalEvidence.every(e=>!['Moon','Ascendant','MC'].includes(e.natal.id)));
 assert.ok(r.supplementalEvidence.every(e=>!r.evidence.some(x=>x.id===e.id)));
});

test('existing technical dossier exposes six natal positions and full secondary aspect evidence',()=>{
 const ui=readFileSync('src/main.ts','utf8');
 const body=ui.slice(ui.indexOf('function evidencePage(){'),ui.indexOf('function zoneChoices('));
 assert.match(body,/r\.supplementalNatal\.map/);
 assert.match(body,/r\.supplementalEvidence\.map/);
 assert.match(body,/r\.supplementalMissing\.natal/);
 assert.match(body,/r\.evidence\.map/);
});
