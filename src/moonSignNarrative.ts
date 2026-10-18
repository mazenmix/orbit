import {distance,aspects,type Point,type Evidence} from './math.ts';
import type {Chart} from './engine.ts';
/** Five editorial lines for each *calculated* lunar sign.
 * Traditional symbolic readings, never effects scientifically demonstrated on people.
 */
const signs=[
 {ar:['الحمل يرمز للمبادرة السريعة والشعور بأن الوقت مناسب للبداية.','بالحوار ممكن يصير الميل للصراحة أعلى من الميل للدبلوماسية.','العلاقات تحتاج إصغاء حتى الاندفاع ما يختصر القصة كلها.','أحسن استعمال رمزي لهذا العبور: حركة واضحة، مو قرار لا رجعة بيه.'],en:['Aries symbolizes initiative and the urge to begin.','Direct speech can take priority over diplomacy.','Listening helps prevent impulsive interactions.','Use the symbolism for a manageable first step, not a binding decision.']},
 {ar:['الثور يسلط الضوء رمزياً على الراحة والثبات والاحتياجات الملموسة.','الناس قد تربط هذا المعنى بالتمهل بدل الاستعجال في الرد.','بالعلاقات يكون التركيز على الأمان والوضوح أكثر من الإثارة العابرة.','انتبه رمزيّاً للعناد؛ التغيير التدريجي أحياناً أنفع.'],en:['Taurus symbolizes comfort, steadiness and tangible needs.','It is traditionally read as a slower, more deliberate pace.','Consistency and clarity come into focus in relationships.','Watch symbolic rigidity; small adjustments can be easier.']},
 {ar:['الجوزاء يرتبط رمزياً بالفضول والرسائل وتبديل الأفكار.','التركيز يكون على الحوار والأسئلة بدل الاستنتاج السريع.','كثرة المعلومات قد تتشتت إذا ما حددت الموضوع الأساسي.','للناس والتعارف: حوار لطيف ومباشر أفضل من وعود مبالغ بيها.'],en:['Gemini symbolizes curiosity, messaging and fresh ideas.','Questions and conversation matter more than quick assumptions.','Too many inputs can dilute attention.','For meeting people, keep conversations clear and uncomplicated.']},
 {ar:['السرطان يرمز للانتماء والذاكرة والشعور بالأمان العاطفي.','تنجيمياً ينربط هذا العبور بالاهتمام بالبيت والمقربين.','قد يصير موضوع الحدود الشخصية أهم من كثرة اللقاءات.','استخدم المعنى لمراجعة احتياجاتك، مو لافتراض مشاعر الآخرين.'],en:['Cancer symbolizes belonging, memory and emotional comfort.','Traditionally it is linked with home and familiar people.','Personal boundaries matter more than the number of encounters.','Reflect on your own needs without presuming anyone else’s feelings.']},
 {ar:['الأسد يرتبط رمزياً بالتعبير عن الذات والرغبة بأن ينشاف المجهود.','المجال المناسب هنا إظهار فكرة أو موهبة بوضوح.','بالعلاقات قد يفيد التقدير الصريح أكثر من اختبار اهتمام الطرف الثاني.','انتبه للتفريق بين الثقة بالنفس وبين الحاجة المستمرة للإعجاب.'],en:['Leo symbolizes self-expression and recognition.','It highlights showing your work and creative intentions clearly.','Appreciation works better than testing someone’s attention.','Separate grounded confidence from constant validation-seeking.']},
 {ar:['العذراء يرمز رمزياً للترتيب والتفاصيل وتصفية الفوضى.','هذا العبور يرتبط بالمراجعة الدقيقة قبل الاستنتاج.','بالتواصل حاول ما يتحول الاهتمام بالتفاصيل إلى نقد متكرر.','اختار مشكلة عملية محددة ورتب حلها بهدوء.'],en:['Virgo symbolizes organization, detail and refinement.','It is traditionally associated with reviewing the facts.','Avoid turning careful observation into constant criticism.','Choose one practical task and refine it calmly.']},
 {ar:['الميزان يرمز للموازنة بين رغبتك ورغبة الطرف المقابل.','الحوار والتفاهم يحتاجان سؤال واضح بدل قراءة النوايا.','العلاقات يبرز بيها معنى الإنصاف وتوزيع المسؤولية.','تجنب تأجيل قرار بسيط فقط حتى ترضي الجميع.'],en:['Libra symbolizes balancing your needs with those of others.','Ask directly instead of trying to read private intentions.','Fairness and reciprocity become central symbolic themes.','Avoid postponing simple decisions to please everyone.']},
 {ar:['العقرب يرمز للعمق وحدود الثقة والموضوعات غير المحسومة.','التأويل التقليدي يركز على المراجعة الهادئة لا كشف الأسرار.','بالعلاقات لا تفترض الدوافع الخفية أو تحاول تمتحن أحد.','حوّل الفضول إلى سؤال محترم بدل المراقبة والشك.'],en:['Scorpio symbolizes depth, trust and unresolved questions.','Its traditional theme is reflection, not access to secrets.','Avoid assuming hidden motives or testing another person.','Turn curiosity into a respectful question.']},
 {ar:['القوس يرتبط رمزياً بالاستكشاف وتوسيع النظرة.','هذا العبور ينربط بخطط السفر والتعلم والتجارب الجديدة.','الحماس مفيد للتفكير بالفرص، لكن التفاصيل تبقى مهمة.','احچي عن خططك بوضوح بدون وعود أكبر من الواقع.'],en:['Sagittarius symbolizes exploration and new perspectives.','Traditional themes include travel, learning and trying something new.','Enthusiasm helps generate ideas; details still matter.','Share realistic plans rather than overpromising.']},
 {ar:['الجدي يرمز رمزياً للجدية والتنظيم وتحمل المسؤولية.','القراءة التقليدية تركز على الشغل والالتزامات وترتيب الأولويات.','بالعلاقات قد يكون التعبير بالفعل العملي أهم من الكلام الكبير.','انتبه حتى الطموح ما يتحول لضغط على نفسك وعلى اللي حولك.'],en:['Capricorn symbolizes responsibility, structure and long-term goals.','Traditional themes emphasize work, obligations and prioritization.','Showing reliability may matter more than grand declarations.','Avoid turning ambition into pressure on yourself or others.']},
 {ar:['الدلو يرمز للاستقلال والأفكار غير المعتادة والتجربة.','بالنقاش يظهر معنى تقبل وجهات النظر المختلفة.','التواصل مع مجموعات جديدة يحمل معنى الانفتاح، مو ضمان القبول.','استعمل التغيير لاختبار فكرة بدون قطع علاقات أو حرق جسور.'],en:['Aquarius symbolizes independence, fresh ideas and experimentation.','Different viewpoints are a key part of this symbolism.','New circles suggest openness, not guaranteed acceptance.','Test an idea without needlessly burning bridges.']},
 {ar:['الحوت يرتبط رمزياً بالخيال والتعاطف والحاجة للهدوء.','بالتواصل لازم تفرق بين الشعور الشخصي وبين المعلومة المؤكدة.','الراحة والإبداع موضوعان تقليديان لهذا العبور.','تجنب تفسير الصمت أو الإشارات الغامضة كوعود من الآخرين.'],en:['Pisces symbolizes imagination, empathy and quiet reflection.','Separate personal impressions from verified information.','Rest and creativity feature in its traditional interpretation.','Do not interpret silence or ambiguity as a promise.']}
] as const;
const arName:Record<string,string>={Sun:'الشمس',Moon:'القمر',Mercury:'عطارد',Venus:'الزهرة',Mars:'المريخ',Jupiter:'المشتري',Saturn:'زحل',Uranus:'أورانوس',Neptune:'نبتون',Pluto:'بلوتو',Chiron:'كيرون'};
const aspectAr:Record<number,string>={0:'اقتران',60:'تسديس',90:'تربيع',120:'تثليث',180:'مقابلة'};
const aspectEn:Record<number,string>={0:'conjunction',60:'sextile',90:'square',120:'trine',180:'opposition'};
export function moonSignReading(sign:number,current:Chart,natal:Chart,knownTime=true,arabic=true):string[]{
 if(!Number.isInteger(sign)||sign<0||sign>11)throw Error('Invalid Moon sign');
 const intro=signs[sign][arabic?'ar':'en'];
 const body=current.points.find(p=>p.id==='Moon');
 const targets=natal.points.filter(p=>p.id!=='Moon'||knownTime);
 const contacts=body?aspects([body],targets,current.date).filter(e=>e.natal.id!=='Ascendant'&&e.natal.id!=='MC'||knownTime):[];
 const best=contacts[0];
 let personal:string;
 if(best){
  const target=arabic?(arName[best.natal.id]??best.natal.id):best.natal.id;
  const relationship=arabic?(aspectAr[best.angle]??String(best.angle)+'°'):(aspectEn[best.angle]??String(best.angle)+'°');
  personal=arabic?'على خارطتك إنت تحديداً: القمر عنده '+relationship+' مع '+target+' الأصلي، بفارق '+best.orb.toFixed(2)+'°؛ هذا اتصال محسوب، وتأويله رمزي مو تأثير مثبت.':
   'For your selected chart: the Moon forms a '+relationship+' to natal '+target+', orb '+best.orb.toFixed(2)+'°. That aspect is calculated; its interpretation is symbolic.';
 }else personal=arabic?'بخارطتك الحالية ما ظهر اتصال رئيسي قوي للقمر مع المواضع الأصلية ضمن حدّ الحساب؛ ما راح نخترع واحد.':
  'No major close Moon-to-natal contact was calculated in the configured orb; none is invented.';
 return [...intro,personal];
}
