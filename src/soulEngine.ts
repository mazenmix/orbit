import type {Chart,Profile} from './engine.ts';
import {distance,houseNumber,type Point} from './math.ts';
import {soulCategories,soulTopics,type SoulTopic} from './soulData.ts';
export type NatalBasis={planet:string;longitude:number;sign:number;house:number|null;retrograde:boolean;angle:{planet:string;type:number;orb:number;conflict:boolean}|null};
export type SoulReading={topic:SoulTopic;basis:NatalBasis[];summary:{ar:string;en:string};deep:{ar:string;en:string};strengths:{ar:string[];en:string[]};weaknesses:{ar:string[];en:string[]};example:{ar:string;en:string};advice:{ar:string;en:string};question:{ar:string;en:string};limitations:{ar:string;en:string};contradictory:boolean};
const arSigns=['الحمل','الثور','الجوزاء','السرطان','الأسد','العذراء','الميزان','العقرب','القوس','الجدي','الدلو','الحوت'];
const enSigns=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const styleAr=['المبادرة والوضوح','الثبات وتقدير الراحة','الفضول وتبادل الأفكار','الحاجة إلى الألفة والرعاية','الظهور والتعبير الواثق','الانتباه للتفاصيل والتحسين','الموازنة والإنصاف','العمق ووضع حدود للثقة','التجربة والانفتاح على الجديد','التخطيط وتحمل الالتزام','الاستقلال وإعادة التفكير','الخيال والتعاطف'];
const styleEn=['direct initiative','steady values and comfort','curiosity and dialogue','emotional belonging','creative self-expression','careful practical analysis','balance and fairness','emotional intensity and trust','exploration and perspective','structure and responsibility','autonomy and unconventional thinking','imagination and empathy'];
const arPlanets:Record<string,string>={Sun:'الشمس',Moon:'القمر',Ascendant:'الطالع',MC:'وسط السماء',Mercury:'عطارد',Venus:'الزهرة',Mars:'المريخ',Jupiter:'المشتري',Saturn:'زحل',Uranus:'أورانوس',Neptune:'نبتون',Pluto:'بلوتو',Chiron:'كيرون',Ceres:'سيريس',Pallas:'بالاس',Juno:'جونو',Vesta:'فيستا',Pholus:'فولوس'};
const roleAr:Record<string,string>={Sun:'الهوية والإرادة',Moon:'الأمان والمزاج',Ascendant:'الانطباع الأول',MC:'العمل والحضور',Mercury:'التفكير والكلام',Venus:'القيم والانجذاب',Mars:'المبادرة والطاقة',Jupiter:'التوسّع والتجربة',Saturn:'الحدود والمسؤولية',Uranus:'التجديد والاستقلال',Neptune:'الخيال والتصور',Pluto:'التحوّل والقوة',Chiron:'التعلم من الحساسيات',Juno:'التعاون في الالتزام'};
const roleEn:Record<string,string>={Sun:'identity and direction',Moon:'comfort and emotion',Ascendant:'first impressions',MC:'career visibility',Mercury:'thought and speech',Venus:'values and attraction',Mars:'drive and initiative',Jupiter:'openness and growth',Saturn:'limits and commitment',Uranus:'change and autonomy',Neptune:'imagination',Pluto:'power and transformation',Chiron:'learning through sensitivity',Juno:'partnership agreements'};
const aspectNamesAr:Record<number,string>={0:'اقتران',60:'تسديس',90:'تربيع',120:'تثليث',180:'مقابلة'};
const aspectNamesEn:Record<number,string>={0:'conjunction',60:'sextile',90:'square',120:'trine',180:'opposition'};
const aspectAngles=[0,60,90,120,180];
export function soulBasis(chart:Chart,topic:SoulTopic):NatalBasis[]{
 const config=soulCategories[topic.categoryId-1];
 if(!config)throw Error('Invalid category');
 const order=[config.planets[topic.slot%config.planets.length],config.planets[(topic.slot+1)%config.planets.length],config.planets[(topic.slot+2)%config.planets.length]];
 const planets=new Map(chart.points.map(p=>[p.id,p]));
 // Use angle only if birth time is known and the engine actually returned it.
 if(chart.asc!==null)planets.set('Ascendant',{id:'Ascendant',symbol:'ASC',longitude:chart.asc,speed:0});
 if(chart.mc!==null)planets.set('MC',{id:'MC',symbol:'MC',longitude:chart.mc,speed:0});
 const choose=(id:string)=>planets.get(id);
 return [...new Set(order)].map(id=>choose(id)).filter((p):p is Point=>!!p).map(p=>{
  const others=chart.points.filter(q=>q.id!==p.id);
  const matches=others.flatMap(q=>aspectAngles.map(angle=>({planet:q.id,type:angle,orb:Math.abs(distance(q.longitude,p.longitude)-angle),conflict:angle===90||angle===180}))).filter(x=>x.orb<=3).sort((a,b)=>a.orb-b.orb);
  const sign=Math.floor(((p.longitude%360)+360)%360/30);
  const house=chart.cusps.length===12?houseNumber(p.longitude,chart.cusps):0;
  return {planet:p.id,longitude:p.longitude,sign,house:house||null,retrograde:p.speed<0,angle:matches[0]??null};
 });
}
const fmt=(b:NatalBasis,ar:boolean)=>{
 const pl=ar?(arPlanets[b.planet]??b.planet):b.planet;
 const sign=ar?arSigns[b.sign]:enSigns[b.sign];
 const house=b.house?(ar?' · البيت ':' · house ')+b.house:'';
 const retro=b.retrograde?(ar?' · متراجع':' · retrograde'):'';
 return pl+' · '+sign+' '+(b.longitude%30).toFixed(2)+'°'+house+retro;
};
export function soulReading(chart:Chart,topic:SoulTopic):SoulReading{
 if(!soulTopics.some(t=>t.id===topic.id&&t.categoryId===topic.categoryId))throw Error('Unknown analysis topic');
 const basis=soulBasis(chart,topic),a=basis[0],b=basis[1]??a;
 const category=soulCategories[topic.categoryId-1],contrast=basis.some(v=>v.angle?.conflict);
 const style=a?styleAr[a.sign]:'عدم كفاية المواضع',englishStyle=a?styleEn[a.sign]:'unavailable natal placements';
 const different=b&&b.planet!==a?.planet;
 const arRole=a?roleAr[a.planet]??'المجال الرمزي':'المجال';
 const enRole=a?roleEn[a.planet]??'symbolic emphasis':'the theme';
 const support=style+' مع '+(b?styleAr[b.sign]:'عدم كفاية البيانات');
 const enSupport=englishStyle+' alongside '+(b?styleEn[b.sign]:'unavailable information');
 const topicName=topic.ar,topicEn=topic.en;
 const introductionAr='في موضوع «'+topicName+'»، الخارطة تضع '+arRole+' ببرج '+(a?arSigns[a.sign]:'غير متاح')+'، وهذا يقدّم ميل رمزي نحو '+style+'.';
 const introductionEn='For “'+topicEn+'”, '+(a?a.planet+' in '+enSigns[a.sign]:'the available natal chart')+' is traditionally associated with '+englishStyle+'.';
 const connectiveAr=different?'وموقع '+(arPlanets[b.planet]??b.planet)+' في '+arSigns[b.sign]+' يضيف زاوية ثانية: '+styleAr[b.sign]+'. ':'';
 const connectiveEn=different?' '+b.planet+' in '+enSigns[b.sign]+' supplies a second symbolic perspective: '+styleEn[b.sign]+'. ':'';
 const aspects=basis.filter(v=>v.angle).map(v=>{
  const x=v.angle!;return (arPlanets[v.planet]??v.planet)+' '+aspectNamesAr[x.type]+' '+(arPlanets[x.planet]??x.planet)+' (orb '+x.orb.toFixed(2)+'°)';
 });
 const englishAspects=basis.filter(v=>v.angle).map(v=>{const x=v.angle!;return v.planet+' '+aspectNamesEn[x.type]+' '+x.planet+' (orb '+x.orb.toFixed(2)+'°)'});
 const specificAr=aspects.length?'يوجد اتصال ميلادي محسوب: '+aspects[0]+'. ':'ما ظهر اتصال قريب ضمن أورب 3° بين المؤشرات المختارة. ';
 const specificEn=englishAspects.length?'A calculated natal aspect is '+englishAspects[0]+'. ':'No close aspect within a 3° orb was found among these indicators. ';
 const complicationAr=contrast?'بعض الاتصالات تربيع أو مقابلة، فالتفسير يتضمّن شدّاً بين الميل والحاجة، مو صفة ثابتة.':'ولا توجد زاوية ضاغطة قريبة بين الأدلة المختارة بهذا الموضوع.';
 const complicationEn=contrast?'An actual square/opposition introduces a counter-theme, rather than a fixed conclusion.':'No nearby hard angle was found among these selected signals.';
 const promptsAr=[
  'جرّب توصف شنو تختار فعلياً بهالموقف، مو شنو تتمنى يكون جوابك.',
  'قارن موقفين حقيقيين من حياتك وشوف شنو العامل المشترك.',
  'اسأل شخص موثوق شنو لاحظه بسلوكك واستمع بدون دفاع.',
  'دوّن قراراً صغيراً واتبع أثره أسبوع قبل ما تحكم.',
  'راقب ردة فعلك وقت الضغط ثم عدّل خطوة واحدة.',
  'حدد حدّاً واضحاً وخلي تواصلك عنه محترماً ومباشراً.',
  'اختبر الفكرة بتجربة قابلة للتراجع بدل اتخاذ حكم نهائي.',
  'راجع مرة صار الموضوع مختلف عن توقعك واسأل شنو تعلمت.'
 ];
 const promptsEn=[
  'Describe what you actually choose in this situation, not the answer you wish were true.',
  'Compare two real experiences and look for a repeated factor.',
  'Ask someone you trust what behavior they have observed, then listen openly.',
  'Try one small decision and evaluate its consequences after a week.',
  'Notice your reaction under pressure, then adjust one response.',
  'State one respectful boundary clearly and directly.',
  'Test the idea with a reversible experiment before reaching a fixed verdict.',
  'Revisit a counterexample and note what it taught you.'
 ];
 const action=promptsAr[topic.slot],actionEn=promptsEn[topic.slot];
 const topicAskAr='بالنسبة إلى «'+topicName+'»، شنو التصرف اللي فعلاً يتكرر بحياتك، وشنو مجرد توقع عندك؟';
 const topicAskEn='For “'+topicEn+'”, what behavior have you actually observed, and what is only your assumption?';
 return {topic,basis,summary:{ar:introductionAr,en:introductionEn},
 deep:{ar:connectiveAr+specificAr+complicationAr,en:connectiveEn+specificEn+complicationEn},
 strengths:{ar:['إمكانية الاستفادة من '+style+' بمجال '+topicName,'موازنة '+support+' بقرار واعٍ'],en:['Potential to apply '+englishStyle+' to '+topicEn,'An opportunity to balance '+enSupport+' with reflection']},
 weaknesses:{ar:['المبالغة في '+style+' قد تقلل المرونة','لا نفترض أن الرمز يثبت وجود صفة أو رغبة خفية'],en:['Overreliance on '+englishStyle+' might narrow flexibility','The symbolic placement does not establish a hidden trait or desire']},
 example:{ar:'ممكن يظهر هذا الموضوع في كيفية تعاملك مع «'+topicName+'» يوم تتطلب الظروف مفاضلة بين '+support+'؛ راجع سلوكك الفعلي.',en:'You might explore this theme when “'+topicEn+'” requires a choice between '+enSupport+'; check actual behavior.'},
 advice:{ar:action,en:actionEn},question:{ar:topicAskAr,en:topicAskEn},limitations:{ar:'هذا تفسير تنجيمي رمزي، مو اختبار نفسي أو معرفة لرغبات سرية. '+(chart.cusps.length===12?'البيوت مأخوذة من وقت الميلاد المعروف.':'وقت الميلاد/البيوت غير متاحة؛ ما انحسب بيت مفترض.'),en:'Symbolic astrology, not a psychological assessment or access to secret preferences. '+(chart.cusps.length===12?'Houses use known birth-time calculations.':'Birth time/houses unavailable; no house placement was guessed.')},contradictory:contrast};
}
export function soulProfileSummary(chart:Chart,profile:Profile){
 const sun=chart.points.find(x=>x.id==='Sun'),moon=chart.points.find(x=>x.id==='Moon');
 const first=sun?arSigns[Math.floor(((sun.longitude%360)+360)%360/30)]:'غير متاح';
 const second=moon?arSigns[Math.floor(((moon.longitude%360)+360)%360/30)]:'غير متاح';
 const asc=chart.asc!==null?arSigns[Math.floor(((chart.asc%360)+360)%360/30)]:null;
 return {ar:'خارطة '+profile.name+' تربط رمزية الشمس في '+first+' باتجاه الهوية والمبادرة، والقمر في '+second+' بالاحتياجات العاطفية. '+(asc?'الطالع في '+asc+' يضيف منظور الانطباع الأول. ':'ما عدنا طالع موثوق لأن وقت الميلاد مو معلوم. ')+'النتيجة إطار للتأمل بشخصيتك، مو حقيقة مؤكدة عن دوافعك أو أسرارك.',en:profile.name+"'s natal symbolism combines the Sun in "+(sun?enSigns[Math.floor(sun.longitude/30)]:'an unknown sign')+' with core direction and Moon in '+(moon?enSigns[Math.floor(moon.longitude/30)]:'an unknown sign')+' with emotional needs. '+(asc?'Ascendant '+enSigns[Math.floor(chart.asc!/30)]+' adds first-impression themes. ':'Unknown birth time means the Ascendant cannot be interpreted.')+' Use this as reflection, not a factual psychological diagnosis.'};
}
export function soulEvidenceText(basis:NatalBasis[],arabic:boolean){
 if(!basis.length)return arabic?'بيانات الميلاد غير كافية لهذا الموضوع.':'Insufficient natal data for this topic.';
 return basis.map(x=>fmt(x,arabic)+(x.angle?' · '+(arabic?aspectNamesAr[x.angle.type]:aspectNamesEn[x.angle.type])+' '+(arabic?(arPlanets[x.angle.planet]??x.angle.planet):x.angle.planet)+' orb '+x.angle.orb.toFixed(2)+'°':'')).join(' | ');
}
