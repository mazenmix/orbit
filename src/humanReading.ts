import type {SoulReading} from './soulEngine.ts';
import {soulPlainReading} from './soulEngine.ts';
import type {PrecisionInsight} from './chartPrecisionNarrative.ts';
import type {SynastryEvidence} from './math.ts';
type Both={ar:string;en:string};
const styles:readonly Both[]=[
 {ar:'المبادرة السريعة والكلام المباشر',en:'quick initiative and direct expression'},
 {ar:'الصبر والبحث عن الاستقرار',en:'patience and a need for stability'},
 {ar:'الفضول وتغيير زاوية النظر',en:'curiosity and changing perspective'},
 {ar:'الألفة والاهتمام بالتفاصيل العاطفية',en:'belonging and emotional awareness'},
 {ar:'التعبير بثقة والرغبة بتقدير الجهد',en:'confident expression and acknowledgement'},
 {ar:'التدقيق وتحسين الأشياء خطوة بخطوة',en:'precision and gradual improvement'},
 {ar:'موازنة الطرفين والتفاوض',en:'fairness and negotiation'},
 {ar:'العمق والحذر قبل إعطاء الثقة',en:'depth and careful trust'},
 {ar:'التجربة والبحث عن فرصة أوسع',en:'exploration and a bigger horizon'},
 {ar:'التخطيط الطويل وتحمل المسؤولية',en:'long-term planning and responsibility'},
 {ar:'الاستقلال وتجربة حل غير مألوف',en:'independence and experimenting'},
 {ar:'الخيال والقدرة على فهم المشاعر',en:'imagination and sensitivity'}
];
const houses:readonly Both[]=[
 {ar:'',en:''},{ar:'الصورة اللي تقدمها عن نفسك',en:'your sense of identity'},
 {ar:'الصرف والأمان المالي',en:'resources and financial security'},
 {ar:'الرسائل والتعلم والكلام اليومي',en:'messages and everyday communication'},
 {ar:'البيت والعائلة والخصوصية',en:'home, family and privacy'},
 {ar:'الغزل والإبداع والمتعة',en:'romance, creativity and enjoyment'},
 {ar:'الشغل والروتين والراحة',en:'work, routines and rest'},
 {ar:'الشراكات والاتفاقات',en:'partnerships and agreements'},
 {ar:'الثقة والحدود والمال المشترك',en:'trust, boundaries and shared resources'},
 {ar:'السفر والتعلم والأفكار',en:'travel, study and beliefs'},
 {ar:'العمل والسمعة أمام الآخرين',en:'career and public reputation'},
 {ar:'الصداقات والعلاقات الاجتماعية',en:'friends and social connections'},
 {ar:'الخلوة والخصوصية',en:'privacy and solitude'}
];
const style=(s:number,language:'ar'|'en')=>styles[s]?.[language]??(language==='ar'?'أسلوبك الخاص':'your personal approach');
const house=(s:number|null,language:'ar'|'en')=>s&&houses[s]?.[language]||'';
export function humanSoul(reading:SoulReading):{summary:Both;deep:Both}{
 if(reading.basisStatus!=='available'||reading.basis.length<2){
  // When birth data is missing, never leak a partial coordinate/planet
  // report or substitute an invented personality description.
  return {
   summary:reading.summary,
   deep:{
    ar:reading.basisStatus==='limited'?'المعلومات المتوفرة عن «'+reading.topic.ar+'» ما تكفي حتى نكوّن قراءة شخصية متماسكة. عدنا جزء من البيانات فقط، ولذلك الأفضل تستكمل المعلومات قبل الاستنتاج.':'ماكو بيانات محسوبة كافية عن «'+reading.topic.ar+'» حتى أوصف شخصيتك أو أتوقع تصرفك. هذا الموضوع يحتاج معلومات ولادة صحيحة.',
    en:reading.basisStatus==='limited'?'The available information for “'+reading.topic.en+'” covers only part of the required chart. Complete the birth inputs rather than filling gaps with personality claims.':'There is insufficient calculated information for “'+reading.topic.en+'”. We cannot responsibly infer a personality pattern without valid birth data.'
   }
  };
 }
 return soulPlainReading(reading);
}
const planetAreas:Record<string,Both>={
 Sun:{ar:'ثقتك بنفسك والقرار',en:'identity and decisions'},Moon:{ar:'حاجتك للراحة والاطمئنان',en:'comfort and reassurance'},
 Ascendant:{ar:'أسلوب حضورك والانطباع الأول',en:'presentation and first impressions'},MC:{ar:'اتجاهك المهني وحضورك العام',en:'career direction and public presence'},
 Mercury:{ar:'تفكيرك وطريقة الكلام',en:'thinking and communication'},Venus:{ar:'طريقة الاهتمام والحب',en:'affection and values'},
 Mars:{ar:'المبادرة وردّة الفعل',en:'initiative and reactions'},Jupiter:{ar:'التوسع والتجارب',en:'growth and exploration'},
 Saturn:{ar:'الالتزام والحدود',en:'responsibilities and limits'},Uranus:{ar:'الاستقلال والتغيير',en:'independence and change'},
 Neptune:{ar:'التوقعات والواقع',en:'expectations and reality'},Pluto:{ar:'التغيير العميق والسيطرة',en:'change and control'}
};
const scenes:Record<string,Both>={
 Sun:{ar:'إذا اختلف قرارك مع توقعات شخص مهم، وضّح أولويتك بلا معركة إثبات.',en:'If your decision conflicts with expectations, state your priority without turning it into a struggle.'},
 Moon:{ar:'إذا تزعجت من رد شخص، حدد شنو تحتاج حتى تهدأ قبل لا تعطيه معنى سلبي.',en:'If a reply upsets you, name what you need before interpreting it negatively.'},
 Mercury:{ar:'إذا وصلت رسالة تنفهم بطريقتين، اسأل عن المقصود قبل الرد.',en:'If a message can be understood in two ways, clarify its meaning before reacting.'},
 Venus:{ar:'إذا تنجذب لشخص، عبّر عن اهتمامك واترك تجاوبه الحقيقي يحدد الخطوة.',en:'If you like someone, express interest and let their actual response guide the next step.'},
 Mars:{ar:'إذا صار خلاف، اختار جملة واضحة وحد واحد بدل تصعيد النقاش.',en:'In a disagreement, state one boundary instead of escalating.'},
 Jupiter:{ar:'إذا عجبتك فرصة، قارن حماسك بكلفتها ووقتها قبل الوعد.',en:'If an opportunity excites you, consider the time and cost before committing.'},
 Saturn:{ar:'إذا الشغل تراكم عليك، حدد شنو مسؤوليتك وشنو يحتاج إعادة اتفاق.',en:'If work piles up, clarify which tasks are yours and which require renegotiation.'},
 Uranus:{ar:'إذا روتينك ضايقك، جرّب تغيير بسيط قبل قرار ما ينرجع عنه.',en:'If a routine feels stale, try a reversible change first.'},
 Neptune:{ar:'إذا حسّيت الإشارات مبهمة، اعتبرها غير محسومة لحد ما تتأكد من الوقائع.',en:'When signals feel ambiguous, leave them unresolved until you verify the facts.'},
 Pluto:{ar:'إذا تريد تحسم نتيجة بسرعة، ركز على التصرف اللي بيدك واترك رد الطرف الثاني إله.',en:'If you want to force a result, act only on what is within your control.'}
};
export function humanPlanet(insight:PrecisionInsight):{title:Both;summary:Both;action:Both}{
 const d=planetAreas[insight.id]??{ar:'موضوع شخصي',en:'a personal topic'};
 const arStyle=styles.find(x=>insight.signAr&&x.ar===insight.signAr);
 const signAr=['الحمل','الثور','الجوزاء','السرطان','الأسد','العذراء','الميزان','العقرب','القوس','الجدي','الدلو','الحوت'].indexOf(insight.signAr);
 const signEn=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'].indexOf(insight.signEn);
 const ar=style(signAr,'ar'),en=style(signEn,'en');
 const hsAr=house(insight.house,'ar'),hsEn=house(insight.house,'en');
 const scene=scenes[insight.id]??{ar:insight.actionAr,en:insight.actionEn};
 const linked=insight.aspect?planetAreas[insight.aspect]:undefined;
 const hard=insight.aspectAngle===90||insight.aspectAngle===180;
 const united=insight.aspectAngle===0;
 const linkedAr=linked?(hard?'أكو شدّ بين هذا الأسلوب وبين '+linked.ar+'؛ فاختبر وين تحتاج حدود أو توازن، مو قرار سريع. ':united?'هالأسلوب يرتبط بقوة ويا '+linked.ar+'؛ حاول تميّز بين حاجتك الأولى والثانية. ':'ممكن يساعدك تجمع هالأسلوب ويا '+linked.ar+'، بشرط تتأكد أن التصرفات الواقعية تدعمه. '):'';
 const linkedEn=linked?(hard?'This approach may compete with '+linked.en+'; explore what needs balancing. ':united?'This approach is closely tied to '+linked.en+'; distinguish the two needs. ':'This approach may complement '+linked.en+' when practical circumstances support it. '):'';
 return {
  title:d,
  summary:{ar:'بموضوع '+d.ar+'، ممكن يفيدك أسلوب '+ar+'. '+(hsAr?'جرّب تلاحظ هالشي خصوصاً بموضوع '+hsAr+'. ':'')+linkedAr+'مثال: '+scene.ar,
   en:'For '+d.en+', the symbolic approach suggests '+en+'. '+(hsEn?'Look for this around '+hsEn+'. ':'')+linkedEn+'For example: '+scene.en},
  action:{ar:insight.actionAr,en:insight.actionEn}
 };
}
const pairContexts:Record<string,Both>={
 'Mars|Venus':{ar:'واحد منكم يميل للمبادرة والثاني للتقارب الهادئ. فرق السرعة ممكن يكون لطيف أو مزعج حسب طريقة التعبير والتجاوب.',en:'One may move quickly while the other prefers tenderness. Whether the pace works depends on honest interaction.'},
 'Pluto|Venus':{ar:'الانجذاب القوي قد يختلط بالحساسية والغيرة. وضوح الحدود أهم من اختبار قوة تأثيرك على الشخص.',en:'Strong magnetism may coincide with insecurity or jealousy. Boundaries matter more than testing influence.'},
 'Mars|Pluto':{ar:'أكو موضوع حسم وسيطرة متداخل مع الرغبة. التفاهم يحتاج مساحة للطرفين، مو تنافس منو يقود.',en:'Desire may become intertwined with control. Mutual choice matters more than competing to lead.'},
 'Mercury|Mercury':{ar:'طريقة التعبير والفهم بينكما ممكن تكون محور راحة أو سوء فهم. أهم اختبار: هل كل واحد يفهم قصد الثاني من غير تخمين؟',en:'Communication styles can help or create friction; check whether each person understands what was meant.'},
 'Moon|Venus':{ar:'التقارب هنا يركز على الأمان والتقدير. مشاعر الراحة تصير أقوى بالأفعال الثابتة مو الكلام وحده.',en:'Connection centers on reassurance and care; consistent actions matter more than declarations.'},
 'Neptune|Sun':{ar:'الصورة المثالية والتوقعات ممكن تتقدم على الكلام الواضح. اسألوا شنو يريد كل طرف فعلاً.',en:'Idealized expectations can outpace clear communication; discuss what each person actually wants.'},
 'Mars|Mars':{ar:'الإيقاع وطريقة المبادرة قد تختلف بينكما. وضحوا متى كل واحد يريد يتحرك ومتى يحتاج مساحة.',en:'Initiative and pace may differ; talk about when to act and when to allow space.'},
 'Saturn|Venus':{ar:'المودة تحتاج تنسجم ويا حدود المسؤولية والاستمرارية. راقبوا الالتزام الحقيقي بلا وعود أكبر من الممكن.',en:'Affection must meet realistic commitments and boundaries. Look at consistent follow-through.'}
};
export function humanPartner(e:SynastryEvidence|null|undefined,kind:'attraction'|'sexual'|'harmony'|'challenge'):Both{
 if(!e)return {ar:kind==='challenge'?'ماكو عامل قوي يبرر وصف خلاف محدد؛ التفاهم الحقيقي يبقى أهم.':kind==='harmony'?'ماكو دليل كافي نحدد بيه نقطة انسجام بعينها؛ خلي التجربة هي المعيار.':'ماكو أساس كافي نستنتج انجذاب شخص أو رغبة خاصة من بيانات الميلاد.',en:kind==='challenge'?'No strong basis to describe a specific conflict.':'Not enough evidence to infer attraction, private desire or compatibility.'};
 const key=[e.first.id,e.second.id].sort().join('|'),base=pairContexts[key];
 const pressure=e.angle===90||e.angle===180;
 const context=base??(kind==='sexual'?{ar:'التقارب الجسدي يرتبط باختلاف أسلوب التعبير والمبادرة؛ لا نستنتج الرغبة أو الموافقة من خارطة.',en:'Physical intimacy depends on communication and mutual choice, never on a chart alone.'}: {ar:'أحد جوانب التقارب يحتاج تنسيق بين احتياجات مختلفة، ويظهر أثره الحقيقي بطريقة التعامل اليومية.',en:'This theme concerns negotiating different needs through actual everyday interactions.'});
 const angleFocus=pressure?
  {ar:' إذا واحد منكم يستعجل والثاني يحتاج وقت، وضّحوا الإيقاع ولا تخلّون الاختلاف يتحوّل لضغط.',en:' If your preferred pace differs, discuss it rather than turning the difference into pressure.'}:
  e.angle===0?
  {ar:' قد يصير هالجانب بارز بالتعامل؛ قوّة الانطباع مو بديل عن التفاهم.',en:' The theme may feel prominent; intensity is no substitute for understanding.'}:
  {ar:' ممكن تلاقون طريقة مريحة تجمع رغباتكم، بس لازم تظهر بالأفعال مو بالتوقع.',en:' There may be room for a comfortable compromise, but it needs to appear in real behavior.'};
 const add=kind==='sexual'?
  {ar:' بالكيمياء الجنسية، الرغبة المتبادلة والراحة وحدود كل واحد أهم من أي مؤشر رمزي.',en:' For sexual chemistry, mutual interest, comfort and boundaries come first.'}:
 kind==='attraction'?
  {ar:' الجاذبية المحتملة مو دليل أن الطرف الثاني معجب؛ خلي الأفعال والتواصل يحسمون.',en:' Potential attraction is not proof of the other person’s feelings.'}:
 pressure?
  {ar:' لأن القراءة تبرز اختلافاً محتملاً، اختاروا نقاش واحد محدد وابتعدوا عن الاتهام.',en:' The interpretation suggests possible friction; address one issue without blame.'}:
  {ar:' هذا جانب ممكن يساعد بالتفاهم إذا الأفعال فعلاً تدعمه.',en:' This is a potentially helpful theme if actual behavior supports it.'};
 return {ar:context.ar+angleFocus.ar+add.ar,en:context.en+angleFocus.en+add.en};
}
