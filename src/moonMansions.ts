/** Traditional Western/Arabic lunar mansions, as presented by Lunarium/iLuna.
 * Boundaries: 28 equal sectors of geocentric *tropical* ecliptic longitude
 * starting at 0° Aries. Interpretive text is an original, concise paraphrase
 * of https://lunarium.co.uk/articles/lunar-mansions/ (not a live API feed).
 * The interpretations are historical astrology, not verified predictions.
 */
import {bisectAngle} from './timing.ts';

type MansionEntry = readonly [
  arName:string, enName:string, arTheme:string, enTheme:string,
  arGood:string, enGood:string, arAvoid:string, enAvoid:string
];
export const MANSION_SECTOR_DEGREES = 360 / 28;
export const LUNARIUM_SOURCE = 'https://lunarium.co.uk/articles/lunar-mansions/';
const entries: readonly MansionEntry[] = [
 ['الشرطان','Al-Sharatain','البدايات والحركة والاندفاع.','Fresh starts and movement.','السفر، المعاملات، العناية بالنفس.','Travel, business, self-care.','بداية علاقات عاطفية أو تعيين موظفين.','New romances or hiring.'],
 ['البطين','Al-Butain','المبادرة والشجاعة وسط التحديات.','Initiative and courage under pressure.','التجارة، طلب المساندة، السفر البري.','Trade, requests for support, land journeys.','التسرع بالعلاقات أو السفر البحري.','Rushed relationships or sea journeys.'],
 ['الثريا','Al-Thurayya','الوفرة والإبداع والاجتهاد.','Creative effort and abundance.','الفن، الدراسة، المبيعات.','Arts, learning, commerce.','الزواج والسفر بحراً.','Marriage and sea travel.'],
 ['الدبران','Al-Dabaran','التحدي والمواجهة وإزالة العوائق.','Confronting obstacles and disputes.','الحِرف والعمل والتفاوض التجاري.','Crafts, productive work, trade.','الزواج والبناء والرحلات البحرية.','Marriage, construction, sea trips.'],
 ['الهقعة','Al-Haqa','التفكير والتعلم وحل المشكلات.','Insight, study and problem-solving.','التعلم والفنون والسفر.','Education, arts, travel.','المشاريع الجماعية المعقدة.','Complex group ventures.'],
 ['الهنعة','Al-Hana','الانجذاب والاتفاق مع احتمال الاختلاف.','Attraction, alliances and contrasts.','الصداقات والشراكات والتجارة.','Friendships, partnerships, trade.','الزراعة والعلاج.','Gardening and healing.'],
 ['الذراع','Al-Dhira','الثقة والإنجاز والنمو.','Trust and constructive progress.','الأعمال والعلاقات والتعافي.','Business, relationships, recovery.','النزاعات والإجراءات القانونية.','Legal disputes.'],
 ['النثرة','Al-Nathrah','المودة والقوة وتحقيق الهدف.','Affection and determination.','العائلة والحب والسفر البري.','Family, love, land journeys.','تعيين موظفين جدد.','Hiring new staff.'],
 ['الطرف','Al-Tarf','الحذر والدفاع عند الخلاف.','Caution and self-protection.','حماية الحقوق ومواجهة الاعتداء.','Protecting boundaries and responding to threats.','السفر والمواعيد والعناية بالحدائق.','Travel, romance, gardening.'],
 ['الجبهة','Al-Jabhah','التعافي والمساندة وحسن النية.','Support, kindness and recovery.','التواصل والتعلم والبناء.','Socializing, study, construction.','السفر أو التهور بالأدوية.','Travel or medication misuse.'],
 ['الزبرة','Al-Zubrah','التقدم والطموح والاحترام.','Ambition, progress and respect.','العمل والترقية والسفر.','Career progress, travel, requests.','شؤون صحة النساء (بالموروث التقليدي).','Women’s health matters (traditional belief).'],
 ['الصرفة','Al-Sarfah','تحديات تتطلب صبراً وعملًا.','Challenges and productive effort.','الزراعة والبناء والمراسلات.','Agriculture, building, messages.','الارتباط العاطفي والسفر البحري.','Romantic commitments and sea voyages.'],
 ['العواء','Al-Awwa','الرغبة والنمو والتقارب.','Desire, growth and connection.','الحب والتجارة والبدايات الإبداعية.','Romance, trade, creative starts.','الإفراط في الطعام.','Overeating.'],
 ['السماك','Al-Simak','التغيير والانتقال والتحسن.','Transition and making a change.','العاطفة والانتقال من مكان أو عمل.','Romance, moving home or changing jobs.','الزواج والسفر البري.','Marriage and land travel.'],
 ['الغفر','Al-Ghafr','التركيز على المال والمكاسب.','Material priorities and gains.','البيع والشراء وتنظيم المال.','Business and financial planning.','العلاقات العاطفية والسفر.','Romantic matters and journeys.'],
 ['الزبانا','Al-Zubana','فرص مادية تستحق التخطيط.','Commerce and measured ambition.','المعاملات التجارية والربح.','Trading and business deals.','العلاقات والسفر والزراعة.','Relationships, travel, gardening.'],
 ['الإكليل','Al-Iklil','المودة وحفظ الاستقرار.','Connection and safeguarding stability.','الصداقة والارتباط والترقية.','Friendship, commitment, promotion.','السفر والمجازفة المالية.','Travel and speculative deals.'],
 ['القلب','Al-Qalb','الحذر والدفاع عن النفس.','Defensiveness and heightened tension.','البناء والعمل الزراعي.','Construction and agriculture.','الخلافات العائلية والإفراط بالأكل.','Family disputes and overindulgence.'],
 ['الشولة','Al-Shaulah','المواجهة والحسم مع توتر محتمل.','Confrontation and decisive energy.','الزراعة والمهام الصعبة.','Gardening and demanding tasks.','التجارة والسفر البحري والعلاقات.','Business, sea travel, relationships.'],
 ['النعائم','Al-Na’am','طاقة مركزة تحتاج انضباطاً.','Focused energy and strong impulses.','المهام الجماعية والبناء والسفر البري.','Team projects, building, land travel.','الزواج والالتزامات المالية.','Marriage and financial commitments.'],
 ['البلدة','Al-Baldah','العمل والإنتاج وسط احتكاكات.','Productivity despite friction.','الزراعة والبناء والسفر.','Agriculture, construction, travel.','الزواج والتوظيف الجديد.','Marriage and recruitment.'],
 ['سعد الذابح','Sa’d al-Dhabih','التحرك السريع والخروج من الضيق.','Mobility and release from constraints.','التعافي والسفر وتجاوز العراقيل.','Recovery, travel, finding a way out.','الزواج والصفقات والتوظيف.','Marriage, business deals, hiring.'],
 ['سعد بلع','Sa’d Bula','التحرر وإنهاء ما لا ينفع.','Release and ending a constraint.','التعافي وإنهاء التزامات مرهقة.','Recovery and letting go.','الزواج أو تثبيت علاقة جديدة.','Marriage or formalizing relationships.'],
 ['سعد السعود','Sa’d al-Su’ud','الرعاية والاستقرار والإنتاج.','Nurturing and constructive progress.','المشاريع الجديدة والحب والمال.','Starting projects, romance, finance.','السفر بالماء والصدام مع أصحاب النفوذ.','Sea travel and clashes with authority.'],
 ['سعد الأخبية','Sa’d al-Akhbiyah','النمو والحماية والبحث.','Growth, protection and study.','الزراعة والبحوث والتعلم.','Plant care, research, learning.','الزواج والتخطيط للحمل.','Marriage and conception planning.'],
 ['الفرغ الأول','Al Fargh al-Awwal','المحبة والتقارب وتكوين الروابط.','Affection, unions and support.','الحب والصداقة والتجارة والسفر البري.','Love, friendship, commerce, land travel.','البناء والرحلات البحرية.','Construction and sea voyages.'],
 ['الفرغ الثاني','Al Fargh al-Thani','المال والتجارة والتواصل مع بعض المشاغبة.','Income, trade and social connections.','التجارة والزراعة والعناية بالصحة.','Business, gardening, health care.','البناء والسفر بحراً وبدء مشروع جديد.','Construction, sea travel, starting projects.'],
 ['بطن الحوت','Batn al-Hut','اكتمال مرحلة وبداية حصاد النتائج.','Completion, guidance and fruition.','الارتباط والتجارة والزراعة والسفر.','Marriage, commerce, gardening, travel.','الشؤون الصحية (بحسب الموروث فقط).','Health matters (traditional belief only).']
];
export type LunarMansion = {
 number:number; arName:string; enName:string; arTheme:string; enTheme:string;
 arGood:string; enGood:string; arAvoid:string; enAvoid:string
};
export const LUNAR_MANSIONS:readonly LunarMansion[] = entries.map((row,i)=>({
 number:i+1, arName:row[0], enName:row[1], arTheme:row[2], enTheme:row[3],
 arGood:row[4], enGood:row[5], arAvoid:row[6], enAvoid:row[7]
}));
const normalize=(longitude:number)=>((longitude%360)+360)%360;
const angleError=(longitude:number,boundary:number)=>normalize(longitude-boundary+180)-180;
export function lunarMansionNumber(longitude:number):number {
 if(!Number.isFinite(longitude))throw Error('Invalid Moon longitude');
 return Math.min(28,Math.floor(normalize(longitude)/MANSION_SECTOR_DEGREES)+1);
}
export type LunarMansionWindow={number:number;entry:LunarMansion;enteredAt:Date;exitsAt:Date};
/** Exact crossing timestamps obtained from a geocentric tropical ephemeris reader.
 * The UTC instants are independent of the viewer's selected display time zone.
 */
export function lunarMansionWindow(at:Date,readLongitude:(at:Date)=>number):LunarMansionWindow {
 if(!Number.isFinite(+at))throw Error('Invalid Moon mansion instant');
 const samples=new Map<number,number>();
 const moon=(time:number)=>{
  let lon=samples.get(time);
  if(lon===undefined){
   lon=readLongitude(new Date(time));
   if(!Number.isFinite(lon))throw Error('Invalid lunar ephemeris longitude');
   samples.set(time,lon);
  }
  return lon;
 };
 const number=lunarMansionNumber(moon(+at));
 const step=60*60*1000;
 const crossing=(direction:1|-1)=>{
  let previous=+at;
  for(let i=1;i<=72;i++){
   const next=+at+direction*i*step;
   if(lunarMansionNumber(moon(next))!==number){
    const boundary=(direction===1?number:number-1)*MANSION_SECTOR_DEGREES;
    const [a,b]=direction===1?[previous,next]:[next,previous];
    const exact=bisectAngle(t=>angleError(moon(t),boundary),a,b);
    if(!exact)throw Error('Unable to refine Moon mansion transition');
    return exact;
   }
   previous=next;
  }
  throw Error('Moon mansion boundary was not found within 72 hours');
 };
 const enteredAt=crossing(-1),exitsAt=crossing(1);
 return {number,entry:LUNAR_MANSIONS[number-1],enteredAt,exitsAt};
}
