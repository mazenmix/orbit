import test from 'node:test';
import assert from 'node:assert/strict';
import {currentFocus} from '../src/liveFocus.ts';
import {rankPrioritySignals} from '../src/focusPriority.ts';
import type {Evidence,Signal} from '../src/math.ts';
const make=(id:string,transit:string,target:string,orb:number):Evidence=>({
 id,transit:{id:transit,symbol:transit,longitude:100,speed:transit==='Moon'?13:.05},
 natal:{id:target,symbol:target,longitude:100,speed:0},angle:0,orb,maximumOrb:1.4,
 applying:true,weight:.78,exact:null
});
const group=(category:Signal['category'],factors:Evidence[]):Signal=>({
 category,score:75,tier:'A',tone:'supportive',factors,allFactors:factors
});
const context=(signals:Signal[])=>rankPrioritySignals({
 signals,natal:{cusps:[]},knownBirthTime:false,complete:true
});
test('A real active Moon transit replaces a slow background theme',()=>{
 const saturn=make('saturn','Saturn','MC',.04),moon=make('moon','Moon','Mercury',.21);
 const rows=context([group('career',[saturn]),group('communication',[moon])]);
 const chosen=currentFocus(rows,[saturn,moon]);
 assert.equal(chosen?.factor.id,'moon');
 assert.equal(chosen?.signal.category,'communication');
});
test('Far Moon does not force a fabricated new focus every minute',()=>{
 const saturn=make('saturn','Saturn','MC',.04),moon=make('moon','Moon','Mercury',1.01);
 const rows=context([group('career',[saturn]),group('communication',[moon])]);
 assert.equal(currentFocus(rows,[saturn,moon])?.factor.id,rows[0].factor.id);
});
test('A contact missing from a real topic cannot be claimed in its reading',()=>{
 const saturn=make('saturn','Saturn','MC',.04),moon=make('moon','Moon','Mercury',.20);
 const rows=context([group('career',[saturn])]);
 assert.equal(currentFocus(rows,[saturn,moon])?.factor.id,'saturn');
});
test('No astrological input means no invented focus',()=>{
 assert.equal(currentFocus([],[]),undefined);
});
