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
  low:['مو لازم ترتّب موعد اليوم. إذا أحد ببالك، رسالة خفيفة تكفي.','The timing index is low for initiating a date; keep any message light and respect a lack of response.'],
  mid:['إذا السالفة ماشية بينكم، اسأل عن مكان يحبّه الطرف الثاني وشوف إذا يناسبكم تطلعون.','A simple introduction is reasonable; timing does not establish interest from the other person.'],
  high:['ببالك لقاء؟ اقترح مكان ووقت واضحين وخلّي مجال للطرف الثاني يختار.','The index favors a gentle initiative; propose a clear plan and let the other person choose freely.']
 },
 newpeople:{
  low:['إذا اليوم ودّك بهدوء، مو لازم تتعرّف على أحد. اختار مكان ترتاح بيه.','Do not force new connections; choose an easy setting and keep contact natural.'],
  mid:['نشاط تحبّه يسهّل التعارف. من البداية يصير عندكم شي تحچون عنه.','A moderate time for meeting new people; prefer a small social activity over high expectations.'],
  high:['إذا صادفت جماعة يشاركونك اهتمام، شارك بالحچي. تعارف بسيط يكفي كبداية.','The social-openness index is high; join an activity and let contacts develop naturally.']
 },
 social:{
  low:['إذا حسّيت رسالة تنفهم بطريقتين، اسأل شنو المقصود قبل ما ترد.','The social index is low; communicate clearly and avoid reading intentions into replies.'],
  mid:['افتح سالفة بسؤال واحد يهمّك جوابه، وخذ وقتك تسمع.','Social contact is mixed; one clear question and active listening beat excessive messaging.'],
  high:['عندك سالفة حلوة؟ افتحها وخلّي للي وياك مجال يشاركك الحچي.','The index supports conversation; initiate, listen, and follow the actual response.']
 },
 attraction:{
  low:['الرقم ما يحكم على شكلك. البس شي ترتاح بيه واطلع على طبيعتك.','A low personal-presence index is not a judgment of appearance; focus on comfort and confidence.'],
  mid:['اختار شي يشبه ذوقك. إذا مرتاح بلبسك، تگدر تركّز على الناس اللي وياك.','A moderate presence index; dress comfortably and let the impression form naturally.'],
  high:['خلّي حضورك يبين بشي تحبّه، سواء بلبسك أو بسالفة تعرف تحچيها زين.','The presence index is favorable; confidence and respect matter more than forcing attention.']
 },
 romance:{
  low:['إذا الكلام الكبير ما يعبّر عن إحساسك هسّه، خليه لوقته.','Romantic timing is weak; avoid rushing an emotional declaration or a promise.'],
  mid:['تتذكر شغلة صغيرة يحبّها الشخص؟ اسأل عنها. هاي وحدها تلفت الانتباه.','Romantic timing is moderate; a small sincere gesture beats oversized expectations.'],
  high:['إذا ودّك تعبّر عن اهتمامك، گول شنو عجبك بالتحديد وخلّي الرد يجي براحته.','The index supports gentle affection; express interest without assuming it is mutual.']
 },
 chemistry:{
  low:['إذا حسّيت الحچي ثقيل، غيّر الموضوع أو خذ استراحة. ما تحتاج تختبر ردّة فعل أحد.','The interaction index is low; be direct and avoid testing another person’s reactions.'],
  mid:['وأنت تحچي، انتبه إذا الاثنين مرتاحين بالسوالف. هذا يفيدك أكثر من أول انطباع.','The interaction index is moderate; look for actual understanding, not just first impressions.'],
  high:['إذا السالفة دا تمشي من الطرفين، خذ راحتك بيها وشوف وين توصلكم.','The index supports easy conversation; actual chemistry depends on reciprocal respect and response.']
 },
 sexuality:{
  low:['إذا أحد منكم متردّد، خذوا وقتكم. ودايماً اسأل شنو يريّح الشخص اللي وياك.','Intimacy timing is low; it says nothing about another person’s desire or consent.'],
  mid:['احچوا بصراحة عن اللي يناسب كل واحد منكم. تگدرون تتمهّلون بأي لحظة.','Intimacy timing is moderate; clarity, boundaries and mutual consent remain essential.'],
  high:['إذا التقارب ببالك، اسأل شنو يريّح الطرف الثاني. الخطوة الحلوة هي اللي تريدونها اثنينكم.','The intimacy timing index is high; mutual understanding and consent matter more than the number.']
 },
 desire:{
  low:['اسأل نفسك شنو تريده اليوم. إذا ودّك ترتاح، خذ راحتك.','The drive index is low; do not force yourself and follow your actual comfort level.'],
  mid:['خذ لحظة وشوف إذا هذا فعلاً اللي تريده، أو مجرد حماس اللحظة.','The drive index is moderate; act thoughtfully rather than impulsively.'],
  high:['إذا عندك حماس، عبّر عنه بوضوح وخلي للطرف الثاني مساحته.','The drive index is high; channel enthusiasm into considered choices and clear boundaries.']
 },
 nightlife:{
  low:['إذا تطلع الليلة، اختار مكان قريب ورتّب الرجعة قبل ما تطوّل السهرة.','Night-out timing is low; if you go out, keep plans simple with a reliable way home.'],
  mid:['قبل ما تتفقون، تأكد المكان مفتوح بالوقت اللي تريدونه وشوف شلون ترجع.','Night-out timing is moderate; check the venue and your return arrangements.'],
  high:['إذا ناوي تسهر، رتّب توصيلة الرجعة من هسّه حتى تستمتع بوقتك.','Night-out timing is favorable; enjoy it while keeping transport and return plans in order.']
 },
 travel:{
  low:['إذا وراك حجز، اترك مجال للزحمة وخزّن العنوان حتى لو انقطع النت.','Travel planning is low; verify bookings and routes, with extra time or a fallback.'],
  mid:['شيّك نقطة الانطلاق. مرات اسم المكان صحيح بس الفرع غير اللي تقصده.','Travel timing is moderate; double-check schedules and addresses before leaving.'],
  high:['مشوارك مرتب؟ ثبّت مكان اللقاء وخلّي شوية وقت بين الوصول والموعد.','Travel timing is favorable; confirm the route and allow some delay buffer.']
 },
 risk:{
  low:['قبل ما تطلع لمكان جديد، شوف آخر معلومات الطريق وخيارات الرجعة.','Caution readiness is low; verify transport and venue conditions and avoid rushed decisions.'],
  mid:['تأكد من عنوانك ومن وسيلة النقل اللي راح تستخدمها، خصوصاً إذا راجع متأخر.','Caution readiness is moderate; check actual location and route information first.'],
  high:['حتى ويا درجة عالية، اعتمد على وضع الطريق والمكان هسّه وخذ احتياطاتك المعتادة.','Caution readiness is high; keep normal precautions and do not assume any setting is risk-free.']
 },
 sleep:{
  low:['إذا تعبان ارتاح، حتى لو درجة التوقيت طالعة واطية.','The rest-timing index is low, but never a reason to postpone sleep; rest when tired.'],
  mid:['إذا خلص يومك، خلّي آخر شغلة لباجر وخذ شوية هدوء قبل النوم.','Rest timing is moderate; allow a quiet wind-down and limit stimulation before sleep.'],
  high:['إذا عندك مجال ترتاح هسّه، استغلّه. مو لازم تملأ كل ساعة بمشوار.','Rest timing is high; make use of a quiet window and protect your sleep routine.']
 }
};
const activityFocus:Record<TravelCardId,Category>={
 dating:'love',newpeople:'communication',social:'communication',
 attraction:'energy',romance:'emotions',chemistry:'communication',
 sexuality:'love',desire:'energy',nightlife:'energy',
 travel:'timing',risk:'timing',sleep:'recovery'
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
export type TravelCardReading={summary:string;basis:string;detail:string;conciseDetail:string;scene:string;contactKey:string|null};

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
 // The displayed score is an AVERAGE of source domains. A high overall
 // New People score must not cite a negative communication square merely
 // because communication is the preferred editorial topic.
 const direction=Math.sign(metric.value-50);
 const hasContact=(entry:typeof entries[number])=>entry.contacts.some(c=>c.strength>0&&c.tone!==0);
 const hasAligned=(entry:typeof entries[number])=>entry.contacts.some(c=>c.strength>0&&c.tone!==0&&
  direction!==0&&Math.sign(c.tone)===direction);
 const aligned=ranked.filter(e=>Math.sign(e.score-50)===direction&&hasAligned(e));
 const partiallyAligned=ranked.filter(hasAligned);
 // The category explaining a positive composite should itself be positive
 // where that category has a matching supporting aspect. Only fall back to
 // opposing-category evidence if no directionally coherent source exists.
 const pool=aligned.length?aligned:partiallyAligned.length?partiallyAligned:ranked.filter(hasContact);
 const active=pool.find(e=>e.category===activityFocus[metric.id as TravelCardId])??pool[0];
 let evidence='',contactKey:string|null=null;
 if(active){
  const sign=(aligned.length||partiallyAligned.length)?direction:Math.sign(active.score-50);
  const contributions=[...active.contacts].filter(c=>c.strength>0&&c.tone!==0).sort((a,b)=>
   Number(Math.sign(b.tone)===sign)-Number(Math.sign(a.tone)===sign)||
   Math.abs(b.tone*b.strength)-Math.abs(a.tone*a.strength)||a.orb-b.orb);
  const contact=contributions[0] as SkyContact;
  contactKey=contact.transit+':'+contact.natal+':'+contact.angle;
  const body=english?contact.transit:(nameAr[contact.transit]??contact.transit);
  const natal=english?contact.natal:(nameAr[contact.natal]??contact.natal);
  const relation=english?angleEn[contact.angle]:angleAr[contact.angle];
  const categoryName=sourceLabels[active.category][english?1:0];
  evidence=english?
   'Leading calculated contact in '+categoryName+': '+body+' '+relation+' natal '+natal+' (orb '+contact.orb.toFixed(1)+'°).':
   'أبرز اتصال محسوب بمجال '+categoryName+': '+body+' '+relation+' '+natal+' بخارطة ميلادك (فارق '+contact.orb.toFixed(1)+'°).';
  if(direction!==0&&Math.sign(contact.tone)!==direction){
   evidence+=' '+(english?
    'This contact alone does not explain the composite direction; the other source domains determine the final score.':
    'هذا الاتصال وحده ما يفسّر اتجاه المحصلة؛ بقية المجالات رجّحت الدرجة النهائية.');
  }
 }else{
  const skyShift=entries.some(entry=>sky.domains[entry.category].skyAdjustment!==0);
  evidence=skyShift?(english?
   'No close natal contact contributed within 8°; current-sky conditions still changed one or more source indices.':
   'ماكو اتصال ميلادي مؤثر ضمن 8°؛ لكن حركة السماء الحالية غيّرت درجة مجال واحد أو أكثر.'):
   (english?'No close natal contact contributed within 8°; the source indices remain at their neutral baseline.':
   'ماكو اتصال ميلادي مؤثر ضمن 8°؛ درجات المجالات باقية على خط الأساس المحايد.');
 }
 const riskNote=metric.id==='risk'?(english?
  'This is a timing-readiness score, not a real-world safety or crime-risk assessment.':
  'هذا تقييم ملاءمة توقيت، مو قياس لخطر فعلي أو أمان منطقة.'):
  metric.id==='sleep'?(english?'Sleep need is decided by your body and schedule, not this score.':
   'حاجة جسمك للنوم أهم من هذا التقييم.'):
  // This boundary is already stated once in the visible Nightlife & Intimacy
  // group heading, so avoid repeating an identical disclaimer on two gauges.
  '';
 // Sky weather is counted in the index; do not repeat its paragraph on every card.
 const sourceLine=(english?'Source indices: ':'المجالات الداخلة بالحساب: ')+basis+'.';
 const conciseDetail=sourceLine+(riskNote?' '+riskNote:'');
 const detail=sourceLine+' '+evidence+(riskNote?' '+riskNote:'');
 const activeEntries=entries.filter(hasContact);
 const contacts=activeEntries.flatMap(entry=>entry.contacts.filter(c=>c.strength>0&&c.tone!==0));
 const mixed=contacts.some(c=>c.tone>0)&&contacts.some(c=>c.tone<0);
 const qualifier=mixed?(english?'Supporting and challenging factors coexist. ':'أكو عوامل داعمة ومعاكسة بنفس المحصلة. '):'';
 // A neutral rubric or a general-sky adjustment cannot establish personal
 // readiness for an activity. State the actual coverage before giving advice.
 const scene=!activeEntries.length?(english?
  'No contributing personal contact for this activity; the number reflects the neutral baseline and general-sky adjustments.':
  'ماكو اتصال شخصي مؤثر لهذا النشاط؛ الرقم من خط الأساس المحايد وتعديلات السماء العامة.'):
  (activeEntries.length<entries.length?(english?
   'Personal contact coverage is partial ('+activeEntries.length+'/'+entries.length+'). ':
   'تغطية الاتصالات الشخصية جزئية ('+activeEntries.length+'/'+entries.length+'). '):'')+qualifier+pair[english?1:0];
 // A travel activity should be described in its own domain. Repeating an
 // unrestricted natal pair scene in the compact body produced irrelevant
 // relationship/sales advice under transport, rest and risk gauges. Keep
 // exact contacts auditable within the expanded "Why this score" section.
 return {summary:scene,scene,contactKey,basis,detail,conciseDetail};
}
