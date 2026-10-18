import test from 'node:test';import assert from 'node:assert/strict';
import {moonSignReading} from '../src/moonSignNarrative.ts';
const date=new Date('2026-10-18T12:00:00Z');
const current={date,asc:null,mc:null,cusps:[],missing:[],points:[{id:'Moon',symbol:'☾',longitude:273,speed:13}]};
const natalA={...current,points:[{id:'Venus',symbol:'♀',longitude:274,speed:1}]};
const natalB={...current,points:[{id:'Saturn',symbol:'♄',longitude:8,speed:1}]};
test('every Moon sign has exactly five meaningful lines in both languages',()=>{
 for(let s=0;s<12;s++){for(const ar of [true,false]){const v=moonSignReading(s,current,natalA,true,ar);assert.equal(v.length,5);assert.ok(v.every(x=>x.length>35));}}
});
test('personal Moon-to-natal interpretation responds to the actual chart and orb',()=>{
 const a=moonSignReading(9,current,natalA,true,true);
 const b=moonSignReading(9,current,natalB,true,true);
 assert.notEqual(a[4],b[4]);assert.match(a[4],/الزهرة/);
 assert.throws(()=>moonSignReading(-1,current,natalA));
});
