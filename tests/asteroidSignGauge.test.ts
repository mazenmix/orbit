import test from 'node:test';
import assert from 'node:assert/strict';
import {remainingAsteroidSignGauge as gauge} from '../src/asteroidSignGauge.ts';

test('direct motion shows angular portion remaining before 30° sign boundary',()=>{
 assert.deepEqual(gauge(23.4,.15),{percent:22,tone:'green'});
 assert.deepEqual(gauge(12,.15),{percent:60,tone:'green'});
 assert.deepEqual(gauge(11.7,.15),{percent:61,tone:'orange'});
 assert.deepEqual(gauge(3,.15),{percent:90,tone:'orange'});
 assert.deepEqual(gauge(2.7,.15),{percent:91,tone:'red'});
 assert.deepEqual(gauge(0,.15),{percent:100,tone:'red'});
});
test('retrograde movement correctly uses the 0° boundary instead of 30°',()=>{
 assert.deepEqual(gauge(23.4,-.15),{percent:78,tone:'orange'});
 assert.deepEqual(gauge(12,-.15),{percent:40,tone:'green'});
 assert.deepEqual(gauge(0,-.15),{percent:0,tone:'green'});
});
test('longitude normalization works across the full zodiac and rejects missing data',()=>{
 assert.deepEqual(gauge(383.4,.15),gauge(23.4,.15));
 assert.deepEqual(gauge(-6.6,.15),gauge(23.4,.15));
 assert.equal(gauge(NaN,.15),null);
 assert.equal(gauge(10,NaN),null);
});
