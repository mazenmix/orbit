import type {Evidence,Signal} from './math.ts';
import {rankedFactors,supportive,difficult} from './math.ts';
import type {RelationshipWindow} from './relationshipWindows.ts';

type Kind='message'|'date';
type Story={ar:string;en:string;reasonAr:string;reasonEn:string;factor:string|null};
type Wording={arGood:string;enGood:string;arHard:string;enHard:string};
const thoughts:Record<string,{message:Wording;date:Wording}>={
 Mercury:{
  message:{arGood:'الكلام الواضح هو أقوى موضوع بهاليوم؛ إذا تريد تفتح سالفة، ابدي بالمقصود بدون تلميحات.',enGood:'Clear wording stands out symbolically today; lead with what you mean instead of hints.',arHard:'هاليوم انتبه للصياغة: سؤال بسيط أفضل من رسالة طويلة تنفهم بأكثر من معنى.',enHard:'Watch your wording: one simple question beats a long message with mixed signals.'},
  date:{arGood:'إذا تفكر بطلعة، الاتفاق على الوقت والمكان أسهل من الكلام المفتوح؛ اقترح تفصيلين واضحين.',enGood:'For a meetup, a clear time and place are more useful than open-ended plans.',arHard:'قبل ما ترتب لقاء، تأكد من التفاصيل؛ الغموض بالمكان أو التوقيت ممكن يعقد السالفة.',enHard:'Before planning a meetup, clarify the details so neither time nor place is vague.'}
 },
 Venus:{
  message:{arGood:'الأسلوب اللطيف مناسب لهالقراءة؛ رسالة خفيفة عن شي مشترك بينكم أنسب من فتح خلاف.',enGood:'A warm approach fits this symbolic reading; mention something you both enjoy rather than a dispute.',arHard:'المجاملة الزايدة مو بالضرورة تقرّب؛ احچي بطبيعتك حتى ما توصل رسالة غير اللي تقصده.',enHard:'Too much flattery may obscure your intent; write naturally and directly.'},
  date:{arGood:'جوّ الألفة هو الأبرز رمزياً؛ اختار مكان هادئ يخلي مجال للسوالف بدل الزحمة.',enGood:'Ease and warmth stand out symbolically; a quiet spot leaves more room for conversation.',arHard:'لا تحاول تصنع جو مثالي بالقوة؛ خلي المكان بسيط وشوف إذا هي أصلاً مرتاحة للفكرة.',enHard:'Do not force an ideal atmosphere; keep the venue simple and check whether the invitation is welcome.'}
 },
 Mars:{
  message:{arGood:'عندك رمزياً دفعة للمبادرة؛ استغلها بسؤال مباشر واحد، مو سلسلة رسائل ورا بعض.',enGood:'The symbolism favors initiative; use it for one direct question, not a stream of messages.',arHard:'الاندفاع بالكلام هو نقطة الانتباه؛ لا تكتب وأنت متضايق أو مستعجل على رد.',enHard:'Impulsive wording is the concern; avoid writing in frustration or demanding a quick reply.'},
  date:{arGood:'إشارة النشاط أقوى هنا؛ إذا صار اتفاق على طلعة، خلي البرنامج خفيف وبيه حركة.',enGood:'Activity is the stronger theme; if you both agree to meet, keep the plan lively but easy.',arHard:'الحماس ممكن يسبق الراحة؛ لا تحوّل فكرة اللقاء إلى برنامج متعب أو قرار مستعجل.',enHard:'Enthusiasm can outrun comfort; avoid a rushed or exhausting plan.'}
 },
 Moon:{
  message:{arGood:'الجانب العاطفي حاضر بالقراءة؛ كلمة تقدير بسيطة قد تكون أوضح من نقاش ثقيل.',enGood:'Emotion is a symbolic theme; a brief word of appreciation is clearer than a heavy discussion.',arHard:'المزاج متغيّر ضمن الإشارة المحسوبة؛ لا تبني معنى كبير على تأخر الرد أو نبرة مختصرة.',enHard:'The symbolic emphasis is on changing moods; avoid reading too much into reply times or brief wording.'},
  date:{arGood:'الراحة أهم من المظاهر بهذا اليوم؛ إذا تتفقون على موعد، خلّوه بمكان هادئ وسهل.',enGood:'Comfort matters more than presentation; choose an easy, relaxed place if you agree to meet.',arHard:'الجانب العاطفي حساس رمزياً؛ خلي الخطة مرنة حتى ما يتحول تعب اليوم إلى سوء فهم.',enHard:'Emotional sensitivity is the symbolic theme; leave room to change plans if needed.'}
 },
 Sun:{
  message:{arGood:'الوضوح الشخصي بارز؛ احچي عن الشي اللي تريده إنت فعلاً، بدون ما تحاول تتوقع جوابها.',enGood:'Personal clarity stands out; say what you actually want without assuming their answer.',arHard:'لا تخلي إثبات وجهة نظرك أهم من السالفة نفسها؛ حاول تسمع قبل ما تحسم.',enHard:'Do not make proving your point more important than understanding the exchange.'},
  date:{arGood:'الانطباع والصراحة محور اليوم؛ دعوة محددة تعبر عن ذوقك أحسن من خطة مبهمة.',enGood:'Presence and honesty are central; a specific invitation is better than a vague plan.',arHard:'التوقعات العالية ممكن تثقل اللقاء؛ لا تعامل أول طلعة كأنها امتحان للعلاقة.',enHard:'High expectations may weigh on a meeting; do not treat one outing as a relationship test.'}
 },
 Jupiter:{
  message:{arGood:'الانفتاح بالكلام ظاهر بالرمز؛ تقدر تفتح موضوع جديد بس خله قريب من اهتمام مشترك.',enGood:'Openness is the theme; bring up a fresh topic tied to a real shared interest.',arHard:'لا توسّع الوعود أو الكلام أكثر من اللازم؛ خلي الرسالة واقعية وتگدر تلتزم بيها.',enHard:'Avoid overpromising; keep your message realistic and easy to stand by.'},
  date:{arGood:'تغيير الجو وارد كفكرة مفيدة؛ مكان جديد وبسيط ممكن يخلي الطلعة أريح إذا اتفقتوا.',enGood:'A small change of scene fits the theme; suggest somewhere fresh but straightforward.',arHard:'الطموح بالخطة أكبر من الحاجة؛ لا تصرف أو ترتب أكثر من المطلوب حتى تثبت اهتمامك.',enHard:'The plan may be getting bigger than it needs to be; do not overspend to demonstrate interest.'}
 },
 Saturn:{
  message:{arGood:'المسؤولية والحدود هي الفكرة الأوضح؛ إذا عندك موعد أو وعد، أكد التفاصيل بهدوء.',enGood:'Boundaries and follow-through stand out; calmly confirm any arrangement or promise.',arHard:'الكلام الجدي ممكن يطلع ثقيل؛ إذا الموضوع حساس، اختار وقت مناسب مو مجرد يوم درجته عالية.',enHard:'Serious conversation may feel weighty; choose an appropriate moment, not just a high score.'},
  date:{arGood:'التنظيم مفيد أكثر من المفاجآت؛ رتّب مكان وتوقيت مريحين واحترم ارتباطاتها.',enGood:'Planning is more helpful than surprise; suggest convenient timing and respect commitments.',arHard:'الإحساس بالواجب ممكن يخلي الموعد رسمي زيادة؛ لا تفرض جدول صارم على طلعة بسيطة.',enHard:'Duty may overshadow enjoyment; avoid turning a simple outing into a rigid itinerary.'}
 },
 Uranus:{
  message:{arGood:'فكرة غير متوقعة ممكن تفتح سوالف؛ شارك شي جديد بوضوح بدل اختبار رد الفعل.',enGood:'An unexpected topic could start a conversation; share it clearly rather than testing a reaction.',arHard:'المفاجأة بالكلام مو دائماً لطيفة؛ ابتعد عن الرسائل المبهمة أو التغييرات المفاجئة.',enHard:'Surprises in communication can misfire; avoid cryptic messages or abrupt changes.'},
  date:{arGood:'كسر الروتين مناسب كموضوع رمزي؛ اقترح نشاط خفيف مختلف عن المعتاد، مو مغامرة مرهقة.',enGood:'Breaking routine is the symbolic idea; offer a light alternative, not an exhausting adventure.',arHard:'لا تعتمد على المفاجآت الكبيرة؛ خذ رأيها بالمكان حتى تبقى الطلعة مريحة للطرفين.',enHard:'Avoid big surprises; ask about the venue so both people are comfortable.'}
 },
 Neptune:{
  message:{arGood:'الخيال حاضر بس يحتاج توضيح؛ إذا تذكرون حلم أو فكرة، اربط كلامك بشي واضح.',enGood:'Imagination is present but needs clarity; tie an abstract thought to something concrete.',arHard:'أكو قابلية رمزية للالتباس؛ لا تفترض معنى بين السطور، وإذا محتار اسأل مباشرة.',enHard:'Ambiguity is the symbolic concern; ask directly instead of interpreting hidden meanings.'},
  date:{arGood:'الجو الهادئ والفني يلائم موضوع اليوم؛ كافيه مريح أو مكان بيه موسيقى خفيفة خيار معقول.',enGood:'A calm or creative setting fits the theme; consider a quiet café or music venue.',arHard:'لا تبني الموعد على توقعات خيالية؛ تأكد من المكان والوقت والتفاهم قبل أي ترتيب.',enHard:'Avoid idealized expectations; confirm the practical details before committing.'}
 },
 Pluto:{
  message:{arGood:'الصدق بالموضوع أهم من كثرة الكلام؛ افتح قضية واحدة إذا أكو ثقة ومساحة للنقاش.',enGood:'Depth matters more than length; discuss one meaningful issue only if mutual trust exists.',arHard:'السوالف المشحونة ممكن تصير شدّ وجذب؛ لا تحاول تستخرج جواب شخصي بالإلحاح.',enHard:'Intense topics can become power struggles; do not push for a private answer.'},
  date:{arGood:'الأحاديث العميقة رمزياً أوضح من الاستعراض؛ اختار مكان يسمح بالسوالف بدون ضوضاء.',enGood:'Depth is the symbolic theme; pick somewhere you can actually hear each other.',arHard:'لا تعتبر قوة الانجذاب سبب للاستعجال؛ خلّي اللقاء يحافظ على مساحة وحدود واضحة.',enHard:'Do not confuse intensity with a reason to rush; keep the meeting comfortable and respectful.'}
 }
};
const generalMessage={arGood:'الرسالة الواضحة أسهل من التلميحات بهالقراءة؛ إذا عندك موضوع حقيقي افتحه بهدوء.',enGood:'A direct, calm message fits this symbolic signal better than hints.',arHard:'الإشارة الرمزية تحتاج انتباه للّبس بالكلام؛ تأكد من المعنى قبل الإرسال.',enHard:'The symbolic signal calls for clarity: check your wording before sending.'};
const generalDate={arGood:'التقارب حاضر كموضوع رمزي؛ اختار فكرة موعد بسيطة واسأل إذا تناسب الطرف الثاني.',enGood:'Connection is the symbolic theme; suggest a simple plan and ask whether it works.',arHard:'الأفضل ترتّب طلعة مرنة بدل موعد مليان توقعات؛ راحة الطرفين أهم من الدرجة.',enHard:'Keep a proposed meeting flexible instead of attaching big expectations to a score.'};
const nearest=(series:readonly RelationshipWindow[],day:RelationshipWindow,mode:Kind)=>{
 const sorted=series.map(d=>d[mode]).slice().sort((a,b)=>a-b);
 const median=sorted[Math.floor(sorted.length/2)];
 return day[mode]-median;
};
/**
 * Narration is chosen from real transit-to-natal evidence for the specific local day.
 * Same factor is not artificially presented as a new event on adjacent days.
 * Scores are symbolic model indices, never forecasts of reply, consent or attraction.
 */
export function relationshipDayReading(day:RelationshipWindow,mode:Kind,period:readonly RelationshipWindow[],signals:readonly Signal[],usedFactors:Set<string>):Story{
 const topic=mode==='message'?'communication':day.source.energy>day.source.love+12?'energy':'love';
 const group=signals.find(s=>s.category===topic);
 const factors=rankedFactors(group?.allFactors??group?.factors??[]);
 const strongest=factors[0]??null;
 // Never promote a weak secondary contact just to manufacture variety.
 const distinct=factors.find(e=>!usedFactors.has(e.id)&&e.weight>=Math.max(.35,(strongest?.weight??0)-.15));
 const factor=distinct??strongest;
 if(factor)usedFactors.add(factor.id);
 const code=factor?.transit.id??'';
 const script=thoughts[code]?.[mode]??(mode==='message'?generalMessage:generalDate);
 const hard=factor?difficult(factor)&&!supportive(factor):false;
 const undecided=!!factor&&!supportive(factor)&&!difficult(factor);
 const natural=factor?(undecided?
 {ar:mode==='message'?'الاتصال المحسوب اليوم يركز على الكلام، بس ما يرجّح إذا حوارك راح يكون أسهل أو أصعب؛ خذ القرار من طبيعة السالفة.':'الاتصال المحسوب اليوم يركز على التقارب، بس ما يثبت إن الموعد مناسب أو مقبول؛ خذ القرار حسب اتفاقكم.',en:mode==='message'?'The calculated communication contact is neutral; it does not establish whether a conversation will go well.':'The calculated closeness contact is neutral; it cannot establish that a date would be welcome.'}:
 {ar:hard?script.arHard:script.arGood,en:hard?script.enHard:script.enGood}):mode==='message'?
 {ar:'بهذا اليوم ماكو اتصال تواصل محدد حتى أعطيه قصة خاصة؛ الترتيب جاي من قيمة الأساس المحايدة والتوافق الثابت، فاختار الوقت حسب ظروفكم الفعلية.',en:'No distinct communication contact was calculated for this day; the ranking combines a neutral default with static compatibility, so choose a time that works in real life.'}:
 {ar:'ماكو اتصال تقارب مميز يبرر توقع لقاء بهاليوم؛ الترتيب رمزي، وفكرة الموعد تعتمد على موافقتكم وظروفكم.',en:'No distinct closeness contact justifies predicting a meeting today; the ranking is symbolic, and actual plans depend on mutual agreement.'};
 const delta=nearest(period,day,mode);
 const comparisonAr=Math.abs(delta)<3?'قريب من وسط الفترة':delta>0?'أعلى من وسط الفترة بـ'+delta+' درجات':'أقل من وسط الفترة بـ'+Math.abs(delta)+' درجات';
 const comparisonEn=Math.abs(delta)<3?'close to the period midpoint':delta>0?delta+' points above the period midpoint':Math.abs(delta)+' points below the period midpoint';
 return {ar:natural.ar,en:natural.en,
  reasonAr:mode==='message'?'بالحساب: مؤشر التواصل اليوم '+day.source.communication+'/100؛ '+comparisonAr+'.':'بالحساب: التقارب '+day.source.love+' والنشاط '+day.source.energy+'؛ '+comparisonAr+'.',
  reasonEn:mode==='message'?'Calculated communication index: '+day.source.communication+'/100; '+comparisonEn+'.':'Calculated closeness: '+day.source.love+' and energy: '+day.source.energy+'; '+comparisonEn+'.',
  factor:factor?.id??null};
}
