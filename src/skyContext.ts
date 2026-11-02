import {angles,distance,clamp,type Category,type Point} from './math.ts';
import type {Chart} from './engine.ts';
import {skyClimate,skyAspectExplanation,type SkyClimate} from './skyAtmosphere.ts';

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
export type SkyDomain={category:Category;score:number;scope:SkyScope;primary:SkyContact;contacts:number;contributors:readonly SkyContact[];skyAdjustment:number};
export type SkyContext={scores:Record<Category,number>;domains:Record<Category,SkyDomain>;climate:SkyClimate};
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
export function contextScore(contacts:readonly SkyContact[],skyAdjustment=0):number{
 if(!Number.isFinite(skyAdjustment)||Math.abs(skyAdjustment)>16)throw Error('Invalid current-sky adjustment');
 // Contextual weights belong to actual supported aspects within eight degrees,
 // never invented or repeated inputs. A duplicated record otherwise pushes a
 // plausible 50-point baseline toward an unsupported extreme.
 if(contacts.length>2)throw Error('Too many contextual contributors');
 const ids=new Set<string>();
 for(const c of contacts){
  if(!major.has(c.transit)||!c.natal||![0,60,90,120,180].includes(c.angle)||
   !Number.isFinite(c.orb)||c.orb<0||c.orb>=8||
   !Number.isFinite(c.strength)||c.strength<0||c.strength>1||
   !Number.isFinite(c.tone)||c.tone< -1||c.tone>1)
   throw Error('Invalid contextual contribution');
  // Two different targets of the same moving planet are correlated, not
  // independent transit sources. Context domains explicitly allow one
  // contribution per moving body, so enforce the invariant here too.
  if(ids.has(c.transit))throw Error('Repeated contextual contribution from '+c.transit);
  ids.add(c.transit);
 }
 return Math.round(clamp(50+contacts.reduce((value,c)=>value+c.tone*c.strength*20,0)+skyAdjustment));
}
function targetPoints(natal:Chart,known:boolean):Point[]{
 // Invalid natal coordinates must never silently become a zero-weight neutral
 // reading: the same angular input affects the score and its explanation.
 const seen=new Set<string>();
 for(const p of natal.points){
  if(!major.has(p.id))continue;
  if(seen.has(p.id)||!Number.isFinite(p.longitude)||p.longitude<0||p.longitude>=360)
   throw Error('Invalid or repeated natal ephemeris body: '+p.id);
  seen.add(p.id);
 }
 if(natal.asc!==null&&(!Number.isFinite(natal.asc)||natal.asc<0||natal.asc>=360))
  throw Error('Invalid natal Ascendant longitude');
 if(natal.mc!==null&&(!Number.isFinite(natal.mc)||natal.mc<0||natal.mc>=360))
  throw Error('Invalid natal Midheaven longitude');
 // Any missing core natal planet changes the very sources and ranking of
 // eight contextual domains, even when a fallback anchor still exists.
 // Unknown birth time intentionally excludes the natal Moon.
 const required=[...major].filter(id=>known||id!=='Moon');
 if(required.some(id=>!seen.has(id)))throw Error('Incomplete principal natal ephemeris for contextual gauges');
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
 if(transits.length!==major.size||new Set(transits.map(p=>p.id)).size!==major.size||
  transits.some(p=>!Number.isFinite(p.longitude)||p.longitude<0||p.longitude>=360||!Number.isFinite(p.speed)))
  throw Error('Insufficient principal ephemeris positions or invalid coordinates for contextual gauges');
 const climate=skyClimate(current);
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
  const skyAdjustment=climate.adjustments[category];
  const score=contextScore(contributors,skyAdjustment);
  const scope:SkyScope=primary.orb<=2.2?'tight':primary.orb<=8?'wide':'background';
  domains[category]={category,score,scope,primary,contacts:contributors.length,contributors,skyAdjustment};
  scores[category]=score;
 }
 return {scores,domains,climate};
}
const arNames:Record<string,string>={Sun:'الشمس',Moon:'القمر',Mercury:'عطارد',Venus:'الزهرة',Mars:'المريخ',Jupiter:'المشتري',Saturn:'زحل',Uranus:'أورانوس',Neptune:'نبتون',Pluto:'بلوتو',Ascendant:'الطالع',MC:'وسط السماء'};
const arAngles:Record<number,string>={0:'اقتران',60:'تسديس',90:'تربيع',120:'تثليث',180:'مقابلة'};
const enAngles:Record<number,string>={0:'conjunct',60:'sextile',90:'square',120:'trine',180:'opposite'};
/** Select only a contact actually used by the contextual score, never a
 * nearby-but-zero-weight primary or a contact from an unrelated category.
 * The same selection drives the explanation and its duplicate identity. */
function gaugeContribution(context:SkyContext,sources:readonly Category[]){
 const rows=[...new Set(sources)].map(c=>context.domains[c]).filter((x):x is SkyDomain=>Boolean(x));
 const score=Math.round(rows.reduce((sum,row)=>sum+row.score,0)/(rows.length||1));
 const direction=Math.sign(score-50);
 const ranked=rows.flatMap(row=>row.contributors
  .filter(p=>Number.isFinite(p.strength)&&p.strength>0&&Number.isFinite(p.tone)&&p.tone!==0)
  .map(p=>({row,p,impact:Math.abs(p.tone*p.strength)})))
  // For a negative composite, explain a real negative contributor first
  // rather than leading with a positive aspect and contradicting the gauge.
  // Only prefer aligned evidence that genuinely contributes to a source.
  .sort((a,b)=>{
   const aligned=(x:typeof a)=>direction===0?0:Number(Math.sign(x.p.tone)===direction);
   return aligned(b)-aligned(a)||b.impact-a.impact||a.p.orb-b.p.orb||
    a.row.category.localeCompare(b.row.category)||a.p.transit.localeCompare(b.p.transit)||
    a.p.natal.localeCompare(b.p.natal);
  });
 return {rows,leading:ranked[0]??null,score};
}
/** A brief audit trail showing a genuine contributor to a computed index. */
export function contextGaugeBasis(context:SkyContext,sources:readonly Category[],english=false):string{
 const {rows,leading}=gaugeContribution(context,sources);
 if(!rows.length)return english?'No calculated sky context':'ماكو سياق سماوي محسوب';
 if(!leading){
  const shifted=rows.some(row=>row.skyAdjustment!==0);
  return shifted?(english?'No contributing natal contact within 8° · current-sky adjustment':'ماكو اتصال ميلادي مؤثر ضمن 8° · تعديل من السماء الحالية'):
   (english?'No contributing natal contact within 8° · neutral baseline':'ماكو اتصال ميلادي مؤثر ضمن 8° · مؤشر محايد');
 }
 const {p}=leading;
 const name=english?p.transit:(arNames[p.transit]??p.transit);
 const target=english?p.natal:(arNames[p.natal]??p.natal);
 const relation=english?enAngles[p.angle]:arAngles[p.angle];
 const prefix=p.orb<=2.2?(english?'Close contributing aspect':'اتصال قريب مؤثر'):(english?'Wide contributing aspect':'اتصال واسع مؤثر');
 return prefix+' · '+name+' '+relation+' '+(english?'natal '+target:target+' بخارطة ميلادك')+' · '+p.orb.toFixed(1)+'°';
}
/** The identity belongs to the same contributor described by the reading. */
export function contextGaugeContactKey(context:SkyContext,sources:readonly Category[]):string|null{
 const {leading}=gaugeContribution(context,sources);
 if(!leading)return null;
 const {p}=leading;
 return p.transit+':'+p.natal+':'+p.angle;
}
/** An interpretation of a real score contributor, not the nearest irrelevant
 * angular distance. The sky adjustment remains a distinct calculation layer. */
export function contextGaugeNarrative(context:SkyContext,sources:readonly Category[],english=false):string{
 const {rows,leading}=gaugeContribution(context,sources);
 if(!rows.length)return english?'No usable planetary positions.':'ماكو مواقع كوكبية كافية.';
 if(!leading){
  return rows.some(row=>row.skyAdjustment!==0)?
   (english?'No contributing natal aspect within 8°. Current-sky contacts account for the adjustment to these categories.':
    'ماكو اتصال ميلادي مؤثر ضمن 8°. اتصالات السماء الحالية داخلة بتعديل درجة واحد أو أكثر من هالمجالات.'):
   (english?'No contributing natal aspect within 8°. These categories use a neutral baseline, not a forecast.':
    'ماكو اتصال ميلادي مؤثر ضمن 8°. هالمجالات على خط الأساس المحايد، مو توقع لنتيجة.');
 }
 const {row,p}=leading;
 const name=english?p.transit:(arNames[p.transit]??p.transit);
 const target=english?p.natal:(arNames[p.natal]??p.natal);
 const aspectName=english?enAngles[p.angle]:arAngles[p.angle];
 const specific=skyAspectExplanation(p.transit,p.natal,p.angle,english);
 const overall=Math.round(rows.reduce((sum,r)=>sum+r.score,0)/rows.length);
 // If all actual natal contributors oppose the composite direction, say so
 // explicitly instead of presenting a supportive aspect as an explanation
 // for a weak GO result (or vice versa).
 const contrast=Math.sign(overall-50)!==0&&Math.sign(p.tone)!==Math.sign(overall-50)?
  (english?' This contact does not explain the overall score direction; the other source indices or sky adjustments outweigh it.':
   ' هذا الاتصال وحده ما يفسّر اتجاه الدرجة؛ بقية المجالات أو تعديلات السماء رجّحت المحصلة.'):'';
 const extra=row.skyAdjustment!==0?(english?
  ' The current-sky adjustment is a separate '+(row.skyAdjustment>0?'+':'')+row.skyAdjustment+'-point term in this category.':
  ' تعديل السماء الحالية بهالمجال مكوّن منفصل: '+(row.skyAdjustment>0?'+':'')+row.skyAdjustment+' نقطة.'):'';
 return english?
  name+' '+aspectName+' natal '+target+' ('+p.orb.toFixed(1)+'°): '+specific+extra+contrast:
  name+' '+aspectName+' '+target+' بخارطة ميلادك (فارق '+p.orb.toFixed(1)+'°): '+specific+extra+contrast;
}
