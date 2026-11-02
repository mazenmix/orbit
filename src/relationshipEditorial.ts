import type {SynastryEvidence} from './math.ts';
import type {RelationshipBrief} from './relationshipBrief.ts';
import type {TwoLanguage} from './relationshipPlain.ts';

type Theme='attraction'|'sexual'|'harmony'|'challenge';
export type RelationshipEditorialCard={title:TwoLanguage;body:TwoLanguage;step:TwoLanguage;source:TwoLanguage|null;contact:SynastryEvidence|null;sharedSource:boolean};
export type RelationshipEditorial={attraction:RelationshipEditorialCard;sexual:RelationshipEditorialCard;harmony:RelationshipEditorialCard|null;challenge:RelationshipEditorialCard|null};

const bodies:Record<string,TwoLanguage>={
 Sun:{ar:'الشمس',en:'Sun'},Moon:{ar:'القمر',en:'Moon'},Mercury:{ar:'عطارد',en:'Mercury'},
 Venus:{ar:'الزهرة',en:'Venus'},Mars:{ar:'المريخ',en:'Mars'},Jupiter:{ar:'المشتري',en:'Jupiter'},
 Saturn:{ar:'زحل',en:'Saturn'},Uranus:{ar:'أورانوس',en:'Uranus'},Neptune:{ar:'نبتون',en:'Neptune'},
 Pluto:{ar:'بلوتو',en:'Pluto'},Ascendant:{ar:'الطالع',en:'Ascendant'},MC:{ar:'وسط السماء',en:'MC'}
};
const aspectSigns:Record<number,string>={0:'☌',60:'⚹',90:'□',120:'△',180:'☍'};
const pair=(e:SynastryEvidence)=>[e.first.id,e.second.id].sort().join('|');
const fingerprint=(e:SynastryEvidence)=>[e.first.id,e.second.id,e.angle,e.orb.toFixed(5)].join('|');
const label=(e:SynastryEvidence):TwoLanguage=>{
 const a=bodies[e.first.id]??{ar:e.first.id,en:e.first.id};
 const b=bodies[e.second.id]??{ar:e.second.id,en:e.second.id};
 const s=aspectSigns[e.angle]??String(e.angle)+'°';
 const delta=e.orb.toFixed(2)+'°';
 return {ar:a.ar+' '+s+' '+b.ar+' · '+delta,en:a.en+' '+s+' '+b.en+' · '+delta};
};
const bi=(ar:string,en:string):TwoLanguage=>({ar,en});
const attractionThemes:Record<string,TwoLanguage>={
 'Mars|Venus':bi('الانطباع العاطفي هنا يتشكل من المودة مقابل الجرأة بالمبادرة؛ الاهتمام قد ينعبر عنه بطريقتين مختلفتين.','Affection meets initiative: one may show interest gently while the other acts more directly.'),
 'Pluto|Venus':bi('الانشداد والخصوصية موضوعان بارزان هنا؛ الانبهار ممكن يختلط بحساسية الثقة إذا الحدود مو واضحة.','Magnetism meets privacy and trust; fascination can become uneasy without clear boundaries.'),
 'Mars|Pluto':bi('المبادرة والتأثير الشخصي يتداخلان؛ انتبهوا لا يتحول التقارب إلى منافسة على منو يحدد الاتجاه.','Initiative and power overlap; attraction works poorly as a contest over who leads.'),
 'Mars|Mars':bi('كل واحد عنده أسلوب مختلف بالمبادرة؛ الموضوع هنا مو كمية الجاذبية بل شلون تستقبلون اندفاع بعض.','Two initiative styles interact; how each person responds matters more than intensity.'),
 'Uranus|Venus':bi('الاختلاف والمفاجأة ممكن يكونان جزءاً من الانشداد؛ الاستمرارية تحتاج أفعال ثابتة، مو إثارة الجديد.','Novelty can be part of the spark, while consistency requires more than excitement.'),
 'Moon|Venus':bi('المودة ترتبط بالإحساس بالاحتواء؛ الإشارات الصغيرة للاهتمام أهم من الاستعراض.','Affection relates to emotional reassurance; small caring gestures matter more than display.'),
 'Ascendant|Venus':bi('الانطباع الأول والذوق الشخصي يجتمعان؛ هذا يصف أسلوب الحضور مو مشاعر الشخص الآخر.','First impressions and aesthetic preferences intersect; this describes presence, not another person’s feelings.'),
 'Sun|Venus':bi('أسلوب أحدكم بالتعبير عن ذاته يلتقي بذوق الثاني بالمودة؛ تقدير الاختلاف يفيد التقارب.','One person’s self-expression meets the other’s affectionate style; appreciation matters.'),
 'Venus|Venus':bi('طريقتا التعبير عن الاهتمام والقيم العاطفية تتفاعلان؛ انتبهوا إذا تتوقعون نفس أسلوب المودة.','Two ways of showing affection interact; do not assume identical relationship expectations.')
};
const sexualThemes:Record<string,TwoLanguage>={
 'Mars|Venus':bi('بالحميمية، محور القراءة هو التنسيق بين المبادرة والحنان؛ مو كل تعبير عن الإعجاب يعني استعداداً للقرب الجسدي.','For intimacy, the theme is coordinating physical initiative and tenderness; flirtation is not consent.'),
 'Pluto|Venus':bi('القرب الجسدي قد يطرح أسئلة عن التملك والخصوصية؛ لازم يبقى الاختيار والراحة متبادلين.','Physical closeness brings trust and autonomy into focus; choice and comfort must remain mutual.'),
 'Mars|Pluto':bi('الحدود وتوزيع المبادرة أهم من شدة الرغبة؛ أي ضغط يغيّر طبيعة التجربة.','Boundaries and shared agency matter more than intensity; pressure changes the experience.'),
 'Mars|Mars':bi('الإيقاع الجسدي والتلقائية محور القراءة؛ اختلاف الوتيرة يحتاج تفاهم عملي، مو افتراض.','Physical pace and spontaneity are central; different rhythms require explicit communication.'),
 'Uranus|Venus':bi('الفضول والتجديد موضوع رمزي، لكن الخارطة ما تحدد تفضيلات أي شخص الخاصة.','Novelty is the symbolic theme, not a way to determine anyone’s private preferences.'),
 'Mars|Moon':bi('ردود الفعل العاطفية قد تختلف عن سرعة المبادرة الجسدية؛ الراحة شرط أساسي لأي تقارب.','Emotional reactions may differ from physical pace; comfort is essential.'),
 'Ascendant|Mars':bi('طريقة الحضور والمبادرة قد تبين قوية؛ الحدود لازم تنفهم من الكلام الواضح، مو من الانطباع.','Presence and initiative stand out, but boundaries require explicit communication.')
};
const harmonyThemes:Record<string,TwoLanguage>={
 'Mercury|Mercury':bi('نقطة القوة المحتملة هي تبادل الأفكار وتصحيح سوء الفهم قبل ما يتراكم.','The potential strength is discussing ideas and clearing up misunderstandings early.'),
 'Mercury|Moon':bi('الكلام يرتبط بالإحساس بالأمان؛ السؤال المباشر قد يختصر تفسير النبرة بصورة خاطئة.','Conversation meets emotional reassurance; direct questions can prevent tone misreadings.'),
 'Moon|Venus':bi('التقدير العاطفي والاهتمام اليومي يشتغلان سوية؛ البساطة أنسب من المبالغة.','Everyday care and emotional reassurance reinforce one another.'),
 'Moon|Sun':bi('التعبير عن الذات يرتبط بالحاجة للطمأنينة؛ الاعتراف باحتياجات بعض يسهّل التفاهم.','Self-expression meets emotional needs; acknowledging both helps mutual understanding.'),
 'Mars|Venus':bi('المبادرة والمودة ممكن يساندن بعض إذا الاهتمام متبادل وتوقيت التقارب مناسب.','Initiative and affection can reinforce each other when interest and timing are mutual.'),
 'Saturn|Venus':bi('المودة ترتبط بوضوح الالتزام؛ الوعود الصغيرة المنفّذة أعمق من الكلام الكبير.','Affection meets commitment; reliable small promises count more than grand declarations.'),
 'Jupiter|Sun':bi('التشجيع وتوسيع التجارب المشتركة مجال قوي بالقراءة، بشرط الاتفاق على الواقع.','Encouragement and shared exploration are a strong theme, if plans stay realistic.')
};
const challengeThemes:Record<string,TwoLanguage>={
 'Neptune|Sun':bi('الخطر هنا هو تفسير التوقعات كأنها حقائق؛ تأكدوا من المقصود بدل بناء صورة مثالية عن الثاني.','The risk is treating expectations as facts; verify what was actually meant.'),
 'Mars|Moon':bi('سرعة ردّ واحد ممكن تصطدم بحساسية الثاني؛ وقت التهدئة أهم من حسم الخلاف فوراً.','One person’s quick reaction can clash with the other’s sensitivity; cooling down matters.'),
 'Mercury|Neptune':bi('الكلام الملتبس والتخمين قد يصنعان خلافاً بدون سبب واضح؛ سمّوا التفاصيل بدقة.','Vague messages and guesses can create unnecessary friction; clarify specifics.'),
 'Saturn|Venus':bi('الاهتمام قد يواجه ضغط الواجبات أو الاختلاف بالتوقعات؛ وضحوا حدود الوقت والالتزام.','Affection can meet competing duties or expectations; agree on availability and commitments.'),
 'Mars|Pluto':bi('شدّ الإرادات ممكن يحوّل الاختلاف إلى معركة سيطرة؛ خلو القرار مشتركاً قدر الإمكان.','Power struggles can turn disagreements into contests; share decision-making.'),
 'Mercury|Saturn':bi('ملاحظة ناقدة ممكن تنفهم كتقليل من الطرف الثاني؛ فرقوا بين تصحيح الفكرة والحكم على الشخص.','Criticism may land as dismissal; separate feedback on an idea from judgment of a person.'),
 'Moon|Saturn':bi('التعبير عن الاحتياج قد يصطدم بالتحفّظ أو الانشغال؛ حدّدوا شنو تتوقعون من الدعم.','Expressed needs may meet reserve or obligations; define what support means.')
};
const fallback=(theme:Theme,e:SynastryEvidence):TwoLanguage=>{
 const a=bodies[e.first.id]??bi(e.first.id,e.first.id),b=bodies[e.second.id]??bi(e.second.id,e.second.id);
 if(theme==='attraction')return bi('التفاعل بين '+a.ar+' و'+b.ar+' يركّز على اختلاف أسلوب التقارب؛ ما يثبت مشاعر طرف تجاه الثاني.','The contact between '+a.en+' and '+b.en+' describes interaction style, not another person’s feelings.');
 if(theme==='sexual')return bi('بالقرب الجسدي، العلاقة بين '+a.ar+' و'+b.ar+' ما تحدد رغبة الشخص أو موافقته؛ الأهم التفاهم الواضح.','In intimacy, '+a.en+' and '+b.en+' do not reveal anyone’s desire or consent; clear communication matters.');
 if(theme==='harmony')return bi('هنا يظهر اتصال بين '+a.ar+' و'+b.ar+' قد يساعدكم تنسقون جانبين مختلفين بالتعامل.','This '+a.en+'–'+b.en+' contact may help coordinate two different interaction styles.');
 return bi('الاتصال بين '+a.ar+' و'+b.ar+' يرمز لنقطة احتكاك تحتاج وضوح، مو لنتيجة محتومة.','The '+a.en+'–'+b.en+' contact suggests a theme requiring clarity, not an inevitable outcome.');
};
const angleMessage=(e:SynastryEvidence,theme:Theme):TwoLanguage=>{
 if(e.angle===90||e.angle===180)return theme==='harmony'?
  bi('الزاوية متوترة، مو زاوية انسجام.','This is not a supportive aspect.'):
  bi('الزاوية المتوترة تزيد احتمال اختلاف الإيقاع بالتفسير الرمزي.','The challenging aspect adds symbolic friction.');
 if(e.angle===0)return bi('الاقتران يركز على هذا الموضوع، بدون تحديد نتيجته.','A conjunction emphasizes this theme without determining its outcome.');
 if(theme==='challenge')return bi('الاتصال داعم، مو زاوية تحدٍّ.','This is a supportive, not challenging, aspect.');
 return bi('الزاوية منسجمة في القراءة الفلكية.','The aspect is supportive in the chart reading.');
};
const note=(theme:Theme,e:SynastryEvidence|null,shared=false):RelationshipEditorialCard=>{
 const titles:Record<Theme,TwoLanguage>={
  attraction:bi('الجاذبية وطريقة التقارب','Attraction & approach'),
  sexual:bi('الانسجام الحميمي','Intimate chemistry'),
  harmony:bi('أوضح نقطة انسجام','Strongest distinct harmony'),
  challenge:bi('أبرز نقطة اختلاف','Key distinct challenge')
 };
 if(!e)return {title:titles[theme],body:bi('ماكو زاوية محسوبة مستقلة لهالمجال ضمن الاتصالات المتاحة.','No distinct calculated contact is available for this area.'),step:bi('',''),source:null,contact:null,sharedSource:false};
 const table=theme==='attraction'?attractionThemes:theme==='sexual'?sexualThemes:theme==='harmony'?harmonyThemes:challengeThemes;
 const topic=table[pair(e)]??fallback(theme,e);
 const qualifier=angleMessage(e,theme);
 const showQualifier=theme==='challenge'||(e.angle===90||e.angle===180);
 const body=showQualifier?bi(topic.ar+' '+qualifier.ar,topic.en+' '+qualifier.en):topic;
 const steps:Record<Theme,TwoLanguage>={
  attraction:bi('راقبوا المبادرة والتجاوب الحقيقي، مو الإشارات وحدها.','Judge by actual initiative and response, not hints alone.'),
  sexual:bi('الحدود والراحة والرغبة المتبادلة تنحچي بصراحة.','Discuss comfort, boundaries and mutual willingness explicitly.'),
  harmony:bi('اختبروا هالنقطة بموقف يومي بسيط.','Check this strength through an ordinary real-life interaction.'),
  challenge:bi('اسألوا عن نقطة الاختلاف المحددة بدل التخمين.','Clarify the specific disagreement rather than guessing.')
 };
 return {title:titles[theme],body,step:steps[theme],source:label(e),contact:e,sharedSource:shared};
};
/** Concise, evidence-identified relationship snapshot. This is symbolic synastry, not behavioral prediction. */
export function relationshipEditorial(brief:RelationshipBrief):RelationshipEditorial{
 const attraction=note('attraction',brief.attractionContact);
 const sexual=note('sexual',brief.sexualContact,Boolean(brief.sexualContact&&brief.attractionContact&&fingerprint(brief.sexualContact)===fingerprint(brief.attractionContact)));
 const used=new Set([brief.attractionContact,brief.sexualContact].filter((e):e is SynastryEvidence=>Boolean(e)).map(fingerprint));
 const harmony=brief.harmonyContact&&!used.has(fingerprint(brief.harmonyContact))?note('harmony',brief.harmonyContact):null;
 if(harmony?.contact)used.add(fingerprint(harmony.contact));
 const challenge=brief.challengeContact&&!used.has(fingerprint(brief.challengeContact))?note('challenge',brief.challengeContact):null;
 return {attraction,sexual,harmony,challenge};
}
