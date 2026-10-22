import type {Dimension,SynastryEvidence} from './math.ts';
import type {IntimacyTheme,PartnerInsight} from './peopleInsights.ts';

type Values={love:number;communication:number;energy:number};
type Story={ar:string;en:string;factorAr:string;factorEn:string};
const names:Record<string,[string,string]>={Sun:['الشمس','Sun'],Moon:['القمر','Moon'],Mercury:['عطارد','Mercury'],Venus:['الزهرة','Venus'],Mars:['المريخ','Mars'],Jupiter:['المشتري','Jupiter'],Saturn:['زحل','Saturn'],Uranus:['أورانوس','Uranus'],Neptune:['نبتون','Neptune'],Pluto:['بلوتو','Pluto'],Ascendant:['الطالع','Ascendant']};
const aspectLabels:Record<number,[string,string]>={0:['اقتران','conjunction'],60:['تسديس','sextile'],90:['تربيع','square'],120:['تثليث','trine'],180:['مقابلة','opposition']};
const topics:Record<IntimacyTheme,string[]>={
 desire:['Mars','Venus','Pluto','Ascendant'],chemistry:['Moon','Venus','Mars'],date:['Venus','Moon','Mercury'],
 flirt:['Mercury','Venus'],exploration:['Uranus','Jupiter','Mercury'],fantasyTalk:['Neptune','Moon','Mercury'],
 trust:['Saturn','Moon','Venus'],initiative:['Mars','Mercury'],boundaries:['Saturn','Mars'],consistency:['Saturn','Sun','Moon'],
 intellectual:['Mercury','Jupiter','Saturn'],emotionalNeeds:['Moon','Venus','Saturn'],conflictRepair:['Mars','Saturn','Mercury'],
 closenessPace:['Venus','Moon','Mars'],longTerm:['Saturn','Sun','Moon'],contactTiming:['Mercury','Moon','Venus']
};
const diff=(a:number,b:number,high:[string,string],low:[string,string],even:[string,string]):[string,string]=>a-b>=9?high:b-a>=9?low:even;
/** Different, score-contingent explanations. Never guesses feelings, preferences or event probabilities. */
export function partnerCardStory(x:PartnerInsight,d:Record<Dimension,number>,today:Values,evidence:readonly SynastryEvidence[],seen:Set<string>=new Set()):Story{
 const calm=100-d.conflict;let words:[string,string];
 switch(x.id){
 case 'desire':words=diff(d.attraction,d.sexual,
  ['الجاذبية أوضح من الكيمياء الحميمية. فرق الدرجات يعني لا تخلط قوة الانطباع ويا عمق القرب.', 'Attraction scores above intimacy; strong first impressions are not the same as sustained closeness.'],
  ['الكيمياء الحميمية أعلى من الانجذاب العام؛ الشرارة مو اختصار لبناء علاقة متينة.', 'Intimate chemistry outranks general attraction; intensity cannot replace building a relationship.'],
  ['الجاذبية والكيمياء الحميمية متقاربتين؛ ماكو أفضلية حسابية واضحة بينهن.', 'Attraction and intimacy scores are close; neither has a meaningful numerical lead.']);break;
 case 'chemistry':words=diff(d.emotional,d.sexual,
  ['الألفة العاطفية أقوى من الاندفاع الحميمي؛ هالفرق يركز على الراحة النفسية قبل الشرارة.', 'Emotional ease scores above intimate chemistry; comfort is the stronger theme.'],
  ['الاندفاع الحميمي أعلى من الألفة العاطفية؛ الشغف ما يضمن تفاهم عميق.', 'Intimate chemistry outruns emotional ease; passion does not guarantee understanding.'],
  ['الألفة والشغف قريبين بالدرجات؛ لا تبالغ بتفسير فارق صغير.', 'Emotional closeness and passion score similarly; a tiny gap does not warrant a big conclusion.']);break;
 case 'date':words=diff(today.communication,today.love,
  ['الكلام اليوم أقوى من مؤشر العاطفة؛ إذا تتفقون على لقاء فالحوار أولى من الأجواء المصطنعة.', 'Today communication leads romance; conversation is the more relevant theme for an agreed meeting.'],
  ['مؤشر العاطفة أعلى من التواصل اليوم؛ الأجواء الهادئة قد تناسب أكثر من نقاش ثقيل.', 'The romance index leads communication today; a low-pressure atmosphere is the stronger theme.'],
  ['التواصل والعاطفة اليوم شبه متساويين؛ الدرجة ما تعني ضمان موعد.', 'Communication and closeness are nearly equal today; a score cannot guarantee a date.']);break;
 case 'flirt':words=diff(d.communication,d.attraction,
  ['سهولة الكلام أقوى من الجاذبية؛ الحچي الطبيعي يخدم هالتواصل أكثر من مجاملات مبالغ بيها.', 'Conversation compatibility exceeds attraction; authentic talk matters more than excessive flattery.'],
  ['الانجذاب أعلى من التفاهم بالكلام؛ لا تخلي الحماس يغطي على اختلاف التعبير.', 'Attraction exceeds communication compatibility; chemistry cannot erase differences in expression.'],
  ['الغزل والتفاهم متقاربين بالحساب؛ ما يحتاج تغيّر طريقتك حتى تثير اهتمام.', 'Flirting and conversation indices are close; no calculation calls for a contrived approach.']);break;
 case 'exploration':words=diff(d.communication,calm,
  ['التواصل يتقدم على هدوء الاختلاف؛ معرفة الاهتمامات المعلنة أهم من افتراض تفضيلات سرية.', 'Communication exceeds conflict resilience; discover stated interests rather than assuming hidden preferences.'],
  ['هدوء الخلاف يتقدم على سهولة الكلام؛ تنظيم الاختلاف أولى من اقتراح تجربة جديدة.', 'Conflict resilience exceeds conversational ease; manage differences before pursuing novelty.'],
  ['التواصل وهدوء الاختلاف قريبين؛ الانفتاح بالنموذج ما يكشف أذواق أو رغبات خاصة.', 'Communication and conflict resilience are similar; this model reveals no private preferences.']);break;
 case 'fantasyTalk':words=diff(d.communication,d.emotional,
  ['قدرة الحوار أقوى من الألفة العاطفية؛ إذا الموضوع شخصي فالتوضيح أهم من الإيحاء.', 'Conversation is stronger than emotional affinity; clarity matters more than hints on personal topics.'],
  ['الألفة العاطفية أعلى من سهولة الكلام؛ مشاعر قوية ما تنفهم من غير حوار صريح.', 'Emotional affinity exceeds conversational ease; personal feelings still require direct discussion.'],
  ['الحوار والألفة متقاربين؛ الثقة بالتفاصيل الخاصة تحتاج واقع مو تخمين.', 'Dialogue and emotional ease are close; sharing private thoughts requires real trust.']);break;
 case 'trust':words=diff(d.emotional,d.stability,
  ['الألفة أعلى من الثبات؛ الارتياح السريع مو نفس الاعتماد على الشخص بمرور الوقت.', 'Emotional affinity leads stability; instant comfort and lasting reliability are different.'],
  ['الاستقرار أعلى من القرب العاطفي؛ الثبات أوضح من الإفصاح عن المشاعر بالنموذج.', 'Stability leads emotional affinity; steadiness is more pronounced than expression.'],
  ['الأمان والثبات متقاربين؛ الثقة الحقيقية تظهر بالتصرفات المتكررة مو بالدرجات.', 'Emotional safety and stability are close; trust is demonstrated through reliable behavior.']);break;
 case 'initiative':words=diff(today.energy,today.communication,
  ['طاقة اليوم أعلى من سهولة الكلام؛ الرغبة بالمبادرة مو سبب للاستعجال برسائل متتالية.', 'Today energy exceeds communication; initiative is not a reason to rush or flood messages.'],
  ['التواصل اليوم أعلى من الطاقة؛ الكلام المدروس أوضح من خطوة متسرعة.', 'Communication exceeds energy today; considered conversation is the stronger theme.'],
  ['النشاط والتواصل متقاربين؛ ماكو سبب حسابي تعتبر هاليوم استثنائي للمبادرة.', 'Energy and communication are close; the model does not identify an exceptional opening.']);break;
 case 'boundaries':words=diff(calm,d.stability,
  ['هدوء الاختلاف أعلى من الثبات؛ حل الاحتكاك أوضح من استمرار نفس الإيقاع.', 'Conflict resilience leads stability; navigating friction is the clearer theme.'],
  ['الثبات أعلى من هدوء الخلاف؛ الالتزام الرمزي أقوى من القدرة على تجاوز الشد.', 'Stability leads conflict resilience; commitment is stronger than ease in disagreements.'],
  ['الثبات وهدوء الاختلاف قريبين؛ الحدود تتحدد بالكلام والفعل مو بالتنجيم.', 'Stability and conflict resilience are close; boundaries come from actions and discussion.']);break;
 case 'intellectual':words=diff(d.communication,calm,
  ['الحوار أقوى من سهولة تجاوز التوتر؛ وضوح الفكرة مهم لكن اختلاف الآراء يحتاج صبر.', 'Conversation outweighs conflict resilience; clear ideas still need patience with differences.'],
  ['هدوء الاختلاف أعلى من سرعة التفاهم؛ ممكن يكون الاتفاق بطيئاً لكن النقاش أقل تصادماً.', 'Conflict resilience leads dialogue; agreement may take time while disagreement stays manageable.'],
  ['التفاهم وتحمل الاختلاف متقاربين؛ اسأل عن الرأي الفعلي بدل افتراض تشابه الأفكار.', 'Dialogue and difference-tolerance are close; ask about real views rather than assuming agreement.']);break;
 case 'emotionalNeeds':words=diff(d.emotional,d.stability,
  ['الألفة أعلى من الثبات؛ ناقشوا شنو يعني الاهتمام المستمر بعيداً عن حرارة البداية.', 'Emotional affinity leads stability; discuss what sustained care looks like beyond the beginning.'],
  ['الثبات أعلى من التعبير العاطفي؛ اسألوا عن وتيرة الاطمئنان والوقت المشترك.', 'Stability leads emotional expression; discuss reassurance and shared time.'],
  ['الألفة والثبات متقاربين؛ اختلاف الحاجة للمساحة يُفهم بالسؤال مو بالنتيجة الرقمية.', 'Closeness and steadiness are similar; personal-space needs require conversation.']);break;
 case 'conflictRepair':words=diff(calm,d.communication,
  ['تجاوز الشد أسهل رمزياً من شرح المشكلة؛ ركزوا على تسمية سبب الخلاف بوضوح.', 'Repair looks stronger than communication; name the cause rather than only moving on.'],
  ['الكلام أسهل من تهدئة التوتر؛ ضعوا قاعدة للراحة قبل العودة للنقاش.', 'Dialogue exceeds conflict resilience; agree on a cool-down before revisiting tension.'],
  ['الكلام والإصلاح متقاربان؛ اختبروا أسلوب حل اختلاف صغير، مو احتمال غياب كل خلاف.', 'Dialogue and repair are close; observe how a small disagreement is actually resolved.']);break;
 case 'closenessPace':words=diff(d.attraction,d.emotional,
  ['الجاذبية أسرع من الألفة؛ لا تختصروا التعارف بكيمياء اللحظة.', 'Attraction leads emotional comfort; allow time for understanding beyond chemistry.'],
  ['الألفة أعلى من الجاذبية؛ التقارب الهادئ قد يناسب أكثر من خطوات سريعة.', 'Emotional comfort exceeds attraction; a slower pace may fit better.'],
  ['الجاذبية والألفة متقاربتان؛ الإيقاع الفعلي يحدده الطرفان بكلام واضح.', 'Attraction and comfort are close; real pacing is negotiated together.']);break;
 case 'longTerm':words=diff(d.stability,calm,
  ['الثبات أعلى من مرونة الخلاف؛ استقرار العادات ما يغني عن معالجة الخلافات.', 'Steadiness leads conflict resilience; stable habits do not replace working through friction.'],
  ['مرونة الخلاف أعلى من الثبات؛ القدرة على الإصلاح مهمة لكنها لا تعني اتفاقاً على المستقبل.', 'Repair leads steadiness; resilience does not establish aligned long-term goals.'],
  ['الثبات وإصلاح الخلاف متقاربان؛ مو دليل على عمر العلاقة أو استمرارها.', 'Stability and repair are close; neither predicts how long a relationship lasts.']);break;
 case 'contactTiming':words=diff(today.communication,today.love,
  ['التواصل اليوم يتقدم على الجو العاطفي؛ رسالة محددة أفضل من تلميح غامض.', 'Today dialogue leads romance; a clear message may fit better than vague hints.'],
  ['الجو العاطفي أعلى من سهولة الحوار؛ خلّ تواصلك لطيفاً وبلا ضغط.', 'Romantic symbolism leads dialogue; keep contact gentle and low-pressure.'],
  ['التواصل والعاطفة متقاربان بهالوقت؛ قراءة التوقيت ما تكشف استعداد الشخص للرد.', 'Dialogue and romance are similar at this time; no score reveals willingness to reply.']);break;
 case 'consistency':words=diff(d.stability,d.communication,
  ['الاستمرارية أعلى من التفاهم بالكلام؛ الثبات بالنموذج أوضح من سلاسة السوالف.', 'Stability exceeds communication; steadiness leads everyday conversational ease.'],
  ['التفاهم أعلى من الاستمرارية؛ سوالف مريحة ما تضمن علاقة ثابتة مع الوقت.', 'Communication exceeds stability; easy conversations do not guarantee consistency.'],
  ['الاستمرارية والتفاهم قريبين؛ الحكم على المدى الطويل يحتاج تجارب فعلية.', 'Stability and communication are close; long-term consistency requires actual experience.']);break;
 }
 const matching=evidence.filter(e=>e.influence>=.52&&Number.isFinite(e.orb)&&topics[x.id].includes(e.first.id)&&topics[x.id].includes(e.second.id)&&aspectLabels[e.angle]).sort((a,b)=>b.influence-a.influence||a.orb-b.orb);
 const chosen=matching.find(e=>!seen.has(e.first.id+'/'+e.second.id+'/'+e.angle))??matching[0];
 if(!chosen)return {ar:words![0],en:words![1],factorAr:'',factorEn:''};
 seen.add(chosen.first.id+'/'+chosen.second.id+'/'+chosen.angle);
 const a=names[chosen.first.id]??[chosen.first.id,chosen.first.id],b=names[chosen.second.id]??[chosen.second.id,chosen.second.id],kind=aspectLabels[chosen.angle];
 return {ar:words![0],en:words![1],factorAr:'من حساب الخارطتين: '+a[0]+' و'+b[0]+' · '+kind[0]+'.',factorEn:'Computed contact: '+a[1]+' and '+b[1]+' · '+kind[1]+'.'};
}
