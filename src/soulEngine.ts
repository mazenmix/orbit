import type {Chart,Profile} from './engine.ts';
import {distance,houseNumber,type Point} from './math.ts';
import {soulCategories,soulTopics,type SoulTopic} from './soulData.ts';
import {getSoulTheme} from './soulThemes.ts';
import {soulDeepFor} from './soulDeep.ts';
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
const houseFocusAr=['','الهوية والصورة الأولى','الموارد والشعور بالقيمة','التواصل اليومي والتعلم','البيت والجذور','التعبير والإبداع والمرح','العادات اليومية والعمل','الشراكات والتفاهم','الثقة والتغيير الشخصي','الأفق والتجربة والتعلم','العمل والمسؤولية العامة','المجتمع والأصدقاء','الداخل والراحة والخصوصية'];
const houseFocusEn=['','identity and first impressions','resources and self-worth','communication and learning','home and roots','creative expression and play','habits and work','partnership and cooperation','trust and private change','exploration and perspective','career and public role','community and friendship','inner life and privacy'];
const contextAr=[
 'كيف تختار صورة نفسك أمام غيرك','كيف تتعامل مع الأمان والتعبير عن المشاعر','شلون ترتب الأفكار قبل الحسم',
 'طريقة الحوار وفهم الإشارات','التصرفات اللي تحتاج مواجهة صادقة بدون جلد الذات','ما تخليه بخصوصيتك وبحدودك',
 'الفرق بين الإعجاب والتوافق الواقعي','المغازلة مع مراعاة تجاوب الطرف المقابل','الثقة اللي تنبني بمواقف متكررة',
 'اختيار شريك بقيم وسلوك فعلي','الالتزامات اللي تحتاج اتفاقاً واضحاً','حوار الاحترام والرضا والأمان',
 'فضولك وخصوصيتك وقرارك الحر','موازنة الغيرة مع استقلال الطرفين','كسر نمط علاقات يتكرر',
 'طريقة توزيع طاقتك الاجتماعية','قيم البيت والعائلة مقابل الاختيار الشخصي','القرارات المهنية القابلة للقياس',
 'تفضيلاتك الحقيقية بالأمان والصرف','تجريب موهبة بدل الاكتفاء بوصفها','مقارنة ذوقك الحقيقي بالمقترح الرمزي',
 'المبادرة والمسؤولية عن التأثير','تجاربك اليومية وما ينفعك بيها','الاستجابة للضغط ثم التعافي',
 'مراحل النمو والأهداف اللي تختارها'
];
const contextEn=[
 'how you define your identity around other people','your emotional safety and expression','how you organize information before deciding',
 'actual communication and listening habits','observing difficult behavior without self-blame','what you choose to keep private',
 'distinguishing attraction from genuine compatibility','flirting while respecting the other person’s response','trust built through repeated actions',
 'choosing a partner using observed values and behavior','commitments that need explicit agreements','respect, consent and emotional safety',
 'curiosity, privacy and freedom of choice','balancing jealousy with another person’s autonomy','interrupting repeating relationship patterns',
 'where you spend social energy','home and family values versus individual choice','career decisions you can evaluate in practice',
 'your actual security and spending needs','experimenting with skill rather than labeling a talent','comparing your real taste with symbolic suggestions',
 'initiative and responsibility for your influence','daily life experiments and what actually works','stress reactions and recovery',
 'self-development and self-chosen long-range goals'
];
const strengthsAr=[
 'وعي أوضح بهويتك','حساسية أفضل لاحتياجاتك','قدرة على تنظيم سؤال معقد','فرصة لتحسين وضوح الحوار',
 'قابلية ملاحظة عادة قابلة للإصلاح','قدرة على وضع حد صحي','تقدير اختيار متبادل','مبادرة لطيفة وواضحة',
 'رعاية روابط فيها ثقة','اختيار قيم مشتركة','بناء اتفاقات طويلة الأمد','تعامل صريح يحفظ الرضا',
 'فضول مع احترام الخصوصية','تمييز الشعور عن السيطرة','مراجعة معايير العلاقة',
 'اهتمام حقيقي بالناس','بناء روابط عائلية بحدود واضحة','تطوير مهارة عملية','قراءة أوضح للأولويات المالية',
 'تشجيع موهبة بالتجربة','تطوير ذوق واعٍ','تأثير نافع ومسؤول','اختيار إيقاع يومي مرن',
 'قدرة على التعافي والتعلم','تحويل الأهداف إلى أفعال'
];
const strengthsEn=[
 'clearer self-awareness','attention to your emotional needs','asking better questions','communicating with clarity',
 'spotting changeable habits','setting healthy boundaries','recognizing mutual choice','taking a considerate initiative',
 'building dependable bonds','finding shared values','creating lasting agreements','protecting mutual consent',
 'exploring with privacy and care','separating feelings from control','reviewing relationship criteria',
 'investing in real people','maintaining family ties and boundaries','developing practical skills','clarifying financial priorities',
 'testing talents through practice','refining informed preferences','using influence responsibly','building a flexible daily rhythm',
 'recovering and learning','turning goals into actions'
];
const challengesAr=[
 'التسرع بوصف نفسك نهائياً','تفسير المشاعر بدل سماعها','البحث عن جواب كامل قبل أي خطوة',
 'افتراض أنك فهمت الطرف الثاني دون سؤال','تبرير سلوك مؤذٍ باسم الطبع','اعتبار الصمت دليلاً على رغبة سرية',
 'خلط الانبهار بالثقة','الاستمرار بالمبادرة دون تجاوب','توقع ثبات المشاعر من البداية',
 'رفع التوقعات قبل فهم الشخص','ترك الالتزامات للتخمين','الضغط أو تجاوز الموافقة',
 'الظن أن الخارطة تعرف الأسرار','تحويل القلق إلى مراقبة','تكرار تجربة دون مراجعة الأفعال',
 'استنزاف نفسك لإرضاء الجميع','ذوبان الاختيار الشخصي بضغوط العائلة','الخلط بين الإنجاز والكمال',
 'الإنفاق أو الخوف دون مراجعة الأرقام','الاعتقاد بموهبة مؤكدة دون تدريب','اعتبار الألوان الرمزية ذوقاً مثبتاً',
 'المبالغة بالإنجاز على حساب الراحة','الخلط بين عادة مريحة وهروب','الاندفاع تحت ضغط مؤقت',
 'تحويل الطموح إلى أحكام على نفسك'
];
const challengesEn=[
 'locking identity into a final label','explaining away feelings without listening','demanding complete certainty before action',
 'assuming you understand another person without asking','excusing harm as a personality trait','treating silence as proof of hidden desire',
 'mistaking excitement for trust','persisting without reciprocity','assuming early feelings will remain fixed',
 'idealizing before learning who someone is','leaving commitments unspoken','pressuring past consent and boundaries',
 'pretending a chart reveals secrets','turning worry into monitoring','repeating choices without examining behavior',
 'exhausting yourself trying to please everyone','losing autonomy under family pressure','confusing progress with perfection',
 'spending or worrying without examining figures','claiming talent before practice','mistaking symbolic colors for verified taste',
 'sacrificing recovery for status','mistaking avoidance for rest','acting rashly under temporary pressure',
 'turning ambition into harsh self-judgment'
];
if([contextAr,contextEn,strengthsAr,strengthsEn,challengesAr,challengesEn].some(a=>a.length!==25))throw Error('Incomplete 25-domain Soul DNA writing rubric');
const spot=(a:NatalBasis|undefined,ar:boolean)=>a?(ar?(arPlanets[a.planet]??a.planet):a.planet)+' '+(ar?'في برج ':'in ')+(ar?arSigns[a.sign]:enSigns[a.sign]):(ar?'بيانات الميلاد غير كافية':'insufficient natal placements');
const dom=(c:number,array:readonly string[])=>array[c-1]??'';
const capitalize=(s:string)=>s.length?s[0].toUpperCase()+s.slice(1):s;
export function soulReading(chart:Chart,topic:SoulTopic):SoulReading{
 if(!soulTopics.some(t=>t.id===topic.id&&t.categoryId===topic.categoryId))throw Error('Unknown analysis topic');
 const theme=getSoulTheme(topic.id),specific=soulDeepFor(topic.id),basis=soulBasis(chart,topic),a=basis[0],b=basis[1];
 const category=topic.categoryId, hasTwo=!!a&&!!b;
 const keyA=a?styleAr[a.sign]:'بيانات غير كافية',keyB=b?styleAr[b.sign]:'بيانات غير كافية';
 const keyEnA=a?styleEn[a.sign]:'missing chart data',keyEnB=b?styleEn[b.sign]:'missing chart data';
 const areaAr=dom(category,contextAr),areaEn=dom(category,contextEn);
 const areaHouseAr=a?.house?houseFocusAr[a.house]:'الموضوع الفلكي من غير تحديد بيت';
 const areaHouseEn=a?.house?houseFocusEn[a.house]:'this natal theme without a fabricated house';
 const supportiveAngle=basis.some(v=>v.angle&&(v.angle.type===60||v.angle.type===120));
 const challengingAngle=basis.some(v=>v.angle?.conflict);
 const contrasted=challengingAngle&&supportiveAngle;
 const angleHintAr=contrasted?'الأدلة بيها زوايا داعمة وضاغطة معاً؛ وهذا يفتح قراءتين، لا نتيجة واحدة محسومة.':challengingAngle?'توجد زاوية ميلادية ضاغطة محسوبة؛ تعامل وياها كموضوع يحتاج موازنة مو كصفة سيئة.':supportiveAngle?'توجد زاوية متناغمة محسوبة تساعد القراءة الرمزية لهذا المحور، مو ضمان لسلوك.':'ماكو اتصال قوي ضمن الأورب المختار يثبت حكم إضافي بهذا المجال.';
 const angleHintEn=contrasted?'Actual supportive and challenging aspects coexist; the symbolism points in more than one direction.':challengingAngle?'A calculated challenging natal aspect adds a tension to explore, not a negative fixed personality label.':supportiveAngle?'A calculated harmonious aspect supports this symbolic theme but cannot guarantee behavior.':'No close aspect within the configured orb adds certainty to this theme.';
 const openingAr=theme.focusAr+'. عند تفسير «'+topic.ar+'»، '+(a?'وجود '+spot(a,true)+' يفتح سؤال '+(roleAr[a.planet]??'القيمة الرمزية')+' من زاوية '+keyA+'.':'المواضع المتاحة غير كافية لاستنتاج موقف فلكي موثوق.') ;
 const openingEn=theme.focusEn+'. For “'+topic.en+'”, '+(a?spot(a,false)+' suggests considering '+(roleEn[a.planet]??'symbolic meaning')+' through '+keyEnA+'.':'there are insufficient reliable natal positions for this theme.');
 const alternateAr=hasTwo?'بنفس الوقت، '+spot(b,true)+' يوجّه الانتباه إلى '+keyB+'؛ وهنا تگدر تفحص الشد أو التعاون بين الاحتياجين من خلال تجاربك.':'ما عدنا كوكب ثاني محسوب بهذا الاختيار حتى نقارن الاتجاهين.';
 const alternateEn=hasTwo?'Meanwhile, '+spot(b,false)+' brings '+keyEnB+' into the picture; real experiences can show how these needs interact.':'A second reliable placement is unavailable for comparison.';
 const deepAr=specific.ar+'. '+alternateAr+' '+(a?.house?'من جهة موضع الكوكب بالبيت '+a.house+'، يظهر محور '+areaHouseAr+'. ':'')+angleHintAr;
 const deepEn=specific.en+'. '+alternateEn+' '+(a?.house?'The calculated house '+a.house+' adds '+areaHouseEn+'. ':'')+angleHintEn;
 const strengths1Ar=dom(category,strengthsAr)+' عند مناقشة «'+topic.ar+'» من غير حكم مسبق';
 const strengths1En=capitalize(dom(category,strengthsEn))+' when exploring '+topic.en.toLocaleLowerCase()+' without a premature label';
 const strengths2Ar='استعمال '+keyA+(hasTwo?' مع '+keyB:'')+' لتجربة تفسيرين قبل اختيار موقف';
 const strengths2En='Using '+keyEnA+(hasTwo?' alongside '+keyEnB:'')+' to consider more than one response';
 const risks1Ar=dom(category,challengesAr)+' خصوصاً بمواقف '+topic.ar;
 const risks1En=capitalize(dom(category,challengesEn))+' when dealing with '+topic.en.toLocaleLowerCase();
 const risks2Ar=challengingAngle?'الزاوية الضاغطة مو دليل أن جانباً سلبياً موجود عندك؛ يحتاج تحقق من سلوك حقيقي.':'لا تملأ فراغ الأدلة الفلكية بافتراضات عن نوايا أو صفات ثابتة.';
 const risks2En=challengingAngle?'A difficult aspect is not proof of an actual negative trait; check lived behavior.':'Missing chart evidence cannot be replaced with assumptions about hidden motives.';
 const scenarioAr='في موقف مرتبط بـ«'+topic.ar+'»، إذا ظهر '+keyA+' واحتجت أيضاً إلى '+keyB+'، جرّب تلاحظ شنو يحتاجه الموقف فعلياً قبل ما تقرر. هنا '+areaAr+'.';
 const scenarioEn='In a real situation involving '+topic.en.toLocaleLowerCase()+', you might experience '+keyEnA+' alongside '+keyEnB+'. Notice which response fits the context; the relevant area is '+areaEn+'.';
 const questionAr='على ضوء «'+topic.ar+'»، شنو موقف من حياتك يخليك توافق أو تختلف مع الفكرة: '+theme.focusAr+'؟';
 const questionEn='For '+topic.en.toLocaleLowerCase()+', which lived example supports or challenges this interpretation: '+theme.focusEn+'?';
 return {topic,basis,summary:{ar:openingAr,en:openingEn},deep:{ar:deepAr,en:deepEn},
  strengths:{ar:[strengths1Ar,strengths2Ar],en:[strengths1En,strengths2En]},
  weaknesses:{ar:[risks1Ar,risks2Ar],en:[risks1En,risks2En]},
  example:{ar:scenarioAr,en:scenarioEn},
  advice:{ar:theme.actionAr,en:theme.actionEn},
  question:{ar:questionAr,en:questionEn},
  limitations:{ar:'الدرجة والشرح تأويل تنجيمي مو اختبار نفسي أو وسيلة لمعرفة رغبات الآخرين. '+(chart.cusps.length===12?'البيوت محسوبة من وقت الميلاد.':'وقت الميلاد غير معروف أو البيوت غير متاحة، لذلك ما افترضنا أرقام بيوت.'),en:'Astrological symbolism is not a validated psychological test or a way to know others’ private wishes. '+(chart.cusps.length===12?'Houses follow the calculated birth-time chart.':'Birth time/houses unavailable; no house was invented.')},contradictory:contrasted||challengingAngle};
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
