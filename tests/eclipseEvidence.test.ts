import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {eclipseEvidenceAt} from '../src/eclipseEvidence.ts';
import type {ConfirmedEclipse} from '../src/realEclipses.ts';

const eclipse=(iso:string,kind:ConfirmedEclipse['kind'],type:ConfirmedEclipse['type']='total'):ConfirmedEclipse=>({
 kind,type,maximum:new Date(iso),contacts:{first:null,second:null,third:null,fourth:null},
 retFlag:4,globalCoordinates:null,local:null
});
test('AI eclipse evidence depends only on explicitly selected time, never current clock',()=>{
 const events=[
  eclipse('2026-11-01T00:00:00Z','solar'),
  eclipse('2027-04-01T00:00:00Z','lunar'),
  eclipse('2027-04-10T00:00:00Z','solar'),
 ];
 assert.deepEqual(eclipseEvidenceAt(new Date('2026-10-25T00:00:00Z'),events).map(x=>x.maximum),['2026-11-01T00:00:00.000Z']);
 assert.deepEqual(eclipseEvidenceAt(new Date('2027-03-01T00:00:00Z'),events).map(x=>x.maximum),['2027-04-01T00:00:00.000Z','2027-04-10T00:00:00.000Z']);
});
test('unknown eclipse types and maxima outside Time Machine window are excluded',()=>{
 const events=[eclipse('2027-05-01T00:00:00Z','solar','unknown'),eclipse('2027-05-02T00:00:00Z','lunar')];
 assert.equal(eclipseEvidenceAt(new Date('2027-05-03T00:00:00Z'),events).length,0);
 assert.throws(()=>eclipseEvidenceAt(new Date('invalid'),events));
});
test('selected-time AI and local eclipse queries do not read the live-now widget',()=>{
 const source=readFileSync('src/main.ts','utf8');
 const packet=source.slice(source.indexOf('function aiPayload()'),source.indexOf('function changeSummary()'));
 assert.match(packet,/eclipseEvidenceAt\(selected,confirmedEclipses\(new Date\(\+selected-2\*86400000\),2\)\)/);
 assert.doesNotMatch(packet,/getRealEclipses\(\)/);
 assert.match(source,/const events=confirmedEclipses\(selected,1,\{lat:active\.lat,lon:active\.lon\},true\)/);
});

test('eclipse page follows pinned Time Machine interval without running live timers',()=>{
 const ui=readFileSync('src/main.ts','utf8');
 const cache=ui.slice(ui.indexOf('function getRealEclipses(){'),ui.indexOf('function getLunations(){'));
 assert.match(cache,/reference=\+selected/);
 assert.match(cache,/context=Math\.floor\(reference\/300000\)/);
 assert.match(cache,/confirmedEclipses\(new Date\(reference-2\*86400000\),2\)/);
 const page=ui.slice(ui.indexOf('function eclipsesPage(){'),ui.indexOf('function lunarPhaseScreen(){'));
 assert.match(page,/eclipseCountdownParts\(liveTimePinned\?\+selected:Date\.now\(\),\+e\.maximum\)/);
 const tick=ui.slice(ui.indexOf('function tickEclipseCountdowns('),ui.indexOf('function tickLiveClocks('));
 assert.match(tick,/if\(screen!=='eclipses'\|\|liveTimePinned\)return/);
});
