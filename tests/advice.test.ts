import test from 'node:test';
import assert from 'node:assert/strict';
import {advice} from '../src/advice.ts';
import type {Signal,Evidence} from '../src/math.ts';
const factor=(transit:string,natal:string,angle:number,applying=true)=>({transit:{id:transit},natal:{id:natal},angle,applying,orb:.2,weight:.8} as Evidence);
const signal=(category:Signal['category'],factors:Evidence[])=>({category,factors,score:50,tone:'neutral',tier:'A'} as Signal);
test('primary advice avoids the old technical boilerplate in both languages',()=>{
 for(const lang of ['ar','en'] as const){const text=JSON.stringify(advice(signal('career',[factor('Saturn','Sun',90)]),lang));assert.doesNotMatch(text,/أقوى عامل|Saturn|زحل|°|orb|تربيع/);}
});
test('work constraints and unclear communication produce different practical instructions',()=>{
 const work=advice(signal('career',[factor('Saturn','Sun',90)]),'ar');
 const message=advice(signal('communication',[factor('Neptune','Mercury',90)]),'ar');
 assert.notEqual(work.title,message.title);assert.notEqual(work.action,message.action);
 assert.match(work.action,/مسؤوليتك/);assert.match(message.action,/تقصد/);
});
test('approaching and separating work pressure produce preparation versus review',()=>{
 const a=advice(signal('career',[factor('Saturn','Sun',90,true)]),'ar');
 const b=advice(signal('career',[factor('Saturn','Sun',90,false)]),'ar');
 assert.notEqual(a.action,b.action);
});
