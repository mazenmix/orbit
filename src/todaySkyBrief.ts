import type {Point} from './math.ts';
import type {ExactEvent,LunarWindow} from './timing.ts';
import type {FocusReadingInput} from './focusEventReading.ts';

/** A human, short, NON-NUMERICAL Today reading tied to real Swiss-Ephemeris positions
 * and the lunar window's exact event times. No clock-based random wording or invented
 * events. Meaning/action are traditional symbolic suggestions, not predictions.
 */
export type SkyLanguage='ar'|'en';
type Pair=readonly [string,string];
const choose=(pair:Pair,lang:SkyLanguage)=>pair[lang==='ar'?0:1];
const signNames:readonly Pair[]=[
 ['الحمل','Aries'],['الثور','Taurus'],['الجوزاء','Gemini'],['السرطان','Cancer'],
 ['الأسد','Leo'],['العذراء','Virgo'],['الميزان','Libra'],['العقرب','Scorpio'],
 ['القوس','Sagittarius'],['الجدي','Capricorn'],['الدلو','Aquarius'],['الحوت','Pisces']
];
const signThemes:readonly {theme:Pair;step:Pair}[]=[
 {theme:['البدايات والمبادرة','new beginnings and initiative'],step:['ابدأ بخطوة صغيرة بدل قرار متسرّع.','Start with one manageable step rather than a rushed decision.']},
 {theme:['الهدوء والاستقرار','calm and stability'],step:['رتّب احتياج عملي وخلي يومك أبسط.','Simplify your day and take care of one practical need.']},
 {theme:['الحديث والأخبار','conversation and information'],step:['اسأل سؤال واضح بدل التخمين.','Ask a clear question instead of guessing.']},
 {theme:['البيت والراحة','home and comfort'],step:['اهتم براحتك واحچي بهدوء ويا المقربين.','Make room for comfort and a calm talk with someone close.']},
 {theme:['التعبير والثقة','expression and confidence'],step:['شارك فكرة أو شغل أنجزته بدون انتظار مدح.','Share a finished idea without depending on praise.']},
 {theme:['التفاصيل والترتيب','details and organization'],step:['خلّص مهمة صغيرة مؤجلة.','Finish one small pending task.']},
 {theme:['العلاقات والتوازن','relationships and balance'],step:['وضّح توقعاتك واستمع للرد الحقيقي.','Clarify expectations and listen to the actual reply.']},
 {theme:['الحدود والخصوصية','boundaries and privacy'],step:['راجع حدودك قبل التزام شخصي أو مالي.','Check your boundaries before a personal or financial commitment.']},
 {theme:['السفر والتعلم','travel and learning'],step:['دقّق بخطة سفر أو تعلّم شيء جديد.','Check a travel plan or learn something new.']},
 {theme:['العمل والمسؤولية','work and responsibilities'],step:['حدّد شغلة لازم تخلصها بوضوح.','Name one concrete work deliverable.']},
 {theme:['الأصدقاء والأفكار','friends and ideas'],step:['تواصل ويّه صديق أو شارك فكرة جديدة.','Reach out to a friend or share an idea.']},
 {theme:['الهدوء والانعزال المؤقت','rest and reflection'],step:['خصص وقت هادئ بعيد عن المشتتات.','Protect some quiet time away from distractions.']}
];
const planets:Record<string,{name:Pair;theme:Pair;step:Pair}>={
 Sun:{name:['الشمس','Sun'],theme:['القرار والثقة','decisions and confidence'],step:['حدد أولوية وحدة واشتغل عليها.','Pick one priority and work on it.']},
 Moon:{name:['القمر','Moon'],theme:['الراحة والمشاعر','comfort and feelings'],step:['ميّز شعورك عن الوقائع قبل الرد.','Separate feelings from facts before responding.']},
 Mercury:{name:['عطارد','Mercury'],theme:['الرسائل والوضوح','communication and clarity'],step:['دقّق برسالة أو موعد يحتاج تأكيد.','Confirm a message or appointment.']},
 Venus:{name:['الزهرة','Venus'],theme:['التواصل والتقارب','connection and appreciation'],step:['عبّر عن اهتمام بسيط وخلي الرد متبادل.','Show simple interest and allow a genuine reply.']},
 Mars:{name:['المريخ','Mars'],theme:['المبادرة وضبط الاندفاع','initiative and restraint'],step:['ابدأ خطوة عملية وتجنّب الرد المتسرع.','Take one measured step rather than reacting fast.']},
 Jupiter:{name:['المشتري','Jupiter'],theme:['الفرص والتوسع','growth and opportunity'],step:['افحص فرصة صغيرة قبل وعد كبير.','Check a small opportunity before committing.']},
 Saturn:{name:['زحل','Saturn'],theme:['المسؤوليات والحدود','responsibility and boundaries'],step:['وضّح المطلوب منك قبل قبول التزام جديد.','Clarify what is expected before committing.']},
 Uranus:{name:['أورانوس','Uranus'],theme:['التغيير والاستقلال','change and independence'],step:['جرّب تغيير بسيط وقابل للتراجع.','Try one reversible change.']},
 Neptune:{name:['نبتون','Neptune'],theme:['الخيال والحقيقة','imagination versus reality'],step:['تحقق من المعلومة قبل ما تعتمد عليها.','Verify information before relying on it.']},
 Pluto:{name:['بلوتو','Pluto'],theme:['التحول والحدود','change and boundaries'],step:['ركز على قرار تحت سيطرتك.','Focus on a decision within your control.']}
};
const aspectAngles=[0,60,90,120,180] as const;
const calm=(angle:number)=>angle===60||angle===120;
const tense=(angle:number)=>angle===90||angle===180;
const norm=(longitude:number)=>((longitude%360)+360)%360;
const sep=(one:number,two:number)=>{const d=Math.abs(norm(one)-norm(two));return Math.min(d,360-d)};
const skyBodies=new Set(Object.keys(planets));
export type SkyAspect={first:string;second:string;angle:number;orb:number;applying:boolean};
export function currentSkyContacts(points:readonly Point[]):SkyAspect[]{
 const valid=points.filter(p=>skyBodies.has(p.id)&&Number.isFinite(p.longitude)&&Number.isFinite(p.speed));
 const found:SkyAspect[]=[];
 for(let i=0;i<valid.length;i++)for(let j=i+1;j<valid.length;j++){
  const a=valid[i],b=valid[j],d=sep(a.longitude,b.longitude);
  const angle=aspectAngles.reduce<number>((best,x)=>Math.abs(d-x)<Math.abs(d-best)?x:best,0);
  const orb=Math.abs(d-angle),hasMoon=a.id==='Moon'||b.id==='Moon',limit=hasMoon?1.2:0.35;
  if(orb>limit)continue;
  const dt=1/1440; // one real minute of ephemeris velocity; never displayed
  const dNext=sep(a.longitude+a.speed*dt,b.longitude+b.speed*dt);
  found.push({first:a.id,second:b.id,angle,orb,applying:Math.abs(dNext-angle)<orb});
 }
 return found.sort((a,b)=>{
  const moonA=a.first==='Moon'||a.second==='Moon',moonB=b.first==='Moon'||b.second==='Moon';
  return Number(moonB)-Number(moonA)||a.orb-b.orb||a.first.localeCompare(b.first)||a.second.localeCompare(b.second);
 });
}
export type SkyEventBrief={label:string;time:Date;kind:'moon-contact'|'voc'|'ingress';description:string;action:string};
export type TodaySkyBrief={
 title:string;meaning:string;action:string;movement:string;
 moonNote:string;recent:SkyEventBrief|null;next:SkyEventBrief|null;
 identity:string;activeContacts:SkyAspect[];
};
const name=(id:string,lang:SkyLanguage)=>planets[id]?choose(planets[id].name,lang):id;
function eventTitle(ev:ExactEvent,lang:SkyLanguage):string{
 return lang==='ar'?'القمر ويّه '+name(ev.target,lang):'Moon with '+name(ev.target,lang);
}
function contactMeaning(target:string,angle:number,lang:SkyLanguage):string{
 const t=planets[target]??planets.Moon;
 const attitude=tense(angle)
 ?(['ممكن يبرز اختلاف بين الرغبة والواقع، فالتأني أهم من الاندفاع.','A symbolic tension calls for patience rather than rushing.'] as Pair)
 :calm(angle)
 ?(['الفكرة الرمزية هنا هي تسهيل التنسيق، لكن الفعل الواقعي يبقى الأساس.','The symbolic theme is smoother coordination; real action still matters.'] as Pair)
 :(['الموضوعين صاروا بمحور واحد، فالأفضل تختار خطوة واضحة.','Both themes meet; choose one clear practical step.'] as Pair);
 return lang==='ar'?'التركيز الرمزي على '+choose(t.theme,lang)+'. '+choose(attitude,lang):
 'The symbolic focus is '+choose(t.theme,lang)+'. '+choose(attitude,lang);
}
function toEvent(ev:ExactEvent,lang:SkyLanguage):SkyEventBrief{
 return {label:eventTitle(ev,lang),time:ev.time,kind:'moon-contact',
  description:contactMeaning(ev.target,ev.angle,lang),action:choose((planets[ev.target]??planets.Moon).step,lang)};
}
function mostRecent(events:readonly SkyEventBrief[],now:number){return [...events].filter(e=>+e.time<=now).sort((a,b)=>+b.time-+a.time)[0]??null}
function soonest(events:readonly SkyEventBrief[],now:number){return [...events].filter(e=>+e.time>now).sort((a,b)=>+a.time-+b.time)[0]??null}
export function todaySkyBrief(points:readonly Point[],moon:LunarWindow,at:Date,lang:SkyLanguage):TodaySkyBrief{
 const now=+at;
 if(!Number.isFinite(now)||!Number.isInteger(moon.sign)||moon.sign<0||moon.sign>11)throw Error('Invalid current Moon window');
 const contacts=currentSkyContacts(points);
 const sign=signNames[moon.sign],theme=signThemes[moon.sign],signLabel=choose(sign,lang);
 const moonEvents=moon.events.map(e=>toEvent(e,lang));
 const nextIngress:SkyEventBrief={
  label:lang==='ar'?'القمر يدخل '+choose(signNames[(moon.sign+1)%12],lang):
   'Moon enters '+choose(signNames[(moon.sign+1)%12],lang),
  time:moon.ingressAt,kind:'ingress',
  description:lang==='ar'?'يتحوّل محور القراءة الرمزية للبرج الجديد.':'The symbolic focus shifts to the next sign.',
  action:choose(signThemes[(moon.sign+1)%12].step,lang)
 };
 const ingressPast:SkyEventBrief={label:lang==='ar'?'القمر دخل '+signLabel:'Moon entered '+signLabel,
  time:moon.enteredAt,kind:'ingress',description:choose(theme.theme,lang),action:choose(theme.step,lang)};
 const vocStart:SkyEventBrief={label:lang==='ar'?'القمر بدأ خلو المسار':'Moon VOC began',time:moon.vocStartsAt,
  kind:'voc',description:lang==='ar'?'فترة تهدئة ومراجعة بالتفسير التقليدي.':'A traditional window for review and slowing down.',
  action:lang==='ar'?'راجع التفاصيل قبل أي خطوة مهمة.':'Review details before an important step.'};
 const allEvents=[...moonEvents,ingressPast,nextIngress,...(+moon.vocStartsAt>+moon.enteredAt&&+moon.vocStartsAt<+moon.ingressAt?[vocStart]:[])];
 const recent=mostRecent(allEvents,now),next=soonest(allEvents,now);
 const activeMoon=contacts.find(c=>c.first==='Moon'||c.second==='Moon')??null;
 const activeBackground=contacts.find(c=>c.first!=='Moon'&&c.second!=='Moon')??null;
 let title:string,meaning:string,action:string,movement:string;
 if(moon.isVoid){
  title=lang==='ar'?'القمر خالي المسار: وقت للمراجعة':'Moon void of course: review first';
  meaning=lang==='ar'?'بعد آخر اتصال قمري رئيسي، القراءة الرمزية تميل للهدوء ومراجعة المفتوح، لحد انتقال القمر لبرجه الجديد.':
   'After the final exact classical lunar contact, the traditional theme is review until the next sign.';
  action=lang==='ar'?'دقّق موعد أو اتفاق مهم قبل ما تعتمد عليه.':'Confirm an important appointment or agreement.';
  movement=lang==='ar'?'حالة القمر صارت خلو مسار.':'The Moon is in its void-of-course phase.';
 }else if(activeMoon){
  const other=activeMoon.first==='Moon'?activeMoon.second:activeMoon.first;
  const stage=activeMoon.orb<=.07?(lang==='ar'?'الاتصال القمري قريب جداً من ذروته.':'The Moon contact is very close to exact.'):
   activeMoon.applying?(lang==='ar'?'القمر دا يقترب من اتصال جديد.':'The Moon is approaching an exact contact.'):
   (lang==='ar'?'القمر دا يبتعد عن اتصال صار قبل شوي.':'The Moon is separating from a contact.');
  title=(lang==='ar'?'القمر بـ'+signLabel+' · ':'Moon in '+signLabel+' · ')+eventTitle({transit:'Moon',target:other,angle:activeMoon.angle,phase:activeMoon.angle,time:at},lang);
  meaning=contactMeaning(other,activeMoon.angle,lang);
  action=choose((planets[other]??planets.Moon).step,lang);
  movement=stage;
 }else if(recent?.kind==='moon-contact'&&now-(+recent.time)<=3*3600000){
  title=lang==='ar'?'القمر بـ'+signLabel+' · بعد '+recent.label:'Moon in '+signLabel+' · After '+recent.label;
  meaning=recent.description;
  action=recent.action;
  movement=lang==='ar'?'حدث قمري محسوب صار قبل فترة قريبة.':'A calculated Moon contact occurred recently.';
 }else if(next?.kind==='moon-contact'&&+next.time-now<=3*3600000){
  const who=moon.events.find(e=>+e.time===+next.time)?.target??'Moon';
  title=lang==='ar'?'القمر بـ'+signLabel+' · يقترب من '+name(who,lang):
   'Moon in '+signLabel+' · approaching '+name(who,lang);
  meaning=next.description;
  action=next.action;
  movement=lang==='ar'?'اتصال قمري قادم خلال الساعات الجاية.':'An exact lunar contact is due in the coming hours.';
 }else if(activeBackground){
  const first=name(activeBackground.first,lang),second=name(activeBackground.second,lang);
  title=(lang==='ar'?'القمر بـ'+signLabel+' · ':'Moon in '+signLabel+' · ')+
    first+(lang==='ar'?' ويّه ':' with ')+second;
  meaning=(lang==='ar'?'بينما القمر يسلّط الضوء رمزياً على '+choose(theme.theme,lang)+
   '، أكو اتصال كوكبي قريب يرتبط بـ'+choose(planets[activeBackground.second]?.theme??theme.theme,lang)+'. ':
   'While the Moon highlights '+choose(theme.theme,lang)+', another close sky contact concerns '+
   choose(planets[activeBackground.second]?.theme??theme.theme,lang)+'. ')+
   (tense(activeBackground.angle)?(lang==='ar'?'التأني أفضل من رد سريع.':'Take your time rather than react fast.'):
    (lang==='ar'?'تعامل وياه بخطوة واقعية.':'Keep the next step practical.'));
  action=choose(theme.step,lang);
  movement=lang==='ar'?'قراءة القمر تتغيّر مع برجه وأحداثه؛ هذا اتصال إضافي بالسماء.':
   'The Moon changes with its sign and events; this is an additional sky contact.';
 }else{
  title=lang==='ar'?'القمر حالياً ببرج '+signLabel:'Moon in '+signLabel;
  meaning=lang==='ar'?'القمر هسه ببرج '+signLabel+'؛ الموضوع الرمزي الأبرز هو '+choose(theme.theme,lang)+'.':
   'The Moon is currently in '+signLabel+'; the symbolic theme is '+choose(theme.theme,lang)+'.';
  action=choose(theme.step,lang);
  movement=lang==='ar'?'ماكو حدث قريب يستدعي تبديل التفسير بغير دليل.':
   'There is no nearby calculated event that justifies a new headline.';
 }
 const moonNote=lang==='ar'?
   (moon.isVoid?'القمر خالي المسار هسه. بعد دخوله البرج القادم تتبدل قراءة الصفحة.':
    'القمر حالياً بـ'+signLabel+'؛ '+(next?.kind==='moon-contact'?'اتصاله القادم ويّه '+name(moon.events.find(e=>+e.time===+next.time)?.target??'Moon',lang)+'.':'أقرب تبدّل واضح يرتبط بالحدث القادم.')):
   (moon.isVoid?'The Moon is void of course until its next sign.':
    'Moon in '+signLabel+'; '+(next?.kind==='moon-contact'?'next contact with '+name(moon.events.find(e=>+e.time===+next.time)?.target??'Moon',lang)+'.':'awaiting its next measured event.'));
 const identity=[moon.sign,moon.isVoid?1:0,recent?.kind,recent?.time.toISOString(),next?.kind,next?.time.toISOString(),
   ...contacts.slice(0,3).map(c=>c.first+':'+c.second+':'+c.angle+':'+Number(c.applying))].join('|');
 return {title,meaning,action,movement,moonNote,recent,next,identity,activeContacts:contacts};
}


/** The Today event list uses plain-language names and topics. Angular geometry
 * is preserved in the underlying calculations and detailed screens, NOT in prose.
 */
export function todayEventPlain(ev:FocusReadingInput,lang:SkyLanguage):{label:string;description:string;action:string}{
 if(ev.kind==='moon-ingress'){
  if(!Number.isInteger(ev.nextSign)||ev.nextSign!<0||ev.nextSign!>11)throw Error('Invalid Moon ingress');
  return {label:lang==='ar'?'القمر يدخل '+choose(signNames[ev.nextSign!],lang):'Moon enters '+choose(signNames[ev.nextSign!],lang),
   description:lang==='ar'?'يتبدل معنى القمر الرمزي إلى '+choose(signThemes[ev.nextSign!].theme,lang)+'.':
    'The Moon shifts toward '+choose(signThemes[ev.nextSign!].theme,lang)+'.',
   action:choose(signThemes[ev.nextSign!].step,lang)};
 }
 if(ev.kind==='voc-start'||ev.kind==='voc-end'){
  const beginning=ev.kind==='voc-start';
  return {label:lang==='ar'?(beginning?'بداية خلو مسار القمر':'نهاية خلو مسار القمر'):
    (beginning?'Moon void-of-course begins':'Moon void-of-course ends'),
   description:lang==='ar'?(beginning?'مرحلة مراجعة وهدوء ضمن التقليد الفلكي.':'القمر يغيّر برجه وتبدأ قراءة مختلفة.'):
    (beginning?'A traditional phase of review and reflection.':'The Moon changes signs and a new reading begins.'),
   action:lang==='ar'?(beginning?'راجع موعدك والخطوة المفتوحة قبل الالتزام.':'اختار خطوة بسيطة من الأمور اللي راجعتها.'):
    (beginning?'Review your plans before committing.':'Act on one of the items you reviewed.')};
 }
 const first=ev.kind==='moon-aspect'?'Moon':ev.transit;
 const second=ev.target,topic=second?planets[second]:null;
 if(!first||!topic||!planets[first]||ev.angle===undefined||!aspectAngles.includes(ev.angle as 0))throw Error('Unsupported calculated sky event');
 const label=lang==='ar'?
  (ev.kind==='personal-aspect'?'عبور شخصي: ':'')+name(first,lang)+' ويّه '+name(second!,lang):
  (ev.kind==='personal-aspect'?'Personal transit: ':'')+name(first,lang)+' with '+name(second!,lang);
 const intro=ev.kind==='personal-aspect'?
  (lang==='ar'?'هذه إشارة على خريطتك الشخصية، ضمن موضوع ':'This personal chart contact concerns '):
  (lang==='ar'?'الاتصال القمري يركّز رمزياً على ':'The Moon contact symbolizes ');
 return {label,description:intro+choose(topic.theme,lang)+'. '+(tense(ev.angle)?(lang==='ar'?'الأفضل تهدأ قبل القرار.':'Pause before deciding.'):(lang==='ar'?'التفاصيل والرد الفعلي أهم من التوقع.':'Check real details before expecting an outcome.')),action:choose(topic.step,lang)};
}
