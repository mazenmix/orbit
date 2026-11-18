import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {degreesInSign,type Evidence} from '../src/math.ts';
import {colorizeAstroDay} from '../src/astroCalendar.ts';
import {displayProgressPercent,elapsedPercent} from '../src/liveVoc.ts';

test('degree labels stay inside the actual sign at every ingress',()=>{
 for(const digits of [1,2,3,4]){
  for(let ingress=0;ingress<=360;ingress+=30){
   assert.equal(degreesInSign(ingress,digits),Number(0).toFixed(digits));
   assert.equal(degreesInSign(ingress-0.000001,digits),(30-10**(-digits)).toFixed(digits));
  }
 }
 assert.equal(degreesInSign(68.427,2),'8.43');
});

test('zero-weight contacts cannot produce a supported calendar rating',()=>{
 const body={id:'Sun',symbol:'☉',longitude:0,speed:1};
 const contact:Evidence={id:'edge',transit:body,natal:body,angle:60,orb:3,
  maximumOrb:3,applying:false,weight:0,exact:null};
 assert.equal(colorizeAstroDay([contact]).considered,0);
});

test('countdown percentages wait for the actual boundary',()=>{
 assert.equal(displayProgressPercent(elapsedPercent(0,10000,9999)),99);
 assert.equal(displayProgressPercent(elapsedPercent(0,10000,10000)),100);
});

test('expanded sky uses the chart instant and missing asteroid data has a terminal state',()=>{
 const source=readFileSync('src/main.ts','utf8');
 const expand=source.slice(source.indexOf('const expandSky='),source.indexOf("on('expand-sky-wheel'"));
 assert.ok(expand.includes('data.current.date.toISOString()')&&expand.includes('dateText(data.current.date'));
 assert.ok(source.includes("'Position unavailable'"));
});
