import type {Chart,Report} from './engine.ts';
import {houseNumber,distance} from './math.ts';

/** Personal, symbolic reflection grounded in calculated current Moon and one natal chart.
 * No prediction of personal events, no claims about another person's intentions. */
type Lang='ar'|'en';
type Text={ar:string;en:string};
const signStyle:readonly Text[]=[
 {ar:'المبادرة السريعة',en:'taking initiative'}, {ar:'البحث عن الاستقرار',en:'seeking steadiness'},
 {ar:'الحوار والفضول',en:'conversation and curiosity'}, {ar:'الألفة والطمأنينة',en:'belonging and reassurance'},
 {ar:'التعبير بثقة',en:'confident self-expression'}, {ar:'الترتيب والاهتمام بالتفاصيل',en:'organization and detail'},
 {ar:'التفاهم والعدل',en:'balance and fairness'}, {ar:'العمق وحماية الخصوصية',en:'depth and privacy'},
 {ar:'التجربة وتوسيع الأفق',en:'exploration and broader perspective'}, {ar:'الالتزام والتخطيط',en:'structure and planning'},
 {ar:'الاستقلال والتجديد',en:'independence and novelty'}, {ar:'الخيال والتعاطف',en:'imagination and sensitivity'}
];
const areas:readonly Text[]=[
 {ar:'',en:''},
 {ar:'صورتك عن نفسك وبداياتك',en:'identity and starting fresh'},
 {ar:'المصاريف والأمان الشخصي',en:'resources and financial security'},
 {ar:'الرسائل والتفاهم والتعلّم',en:'messages, learning and understanding'},
 {ar:'البيت والعائلة',en:'home and family'},
 {ar:'التعارف والعاطفة والمتعة',en:'dating, affection and creativity'},
 {ar:'عاداتك وشغلك اليومي',en:'routines and everyday work'},
 {ar:'الشراكات والعلاقات الثنائية',en:'partnerships and one-to-one relationships'},
 {ar:'الثقة والحدود والالتزامات المشتركة',en:'trust and shared responsibilities'},
 {ar:'السفر والقناعات والتعلّم',en:'travel, beliefs and learning'},
 {ar:'المسار المهني والسمعة',en:'career direction and reputation'},
 {ar:'الأصدقاء والتعارف الاجتماعي',en:'friendships and social circles'},
 {ar:'الراحة والخصوصية والتأمل',en:'rest and private reflection'}
];
const themes:Record<string,Text>={
 Sun:{ar:'ثقتك بنفسك واتجاه قرارك',en:'self-confidence and your decisions'},
 Moon:{ar:'احتياجك للراحة والتطمين',en:'emotional security and comfort'},
 Mercury:{ar:'الكلام والتواصل وفهم المقصود',en:'communication and understanding'},
 Venus:{ar:'الاهتمام والتقارب والتقدير',en:'affection and appreciation'},
 Mars:{ar:'المبادرة وحدود الاندفاع',en:'initiative and managing impulses'},
 Jupiter:{ar:'التجربة والتوسع',en:'exploration and growth'},
 Saturn:{ar:'الواجبات والحدود',en:'obligations and boundaries'},
 Uranus:{ar:'التغيير والاستقلال',en:'change and independence'},
 Neptune:{ar:'الخيال والتوقعات',en:'imagination and expectations'},
 Pluto:{ar:'العمق والتغيير التدريجي',en:'depth and gradual change'}
};
const signOf=(lon:number)=>Math.floor((((lon%360)+360)%360)/30);
const get=(point:Chart['points'][number]|undefined,lang:Lang)=>point?signStyle[signOf(point.longitude)][lang]:'';
const of=(points:Chart['points'],id:string)=>points.find(p=>p.id===id);
export function moonPersonalSummary(report:Report,knownTime:boolean,lang:Lang):string{
 const currentMoon=of(report.current.points,'Moon');
 if(!currentMoon)return lang==='ar'?'معلومات القمر الحالية غير متوفرة؛ ما أگدر أطلع تفسير شخصي من دون حساب.':'Current Moon data is unavailable; a personal interpretation needs a real calculation.';
 const natal=report.natal;
 const natalMoon=knownTime?of(natal.points,'Moon'):undefined;
 const natalVenus=of(natal.points,'Venus');
 const natalMercury=of(natal.points,'Mercury');
 const naturalStyle=signStyle[signOf(currentMoon.longitude)][lang];
 const birthStyle=get(natalMoon??natalVenus??natalMercury,lang);
 // Three different house frames must never be conflated:
 // 1. Moon's house in the current sky chart (transit houses).
 // 2. Natal Moon's house at birth (fixed natal position).
 // 3. Transiting Moon over the natal house cusps (personal overlay).
 // Placidus cusps are required; no house is inferred for unknown birth times.
 const skyHouse=knownTime&&report.current.cusps.length===12?houseNumber(currentMoon.longitude,report.current.cusps):0;
 const natalMoonHouse=knownTime&&natalMoon&&natal.cusps.length===12?houseNumber(natalMoon.longitude,natal.cusps):0;
 const overlayHouse=knownTime&&natal.cusps.length===12?houseNumber(currentMoon.longitude,natal.cusps):0;
 const contact=report.evidence.filter(e=>e.transit.id==='Moon'&&(knownTime||!['Moon','Ascendant','MC'].includes(e.natal.id))).sort((a,b)=>b.weight-a.weight||a.orb-b.orb)[0];
 const target=contact?themes[contact.natal.id]?.[lang]:null;
 const challenged=contact&&(contact.angle===90||contact.angle===180);
 const shared=contact&&(contact.angle===0||contact.angle===60||contact.angle===120);
 const practicalHouse=skyHouse||overlayHouse;
 if(lang==='ar'){
  const sky=skyHouse?'بخارطة العبور الحالية القمر بالبيت '+skyHouse+' ('+areas[skyHouse].ar+'). ':'';
  const birth=natalMoonHouse?'قمرك الولادي بالبيت '+natalMoonHouse+' ('+areas[natalMoonHouse].ar+'). ':
   knownTime?'بيت قمرك الولادي غير متاح للحساب. ':'وقت ولادتك مو مؤكد، لذلك ما أگدر أحدد بيتاً خاصاً إلك. ';
  const overlay=overlayHouse?'أما القمر العابر من نسقطه على بيوت ميلادك، فيقع بالبيت '+overlayHouse+' ('+areas[overlayHouse].ar+'). ':'';
  const distinct=skyHouse&&overlayHouse&&skyHouse!==overlayHouse?'بيت العبور الحالي يختلف عن البيت اللي يمر بيه القمر ضمن خارطتك الولادية؛ لا نخلط بينهن. ':'';
  const personal=birthStyle?'أسلوبك الولادي يميل إلى '+birthStyle+'؛ قارن بين الاحتياجين قبل ما تتصرف. ':'';
  const transit=target?(challenged?'أكو شدّ محتمل يخص '+target+'، فالأفضل ما تستعجل الحسم. ':shared?'أكو مجال أسهل نسبياً لترتيب '+target+' إذا الظروف تساعد. ':'أكو تركيز إضافي على '+target+'، لكن هذا مو ضمان لحدث. '):'ماكو اتصال شخصي قريب كافي أستنتج منه حدثاً بعينه. ';
  const practical=practicalHouse===5||practicalHouse===7?'مثلاً، إذا تريد تبادر عاطفياً، عبّر بوضوح وخلي ردّ الطرف الثاني يحدد خطوتك. ':practicalHouse===10||practicalHouse===6?'مثلاً، إذا عندك قرار بالشغل، ثبّت المطلوب والموعد قبل الموافقة. ':practicalHouse===3||contact?.natal.id==='Mercury'?'مثلاً، إذا رسالة تحتمل أكثر من معنى، اسأل عن المقصود بدل التخمين. ':practicalHouse===11?'مثلاً، إذا تفكر ترجع تتواصل ويا صديق، ابدي بكلام بسيط وراقب تجاوبه. ':practicalHouse===4?'مثلاً، إذا موضوع بالبيت مأثر عليك، احچي عن احتياجك بدل ما تفترض الآخرين يعرفوه. ':'مثلاً، إذا محتار بخطوة، افصل رغبتك عن الوقائع وخذ قراراً قابلاً للتعديل. ';
  return 'القمر حالياً يرمز إلى '+naturalStyle+'. '+sky+birth+overlay+distinct+personal+transit+practical;
 }
 const sky=skyHouse?'In the current transit chart the Moon is in house '+skyHouse+' ('+areas[skyHouse].en+'). ':'';
 const birth=natalMoonHouse?'Your natal Moon is in house '+natalMoonHouse+' ('+areas[natalMoonHouse].en+'). ':
  knownTime?'Your natal Moon house is unavailable. ':'Your birth time is uncertain, so no personal house is inferred. ';
 const overlay=overlayHouse?'When the transiting Moon is placed against your natal house cusps, it falls in house '+overlayHouse+' ('+areas[overlayHouse].en+'). ':'';
 const distinct=skyHouse&&overlayHouse&&skyHouse!==overlayHouse?'Transit-chart houses and natal-overlay houses use different reference frames; they must not be confused. ':'';
 const personal=birthStyle?'Your natal pattern emphasizes '+birthStyle+'; notice how these two needs interact. ':'';
 const transit=target?(challenged?'A possible tension around '+target+' calls for care. ':shared?'There may be an easier opportunity to work with '+target+' if circumstances support it. ':'Another theme involves '+target+', without predicting an event. '):'No close personal contact supports predicting a specific event. ';
 const practical=practicalHouse===5||practicalHouse===7?'For example, in romance, communicate interest clearly and respect the actual response. ':practicalHouse===10||practicalHouse===6?'For example, clarify work expectations before committing. ':practicalHouse===3||contact?.natal.id==='Mercury'?'For example, clarify an ambiguous message rather than assuming intent. ':practicalHouse===11?'For example, approach a friend with an open question and observe their actual response. ':practicalHouse===4?'For example, communicate a home or family need directly rather than expecting others to guess. ':'For example, separate your hopes from confirmed facts and choose a reversible step. ';
 return 'The current Moon symbolizes '+naturalStyle+'. '+sky+birth+overlay+distinct+personal+transit+practical;
}
