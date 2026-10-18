import test from 'node:test';import assert from 'node:assert/strict';
import {soulRender,soulIcon} from '../src/soulUI.ts';
const planet=(id:string,longitude:number)=>({id,longitude,symbol:'∘',speed:1});
test('professional SVG icons have genuine paths, not decorative emoji placeholders',()=>{
 assert.match(soulIcon('brain'),/<svg/);assert.match(soulIcon('brain'),/<path/);
 assert.match(soulIcon('crown'),/<path/);
});
