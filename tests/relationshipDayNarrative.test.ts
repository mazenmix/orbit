import test from 'node:test';
import assert from 'node:assert/strict';
import {relationshipWindows,bestWindows} from '../src/relationshipWindows.ts';
import {relationshipDayReading} from '../src/relationshipDayNarrative.ts';
import {categories} from '../src/math.ts';
const d={attraction:75,sexual:65,emotional:62,communication:70,stability:58,conflict:35};
const scores=(at:Date)=>Object.fromEntries(categories.map(c=>[c,c==='communication'?65+(at.getUTCDate()%4)*5:c==='love'?57+(at.getUTCDate()%3)*6:c==='energy'?65:50])) as any;
const rows=relationshipWindows(new Date('2026-10-21T12:00:00Z'),d,scores,21);
const evidence=(id:string,angle:number)=>({id:id+'-'+angle+'-Mercury',transit:{id,symbol:'?',longitude:0,speed:1},natal:{id:'Mercury',symbol:'?',longitude:0,speed:0},angle,orb:.25,maximumOrb:1.4,applying:true,weight:.8,exact:null});
test('daily narratives follow actual dated indices and computed transit evidence, not a constant advice string',()=>{
 const days=bestWindows(rows,'message',3),used=new Set<string>();
 const first=relationshipDayReading(days[0],'message',rows,[{category:'communication',allFactors:[evidence('Mercury',60)],factors:[evidence('Mercury',60)]} as any],used);
 const second=relationshipDayReading(days[1],'message',rows,[{category:'communication',allFactors:[evidence('Mars',90)],factors:[evidence('Mars',90)]} as any],used);
 assert.notEqual(first.ar,second.ar);
 assert.notEqual(first.reasonAr,second.reasonAr);
 assert.match(first.ar,/الكلام الواضح/);
 assert.match(second.ar,/الاندفاع/);
 assert.equal(first.factor,'Mercury-60-Mercury');
 assert.equal(second.factor,'Mars-90-Mercury');
 assert.match(first.reasonAr,new RegExp(String(days[0].source.communication)));
});
test('strongest already-used contact can yield a different real factor without inventing one',()=>{
 const days=bestWindows(rows,'message',3),used=new Set<string>();
 const group=[{category:'communication',allFactors:[evidence('Mercury',60),evidence('Venus',60)],factors:[evidence('Mercury',60)]}] as any;
 const a=relationshipDayReading(days[0],'message',rows,group,used);
 const b=relationshipDayReading(days[1],'message',rows,group,used);
 assert.notEqual(a.factor,b.factor);
 assert.notEqual(a.ar,b.ar);
});
test('a day with no computed contact explicitly says so rather than inventing a relationship outcome',()=>{
 const day=bestWindows(rows,'date',3)[0];
 const message=relationshipDayReading(day,'date',rows,[],new Set());
 assert.equal(message.factor,null);
 assert.match(message.ar,/ماكو اتصال تقارب/);
 assert.ok(!/مضمون|راح توافق|راح ترد/.test(message.ar));
 assert.ok(!message.reasonAr.includes('undefined'));
});
