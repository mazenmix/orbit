import type {MetricName,MetricResult} from './metrics.ts';

/** The twelve indicators chosen for travel in the Philippines.
 * Order and groupings are editorial priorities, not separate observations.
 * Values are read exclusively from the existing derivedMetrics calculator.
 */
export type TravelMetricGroup={
 id:'social'|'night'|'movement';
 titleAr:string;titleEn:string;descriptionAr:string;descriptionEn:string;
 ids:readonly MetricName[];
};
export const travelMetricGroups:readonly TravelMetricGroup[]=[
 {
  id:'social',titleAr:'التعارف والمواعيد',titleEn:'Meeting people & dating',
  descriptionAr:'راجعها قبل ما تبادر بالتعارف أو ترتب موعداً. خلي تجاوب الشخص الحقيقي وراحته أساس قرارك.',
  descriptionEn:'Review before meeting someone or planning a date. Their real interest and comfort matter most.',
  ids:['dating','newpeople','social','attraction','romance','chemistry']
 },
 {
  id:'night',titleAr:'الجنس والسهر',titleEn:'Intimacy & nightlife',
  descriptionAr:'مؤشرات رمزية للسهر والقرب. ما تقيس رغبة الطرف الثاني أو موافقته.',
  descriptionEn:'Symbolic prompts for nights out and intimacy, never a measure of another person’s desire or consent.',
  ids:['sexuality','desire','nightlife']
 },
 {
  id:'movement',titleAr:'التنقل والراحة والحذر',titleEn:'Getting around, rest & caution',
  descriptionAr:'قبل السفر بين المدن أو الرجعة المتأخرة، راجع خطط النقل وأمان المكان وراحتك الحقيقية.',
  descriptionEn:'Before city transfers or late returns, check real transport, neighborhood safety and your rest.',
  ids:['travel','risk','sleep']
 }
] as const;

export type TravelMetricRow={id:MetricName;metric:MetricResult};
export function travelMetricsByGroup(metrics:readonly MetricResult[]){
 const byId=new Map(metrics.map(m=>[m.id,m]));
 const all=new Set<MetricName>();
 return travelMetricGroups.map(group=>({
  ...group,
  rows:group.ids.map(id=>{
   if(all.has(id))throw new Error('Repeated Travel Mode indicator '+id);
   all.add(id);
   const metric=byId.get(id);
   if(!metric)throw new Error('Missing calculated Travel Mode indicator '+id);
   if(!Number.isFinite(metric.value)||metric.value<1||metric.value>99)throw new Error('Invalid Travel Mode index '+id);
   return {id,metric};
  })
 }));
}


/** All Travel Mode indices have ONE direction: 99 is more favorable and
 * 1 is less favorable. In particular, 'risk' is readiness for caution,
 * never a prediction of danger or a reverse-coded hazard percentage.
 * Readings share the actual ephemeris-based source scores while supplying
 * activity-specific interpretations instead of repeating one generic aspect.
 */
import type {Category} from './math.ts';
import type {SkyContext,SkyContact} from './skyContext.ts';

export type TravelCardId='dating'|'newpeople'|'social'|'attraction'|'romance'|'chemistry'|
 'sexuality'|'desire'|'nightlife'|'travel'|'risk'|'sleep';
type Pair=readonly [string,string];
type TravelStory={low:Pair;mid:Pair;high:Pair};
const travelStories:Record<TravelCardId,TravelStory>={
 dating:{
  low:['المبادرة هسه تقييمها ضعيف؛ إذا تراسل أحد خلي كلامك خفيف وتقبّل عدم التجاوب.','The timing index is low for initiating a date; keep any message light and respect a lack of response.'],
  mid:['تگدر تبادر بتعارف بسيط، بس لا تعتبر التوقيت دليل على اهتمام الطرف الثاني.','A simple introduction is reasonable; timing does not establish interest from the other person.'],
  high:['المؤشر داعم للمبادرة اللطيفة؛ اطلب موعداً واضحاً وخلي القرار متبادل.','The index favors a gentle initiative; propose a clear plan and let the other person choose freely.']
 },
 newpeople:{
  low:['لا تضغط على نفسك حتى توسّع معارفك؛ اختار مكان هادئ وتواصل طبيعي.','Do not force new connections; choose an easy setting and keep contact natural.'],
  mid:['الوقت متوسط للتعرف على ناس جدد؛ نشاط اجتماعي صغير أنسب من توقّعات كبيرة.','A moderate time for meeting new people; prefer a small social activity over high expectations.'],
  high:['مؤشر الانفتاح الاجتماعي مرتفع؛ شارك بنشاط واترك للمعرفة مجال تتطور.','The social-openness index is high; join an activity and let contacts develop naturally.']
 },
 social:{
  low:['التواصل مو بأفضل توقيت حسب المؤشر؛ وضّح كلامك ولا تستنتج النيات بسرعة.','The social index is low; communicate clearly and avoid reading intentions into replies.'],
  mid:['التواصل متوسط؛ سؤال واضح واستماع فعلي أحسن من مراسلات كثيرة.','Social contact is mixed; one clear question and active listening beat excessive messaging.'],
  high:['المؤشر ملائم للمحادثات؛ بادر، استمع، وخلي التفاعل الحقيقي يحسم.','The index supports conversation; initiate, listen, and follow the actual response.']
 },
 attraction:{
  low:['مؤشر الحضور منخفض؛ لا تعتبره حكماً على شكلك، اهتم براحتك وثقتك.','A low personal-presence index is not a judgment of appearance; focus on comfort and confidence.'],
  mid:['الحضور متوسط؛ اختار أسلوب ولبس ترتاح بيهن وخلّ الانطباع يتكوّن طبيعياً.','A moderate presence index; dress comfortably and let the impression form naturally.'],
  high:['المؤشر ملائم لإظهار حضورك؛ الثقة والاحترام أهم من محاولة لفت النظر بالقوة.','The presence index is favorable; confidence and respect matter more than forcing attention.']
 },
 romance:{
  low:['التوقيت العاطفي مو قوي؛ لا تستعجل تعبير كبير أو وعد يصعب تنفيذه.','Romantic timing is weak; avoid rushing an emotional declaration or a promise.'],
  mid:['الرومانسية بمستوى متوسط؛ لفتة صغيرة وصادقة أفضل من التوقعات المبالغ بيها.','Romantic timing is moderate; a small sincere gesture beats oversized expectations.'],
  high:['القراءة داعمة للتقارب اللطيف؛ عبّر عن اهتمامك بدون ما تفترض مشاعر الثاني.','The index supports gentle affection; express interest without assuming it is mutual.']
 },
 chemistry:{
  low:['الانسجام بالتواصل يحتاج عناية؛ احچي بصراحة وابتعد عن اختبار ردود الطرف الثاني.','The interaction index is low; be direct and avoid testing another person’s reactions.'],
  mid:['الانسجام متوسط؛ راقب التفاهم الفعلي، مو مجرد انجذاب أو انطباع أول.','The interaction index is moderate; look for actual understanding, not just first impressions.'],
  high:['التوقيت يدعم حواراً مريحاً؛ الانسجام الحقيقي يثبت بالاحترام والتجاوب المتبادل.','The index supports easy conversation; actual chemistry depends on reciprocal respect and response.']
 },
 sexuality:{
  low:['مؤشر توقيت القرب منخفض؛ لا تربطه برغبة شخص آخر أو موافقته.','Intimacy timing is low; it says nothing about another person’s desire or consent.'],
  mid:['توقيت القرب متوسط؛ خَلّ الوضوح والحدود والقبول المتبادل أساس أي خطوة.','Intimacy timing is moderate; clarity, boundaries and mutual consent remain essential.'],
  high:['توقيت القرب مرتفع رمزياً؛ التفاهم والرضا المتبادل أهم من أي رقم.','The intimacy timing index is high; mutual understanding and consent matter more than the number.']
 },
 desire:{
  low:['مؤشر الاندفاع منخفض؛ لا تضغط على نفسك، واتبع إحساسك الحقيقي بالراحة.','The drive index is low; do not force yourself and follow your actual comfort level.'],
  mid:['الدافع بمستوى متوسط؛ خَلّ قرارك هادئ وواضح بدون تسرّع.','The drive index is moderate; act thoughtfully rather than impulsively.'],
  high:['مؤشر الدافع مرتفع؛ وجّه الحماس باختيار واعٍ واحترام الحدود.','The drive index is high; channel enthusiasm into considered choices and clear boundaries.']
 },
 nightlife:{
  low:['الطلعة الليلية تقييمها منخفض؛ إذا تطلع اختار مشوار خفيف وخطّة رجعة مضمونة.','Night-out timing is low; if you go out, keep plans simple with a reliable way home.'],
  mid:['الطلعة الليلية متوسطة؛ تأكد من المكان ووقت الرجعة قبل السهرة.','Night-out timing is moderate; check the venue and your return arrangements.'],
  high:['المؤشر ملائم لطلعة ليلية؛ استمتع وخلي النقل ووقت الرجعة مرتّبين.','Night-out timing is favorable; enjoy it while keeping transport and return plans in order.']
 },
 travel:{
  low:['مؤشر التنقّل ضعيف؛ راجع الحجز والطريق وخلي وقت احتياطي أو خطة بديلة.','Travel planning is low; verify bookings and routes, with extra time or a fallback.'],
  mid:['التنقّل بمستوى متوسط؛ راجع المواعيد والعنوان قبل التحرك.','Travel timing is moderate; double-check schedules and addresses before leaving.'],
  high:['المؤشر ملائم للتنقّل؛ ثبّت الموعد والطريق واترك هامش بسيط للتأخير.','Travel timing is favorable; confirm the route and allow some delay buffer.']
 },
 risk:{
  low:['درجة الاستعداد والحذر منخفضة؛ دقّق النقل والمكان وتجنّب القرارات المستعجلة.','Caution readiness is low; verify transport and venue conditions and avoid rushed decisions.'],
  mid:['الاستعداد والحذر متوسط؛ افحص معلومات المكان والطريق قبل اتخاذ قرار.','Caution readiness is moderate; check actual location and route information first.'],
  high:['مؤشر الاستعداد والحذر مرتفع؛ حافظ على الاحتياطات العادية بدون افتراض انعدام المخاطر.','Caution readiness is high; keep normal precautions and do not assume any setting is risk-free.']
 },
 sleep:{
  low:['مؤشر توقيت الراحة منخفض، بس هذا مو سبب لتأجيل النوم؛ إذا تعبان ارتاح.','The rest-timing index is low, but never a reason to postpone sleep; rest when tired.'],
  mid:['وقت الراحة تقييمه متوسط؛ خصص وقتاً هادئاً وقلل المنبهات إذا تريد تنام.','Rest timing is moderate; allow a quiet wind-down and limit stimulation before sleep.'],
  high:['مؤشر توقيت الراحة مرتفع؛ استثمر فرصة الهدوء ونظّم نومك.','Rest timing is high; make use of a quiet window and protect your sleep routine.']
 }
};
const sourceLabels:Record<Category,Pair>={
 overview:['الصورة العامة','overview'],career:['العمل','work'],love:['العلاقات','relationships'],
 communication:['التواصل','communication'],energy:['النشاط','energy'],emotions:['المزاج','emotions'],
 recovery:['الراحة','recovery'],timing:['التوقيت','timing']
};
const nameAr:Record<string,string>={
 Sun:'الشمس',Moon:'القمر',Mercury:'عطارد',Venus:'الزهرة',Mars:'المريخ',
 Jupiter:'المشتري',Saturn:'زحل',Uranus:'أورانوس',Neptune:'نبتون',Pluto:'بلوتو',
 Ascendant:'الطالع',MC:'وسط السماء'
};
const angleAr:Record<number,string>={0:'اقتران',60:'تسديس',90:'تربيع',120:'تثليث',180:'مقابلة'};
const angleEn:Record<number,string>={0:'conjunction',60:'sextile',90:'square',120:'trine',180:'opposition'};
export type TravelCardReading={summary:string;basis:string;detail:string};

/** A transparent, testable explanation for the exact sources of each card.
 * The leading contact is restricted to that card's source categories, not
 * whichever unrelated aspect happens to have the tightest orb on the page.
 */
export function travelMetricReading(metric:MetricResult,sky:SkyContext,english=false):TravelCardReading{
 if(!(metric.id in travelStories))throw Error('Unsupported Travel Mode reading '+metric.id);
 if(metric.inverted)throw Error('Travel Mode indices must be higher-is-better');
 const source=[...new Set(metric.source)];
 if(!source.length)throw Error('Travel Mode source categories missing');
 const entries=source.map(category=>{
  const domain=sky.domains[category],score=sky.scores[category];
  if(!domain||!Number.isFinite(score)||score<1||score>99||score!==domain.score)throw Error('Invalid contextual Travel Mode source '+category);
  return {category,score,contacts:domain.contributors};
 });
 const recomputed=Math.round(entries.reduce((sum,e)=>sum+e.score,0)/entries.length);
 if(recomputed!==metric.value)throw Error('Travel Mode score mismatches underlying sky data');
 const band=metric.value<38?'low':metric.value>=74?'high':'mid';
 const pair=travelStories[metric.id as TravelCardId][band];
 const basis=entries.map(e=>sourceLabels[e.category][english?1:0]+' '+e.score).join(' · ');
 const ranked=[...entries].sort((a,b)=>Math.abs(b.score-50)-Math.abs(a.score-50)||source.indexOf(a.category)-source.indexOf(b.category));
 const active=ranked.find(e=>e.contacts.some(c=>c.strength>0&&c.tone!==0));
 let evidence='';
 if(active){
  const sign=Math.sign(active.score-50);
  const contributions=[...active.contacts].filter(c=>c.strength>0&&c.tone!==0).sort((a,b)=>
   Number(Math.sign(b.tone)===sign)-Number(Math.sign(a.tone)===sign)||
   Math.abs(b.tone*b.strength)-Math.abs(a.tone*a.strength)||a.orb-b.orb);
  const contact=contributions[0] as SkyContact;
  const body=english?contact.transit:(nameAr[contact.transit]??contact.transit);
  const natal=english?contact.natal:(nameAr[contact.natal]??contact.natal);
  const relation=english?angleEn[contact.angle]:angleAr[contact.angle];
  const categoryName=sourceLabels[active.category][english?1:0];
  evidence=english?
   'Leading calculated contact in '+categoryName+': '+body+' '+relation+' natal '+natal+' (orb '+contact.orb.toFixed(1)+'°).':
   'أبرز اتصال محسوب بمجال '+categoryName+': '+body+' '+relation+' '+natal+' (فارق '+contact.orb.toFixed(1)+'°).';
 }else{
  evidence=english?'No contributing aspect within the 8° scope; neutral 50 values are not forecasts.':
   'ماكو اتصال مؤثر ضمن نطاق 8°؛ قيمة 50 حيادية وما تعتبر توقع.';
 }
 const riskNote=metric.id==='risk'?(english?
  'This is a timing-readiness score, not a real-world safety or crime-risk assessment.':
  'هذا تقييم ملاءمة توقيت، مو قياس لخطر فعلي أو أمان منطقة.'):
  metric.id==='sleep'?(english?'Sleep need is decided by your body and schedule, not this score.':
   'حاجة جسمك للنوم أهم من هذا التقييم.'):
  metric.id==='sexuality'||metric.id==='chemistry'?(english?'It never measures another person’s attraction or consent.':
   'الدرجة ما تقيس انجذاب أو موافقة شخص ثاني.'):'';
 const detail=(english?'Source indices: ':'المجالات الداخلة بالحساب: ')+basis+'. '+evidence+(riskNote?' '+riskNote:'');
 return {summary:pair[english?1:0],basis,detail};
}
