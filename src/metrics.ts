import type {Category} from './math.ts';
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
export type GoDomain='work'|'social'|'relationships'|'travel';
export type GoDecision={domain:GoDomain;value:number;state:'go'|'check'|'hold';drivers:MetricName[]};
export function goModes(metrics:readonly MetricResult[]):GoDecision[]{
 const values=new Map(metrics.map(v=>[v.id,v.value]));
 const configurations:[GoDomain,MetricName[]][]=[
  ['work',['career','focus','timing']],
  ['social',['social','communication','energy']],
  ['relationships',['love','romance','communication']],
  ['travel',['travel','timing','focus']]
 ];
 return configurations.map(([domain,drivers])=>{
  const list=drivers.map(k=>values.get(k));
  if(list.some(v=>v===undefined))throw Error('Incomplete indicator set');
  const value=Math.round(list.reduce<number>((a,b)=>a+(b??0),0)/list.length);
  return {domain,value,state:value>=68?'go':value>=45?'check':'hold',drivers};
 });
}
