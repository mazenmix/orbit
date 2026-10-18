import type {Chart,Profile,Report} from './engine.ts';
import type {Point} from './math.ts';
export type ChartInsight={titleAr:string;titleEn:string;ar:string;en:string;actionAr:string;actionEn:string;signAr:string;signEn:string};
const signs=[
 ['الحمل','Aries','المبادرة والاندفاع','initiative and drive'],
 ['الثور','Taurus','الثبات والحاجة للأمان','stability and comfort'],
 ['الجوزاء','Gemini','الفضول وتبادل الأفكار','curiosity and conversation'],
 ['السرطان','Cancer','الرعاية والحساسية للمحيط','care and emotional sensitivity'],
 ['الأسد','Leo','التعبير عن الذات والاعتزاز','creative self-expression'],
 ['العذراء','Virgo','التمييز بين التفاصيل والأولويات','analysis and practical improvement'],
 ['الميزان','Libra','الإنصاف والتوازن','fairness and balance'],
 ['العقرب','Scorpio','العمق والثقة والحذر','depth and trust'],
 ['القوس','Sagittarius','الاستكشاف والاستقلال','exploration and freedom'],
 ['الجدي','Capricorn','الطموح وتحمّل المسؤولية','ambition and responsibility'],
 ['الدلو','Aquarius','الاستقلال والتجريب','independence and fresh ideas'],
 ['الحوت','Pisces','الخيال والتعاطف','imagination and empathy']
] as const;
const namesAr:Record<string,string>={Sun:'الشمس',Moon:'القمر',Mercury:'عطارد',Venus:'الزهرة',Mars:'المريخ',Jupiter:'المشتري',Saturn:'زحل'};
const areas=[
 {key:'Sun',ar:'الهوية والقرار',en:'Identity & decisions',themeAr:'طريقة بناء موقفك وإظهار شخصيتك',themeEn:'How your sense of self informs your decisions',actionAr:'حدد أولويتك بنفسك قبل ما ترضي الجميع.',actionEn:'Name your priority before trying to please everyone.'},
 {key:'Moon',ar:'الراحة والمشاعر',en:'Feelings & comfort',themeAr:'ردّة فعلك وقت التعب وحاجتك للأمان',themeEn:'What helps you feel safe and grounded',actionAr:'راجع شعورك واحتياجك الحقيقي قبل الرد.',actionEn:'Check your real emotional need before reacting.'},
 {key:'Mercury',ar:'التفكير والتواصل',en:'Thinking & communication',themeAr:'أسلوب تعلّمك وطريقة التعبير عن الأفكار',themeEn:'How you organize and communicate ideas',actionAr:'اشرح فكرتك بجملة واضحة واسأل الطرف الثاني شنو فهم.',actionEn:'State the idea clearly and check what the other person understood.'},
 {key:'Venus',ar:'الحب والذوق',en:'Love & values',themeAr:'طريقة إظهار المودّة وما تعتبره قيمة مهمة',themeEn:'How you express affection and personal values',actionAr:'صرّح شنو يريحك بالعلاقة بدل انتظار الطرف الآخر يخمن.',actionEn:'Say what feels comfortable rather than asking someone to guess.'},
 {key:'Mars',ar:'الدافع والشجاعة',en:'Drive & courage',themeAr:'تعاملـك مع المنافسة وحدود اندفاعك',themeEn:'Your approach to effort, competition and pressure',actionAr:'اختار هدفاً واحداً وصرف طاقتك عليه بهدوء.',actionEn:'Use your energy on one deliberate goal.'},
 {key:'Jupiter',ar:'فرص التطوّر',en:'Growth opportunities',themeAr:'الطريقة التي تميل بها إلى توسيع خبرتك',themeEn:'How you approach learning and expansion',actionAr:'تعلم مهارة جديدة بطريقة قابلة للقياس.',actionEn:'Develop one measurable new skill.'},
 {key:'Saturn',ar:'المسؤولية والحدود',en:'Responsibility & limits',themeAr:'المواضيع التي تحتاج منك صبر وخطة',themeEn:'Where patience and steady structure matter',actionAr:'قسّم الالتزام الكبير إلى خطوات أسبوعية صغيرة.',actionEn:'Break a large commitment into weekly steps.'}
] as const;
export function chartStories(chart:Chart):ChartInsight[]{
 return areas.flatMap(area=>{const p=chart.points.find((p:Point)=>p.id===area.key);if(!p)return [];const sign=signs[Math.floor((((p.longitude%360)+360)%360)/30)];
 return [{titleAr:area.ar,titleEn:area.en,signAr:sign[0],signEn:sign[1],ar:'وجود '+namesAr[area.key]+' ببرج '+sign[0]+' يربط '+area.themeAr+' بموضوع '+sign[2]+'، وفق التفسير الرمزي للخارطة.',en:area.key+' in '+sign[1]+' links '+area.themeEn+' with '+sign[3]+' symbolically.',actionAr:area.actionAr,actionEn:area.actionEn}];
 });
}
export function profileAddress(profile:Pick<Profile,'sex'|'name'>,arabic=true){
 if(profile.sex==='female')return arabic?'صاحبة الخارطة':'Chart owner (female)';
 if(profile.sex==='male')return arabic?'صاحب الخارطة':'Chart owner (male)';
 return arabic?'الشخص صاحب الخارطة':'Chart owner';
}
export function transitOverview(report:Report){
 const scores=report.scores;
 const dominant=(Object.entries(scores) as [string,number][]).sort((a,b)=>b[1]-a[1])[0];
 const labels:Record<string,[string,string,string,string]>={career:['الشغل والقرارات','work and decisions','اختار مهمة واضحة وقِس نتيجتها.','Choose one measurable task.'],love:['الحب والعلاقات','love and connection','عبّر عن رغبتك بصراحة واحترم رأي الطرف الآخر.','Be honest about your interest and respect the response.'],communication:['التواصل','communication','انطي مساحة للرد قبل افتراض النية.','Make room for a response before assuming intentions.'],energy:['الطاقة','energy','وزع نشاطك ولا تبالغ بالمجهود.','Pace your energy.'],emotions:['المزاج','emotions','لاحظ مشاعرك قبل اتخاذ قرار كبير.','Notice your feelings before a major decision.'],recovery:['الراحة','recovery','رتّب وقت الراحة من البداية.','Schedule meaningful rest.'],timing:['التوقيت','timing','راجع تفاصيل الموعد قبل التنفيذ.','Check timing details before acting.'],overview:['الصورة العامة','overall context','رتب الأولويات بدون استعجال.','Set priorities without rushing.']};
 const text=labels[dominant[0]];
 return {ar:'المجال الأبرز بهذه اللحظة رمزياً هو '+text[0]+'؛ هذا توصيف لحركة الأجرام، مو ضمان لحدث. '+text[2],en:'This moment symbolically emphasizes '+text[1]+'. It is not a forecast of a guaranteed event. '+text[3]};
}

export function actionForGender(value:string,sex?:'male'|'female'){
 if(sex!=='female')return value;
 const alternatives:Record<string,string>={'حدد':'حددي','راجع':'راجعي','اشرح':'اشرحي','صرّح':'صرّحي','اختار':'اختاري','تعلم':'تعلمي','قسّم':'قسّمي','سمِّ':'سمّي','لاحظ':'لاحظي','ركز':'ركّزي','رتب':'رتّبي'};
 return value.replace(/^[^\s]+/,verb=>alternatives[verb]??verb);
}

/** Respect each stored person's chosen Male/Female setting for grammatical address.
 * Gender affects Iraqi Arabic wording only, never sky coordinates or probabilities.
 */
export function partnerArabic(value:string,sex?:'male'|'female'){
 if(sex==='female')return value;
 const masculine:Record<string,string>={
  'رغبتها':'رغبته','رغباتها':'رغباته','أفكارها':'أفكاره','أحلامها':'أحلامه',
  'مشاعرها':'مشاعره','خصوصيتها':'خصوصيته','حدودها':'حدوده','رأيها':'رأيه',
  'راحتها':'راحته','إلها':'إله','عندها':'عنده','تفضيلاتها':'تفضيلاته',
  'إعجابها':'إعجابه','قرارها':'قراره','شخصيتها':'شخصيته'
 };
 const neutral:Record<string,string>={
  'رغبتها':'الرغبة الشخصية','رغباتها':'الرغبات الخاصة',
  'أفكارها':'الأفكار الخاصة','أحلامها':'الأحلام الشخصية','مشاعرها':'المشاعر الخاصة',
  'خصوصيتها':'الخصوصية الشخصية','حدودها':'الحدود الشخصية','رأيها':'الرأي الشخصي',
  'راحتها':'الراحة الشخصية','إلها':'للطرف المقابل','عندها':'عند الطرف المقابل',
  'تفضيلاتها':'التفضيلات الخاصة','إعجابها':'الإعجاب','قرارها':'قرار الطرف المقابل',
  'شخصيتها':'شخصية الطرف المقابل'
 };
 const mapping=sex==='male'?masculine:neutral;
 return value.replace(/رغباتها|تفضيلاتها|خصوصيتها|شخصيتها|رغبتها|أفكارها|أحلامها|مشاعرها|حدودها|إعجابها|قرارها|راحتها|رأيها|إلها|عندها/g,part=>mapping[part]??part);
}
