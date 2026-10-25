import {aspects,distance,houseNumber,type Point} from './math.ts';
import type {Chart} from './engine.ts';
import {occurrenceLanguage,type SkyBodyId,type WholeSkyOccurrence} from './wholeSkyBroadcast.ts';
import type {SkyLanguage} from './todaySkyBrief.ts';

/** Use birth-chart houses and precisely computed planetary positions to make
 * event meanings personal. We never claim actual future external happenings.
 * Unknown birth time -> no invented house. Orb/angles stay in the calculation.
 */
export type PersonalSkyContext={
 event:WholeSkyOccurrence;at:Date;natal:Chart;skyAtEvent:readonly Point[];
 knownBirthTime:boolean;lang:SkyLanguage;
};
export type PersonalSkyStory={title:string;now:string;next:string;action:string;focus:string;personal:boolean};
type Bi={ar:string;en:string};
type HouseTopic={area:Bi;now:Bi;later:Bi;step:Bi};
const houses:readonly HouseTopic[]=[
 {area:{ar:'صورتك الشخصية ومبادراتك',en:'your personal presence and initiative'},
 now:{ar:'إذا عندك مقابلة أو بداية جديدة، طريقة تقديمك لنفسك مهمة أكثر من المظاهر.',en:'If an introduction or fresh start is pending, prioritize how you present yourself.'},
 later:{ar:'خلال الفترة الجاية راقب شلون الناس تتجاوب ويّه مبادرتك؛ عدّل أسلوبك بناءً على الرد، مو التخمين.',en:'Watch how people actually respond to your initiative, then adjust.'},
 step:{ar:'جهّز كلام واضح عن هدفك قبل مكالمة أو لقاء.',en:'Prepare a clear introduction before a call or meeting.'}},
 {area:{ar:'المصاريف والدخل والقيمة اللي تحصل عليها',en:'spending, income and value'},
 now:{ar:'إذا تفكر بشراء أو اتفاق مالي، انتبه للسعر والشروط قبل الحماس.',en:'If a purchase or financial agreement is pending, check the price and terms.'},
 later:{ar:'بالأيام الجاية شوف شنو يستاهل تدفع عليه وشنو ممكن تأجله؛ لا تتعامل ويّه أي عرض كأنه مضمون.',en:'Compare which expenses are worthwhile and which can wait; do not assume an offer will work out.'},
 step:{ar:'راجع مصروف واحد أو سعر عرض قبل الموافقة.',en:'Check one expense or quoted price before agreeing.'}},
 {area:{ar:'الرسائل والمواعيد والتنقلات القصيرة',en:'messages, appointments and short trips'},
 now:{ar:'إذا تنتظر رد أو عندك مشوار، ممكن تحتاج توضح المعلومة الناقصة بنفسك.',en:'If waiting on a reply or planning a short trip, clarify the missing detail.'},
 later:{ar:'تابع الرسائل والتغييرات بالمواعيد، خصوصاً إذا شخص ثاني يعتمد على تأكيدك.',en:'Follow up on messages and schedule changes, especially where others need confirmation.'},
 step:{ar:'أكد عنوان ووقت موعد أو ابعث سؤال مباشر.',en:'Confirm an address and time or ask one direct question.'}},
 {area:{ar:'البيت والعائلة وراحتك',en:'home, family and comfort'},
 now:{ar:'إذا أكو موضوع بالبيت أو نقاش ويا الأهل، وضّح احتياجك بدون ما تحول الحوار إلى لوم.',en:'For home matters or family conversations, state your need without blame.'},
 later:{ar:'الأيام الجاية فرصة عملية تراجع ترتيب البيت أو الحدود ويّه الناس القريبين؛ انتبه للردود الفعلية.',en:'Review home arrangements or boundaries with close people based on their actual responses.'},
 step:{ar:'رتّب موضوع منزلي معلّق أو احچي بهدوء ويا شخص قريب.',en:'Resolve one pending home task or have a calm conversation.'}},
 {area:{ar:'التعارف والرومانسية والمتعة',en:'dating, romance and enjoyment'},
 now:{ar:'إذا معجب بأحد أو تفكر بطلعة، خَلّ المبادرة لطيفة وواضحة بدون افتراض اهتمام الطرف الثاني.',en:'If interested in someone or planning an outing, be direct without assuming mutual interest.'},
 later:{ar:'بالأيام الجاية راقب إذا التقارب متبادل. إذا ماكو تجاوب، لا تعتبر السكوت وعد.',en:'Look for mutual response; silence is not a promise.'},
 step:{ar:'اقترح لقاء بسيط بوقت محدد واترك مجال لجواب صريح.',en:'Suggest a simple meetup at a specific time, then leave room for a clear reply.'}},
 {area:{ar:'دوامك وروتينك وطاقتك اليومية',en:'daily work, routines and energy'},
 now:{ar:'إذا متراكم عليك شغل، فرّق بين الضروري والشي اللي تگدر تأجله.',en:'If work is piling up, distinguish urgent items from what can wait.'},
 later:{ar:'راقب إذا الخطة اليومية واقعية؛ إذا اختلفت الظروف عدّل المهام بدل إضافة ضغط جديد.',en:'Check whether your daily plan is realistic, and adjust it rather than adding pressure.'},
 step:{ar:'حدد شغلتين مهمات ورتّب وقتهن بدون تشتت.',en:'Prioritize two concrete tasks and schedule them.'}},
 {area:{ar:'الشراكات والعلاقات والاتفاقات',en:'partnerships, relationships and agreements'},
 now:{ar:'إذا عندك علاقة أو اتفاق مو محسوم، الأهم تتأكد شنو يريد كل طرف فعلاً.',en:'If a relationship or agreement is unresolved, clarify what each side actually wants.'},
 later:{ar:'بالأيام الجاية ممكن يظهر احتياج لتعديل توقعات أو حدود؛ لا تعتبر الكلام الحلو وحده التزام.',en:'You may need to revisit expectations or boundaries; words alone are not a commitment.'},
 step:{ar:'اسأل سؤال واحد مباشر عن النية أو موعد الالتزام.',en:'Ask one direct question about intentions or timing.'}},
 {area:{ar:'المال المشترك والالتزامات والثقة',en:'shared finances, commitments and trust'},
 now:{ar:'إذا عندك مبلغ مشترك أو وعد مالي، راجع التفاصيل ومنو مسؤول عن شنو.',en:'For shared money or a financial promise, check terms and responsibilities.'},
 later:{ar:'بالأيام الجاية دقّق بحدود المشاركة والخصوصية قبل أي خطوة يصعب التراجع عنها.',en:'Check shared boundaries and privacy before an irreversible step.'},
 step:{ar:'ثبّت شرط مالي أو شخصي مكتوب قبل الموافقة.',en:'Confirm one financial or personal term in writing.'}},
 {area:{ar:'السفر البعيد والدراسة والخطط الخارجية',en:'long-distance travel, education and overseas plans'},
 now:{ar:'إذا تفكر بسفرة أو كورس أو معاملة خارجية، لا تعتمد على معلومة قديمة.',en:'For a trip, course or overseas paperwork, do not rely on outdated information.'},
 later:{ar:'بالأيام الجاية ممكن تحتاج تقارن مواعيد وتكاليف وخيارات بديلة قبل تأكيد الخطة.',en:'You may need to compare schedules, costs and backup options before finalizing.'},
 step:{ar:'أكد شرط سفر واحد أو صلاحية موعد أو حجز.',en:'Check one travel requirement, date or booking.'}},
 {area:{ar:'الشغل والسمعة المهنية والنتائج',en:'career, professional reputation and outcomes'},
 now:{ar:'إذا عندك مشروع أو قرار بالشغل، راح يفيدك تحدد النتيجة المطلوبة بدل الكلام العام.',en:'For a work project or decision, define the desired result precisely.'},
 later:{ar:'تابع شنو أنجزت فعلاً وشلون انقاس العمل؛ لا تعتبر الموافقة الشفهية نهاية الموضوع.',en:'Track actual deliverables and how work is measured; verbal approval may not settle everything.'},
 step:{ar:'اكتب نتيجة واحدة ومَن مسؤول عنها ومتى تخلص.',en:'Write down one deliverable, its owner and deadline.'}},
 {area:{ar:'الأصدقاء والعلاقات الاجتماعية والمجموعات',en:'friends, social connections and groups'},
 now:{ar:'إذا أكو دعوة أو تعاون جديد، انتبه إذا المصلحة والتوقعات واضحة عند الجميع.',en:'For a new invitation or collaboration, clarify shared expectations.'},
 later:{ar:'بالأيام الجاية راقب مَن يتابع فعلاً بعد أول تواصل؛ الفعل أهم من الحماس الأول.',en:'Notice who follows through after the first conversation.'},
 step:{ar:'تواصل ويّه شخص واحد برسالة محددة الغرض.',en:'Reach out to one person with a clear purpose.'}},
 {area:{ar:'الخصوصية والنوم والأمور المؤجلة',en:'privacy, rest and unfinished matters'},
 now:{ar:'إذا ذهنك مشغول بموضوع قديم، لا تحسمه وأنت متعب أو المعلومات ناقصة.',en:'If an old issue weighs on you, avoid deciding while tired or missing facts.'},
 later:{ar:'بالأيام الجاية راقب احتياجك للهدوء وراجع الأمور اللي تأجلت بدون ما تتصور أسوأ سيناريو.',en:'Make time for rest and address unfinished matters without assuming the worst.'},
 step:{ar:'خصص وقت هادئ لمراجعة موضوع واحد قبل الرد عليه.',en:'Reserve quiet time to review one issue before responding.'}}
];
const planetScenes:Record<SkyBodyId,{now:Bi;later:Bi;step:Bi}>={
 Sun:{now:{ar:'إذا قدّامك قرار يمس صورتك أو مسؤوليتك، خلك صريح مع نفسك بشنو تريد.',en:'For an important personal decision, know what you want.'},later:{ar:'بعدها شوف إذا خطواتك تتفق ويّه أولوياتك، مو بس آراء الناس.',en:'Check your next steps against your priorities, not only others’ opinions.'},step:{ar:'حدد أولوية واحدة',en:'Set one priority'}},
 Moon:{now:{ar:'إذا موقف أثر على مزاجك، لا تفترض إن شعورك يثبت نية الطرف الثاني.',en:'Do not treat an emotional reaction as proof of another person’s intent.'},later:{ar:'خلال الساعات الجاية ممكن تتبدل نظرتك بعد ما تهدأ؛ راجع الواقع.',en:'Your impression may change after some rest; review the facts.'},step:{ar:'اكتب شنو تحتاج قبل أي رد',en:'Name your need before replying'}},
 Mercury:{now:{ar:'إذا أكو مكالمة أو حجز أو رسالة، تأكد إن المعنى واضح للطرفين.',en:'For a call, booking or message, make sure both sides understand it.'},later:{ar:'بعدها تابع الرد الحقيقي، وإذا تغير موعد أو شرط اطلب تأكيد جديد.',en:'Follow the actual reply and reconfirm changed details.'},step:{ar:'راجع رسالة أو موعد',en:'Double-check a message or appointment'}},
 Venus:{now:{ar:'إذا عندك إعجاب أو اتفاق أو صرف، لا تعتمد على الانطباع وحده.',en:'In attraction, agreements or spending, do not rely on first impressions alone.'},later:{ar:'بالأيام الجاية راقب التوازن بين اللي تقدمه واللي يرجع إلك فعلياً.',en:'Watch whether affection, effort or value is actually reciprocated.'},step:{ar:'حدد توقع واضح بعلاقة أو ميزانية',en:'Clarify one relationship expectation or budget'}},
 Mars:{now:{ar:'إذا تشعر مستعجل على نتيجة، فكر وين تنصرف طاقتك بدون ما يصير صدام.',en:'If you feel impatient, channel your energy without escalation.'},later:{ar:'راقب إذا المبادرة جابت نتيجة أو تحتاج تغيير أسلوب، بدل تكرار نفس الضغط.',en:'Check whether your initiative helped before pushing again.'},step:{ar:'ابدأ بمهمة قابلة للإنجاز',en:'Start one manageable task'}},
 Jupiter:{now:{ar:'إذا عندك فرصة شغل أو سفر أو تجربة جديدة، افحص فائدتها قبل الوعود الكبيرة.',en:'For work, travel or a new opportunity, check its value first.'},later:{ar:'بالأسابيع الجاية راقب التكاليف والفرص الواقعية بدل توقع التوسع تلقائياً.',en:'Track actual costs and opportunities rather than assuming automatic growth.'},step:{ar:'قارن خيارين قبل القرار',en:'Compare two options'}},
 Saturn:{now:{ar:'إذا عليك التزام، راجع هل الوقت والشروط بيدك فعلاً.',en:'If you have an obligation, check whether its timing and terms are realistic.'},later:{ar:'بالأسابيع الجاية يفيدك تتبع إنجازك خطوة خطوة حتى ما تتراكم الوعود.',en:'Track progress step by step instead of accumulating promises.'},step:{ar:'ثبت موعد ومسؤولية واضحة',en:'Confirm one deadline and responsibility'}},
 Uranus:{now:{ar:'إذا تريد تغير خطة أو علاقة أو روتين، لا تقلب الأمور مرة وحدة.',en:'If you want to change a plan or routine, avoid doing everything at once.'},later:{ar:'راقب نتيجة تجربة صغيرة قبل ما تحسم تغيير أكبر.',en:'Watch a small experiment before a larger change.'},step:{ar:'جرّب خطوة تگدر تتراجع عنها',en:'Try a reversible step'}},
 Neptune:{now:{ar:'إذا أكو معلومات ناقصة أو انطباعات قوية، لا تبني عليها وعود.',en:'Avoid promises based on incomplete facts or strong impressions.'},later:{ar:'إذا بقت الصورة ضبابية، اسأل عن دليل مباشر بدل زيادة التوقعات.',en:'Ask for direct evidence if uncertainty remains.'},step:{ar:'تأكد من حقيقة واحدة',en:'Verify one fact'}},
 Pluto:{now:{ar:'إذا عندك موضوع حساس مع شخص أو مؤسسة، فرّق بين قرارك وقرارهم.',en:'In a sensitive issue, separate your decision from others’ choices.'},later:{ar:'راقب إذا حدودك واضحة وتجنب محاولة إجبار نتيجة مو بإيدك.',en:'Watch whether your boundaries are clear instead of forcing outcomes.'},step:{ar:'حدد قرار واحد بيدك',en:'Choose one decision within your control'}}
};
const ingressStyles:readonly Bi[]=[
 {ar:'خلي البداية صغيرة وقابلة للتعديل.',en:'Start small and keep room to adjust.'},
 {ar:'التثبيت أهم من الوعد السريع.',en:'Consistency matters more than quick promises.'},
 {ar:'السؤال الواضح يوفر سوء فهم.',en:'A clear question reduces misunderstanding.'},
 {ar:'انتبه للأمان والحدود ويّه المقربين.',en:'Pay attention to comfort and boundaries with close people.'},
 {ar:'عبر عن رغبتك مباشرة بدون مبالغة.',en:'Say what you want without exaggeration.'},
 {ar:'دقّق التفاصيل قبل حسم الخطة.',en:'Review details before finalizing.'},
 {ar:'شوف إذا الأخذ والعطاء متوازن فعلاً.',en:'Check whether give-and-take is truly balanced.'},
 {ar:'لا تهمل الحدود والخصوصية.',en:'Do not overlook boundaries and privacy.'},
 {ar:'افحص فرص السفر والتجربة قبل الوعود.',en:'Check travel and learning plans before committing.'},
 {ar:'احسب الالتزام الواقعي للشغل والوقت.',en:'Check actual work and time commitments.'},
 {ar:'اختر الأشخاص اللي يتابعون بالفعل، مو بالكلام.',en:'Value people who follow through, not just talk.'},
 {ar:'خلّ مجال للراحة قبل قرار حساس.',en:'Allow time for rest before sensitive decisions.'}
];
const namesAr:Record<string,string>={Sun:'الشمس',Moon:'القمر',Mercury:'عطارد',Venus:'الزهرة',Mars:'المريخ',Jupiter:'المشتري',Saturn:'زحل',Uranus:'أورانوس',Neptune:'نبتون',Pluto:'بلوتو'};
const natalFocus:Record<string,Bi>={
 Sun:{ar:'قرارك الشخصي وثقتك',en:'personal choices and confidence'},
 Moon:{ar:'راحتك وردودك',en:'comfort and reactions'},
 Mercury:{ar:'الرسائل والتفاهمات',en:'messages and communication'},
 Venus:{ar:'القرب والعلاقات والقيمة',en:'affection and values'},
 Mars:{ar:'المبادرة والخلافات',en:'initiative and disagreements'},
 Jupiter:{ar:'السفر والفرص',en:'travel and opportunities'},
 Saturn:{ar:'الواجبات والالتزامات',en:'duties and commitments'},
 Uranus:{ar:'التغيير والمرونة',en:'change and flexibility'},
 Neptune:{ar:'الوضوح والتوقعات',en:'clarity and expectations'},
 Pluto:{ar:'الحدود والتغيير',en:'boundaries and change'}
};
const txt=(b:Bi,lang:SkyLanguage)=>lang==='ar'?b.ar:b.en;
export function personalSkyStory({event,at,natal,skyAtEvent,knownBirthTime,lang}:PersonalSkyContext):PersonalSkyStory{
 if(!Number.isFinite(+at)||!Number.isFinite(+event.at))throw Error('Invalid story time');
 const human=occurrenceLanguage(event,lang);
 const focusBodies=skyAtEvent.filter(p=>p.id===event.first);
 if(focusBodies.length!==1||!Number.isFinite(focusBodies[0].longitude))throw Error('Event body not verified');
 const focusPlanet=focusBodies[0];
 // An aspect title is only an interpretation of a verified *pair*. A valid
 // first planet alone cannot authorize a claim about a different second one.
 // Live contacts are allowed a wider 1.2° orb; refined events are more exact.
 if(event.kind==='aspect'){
  const partner=event.second?skyAtEvent.filter(p=>p.id===event.second):[];
  if(partner.length!==1||!Number.isFinite(partner[0].longitude)||
     ![0,60,90,120,180].includes(event.angle??NaN)||
     Math.abs(distance(focusPlanet.longitude,partner[0].longitude)-event.angle!)>1.200001){
   throw Error('Unverified sky aspect: both actual bodies and aspect angle are required');
  }
 }
 const house=knownBirthTime&&natal.cusps.length===12?houseNumber(focusPlanet.longitude,natal.cusps):0;
 const houseTopic=house>=1&&house<=12?houses[house-1]:null;
 const planetTopic=planetScenes[event.first];
 const soon=+event.at>+at;
 const phaseNow=lang==='ar'?
  (soon?'قبل هالحدث:':''):
  (soon?'Before this event:':'');
 let now=houseTopic?txt(houseTopic.now,lang):txt(planetTopic.now,lang);
 let later=houseTopic?txt(houseTopic.later,lang):txt(planetTopic.later,lang);
 let action=houseTopic?txt(houseTopic.step,lang):txt(planetTopic.step,lang);
 if(event.kind==='ingress'){
  if(event.sign===undefined||event.sign<0||event.sign>11)throw Error('Invalid sign event');
  const emphasis=txt(ingressStyles[event.sign],lang);
  later+=' '+emphasis;
  if(event.retrograde){
   now+=(lang==='ar'?(soon?' الحدث القادم يمثل عودة أثناء التراجع الظاهري، مو دليلاً على رجوع شخص أو نتيجة.':' هاي عودة أثناء التراجع الظاهري، مو دليلاً على رجوع شخص أو نتيجة.'):
    (soon?' The upcoming apparent retrograde return is not evidence of a reunion or outcome.':' This apparent retrograde return is not evidence of a reunion or outcome.'));
   later=lang==='ar'?'راجع التوقعات الحالية عند إعادة المرور بالبرج؛ القرار يعتمد على الواقع.':
    'Reassess expectations as the sign is revisited; real circumstances decide outcomes.';
  }
  // A Venus ingress in Libra with 7th house, for example, concerns an actual
  // natal life sector AND Libra's give-and-take rather than all users' romance.
  if(event.first==='Venus'&&houseTopic){
   now+=' '+(lang==='ar'?'إذا أكو اهتمام عاطفي أو قرار صرف، لا تخلّي المجاملة تغطي التفاصيل.':
    'In attraction or spending, do not let politeness hide important details.');
  }
 }else if(event.kind==='station'){
  now=(lang==='ar'?(event.retrograde?
    'إذا عندك موضوع قديم يخص '+(houseTopic?houseTopic.area.ar:namesAr[event.first])+'، تگدر تراجعه. ':
    'إذا عندك خطوة مؤجلة بموضوع '+(houseTopic?houseTopic.area.ar:namesAr[event.first])+'، تگدر ترتبها. '):
    (event.retrograde?'Revisit an older issue around ':'You can organize a pending step around ')+
    (houseTopic?houseTopic.area.en:event.first)+'. ')+txt(planetTopic.now,lang);
  later=txt(planetTopic.later,lang)+' '+(houseTopic?txt(houseTopic.later,lang):'');
 }else{
  const second=event.second?planetScenes[event.second]:null;
  if(second){
   const balanced=event.angle===60||event.angle===120;
   const challenging=event.angle===90||event.angle===180;
   const caution=lang==='ar'?(balanced?'الانسجام الرمزي لا يضمن نتيجة.':challenging?'التوتر الرمزي لا يثبت وقوع مشكلة.':'الاقتران يجمع عاملين، لكنه لا يحدد النتيجة.'):
    (balanced?'Symbolic harmony does not guarantee any outcome.':challenging?'Symbolic tension does not establish a real dispute.':'Conjunction combines two factors without determining an outcome.');
   // A fast Moon aspect must never inherit Jupiter/Saturn's weeks-long
   // planetary template. Duration cannot be inferred from a paired name.
   const lunar=event.first==='Moon'||event.second==='Moon';
   now=(houseTopic?txt(houseTopic.now,lang):txt(planetTopic.now,lang))+' '+
    (lang==='ar'?(balanced?'زاوية داعمة رمزياً، مو ضمان لنتيجة.':challenging?'زاوية متوترة رمزياً، مو توقع حدوث مشكلة.':'اقتران يجمع الموضوعين رمزياً، بدون حكم مسبق على النتيجة.'):
     (balanced?'This is a symbolically supportive aspect, not a promised outcome.':challenging?'This is a symbolically challenging aspect, not a prediction of trouble.':'This conjunction combines the themes symbolically without a predetermined outcome.'));
   later=lunar?(lang==='ar'?'التأويل يخص الفترة القريبة من وقت الاتصال القمري فقط؛ لا يمتد لأسابيع من دون عامل فلكي منفصل.':
    'The interpretation concerns the short Moon-aspect window, not weeks ahead without separate calculated evidence.'):
    (houseTopic?txt(houseTopic.later,lang):txt(second.later,lang))+' '+caution;
  }
 }
 // A full Moon is a Sun–Moon opposition across two actual natal houses,
 // not merely a solar event in one house. Verify the ephemeris separation.
 if(event.kind==='aspect'&&event.angle===180&&
    ((event.first==='Sun'&&event.second==='Moon')||(event.first==='Moon'&&event.second==='Sun'))&&
    knownBirthTime&&natal.cusps.length===12){
  const sun=skyAtEvent.find(p=>p.id==='Sun'),moon=skyAtEvent.find(p=>p.id==='Moon');
  if(sun&&moon&&Math.abs(distance(sun.longitude,moon.longitude)-180)<=0.1){
   const sunHouse=houseNumber(sun.longitude,natal.cusps),moonHouse=houseNumber(moon.longitude,natal.cusps);
   if(sunHouse>0&&moonHouse>0&&sunHouse!==moonHouse){
    later+=lang==='ar'?' والبدر يربط رمزياً بين '+houses[sunHouse-1].area.ar+' و'+houses[moonHouse-1].area.ar+'، مو دليل على حدث واقعي.':
     ' The Full Moon symbolically relates '+houses[sunHouse-1].area.en+' to '+houses[moonHouse-1].area.en+'; this is not evidence of an external event.';
   }
  }
 }
 // Only a verified close transit to a natal planet can add a second personal
 // domain; unknown birth time forbids Moon-based assertions.
 const natalPoints=natal.points.filter(p=>knownBirthTime||p.id!=='Moon');
 const contacts=aspects([focusPlanet],natalPoints,event.at).filter(x=>x.orb<=0.8);
 const link=contacts.sort((x,y)=>x.orb-y.orb)[0];
 if(link&&natalFocus[link.natal.id]){
  const topic=txt(natalFocus[link.natal.id],lang);
  later+=lang==='ar'?' وبخريطتك هذا يلامس موضوع '+topic+'؛ انتبه إذا هو فعلاً حاضر بحياتك.':
   ' In your natal chart it also relates to '+topic+'; check whether that matters in your circumstances.';
 }
 // A close calculated transit-to-natal contact remains personal without a
 // known birth time; natal-Moon or house claims still require it.
 const natalContactTopic=link&&natalFocus[link.natal.id]?txt(natalFocus[link.natal.id],lang):null;
 const prefix=houseTopic?(lang==='ar'?'بخريطتك هذا يرتبط بـ'+houseTopic.area.ar+'. ':'In your chart this concerns '+houseTopic.area.en+'. '):'';
 return {
  title:human.title,
  now:prefix+(soon?phaseNow+' ':'')+now,
  next:later,
  action,
  focus:houseTopic?txt(houseTopic.area,lang):natalContactTopic??(!knownBirthTime?(lang==='ar'?'قراءة عامة لأن وقت الميلاد مو مؤكد وماكو اتصال شخصي قريب':'General reading: birth time unconfirmed and no close natal contact'):(lang==='ar'?'قراءة عامة: ماكو بيت ولادي قابل للحساب أو اتصال شخصي قريب':'General event: no available natal house or close personal contact')),
  personal:Boolean(houseTopic||natalContactTopic)
 };
}
