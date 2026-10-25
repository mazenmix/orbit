import type {Category} from './math.ts';
import type {DecisionDetail} from './decisionUltra.ts';
/** Transparent derived SYMBOLIC indicators. Not 23 independently measured outcomes. */
type Inputs=Record<Category,number>;
export type MetricName='overview'|'career'|'focus'|'productivity'|'money'|'communication'|'social'|'reputation'|'love'|'romance'|'attraction'|'chemistry'|'emotional'|'calm'|'energy'|'motivation'|'recovery'|'sleep'|'timing'|'travel'|'adventure'|'caution'|'luck'|'sexuality'|'desire'|'nightlife'|'dating'|'newpeople'|'risk';
export type MetricSpec={id:MetricName;ar:string;en:string;source:Category[];inverted?:boolean};
export const metricSpecs:readonly MetricSpec[]=[
 {id:'overview',ar:'الصورة العامة',en:'Overview',source:['overview','timing','energy','emotions']},
 {id:'career',ar:'العمل',en:'Career',source:['career']},
 {id:'focus',ar:'التركيز',en:'Focus',source:['career','communication','recovery']},
 {id:'productivity',ar:'الإنتاجية',en:'Productivity',source:['career','energy','timing']},
 {id:'money',ar:'إدارة المال',en:'Money planning',source:['career','timing']},
 {id:'communication',ar:'التواصل',en:'Communication',source:['communication']},
 {id:'social',ar:'التواصل الاجتماعي',en:'Social interaction',source:['love','communication']},
 {id:'reputation',ar:'الحضور المهني',en:'Professional presence',source:['career','communication']},
 {id:'love',ar:'العلاقات',en:'Relationships',source:['love']},
 {id:'romance',ar:'الرومانسية',en:'Romance',source:['love','emotions']},
 {id:'attraction',ar:'الجاذبية',en:'Attraction',source:['love','energy']},
 {id:'chemistry',ar:'الانسجام',en:'Chemistry',source:['love','communication','energy']},
 {id:'emotional',ar:'المزاج',en:'Mood',source:['emotions']},
 {id:'calm',ar:'الهدوء',en:'Calm',source:['emotions','recovery']},
 {id:'energy',ar:'الحيوية',en:'Energy',source:['energy']},
 {id:'motivation',ar:'الدافعية',en:'Motivation',source:['energy','career']},
 {id:'recovery',ar:'الاستعادة',en:'Recovery',source:['recovery']},
 {id:'sleep',ar:'وقت الراحة',en:'Rest timing',source:['recovery','emotions']},
 {id:'timing',ar:'التوقيت',en:'Timing',source:['timing']},
 {id:'travel',ar:'التنقل',en:'Travel planning',source:['timing','communication','energy']},
 {id:'adventure',ar:'التجربة',en:'Exploration',source:['timing','energy','love']},
 {id:'caution',ar:'مؤشر التريث',en:'Caution index',source:['timing','emotions','energy'],inverted:true},
 {id:'luck',ar:'الحظ الرمزي',en:'Symbolic luck',source:['overview','timing','love']},
 {id:'sexuality',ar:'الجنس · القرب',en:'Intimacy timing',source:['love','energy','communication']},
 {id:'desire',ar:'الشهوة · الدافع',en:'Desire (symbolic)',source:['energy','love','emotions']},
 {id:'nightlife',ar:'طلعة ليلية',en:'Night-out planning',source:['energy','timing','recovery']},
 {id:'dating',ar:'لقاء بنات · تعارف',en:'Dating initiative',source:['love','communication','timing']},
 {id:'newpeople',ar:'ناس جدد',en:'Meeting new people',source:['communication','love','energy']},
 {id:'risk',ar:'الحذر العام · رمزي',en:'General caution (symbolic)',source:['timing','emotions','recovery'],inverted:true}
];
export type MetricResult=MetricSpec & {value:number;formula:string};
export function derivedMetrics(input:Inputs):MetricResult[]{
 return metricSpecs.map(spec=>{
  const values=spec.source.map(c=>input[c]);
  if(!values.every(v=>Number.isFinite(v)&&v>=1&&v<=99))throw Error('Invalid symbolic input');
  const average=Math.round(values.reduce((a,b)=>a+b,0)/values.length);
  return {...spec,value:spec.inverted?100-average:average,formula:(spec.inverted?'100 − ':'')+'avg('+spec.source.join(', ')+')'};
 });
}
/** Disclosure of evidence coverage: values blended with a default 50 are not
 * supportable personalized indicator scores. A domain must have a calculated
 * source signal for EACH of the metric's underlying categories. This does
 * not assess empirical predictive validity of astrology. */
export type MetricCoverage='complete'|'partial'|'none';
export function metricCoverage(metric:Pick<MetricSpec,'source'>,signals:readonly {category:Category}[]):MetricCoverage{
 const sources=[...new Set(metric.source)];
 if(!sources.length)return 'none';
 const supported=new Set(signals.map(x=>x.category));
 const present=sources.filter(x=>supported.has(x)).length;
 return present===0?'none':present===sources.length?'complete':'partial';
}
export type GoDomain='work'|'social'|'relationships'|'travel';
export type GoDecision={domain:GoDomain;value:number;state:'go'|'check'|'hold';drivers:MetricName[]};
export type GoReview={state:GoDecision['state'];sourceCategories:Category[];complete:boolean;mixed:boolean;sensitive:boolean;strongest:DecisionDetail['strongest'];supportFactor:DecisionDetail['supportFactor'];challengeFactor:DecisionDetail['challengeFactor']};
/** Several derived metrics can reuse the same source category. Inspect each
 * actual category once and never authorize GO from missing or unstable evidence. */
export function reviewGoMode(mode:GoDecision,metrics:readonly MetricResult[],decisions:readonly DecisionDetail[]):GoReview{
 const sourceCategories=[...new Set(mode.drivers.flatMap(id=>{
  const metric=metrics.find(m=>m.id===id);
  if(!metric)throw Error('Missing Go Mode driver');
  return metric.source;
 }))];
 const relevant=sourceCategories.map(c=>decisions.find(d=>d.category===c));
 const active=relevant.filter((d):d is DecisionDetail=>!!d&&d.quality!=='none');
 const complete=active.length===sourceCategories.length,sensitive=active.some(d=>d.sensitive);
 const strongest=<K extends 'strongest'|'supportFactor'|'challengeFactor'>(key:K)=>active.flatMap(d=>d[key]?[d[key]!]:[]).sort((a,b)=>b.weight-a.weight||a.orb-b.orb)[0]??null;
 const supportFactor=strongest('supportFactor'),challengeFactor=strongest('challengeFactor'),mixed=!!supportFactor&&!!challengeFactor;
 const state=!active.length?'check':mode.state==='go'&&(!complete||mixed||sensitive||active.some(d=>d.resolution==='caution'))?'check':mode.state;
 return {state,sourceCategories,complete,mixed,sensitive,strongest:strongest('strongest'),supportFactor,challengeFactor};
}
/** Each source category contributes once, even when several Go Mode drivers
 * are derived from it. Previous nested means silently counted shared inputs
 * multiple times (for example, career in both Career and Focus). */
export function goModes(metrics:readonly MetricResult[]):GoDecision[]{
 const byId=new Map(metrics.map(m=>[m.id,m]));
 if(byId.size!==metrics.length)throw Error('Repeated Go Mode indicator');
 const direct=new Map<Category,number>();
 for(const metric of metrics){
  if(metric.source.length!==1||metric.inverted)continue;
  const category=metric.source[0],previous=direct.get(category);
  if(!Number.isFinite(metric.value)||metric.value<1||metric.value>99)throw Error('Invalid direct category index');
  if(previous!==undefined&&previous!==metric.value)throw Error('Conflicting direct category indices');
  direct.set(category,metric.value);
 }
 const configurations:[GoDomain,MetricName[]][]=[
  ['work',['career','focus','timing']],
  ['social',['social','communication','energy']],
  ['relationships',['love','romance','communication']],
  ['travel',['travel','timing','focus']]
 ];
 return configurations.map(([domain,drivers])=>{
  const sources=[...new Set(drivers.flatMap(id=>{
   const metric=byId.get(id);
   if(!metric||!Number.isFinite(metric.value)||metric.value<1||metric.value>99)throw Error('Incomplete or invalid indicator set');
   return metric.source;
  }))];
  const list=sources.map(c=>direct.get(c));
  if(list.some(v=>v===undefined||!Number.isFinite(v)||v<1||v>99))throw Error('Incomplete or invalid source category indices');
  const value=Math.round(list.reduce<number>((a,b)=>a+(b??0),0)/list.length);
  return {domain,value,state:value>=68?'go':value>=45?'check':'hold',drivers};
 });
}
