import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import type {Chart} from '../src/engine.ts';
import {humanSoul} from '../src/humanReading.ts';
import {soulAspectPairs,soulReading} from '../src/soulEngine.ts';
import {soulTopics,type SoulTopic} from '../src/soulData.ts';
import {getSoulTheme} from '../src/soulThemes.ts';
import {soulTopicRules} from '../src/soulTopicRules.ts';

type Language='ar'|'en';
const fixtures=JSON.parse(readFileSync(new URL('./fixtures/native-swiss.json',import.meta.url),'utf8'));
const charts:Chart[]=fixtures.samples.map((sample:any)=>({
 date:new Date(sample.date),asc:sample.asc,mc:sample.mc,cusps:sample.cusps,missing:[],
 points:sample.points.map((point:any)=>({...point,symbol:'●'})),
}));
const point=(id:string,longitude:number)=>({id,longitude,speed:1,symbol:'●'});

// A unique topic heading or fixed editorial introduction must not disguise the
// same substantive paragraph repeated under unrelated analysis categories.
function body(text:string,topic:SoulTopic,language:Language):string{
 const theme=getSoulTheme(topic.id),focus=language==='ar'?theme.focusAr:theme.focusEn;
 for(const value of [focus,focus.replace(/[.!?؟\s]+$/u,''),topic[language]])text=text.replaceAll(value,'');
 return text.normalize('NFKC').replace(/[\p{P}\p{S}\s]+/gu,' ').trim();
}

test('all 200 displayed natal readings remain distinct beyond their titles and fixed introductions',()=>{
 for(const chart of charts.slice(0,2))for(const language of ['ar','en'] as const){
  const readings=soulTopics.map(topic=>({topic,value:humanSoul(soulReading(chart,topic))}));
  for(const section of ['summary','deep'] as const){
   const bodies=readings.map(({topic,value})=>body(value[section][language],topic,language));
   assert.ok(bodies.every(value=>value.length>70),`${section}/${language} needs substantive content beyond its heading`);
   assert.equal(new Set(bodies).size,200,`${section}/${language} repeats the same body under different topic names`);
  }
 }
});

test('unrelated love/fragrance and emotional-security/decor subjects cannot reuse a generic paragraph',()=>{
 for(const language of ['ar','en'] as const){
  for(const [first,second,section] of [[65,165,'summary'],[9,167,'deep']] as const){
   const a=soulTopics[first-1],b=soulTopics[second-1];
   const aa=humanSoul(soulReading(charts[1],a))[section][language];
   const bb=humanSoul(soulReading(charts[1],b))[section][language];
   assert.notEqual(body(aa,a,language),body(bb,b,language),`${a.en} and ${b.en} should address different questions`);
  }
 }
});

test('strengths, challenges, examples and practical advice materially respond to a different calculated chart',()=>{
 const original=soulTopics.map(topic=>soulReading(charts[0],topic));
 const changed=soulTopics.map(topic=>soulReading(charts[1],topic));
 for(const language of ['ar','en'] as const)for(const field of ['strengths','weaknesses','example','advice'] as const){
  const count=original.filter((reading,index)=>JSON.stringify(reading[field][language])!==JSON.stringify(changed[index][field][language])).length;
  assert.ok(count>=150,`${field}/${language}: only ${count} of 200 readings changed across materially different native charts`);
 }
});

test('displayed tension explains the actual first/third aspect instead of an unrelated first/second pair',()=>{
 const chart:Chart={date:new Date('2000-01-01T12:00:00Z'),asc:100,mc:null,cusps:[],missing:[],points:[point('Sun',10),point('Moon',50)]};
 const reading=soulReading(chart,soulTopics[0]),displayed=humanSoul(reading);
 assert.deepEqual(soulAspectPairs(reading.basis).map(pair=>[pair.first,pair.second,pair.type]),[['Sun','Ascendant',90]]);
 assert.match(displayed.deep.en,/identity|personal (?:choice|direction)|decisions/i);
 assert.match(displayed.deep.en,/presentation|first impression|appearance|public image/i);
 assert.doesNotMatch(displayed.deep.en,/another personal theme/i);
 assert.doesNotMatch(displayed.deep.ar,/احتياج آخر|موضوع آخر/);
});

test('a third Midheaven indicator retains its concrete professional role in human language',()=>{
 const index=soulTopicRules.findIndex(rule=>rule.planets[2]==='MC');
 assert.ok(index>=0,'fixture needs a topic with a third professional angle');
 const reading=soulReading(charts[1],soulTopics[index]);
 assert.equal(reading.basis[2].planet,'MC');
 const displayed=humanSoul(reading);
 assert.match(displayed.deep.en,/career|professional|public (?:role|presence|responsibility)/i);
 assert.doesNotMatch(displayed.deep.en,/another personal theme/i);
 assert.doesNotMatch(displayed.deep.ar,/احتياج آخر|موضوع آخر/);
});

test('personalization does not turn missing natal evidence into strengths, scenes or invented conclusions',()=>{
 const empty:Chart={date:new Date('2000-01-01T12:00:00Z'),points:[],asc:null,mc:null,cusps:[],missing:[]};
 for(const topic of soulTopics){
  const reading=soulReading(empty,topic),displayed=humanSoul(reading);
  assert.equal(reading.basisStatus,'unavailable');
  assert.deepEqual(reading.strengths,{ar:[],en:[]});
  assert.deepEqual(reading.weaknesses,{ar:[],en:[]});
  assert.deepEqual(reading.example,{ar:'',en:''});
  assert.match(displayed.summary.en,/Insufficient data/i);
  assert.doesNotMatch(displayed.deep.en,/you are|you will|your personality is/i);
 }
});

test('fragrance exploration stays sensory instead of inheriting privacy and career advice',()=>{
 const topic=soulTopics[164],natal=charts[1];
 const actions=new Set<string>();
 for(let sign=0;sign<12;sign++){
  const chart={...natal,points:natal.points.map(p=>p.id==='Venus'?{...p,longitude:sign*30+10}:p)};
  const source=soulReading(chart,topic),displayed=humanSoul(source);
  actions.add(source.advice.en);
  assert.doesNotMatch(displayed.deep.ar,/معلومة حساسة|حماية الخصوصية|العمل والدور العام/);
  assert.doesNotMatch(source.advice.en,/privacy boundary|another person.s intent|deadline and clear responsibility/i);
  assert.match(source.advice.en,/scent|sampl|option|material|impression|detail|use|comfort|taste|comparison/i);
 }
 assert.equal(actions.size,12,'all sensory exploration approaches must respond to the calculated placement');
});
