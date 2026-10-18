import test from 'node:test';import assert from 'node:assert/strict';
import {dueEyeEvents,defaultEyeSettings} from '../src/eye.ts';
const now=new Date('2026-10-18T08:00:00Z');
const clock={date:'2026-10-18',hour:11,minute:0};
const moon={vocStartsAt:new Date(+now+10*60000),ingressAt:new Date(+now+35*60000)};
test('MX Eye is disabled by default and cannot spam unsolicited notifications',()=>{
 assert.equal(defaultEyeSettings.enabled,false);
 assert.deepEqual(dueEyeEvents(now,clock,moon as any,defaultEyeSettings),[]);
});
test('lunar warning only appears inside the explicit fifteen-minute foreground window',()=>{
 const s={enabled:true,moon:true,hourly:false,daily:false};
 assert.deepEqual(dueEyeEvents(now,clock,moon as any,s).map(x=>x.id.split(':')[0]),['voc']);
 assert.deepEqual(dueEyeEvents(new Date(+now+20*60000),{...clock,minute:20},moon as any,s).map(x=>x.id.split(':')[0]),['ingress']);
});
test('hourly and daily checks have stable keys for one-shot de-duplication',()=>{
 const s={enabled:true,moon:false,hourly:true,daily:true};
 const r=dueEyeEvents(now,{...clock,hour:8},null,s);
 assert.deepEqual(r.map(x=>x.id),['hour:2026-10-18:8','day:2026-10-18']);
 assert.equal(dueEyeEvents(now,{...clock,hour:8,minute:20},null,s).length,0);
});
