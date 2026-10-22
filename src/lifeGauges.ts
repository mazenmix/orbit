import type {Category} from './math.ts';
import type {MetricResult} from './metrics.ts';

type Copy={ar:string;en:string};
type WeightedCategory={category:Category;weight:number};
export type LifeGauge={id:string;name:Copy;advice:Copy;value:number;source:readonly WeightedCategory[]};
/** Fresh, explicitly symbolic lenses on the eight calculated transit categories.
 * These are weighted summaries, not observed outcomes or success probabilities.
 * They intentionally do not alter the original 29 indicators.
 */
const lifeSpecs:readonly Omit<LifeGauge,'value'>[]=[
 {id:'mental-clarity',name:{ar:'صفاء الذهن',en:'Mental clarity'},advice:{ar:'خصص فترة هادئة لمسألة تحتاج تفكير بدون مقاطعات.',en:'Reserve an uninterrupted block for one complex problem.'},source:[{category:'communication',weight:0.48},{category:'recovery',weight:0.32},{category:'career',weight:0.20}]},
 {id:'decision-discipline',name:{ar:'حسم القرارات',en:'Decision discipline'},advice:{ar:'قارن خيارين بالأدلة، ولا تعتمد على إحساس التوقيت وحده.',en:'Compare two options against evidence instead of relying on timing alone.'},source:[{category:'timing',weight:0.45},{category:'overview',weight:0.30},{category:'emotions',weight:0.25}]},
 {id:'negotiation',name:{ar:'الإقناع والتفاوض',en:'Negotiation'},advice:{ar:'حضّر مطلبك الرئيسي وحدود التنازل قبل النقاش.',en:'Prepare your central request and non-negotiables before the discussion.'},source:[{category:'communication',weight:0.55},{category:'career',weight:0.30},{category:'emotions',weight:0.15}]},
 {id:'emotional-balance',name:{ar:'الاتزان النفسي',en:'Emotional balance'},advice:{ar:'افصل الاستجابة السريعة عن الرد المدروس، خصوصاً بوقت الضغط.',en:'Separate your initial reaction from a considered response under pressure.'},source:[{category:'emotions',weight:0.52},{category:'recovery',weight:0.31},{category:'overview',weight:0.17}]},
 {id:'task-execution',name:{ar:'إنجاز المهام',en:'Task execution'},advice:{ar:'ابدأ بمهمة واحدة محددة، وسوّي مراجعة قصيرة بعد إنجازها.',en:'Complete one clearly scoped task and review the result before switching.'},source:[{category:'career',weight:0.44},{category:'energy',weight:0.35},{category:'timing',weight:0.21}]}
];
export function goLifeGauges(scores:Record<Category,number>):LifeGauge[]{
 return lifeSpecs.map(spec=>{
  const value=spec.source.reduce((sum,part)=>{
   const n=scores[part.category];
   if(!Number.isFinite(n)||n<1||n>99)throw new Error('Invalid calculated life gauge source');
   return sum+n*part.weight;
  },0);
  return {...spec,value:Math.max(1,Math.min(99,Math.round(value)))};
 });
}
/** Practical gauges are explicitly user-verified checklists, NEVER fabricated
 * scores from a nonexistent weather, safety, reservation or finance feed.
 * Values can only reflect completion of items confirmed by the user.
 */
export type TravelCheck={id:string;name:Copy;items:readonly Copy[]};
export const travelChecks:readonly TravelCheck[]=[
 {id:'readiness',name:{ar:'جاهزية السفر',en:'Travel readiness'},items:[
  {ar:'تأكدت من الوثائق والتأشيرة',en:'Documents and visa verified'},
  {ar:'راجعت حجوزات ومواعيد التنقل',en:'Bookings and departure times checked'},
  {ar:'حضّرت الاتصال والخرائط والطاقة',en:'Connectivity, maps and power prepared'}
 ]},
 {id:'weather',name:{ar:'الظروف الخارجية',en:'Outdoor conditions'},items:[
  {ar:'راجعت توقعات الطقس الحديثة',en:'Latest weather forecast checked'},
  {ar:'راجعت تحذيرات الأمطار والعواصف',en:'Rain and storm alerts checked'},
  {ar:'حضّرت خطة بديلة إذا تغير الجو',en:'Backup plan for changing conditions'}
 ]},
 {id:'safety',name:{ar:'سلامة المنطقة',en:'Area safety'},items:[
  {ar:'راجعت التنبيهات الأمنية المحلية',en:'Local safety advisories checked'},
  {ar:'تأكدت من طريق العودة والنقل',en:'Return route and transport confirmed'},
  {ar:'شاركت تفاصيل الرحلة عند الحاجة',en:'Trip details shared with a trusted contact if needed'}
 ]},
 {id:'budget',name:{ar:'ميزانية الرحلة',en:'Trip budget'},items:[
  {ar:'حددت سقف الصرف اليومي',en:'Daily spending limit set'},
  {ar:'راجعت الأسعار والنقل والسكن',en:'Transport, lodging and prices checked'},
  {ar:'خصصت احتياطاً للمفاجآت',en:'Contingency funds reserved'}
 ]}
];
export function travelCompletion(done:readonly boolean[],total:number):number{
 if(total<=0||done.length!==total)throw new Error('Invalid travel checklist');
 return Math.round(done.filter(Boolean).length/total*100);
}
export type ActivityHint={id:string;name:Copy;advice:Copy;value:number};
/** A symbolic activity prompt only. It does not claim real venue availability. */
export function travelActivity(metrics:readonly MetricResult[]):ActivityHint{
 const choices=[
  {id:'social',name:{ar:'لقاء اجتماعي',en:'Meet people'},advice:{ar:'جرّب لقاء خفيف إذا عندك رغبة ووقت مناسب.',en:'Consider a low-pressure social meetup if you feel up to it.'}},
  {id:'adventure',name:{ar:'استكشاف مكان',en:'Explore somewhere'},advice:{ar:'اختَر وجهة مناسبة بعد التأكد من الطقس والنقل.',en:'Pick a destination after checking weather and transport.'}},
  {id:'nightlife',name:{ar:'نشاط مسائي',en:'Evening activity'},advice:{ar:'رتّب طلعة قصيرة مع خطة رجعة آمنة.',en:'Choose a short outing with a safe return plan.'}},
  {id:'sleep',name:{ar:'راحة وتعافي',en:'Rest and recover'},advice:{ar:'خلي الأولوية للراحة وتقليل ضغط الجدول.',en:'Prioritize rest and lower schedule pressure.'}}
 ] as const;
 const byId=new Map(metrics.map(m=>[m.id,m]));
 const ranked=choices.map(c=>({...c,value:byId.get(c.id)?.value})).filter((c):c is typeof c & {value:number}=>Number.isFinite(c.value));
 if(!ranked.length)throw new Error('No calculated activity inputs');
 ranked.sort((a,b)=>b.value-a.value||choices.findIndex(c=>c.id===a.id)-choices.findIndex(c=>c.id===b.id));
 return ranked[0];
}
