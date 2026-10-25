import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {motionTimeRemaining,remainingMotionPercent,scanMotionCycles,STATION_BODIES} from '../src/planetMotion.ts';
const DAY=86400000,START=Date.parse('2026-01-01T00:00:00Z');
test('Eight real retrograde-capable bodies; Sun and Moon cannot be assigned retrograde periods',()=>{
 assert.equal(STATION_BODIES.length,8);
 assert.equal(STATION_BODIES.includes('Sun' as never),false);
 assert.equal(STATION_BODIES.includes('Moon' as never),false);
});
test('Planetary phase percentages are true remaining duration, not transit odds',()=>{
 const start=START,end=START+100*DAY;
 assert.equal(remainingMotionPercent(start,end,start),100);
 assert.equal(remainingMotionPercent(start,end,start+25*DAY),75);
 assert.equal(remainingMotionPercent(start,end,start+50*DAY),50);
 assert.equal(remainingMotionPercent(start,end,end),0);
 assert.equal(remainingMotionPercent(start,end,end+DAY),0);
 assert.equal(remainingMotionPercent(start,start,start),null);
});
test('Previous and next station roots derive from speed zero-crossings, not fixed date guesses',async()=>{
 const at=new Date(START+10*DAY);
 const read=(d:Date)=>[{id:'Mercury',speed:Math.sin((+d-START)*Math.PI/(20*DAY))}];
 const phases=await scanMotionCycles(at,read,undefined,['Mercury']);
 assert.equal(phases.length,1);
 const found=phases[0];
 assert.equal(found.retrograde,false);
 assert.ok(found.startedAt&&found.endsAt);
 assert.ok(Math.abs(+found.startedAt!-START)<60000);
 assert.ok(Math.abs(+found.endsAt!-(START+20*DAY))<60000);
 assert.equal(remainingMotionPercent(+found.startedAt!,+found.endsAt!,+at),50);
});
test('When a true station does not exist in the search window, no false percentage or date is created',async()=>{
 const at=new Date(START+10*DAY);
 const read=()=>[{id:'Mars',speed:0.2}];
 const phases=await scanMotionCycles(at,read,undefined,['Mars']);
 assert.equal(phases.length,1);
 assert.equal(phases[0].retrograde,false);
 assert.equal(phases[0].startedAt,null);
 assert.equal(phases[0].endsAt,null);
});
test('Legacy interval formatter stays correct; planet cards show exact station timestamp',()=>{
 const start=Date.parse('2026-01-01T00:00:00Z');
 const fortyFive=Date.parse('2026-02-15T02:20:00Z');
 assert.equal(motionTimeRemaining(start,fortyFive,'ar',true),'1ش · 14ي · 2س');
 assert.equal(motionTimeRemaining(start,start+2*3600000+25*60000,'ar',true),'2س · 25د');
 assert.equal(motionTimeRemaining(start,start+2*3600000+25*60000,'en',true),'2h · 25m');
 assert.equal(motionTimeRemaining(start+3600000,start,'ar',true),'انتهى');
 const main=readFileSync('src/main.ts','utf8');
 assert.match(main,/planetMotionStationText\(period\.endsAt\)/);
 assert.match(main,/data-motion-station/);
 assert.doesNotMatch(main,/data-motion-countdown/);
});
test('Countdown uses calendar months rather than 30-day approximations',()=>{
 assert.match(motionTimeRemaining(START,START+2*3600000+25*60000,'ar'),/2 ساعة/);
 assert.match(motionTimeRemaining(START,START+2*3600000+25*60000,'en'),/25 min/);
 assert.match(motionTimeRemaining(START,START+380*DAY,'ar'),/سنة/);
 assert.match(motionTimeRemaining(START,START+80*DAY,'ar'),/شهر/);
 assert.equal(motionTimeRemaining(START+100,START,'ar'),'انتهت الفترة');
});
