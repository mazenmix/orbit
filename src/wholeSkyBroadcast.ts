import type {Point} from './math.ts';
import {bisectAngle} from './timing.ts';
import {currentSkyContacts,type SkyAspect,type SkyLanguage} from './todaySkyBrief.ts';

/** Whole-sky event engine. Every event time is refined against the actual
 * ephemeris reader; velocity-only projections must never be presented as exact.
 * Uses a bounded 2-hour survey, then sub-minute numerical root verification.
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
 const HOUR=3600000,start=+at-hoursBack*HOUR,end=+at+hoursAhead*HOUR,step=2*HOUR;
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
    if(root&&Math.abs(func(+root))<.03)emit({kind:'ingress',at:root,first:id,sign:signAt(point(Math.min(end,+root+60000),id))});
   }
   if(first.speed*last.speed<0){
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
export function occurrenceLanguage(e:WholeSkyOccurrence,lang:SkyLanguage):{title:string;description:string;action:string}{
 const base=dictionary[e.first];
 if(e.kind==='ingress'){
  if(e.sign===undefined||e.sign<0||e.sign>11)throw Error('Invalid verified zodiac sign');
  return {
   title:lang==='ar'?base.ar+' دخل '+signText(e.sign,lang):base.en+' entered '+signText(e.sign,lang),
   description:lang==='ar'?'تغيّر موقع '+base.ar+' إلى برج جديد. محور القراءة الرمزية يرتبط بـ'+base.theme+'.':
    base.en+' entered a new sign; the symbolic focus concerns '+base.englishTheme+'.',
   action:lang==='ar'?base.action:base.englishAction
  };
 }
 if(e.kind==='station'){
  return {
   title:lang==='ar'?base.ar+(e.retrograde?' بدأ التراجع':' رجع للحركة المباشرة'):base.en+(e.retrograde?' stationed retrograde':' stationed direct'),
   description:lang==='ar'?'تغيّرت جهة الحركة الظاهرية لـ'+base.ar+'؛ هذا تبدّل فلكي محسوب.':
    base.en+' changed its apparent direction, a computed sky transition.',
   action:lang==='ar'?base.action:base.englishAction
  };
 }
 if(e.angle===undefined||!angs.includes(e.angle as 0)||!e.second)throw Error('Invalid sky aspect');
 const other=dictionary[e.second];
 const difficult=e.angle===90||e.angle===180;
 return {
  title:pair(e.first,e.second,lang),
  description:lang==='ar'?'اتصال فلكي بين '+base.theme+' و'+other.theme+'. '+(difficult?'بالتفسير الرمزي أكو شدّ يحتاج هدوء.':'بالتفسير الرمزي يصير مجال للتنسيق بهالموضوعين.'):
   'A sky contact linking '+base.englishTheme+' and '+other.englishTheme+'. '+(difficult?'The symbolic theme is tension to manage.':'The symbolic theme is easier coordination.'),
  action:lang==='ar'?other.action:other.englishAction
 };
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
  title=lang==='ar'?'صار هسه: '+item.title:'Just occurred: '+item.title;
  meaning=item.description;action=item.action;
  movement=lang==='ar'?'هذا حدث محسوب صار خلال الساعات الأخيرة.':'Verified sky event from the past few hours.';
 }else if(veryNext){
  const item=occurrenceLanguage(veryNext,lang);
  title=lang==='ar'?'دا يقترب: '+item.title:'Approaching: '+item.title;
  meaning=item.description;action=item.action;
  movement=lang==='ar'?'الاتصال أو الانتقال قرب وقته الدقيق.':'A calculated event is approaching its exact time.';
 }else if(strong){
  const a=strong.first as SkyBodyId,b=strong.second as SkyBodyId,item=occurrenceLanguage({kind:'aspect',at,first:a,second:b,angle:strong.angle},lang);
  title=item.title;meaning=item.description;action=item.action;
  movement=strong.applying?(lang==='ar'?'دا يقترب من ذروته.':'Approaching exactness.'):
    (lang==='ar'?'دا يبتعد عن ذروته.':'Separating from exactness.');
 }else {
  // No event? Use truthful planetary motion and sign, not invented activity.
  const mercury=source.get('Mercury')!,venus=source.get('Venus')!;
  title=lang==='ar'?'حركة السماء هسه: عطارد والزهرة':'Sky movement now: Mercury and Venus';
  meaning=lang==='ar'?'عطارد بـ'+signText(signAt(mercury),lang)+' والزهرة بـ'+signText(signAt(venus),lang)+
   '. ماكو اتصال قريب يبرّر تبديل العنوان، بس مواقع الكواكب دا تستمر بالحركة.':
   'Mercury is in '+signText(signAt(mercury),lang)+' and Venus is in '+signText(signAt(venus),lang)+'. No close contact justifies a fabricated new headline.';
  action=lang==='ar'?'تابع أقرب حدث محسوب وتحقق من التفاصيل قبل أي قرار.':'Watch the next verified event before making decisions.';
  movement=lang==='ar'?'أكو حركة فعلية، بس ماكو حدث جديد مؤكد بهاللحظة.':'Planets are moving, with no new verified event right now.';
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
