import {angles,clamp,distance,type Category,type Point} from './math.ts';
import type {Chart} from './engine.ts';

/** Ephemeris-derived sky-to-sky context. Scores are symbolic preferences, never event probabilities. */
export type SkyNote={id:string;arTitle:string;enTitle:string;arMeaning:string;enMeaning:string;categories:readonly Category[];strength:number;kind:'aspect'|'retrograde'|'moon-sign'};
export type SkyClimate={adjustments:Record<Category,number>;notes:SkyNote[]};
const keys:Category[]=['overview','career','love','communication','energy','emotions','recovery','timing'];
const names:Record<string,[string,string]>={
 Sun:['الشمس','Sun'],Moon:['القمر','Moon'],Mercury:['عطارد','Mercury'],Venus:['الزهرة','Venus'],
 Mars:['المريخ','Mars'],Jupiter:['المشتري','Jupiter'],Saturn:['زحل','Saturn'],Uranus:['أورانوس','Uranus'],
 Neptune:['نبتون','Neptune'],Pluto:['بلوتو','Pluto']
};
const aspects:Record<number,[string,string]>={
 0:['اقتران','conjunct'],60:['تسديس','sextile'],90:['تربيع','square'],120:['تثليث','trine'],180:['مقابلة','opposite']
};
const zodiac:readonly [string,string][]=[
 ['الحمل','Aries'],['الثور','Taurus'],['الجوزاء','Gemini'],['السرطان','Cancer'],
 ['الأسد','Leo'],['العذراء','Virgo'],['الميزان','Libra'],['العقرب','Scorpio'],
 ['القوس','Sagittarius'],['الجدي','Capricorn'],['الدلو','Aquarius'],['الحوت','Pisces']
];
const relevance:Record<string,Partial<Record<Category,number>>>={
 Sun:{overview:1,career:.6,energy:.5},Moon:{emotions:1,recovery:.85,love:.4},
 Mercury:{communication:1,love:.5,emotions:.4,career:.3},Venus:{love:1,emotions:.6,communication:.25},
 Mars:{energy:1,communication:.6,emotions:.8,love:.5,recovery:.35},
 Jupiter:{timing:.7,overview:.7,career:.4},Saturn:{career:.7,recovery:.8,emotions:.6,overview:.5},
 Uranus:{timing:1,communication:.4,emotions:.4},Neptune:{emotions:.8,love:.45,communication:.3},
 Pluto:{emotions:.9,love:.65,recovery:.4,overview:.4}
};
const negativeNew=([90,180] as number[]);
const positiveNew=([60,120] as number[]);
const specialized=(a:string,b:string,angle:number):[string,string]|null=>{
 const pair=[a,b].sort().join(':');
 if(pair==='Mars:Mercury'&&angle===90)return [
  'كلام حاد، ردود دفاعية، وسرعة تحوّل النقاش إلى جدال. اسأل عن المقصود قبل الرد.',
  'Sharp words, defensive reactions and a tendency for discussions to escalate; clarify intent first.'
 ];
 if(pair==='Moon:Pluto'&&angle===180)return [
  'شدّ وجذب عاطفي وحساسية تجاه السيطرة والحدود. لا تحوّل اختلاف بسيط إلى معركة.',
  'Emotional push and pull, sensitivity around control and boundaries; avoid escalating disagreements.'
 ];
 return null;
};
function describe(a:string,b:string,angle:number):[string,string]{
 const special=specialized(a,b,angle);
 if(special)return special;
 const difficult=negativeNew.includes(angle),helpful=positiveNew.includes(angle);
 if(difficult)return ['توتر رمزي بين '+names[a][0]+' و'+names[b][0]+'؛ الكلام والتوقعات يحتاجن هدوء وتوضيح.',
  'A symbolic tension between '+names[a][1]+' and '+names[b][1]+'; clarify words and expectations.'];
 if(helpful)return ['اتصال داعم رمزياً؛ استثمره بخطوة واضحة وهادئة بدون استعجال.',
  'A symbolically supportive contact; take a clear, measured step.'];
 return ['اقتران يجمع موضوعين فلكيين؛ راقب شنو مهم إلك هسه قبل اتخاذ قرار.',
  'A conjunction combines two symbolic themes; review priorities before acting.'];
}
function aspectTone(a:string,b:string,angle:number){
 if(negativeNew.includes(angle))return -1;
 if(positiveNew.includes(angle))return 1;
 if(a==='Jupiter'||b==='Jupiter'||(a==='Venus'&&b==='Moon')||(b==='Venus'&&a==='Moon'))return .45;
 return 0;
}
export function skyClimate(current:Pick<Chart,'points'>):SkyClimate{
 const byId=new Map<string,Point>();
 for(const p of current.points){
  if(names[p.id]&&Number.isFinite(p.longitude)&&Number.isFinite(p.speed))byId.set(p.id,p);
 }
 if(byId.size<8)throw Error('Insufficient sky bodies for atmosphere calculation');
 const bodies=[...byId.values()],notes:SkyNote[]=[];
 const weights=Object.fromEntries(keys.map(k=>[k,[] as number[]])) as Record<Category,number[]>;
 for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
  const one=bodies[i],two=bodies[j],separation=distance(one.longitude,two.longitude);
  const angle=angles.reduce<number>((best,candidate)=>Math.abs(separation-candidate)<Math.abs(separation-best)?candidate:best,0);
  const orb=Math.abs(separation-angle),hasMoon=one.id==='Moon'||two.id==='Moon';
  const maxOrb=hasMoon?7:5;
  if(orb>maxOrb)continue;
  const closeness=Math.max(0,1-orb/(maxOrb+1));
  const valence=aspectTone(one.id,two.id,angle);
  const extent=closeness*9*valence;
  const relevant:Category[]=[];
  for(const key of keys){
   const intensity=Math.min(1.2,(relevance[one.id][key]??0)+(relevance[two.id][key]??0));
   if(intensity>=.35)relevant.push(key);
   if(valence!==0&&intensity>0)weights[key].push(extent*intensity);
  }
  const words=describe(one.id,two.id,angle);
  const priority=specialized(one.id,two.id,angle)?2:1;
  notes.push({id:'aspect:'+one.id+':'+two.id+':'+angle,
   arTitle:names[one.id][0]+' '+aspects[angle][0]+' '+names[two.id][0],
   enTitle:names[one.id][1]+' '+aspects[angle][1]+' '+names[two.id][1],
   arMeaning:words[0],enMeaning:words[1],categories:relevant,
   strength:closeness*priority,kind:'aspect'});
 }
 for(const id of ['Mercury','Venus']){
  const p=byId.get(id);
  if(!p||p.speed>=-1e-7)continue;
  const sign=zodiac[Math.floor(((p.longitude%360)+360)%360/30)];
  const isVenus=id==='Venus';
  const relevant:Category[]=isVenus?['love','emotions','communication']:['communication','love','emotions'];
  const arMeaning=isVenus?
   'مراجعة العلاقات والحساسيات العاطفية وسوء فهم النوايا. لا تفترض شعور الطرف الثاني.':
   'مراجعة الكلام والرسائل والتفاهمات السابقة؛ تأكد من المعنى قبل اتخاذ موقف.';
  const enMeaning=isVenus?
   'Reconsider relationships, emotional sensitivities and assumed intentions; ask rather than presume.':
   'Revisit messages and earlier agreements; verify meaning before reacting.';
  notes.push({id:'retro:'+id,arTitle:names[id][0]+' متراجع'+(isVenus?'ة':'')+' بال'+sign[0],
   enTitle:names[id][1]+' retrograde in '+sign[1],
   arMeaning,enMeaning,categories:relevant,strength:isVenus?1.85:1.6,kind:'retrograde'});
  if(isVenus){weights.love.push(-5);weights.emotions.push(-2);weights.communication.push(-1);}
  else {weights.communication.push(-5);weights.love.push(-2);weights.emotions.push(-1);}
 }
 const moon=byId.get('Moon');
 if(moon){
  const sign=zodiac[Math.floor(((moon.longitude%360)+360)%360/30)];
  const leo=Math.floor(((moon.longitude%360)+360)%360/30)===4;
  notes.push({id:'moon:sign',arTitle:'القمر بال'+sign[0],enTitle:'Moon in '+sign[1],
   arMeaning:leo?'الكبرياء والحساسية تجاه التجاهل أو طريقة الكلام. خَلّ التعبير واضح بدون افتراض إساءة.':
    'رمزياً، لون القمر الحالي يغيّر موضوع الانتباه العاطفي؛ لاحظ ردود فعلك بدون حكم مسبق.',
   enMeaning:leo?'Pride and sensitivity to being ignored or to wording; communicate clearly.':
    'The Moon’s current sign shifts symbolic emotional emphasis; notice reactions without presuming motives.',
   categories:['emotions','love','recovery'],strength:1.7,kind:'moon-sign'});
 }
 const adjustments=Object.fromEntries(keys.map(key=>{
  const strongest=[...weights[key]].sort((a,b)=>Math.abs(b)-Math.abs(a)).slice(0,4);
  const raw=strongest.reduce((total,n)=>total+n,0);
  return [key,Math.max(-16,Math.min(16,Math.round(raw)))];
 })) as Record<Category,number>;
 notes.sort((a,b)=>b.strength-a.strength||a.id.localeCompare(b.id));
 return {adjustments,notes};
}
