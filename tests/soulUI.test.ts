import test from 'node:test';import assert from 'node:assert/strict';
Object.defineProperty(globalThis,'localStorage',{value:{getItem:()=>null,setItem:()=>{}},configurable:true});
const {soulIcon}=await import('../src/soulUI.ts');
const planet=(id:string,longitude:number)=>({id,longitude,symbol:'∘',speed:1});
test('professional SVG icons have genuine paths, not decorative emoji placeholders',()=>{
 assert.match(soulIcon('brain'),/<svg/);assert.match(soulIcon('brain'),/<path/);
 assert.match(soulIcon('crown'),/<path/);
});

test('complete interactive page outputs 25 clickable SVG category cards and all eight topic actions',async()=>{
 const {soulRender}=await import('../src/soulUI.ts');
 const date=new Date('1985-03-29T16:20:00Z');
 const points=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','Ceres','Pallas','Juno','Vesta','Pholus'].map((id,i)=>({id,longitude:(i*25+15)%360,speed:1,symbol:'●'}));
 const natal={date,points,cusps:Array.from({length:12},(_,i)=>(180+i*30)%360),asc:180,mc:90,missing:[]};
 const profile={id:'test-owner',name:'Nadia',date:'1985-03-29',time:'19:20',city:'Baghdad',zone:'Asia/Baghdad',lat:33.3,lon:44.4,kind:'self',known:true,sex:'female'};
 const html=soulRender({profile:profile as any,chart:natal as any,categoryId:1,topicId:1,query:''});
 assert.ok(html.includes('MX SOUL DNA'));
 assert.equal((html.match(/class="soul-category /g)||[]).length,25);
 assert.equal((html.match(/data-soul-topic="/g)||[]).length,10); // 8 navigation + prev/next
 assert.ok(html.includes('data-soul-save="1"'));
 assert.ok(html.includes('soul-head.svg'));
 assert.ok(html.includes('شخصيتك الحقيقية')&&html.includes('نقاط القوة'));
});
test('details UI switches category, topic and owner without stale natal evidence',async()=>{
 const {soulRender}=await import('../src/soulUI.ts');
 const profile={id:'x',name:'Alex',date:'2000-01-01',time:'12:00',zone:'Etc/UTC',city:'London',known:false,kind:'dating'};
 const natal={date:new Date(),points:['Sun','Moon','Mercury','Venus','Mars','Saturn','Jupiter','Neptune','Pluto','Uranus'].map((id,i)=>({id,longitude:(i*20)%360,speed:1,symbol:'•'})),asc:null,mc:null,cusps:[],missing:[]};
 const page=soulRender({profile:profile as any,chart:natal as any,categoryId:21,topicId:165,query:''});
 assert.ok(page.includes('Alex'));assert.ok(page.includes('الألوان المقترحة رمزياً')||page.includes('أنواع العطر'));
 assert.ok(!page.includes('data-soul-save='));
 assert.ok(page.includes('البيوت غير متاحة')||page.includes('وقت الميلاد/البيوت'));
});
