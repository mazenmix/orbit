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
 assert.equal([...markup.matchAll(/<circle cx="[^"]+" cy="[^"]+" r="12.5" fill=/g)].length,12,'draw exactly twelve numbered cusps');
 assert.ok(markup.includes('data-planet')===false,'no planets were supplied to the fixture');
 assert.ok(markup.includes('ASC')&&markup.includes('MC'),'accurate angle labels are visible');
 assert.ok(markup.includes('fill-opacity=".23"'),'twelve colored zodiac sectors appear');
});
test('counterclockwise projection covers 360 degrees without reversing sign ordering',()=>{
 const left=horoscopeXY(0,0,158),bottom=horoscopeXY(90,0,158),right=horoscopeXY(180,0,158),top=horoscopeXY(270,0,158);
 assert.ok(left[0]<210);assert.ok(bottom[1]>210);assert.ok(right[0]>210);assert.ok(top[1]<210);
});
test('unavailable Placidus cusps do not falsely label a known polar birth as unknown',()=>{
 const markup=wheel({date:new Date(),asc:null,mc:null,cusps:[],points:[],missing:[]});
 assert.match(markup,/غير متاحين/);
 assert.doesNotMatch(markup,/وقت الولادة غير معروف|birth time is unknown/);
});

test('pink asteroid layer preserves exact Swiss longitudes and excludes absent bodies',()=>{
 const c={date:new Date('2026-11-09T10:00:00Z'),asc:0,mc:270,cusps:Array.from({length:12},(_,i)=>i*30),points:[],missing:[]};
 const names=['Eros','Lust','Aphrodite','Lilith','Casanova','Adonis'];
 const positions=names.map((id,i)=>({id,symbol:'✧',longitude:3.125+i*46.487,speed:.15}));
 const html=wheel(c,undefined,positions);
 assert.equal([...html.matchAll(/data-featured-asteroid=/g)].length,6);
 for(const p of positions){
  assert.ok(html.includes('data-featured-asteroid="'+p.id+'"'));
  assert.ok(html.includes('data-asteroid-longitude="'+p.longitude.toFixed(4)+'"'));
 }
 assert.ok(html.includes('stroke="#ff9bd7"'));
 assert.equal([...html.matchAll(/<rect[^>]*fill="#3d1c3c"/g)].length,0,
  'Large pink asteroid badges must never cover planet or house labels');
 const group=[...html.matchAll(/<g class="wheel-featured-asteroid"[^>]*>([\s\S]*?)<\/g>/g)];
 assert.equal(group.length,6);
 assert.ok(group.every((match,i)=>!match[1].includes('<rect')&&match[1].includes('font-size="10.5"')),
  'Markers are compact numbered circles, never rectangular name badges');
 assert.equal([...wheel(c).matchAll(/data-featured-asteroid=/g)].length,0,
  'Never show invented markers until numbered ephemerides are mounted');
});
