import {categories,category as categorize,rankedFactors,supportive,difficult,type Evidence,type Signal,type Category} from './math.ts';
import {reviewEvidence} from './decision.ts';
export type Resolution='balanced'|'support'|'caution'|'neutral'|'insufficient';
export type DecisionDetail={category:Category;resolution:Resolution;score:number|null;support:number;challenge:number;supportFactor:Evidence|null;challengeFactor:Evidence|null;strongest:Evidence|null;mixed:boolean;quality:'multiple'|'single'|'none';sourceCount:number;sensitive:boolean;notes:readonly string[]};
/** Shared decision rubric for homepage, evidence page and AI narrative packet.
 * Never treats a symbolic index as a predicted probability or infers consent.
 */
export function resolveDecisions(factors:readonly Evidence[],signals:readonly Signal[]):DecisionDetail[]{
 return categories.map(category=>{
  const valid=rankedFactors(factors.filter(e=>categorize(e)===category));
  const review=reviewEvidence(valid);
  const pos=valid.filter(supportive),neg=valid.filter(difficult);
  const support=pos.reduce((a,e)=>a+e.weight,0),challenge=neg.reduce((a,e)=>a+e.weight,0);
  const mixed=support>0&&challenge>0;
  const total=support+challenge;
  const sufficient=!!valid.length&&valid[0].weight>=.30;
  const resolution:Resolution=!sufficient?'insufficient':mixed&&Math.min(support,challenge)/Math.max(total,1e-10)>=.18?'balanced':support>challenge*1.35?'support':challenge>support*1.35?'caution':'neutral';
  const present=signals.find(x=>x.category===category);
  const notes:string[]=[];
  if(mixed)notes.push('opposing-factors');
  if(!present)notes.push('no-strong-domain-signal');
  if(valid.length<2)notes.push('limited-evidence');
  if(valid.some(e=>e.applying))notes.push('approaching');
  if(valid.some(e=>!e.applying))notes.push('separating');
  if(review.sensitive)notes.push('source-sensitive');
  return {category,resolution,score:sufficient?(present?.score??null):null,support:Number(support.toFixed(3)),challenge:Number(challenge.toFixed(3)),
   supportFactor:sufficient?(pos[0]??null):null,challengeFactor:sufficient?(neg[0]??null):null,strongest:sufficient?(valid[0]??null):null,mixed,quality:!sufficient?'none':valid.length>=2?'multiple':'single',sourceCount:review.sourceCount,sensitive:sufficient&&review.sensitive,notes};
 });
}
/** Never manufacture an exact peak time from guessed constant speeds; only
 * pass through an already-computed numerical exact timestamp, if present.
 */
export function trustworthyPeak(factor:Evidence|null,asOf:Date):Date|null{
 if(!factor||!factor.applying||!factor.exact)return null;
 const parsed=new Date(factor.exact);
 if(!Number.isFinite(+parsed)||+parsed<+asOf||+parsed>+asOf+31*86400000)return null;
 return parsed;
}
const domainSteps:Record<Category,{ar:string;en:string}>={
 overview:{ar:'اختار أهم شغلة اليوم وحدد أول خطوة إلها.',en:'Choose today’s main priority and its first step.'},
 career:{ar:'حدد المطلوب بالشغل وموعده قبل ما تلتزم.',en:'Clarify the work, owner and deadline before committing.'},
 love:{ar:'إذا ببالك شخص، احچي بوضوح وخلي له مجال يرد.',en:'If someone is on your mind, speak clearly and leave room for their response.'},
 communication:{ar:'اسأل عن النقطة الغامضة قبل ما تفسّر الرد.',en:'Ask about what is unclear before interpreting the reply.'},
 energy:{ar:'ابدأ بمهمة واحدة تگدر تكملها حسب طاقتك الفعلية.',en:'Start one manageable task that fits your actual energy.'},
 emotions:{ar:'سمّ اللي مضايقك وخذ وقتك قبل ما ترد.',en:'Name what is bothering you and take time before responding.'},
 recovery:{ar:'خصص وقت للراحة وخفف مهمة مو مستعجلة.',en:'Make time for rest and postpone one non-urgent task.'},
 timing:{ar:'أكد الموعد وجهّز بديل إذا يعتمد على غيرك.',en:'Confirm the time and prepare a backup if it depends on someone else.'}
};
export function decisionExplanation(item:DecisionDetail,arabic:boolean){
 const hasSupport=item.supportFactor!==null,hasChallenge=item.challengeFactor!==null;
 if(item.quality==='none')return arabic?'هسّه ماكو اتصال قوي بهالمجال حتى نرجّح اتجاه معيّن. شنو اللي تعرفه عن الموقف نفسه؟':'No relevant calculated contact here; rely on real-world information before deciding.';
 if(item.sensitive)return (item.mixed?(arabic?'أكو إشارات داعمة ومعاكسة بنفس الوقت. ':'Supporting and challenging contacts coexist. '):'')+(arabic?'إذا نشيل اتصالات كوكب واحد، تتغيّر الخلاصة. ':'Removing one transiting body changes the balance. ')+(arabic?domainSteps[item.category].ar:domainSteps[item.category].en);
 if(hasSupport&&hasChallenge)return (arabic?'بهالموضوع أكو إشارات داعمة ومعاكسة. ':'Supporting and challenging contacts coexist. ')+(arabic?domainSteps[item.category].ar:domainSteps[item.category].en);
 if(hasChallenge)return (arabic?'هنا الأفضل تتأنّى. ':'Take this slowly. ')+(arabic?domainSteps[item.category].ar:domainSteps[item.category].en);
 if(hasSupport)return (arabic?'تگدر تبدي بخطوة بسيطة. ':'A small first step may be useful. ')+(arabic?domainSteps[item.category].ar:domainSteps[item.category].en);
 return arabic?'أكو اتصالات، بس ما يطلع منها اتجاه واضح. شوف شنو يناسب ظروفك اليوم.':'Calculated contacts exist but their direction is unclear; do not rely on the number alone.';
}
