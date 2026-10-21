import test from 'node:test';
import assert from 'node:assert/strict';
import {eclipseCountdownParts} from '../src/eclipseCountdown.ts';

test('countdown uses real calendar months, then days and elapsed hours/minutes',()=>{
 const now=Date.parse('2026-10-21T10:00:00.000Z');
 const target=Date.parse('2027-02-06T12:30:00.000Z');
 assert.deepEqual(eclipseCountdownParts(now,target),{months:3,days:16,hours:2,minutes:30,seconds:0});
});
test('calendar months clamp long month ends without day overflow',()=>{
 const now=Date.parse('2026-01-31T00:00:00.000Z');
 const target=Date.parse('2026-02-28T00:00:00.000Z');
 assert.deepEqual(eclipseCountdownParts(now,target),{months:1,days:0,hours:0,minutes:0,seconds:0});
});
test('crosses leap year, and never shows negative countdown',()=>{
 const now=Date.parse('2024-02-28T23:00:00.000Z');
 const target=Date.parse('2024-03-01T00:05:00.000Z');
 assert.deepEqual(eclipseCountdownParts(now,target),{months:0,days:1,hours:1,minutes:5,seconds:0});
 assert.deepEqual(eclipseCountdownParts(target,target),{months:0,days:0,hours:0,minutes:0,seconds:0});
 assert.deepEqual(eclipseCountdownParts(target,target-1000),{months:0,days:0,hours:0,minutes:0,seconds:0});
});
test('rejects invalid timestamps',()=>{
 assert.throws(()=>eclipseCountdownParts(NaN,Date.now()),/Invalid/);
});

test('seconds count down every second without disturbing months days hours or minutes',()=>{
 const now=Date.parse('2026-10-21T10:00:00.000Z');
 const target=now+2*60000+38500;
 assert.deepEqual(eclipseCountdownParts(now,target),{months:0,days:0,hours:0,minutes:2,seconds:38});
 assert.deepEqual(eclipseCountdownParts(now+1000,target),{months:0,days:0,hours:0,minutes:2,seconds:37});
 assert.deepEqual(eclipseCountdownParts(target-1000,target),{months:0,days:0,hours:0,minutes:0,seconds:1});
 assert.deepEqual(eclipseCountdownParts(target,target),{months:0,days:0,hours:0,minutes:0,seconds:0});
});
