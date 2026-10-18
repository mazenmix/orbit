import test from 'node:test';import assert from 'node:assert/strict';
import {dueBackgroundPush} from '../src/pushSchedule.ts';
const base={zone:'Asia/Manila',moon:true,hourly:true,daily:true,events:[] as any[]};
test('hourly and daily dispatch follows selected IANA local zone, not UTC clock',()=>{
 const result=dueBackgroundPush(base,new Date('2026-10-18T00:00:00Z'));
 assert.ok(result.some(x=>x.id.includes('hour')));
 assert.ok(result.some(x=>x.id.includes('day')));
 assert.equal(dueBackgroundPush(base,new Date('2026-10-18T00:15:00Z')).length,0);
});
test('Moon VOC push window is no earlier than 16 minutes before actual scheduled event',()=>{
 const a=new Date('2026-10-18T00:00:00Z'),data={...base,hourly:false,daily:false,events:[{kind:'voc',at:'2026-10-18T00:15:00.000Z'}]};
 assert.equal(dueBackgroundPush(data,a).length,1);
 assert.equal(dueBackgroundPush(data,new Date('2026-10-17T23:30:00Z')).length,0);
 assert.equal(dueBackgroundPush(data,new Date('2026-10-18T00:16:00Z')).length,0);
});
