import test from 'node:test';import assert from 'node:assert/strict';
Object.defineProperty(globalThis,'localStorage',{value:{getItem:()=>null,setItem:()=>{}},configurable:true});
const {wheel,horoscopeXY,houseOrder}=await import('../src/chart.ts');
test('twelve Placidus houses increase counterclockwise from left-hand Ascendant',()=>{
 const c={date:new Date('2026-10-18T00:00:00Z'),asc:0,mc:270,cusps:Array.from({length:12},(_,i)=>i*30),points:[],missing:[]};
 assert.equal(houseOrder(c.cusps),true);
 const a=horoscopeXY(15,0,148),b=horoscopeXY(45,0,148);
 assert.ok(a[0]<210&&b[0]<210,'first and second sectors remain on western half');
 assert.ok(b[1]>a[1],'house 2 is lower than house 1 on counterclockwise wheel');
 const markup=wheel(c);
 assert.equal([...markup.matchAll(/<circle cx="[^"]+" cy="[^"]+" r="12" fill=/g)].length,12,'draw exactly twelve numbered cusps');
 assert.ok(markup.includes('1 → 2 → 3 · ↺'));
 assert.ok(markup.includes('fill-opacity=".32"'));
});
test('counterclockwise projection covers 360 degrees without reversing sign ordering',()=>{
 const left=horoscopeXY(0,0,158),bottom=horoscopeXY(90,0,158),right=horoscopeXY(180,0,158),top=horoscopeXY(270,0,158);
 assert.ok(left[0]<210);assert.ok(bottom[1]>210);assert.ok(right[0]>210);assert.ok(top[1]<210);
});
