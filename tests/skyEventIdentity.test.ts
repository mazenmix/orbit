import test from 'node:test';
import assert from 'node:assert/strict';
import {isLunarOccurrence,sameSkyOccurrence} from '../src/skyEventIdentity.ts';
import type {WholeSkyOccurrence} from '../src/wholeSkyBroadcast.ts';
const now=new Date('2026-11-03T08:27:45.000Z');
const a:WholeSkyOccurrence={kind:'aspect',at:now,first:'Moon',second:'Venus',angle:60};
test('hero and timeline use verified event identity rather than translated wording',()=>{
 assert.equal(sameSkyOccurrence(a,{...a,at:new Date(+now+1000)}),true);
 assert.equal(sameSkyOccurrence(a,{...a,at:new Date(+now+65000)}),false);
 assert.equal(sameSkyOccurrence(a,{...a,angle:90}),false);
 assert.equal(sameSkyOccurrence(a,{...a,second:'Jupiter'}),false);
 assert.equal(sameSkyOccurrence(a,{kind:'ingress',at:now,first:'Moon',sign:5}),false);
 assert.equal(sameSkyOccurrence(a,undefined),false);
});
test('ingress and station identities distinguish direction, sign and recurring passes',()=>{
 const ingress:WholeSkyOccurrence={kind:'ingress',at:now,first:'Mercury',sign:7,retrograde:true};
 assert.equal(sameSkyOccurrence(ingress,{...ingress}),true);
 assert.equal(sameSkyOccurrence(ingress,{...ingress,sign:6}),false);
 assert.equal(sameSkyOccurrence(ingress,{...ingress,retrograde:false}),false);
 const station:WholeSkyOccurrence={kind:'station',at:now,first:'Venus',retrograde:true};
 assert.equal(sameSkyOccurrence(station,{...station}),true);
 assert.equal(sameSkyOccurrence(station,{...station,retrograde:false}),false);
});
test('Moon aspect and Moon ingress count as lunar regardless of headline',()=>{
 assert.equal(isLunarOccurrence(a),true);
 assert.equal(isLunarOccurrence({...a,first:'Venus',second:'Moon'}),true);
 assert.equal(isLunarOccurrence({first:'Moon'}),true);
 assert.equal(isLunarOccurrence({first:'Mercury',second:'Venus'}),false);
});
