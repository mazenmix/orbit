import type {Dimension} from './math.ts';
export type IntimacyTheme='desire'|'chemistry'|'date'|'flirt'|'exploration'|'fantasyTalk'|'trust'|'initiative'|'boundaries'|'consistency';
export type PartnerInsight={id:IntimacyTheme;score:number;arTitle:string;enTitle:string;arText:string;enText:string;arAction:string;enAction:string};
/** Descriptive astrology-derived prompts about a RELATIONSHIP, never claims
 * about another person's actual private desires, consent or intentions.
 */
const cap=(n:number)=>Math.max(1,Math.min(99,Math.round(n)));
export function partnerInsights(dimensions:Record<Dimension,number>,today:{love:number;communication:number;energy:number},romantic=true):PartnerInsight[]{
 if(!romantic)return [];
 const d=dimensions,goodConflict=100-d.conflict,make=(id:IntimacyTheme,score:number,arTitle:string,enTitle:string,arText:string,enText:string,arAction:string,enAction:string):PartnerInsight=>({id,score:cap(score),arTitle,enTitle,arText,enText,arAction,enAction});
 return [
  make('desire',d.sexual*.72+d.attraction*.28,'الشرارة والرغبة','Attraction spark','كيمياء الجذب حسب اتصالات الخارطتين، مو دليل على رغبتها الشخصية.','Symbolic chemistry; not a measure of her real desire.','خلّ الإعجاب واضحاً وشوف إذا الاهتمام متبادل.','Express interest and look for mutual engagement.'),
  make('chemistry',d.sexual*.47+d.emotional*.30+goodConflict*.23,'الانسجام الحميمي','Intimate connection','يمزج الألفة الجسدية المحتملة بالراحة العاطفية؛ الرضا والموافقة ما تنحسب فلكياً.','Combines symbolic chemistry with emotional ease; consent cannot be calculated.','احچوا بصراحة عن الحدود والراحة قبل أي قرب.','Discuss comfort and boundaries openly.'),
  make('date',today.love*.35+d.communication*.34+d.stability*.31,'جو الموعد اليوم','Date-night atmosphere today','مؤشر وقت رمزي لجودة الحوار والتنسيق، مو جواب على قبولها للموعد.','Symbolic timing for conversation and planning, not a prediction that she accepts.','اقترح مكان ووقت مناسبين ودع القرار مشتركاً.','Offer a convenient place and time, and leave the choice mutual.'),
  make('flirt',d.attraction*.52+d.communication*.48,'الغزل والكلام','Flirting style','يصف التوازن بين الإعجاب وطريقة التواصل بينكما.','A symbolic balance of attraction and conversation style.','امزح بخفة وراقب إشارات الارتياح، لا تضغط.','Keep flirting light and notice comfort cues.'),
  make('exploration',d.sexual*.35+d.communication*.40+goodConflict*.25,'الانفتاح على التجربة','Openness to exploring','قابلية رمزية لفتح حوار عن اهتمامات مشتركة؛ ما يكشف فتشات أو تفضيلات سرية.','A theme for discussing shared interests; it reveals no secret fetishes.','إذا بينكم ثقة، اسأل عن تفضيلات معلنة باحترام.','If mutual trust exists, discuss stated preferences respectfully.'),
  make('fantasyTalk',d.emotional*.32+d.communication*.53+goodConflict*.15,'الخيال والحديث الخاص','Private imagination & dialogue','يشير لمساحة الحديث الصريح عن الأحلام والخيال، مو قراءة أحلامها الشخصية.','Describes room for personal dialogue, not access to private fantasies.','ابدأ بمشاركة شيء بسيط عن نفسك واترك إلها حرية الرد.','Share a small thought about yourself and invite, never demand, a reply.'),
  make('trust',d.emotional*.55+d.stability*.45,'الأمان والثقة','Emotional safety','يمثل سهولة بناء ثقة متبادلة حسب النموذج الرمزي.','A symbolic description of building mutual safety and trust.','قِس الثقة بالوعود المنفذة والاحترام عبر الوقت.','Judge trust by reliable actions and respect over time.'),
  make('initiative',today.energy*.28+d.attraction*.32+d.communication*.40,'توقيت المبادرة','Initiative & approach','يوازن توقيت نشاطك مع أسلوب التواصل المحتمل بينكما.','Balances your timing with the symbolic communication match.','إرسل دعوة واحدة محددة، لا تكرر الرسائل بإلحاح.','Send one clear invitation rather than repeatedly pressuring.'),
  make('boundaries',goodConflict*.60+d.stability*.40,'وضوح الحدود','Respecting boundaries','كلما ارتفعت القراءة صارت مساحة التنظيم والاحترام أوسع رمزياً.','Higher symbolic values here favor space for mutual respect.','اسأل شنو مريح إلها وخليك واضح بحدودك أيضاً.','Ask what is comfortable and state your boundaries too.'),
  make('consistency',d.stability*.70+d.communication*.30,'الاستمرارية','Long-term steadiness','يقارن الاستقرار الرمزي مع القدرة على حل سوء الفهم.','Combines symbolic stability with communication in disagreements.','تابع التعامل لأكثر من موعد قبل الاستنتاج.','Observe real interactions over time, not a single meeting.')
 ];
}
export function gaugeLevel(score:number):'strong'|'steady'|'caution'|'low'{return score>=74?'strong':score>=55?'steady':score>=38?'caution':'low'}
