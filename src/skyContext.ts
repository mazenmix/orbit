import {angles,distance,clamp,type Category,type Point} from './math.ts';
import type {Chart} from './engine.ts';

/**
 * Second, explicitly contextual lens for GO / Travel scores.
 * Unlike narrow exact-contact alerts, it evaluates all 10 principal transit
 * planets against topic-specific natal anchors at the selected instant.
 * The 50-point balance is a declared neutral rubric, NOT missing ephemeris data,
 * a clinical measure, an event probability or a validated prediction.
 * Do not feed this into the original close-contact signals or AI evidence model.
 */
export type SkyScope='tight'|'wide'|'background';
export type SkyContact={transit:string;natal:string;angle:number;orb:number;strength:number;tone:number};
export type SkyDomain={category:Category;score:number;scope:SkyScope;primary:SkyContact;contacts:number;contributors:readonly SkyContact[]};
export type SkyContext={scores:Record<Category,number>;domains:Record<Category,SkyDomain>};
const anchors:Record<Category,readonly string[]>={
 overview:['Sun','Ascendant'],
 career:['MC','Saturn','Sun'],
 love:['Venus'],
 communication:['Mercury'],
 energy:['Mars','Sun'],
 emotions:['Moon','Neptune'],
 recovery:['Moon','Saturn'],
 timing:['Uranus','Jupiter']
};
const major=new Set(['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']);
const categories:readonly Category[]=['overview','career','love','communication','energy','emotions','recovery','timing'];
const positive=new Set(['Jupiter','Venus']);
const difficult=new Set(['Saturn','Mars','Pluto','Uranus']);
function tonalValue(planet:string,angle:number){
 if(angle===60||angle===120)return 1;
 if(angle===90||angle===180)return -1;
 return positive.has(planet)?0.9:difficult.has(planet)?-0.8:0.25;
}
/** Shared calculation for a contextual value and its decision review. */
export function contextScore(contacts:readonly SkyContact[]):number{
 if(contacts.some(c=>!Number.isFinite(c.strength)||c.strength<0||c.strength>1||!Number.isFinite(c.tone)||c.tone< -1||c.tone>1))throw Error('Invalid contextual contribution');
 return Math.round(clamp(50+contacts.reduce((value,c)=>value+c.tone*c.strength*20,0)));
}
function targetPoints(natal:Chart,known:boolean):Point[]{
 const list=natal.points.filter(p=>known||p.id!=='Moon').slice();
 if(known&&natal.asc!==null)list.push({id:'Ascendant',symbol:'ASC',longitude:natal.asc,speed:0});
 if(known&&natal.mc!==null)list.push({id:'MC',symbol:'MC',longitude:natal.mc,speed:0});
 return list;
}
/** Every domain has an ephemeris-grounded nearest aspect (even when >8°).
 * Near aspects influence the index; remote ones are reported as background only.
 * Saturated weights avoid "more planets = guaranteed better/worse" artifacts.
 */
export function skyContext(natal:Chart,current:Chart,known:boolean):SkyContext{
 const targets=targetPoints(natal,known);
 const transits=current.points.filter(p=>major.has(p.id));
 if(transits.length<8)throw Error('Insufficient principal ephemeris positions for contextual gauges');
 const domains={} as Record<Category,SkyDomain>;
 const scores={} as Record<Category,number>;
 for(const category of categories){
  const basis=anchors[category].flatMap(id=>targets.filter(p=>p.id===id));
  if(!basis.length)throw Error('Missing natal context for '+category);
  const candidates:SkyContact[]=[];
  for(const source of basis)for(const transit of transits)for(const angle of angles){
   const orb=Math.abs(distance(transit.longitude,source.longitude)-angle);
   const strength=Math.max(0,1-orb/8);
   candidates.push({transit:transit.id,natal:source.id,angle,orb,strength,tone:tonalValue(transit.id,angle)});
  }
  candidates.sort((a,b)=>a.orb-b.orb||a.transit.localeCompare(b.transit)||a.natal.localeCompare(b.natal)||a.angle-b.angle);
  const primary=candidates[0];
  if(!primary)throw Error('No sky context for '+category);
  // At most two independently transiting planets contribute; each must be within
  // the declared 8-degree contextual limit. The exact-contact model is untouched.
  const contributors:SkyContact[]=[],seen=new Set<string>();
  for(const candidate of candidates){
   if(candidate.orb>8||candidate.strength<=0||seen.has(candidate.transit))continue;
   contributors.push(candidate);seen.add(candidate.transit);
   if(contributors.length===2)break;
  }
  const score=contextScore(contributors);
  const scope:SkyScope=primary.orb<=2.2?'tight':primary.orb<=8?'wide':'background';
  domains[category]={category,score,scope,primary,contacts:contributors.length,contributors};
  scores[category]=score;
 }
 return {scores,domains};
}
const arNames:Record<string,string>={Sun:'الشمس',Moon:'القمر',Mercury:'عطارد',Venus:'الزهرة',Mars:'المريخ',Jupiter:'المشتري',Saturn:'زحل',Uranus:'أورانوس',Neptune:'نبتون',Pluto:'بلوتو',Ascendant:'الطالع',MC:'وسط السماء'};
const arAngles:Record<number,string>={0:'اقتران',60:'تسديس',90:'تربيع',120:'تثليث',180:'مقابلة'};
const enAngles:Record<number,string>={0:'conjunct',60:'sextile',90:'square',120:'trine',180:'opposite'};
/** A brief audit trail for a derived multi-topic gauge. Never call a wide
 * background aspect an exact personal prediction. */
export function contextGaugeBasis(context:SkyContext,sources:readonly Category[],english=false):string{
 const rows=[...new Set(sources)].map(c=>context.domains[c]).filter(Boolean);
 if(!rows.length)return english?'No calculated sky context':'ماكو سياق سماوي محسوب';
 rows.sort((a,b)=>a.primary.orb-b.primary.orb||a.category.localeCompare(b.category));
 const row=rows[0],p=row.primary;
 const name=english?p.transit:(arNames[p.transit]??p.transit);
 const target=english?p.natal:(arNames[p.natal]??p.natal);
 const relation=english?enAngles[p.angle]:arAngles[p.angle];
 const prefix=row.scope==='tight'?
  (english?'Close aspect':'اتصال قريب'):
  row.scope==='wide'?(english?'Wide context':'اتصال واسع'):
   (english?'Distant geometry, neutral baseline':'أقرب زاوية بعيدة · مؤشر محايد');
 return prefix+' · '+name+' '+relation+' '+target+' · '+p.orb.toFixed(1)+'°';
}

/** Concise interpretation based on an actual calculated contact.
 * This is a traditional astrological reading, not an observed life event. */
export function contextGaugeNarrative(context:SkyContext,sources:readonly Category[],english=false):string{
 const rows=[...new Set(sources)].map(c=>context.domains[c]).filter(Boolean);
 if(!rows.length)return english?'No usable planetary positions.':'ماكو مواقع كوكبية كافية.';
 rows.sort((a,b)=>a.primary.orb-b.primary.orb);
 const row=rows[0],p=row.primary;
 const name=english?p.transit:(arNames[p.transit]??p.transit);
 const target=english?p.natal:(arNames[p.natal]??p.natal);
 const aspectName=english?enAngles[p.angle]:arAngles[p.angle];
 const subjects:Record<string,[string,string]>={
  Sun:['أولوياتك وثقتك بالقرار','decisions and personal priorities'],
  Moon:['مزاجك واحتياجك للراحة','emotional responses and comfort'],
  Mercury:['المعلومات وطريقة التواصل','information and communication'],
  Venus:['التقارب والقيم الشخصية','affection and personal values'],
  Mars:['المبادرة وحدود الاندفاع','initiative and impulse control'],
  Jupiter:['التوسع وموازنة الخيارات','growth and weighing options'],
  Saturn:['المسؤوليات وحدود الوقت والجهد','responsibility, time and effort limits'],
  Uranus:['التغيير والتكيف','change and flexibility'],
  Neptune:['التوقعات وما هو واضح فعلاً','expectations versus facts'],
  Ascendant:['الانطباع الأول والحضور','presence and first impressions'],
  MC:['العمل والمسؤوليات العامة','career and public roles']
 };
 if(row.scope==='background')return english?
  'The nearest '+name+'–'+target+' aspect is '+p.orb.toFixed(1)+'° away. No close aspect was calculated; the 50-point reading is a neutral context marker, not a forecast.':
  'أقرب زاوية بين '+name+' و'+target+' فارقها '+p.orb.toFixed(1)+'°. ماكو اتصال ضمن 8°؛ الدرجة حيادية مو توقع.';
 const subject=subjects[p.natal]?.[english?1:0]??(english?'your priorities':'أولوياتك');
 const challenging=p.angle===90||p.angle===180;
 const tip=challenging?
  (english?'Review one concrete detail before taking action.':'دقّق معلومة مهمة قبل ما تتخذ خطوة.'):
  (english?'Use this as a prompt for one specific, reversible step.':'استثمرها بخطوة صغيرة قابلة للتعديل.');
 return english?
  name+' '+aspectName+' natal '+target+' ('+p.orb.toFixed(1)+'°): this astrological lens concerns '+subject+'. '+tip:
  name+' '+aspectName+' '+target+' (فارق '+p.orb.toFixed(1)+'°): القراءة تربط هالزاوية بموضوع '+subject+'. '+tip;
}
