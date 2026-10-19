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
export function decisionExplanation(item:DecisionDetail,arabic:boolean){
 const hasSupport=item.supportFactor!==null,hasChallenge=item.challengeFactor!==null;
 if(item.quality==='none')return arabic?'ماكو اتصال محسوب قوي بهذا المجال؛ راجع المعطيات الواقعية قبل اتخاذ قرار.':'No relevant calculated contact here; rely on real-world information before deciding.';
 if(item.sensitive)return (item.mixed?(arabic?'تجتمع إشارات داعمة ومعاكسة. ':'Supporting and challenging contacts coexist. '):'')+(arabic?'الترجيح يتغير إذا استبعدنا اتصالات جرم واحد؛ اعتبره حساساً للعوامل المختارة وجرّب خطوة صغيرة قابلة للمراجعة.':'Removing one transiting body changes the balance; treat this as a sensitive interpretation and test a small reversible step.');
 if(hasSupport&&hasChallenge)return arabic?'تظهر إشارات داعمة ومعاكسة بنفس المجال. الأفضل تجربة خطوة صغيرة ومراجعة رد الفعل، بدون حكم نهائي.':'Supporting and challenging contacts coexist. Try a small reversible step and observe the actual outcome.';
 if(hasChallenge)return arabic?'تظهر زاوية تحتاج تروّي وتدقيق؛ خفف الاندفاع وراجع التفاصيل قبل أي التزام.':'A challenging contact suggests slowing down, checking details, and avoiding irreversible commitments.';
 if(hasSupport)return arabic?'تظهر زاوية رمزية داعمة؛ استثمرها بخطوة محدودة وخلّ النتيجة الواقعية تحسم.':'A supportive contact can be a prompt for a limited test, with the real outcome deciding what follows.';
 return arabic?'الزوايا موجودة لكن مو كلها واضحة الاتجاه؛ لا تعتمد على الرقم وحده.':'Calculated contacts exist but their direction is unclear; do not rely on the number alone.';
}
