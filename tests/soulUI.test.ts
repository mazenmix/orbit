import test from 'node:test';import assert from 'node:assert/strict';
Object.defineProperty(globalThis,'localStorage',{value:{getItem:()=>null,setItem:()=>{}},configurable:true});
const {soulIcon}=await import('../src/soulUI.ts');
const planet=(id:string,longitude:number)=>({id,longitude,symbol:'∘',speed:1});
test('professional SVG icons have genuine paths, not decorative emoji placeholders',()=>{
 assert.match(soulIcon('brain'),/<svg/);assert.match(soulIcon('brain'),/<path/);
 assert.match(soulIcon('crown'),/<path/);
});
