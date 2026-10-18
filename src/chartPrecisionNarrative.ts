import type {Chart,Report} from './engine.ts';
import {distance,houseNumber,type Point,type Evidence} from './math.ts';
export type PrecisionInsight={id:string;titleAr:string;titleEn:string;signAr:string;signEn:string;ar:string;en:string;actionAr:string;actionEn:string;degree:number;house:number|null;aspect:string|null};
const planets:Record<string,{ar:string;en:string;roleAr:string;roleEn:string;actionAr:string;actionEn:string}>={
 Sun:{ar:'الشمس · الهوية',en:'Sun · Identity',roleAr:'القرار وطريقة التعبير عن الذات',roleEn:'decision-making and self-expression',actionAr:'دقق وين تقدر تثبت قرارك بالفعل، مو بالتوقع.',actionEn:'Test your priorities against what you actually do.'},
 Moon:{ar:'القمر · الاحتياج العاطفي',en:'Moon · Emotional needs',roleAr:'الراحة وسرعة رد الفعل',roleEn:'comfort and emotional reactions',actionAr:'راقب احتياجك للراحة قبل ما تحكم على تصرف الآخرين.',actionEn:'Check your own need for comfort before judging others.'},
 Mercury:{ar:'عطارد · العقل',en:'Mercury · Thinking',roleAr:'توصيل الأفكار وأسئلة الفهم',roleEn:'thinking, language and questions',actionAr:'اكتب الفكرة المحورية واسأل عن الفهم، بدل تفسير الصمت.',actionEn:'Ask for clarification instead of interpreting silence.'},
 Venus:{ar:'الزهرة · العلاقات',en:'Venus · Values',roleAr:'طريقة المودة والذوق والمبادلة',roleEn:'affection, values and reciprocity',actionAr:'اختار أسلوب تواصل يحترم راحة الطرفين.',actionEn:'Choose communication that respects both people’s comfort.'},
 Mars:{ar:'المريخ · الإرادة',en:'Mars · Initiative',roleAr:'الجهد والاندفاع وإدارة الاحتكاك',roleEn:'drive, initiative and frustration',actionAr:'اختر خطوة صغيرة قبل خطوة ما تگدر ترجع عنها.',actionEn:'Use a reversible step before a major commitment.'},
 Jupiter:{ar:'المشتري · التوسع',en:'Jupiter · Expansion',roleAr:'التعلم والتجربة والطموح',roleEn:'learning, growth and ambition',actionAr:'اربط الطموح بخطة قابلة للقياس.',actionEn:'Link your ambitions to a measurable plan.'},
 Saturn:{ar:'زحل · الحدود',en:'Saturn · Structure',roleAr:'الصبر والمسؤوليات وتنظيم الالتزام',roleEn:'structure, patience and boundaries',actionAr:'فصل الواجب الحقيقي عن الضغط اللي تفرضه على نفسك.',actionEn:'Separate true obligations from unnecessary pressure.'},
 Uranus:{ar:'أورانوس · الاستقلال',en:'Uranus · Change',roleAr:'التجريب والاستقلال عن الأنماط القديمة',roleEn:'change and experimentation',actionAr:'جرّب طريقة جديدة مع خطة احتياط.',actionEn:'Test one new approach while keeping a fallback.'},
 Neptune:{ar:'نبتون · الخيال',en:'Neptune · Imagination',roleAr:'الخيال والانطباعات والالتباس',roleEn:'imagination, intuition and ambiguity',actionAr:'فرّق بين انطباعك والمعلومة اللي تكدر تتأكد منها.',actionEn:'Separate impressions from verified information.'},
 Pluto:{ar:'بلوتو · التحول',en:'Pluto · Transformation',roleAr:'العمق والتحولات الطويلة والسلطة',roleEn:'deep change and power dynamics',actionAr:'لاحظ وين تحتاج حدود أو تغيير تدريجي.',actionEn:'Notice where better boundaries or gradual change help.'},
 Chiron:{ar:'كيرون · التعلم من التجربة',en:'Chiron · Learning',roleAr:'الخبرة الصعبة وإعادة تفسيرها',roleEn:'learning from difficult experiences',actionAr:'فصل معنى التجربة عن حكم نهائي على شخصيتك.',actionEn:'Do not define yourself by a single difficult experience.'},
 Ceres:{ar:'سيريس · العناية',en:'Ceres · Care',roleAr:'العناية اليومية والمسؤولية عنها',roleEn:'care and everyday responsibilities',actionAr:'حدد توازن العطاء والراحة.',actionEn:'Balance care for others with your own needs.'},
 Juno:{ar:'جونو · الشراكة',en:'Juno · Partnership',roleAr:'الاتفاقات المتبادلة وحدود الشراكة',roleEn:'reciprocal agreements and partnership boundaries',actionAr:'خلّي أي اتفاق واضح للطرفين.',actionEn:'Make agreements clear to both parties.'},
 Vesta:{ar:'فيستا · التركيز',en:'Vesta · Focus',roleAr:'التفرغ لمهمة ووقت خاص',roleEn:'dedication and focus',actionAr:'خصص وقت للعمل الهادئ.',actionEn:'Protect some undistracted time.'}
};
const signs=[
 ['الحمل','Aries','مبادرة مباشرة','direct initiative'],['الثور','Taurus','وتيرة ثابتة','steady pacing'],['الجوزاء','Gemini','فضول وتبديل أفكار','curiosity and multiple perspectives'],
 ['السرطان','Cancer','حاجة للانتماء','belonging and care'],['الأسد','Leo','حضور وتعبير واضح','visibility and expression'],['العذراء','Virgo','مراجعة وتحليل','careful analysis'],
 ['الميزان','Libra','توازن وتفاوض','balance and negotiation'],['العقرب','Scorpio','ثقة وعمق','depth and trust'],['القوس','Sagittarius','تعلم وتجربة','exploration and learning'],
 ['الجدي','Capricorn','مسؤولية وبناء طويل','structure and commitment'],['الدلو','Aquarius','استقلال وتجديد','independence and change'],['الحوت','Pisces','خيال ومرونة شعورية','imagination and emotional sensitivity']
] as const;
const arName:Record<string,string>={Sun:'الشمس',Moon:'القمر',Mercury:'عطارد',Venus:'الزهرة',Mars:'المريخ',Jupiter:'المشتري',Saturn:'زحل',Uranus:'أورانوس',Neptune:'نبتون',Pluto:'بلوتو',Chiron:'كيرون',Ceres:'سيريس',Juno:'جونو',Vesta:'فيستا'};
const arAspect:Record<number,string>={0:'اقتران',60:'تسديس',90:'تربيع',120:'تثليث',180:'مقابلة'};
const enAspect:Record<number,string>={0:'conjunction',60:'sextile',90:'square',120:'trine',180:'opposition'};
const angles=[0,60,90,120,180] as const;
const angleMeaning:Record<number,[string,string]>={
 0:['يجمع موضوعين بمساحة تركيز واحدة، وقد يزيد الإلحاح الرمزي.','Combines two themes in a focused symbolic pattern.'],
 60:['يفتح مساراً مرناً بين وظيفتين مختلفتين في الخارطة.','Suggests a flexible symbolic connection between two themes.'],
 90:['يبرز شدّاً بين أولويتين يحتاج إدارة وتوازن.','Highlights symbolic friction between competing priorities.'],
 120:['يوحي بانسياب بين موضوعين، لكنه ليس ضمان نتيجة.','Suggests symbolic ease without guaranteeing an outcome.'],
 180:['يظهر قطبين يحتاجان إنصاتاً وحدوداً متبادلة.','Highlights two poles that call for balance and boundaries.']
};
type Contact={point:Point;angle:number;orb:number};
function nearestNatal(point:Point,points:readonly Point[]):Contact|null{
 const choices:Contact[]=[];
 for(const other of points){
  if(other.id===point.id||['Ascendant','MC'].includes(other.id))continue;
  const d=distance(point.longitude,other.longitude);
  for(const angle of angles){const orb=Math.abs(d-angle);if(orb<=5.5)choices.push({point:other,angle,orb})}
 }
 return choices.sort((a,b)=>a.orb-b.orb)[0]??null;
}
export function precisionChartStories(natal:Chart,current?:Chart,evidence:readonly Evidence[]=[],knownTime=true):PrecisionInsight[]{
 return natal.points.filter(p=>planets[p.id]).map(p=>{
  const role=planets[p.id],z=signs[Math.floor((((p.longitude%360)+360)%360)/30)],degree=((p.longitude%30)+30)%30;
  const house=knownTime&&natal.cusps.length===12?houseNumber(p.longitude,natal.cusps):null;
  const match=nearestNatal(p,natal.points),transit=current?evidence.filter(e=>e.natal.id===p.id).sort((a,b)=>a.orb-b.orb)[0]:undefined;
  const placementAr=arName[p.id]+' عند '+degree.toFixed(2)+'° من '+z[0]+(house?' بالبيت '+house:'')+(p.speed<0?' وهو متراجع بالخارطة.':'.');
  const placementEn=p.id+' at '+degree.toFixed(2)+'° '+z[1]+(house?' in house '+house:'')+(p.speed<0?' (retrograde).':'.');
  const asAr=match?' أقرب اتصال ولادي: '+(arAspect[match.angle]??match.angle+'°')+' مع '+(arName[match.point.id]??match.point.id)+' بفارق '+match.orb.toFixed(2)+'°. '+angleMeaning[match.angle][0]:
    ' ماكو اتصال ولادي رئيسي قريب ضمن هامش 5.5° لهذه النقطة؛ ما نضيف اتصال من التخمين.';
  const asEn=match?' Closest natal aspect: '+(enAspect[match.angle]??match.angle+'°')+' with '+match.point.id+', orb '+match.orb.toFixed(2)+'°. '+angleMeaning[match.angle][1]:
    ' No major natal aspect was calculated within 5.5° for this body.';
  const trAr=transit?' بالوقت المختار: '+(arName[transit.transit.id]??transit.transit.id)+' يعمل '+(arAspect[transit.angle]??transit.angle+'°')+' مع موضعه الأصلي بفارق '+transit.orb.toFixed(2)+'° '+(transit.applying?'ويقترب من الدقة.':'ويبتعد عن الدقة.'):'';
  const trEn=transit?' At the selected moment '+transit.transit.id+' makes a '+(enAspect[transit.angle]??transit.angle+'°')+' to natal '+p.id+', orb '+transit.orb.toFixed(2)+'°, '+(transit.applying?'applying.':'separating.'):'';
  return {id:p.id,titleAr:role.ar,titleEn:role.en,signAr:z[0],signEn:z[1],degree,house,aspect:match?.point.id??null,
   ar:placementAr+' بهذا التأويل، '+role.roleAr+' يتفاعل مع '+z[2]+'.'+asAr+trAr,
   en:placementEn+' In the symbolic reading, '+role.roleEn+' interacts with '+z[3]+'.'+asEn+trEn,
   actionAr:role.actionAr,actionEn:role.actionEn};
 });
}
export function precisionChartSignature(chart:Chart):string{
 return chart.points.filter(p=>planets[p.id]).map(p=>p.id+':'+p.longitude.toFixed(3)).join('|');
}
