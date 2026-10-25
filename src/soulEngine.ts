import type {Chart,Profile} from './engine.ts';
import {distance,houseNumber,type Point} from './math.ts';
import {soulTopics,type SoulTopic} from './soulData.ts';
import {getSoulTheme} from './soulThemes.ts';
import {soulDeepFor} from './soulDeep.ts';
import {soulRule} from './soulTopicRules.ts';
import {interpretableNatalPoints} from './readingBasis.ts';

export type NatalBasis={planet:string;longitude:number;sign:number;house:number|null;retrograde:boolean;angle:{planet:string;type:number;orb:number;conflict:boolean}|null};
export type NatalAspect={first:string;second:string;type:number;orb:number};
export type SoulOptions={knownTime?:boolean};
export type SoulReading={topic:SoulTopic;basis:NatalBasis[];basisStatus:'available'|'limited'|'unavailable';summary:{ar:string;en:string};deep:{ar:string;en:string};strengths:{ar:string[];en:string[]};weaknesses:{ar:string[];en:string[]};example:{ar:string;en:string};advice:{ar:string;en:string};question:{ar:string;en:string};limitations:{ar:string;en:string};contradictory:boolean};
const arSigns=['الحمل','الثور','الجوزاء','السرطان','الأسد','العذراء','الميزان','العقرب','القوس','الجدي','الدلو','الحوت'];
const enSigns=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const styleAr=['المبادرة والتعبير المباشر','الثبات وتقدير الملموس','الفضول وتبادل الأفكار','الألفة والرعاية','الإبداع والتعبير الواثق','التدقيق والتحسين العملي','الموازنة والإنصاف','العمق وحماية الثقة','التجربة وتوسيع المنظور','التخطيط وتحمل المسؤولية','الاستقلال وإعادة النظر في المألوف','الخيال والتعاطف'];
const styleEn=['initiative and direct expression','consistency and tangible values','curiosity and exchanging ideas','belonging and care','creativity and confident expression','precision and practical improvement','balance and fairness','depth and protecting trust','exploration and wider perspective','planning and responsibility','autonomy and questioning convention','imagination and empathy'];
const arPlanets:Record<string,string>={Sun:'الشمس',Moon:'القمر',Ascendant:'الطالع',MC:'وسط السماء',Mercury:'عطارد',Venus:'الزهرة',Mars:'المريخ',Jupiter:'المشتري',Saturn:'زحل',Uranus:'أورانوس',Neptune:'نبتون',Pluto:'بلوتو',Chiron:'كيرون',Ceres:'سيريس',Pallas:'بالاس',Juno:'جونو',Vesta:'فيستا',Pholus:'فولوس'};
const roleAr:Record<string,string>={Sun:'الهوية والاختيار الشخصي',Moon:'الاحتياج العاطفي والاطمئنان',Ascendant:'أسلوب الظهور والانطباع الأول',MC:'الاتجاه المهني والحضور العام',Mercury:'التفكير وصياغة الكلام',Venus:'التفضيل والانجذاب والتقدير',Mars:'المبادرة والتعامل مع الاحتكاك',Jupiter:'التوسع والمعنى والفرص',Saturn:'الحدود والاستمرارية والمسؤولية',Uranus:'التجديد والاستقلال',Neptune:'الخيال والتوقعات',Pluto:'القوة والتحول وحدود التأثير'};
const roleEn:Record<string,string>={Sun:'identity and personal choice',Moon:'emotional needs and reassurance',Ascendant:'presentation and first impressions',MC:'career direction and public presence',Mercury:'thinking and putting ideas into words',Venus:'preference, attraction and appreciation',Mars:'initiative and handling friction',Jupiter:'growth, meaning and opportunity',Saturn:'boundaries, continuity and responsibility',Uranus:'renewal and autonomy',Neptune:'imagination and expectations',Pluto:'power, change and limits of influence'};
const aspectNamesAr:Record<number,string>={0:'اقتران',60:'تسديس',90:'تربيع',120:'تثليث',180:'مقابلة'};
const aspectNamesEn:Record<number,string>={0:'conjunction',60:'sextile',90:'square',120:'trine',180:'opposition'};
const houseFocusAr=['','الهوية والصورة الأولى','الموارد والشعور بالقيمة','التواصل اليومي والتعلم','البيت والجذور','الإبداع والمرح والتعبير','العادات والعمل اليومي','الشراكات والاتفاقات','الموارد المشتركة والثقة','التعلم والسفر والمنظور','العمل والدور العام','الأصدقاء والمجموعات','الخلوة والخصوصية'];
const houseFocusEn=['','identity and first impressions','resources and self-worth','everyday communication and learning','home and roots','creativity, play and expression','habits and everyday work','partnerships and agreements','shared resources and trust','learning, travel and perspective','career and public role','friends and groups','solitude and privacy'];
const sign=(longitude:number)=>Math.floor(((longitude%360)+360)%360/30);
const name=(id:string,ar:boolean)=>ar?(arPlanets[id]??id):id;
const role=(id:string,ar:boolean)=>(ar?roleAr:roleEn)[id]??name(id,ar);
const finitePosition=(p:Point)=>Number.isFinite(p.longitude)&&p.longitude>=0&&p.longitude<360&&Number.isFinite(p.speed);

function canonicalTopic(topic:SoulTopic){
 const selected=soulTopics[topic.id-1];
 if(!selected||selected.id!==topic.id||selected.categoryId!==topic.categoryId)throw Error('Unknown analysis topic');
 return selected;
}

/** Close major aspects between selected natal indicators only. An orb is an
 * editorial inclusion limit, never statistical confidence in personality. */
export function soulAspectPairs(basis:readonly Pick<NatalBasis,'planet'|'longitude'>[]):NatalAspect[]{
 const pairs:NatalAspect[]=[];
 basis.forEach((a,i)=>basis.slice(i+1).forEach(b=>{
  if(!Number.isFinite(a.longitude)||!Number.isFinite(b.longitude)||a.planet===b.planet)return;
  const separation=distance(a.longitude,b.longitude);
  for(const type of [0,60,90,120,180]){
   const orb=Math.abs(separation-type);
   if(orb<=3)pairs.push({first:a.planet,second:b.planet,type,orb});
  }
 }));
 return pairs.sort((a,b)=>a.orb-b.orb||a.first.localeCompare(b.first)||a.second.localeCompare(b.second));
}

export function soulBasis(chart:Chart,topic:SoulTopic,{knownTime=true}:SoulOptions={}):NatalBasis[]{
 const rule=soulRule(canonicalTopic(topic).id);
 const planets=new Map(interpretableNatalPoints(chart.points,knownTime).map(p=>[p.id,p]));
 if(knownTime&&chart.asc!==null&&Number.isFinite(chart.asc)&&chart.asc>=0&&chart.asc<360)planets.set('Ascendant',{id:'Ascendant',symbol:'ASC',longitude:chart.asc,speed:0});
 if(knownTime&&chart.mc!==null&&Number.isFinite(chart.mc)&&chart.mc>=0&&chart.mc<360)planets.set('MC',{id:'MC',symbol:'MC',longitude:chart.mc,speed:0});
 const houses=knownTime&&chart.cusps.length===12&&chart.cusps.every(Number.isFinite);
 const basis:NatalBasis[]=[...new Set(rule.planets)].flatMap(id=>{
  const p=planets.get(id);if(!p)return [];
  const house=houses?houseNumber(p.longitude,chart.cusps):0;
  return [{planet:p.id,longitude:p.longitude,sign:sign(p.longitude),house:house||null,retrograde:p.speed<0,angle:null}];
 });
 const pairs=soulAspectPairs(basis);
 for(const p of basis){
  const pair=pairs.find(x=>x.first===p.planet||x.second===p.planet);
  if(pair)p.angle={planet:pair.first===p.planet?pair.second:pair.first,type:pair.type,orb:pair.orb,conflict:pair.type===90||pair.type===180};
 }
 return basis;
}

function placementText(b:NatalBasis,ar:boolean){
 return name(b.planet,ar)+(ar?' في ':' in ')+(ar?arSigns:enSigns)[b.sign];
}
function aspectInterpretation(basis:NatalBasis[],ar:boolean){
 const pairs=soulAspectPairs(basis);
 if(!pairs.length)return ar?'لا يوجد اتصال رئيسي ضمن أورب 3° بين المؤشرات المختارة؛ هذا لا يعني خلو الخارطة كلها من الاتصالات.':'No major aspect falls within 3° among the selected indicators; this does not mean the entire chart lacks aspects.';
 const a=pairs[0];
 const describe=(p:NatalAspect)=>name(p.first,ar)+(ar?' و':' and ')+name(p.second,ar)+' ('+(ar?aspectNamesAr:aspectNamesEn)[p.type]+')';
 const roles=role(a.first,ar)+(ar?' و':' and ')+role(a.second,ar);
 const meaning=ar?(a.type===0?'يجمع '+roles+' في تعبير متقارب، وقد يصعب الفصل بينهما':a.type===90?'يطرح موازنة بين '+roles+' حين يتطلب كل منهما استجابة مختلفة':a.type===180?'يبرز قطبين هما '+roles+'؛ يهم هنا التبادل بينهما دون إلغاء أحدهما':'يتيح قراءة '+roles+' كمسارين يمكن تنسيقهما، دون افتراض مهارة مكتسبة'):
  (a.type===0?'combines '+roles+', which may be difficult to separate':a.type===90?'raises a balance between '+roles+' when they call for different responses':a.type===180?'sets out two poles, '+roles+', to consider without excluding either':'suggests coordinating '+roles+', without implying an acquired skill');
 const lead=ar?'أقرب اتصال مختار هو '+describe(a)+'؛ رمزياً '+meaning+'.':'The closest selected aspect is '+describe(a)+'; symbolically it '+meaning+'.';
 const contrasting=pairs.find(p=>[90,180].includes(a.type)?[60,120].includes(p.type):[60,120].includes(a.type)&&[90,180].includes(p.type));
 return lead+(contrasting?(ar?' ويوجد أيضاً '+describe(contrasting)+'؛ لذلك تضم القراءة جانباً داعماً وآخر يحتاج موازنة.':' There is also '+describe(contrasting)+', so the reading includes both ease and a need for adjustment.'):'');
}

type Both={ar:string;en:string};
type SignMethod={step:Both;check:Both;watch:Both};
/** Practical lenses for an actual placement. These are reflection exercises,
 * not assertions that the owner has an observed trait or a future outcome. */
const methods:readonly SignMethod[]=[
 {step:{ar:'ابدأ بمحاولة قصيرة وحدد شنو تريد منها قبل الفعل',en:'Try one small action and name its purpose before acting'},check:{ar:'هل المبادرة وضّحت المطلوب لو بس سرّعت القرار؟',en:'Did taking initiative clarify the need, or only speed up the decision?'},watch:{ar:'لا تخلي سرعة البداية تختصر الاستماع أو التفاصيل',en:'Do not let a quick start replace listening or checking details'}},
 {step:{ar:'اختار خطوة ثابتة تگدر تكررها وحدد الكلفة اللي تناسبك',en:'Choose a repeatable step and a cost you can sustain'},check:{ar:'هل الثبات خدمك لو صرت متمسك بطريقة ما عادت نافعة؟',en:'Did consistency help, or did you keep a method that no longer works?'},watch:{ar:'فرّق بين الاستقرار المفيد وبين تأجيل التغيير الضروري',en:'Distinguish useful stability from postponing a necessary change'}},
 {step:{ar:'قارن تفسيرين للموقف واسأل عن المعلومة اللي تفرّق بينهن',en:'Compare two explanations and ask for the fact that distinguishes them'},check:{ar:'هل السؤال قرّبك للفهم لو فتح احتمالات بدون نهاية؟',en:'Did the question improve understanding, or only multiply possibilities?'},watch:{ar:'لا تحوّل جمع الآراء إلى بديل عن اختيار واضح',en:'Do not let collecting opinions replace making a clear choice'}},
 {step:{ar:'سمّ الحاجة اللي تريد تحميها ووضحها بطلب بسيط',en:'Name the need you want to protect and state it as a simple request'},check:{ar:'هل شرحت احتياجك لو انتظرت غيرك يفهمه وحده؟',en:'Did you explain your need, or expect someone else to infer it?'},watch:{ar:'افصل الشعور بعدم الراحة عن الدليل على نية غيرك',en:'Separate discomfort from evidence about another person’s intent'}},
 {step:{ar:'عبّر عن رغبتك بوضوح واترك مساحة لجواب يختلف عنها',en:'Express what you want clearly and allow a different response'},check:{ar:'هل التعبير مثّلك فعلاً لو صار هدفه الحصول على مديح؟',en:'Did your expression reflect what matters to you, or seek approval?'},watch:{ar:'لا تربط قيمة خطوتك بحجم الانتباه اللي تحصل عليه',en:'Do not measure the value of a step by the attention it receives'}},
 {step:{ar:'حدد تفصيل واحد يغيّر النتيجة وحسّنه قبل زيادة الشروط',en:'Improve one detail that changes the result before adding more conditions'},check:{ar:'هل التدقيق حسّن النتيجة لو منعك تبدأ؟',en:'Did attention to detail improve the result, or prevent a start?'},watch:{ar:'حط حد للمراجعة حتى ما يصير الكمال شرط لكل خطوة',en:'Set a limit on revision so perfection is not required before every step'}},
 {step:{ar:'وضح شنو تحتاج إنت واسأل عن حاجة الطرف المعني قبل الاتفاق',en:'State your need and ask what the other person needs before agreeing'},check:{ar:'هل الاتفاق بيه مكان لرأيك لو وافقت بس حتى يهدأ الجو؟',en:'Did the agreement include your view, or only keep the peace?'},watch:{ar:'لا تخلي المحافظة على الهدوء تمسح اعتراضاً مهماً',en:'Do not preserve harmony by hiding an important objection'}},
 {step:{ar:'اختار معلومة حساسة واحدة تحتاج وضوح وحدد حدود مشاركتها',en:'Choose one sensitive uncertainty to clarify and define its privacy boundary'},check:{ar:'هل التحقق أعطاك معلومة جديدة لو صار اختبار متكرر للثقة؟',en:'Did checking produce new information, or become a repeated test of trust?'},watch:{ar:'فرّق بين حماية الخصوصية ومحاولة ضمان كل رد فعل',en:'Distinguish protecting privacy from trying to control every response'}},
 {step:{ar:'جرّب خياراً يوسّع تجربتك ضمن وقت وكلفة معلومين',en:'Try an option that broadens experience within a known time and cost'},check:{ar:'هل التجربة خدمت غرضك لو كان الجديد وحده سبب الحماس؟',en:'Did the experiment serve your purpose, or was novelty the only appeal?'},watch:{ar:'راجع حدود الإمكانات قبل ما توسّع الوعد أو الخطة',en:'Check actual capacity before expanding a promise or plan'}},
 {step:{ar:'حوّل المطلوب إلى التزام واحد بموعد وحدود مسؤولية واضحة',en:'Turn the need into one commitment with a deadline and clear responsibility'},check:{ar:'هل الخطة قابلة للتنفيذ لو حمّلت نفسك واجباً مو كله عليك؟',en:'Is the plan workable, or did you take responsibility that is not all yours?'},watch:{ar:'خلّ مجال لتعديل الخطة بدل اعتبار كل تأخير تقصيراً',en:'Allow the plan to change instead of treating every delay as failure'}},
 {step:{ar:'جرّب بديلاً صغيراً واشرح شنو يضيفه قبل ترك الطريقة السابقة',en:'Test a small alternative and explain its benefit before replacing the old method'},check:{ar:'هل التغيير حل مشكلة محددة لو صار إثباتاً للاستقلال؟',en:'Did the change solve a specific problem, or mainly assert independence?'},watch:{ar:'اربط الاختلاف بفائدة فعلية حتى ما يصير التغيير غاية وحده',en:'Connect a different approach to a practical benefit rather than change alone'}},
 {step:{ar:'اكتب انطباعك أولاً، وبعدها افصله عن المعلومة المؤكدة',en:'Write the initial impression, then separate it from confirmed information'},check:{ar:'أي جزء من الانطباع تأكد بالفعل وأي جزء بعده احتمال؟',en:'Which part of the impression was confirmed, and which remains possible?'},watch:{ar:'لا تعوّض نقص المعلومة بقصة مريحة أو مخيفة',en:'Do not fill an information gap with a comforting or frightening story'}}
];
const method=(p:NatalBasis)=>methods[p.sign];
// Sensory preferences cannot be read from a relationship or career template.
// Here the symbolic lens changes how to compare real samples, never which
// perfume, color, food or design someone supposedly must enjoy.
const sensoryMethods:readonly SignMethod[]=[
 {step:{ar:'جرّب خيار واحد بكمية أو مساحة صغيرة قبل الشراء أو التغيير',en:'Try one option in a small amount or area before buying or changing it'},check:{ar:'بعد ما يهدأ حماس البداية، يبقى الخيار مريح إلك؟',en:'After the initial excitement fades, does the option still suit you?'},watch:{ar:'اترك وقت بين الانطباع الأول والاختيار النهائي',en:'Allow time between the first impression and the final choice'}},
 {step:{ar:'اختبر الراحة والخامة أو الرائحة أكثر من مرة بظروف استعمالك',en:'Test comfort, material or scent more than once in your usual setting'},check:{ar:'هل تفضله بعد الاستعمال لو بس لأنه مألوف؟',en:'Do you prefer it after use, or mainly because it is familiar?'},watch:{ar:'خلّ الإحساس الفعلي يراجع حكمك، حتى على الخيار المعتاد',en:'Let actual use challenge your view, even of a familiar option'}},
 {step:{ar:'قارن خيارين وحدد فرق واحد واضح بينهن بدل تبديل خيارات كثيرة',en:'Compare two options and identify one clear difference instead of cycling through many'},check:{ar:'تگدر تسمي الفرق اللي خلاك تفضّل واحد منهن؟',en:'Can you name the difference that made one option preferable?'},watch:{ar:'حدد عدد المقارنات حتى ما تضيع الفروق بكثرة الخيارات',en:'Limit comparisons so the differences do not disappear among too many options'}},
 {step:{ar:'لاحظ شلون يتغير إحساسك بالخيار حسب المكان والوقت والذكريات',en:'Notice how the setting, time and memories change your response to an option'},check:{ar:'تحب الخيار نفسه لو الجو والذكرى المرتبطة بيه؟',en:'Do you like the option itself, or the mood and memory associated with it?'},watch:{ar:'ميز الراحة الحسية الحالية عن تعلقك بصورة أو ذكرى',en:'Separate current sensory comfort from attachment to an image or memory'}},
 {step:{ar:'اختار تفصيل يعبر عن ذوقك وشوفه بعيداً عن إعلان أو رأي معجب',en:'Choose a detail that expresses your taste and assess it apart from advertising or praise'},check:{ar:'إذا ما شافه أو مدحه أحد، بعدك تختاره؟',en:'Would you still choose it if no one noticed or praised it?'},watch:{ar:'خلّ التفضيل الشخصي واضح قبل ما تدخل آراء الناس',en:'Clarify your preference before bringing in other people’s opinions'}},
 {step:{ar:'ركز على تفصيل مؤثر مثل الملمس أو الثبات أو تناسق اللون',en:'Focus on one useful detail such as texture, lasting quality or color balance'},check:{ar:'التفصيل فعلاً غيّر راحتك لو صار تدقيق بلا فائدة؟',en:'Did that detail change your comfort, or become checking without a benefit?'},watch:{ar:'حدد مستوى يكفيك من الجودة بدل البحث عن خيار كامل',en:'Define sufficient quality rather than searching for a perfect option'}},
 {step:{ar:'قارن الخيار مع بقية الأشياء اللي تستعملها وشوف الانسجام الفعلي',en:'Compare the option with what you already use and assess how they work together'},check:{ar:'الانسجام يريحك لو تختاره فقط حتى يناسب رأي غيرك؟',en:'Does that balance suit you, or mainly accommodate someone else’s opinion?'},watch:{ar:'احتفظ بتفضيلك حتى وأنت تقارن التنسيق العام',en:'Keep your own preference in view while considering the overall combination'}},
 {step:{ar:'اختبر تفصيل واحد بعمق وعلى مهل، ودوّن شنو تغير بانطباعك',en:'Examine one detail closely over time and note what changed in your impression'},check:{ar:'تفضيلك نابع من التجربة لو من قصة تسويقية حول الخيار؟',en:'Does your preference come from trying it, or from a story used to sell it?'},watch:{ar:'لا تحوّل الرائحة أو اللون إلى حكم على شخصيتك أو شخصية غيرك',en:'Do not turn a scent or color into a verdict about anyone’s personality'}},
 {step:{ar:'جرّب اختلاف بسيط عن المعتاد ضمن كلفة وحدود مريحة',en:'Try a small departure from your usual taste within a comfortable cost and scope'},check:{ar:'الخيار الجديد مناسب بعد التجربة لو الحماس كان لأنه مختلف؟',en:'Does the new option suit you after trying it, or mainly appeal through novelty?'},watch:{ar:'وازن الفضول مع تجربة فعلية قبل الالتزام بخيار كبير',en:'Balance curiosity with actual sampling before a larger commitment'}},
 {step:{ar:'حدد الاستعمال والميزانية وشوف إذا الخيار يخدمهن بمرور الوقت',en:'Define the use and budget, then see whether the option serves both over time'},check:{ar:'هل القيمة تجي من الاستعمال لو من السعر والاسم وحدهن؟',en:'Does the value come from use, or only from the price and label?'},watch:{ar:'افصل الجودة اللي تلاحظها عن السمعة والسعر',en:'Separate quality you can observe from reputation and price'}},
 {step:{ar:'جرّب تفصيل غير مألوف وقارنه بوظيفة أو راحة تهمك',en:'Try an unusual detail and compare it with a function or comfort you value'},check:{ar:'الاختلاف أضاف شي يعجبك لو كان الغرض بس أنه نادر؟',en:'Did the difference add something you like, or mainly make the option unusual?'},watch:{ar:'خلّ الاختلاف يخدم ذوقك بدل ما يصير شرطاً وحده',en:'Let being different serve your taste rather than become the only requirement'}},
 {step:{ar:'دوّن إحساسك الأول وبعدين أعد التجربة حتى تفرّق الجو عن الخاصية',en:'Record the first impression, then repeat the test to separate mood from the property itself'},check:{ar:'يبقى الإحساس نفسه إذا اختلف الضوء أو المكان أو الوقت؟',en:'Does the impression hold when the light, setting or time changes?'},watch:{ar:'لا تعتبر الصورة الجميلة بديل عن اختبار ما تستعمله فعلاً',en:'Do not let an appealing image replace testing what you will actually use'}}
];
const topicMethod=(topic:SoulTopic,p:NatalBasis)=>topic.categoryId===21?sensoryMethods[p.sign]:method(p);
const sensoryStylesAr=['التجربة السريعة والمحاولة الصغيرة','الراحة والثبات والملمس','المقارنة والتنوع','الألفة والذاكرة والجو','التعبير والحضور','التفاصيل والدقة','التنسيق والتوازن','العمق والتركيز على التفاصيل','الاستكشاف والتجديد','المنفعة والجودة','الاختلاف والابتكار','الانطباع والخيال'];
const sensoryStylesEn=['small, direct experiments','comfort, consistency and texture','comparison and variety','familiarity, memory and atmosphere','expression and presence','detail and precision','coordination and balance','depth and attention to detail','exploration and novelty','usefulness and quality','difference and innovation','impression and imagination'];
const topicStyle=(topic:SoulTopic,p:NatalBasis,ar:boolean)=>(topic.categoryId===21?(ar?sensoryStylesAr:sensoryStylesEn):(ar?styleAr:styleEn))[p.sign];
const sentence=(text:string)=>text.replace(/[.؟!\s]+$/u,'');
const inline=(text:string)=>text.charAt(0).toLowerCase()+text.slice(1);
function pairMeaning(pair:NatalAspect|undefined,ar:boolean):string{
 if(!pair)return ar?'ماكو رابط قريب بين المؤشرات المختارة يبرر افتراض انسجام أو صراع بينها؛ نراجع كل حاجة على حدة.':'No close link among the selected indicators supports assuming harmony or conflict; consider each need separately.';
 const needs=role(pair.first,ar)+(ar?' و':' and ')+role(pair.second,ar);
 if(ar){
  const meaning=pair.type===90?'نقرأه كشدّ محتمل بين حاجتين؛ حدد شنو يحتاجه كل جانب قبل الحسم':pair.type===180?'نقرأه كحاجة للتفاوض وتبادل المساحة بين الجانبين':pair.type===0?'يجمع هالحاجتين بموضوع واحد؛ ميّز الغرض اللي يخص كل جانب':pair.type===60?'يشير لتعاون ممكن يحتاج خطوة واعية تجمع الجانبين':'يشير لتنسيق أسهل نسبياً؛ تگدر تختبره بتصرف عملي';
  return 'الرابط المحسوب يخص '+needs+' تحديداً. بالتفسير الرمزي، '+meaning+'.';
 }
 const meaning=pair.type===90?'may compete over how to act; separate what each needs before deciding':pair.type===180?'may require negotiation rather than choosing one and suppressing the other':pair.type===0?'are closely joined; distinguish their purposes rather than treating them as one need':pair.type===60?'may cooperate through a deliberate step; the opening still requires effort':'may work together with relative ease; test that coordination rather than assuming an established skill';
 return 'The calculated link specifically concerns '+needs+'. Symbolically, these needs '+meaning+'.';
}
function composeSoul(topic:SoulTopic,basis:NatalBasis[]){
 const theme=getSoulTheme(topic.id),rule=soulRule(topic.id),specific=soulDeepFor(topic.id);
 const [a,b,c]=basis,first=topicMethod(topic,a),second=topicMethod(topic,b),pairs=soulAspectPairs(basis),lead=pairs[0];
 const aAr=topicStyle(topic,a,true),bAr=topicStyle(topic,b,true),aEn=topicStyle(topic,a,false),bEn=topicStyle(topic,b,false);
 const hard=(p:NatalAspect)=>p.type===90||p.type===180;
 const counter=lead?pairs.find(p=>hard(lead)?[60,120].includes(p.type):[60,120].includes(lead.type)&&hard(p)):undefined;
 const relationAr=pairMeaning(lead,true),relationEn=pairMeaning(lead,false);
 const strategyAr=lead?(hard(lead)?'وازن بين الاحتياجات قبل الحسم':lead.type===0?'ميّز غرض كل حاجة قبل جمعهن بخطوة وحدة':'حوّل التنسيق الممكن إلى تجربة صغيرة'):'تعامل مع كل حاجة بشكل منفصل قبل ربطهن بنتيجة واحدة';
 const strategyEn=lead?(hard(lead)?'Balance the needs before deciding':lead.type===0?'Separate each need’s purpose before combining them':'Turn possible coordination into a small experiment'):'Consider each need separately before linking them to one outcome';
 const resourceEn=inline(rule.resource.en),riskEn=inline(rule.risk.en.replace(/\bundefined\b/giu,'unclear'));
 const bridgeAr=a.sign===b.sign?
  'بالقراءة الرمزية، '+role(a.planet,true)+' و'+role(b.planet,true)+' يشتركون بأسلوب '+aAr+'؛ المهم تميّز الغرض اللي يخدمه كل جانب.':
  'بالقراءة الرمزية، جانب '+role(a.planet,true)+' نراجعه من زاوية '+aAr+'، وجانب '+role(b.planet,true)+' من زاوية '+bAr+'.';
 const bridgeEn=a.sign===b.sign?
  'Symbolically, '+role(a.planet,false)+' and '+role(b.planet,false)+' share '+aEn+', while serving different purposes.':
  'The symbolic lens pairs '+role(a.planet,false)+' with '+aEn+', and '+role(b.planet,false)+' with '+bEn+'.';
 const summary={
  ar:sentence(theme.focusAr)+'. خلّ الفكرة قابلة للتجربة: جرّب '+rule.resource.ar+'. '+bridgeAr+' '+strategyAr+'.',
  en:sentence(theme.focusEn)+'. Make this concrete by practicing '+resourceEn+'. '+bridgeEn+' '+strategyEn+'.'
 };
 const thirdAr=c&&(!lead||![lead.first,lead.second].includes(c.planet))?' ومن زاوية '+role(c.planet,true)+'، تظهر عدسة '+topicStyle(topic,c,true)+'؛ '+sentence(topicMethod(topic,c).watch.ar)+'.':'';
 const thirdEn=c&&(!lead||![lead.first,lead.second].includes(c.planet))?' The additional theme of '+role(c.planet,false)+' brings '+topicStyle(topic,c,false)+'. '+topicMethod(topic,c).watch.en+'.':'';
 const useHouse=a.house&&![21,23].includes(topic.categoryId);
 const settingAr=useHouse?' جرّب تلاحظ هالنمط ضمن '+houseFocusAr[a.house!]+'، خصوصاً إذا هذا هو سياق سؤالك.':'';
 const settingEn=useHouse?' Look for this pattern around '+houseFocusEn[a.house!]+', where that area is relevant to your question.':'';
 const deep={
  ar:'بخصوص '+topic.ar+'، انتبه أثناء التجربة إلى '+rule.risk.ar+'. '+relationAr+' '+sentence(first.watch.ar)+'، واسأل نفسك: '+second.check.ar+thirdAr+settingAr+(counter?' وبنفس الوقت، '+pairMeaning(counter,true)+' لذلك لازم تراعي الجانبين قبل الاستنتاج.':''),
  en:'For '+topic.en+', watch for '+riskEn+' when trying this. '+relationEn+' '+sentence(first.watch.en)+'. Ask yourself: '+second.check.en+thirdEn+settingEn+(counter?' At the same time, '+pairMeaning(counter,false)+' Consider both patterns before drawing a conclusion.':'')
 };
 return {summary,deep,
  strengths:{ar:[rule.resource.ar+'؛ '+(a.sign===b.sign?'استثمر '+aAr+' لخدمة '+role(a.planet,true)+' و'+role(b.planet,true)+'، وحدد شنو يحتاجه كل جانب.':'طوّرها عبر '+aAr+' بموضوع '+role(a.planet,true)+'، مع إعطاء '+role(b.planet,true)+' مساحة لأسلوب '+bAr+'.')],en:[rule.resource.en+'; '+(a.sign===b.sign?'use '+aEn+' for both '+role(a.planet,false)+' and '+role(b.planet,false)+', distinguishing what each needs.':'develop it through '+aEn+' in '+role(a.planet,false)+', while allowing '+bEn+' in '+role(b.planet,false)+'.')]},
  weaknesses:{ar:[rule.risk.ar+'؛ '+(a.sign===b.sign?'إذا استخدمت '+aAr+' بكل المواقف، راقب متى تحتاج تغيّر الطريقة حسب الغرض. ':'إذا أخذ أسلوب '+aAr+' كل المساحة على حساب '+bAr+'، ')+sentence(first.watch.ar)+'.'],en:[riskEn+'; '+(a.sign===b.sign?'if you use '+aEn+' in every situation, check when the purpose calls for a different approach. ':'if an approach based on '+aEn+' overrides the need for '+bEn+', ')+inline(sentence(first.watch.en))+'.']},
  example:{ar:sentence(specific.ar)+'. لتختبر المثال بهالأسلوب: '+sentence(first.step.ar)+'؛ بعدها اسأل نفسك: '+second.check.ar,en:sentence(specific.en)+'. To test that example: '+inline(sentence(first.step.en))+'; then ask: '+second.check.en},
  advice:{ar:sentence(theme.actionAr)+'. بالتطبيق: '+sentence(first.step.ar)+(a.sign===b.sign?'، وراقب إذا تگدر تستخدم نفس الأسلوب بدون ما تهمل اختلاف الحاجة الثانية':'، وبالخطوة الثانية '+sentence(second.step.ar))+'. '+strategyAr+'، وراجع النتيجة الفعلية قبل التعميم.',en:sentence(theme.actionEn)+'. In practice: '+inline(sentence(first.step.en))+(a.sign===b.sign?', checking that the shared approach still serves both distinct needs':', then '+inline(sentence(second.step.en)))+'. '+strategyEn+' and review the actual result before generalizing.'}
 };
}
/** Reader-facing prose and technical evidence share one interpretation. A
 * relation is always named by its actual pair, never by array positions. */
export function soulPlainReading(reading:SoulReading):{summary:Both;deep:Both}{
 if(reading.basisStatus!=='available'||reading.basis.length<2)return {summary:reading.summary,deep:reading.deep};
 const content=composeSoul(canonicalTopic(reading.topic),reading.basis);
 return {summary:content.summary,deep:content.deep};
}
export function soulReading(chart:Chart,topic:SoulTopic,options:SoulOptions={}):SoulReading{
 topic=canonicalTopic(topic);
 const basis=soulBasis(chart,topic,options);
 if(basis.length<2){
  const available=basis.length?{ar:'المتاح فقط: '+placementText(basis[0],true)+'.',en:'Only '+placementText(basis[0],false)+' is available.'}:{ar:'لا تتوفر مواضع صالحة من المؤشرات المطلوبة لهذا الموضوع.',en:'No valid placement among this topic’s required indicators is available.'};
  return {topic,basis,basisStatus:basis.length?'limited':'unavailable',
   summary:{ar:'البيانات غير كافية لتحليل «'+topic.ar+'».',en:'Insufficient data to interpret “'+topic.en+'”.'},deep:{ar:available.ar+' ما نكمل الفراغ بصفات أو استنتاجات شخصية.',en:available.en+' Missing evidence is not filled with personality claims.'},
   strengths:{ar:[],en:[]},weaknesses:{ar:[],en:[]},example:{ar:'',en:''},advice:{ar:'راجع بيانات الولادة والمؤشرات المتاحة لهذا الموضوع.',en:'Review the birth inputs and this topic’s available indicators.'},
   question:{ar:'هل بيانات الولادة كاملة ووقت الولادة معروف؟',en:'Are the birth inputs complete and is the birth time known?'},
   limitations:{ar:'هذا الموضوع يحتاج مؤشرين ولاديين صالحين على الأقل قبل تقديم قراءة رمزية. وقت الولادة المجهول يستبعد القمر والطالع ووسط السماء والبيوت.',en:'This topic requires at least two valid natal indicators for a symbolic reading. Unknown birth time excludes Moon, angles and houses.'},contradictory:false};
 }
 const pairs=soulAspectPairs(basis),mixed=pairs.some(p=>[90,180].includes(p.type))&&pairs.some(p=>[60,120].includes(p.type));
 const knownTime=options.knownTime!==false;
 const content=composeSoul(topic,basis);
 return {topic,basis,basisStatus:'available',
  summary:{ar:content.summary.ar+' بموضوع «'+topic.ar+'»: '+basis.map(p=>placementText(p,true)).join('، ')+'.',en:content.summary.en+' For “'+topic.en+'”: '+basis.map(p=>placementText(p,false)).join(', ')+'.'},
  deep:{ar:content.deep.ar+' '+aspectInterpretation(basis,true),en:content.deep.en+' '+aspectInterpretation(basis,false)},
  strengths:content.strengths,weaknesses:content.weaknesses,
  example:content.example,advice:content.advice,
  question:{ar:'بموضوع «'+topic.ar+'»، تذكّر موقف حقيقي من آخر فترة: شنو تصرفك بالضبط؟ وأي جزء من التفسير يشبهك، وأي جزء ما ينطبق عليك؟',en:'For “'+topic.en+'”, recall one recent real situation: what did you actually do? Which part of this reading fits, and which does not?'},
  limitations:{ar:'مواقع الأجرام بيانات حسابية؛ معاني الشخصية تأويلات تنجيمية غير مثبتة علمياً، وليست اختباراً نفسياً أو كشفاً لرغبات الآخرين. نقاط القوة والتحديات محاور للمراجعة، وليست صفات مؤكدة. '+(!knownTime?'وقت الولادة غير معروف: بقية المواضع تقريبية عند الظهر المحلي؛ استُبعد القمر والطالع ووسط السماء والبيوت واتصالاتها من هذه القراءة.':chart.cusps.length===12?'البيوت محسوبة بنظام Placidus من وقت ومكان الولادة.':'البيوت غير متاحة لهذا الحساب؛ لم نفترض طالعاً أو أرقام بيوت.'),en:'Celestial positions are calculated data; personality meanings are astrological interpretations without scientific validation, not psychological tests or access to private wishes. Strengths and challenges are reflection themes, not established traits. '+(!knownTime?'Birth time is unknown: remaining positions use approximate local noon; Moon, angles, houses and their aspects are excluded from this reading.':chart.cusps.length===12?'Placidus houses use birth time and location.':'Houses are unavailable for this calculation; no angles or houses are assumed.')},contradictory:mixed};
}

export function soulProfileSummary(chart:Chart,profile:Profile){
 const sun=chart.points.find(x=>x.id==='Sun'&&finitePosition(x)),moon=profile.known?chart.points.find(x=>x.id==='Moon'&&finitePosition(x)):undefined;
 const asc=profile.known&&chart.asc!==null&&Number.isFinite(chart.asc)?chart.asc:null;
 return {
  ar:(sun?'تُقرأ الشمس في '+arSigns[sign(sun.longitude)]+' هنا من زاوية الهوية والاختيار. ':'موضع الشمس غير متاح. ')+(moon?'والقمر في '+arSigns[sign(moon.longitude)]+' من زاوية الاحتياج العاطفي. ':profile.known?'موضع القمر غير متاح. ':'وقت الولادة غير معروف؛ لا نعتمد القمر في التفسير. ')+(asc!==null?'الطالع في '+arSigns[sign(asc)]+' يضيف موضوع الحضور والانطباع الأول. ':profile.known?'الطالع غير متاح لهذا الحساب. ':'لا نعتمد الطالع والبيوت من وقت مفترض. ')+'قارن الدلالات أدناه بتجربتك؛ لا تثبت الخارطة صفاتك أو أسرارك.',
  en:(sun?'The Sun in '+enSigns[sign(sun.longitude)]+' is read through identity and choice. ':'The Sun position is unavailable. ')+(moon?'The Moon in '+enSigns[sign(moon.longitude)]+' adds emotional needs. ':profile.known?'The Moon position is unavailable. ':'Unknown birth time means the Moon is excluded from interpretation. ')+(asc!==null?'Ascendant '+enSigns[sign(asc)]+' adds presentation and first impressions. ':profile.known?'Angles are unavailable for this calculation. ':'No assumed birth time supplies an Ascendant or houses. ')+'Compare these symbols with lived experience; a chart does not establish traits or secrets.'
 };
}
export function soulEvidenceText(basis:NatalBasis[],arabic:boolean){
 if(!basis.length)return arabic?'بيانات الميلاد غير كافية لهذا الموضوع.':'Insufficient natal data for this topic.';
 const places=basis.map(b=>placementText(b,arabic)+' '+(((b.longitude%30)+30)%30).toFixed(2)+'°'+(b.house?(arabic?' · البيت ':' · house ')+b.house:'')+(b.retrograde?(arabic?' · متراجع ظاهرياً':' · apparent retrograde'):''));
 const pairs=soulAspectPairs(basis).map(p=>name(p.first,arabic)+' '+(arabic?aspectNamesAr:aspectNamesEn)[p.type]+' '+name(p.second,arabic)+(arabic?' · الأورب ':' · orb ')+p.orb.toFixed(2)+'°');
 return places.join(' | ')+(pairs.length?' — '+pairs.join(' | '):'');
}
