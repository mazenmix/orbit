import test from 'node:test';import assert from 'node:assert/strict';
import {detectInventedNatalText} from '../src/soulGrounding.ts';
const actual=[{planet:'Venus',longitude:43,sign:1,house:7},{planet:'Moon',longitude:111,sign:3,house:10}];
test('Qwen3 must not invent Mercury or a Capricorn sign absent from the supplied Venus/Moon chart',()=>{
 const bad='الزهرة في برج الثور والقمر في السرطان. عطارد في برج الجدي في البيت السابع.';
 assert.ok(detectInventedNatalText([bad],actual).some(x=>x==='invented-planet:Mercury'));
 assert.ok(detectInventedNatalText([bad],actual).some(x=>x==='invented-sign:الجدي'));
});
test('genuine computed placements survive while fabricated house and precise degree do not',()=>{
 assert.deepEqual(detectInventedNatalText(['الزهرة في برج الثور بالبيت السابع، القمر في السرطان.'],actual),[]);
 assert.ok(detectInventedNatalText(['الزهرة في البيت الثاني عشر'],actual).length);
 assert.ok(detectInventedNatalText(['Venus 23.57° in Taurus'],actual).length);
});
