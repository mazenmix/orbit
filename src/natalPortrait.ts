import type {Chart} from './engine.ts';
import {distance,houseNumber} from './math.ts';

type Lang='ar'|'en';
type Piece={ar:string;en:string};
const signStyles:Piece[]=[
 {ar:'تدخل بالموضوع مباشرة',en:'move directly into decisions'},
 {ar:'تبني موقفك بالتدريج وتفضل الاستقرار',en:'take a steady, practical approach'},
 {ar:'تجرّب أكثر من فكرة وتحب الحوار',en:'think flexibly and explore different ideas'},
 {ar:'تراعي الألفة وراحة الناس المقربين',en:'value security and close relationships'},
 {ar:'تعبر عن رأيك بثقة وتحب التقدير',en:'speak confidently and value recognition'},
 {ar:'تفحص التفاصيل قبل ما تلتزم',en:'check details before committing'},
 {ar:'تفاوض وتوازن بين رغبات الطرفين',en:'negotiate and seek balance'},
 {ar:'تحتاج ثقة حقيقية قبل ما تنفتح',en:'value privacy and earned trust'},
 {ar:'تحب التجربة والتعرف على شي جديد',en:'seek novelty and broader horizons'},
 {ar:'تخطط على المدى الطويل وتتحمل مسؤولية',en:'plan ahead and take responsibility'},
 {ar:'تفضل استقلالك وتجربة حلول مختلفة',en:'prefer autonomy and independent methods'},
 {ar:'تنتبه للمشاعر والخيال والاحتمالات',en:'notice feelings and possibilities'}
];
const houses:Piece[]=[
 {ar:'',en:''},{ar:'صورتك الذاتية وبداياتك',en:'personal direction'},{ar:'الفلوس والقيمة الشخصية',en:'resources and self-worth'},
 {ar:'الكلام والرسائل',en:'communication'},{ar:'البيت والعائلة',en:'home and family'},
 {ar:'الحب والتعارف والمتعة',en:'romance and creativity'},{ar:'الشغل اليومي والصحة العامة',en:'daily routines'},
 {ar:'الشراكة والارتباط',en:'partnerships'},{ar:'الخصوصية والثقة',en:'trust and shared commitments'},
 {ar:'السفر والتعليم',en:'learning and travel'},{ar:'العمل والمسؤولية',en:'career and responsibilities'},
 {ar:'الأصدقاء والمجتمع',en:'friendships and community'},{ar:'الراحة والمساحة الخاصة',en:'solitude and rest'}
];
const sign=(lon:number)=>Math.floor((((lon%360)+360)%360)/30);
const moonNeeds:Piece[]=[
 {ar:'مساحة حتى تعبر بسرعة',en:'room for quick expression'}, {ar:'وضوح واستقرار',en:'steady reassurance'},
 {ar:'حديث يفسر اللي صار',en:'conversation that clarifies events'}, {ar:'شعور بالألفة والاهتمام',en:'care and belonging'},
 {ar:'تقدير صريح للجهد',en:'recognition for your effort'}, {ar:'خطوات مرتبة ومعلومات دقيقة',en:'clarity and manageable steps'},
 {ar:'موقف عادل بين الطرفين',en:'fair treatment and balance'},{ar:'ثقة قبل كشف المشاعر',en:'trust before opening up'},
 {ar:'أفق أوسع وتجربة جديدة',en:'space to explore'}, {ar:'إحساس بالسيطرة على مسؤولياتك',en:'confidence in your responsibilities'},
 {ar:'حرية ومساحة مستقلة',en:'independence and space'}, {ar:'هدوء وتفهم بدون ضغط',en:'calm and understanding'}
];
const natalLink=(chart:Chart,a:string,b:string):number|null=>{
 const x=chart.points.find(p=>p.id===a),y=chart.points.find(p=>p.id===b);
 if(!x||!y)return null;
 const d=distance(x.longitude,y.longitude);
 const candidate=[0,60,90,120,180].map(angle=>({angle,orb:Math.abs(d-angle)})).sort((u,v)=>u.orb-v.orb)[0];
 return candidate.orb<=5.5?candidate.angle:null;
};
export function natalPortrait(chart:Chart,knownTime:boolean,language:Lang):string[]{
 const p=(name:string)=>chart.points.find(x=>x.id===name);
 const sun=p('Sun'),venus=p('Venus'),mars=p('Mars'),moon=knownTime?p('Moon'):undefined;
 const mercury=p('Mercury'),saturn=p('Saturn');
 if(!sun||!venus||!mars||!mercury)return [language==='ar'?'بيانات الميلاد غير كافية حتى أطلع بصمة شخصية مرتبطة بهالشخص.':'Insufficient birth data for a personal chart overview.'];
 const style=(point:typeof sun)=>signStyles[sign(point!.longitude)];
 const location=(point:Chart['points'][number]|undefined)=>point&&knownTime&&chart.cusps.length===12?houses[houseNumber(point.longitude,chart.cusps)]?.[language]:null;
 const link=(a:string,b:string)=>natalLink(chart,a,b);
 const bound=link('Sun','Saturn'),intimacy=link('Venus','Mars');
 const restricted=bound===90||bound===180;
 const closeness=intimacy===90||intimacy===180;
 if(language==='ar'){
  return [
   'بالقرارات، تميل رمزياً لأنك '+style(sun).ar+'. '+(restricted?'لكن مرات الالتزام والحدود يسحبونك باتجاه ثاني؛ لا تخلّي الواجب يمحو رغبتك. ':bound===0?'هنا قرارك الشخصي مرتبط بالإحساس بالمسؤولية؛ ميّز بين رغبتك والواجب. ':'')+(location(sun)?'هالشي ممكن يبان أكثر بموضوع '+location(sun)+'.':''),
   (moon?'بالجانب العاطفي، غالباً تحتاج '+moonNeeds[sign(moon.longitude)].ar+'. ':'بدون ساعة ولادة مؤكدة، ما أنسب إلك أسلوباً عاطفياً دقيقاً من القمر. ')+(location(moon)?'ركّز خصوصاً على '+location(moon)+'. ':'')+'إذا تضايقت من موقف، افصل احتياجك الحقيقي عن تفسيرك لتصرف غيرك.',
   'بالعلاقات، طريقتك الرمزية بالتقارب تميل إلى أنك '+style(venus).ar+'، وبالمبادرة ممكن '+style(mars).ar+'. '+(closeness?'اختلاف الإيقاع بين المودة والمبادرة قد يحتاج تروّي وحدوداً واضحة. ':intimacy===0?'الاهتمام والمبادرة ممكن يصيرن متداخلين؛ راقب إذا الطرف الآخر مرتاح لنفس السرعة. ':'')+'مثلاً، إذا يعجبك شخص، عبّر بوضوح ولا تستنتج تجاوبه من التخمين.',
   'بالشغل والكلام، قد يفيدك أنك '+style(mercury).ar+'. '+(saturn?'وأسلوب التزامك يميل إلى '+style(saturn).ar+'. ':'')+(location(mercury)?'راجع هذا بشكل خاص بموضوع '+location(mercury)+'. ':'')+'مثلاً، قبل وعد جديد، وضّح المطلوب والمدة حتى تقدر تحكم على النتيجة.'
  ];
 }
 return [
  'In decisions, you may '+style(sun).en+'. '+(restricted?'This can compete with the weight of responsibility; balance duty with choice. ':bound===0?'Personal choices may feel closely tied to obligations; distinguish the two. ':'')+(location(sun)?'This may show up especially in '+location(sun)+'.':''),
  (moon?'Emotionally, your symbolic pattern looks for '+moonNeeds[sign(moon.longitude)].en+'. ':'With uncertain birth time, a precise Moon-based personal claim is withheld. ')+(location(moon)?'Pay attention around '+location(moon)+'. ':'')+'When upset, separate your need from assumptions about someone’s response.',
  'In relationships, you may '+style(venus).en+', while for initiative you may '+style(mars).en+'. '+(closeness?'Different pacing calls for care and boundaries. ':intimacy===0?'Affection and initiative may overlap; check the other person’s comfort. ':'')+'For example, express interest clearly rather than assuming it is reciprocated.',
  'For work and communication, you may '+style(mercury).en+'. '+(saturn?'Your style of commitment may '+style(saturn).en+'. ':'')+(location(mercury)?'Explore this especially in '+location(mercury)+'. ':'')+'Clarify deadlines and expectations before promising a result.'
 ];
}
