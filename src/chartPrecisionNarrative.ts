import type {Chart,Report} from './engine.ts';
import {distance,houseNumber,type Point,type Evidence} from './math.ts';
import {interpretableNatalPoints} from './readingBasis.ts';
export type PrecisionInsight={id:string;titleAr:string;titleEn:string;signAr:string;signEn:string;ar:string;en:string;actionAr:string;actionEn:string;degree:number;house:number|null;aspect:string|null;aspectAngle?:number|null;aspectOrb?:number|null};
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
const lifeExamples:Record<string,[string,string]>={
 Sun:['إذا قرار بالشغل أو بحياتك الخاصة يتعارض ويا توقعات الناس، شنو تختار وشنو تشرح لهم؟','If a decision clashes with expectations, what do you choose and how do you explain it?'],
 Moon:['لما تمر بيوم متعب، شنو يعطيك راحة حقيقية: الانسحاب شوي، حچي واضح، لو ترتيب مكانك؟','After a difficult day, what really restores comfort: space, conversation or structure?'],
 Mercury:['وقت تفهم رسالة بطريقتين، شكد تعتمد على السؤال المباشر بدل الاستنتاج؟','When a message seems ambiguous, how often do you clarify instead of assuming?'],
 Venus:['بالقرب العاطفي، شنو يثبت الاهتمام عندك: كلام واضح، مبادرة، لو استمرارية؟','In relationships, what makes care credible: words, initiative or consistency?'],
 Mars:['عند اختلاف بالرأي، شنو الفرق بين الحزم المفيد وبين ردّة فعل تستعجلها؟','During disagreement, where is the line between useful assertiveness and a rushed reaction?'],
 Jupiter:['إذا فرصة جديدة عجبتك، هل تحسب الجهد والكلفة مثلما تحسب الفائدة؟','When an opportunity excites you, do you weigh effort and costs as well as potential gain?'],
 Saturn:['المسؤولية اللي تشيلها: كلها ضرورية، لو جزء منها لأنك ما تحب تقول لا؟','Are all your responsibilities necessary, or do some come from struggling to say no?'],
 Uranus:['إذا طريقة قديمة ما عادت تفيد، شنو أصغر تجربة جديدة ما تخرب الاستقرار؟','When an old routine stops helping, what reversible experiment could improve it?'],
 Neptune:['وقت تتمنى نتيجة عاطفية أو مهنية، شلون تميّز الأمل من الشي اللي عندك دليل عليه؟','When you hope for an outcome, how do you distinguish evidence from wishful interpretation?'],
 Pluto:['في خلاف قديم، شنو تقدر تغيره بتصرفك وشنو مو من حقك تفرضه على غيرك؟','In an old disagreement, what can you change yourself and what is not yours to control?']
};
const livedHouses:Record<number,[string,string]>={
 1:['صورتك الذاتية وأول مبادرة','identity and personal initiative'],2:['القيم والمصاريف والاستقرار','resources and financial steadiness'],
 3:['الرسائل والتعلّم اليومي','messages and everyday learning'],4:['البيت والعائلة','home and family'],
 5:['الانجذاب والإبداع والمتعة','romance, creativity and pleasure'],6:['الروتين والشغل اليومي','routine and everyday work'],
 7:['الشراكات والتفاهم','partnerships and mutual agreements'],8:['الثقة والحدود والمال المشترك','trust, boundaries and shared resources'],
 9:['السفر والقناعات والتعلّم','travel and wider perspectives'],10:['المسار المهني والسمعة','career and reputation'],
 11:['الأصدقاء والمجتمعات','friendships and communities'],12:['الخصوصية والخلوة','private reflection and solitude']
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
 const readable=interpretableNatalPoints(natal.points,knownTime);
 return readable.filter(p=>planets[p.id]).map(p=>{
  const role=planets[p.id],z=signs[Math.floor((((p.longitude%360)+360)%360)/30)],degree=((p.longitude%30)+30)%30;
  const house=knownTime&&natal.cusps.length===12?houseNumber(p.longitude,natal.cusps):null;
  const match=nearestNatal(p,readable),transit=current?evidence.filter(e=>e.natal.id===p.id).sort((a,b)=>a.orb-b.orb)[0]:undefined;
  const placementAr=arName[p.id]+' عند '+degree.toFixed(2)+'° من '+z[0]+(house?' بالبيت '+house:'')+(p.speed<0?' وهو متراجع بالخارطة.':'.');
  const placementEn=p.id+' at '+degree.toFixed(2)+'° '+z[1]+(house?' in house '+house:'')+(p.speed<0?' (retrograde).':'.');
  const asAr=match?' أقرب اتصال ولادي: '+(arAspect[match.angle]??match.angle+'°')+' مع '+(arName[match.point.id]??match.point.id)+' بفارق '+match.orb.toFixed(2)+'°. '+angleMeaning[match.angle][0]:
    ' ماكو اتصال ولادي رئيسي قريب ضمن هامش 5.5° لهذه النقطة؛ ما نضيف اتصال من التخمين.';
  const asEn=match?' Closest natal aspect: '+(enAspect[match.angle]??match.angle+'°')+' with '+match.point.id+', orb '+match.orb.toFixed(2)+'°. '+angleMeaning[match.angle][1]:
    ' No major natal aspect was calculated within 5.5° for this body.';
  const trAr=transit?' بالوقت المختار: '+(arName[transit.transit.id]??transit.transit.id)+' يعمل '+(arAspect[transit.angle]??transit.angle+'°')+' مع موضعه الأصلي بفارق '+transit.orb.toFixed(2)+'° '+(transit.applying?'ويقترب من الدقة.':'ويبتعد عن الدقة.'):'';
  const trEn=transit?' At the selected moment '+transit.transit.id+' makes a '+(enAspect[transit.angle]??transit.angle+'°')+' to natal '+p.id+', orb '+transit.orb.toFixed(2)+'°, '+(transit.applying?'applying.':'separating.'):'';
  return {id:p.id,titleAr:role.ar,titleEn:role.en,signAr:z[0],signEn:z[1],degree,house,aspect:match?.point.id??null,aspectAngle:match?.angle??null,aspectOrb:match?.orb??null,
   ar:'قراءة '+role.ar+' في '+z[0]+': أسلوب '+z[2]+' يلتقي ويا موضوع '+role.roleAr+'. '+(house&&livedHouses[house]?'بيت الميلاد '+house+' يضيف ساحة '+livedHouses[house][0]+'. ':'')+(match?'واتصاله الأقرب ويا '+(arName[match.point.id]??match.point.id)+' ('+(arAspect[match.angle]??String(match.angle)) +') يضيف جانب ثاني: '+angleMeaning[match.angle][0]+' ':'')+'مثال حتى تختبره بحياتك: '+(lifeExamples[p.id]?.[0]??role.actionAr)+' '+(transit?'وبهذا الوقت '+(arName[transit.transit.id]??transit.transit.id)+' '+(arAspect[transit.angle]??'يتصل')+' ويا موضعه الولادي؛ '+(transit.applying?'الزاوية تقترب من الدقة.':'الزاوية تبتعد عن الدقة.'):'')+' الأساس الحسابي: '+placementAr+asAr,
   en:role.en+' in '+z[1]+' connects '+z[3]+' with '+role.roleEn+'. '+(house&&livedHouses[house]?'Natal house '+house+' places this theme around '+livedHouses[house][1]+'. ':'')+(match?'Its closest natal aspect with '+match.point.id+' ('+(enAspect[match.angle]??String(match.angle))+') adds a second dimension: '+angleMeaning[match.angle][1]+' ':'')+'A situation to test in real life: '+(lifeExamples[p.id]?.[1]??role.actionEn)+' '+(transit?'At the selected time '+transit.transit.id+' forms a '+(enAspect[transit.angle]??'contact')+' to natal '+p.id+', '+(transit.applying?'applying.':'separating.'):'')+' Calculation basis: '+placementEn+asEn,

   actionAr:role.actionAr,actionEn:role.actionEn};
 });
}
export function precisionChartSignature(chart:Chart):string{
 return chart.points.filter(p=>planets[p.id]).map(p=>p.id+':'+p.longitude.toFixed(3)).join('|');
}
