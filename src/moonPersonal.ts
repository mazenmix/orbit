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
 const naturalStyle=signStyle[signOf(currentMoon.longitude)][lang];
 const natal=report.natal;
 const natalMoon=knownTime?of(natal.points,'Moon'):undefined;
 const natalVenus=of(natal.points,'Venus');
 const natalMercury=of(natal.points,'Mercury');
 const birthStyle=get(natalMoon??natalVenus??natalMercury,lang);
 const h=knownTime&&natal.cusps.length===12?houseNumber(currentMoon.longitude,natal.cusps):0;
 const houseText=h>0?areas[h][lang]:'';
 const contact=report.evidence.filter(e=>e.transit.id==='Moon'&&(knownTime||!['Moon','Ascendant','MC'].includes(e.natal.id))).sort((a,b)=>b.weight-a.weight||a.orb-b.orb)[0];
 const target=contact?themes[contact.natal.id]?.[lang]:null;
 const challenged=contact&&(contact.angle===90||contact.angle===180);
 const shared=contact&&(contact.angle===0||contact.angle===60||contact.angle===120);
 if(lang==='ar'){
  const lead='القمر حالياً يركز رمزياً على '+naturalStyle+'. '+(houseText?'وبخارطتك إنت يرتبط أكثر بموضوع '+houseText+'. ':knownTime?'':'وقت ولادتك مو مؤكد، لذلك ما أگدر أحدد بيتاً خاصاً إلك. ');
  const personal=birthStyle?'أسلوبك الولادي يميل إلى '+birthStyle+'؛ قارن بين الاحتياجين قبل ما تتصرف. ':'';
  const transit=target?(challenged?'أكو شدّ محتمل يخص '+target+'، فالأفضل ما تستعجل الحسم. ':shared?'أكو مجال أسهل نسبياً لترتيب '+target+' إذا الظروف تساعد. ':'أكو تركيز إضافي على '+target+'، لكن هذا مو ضمان لحدث. '):'ماكو اتصال شخصي قريب كافي أستنتج منه حدثاً بعينه. ';
  const practical=h===5||h===7?'مثلاً، إذا تريد تبادر عاطفياً، عبّر بوضوح وخلي ردّ الطرف الثاني يحدد خطوتك. ':h===10||h===6?'مثلاً، إذا عندك قرار بالشغل، ثبّت المطلوب والموعد قبل الموافقة. ':h===3||contact?.natal.id==='Mercury'?'مثلاً، إذا رسالة تحتمل أكثر من معنى، اسأل عن المقصود بدل التخمين. ':h===11?'مثلاً، إذا تفكر ترجع تتواصل ويا صديق، ابدي بكلام بسيط وراقب تجاوبه. ':h===4?'مثلاً، إذا موضوع بالبيت مأثر عليك، احچي عن احتياجك بدل ما تفترض الآخرين يعرفوه. ':'مثلاً، إذا محتار بخطوة، افصل رغبتك عن الوقائع وخذ قراراً قابلاً للتعديل. ';
  return lead+personal+transit+practical;
 }
 const lead='The current Moon symbolizes '+naturalStyle+'. '+(houseText?'In your natal chart this relates especially to '+houseText+'. ':knownTime?'':'Your birth time is uncertain, so no personal house is inferred. ');
 const personal=birthStyle?'Your natal pattern emphasizes '+birthStyle+'; notice how these two needs interact. ':'';
 const transit=target?(challenged?'A possible tension around '+target+' calls for care. ':shared?'There may be an easier opportunity to work with '+target+' if circumstances support it. ':'Another theme involves '+target+', without predicting an event. '):'No close personal contact supports predicting a specific event. ';
 const practical=h===5||h===7?'For example, in romance, communicate interest clearly and respect the actual response. ':h===10||h===6?'For example, clarify work expectations before committing. ':h===3||contact?.natal.id==='Mercury'?'For example, clarify an ambiguous message rather than assuming intent. ':h===11?'For example, approach a friend with an open question and observe their actual response. ':h===4?'For example, communicate a home or family need directly rather than expecting others to guess. ':'For example, separate your hopes from confirmed facts and choose a reversible step. ';
 return lead+personal+transit+practical;
}
