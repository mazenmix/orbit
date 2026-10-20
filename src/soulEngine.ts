import type {Chart,Profile} from './engine.ts';
import {distance,houseNumber,type Point} from './math.ts';
import {soulTopics,type SoulTopic} from './soulData.ts';
import {getSoulTheme} from './soulThemes.ts';
import {soulDeepFor} from './soulDeep.ts';
import {soulRule} from './soulTopicRules.ts';
import {interpretableNatalPoints} from './readingBasis.ts';

export type NatalBasis={planet:string;longitude:number;sign:number;house:number|null;retrograde:boolean;angle:{planet:string;type:number;orb:number;conflict:boolean}|null};
export type NatalAspect={first:string;second:string;type:number;orb:number};
export type SoulOptions={knownTime?:boolean};
export type SoulReading={topic:SoulTopic;basis:NatalBasis[];basisStatus:'available'|'limited'|'unavailable';summary:{ar:string;en:string};deep:{ar:string;en:string};strengths:{ar:string[];en:string[]};weaknesses:{ar:string[];en:string[]};example:{ar:string;en:string};advice:{ar:string;en:string};question:{ar:string;en:string};limitations:{ar:string;en:string};contradictory:boolean};
const arSigns=['الحمل','الثور','الجوزاء','السرطان','الأسد','العذراء','الميزان','العقرب','القوس','الجدي','الدلو','الحوت'];
const enSigns=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const styleAr=['المبادرة والتعبير المباشر','الثبات وتقدير الملموس','الفضول وتبادل الأفكار','الألفة والرعاية','الإبداع والتعبير الواثق','التدقيق والتحسين العملي','الموازنة والإنصاف','العمق وحماية الثقة','التجربة وتوسيع المنظور','التخطيط وتحمل المسؤولية','الاستقلال وإعادة النظر في المألوف','الخيال والتعاطف'];
const styleEn=['initiative and direct expression','consistency and tangible values','curiosity and exchanging ideas','belonging and care','creativity and confident expression','precision and practical improvement','balance and fairness','depth and protecting trust','exploration and wider perspective','planning and responsibility','autonomy and questioning convention','imagination and empathy'];
const arPlanets:Record<string,string>={Sun:'الشمس',Moon:'القمر',Ascendant:'الطالع',MC:'وسط السماء',Mercury:'عطارد',Venus:'الزهرة',Mars:'المريخ',Jupiter:'المشتري',Saturn:'زحل',Uranus:'أورانوس',Neptune:'نبتون',Pluto:'بلوتو',Chiron:'كيرون',Ceres:'سيريس',Pallas:'بالاس',Juno:'جونو',Vesta:'فيستا',Pholus:'فولوس'};
const roleAr:Record<string,string>={Sun:'الهوية والاختيار الشخصي',Moon:'الاحتياج العاطفي والاطمئنان',Ascendant:'أسلوب الظهور والانطباع الأول',MC:'الاتجاه المهني والحضور العام',Mercury:'التفكير وصياغة الكلام',Venus:'التفضيل والانجذاب والتقدير',Mars:'المبادرة والتعامل مع الاحتكاك',Jupiter:'التوسع والمعنى والفرص',Saturn:'الحدود والاستمرارية والمسؤولية',Uranus:'التجديد والاستقلال',Neptune:'الخيال والتوقعات',Pluto:'القوة والتحول وحدود التأثير'};
const roleEn:Record<string,string>={Sun:'identity and personal choice',Moon:'emotional needs and reassurance',Ascendant:'presentation and first impressions',MC:'career direction and public presence',Mercury:'thinking and putting ideas into words',Venus:'preference, attraction and appreciation',Mars:'initiative and handling friction',Jupiter:'growth, meaning and opportunity',Saturn:'boundaries, continuity and responsibility',Uranus:'renewal and autonomy',Neptune:'imagination and expectations',Pluto:'power, change and limits of influence'};
const aspectNamesAr:Record<number,string>={0:'اقتران',60:'تسديس',90:'تربيع',120:'تثليث',180:'مقابلة'};
const aspectNamesEn:Record<number,string>={0:'conjunction',60:'sextile',90:'square',120:'trine',180:'opposition'};
const houseFocusAr=['','الهوية والصورة الأولى','الموارد والشعور بالقيمة','التواصل اليومي والتعلم','البيت والجذور','الإبداع والمرح والتعبير','العادات والعمل اليومي','الشراكات والاتفاقات','الموارد المشتركة والثقة','التعلم والسفر والمنظور','العمل والدور العام','الأصدقاء والمجموعات','الخلوة والخصوصية'];
const houseFocusEn=['','identity and first impressions','resources and self-worth','everyday communication and learning','home and roots','creativity, play and expression','habits and everyday work','partnerships and agreements','shared resources and trust','learning, travel and perspective','career and public role','friends and groups','solitude and privacy'];
const sign=(longitude:number)=>Math.floor(((longitude%360)+360)%360/30);
const name=(id:string,ar:boolean)=>ar?(arPlanets[id]??id):id;
const role=(id:string,ar:boolean)=>(ar?roleAr:roleEn)[id]??name(id,ar);
const finitePosition=(p:Point)=>Number.isFinite(p.longitude)&&p.longitude>=0&&p.longitude<360&&Number.isFinite(p.speed);

function canonicalTopic(topic:SoulTopic){
 const selected=soulTopics[topic.id-1];
 if(!selected||selected.id!==topic.id||selected.categoryId!==topic.categoryId)throw Error('Unknown analysis topic');
 return selected;
}

/** Close major aspects between selected natal indicators only. An orb is an
 * editorial inclusion limit, never statistical confidence in personality. */
export function soulAspectPairs(basis:readonly Pick<NatalBasis,'planet'|'longitude'>[]):NatalAspect[]{
 const pairs:NatalAspect[]=[];
 basis.forEach((a,i)=>basis.slice(i+1).forEach(b=>{
  if(!Number.isFinite(a.longitude)||!Number.isFinite(b.longitude)||a.planet===b.planet)return;
  const separation=distance(a.longitude,b.longitude);
  for(const type of [0,60,90,120,180]){
   const orb=Math.abs(separation-type);
   if(orb<=3)pairs.push({first:a.planet,second:b.planet,type,orb});
  }
 }));
 return pairs.sort((a,b)=>a.orb-b.orb||a.first.localeCompare(b.first)||a.second.localeCompare(b.second));
}

export function soulBasis(chart:Chart,topic:SoulTopic,{knownTime=true}:SoulOptions={}):NatalBasis[]{
 const rule=soulRule(canonicalTopic(topic).id);
 const planets=new Map(interpretableNatalPoints(chart.points,knownTime).map(p=>[p.id,p]));
 if(knownTime&&chart.asc!==null&&Number.isFinite(chart.asc)&&chart.asc>=0&&chart.asc<360)planets.set('Ascendant',{id:'Ascendant',symbol:'ASC',longitude:chart.asc,speed:0});
 if(knownTime&&chart.mc!==null&&Number.isFinite(chart.mc)&&chart.mc>=0&&chart.mc<360)planets.set('MC',{id:'MC',symbol:'MC',longitude:chart.mc,speed:0});
 const houses=knownTime&&chart.cusps.length===12&&chart.cusps.every(Number.isFinite);
 const basis:NatalBasis[]=[...new Set(rule.planets)].flatMap(id=>{
  const p=planets.get(id);if(!p)return [];
  const house=houses?houseNumber(p.longitude,chart.cusps):0;
  return [{planet:p.id,longitude:p.longitude,sign:sign(p.longitude),house:house||null,retrograde:p.speed<0,angle:null}];
 });
 const pairs=soulAspectPairs(basis);
 for(const p of basis){
  const pair=pairs.find(x=>x.first===p.planet||x.second===p.planet);
  if(pair)p.angle={planet:pair.first===p.planet?pair.second:pair.first,type:pair.type,orb:pair.orb,conflict:pair.type===90||pair.type===180};
 }
 return basis;
}

function placementText(b:NatalBasis,ar:boolean){
 return name(b.planet,ar)+(ar?' في ':' in ')+(ar?arSigns:enSigns)[b.sign];
}
function pairInterpretation(basis:NatalBasis[],ar:boolean){
 const [a,b]=basis;
 if(!a)return ar?'المواضع اللازمة لهذا الموضوع غير متاحة؛ لا نضيف صفات شخصية لتعويض نقص البيانات.':'The required indicators are unavailable; missing data do not justify invented traits.';
 if(!b)return ar?'نقرأ '+placementText(a,true)+' رمزياً من زاوية '+role(a.planet,true)+' و'+styleAr[a.sign]+'. لا تتوفر إشارة ثانية للمقارنة.':placementText(a,false)+' is read symbolically through '+role(a.planet,false)+' and '+styleEn[a.sign]+'. A second indicator is unavailable.';
 if(a.sign===b.sign)return ar?
  'يشترك '+name(a.planet,true)+' و'+name(b.planet,true)+' في برج '+arSigns[a.sign]+'، المرتبط رمزياً بـ'+styleAr[a.sign]+'. لكن الأول يتعلق بـ'+role(a.planet,true)+'، والثاني بـ'+role(b.planet,true)+'؛ لذلك نقرأ الأسلوب المشترك في وظيفتين مختلفتين.':
  name(a.planet,false)+' and '+name(b.planet,false)+' share '+enSigns[a.sign]+', symbolically associated with '+styleEn[a.sign]+'. The first concerns '+role(a.planet,false)+' and the second '+role(b.planet,false)+', giving the shared style two different roles.';
 return ar?
  'نقرأ موضع '+placementText(a,true)+' بوصفه رمزاً لموضوع '+role(a.planet,true)+' بأسلوب '+styleAr[a.sign]+'، بينما يرتبط موضع '+placementText(b,true)+' بموضوع '+role(b.planet,true)+' عبر '+styleAr[b.sign]+'. محور القراءة هو كيفية إعطاء كل دور مساحة تناسب الموقف.':
  placementText(a,false)+' symbolizes '+role(a.planet,false)+' through '+styleEn[a.sign]+', while '+placementText(b,false)+' connects '+role(b.planet,false)+' with '+styleEn[b.sign]+'. The focus is on giving each role room appropriate to the situation.';
}
function aspectInterpretation(basis:NatalBasis[],ar:boolean){
 const pairs=soulAspectPairs(basis);
 if(!pairs.length)return ar?'لا يوجد اتصال رئيسي ضمن أورب 3° بين المؤشرات المختارة؛ هذا لا يعني خلو الخارطة كلها من الاتصالات.':'No major aspect falls within 3° among the selected indicators; this does not mean the entire chart lacks aspects.';
 const a=pairs[0];
 const describe=(p:NatalAspect)=>name(p.first,ar)+(ar?' و':' and ')+name(p.second,ar)+' ('+(ar?aspectNamesAr:aspectNamesEn)[p.type]+')';
 const roles=role(a.first,ar)+(ar?' و':' and ')+role(a.second,ar);
 const meaning=ar?(a.type===0?'يجمع '+roles+' في تعبير متقارب، وقد يصعب الفصل بينهما':a.type===90?'يطرح موازنة بين '+roles+' حين يتطلب كل منهما استجابة مختلفة':a.type===180?'يبرز قطبين هما '+roles+'؛ يهم هنا التبادل بينهما دون إلغاء أحدهما':'يتيح قراءة '+roles+' كمسارين يمكن تنسيقهما، دون افتراض مهارة مكتسبة'):
  (a.type===0?'combines '+roles+', which may be difficult to separate':a.type===90?'raises a balance between '+roles+' when they call for different responses':a.type===180?'sets out two poles, '+roles+', to consider without excluding either':'suggests coordinating '+roles+', without implying an acquired skill');
 const lead=ar?'أقرب اتصال مختار هو '+describe(a)+'؛ رمزياً '+meaning+'.':'The closest selected aspect is '+describe(a)+'; symbolically it '+meaning+'.';
 const contrasting=pairs.find(p=>[90,180].includes(a.type)?[60,120].includes(p.type):[60,120].includes(a.type)&&[90,180].includes(p.type));
 return lead+(contrasting?(ar?' ويوجد أيضاً '+describe(contrasting)+'؛ لذلك تضم القراءة جانباً داعماً وآخر يحتاج موازنة.':' There is also '+describe(contrasting)+', so the reading includes both ease and a need for adjustment.'):'');
}

/** Interpret the actual combination of two natal indicators in each of the
 * 200 individually authored topics. No claim about private desires or observed behaviour. */
function livedNatalTheme(topic:SoulTopic,basis:NatalBasis[],specific:{ar:string;en:string},rule:{resource:{ar:string;en:string};risk:{ar:string;en:string}}){
 const [a,b]=basis;
 const relations=soulAspectPairs(basis);
 const lead=relations[0];
 const firstAr=placementText(a,true),secondAr=placementText(b,true);
 const firstEn=placementText(a,false),secondEn=placementText(b,false);
 const different=a.sign!==b.sign;
 const bridgeAr=different?
  'الأول يميل رمزياً لأسلوب '+styleAr[a.sign]+'، والثاني يضيف '+styleAr[b.sign]+'. مو لازم تختار واحد دائماً؛ السؤال شوقت تستخدم كل أسلوب.':
  'الاثنين يشتركون بأسلوب '+styleAr[a.sign]+'، لكن كل واحد يخص احتياج مختلف: '+role(a.planet,true)+' مقابل '+role(b.planet,true)+'.';
 const bridgeEn=different?
  'The first symbolizes '+styleEn[a.sign]+'; the second adds '+styleEn[b.sign]+'. These are different lenses, not a fixed personality verdict.':
  'Both share the style of '+styleEn[a.sign]+', but serve distinct needs: '+role(a.planet,false)+' and '+role(b.planet,false)+'.';
 const meetingAr=lead?(lead.type===90||lead.type===180?
  'وأكو '+aspectNamesAr[lead.type]+' بين '+name(lead.first,true)+' و'+name(lead.second,true)+'؛ بالتفسير يشير لشدّ بين رغبتين. حاول تلاحظ متى يتحول الاختلاف لحيرة أو عناد.':
  lead.type===0?'وأكو اقتران يحط هالموضوعين بمساحة واحدة؛ جرب تميّز بين احتياجاتهما قبل قرار مهم.':
  'وأكو '+aspectNamesAr[lead.type]+' بين '+name(lead.first,true)+' و'+name(lead.second,true)+'؛ هذا يرمز لقابلية تنسيق، لكنه ما يثبت أن المهارة موجودة فعلاً.') :
  'ماكو اتصال رئيسي قريب بين المؤشرين ضمن الأورب المعتمد؛ لذلك ما ننسب إلهم شدّ أو انسجام غير محسوب.';
 const meetingEn=lead?(lead.type===90||lead.type===180?
  'A calculated '+aspectNamesEn[lead.type]+' between '+lead.first+' and '+lead.second+' suggests competing needs; notice where they might clash in decisions.':
  lead.type===0?'A conjunction unites the themes; check whether you are treating two different needs as one.':
  'A calculated '+aspectNamesEn[lead.type]+' between '+lead.first+' and '+lead.second+' suggests room for coordination, not evidence of acquired ability.'):
  'No close major aspect connects these selected indicators, so no fabricated harmony or tension is assigned.';
 const settingAr=a.house?'وبحسب البيت '+a.house+'، ممكن تختبر هالسؤال بموضوع '+houseFocusAr[a.house]+'.':'';
 const settingEn=a.house?'House '+a.house+' places the reflection around '+houseFocusEn[a.house]+'.':'';
 return {
  summaryAr:'بموضوع «'+topic.ar+'»، '+firstAr+' يسلّط الضوء على '+role(a.planet,true)+'، بينما '+secondAr+' يضيف '+role(b.planet,true)+'. '+bridgeAr,
  summaryEn:'For “'+topic.en+'”, '+firstEn+' symbolizes '+role(a.planet,false)+', while '+secondEn+' adds '+role(b.planet,false)+'. '+bridgeEn,
  deepAr:meetingAr+' '+settingAr+' مثال واقعي حتى تختبر القراءة: '+specific.ar+'. إذا شفت هالنمط عندك، قوّي جانب '+rule.resource.ar+'، وانتبه من '+rule.risk.ar+'.',
  deepEn:meetingEn+' '+settingEn+' A concrete situation to test the interpretation: '+specific.en+'. If it matches your actual experience, develop '+rule.resource.en+' while watching for '+rule.risk.en+'.'
 };
}
export function soulReading(chart:Chart,topic:SoulTopic,options:SoulOptions={}):SoulReading{
 topic=canonicalTopic(topic);
 const theme=getSoulTheme(topic.id),specific=soulDeepFor(topic.id),rule=soulRule(topic.id),basis=soulBasis(chart,topic,options),a=basis[0];
 if(basis.length<2){
  const available=basis.length?{ar:'المتاح فقط: '+placementText(basis[0],true)+'.',en:'Only '+placementText(basis[0],false)+' is available.'}:{ar:'لا تتوفر مواضع صالحة من المؤشرات المطلوبة لهذا الموضوع.',en:'No valid placement among this topic’s required indicators is available.'};
  return {topic,basis,basisStatus:basis.length?'limited':'unavailable',
   summary:{ar:'البيانات غير كافية لتحليل «'+topic.ar+'».',en:'Insufficient data to interpret “'+topic.en+'”.'},deep:{ar:available.ar+' ما نكمل الفراغ بصفات أو استنتاجات شخصية.',en:available.en+' Missing evidence is not filled with personality claims.'},
   strengths:{ar:[],en:[]},weaknesses:{ar:[],en:[]},example:{ar:'',en:''},advice:{ar:'راجع بيانات الولادة والمؤشرات المتاحة لهذا الموضوع.',en:'Review the birth inputs and this topic’s available indicators.'},
   question:{ar:'هل بيانات الولادة كاملة ووقت الولادة معروف؟',en:'Are the birth inputs complete and is the birth time known?'},
   limitations:{ar:'هذا الموضوع يحتاج مؤشرين ولاديين صالحين على الأقل قبل تقديم قراءة رمزية. وقت الولادة المجهول يستبعد القمر والطالع ووسط السماء والبيوت.',en:'This topic requires at least two valid natal indicators for a symbolic reading. Unknown birth time excludes Moon, angles and houses.'},contradictory:false};
 }
 const pairs=soulAspectPairs(basis),mixed=pairs.some(p=>[90,180].includes(p.type))&&pairs.some(p=>[60,120].includes(p.type));
 const introAr=a?' في القراءة الرمزية لـ«'+topic.ar+'»، يضيف موضع '+placementText(a,true)+' منظور '+role(a.planet,true)+' عبر '+styleAr[a.sign]+'.':' لا تتوفر بيانات كافية لربط هذا الموضوع بخارطتك.';
 const introEn=a?' For “'+topic.en+'”, '+placementText(a,false)+' adds the symbolic perspective of '+role(a.planet,false)+' through '+styleEn[a.sign]+'.':' The available data are insufficient to connect this topic to your chart.';
 const c=basis[2];
 const thirdAr=c?' ويضيف '+placementText(c,true)+' منظور '+role(c.planet,true)+(basis.slice(0,2).some(b=>b.sign===c.sign)?'':' عبر '+styleAr[c.sign])+'.':'';
 const thirdEn=c?' '+placementText(c,false)+' adds '+role(c.planet,false)+(basis.slice(0,2).some(b=>b.sign===c.sign)?'':' through '+styleEn[c.sign])+'.':'';
 const housesAr=a?.house?' موضع '+name(a.planet,true)+' في البيت '+a.house+' يضيف سياق '+houseFocusAr[a.house]+' إلى هذا الموضوع.':'';
 const housesEn=a?.house?' '+name(a.planet,false)+' in house '+a.house+' adds the context of '+houseFocusEn[a.house]+' to this theme.':'';
 const retro=basis.filter(b=>b.retrograde).map(b=>name(b.planet,true)).join(' و'),retroEn=basis.filter(b=>b.retrograde).map(b=>name(b.planet,false)).join(' and ');
 const retroAr=retro?' يظهر '+retro+' بحركة تراجعية ظاهرية؛ يمكن قراءتها رمزياً كمراجعة لطريقة التعبير، ولا تدل وحدها على ضعف أو فشل.':'';
 const retroTextEn=retroEn?' '+retroEn+' shows apparent retrograde motion, which may be used as a reflection on expression; it does not establish weakness or failure.':'';
 const knownTime=options.knownTime!==false;
 const lived=livedNatalTheme(topic,basis,specific,rule);
 return {topic,basis,basisStatus:'available',
  summary:{ar:lived.summaryAr,en:lived.summaryEn},
  deep:{ar:lived.deepAr+(mixed?' أكو جوانب داعمة وجوانب متعارضة؛ لا تستخلص صفة ثابتة من جانب واحد.':'')+(retroAr?' '+retroAr:''),en:lived.deepEn+(mixed?' Both harmonious and challenging aspects exist, so avoid a one-sided conclusion.':'')+(retroTextEn?' '+retroTextEn:'')},
  strengths:{ar:[rule.resource.ar],en:[rule.resource.en]},weaknesses:{ar:[rule.risk.ar],en:[rule.risk.en]},
  example:{ar:specific.ar+'.',en:specific.en+'.'},advice:{ar:theme.actionAr,en:theme.actionEn},
  question:{ar:'بموضوع «'+topic.ar+'»، تذكّر موقف حقيقي من آخر فترة: شنو تصرفك بالضبط؟ وأي جزء من التفسير يشبهك، وأي جزء ما ينطبق عليك؟',en:'For “'+topic.en+'”, recall one recent real situation: what did you actually do? Which part of this reading fits, and which does not?'},
  limitations:{ar:'مواقع الأجرام بيانات حسابية؛ معاني الشخصية تأويلات تنجيمية غير مثبتة علمياً، وليست اختباراً نفسياً أو كشفاً لرغبات الآخرين. نقاط القوة والتحديات محاور للمراجعة، وليست صفات مؤكدة. '+(!knownTime?'وقت الولادة غير معروف: بقية المواضع تقريبية عند الظهر المحلي؛ استُبعد القمر والطالع ووسط السماء والبيوت واتصالاتها من هذه القراءة.':chart.cusps.length===12?'البيوت محسوبة بنظام Placidus من وقت ومكان الولادة.':'البيوت غير متاحة لهذا الحساب؛ لم نفترض طالعاً أو أرقام بيوت.'),en:'Celestial positions are calculated data; personality meanings are astrological interpretations without scientific validation, not psychological tests or access to private wishes. Strengths and challenges are reflection themes, not established traits. '+(!knownTime?'Birth time is unknown: remaining positions use approximate local noon; Moon, angles, houses and their aspects are excluded from this reading.':chart.cusps.length===12?'Placidus houses use birth time and location.':'Houses are unavailable for this calculation; no angles or houses are assumed.')},contradictory:mixed};
}

export function soulProfileSummary(chart:Chart,profile:Profile){
 const sun=chart.points.find(x=>x.id==='Sun'&&finitePosition(x)),moon=profile.known?chart.points.find(x=>x.id==='Moon'&&finitePosition(x)):undefined;
 const asc=profile.known&&chart.asc!==null&&Number.isFinite(chart.asc)?chart.asc:null;
 return {
  ar:(sun?'تُقرأ الشمس في '+arSigns[sign(sun.longitude)]+' هنا من زاوية الهوية والاختيار. ':'موضع الشمس غير متاح. ')+(moon?'والقمر في '+arSigns[sign(moon.longitude)]+' من زاوية الاحتياج العاطفي. ':profile.known?'موضع القمر غير متاح. ':'وقت الولادة غير معروف؛ لا نعتمد القمر في التفسير. ')+(asc!==null?'الطالع في '+arSigns[sign(asc)]+' يضيف موضوع الحضور والانطباع الأول. ':profile.known?'الطالع غير متاح لهذا الحساب. ':'لا نعتمد الطالع والبيوت من وقت مفترض. ')+'قارن الدلالات أدناه بتجربتك؛ لا تثبت الخارطة صفاتك أو أسرارك.',
  en:(sun?'The Sun in '+enSigns[sign(sun.longitude)]+' is read through identity and choice. ':'The Sun position is unavailable. ')+(moon?'The Moon in '+enSigns[sign(moon.longitude)]+' adds emotional needs. ':profile.known?'The Moon position is unavailable. ':'Unknown birth time means the Moon is excluded from interpretation. ')+(asc!==null?'Ascendant '+enSigns[sign(asc)]+' adds presentation and first impressions. ':profile.known?'Angles are unavailable for this calculation. ':'No assumed birth time supplies an Ascendant or houses. ')+'Compare these symbols with lived experience; a chart does not establish traits or secrets.'
 };
}
export function soulEvidenceText(basis:NatalBasis[],arabic:boolean){
 if(!basis.length)return arabic?'بيانات الميلاد غير كافية لهذا الموضوع.':'Insufficient natal data for this topic.';
 const places=basis.map(b=>placementText(b,arabic)+' '+(((b.longitude%30)+30)%30).toFixed(2)+'°'+(b.house?(arabic?' · البيت ':' · house ')+b.house:'')+(b.retrograde?(arabic?' · متراجع ظاهرياً':' · apparent retrograde'):''));
 const pairs=soulAspectPairs(basis).map(p=>name(p.first,arabic)+' '+(arabic?aspectNamesAr:aspectNamesEn)[p.type]+' '+name(p.second,arabic)+(arabic?' · الأورب ':' · orb ')+p.orb.toFixed(2)+'°');
 return places.join(' | ')+(pairs.length?' — '+pairs.join(' | '):'');
}
