import test from 'node:test';
import assert from 'node:assert/strict';
import {distinctHighlights} from '../src/highlights.ts';
type Entry={title:string;action:string;id:string};
const items:Entry[]=[
 {id:'headline',title:'Finish the task',action:'Review the result.'},
 {id:'duplicate-title',title:'Finish the task!',action:'Take a new action.'},
 {id:'duplicate-action',title:'Talk clearly',action:'Review the result'},
 {id:'distinct-one',title:'Check your work',action:'Clarify one condition.'},
 {id:'distinct-two',title:'Make time',action:'Reserve a rest break.'}
];
test('highlight cards never repeat headline title or action',()=>{
 assert.deepEqual(distinctHighlights(items,x=>x,3,1).map(x=>x.item.id),['distinct-one','distinct-two']);
});
test('cards preserve real calculation indexes for evidence navigation',()=>{
 assert.deepEqual(distinctHighlights(items,x=>x,3,1).map(x=>x.index),[3,4]);
});
test('without skip, strongest distinct item stays first',()=>{
 assert.deepEqual(distinctHighlights(items,x=>x,2).map(x=>x.index),[0,3]);
});
test('empty signals do not generate invented fallback readings',()=>{
 assert.deepEqual(distinctHighlights([],x=>x),[]);
});
