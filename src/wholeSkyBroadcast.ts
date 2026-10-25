import type {Point} from './math.ts';
import {bisectAngle} from './timing.ts';
import {currentSkyContacts,type SkyAspect,type SkyLanguage} from './todaySkyBrief.ts';

/** Whole-sky event engine. Every event time is refined against the actual
 * ephemeris reader; velocity-only projections must never be presented as exact.
 * Uses a bounded 1-hour survey, then sub-minute numerical root verification.
 */
export const FULL_SKY_BODIES=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'] as const;
export type SkyBodyId=typeof FULL_SKY_BODIES[number];
export type WholeSkyOccurrence={
 kind:'aspect'|'ingress'|'station';
 at:Date;first:SkyBodyId;second?:SkyBodyId;angle?:number;sign?:number;retrograde?:boolean;
};
export type WholeSkyReader=(date:Date)=>readonly Point[];
const ZODIAC=['الحمل','الثور','الجوزاء','السرطان','الأسد','العذراء','الميزان','العقرب','القوس','الجدي','الدلو','الحوت'] as const;
const EN_SIGNS=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'] as const;
const dictionary:Record<SkyBodyId,{ar:string;en:string;theme:string;englishTheme:string;action:string;englishAction:string}>={
 Sun:{ar:'الشمس',en:'Sun',theme:'القرار والثقة',englishTheme:'decisions and confidence',action:'حدّد قرار واضح ونفّذه بخطوة صغيرة.',englishAction:'Choose one clear decision and take a small step.'},
 Moon:{ar:'القمر',en:'Moon',theme:'الراحة والاستجابة',englishTheme:'comfort and reaction',action:'انتبه لرد فعلك وخلي الحكم على الوقائع.',englishAction:'Check the facts before reacting.'},
 Mercury:{ar:'عطارد',en:'Mercury',theme:'الأفكار والمراسلات',englishTheme:'ideas and communication',action:'راجع الكلام والتفاصيل قبل الاتفاق.',englishAction:'Check the details before agreeing.'},
 Venus:{ar:'الزهرة',en:'Venus',theme:'العلاقات والقيمة',englishTheme:'relationships and values',action:'عبّر عن اهتمام بسيط وتابع التجاوب الحقيقي.',englishAction:'Show interest and notice the actual response.'},
 Mars:{ar:'المريخ',en:'Mars',theme:'المبادرة وضبط الاندفاع',englishTheme:'initiative and restraint',action:'ابدأ خطوة عملية بدون تسرّع.',englishAction:'Act on one concrete task without rushing.'},
 Jupiter:{ar:'المشتري',en:'Jupiter',theme:'الفرص والتوسّع',englishTheme:'opportunity and expansion',action:'دقّق جدوى الفرصة قبل الالتزام.',englishAction:'Check the value of an opportunity before committing.'},
 Saturn:{ar:'زحل',en:'Saturn',theme:'المسؤوليات والحدود',englishTheme:'responsibility and boundaries',action:'ثبّت المسؤوليات والموعد بوضوح.',englishAction:'Confirm responsibilities and deadlines.'},
 Uranus:{ar:'أورانوس',en:'Uranus',theme:'التغيير والاستقلال',englishTheme:'change and independence',action:'جرّب تغيير قابل للتراجع.',englishAction:'Try a reversible change.'},
 Neptune:{ar:'نبتون',en:'Neptune',theme:'الخيال والوضوح',englishTheme:'imagination and clarity',action:'افصل التوقع عن المعلومة المتأكدة.',englishAction:'Separate expectations from verified facts.'},
 Pluto:{ar:'بلوتو',en:'Pluto',theme:'التحوّل والحدود',englishTheme:'change and boundaries',action:'ركز على اللي تگدر تتحكم بيه.',englishAction:'Focus on what you can control.'}
};
const ids=new Set<string>(FULL_SKY_BODIES);
const deg=(n:number)=>((n%360)+360)%360;
const signed=(n:number)=>((n%360)+540)%360-180;
const valid=(points:readonly Point[])=>{
 const found=new Map<SkyBodyId,Point>();
 for(const id of FULL_SKY_BODIES){
  const hits=points.filter(x=>x.id===id);
  if(hits.length!==1||!Number.isFinite(hits[0].longitude)||!Number.isFinite(hits[0].speed))throw Error('Missing valid whole-sky ephemeris: '+id);
  found.set(id,hits[0]);
 }
 return found;
};
const angs=[0,60,90,120,180] as const;
const phases=(n:number)=>n===0?[0]:n===180?[180]:[n,-n];
function signAt(p:Point){return Math.floor(deg(p.longitude)/30)}
const signText=(n:number,lang:SkyLanguage)=>lang==='ar'?ZODIAC[n]:EN_SIGNS[n];
const planet=(id:SkyBodyId,lang:SkyLanguage)=>dictionary[id][lang];
const pair=(a:SkyBodyId,b:SkyBodyId,lang:SkyLanguage)=>planet(a,lang)+(lang==='ar'?' ويّه ':' with ')+planet(b,lang);
export function scanWholeSky(at:Date,read:WholeSkyReader,hoursBack=18,hoursAhead=48):WholeSkyOccurrence[]{
 if(!Number.isFinite(+at)||hoursBack<0||hoursAhead<=0||hoursBack>168||hoursAhead>168)throw Error('Invalid whole-sky scan window');
 const HOUR=3600000,start=+at-hoursBack*HOUR,end=+at+hoursAhead*HOUR,step=HOUR;
 const cache=new Map<number,Map<SkyBodyId,Point>>();
 const snapshot=(t:number)=>{let p=cache.get(t);if(!p){p=valid(read(new Date(t)));cache.set(t,p)}return p};
 const point=(t:number,id:SkyBodyId)=>snapshot(t).get(id)!;
 const events:WholeSkyOccurrence[]=[];
 const emit=(event:WholeSkyOccurrence)=>{if(!events.some(x=>x.kind===event.kind&&x.first===event.first&&x.second===event.second&&x.angle===event.angle&&x.sign===event.sign&&Math.abs(+x.at-+event.at)<60000))events.push(event)};
 const times:number[]=[];for(let t=start;t<end;t+=step)times.push(t);times.push(end);
 for(let k=1;k<times.length;k++){
  const a=times[k-1],b=times[k],from=snapshot(a),to=snapshot(b);
  for(const id of FULL_SKY_BODIES){
   const first=from.get(id)!,last=to.get(id)!;
   if(signAt(first)!==signAt(last)){
    const boundary=(last.speed>=0?signAt(last):signAt(first))*30;
    const func=(t:number)=>signed(point(t,id).longitude-boundary);
    const root=bisectAngle(func,a,b,.1);
    if(root&&Math.abs(func(+root))<.03){const after=point(Math.min(end,+root+60000),id);emit({kind:'ingress',at:root,first:id,sign:signAt(after),retrograde:after.speed<0});}
   }
   // Include exact zero-velocity samples: a station can lie exactly on a survey boundary.
   // Adjacent intervals may see the same root; emit() deduplicates it by time.
   if(first.speed*last.speed<=0&&first.speed!==last.speed){
    const func=(t:number)=>point(t,id).speed;
    const root=bisectAngle(func,a,b,.1);
    if(root&&Math.abs(func(+root))<.02){
     const after=point(Math.min(end,+root+600000),id);
     emit({kind:'station',at:root,first:id,retrograde:after.speed<0});
    }
   }
  }
  for(let i=0;i<FULL_SKY_BODIES.length;i++)for(let j=i+1;j<FULL_SKY_BODIES.length;j++){
   const first=FULL_SKY_BODIES[i],second=FULL_SKY_BODIES[j];
   const left=from.get(first)!,right=from.get(second)!;
   const finalLeft=to.get(first)!,finalRight=to.get(second)!;
   for(const angle of angs)for(const phase of phases(angle)){
    const fa=signed(left.longitude-right.longitude-phase),fb=signed(finalLeft.longitude-finalRight.longitude-phase);
    if(fa*fb>0||Math.abs(fa-fb)>90)continue;
    const fn=(t:number)=>signed(point(t,first).longitude-point(t,second).longitude-phase);
    const root=bisectAngle(fn,a,b,.1);
    if(root&&Math.abs(fn(+root))<.02)emit({kind:'aspect',at:root,first,second,angle});
   }
  }
 }
 return events.sort((a,b)=>+a.at-+b.at||a.first.localeCompare(b.first));
}
/** Planetary events have their calculations elsewhere. Here we speak to the
 * reader directly, with practical examples rather than orbital descriptions.
 * These are interpretations of themes; do not promise real-world outcomes. */
type ActionGuide={ar:string;en:string;doAr:string;doEn:string};
const guides:Record<SkyBodyId,ActionGuide>={
 Sun:{ar:'إذا بين إيدك قرار أو شغل مهم، خلّ أولويتك واضحة بدل ما تشتت نفسك.',en:'For an important decision, focus on one priority.',doAr:'حدد أهم خطوة تحتاج تنجزها اليوم.',doEn:'Choose the most important next step.'},
 Moon:{ar:'إذا عندك موقف مؤثر، فرّق بين شعورك والوقائع قبل الرد.',en:'Separate feelings from facts before responding.',doAr:'خلي ردك هادئ وواضح.',doEn:'Keep your response calm and clear.'},
 Mercury:{ar:'إذا عندك رسائل أو حجوزات أو معاملات، لا تفترض أن الكل فاهم نفس التفاصيل.',en:'For messages, bookings or paperwork, confirm what others actually understood.',doAr:'تأكد من موعد أو رسالة مهمة.',doEn:'Confirm one important message or appointment.'},
 Venus:{ar:'إذا عندك موضوع علاقة أو تعارف، خلي الاهتمام واضح بدون ضغط أو افتراضات.',en:'For romance or friendship, communicate interest without pressure or assumptions.',doAr:'احچي عن اهتمام واحد بصراحة ولطف.',doEn:'Express one interest honestly and gently.'},
 Mars:{ar:'إذا متحمس أو متضايق من موقف، خلّ طاقتك بخطوة مفيدة بدل مواجهة مستعجلة.',en:'Channel excitement or frustration into a useful step instead of a rushed confrontation.',doAr:'خلص مهمة صغيرة قبل ما ترد بانفعال.',doEn:'Finish one small task before responding emotionally.'},
 Jupiter:{ar:'إذا تفكر بفرصة شغل أو سفر أو تعلّم، لا توعد بشي قبل ما تعرف وقته وكلفته.',en:'For work, travel or learning opportunities, check time and cost before committing.',doAr:'راجع فائدة فرصة واحدة وتكاليفها.',doEn:'Review one opportunity and its costs.'},
 Saturn:{ar:'إذا ضاغطتك مسؤوليات أو مواعيد، تأكد شنو مطلوب منك فعلاً.',en:'When obligations or deadlines press, clarify what is actually expected.',doAr:'حدد التزام واحد ووقت إنجازه.',doEn:'Clarify one obligation and deadline.'},
 Uranus:{ar:'إذا تريد تغيّر شي بروتينك، جرّب تعديل صغير بدل قرار مفاجئ.',en:'Try one small reversible routine change rather than a sudden decision.',doAr:'اختبر تغيير بسيط قابل للتراجع.',doEn:'Test one reversible change.'},
 Neptune:{ar:'إذا عندك خبر أو وعد مبهم، لا تبني عليه قرار قبل ما تتأكد.',en:'Do not base a decision on a vague promise or unverified news.',doAr:'تأكد من معلومة مهمة من مصدرها.',doEn:'Verify one important fact.'},
 Pluto:{ar:'إذا تريد تحسم خلاف أو تفرض نتيجة، ركّز على القرار اللي بيدك واحترم خيارات غيرك.',en:'In a conflict, focus on what you control and respect others’ choices.',doAr:'حدد حدودك بوضوح بدون تصعيد.',doEn:'State your boundaries without escalating.'}
};
const retro:Record<SkyBodyId,string>={
 Sun:'راجع أولوياتك إذا تتزاحم مسؤولياتك.',
 Moon:'تمهّل بردودك إذا حسّيت مشاعرك متداخلة.',
 Mercury:'ارجع دقّق بالمواعيد والمراسلات والاتفاقات القديمة، خصوصاً إذا بيها نقطة مبهمة.',
 Venus:'راجع توقعاتك بالعلاقات والمصاريف قبل ما ترجع لموضوع قديم.',
 Mars:'إذا مشروعك متأخر، عدّل خطتك ولا تعوّض التأخير بعصبية.',
 Jupiter:'راجع فرصة سفر أو شغل قديمة وتأكد من شروطها قبل ما تتوسع.',
 Saturn:'رتّب مسؤولياتك من جديد وراجع الوعود اللي ما عاد تناسب وقتك.',
 Uranus:'إذا تريد تغيير كبير، خلّ عندك خيار ترجع للوراء.',
 Neptune:'إذا الصورة مو واضحة، ميّز الواقع عن الأمنية قبل ما تقرر.',
 Pluto:'راجع دوافعك وحدودك قبل الدخول بنقاش يحتاج حسم.'
};
const signsAdvice:readonly string[]=[
 'بداية جديدة تخططلها بلا استعجال','استقرارك ومصاريفك وراحتك اليومية',
 'المراسلات والمكالمات والتفاصيل','بيتك وراحتك وأقرب الناس إلك',
 'التعبير عن نفسك وشغلك بثقة','ترتيب التفاصيل والمهام المؤجلة',
 'التوازن بالعلاقات والاتفاقات','الخصوصية والحدود والثقة',
 'السفر والتعلّم والخطط الجديدة','الشغل والمسؤوليات والنتائج',
 'الأصدقاء والأفكار اللي تشتغلون عليها سوا','الراحة ومراجعة الخيارات بهدوء'
];
const pairDetails:Record<string,{ar:string;en:string;doAr:string;doEn:string}>={
 'Mercury|Venus':{ar:'إذا تفكر تراسل شخص أو تصفي سوء فهم، خَلّ الكلام مباشر ولطيف. لا تفسر السكوت على كيفك.',en:'For a message or misunderstanding, speak clearly and let the reply inform you.',doAr:'اكتب رسالة قصيرة بلا تلميحات.',doEn:'Write a short message without hints.'},
 'Jupiter|Moon':{ar:'إذا صارت عندك رغبة بطلعة أو تجربة جديدة، استمتع بيها بدون وعود أكبر من وقتك.',en:'Enjoy a new plan without overcommitting your time.',doAr:'اختار نشاط يناسب وقتك وميزانيتك.',doEn:'Choose a plan that fits your time and budget.'},
 'Mars|Mercury':{ar:'إذا أحد استفزك بحچي، لا تخلي أول رد يضيع النقطة الأساسية.',en:'If a message irritates you, keep the main point clear.',doAr:'راجع ردك قبل لا ترسله.',doEn:'Review your reply before sending.'},
 'Mercury|Saturn':{ar:'إذا عندك معاملة أو شغل، لا تعتمد على الوعود العامة؛ التفاصيل مهمة.',en:'For work or paperwork, avoid relying on vague promises.',doAr:'ثبّت شنو المطلوب وموعده.',doEn:'Confirm the deliverable and deadline.'},
 'Jupiter|Mercury':{ar:'إذا تفكر بسفر أو تعلّم جديد، جمع المعلومات قبل الحجز أو الموافقة.',en:'For travel or learning plans, verify details before committing.',doAr:'تأكد من السعر والموعد والشروط.',doEn:'Confirm cost, timing and conditions.'},
 'Mercury|Neptune':{ar:'إذا سمعت خبر مو واضح، لا تبني توقعات على كلام ناقص.',en:'Do not build expectations on incomplete information.',doAr:'راجع المصدر بنفسك.',doEn:'Check the source yourself.'},
 'Mars|Venus':{ar:'إذا تريد تبادر بعلاقة أو صلح، لا تخلي الحماس يتحول لضغط.',en:'In romance or reconciliation, keep enthusiasm from becoming pressure.',doAr:'ابدأ حوار هادئ واترك مساحة للرد.',doEn:'Start calmly and allow room for a reply.'},
 'Sun|Venus':{ar:'إذا تريد تقوي علاقة أو تقدم نفسك، لا تحاول ترضي الجميع على حساب رغبتك.',en:'In relationships, be clear without trying to please everyone.',doAr:'عبّر عن شي يهمك بوضوح ولطف.',doEn:'State one need clearly and kindly.'},
 'Mars|Moon':{ar:'إذا مزاجك متوتر، لا تحوّل استفزاز بسيط إلى مشكلة أكبر.',en:'If tense, avoid escalating a small irritation.',doAr:'تأنّى قبل الرد على موقف حساس.',doEn:'Pause before responding to a sensitive issue.'},
 'Moon|Venus':{ar:'إذا تحتاج اهتمام من شخص، احچي عن احتياجك بدل اختبار مشاعره.',en:'If you need affection, ask clearly rather than testing feelings.',doAr:'اقترح وقت مناسب لحچي هادئ.',doEn:'Suggest a calm time to talk.'},
 'Jupiter|Venus':{ar:'إذا عندك طلعة أو تعارف أو شراء، استمتع بالخطة بدون مبالغة بالصرف.',en:'Enjoy social plans without overspending.',doAr:'حدد ميزانية قبل الموعد.',doEn:'Set a budget before the outing.'},
 'Saturn|Venus':{ar:'إذا علاقة أو اتفاق مو محسوم، لا تكتفي بالوعود؛ وضّح التوقعات.',en:'Clarify expectations instead of relying on vague promises.',doAr:'اسأل عن التزام محدد.',doEn:'Ask about one concrete commitment.'},
 'Jupiter|Saturn':{ar:'إذا عندك فرصة كبيرة، وازن بين حماسك والوقت المتاح عندك.',en:'Balance ambition with the time you have.',doAr:'جرّب خطوة صغيرة قبل الالتزام.',doEn:'Test one small step before committing.'},
 'Saturn|Uranus':{ar:'إذا تفكر تغير الشغل أو الروتين، لا تلغي كل خطتك دفعة وحدة.',en:'Change work or routine gradually rather than all at once.',doAr:'جرب تعديل بسيط وخلي خيار رجوع.',doEn:'Try a reversible adjustment.'}
};
export function occurrenceLanguage(e:WholeSkyOccurrence,lang:SkyLanguage):{title:string;description:string;action:string}{
 const base=dictionary[e.first],human=guides[e.first],arabic=lang==='ar';
 if(e.kind==='ingress'){
  if(e.sign===undefined||e.sign<0||e.sign>11)throw Error('Invalid verified zodiac sign');
  const feminine=e.first==='Venus'||e.first==='Sun';
  return {title:arabic?base.ar+(e.retrograde?(feminine?' عادت متراجعة إلى ':' عاد متراجعاً إلى '):(feminine?' دخلت ':' دخل '))+signText(e.sign,lang):base.en+(e.retrograde?' returned retrograde to ':' entered ')+signText(e.sign,lang),
   description:arabic?(e.retrograde?'العودة التراجعية رمزياً تفتح مجال مراجعة '+signsAdvice[e.sign]+'. ':'الدخول يبرز رمزياً موضوع '+signsAdvice[e.sign]+'. ')+human.ar:
    (e.retrograde?'A retrograde return symbolically revisits ':'The ingress symbolically highlights ')+signText(e.sign,lang)+' themes. '+human.en,
   action:arabic?human.doAr:human.doEn};
 }
 if(e.kind==='station')return {
  title:arabic?base.ar+(e.first==='Venus'||e.first==='Sun'?(e.retrograde?' بدأت التراجع':' انتهى تراجعها'):(e.retrograde?' بدأ التراجع':' انتهى تراجعه')):base.en+(e.retrograde?' began retrograde':' ended retrograde'),
  description:arabic?(e.retrograde?retro[e.first]:human.ar):
   (e.retrograde?'Take another look at past decisions. ':'It may be useful to move forward carefully. ')+human.en,
  action:arabic?human.doAr:human.doEn
 };
 if(e.angle===undefined||!angs.includes(e.angle as 0)||!e.second)throw Error('Invalid sky aspect');
 const another=e.second,second=guides[another];
 const key=[e.first,another].sort().join('|');
 const detail=pairDetails[key];
 const tense=e.angle===90||e.angle===180;
 const context=detail?(arabic?detail.ar:detail.en):
  arabic?'إذا عندك موضوع يجمع '+base.theme+' و'+dictionary[another].theme+'، خلّ اهتمامك بالخطوة اللي تگدر تسويها فعلاً.':
   'For matters involving '+base.englishTheme+' and '+dictionary[another].englishTheme+', focus on a step you can actually take.';
 const isSolarLunar=(e.first==='Sun'&&another==='Moon')||(e.first==='Moon'&&another==='Sun');
 const lunation= isSolarLunar&&e.angle===180?(arabic?'اكتمال القمر — مقابلة الشمس والقمر':'Full Moon — Sun–Moon opposition'):
  isSolarLunar&&e.angle===0?(arabic?'محاق القمر — اقتران الشمس والقمر':'New Moon — Sun–Moon conjunction'):null;
 const aspectLabels:Record<number,[string,string]>={0:['اقتران','conjunction'],60:['تسديس','sextile'],90:['تربيع','square'],120:['تثليث','trine'],180:['مقابلة','opposition']};
 const aspectName=aspectLabels[e.angle]??null;
 if(!aspectName)throw Error('Unsupported aspect angle');
 return {title:lunation??pair(e.first,another,lang)+' · '+(arabic?aspectName[0]:aspectName[1]),
  description:context+(tense?(arabic?' لا تستعجل بالحسم.':' Avoid a rushed decision.'):(arabic?' جرّب خطوة صغيرة وواضحة.':' Take one small, clear step.')),
  action:detail?(arabic?detail.doAr:detail.doEn):(arabic?second.doAr:second.doEn)};
}
export type WholeSkyBroadcast={
 title:string;meaning:string;action:string;movement:string;identity:string;
 recent:WholeSkyOccurrence|null;next:WholeSkyOccurrence|null;
 upcoming:WholeSkyOccurrence[];latest:WholeSkyOccurrence[];
 contacts:SkyAspect[];planets:{id:SkyBodyId;label:string;sign:string;motion:string}[];
};
function nearestEvent(events:readonly WholeSkyOccurrence[],ms:number,direction:'past'|'future'){
 const filtered=events.filter(x=>direction==='past'?+x.at<=ms:+x.at>ms);
 return (direction==='past'?[...filtered].reverse():filtered)[0]??null;
}
export function wholeSkyBroadcast(points:readonly Point[],events:readonly WholeSkyOccurrence[],at:Date,lang:SkyLanguage):WholeSkyBroadcast{
 if(!Number.isFinite(+at))throw Error('Invalid report instant');
 const source=valid(points),now=+at,sorted=[...events].sort((a,b)=>+a.at-+b.at);
 const latest=sorted.filter(e=>+e.at<=now).slice(-4).reverse();
 const upcoming=sorted.filter(e=>+e.at>now).slice(0,6);
 const recent=nearestEvent(sorted,now,'past'),next=nearestEvent(sorted,now,'future');
 // Rank every planet on proximity, not a hard-coded preference for Moon.
 const contacts=currentSkyContacts(points).sort((a,b)=>a.orb-b.orb||a.first.localeCompare(b.first));
 const strong=contacts[0]??null;
 let title:string,meaning:string,action:string,movement:string;
 const veryRecent=recent&&now-(+recent.at)<=6*3600000?recent:null;
 const veryNext=next&&+next.at-now<=6*3600000?next:null;
 if(veryRecent&&( !veryNext||now-(+veryRecent.at)<+veryNext.at-now)){
  const item=occurrenceLanguage(veryRecent,lang);
  title=lang==='ar'?'صار خلال الساعات الأخيرة: '+item.title:'Exact within the last six hours: '+item.title;
  meaning=item.description;action=item.action;
  movement=lang==='ar'?'هذا الموضوع صار الأبرز خلال الساعات الأخيرة.':'This theme was prominent in the past few hours.';
 }else if(veryNext){
  const item=occurrenceLanguage(veryNext,lang);
  title=lang==='ar'?'دا يقترب: '+item.title:'Approaching: '+item.title;
  meaning=item.description;action=item.action;
  movement=lang==='ar'?'الموضوع قريب؛ شوف شنو تگدر تسوي عملياً.':'This theme is approaching; look for a practical next step.';
 }else if(strong){
  const a=strong.first as SkyBodyId,b=strong.second as SkyBodyId,item=occurrenceLanguage({kind:'aspect',at,first:a,second:b,angle:strong.angle},lang);
  title=item.title;meaning=item.description;action=item.action;
  movement=strong.applying?(lang==='ar'?'هالموضوع دا يصير أوضح هسه.':'This theme is becoming more prominent.'):
    (lang==='ar'?'هالموضوع كان أقوى قبل شوي؛ راجع خطوتك الجاية.':'This theme was recently stronger; review your next step.');
 }else {
  // No event? Use truthful planetary motion and sign, not invented activity.
  const mercury=source.get('Mercury')!,venus=source.get('Venus')!;
  title=lang==='ar'?'هسه ركّز على وضوح كلامك وعلاقاتك':'Now: clear communication and relationships';
  meaning=lang==='ar'?'إذا عندك اتصال أو موعد أو موضوع علاقة، رتّبه بهدوء. عطارد بـ'+signText(signAt(mercury),lang)+' والزهرة بـ'+signText(signAt(venus),lang)+
   '؛ مو لازم تنتظر مناسبة خاصة حتى تحسم التفاصيل اللي بيدك.':
   'For conversations, appointments or relationships, focus on what you can clarify. Mercury is in '+signText(signAt(mercury),lang)+' and Venus in '+signText(signAt(venus),lang)+'.';
  action=lang==='ar'?'اختار رسالة أو موعد واحد وخلّ تفاصيله واضحة.':'Clarify one message or appointment.';
  movement=lang==='ar'?'ماكو موضوع جديد طاغي بهاللحظة؛ ركّز على الشي اللي تگدر تسويه.':'No new dominant theme right now; focus on what you can control.';
 }
 const planetStatuses=FULL_SKY_BODIES.map(id=>{
  const p=source.get(id)!;
  const direct=Math.abs(p.speed)<.00005;
  return {id,label:planet(id,lang),sign:signText(signAt(p),lang),
   motion:direct?(lang==='ar'?'شبه ثابت':'near station'):p.speed<0?(lang==='ar'?'متراجع':'retrograde'):(lang==='ar'?'مباشر':'direct')};
 });
 const identity=[recent?.kind,recent?.first,recent?.second,recent?.at.toISOString(),next?.kind,next?.first,next?.second,next?.at.toISOString(),
  ...contacts.slice(0,4).map(c=>[c.first,c.second,c.angle,c.applying?'approach':'separate'].join(':')),
  ...planetStatuses.map(p=>[p.id,p.sign,p.motion].join(':'))].join('|');
 return {title,meaning,action,movement,identity,recent,next,upcoming,latest,contacts,planets:planetStatuses};
}
