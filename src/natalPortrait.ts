import type {Chart} from './engine.ts';
import {distance,houseNumber} from './math.ts';

/** Chart-grounded *symbolic* interpretation. Birth data, not the profile name,
 * selects each domain's separate signs, houses and supported major contacts.
 * Life events and private preferences cannot be established from astrology. */
type Language='ar'|'en';
type Bi={ar:string;en:string};
type Point=Chart['points'][number];
const signs:Bi[]=[
 {ar:'الحمل',en:'Aries'},{ar:'الثور',en:'Taurus'},{ar:'الجوزاء',en:'Gemini'},
 {ar:'السرطان',en:'Cancer'},{ar:'الأسد',en:'Leo'},{ar:'العذراء',en:'Virgo'},
 {ar:'الميزان',en:'Libra'},{ar:'العقرب',en:'Scorpio'},{ar:'القوس',en:'Sagittarius'},
 {ar:'الجدي',en:'Capricorn'},{ar:'الدلو',en:'Aquarius'},{ar:'الحوت',en:'Pisces'}
];
const decision:Bi[]=[
 {ar:'تفضّل تبادر وتجرّب القرار بدل ما تنتظر موافقة الكل',en:'prefer testing a decision yourself over waiting for universal approval'},
 {ar:'تقيس الخيار على الأمان والنتيجة المستمرة، مو الحماس الأول',en:'judge choices by steady results rather than first excitement'},
 {ar:'تفتح أكثر من احتمال وتسأل قبل تثبّت رأيك',en:'explore competing possibilities before settling on a view'},
 {ar:'تربط قراراتك بإحساسك بالأمان وتأثيرها على المقربين',en:'weigh safety and the impact on people close to you'},
 {ar:'تريد القرار يعبّر عن كرامتك ويبين جهدك',en:'want choices to reflect dignity and visible effort'},
 {ar:'تبدأ من التفاصيل والعيوب اللي ممكن تصلحها قبل الخطوة',en:'check details and correctable flaws before moving ahead'},
 {ar:'تفكر بحق كل طرف وتأثير القرار على علاقتكم',en:'weigh fairness and the effect on each side of a relationship'},
 {ar:'ما تعطي ثقتك بسهولة وتحب تفهم الدوافع قبل الحسم',en:'guard trust and seek underlying motives before committing'},
 {ar:'تنجذب للفرصة اللي توسّع تجربتك حتى لو بيها مجهول',en:'gravitate toward opportunities that broaden your experience'},
 {ar:'تختار مسار متدرّج تگدر تتحمّل مسؤوليته للآخر',en:'favor gradual commitments you can sustain'},
 {ar:'تشكّك بالطريقة المعتادة وتريد حل يترك إلك حرية الاختيار',en:'question conventional routes and preserve personal freedom'},
 {ar:'تشوف احتمالات متعددة وتحتاج تفصل الإحساس عن الدليل',en:'see many possibilities and need to separate intuition from evidence'}
];
const emotion:Bi[]=[
 {ar:'تحتاج مساحة سريعة تعبّر بيها قبل ما يبرد شعورك',en:'need room to express a feeling while it is immediate'},
 {ar:'ترتاح للثبات واللمسات العملية أكثر من الكلام الكبير',en:'settle with consistency and tangible care more than grand words'},
 {ar:'يرتاح بالك إذا حچيت وفهمت شنو صار خطوة بخطوة',en:'find clarity by talking through what happened'},
 {ar:'تحس بالطمأنينة من القرب والاهتمام والأجواء المألوفة',en:'seek reassurance through closeness and familiar care'},
 {ar:'تحتاج تقدير واضح وما تحب ينمر جهدك بلا انتباه',en:'need your effort acknowledged instead of overlooked'},
 {ar:'الترتيب وحل المشكلة البسيطة يهدّونك أكثر من التنظير',en:'recover by sorting details and addressing practical problems'},
 {ar:'يهمك تنسمع وجهة نظرك وينحفظ الإنصاف بالعلاقة',en:'value being heard and treated fairly in a relationship'},
 {ar:'تفضّل الخصوصية والثقة قبل ما تحچي عن شعور عميق',en:'require privacy and earned trust before opening up deeply'},
 {ar:'تحتاج نفس جديد وتغيير جو حتى تطلع من الضغط',en:'restore yourself with breathing room and a change of scene'},
 {ar:'تريد وضوح بالمسؤوليات حتى ما يصير الضغط مفتوح',en:'feel steadier when duties and expectations are defined'},
 {ar:'تحتاج مساحة خاصة حتى لو تحب الناس القريبين منك',en:'need personal space even when you care about others'},
 {ar:'تتأثر بالأجواء وتحتاج هدوء وحدود تحمي حساسيتك',en:'absorb the mood around you and benefit from calm boundaries'}
];
const intimacy:Bi[]=[
 {ar:'تميل للمبادرة الصريحة وتحب تعرف إذا الاهتمام متبادل بسرعة',en:'favor candid initiative and quickly checking mutual interest'},
 {ar:'تبحث عن استمرارية واهتمام ملموس قبل تعلق أكبر',en:'look for sustained care and reliability before deeper commitment'},
 {ar:'الحوار والضحكة والتجديد يشدّون انتباهك',en:'enjoy conversation, playfulness and novelty'},
 {ar:'تقربك الثقة والاحتواء والإحساس أن الطرف الثاني حاضر',en:'value attentive care and a sense of emotional safety'},
 {ar:'التقدير الواضح والدفء بالتعامل يهمّانك',en:'appreciate warmth and openly expressed admiration'},
 {ar:'تفاصيل الاهتمام اليومية تعني إلك أكثر من الاستعراض',en:'notice everyday acts of care more than displays'},
 {ar:'تريد توافق واحترام وتبادل واضح بالمبادرة',en:'seek reciprocity, respect and balanced initiative'},
 {ar:'تفضّل قرب عميق وتطلب صدق قبل كشف نقاط ضعفك',en:'seek depth and trust before revealing vulnerability'},
 {ar:'تنجذب للانفتاح والتجارب الجديدة من دون شعور بالحصار',en:'value openness, discovery and room to explore'},
 {ar:'تقيّم العلاقة على أفعال ثابتة والتزام واقعي',en:'judge a bond by consistent action and realistic commitments'},
 {ar:'تحتاج صداقة ومساحة حرّة بجانب التقارب',en:'want friendship and autonomy alongside closeness'},
 {ar:'تنجذب للتعاطف والخيال لكن تحتاج وضوح بالواقع',en:'value empathy and imagination while needing real clarity'}
];
const action:Bi[]=[
 {ar:'تتحرك إذا وضحت الفكرة بدل ما تنتظر كل الظروف',en:'act once the idea is clear rather than waiting for perfect conditions'},
 {ar:'تمشي بالتدريج وتثبت على الخطوة اللي بدأتها',en:'move steadily and keep going once you start'},
 {ar:'تجرّب حلين وتبدل بينهم إذا تغيّرت المعلومة',en:'test different approaches and adapt to new information'},
 {ar:'تحسب أثر الخطوة على جو الأمان والعلاقة',en:'consider how action affects security and closeness'},
 {ar:'تفضّل خطوات تبين مبادرتك ووجودك',en:'like visible gestures of initiative'},
 {ar:'تجزّئ الفعل لمهام صغيرة وتدقق التنفيذ',en:'break action into manageable and well-checked steps'},
 {ar:'تفاوض قبل ما تتحرك حتى ما تضيع الموازنة',en:'coordinate first so both sides stay represented'},
 {ar:'تتصرف بحسم بعد ما تتأكد من الثقة وحدودك',en:'act decisively after clarifying trust and boundaries'},
 {ar:'تندفع لتجربة جديدة وتتعلم من الحركة',en:'learn through trying something new'},
 {ar:'تلتزم بخطة واضحة بدل الحماس المتقطع',en:'prefer a clear plan to bursts of enthusiasm'},
 {ar:'تستعمل طريقة غير مألوفة حتى تحتفظ باستقلالك',en:'try unconventional approaches to preserve freedom'},
 {ar:'تميل تستجيب للإلهام وتحتاج وقت تراجع النتيجة',en:'follow inspiration and benefit from reviewing its outcome'}
];
const thinking:Bi[]=[
 {ar:'تحچي بخلاصة مباشرة وما تحب اللف والدوران',en:'get to the point quickly and directly'},
 {ar:'تثبت على فكرة مبنية على تجربة ملموسة',en:'build ideas from tangible experience'},
 {ar:'تربط المعلومات بسرعة وتفتح أسئلة من أكثر من اتجاه',en:'connect new information and question it from several angles'},
 {ar:'تنتبه للنبرة والخلفية العاطفية وراء الكلام',en:'notice tone and emotional context in speech'},
 {ar:'تشرح موقفك بثقة وتحاول تخلي الفكرة واضحة للحاضرين',en:'express your view with confidence and presence'},
 {ar:'تلاحظ التناقضات الصغيرة وتحللها بدقة',en:'spot fine inconsistencies and analyze them closely'},
 {ar:'تشوف حجّة الطرف الثاني قبل ما تقدم اعتراضك',en:'consider the other side before making your case'},
 {ar:'تحب تسأل عن اللي ما ينحچي وتفتش المعنى الأعمق',en:'probe what is unsaid and look for deeper meaning'},
 {ar:'تفكر بالصورة الكبيرة وتربط القرار بتجربة أوسع',en:'start with the bigger picture and wider possibilities'},
 {ar:'ترتب معلوماتك على شكل خطوات وشروط واضحة',en:'organize information into conditions and steps'},
 {ar:'تراجع الأفكار السائدة وتبحث عن بديل مستقل',en:'challenge assumptions and look for independent alternatives'},
 {ar:'تلتقط الجو العام وتحتاج تراجع التفاصيل المكتوبة',en:'sense the overall mood and benefit from checking written specifics'}
];
const commitments:Bi[]=[
 {ar:'أن لا تستعجل وتترك مساحة لقرار الطرف الثاني',en:'slowing down and allowing the other person space'},
 {ar:'أن لا يتحول حرصك على الاستقرار إلى عناد',en:'keeping the need for stability from becoming rigidity'},
 {ar:'أن لا يشتتك تبديل الاحتمالات',en:'not becoming scattered among too many alternatives'},
 {ar:'أن لا تتحمل قلق الأقربين وحدك',en:'not taking responsibility for everyone else’s worries'},
 {ar:'أن لا يصير التقدير الخارجي شرط لقيمة شغلك',en:'not depending on praise to value your work'},
 {ar:'أن لا تمنعك المثالية من إنهاء المهمة',en:'not letting perfectionism prevent completion'},
 {ar:'أن لا ترضي الكل على حساب حدودك',en:'not pleasing everyone at the expense of boundaries'},
 {ar:'أن لا تخلي الحذر يصير شك دائم',en:'not turning caution into permanent suspicion'},
 {ar:'أن لا توعد بشي أكبر من إمكانياتك',en:'not promising more than you can realistically deliver'},
 {ar:'أن لا يصير الالتزام ضغط مستمر بلا راحة',en:'not letting duty become endless pressure'},
 {ar:'أن لا يصير استقلالك عزلة عن التعاون',en:'not mistaking independence for isolation'},
 {ar:'أن لا تخلي التخمين بديل عن وضوح المطلوب',en:'not letting assumptions replace clear expectations'}
];
const houses:Bi[]=[
 {ar:'',en:''},
 {ar:'تقديم نفسك للناس والبداية من جديد',en:'self-presentation and fresh starts'},
 {ar:'الفلوس والالتزام بالموارد',en:'money and resource commitments'},
 {ar:'الحچي والرسائل والتعلّم',en:'messages, communication and learning'},
 {ar:'حياتك بالبيت وعلاقتك بالأهل',en:'home and family life'},
 {ar:'الحب والتعارف والمتعة',en:'dating, romance and enjoyment'},
 {ar:'الروتين والشغل اليومي',en:'routines and everyday work'},
 {ar:'التفاهم مع شريك أو طرف مقابل',en:'one-to-one relationships'},
 {ar:'الثقة والحدود والمال المشترك',en:'trust and shared resources'},
 {ar:'السفر والتعلم وتغيير النظرة',en:'travel, education and beliefs'},
 {ar:'موقعك المهني والمسؤولية العامة',en:'career and public responsibility'},
 {ar:'الأصدقاء والاختلاط الاجتماعي',en:'friends and social circles'},
 {ar:'الخصوصية والخلوة والراحة',en:'privacy, solitude and rest'}
];
const roleNames:Record<string,Bi>={
 Sun:{ar:'الهوية والقرار',en:'identity and decisions'},
 Moon:{ar:'الأمان العاطفي',en:'emotional safety'},
 Mercury:{ar:'أسلوب الفهم والكلام',en:'thinking and speech'},
 Venus:{ar:'التقدير والتقارب',en:'affection and values'},
 Mars:{ar:'المبادرة والاندفاع',en:'initiative and drive'},
 Jupiter:{ar:'الفرص والتوسع',en:'growth and opportunity'},
 Saturn:{ar:'المسؤوليات والحدود',en:'responsibility and boundaries'}
};
const signIndex=(point:Point)=>Math.floor((((point.longitude%360)+360)%360)/30);
const relevant=(c:Chart,id:string)=>c.points.find(p=>p.id===id&&Number.isFinite(p.longitude));
const isRelevant=(id:string)=>['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'].includes(id);
type Link={id:string;angle:number;orb:number};
function link(c:Chart,first:string,candidates:string[],knownTime:boolean):Link|null{
 const p=relevant(c,first);if(!p)return null;
 const list:Link[]=[];
 for(const other of candidates){
  if(other===first||!isRelevant(other)||(other==='Moon'&&!knownTime))continue;
  const q=relevant(c,other);if(!q)continue;
  const d=distance(p.longitude,q.longitude);
  for(const angle of [0,60,90,120,180]){
   const orb=Math.abs(d-angle);
   const max=['Sun','Moon'].includes(first)||['Sun','Moon'].includes(other)?6:4.5;
   if(orb<=max)list.push({id:other,angle,orb});
  }
 }
 return list.sort((a,b)=>a.orb-b.orb||a.id.localeCompare(b.id))[0]??null;
}
const linkText=(l:Link|null,language:Language):string=>{
 if(!l)return '';
 const topic=roleNames[l.id]?.[language]??(language==='ar'?'موضوع آخر':'a second priority');
 if(language==='ar')return l.angle===90||l.angle===180?' ويظهر شدّ إضافي ويا '+topic+'؛ بهالحالة تحتاج توازن بين الاحتياجين.':l.angle===0?' ويبرز ترابط قوي ويا '+topic+'؛ لازم تميّز حاجة عن الأخرى.':' ويتقاطع الموضوع بشكل أسهل ويا '+topic+'، إذا الظروف الواقعية تسمح.';
 return l.angle===90||l.angle===180?' A second competing need involves '+topic+'; balance the two.':l.angle===0?' This is closely tied to '+topic+'; distinguish their demands.':' This may work alongside '+topic+' when actual circumstances support it.';
};
const knownHouse=(c:Chart,point:Point|undefined,knownTime:boolean)=>point&&knownTime&&c.cusps.length===12?houseNumber(point.longitude,c.cusps):0;
const focus=(c:Chart,point:Point|undefined,knownTime:boolean,language:Language)=>{
 const n=knownHouse(c,point,knownTime);
 return n>=1&&n<=12?houses[n][language]:'';
};
const suit=(arr:Bi[],point:Point,language:Language)=>arr[signIndex(point)][language];
export function natalPortrait(chart:Chart,knownTime:boolean,language:Language):string[]{
 const sun=relevant(chart,'Sun'),moon=knownTime?relevant(chart,'Moon'):undefined;
 const mercury=relevant(chart,'Mercury'),venus=relevant(chart,'Venus'),mars=relevant(chart,'Mars');
 const saturn=relevant(chart,'Saturn'),jupiter=relevant(chart,'Jupiter');
 if(!sun||!mercury||!venus||!mars)return [language==='ar'?'بيانات الميلاد ناقصة؛ ما أگدر أطلع بصمة شخصية موثوقة من غير حساب مكتمل.':'Birth information is incomplete, so a personal reading cannot be supported.'];
 const choice=link(chart,'Sun',['Saturn','Mercury','Mars','Jupiter'],knownTime);
 const feeling=moon?link(chart,'Moon',['Venus','Mercury','Saturn','Sun'],knownTime):null;
 const romance=link(chart,'Venus',['Mars','Saturn','Moon','Sun'],knownTime);
 const work=link(chart,'Mercury',['Saturn','Jupiter','Mars','Sun'],knownTime);
 const life=(point:Point,domain:string)=>{
  const f=focus(chart,point,knownTime,language);
  if(!f)return '';
  return language==='ar'?' والساحة اللي تستحق انتباهك أكثر هي '+f+'.':' A relevant area for reflection is '+f+'.';
 };
 if(language==='ar'){
  return [
   'بالقرارات، '+suit(decision,sun,language)+'. وبطريقة التفكير، '+suit(thinking,mercury,language)+'.'+linkText(choice,language)+life(sun,'decision')+(choice?.angle===90||choice?.angle===180?' إذا صار شدّ بقرار، اختار شنو يهمك أولاً قبل ما تضغط على نفسك.':' إذا عندك قرار مهم، حدد خطوة واقعية تگدر تراجع نتيجتها.'),
   moon?
    'بمشاعرك، '+suit(emotion,moon,language)+'. وبالتعبير عن الاهتمام، '+suit(intimacy,venus,language)+'.'+linkText(feeling,language)+life(moon,'emotion')+(feeling?.angle===90||feeling?.angle===180?' إذا أحد ضايقك، وضح شنو تحتاج قبل ما تفسر نواياه.':' إذا صار موقف حساس، قارن انطباعك بتصرف الشخص الحقيقي.'):
    'بمشاعرك، ما راح أحدد حاجتك النفسية من موضع غير مؤكد لأن ساعة الميلاد مجهولة. لكن بأسلوب التقارب ممكن '+suit(intimacy,venus,language)+'. خذ الكلام كموضوع للتفكير، مو وصف مؤكد.',
   'بالعلاقات، '+suit(intimacy,venus,language)+'. أما بالمبادرة، '+suit(action,mars,language)+'.'+linkText(romance,language)+life(venus,'romance')+(romance?.angle===90||romance?.angle===180?' لذلك إذا اختلف الإيقاع بينك وبين شريك، ناقش الحدود بصراحة.':' إذا تريد تتقرب لشخص، خلّي تجاوبه الواقعي هو المعيار.'),
   'بالشغل والحچي، '+suit(thinking,mercury,language)+'. '+(saturn?'وأكثر شي يحتاج انتباهك هو '+suit(commitments,saturn,language)+'. ':jupiter?'والفرص تميل ترتبط عندك بـ'+suit(decision,jupiter,language)+'. ':'')+linkText(work,language)+life(mercury,'work')+(work?.angle===90||work?.angle===180?' تجنّب توعد تحت الضغط قبل توضح التفاصيل.':' اختار مهمة محددة وقيّم النتيجة قبل ما توسّع التزامك.')
  ];
 }
 return [
  'In decisions you may '+suit(decision,sun,language)+'. In thinking, you may '+suit(thinking,mercury,language)+'.'+linkText(choice,language)+life(sun,'decision')+(choice?.angle===90||choice?.angle===180?' Under pressure, identify your priority before trying to settle everything.':' For an important decision, test one reversible step first.'),
  moon?
   'Emotionally you may '+suit(emotion,moon,language)+'. In showing affection, you may '+suit(intimacy,venus,language)+'.'+linkText(feeling,language)+life(moon,'emotion')+(feeling?.angle===90||feeling?.angle===180?' If upset, state what you need before assuming intent.':' If a situation feels sensitive, compare impressions with actual behavior.'):
   'Your emotional needs cannot be inferred confidently without a known birth time. In expressing affection, you may '+suit(intimacy,venus,language)+'. This is for reflection, not a factual personality assessment.',
  'In relationships, you may '+suit(intimacy,venus,language)+'. When initiating, you may '+suit(action,mars,language)+'.'+linkText(romance,language)+life(venus,'romance')+(romance?.angle===90||romance?.angle===180?' If your preferred pace differs, discuss boundaries directly.':' When interested in someone, their actual response matters most.'),
  'At work and in conversations you may '+suit(thinking,mercury,language)+'. '+(saturn?'A useful caution is '+suit(commitments,saturn,language)+'. ':jupiter?'Opportunities may involve '+suit(decision,jupiter,language)+'. ':'')+linkText(work,language)+life(mercury,'work')+(work?.angle===90||work?.angle===180?' Avoid committing under pressure before clarifying the facts.':' Define one task and judge its outcome before expanding your obligations.')
 ];
}
