/** Reconcile Qwen3 text with supplied evidence; never present guessed certainty,
 * probabilities, exact future dates, or private-person claims as calculations.
 */
import {bodies} from './math.ts';
import {evidenceGroundedPlainAnalysis} from './aiGroundedNarrative.ts';
export type AIContact={transit:string;natal:string;angle:number;orb:number;applying:boolean};
export type AIExplanationLink={contact:string;excerpt:string};
export type AIAdviceContext={language:'ar'|'en';support:AIContact|null;challenge:AIContact|null;events:readonly {kind:string;type:string;maximum:string}[];evidence?:readonly AIContact[];supplemental?:readonly AIContact[];strict?:boolean;plainLanguage?:boolean;comparisonAvailable?:boolean;semanticLinks?:readonly AIExplanationLink[]};
const normalized=(s:string)=>s.normalize('NFKC').toLocaleLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/[٠-٩]/g,v=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(v))).replace(/[۰-۹]/g,v=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(v)));
const aliases:Record<string,string[]>={...Object.fromEntries(bodies.map(b=>[b[1],[b[1],b[2]]])),Ascendant:['Ascendant','الطالع'],MC:['MC','Midheaven','وسط السماء']};
const escaped=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const mentions=(text:string,id:string)=>[...(aliases[id]??[id])].some(alias=>new RegExp('(?:^|[^\\p{L}])(?:و)?'+escaped(normalized(alias))+'(?:$|[^\\p{L}])','u').test(text));
type Meaning={ar:string;en:string;terms:RegExp};
// These are declared symbolic editorial meanings, not validated psychological
// facts. Keep the target and the moving factor separate so naming an unrelated
// life area cannot pass merely because a reply contains "symbolic" and "but".
const targetMeanings:Record<string,Meaning>={
 Sun:{ar:'الاتجاه الشخصي والهوية والثقة بالقرار',en:'personal direction, identity and self-confidence',terms:/اتجاهك|هويتك|ثقتك|قرار.*شخص|هدفك|قناع[ةت]|\b(?:identity|personal direction|self.confidence|your own choice|personal goal)\b/u},
 Moon:{ar:'الراحة العاطفية ورد الفعل عند الضغط',en:'emotional comfort and reactions under stress',terms:/راح[ةت]|راحتك|ضغط|منزعج|مزاج|عاطف|شعور|مشاعر|تهدئ|استفز|\b(?:emotional|comfort|upset|stress|feelings|rest|reassurance)\b/u},
 Mercury:{ar:'المراسلات والمعلومات ووضوح الاتفاق',en:'messages, information and clear agreements',terms:/رسال[ةت]|مراسل|معلوم|تواصل|جواب|اجاب|سؤال|تفاصيل.*اتفاق|\b(?:messag|information|communicat|reply|clarif|question|agreement)/u},
 Venus:{ar:'التقارب والتقدير والتبادل في العلاقة',en:'affection, appreciation and reciprocity in relationships',terms:/تقارب|علاق|تقدير|اهتمام|انجذاب|دعوة|محب[ةت]|متبادل|\b(?:affection|appreciat|reciproc|relationship|invitation|intimacy|connection)/u},
 Mars:{ar:'المبادرة والاستعجال ورد الفعل',en:'initiative, urgency and impulsive reactions',terms:/مبادر|استعج|تستعجل|اندفاع|رد.?الفعل|نقاش.*يحتد|\b(?:initiative|urgency|impuls|rush|act quickly|react)/u},
 Jupiter:{ar:'الفرص والتوسع مقابل الوقت والكلفة',en:'opportunities and expansion versus cost and capacity',terms:/فرص|توسع|مشروع|سفر|كلف[ةت]|مكسب|\b(?:opportunit|expand|expansion|trip|project|cost|benefit)/u},
 Saturn:{ar:'المسؤوليات والالتزامات والموارد',en:'responsibilities, obligations and resources',terms:/مسؤول|التزام|ملتزم|واجب|موعد|وعد|موارد|\b(?:responsibil|obligation|commitment|deadline|promise|resource)/u},
 Uranus:{ar:'تغيير الخطة والاستقلال وكسر الروتين',en:'change of plan, independence and disruption of routine',terms:/تغيير|تغير|استقلال|روتين|خطة|\b(?:change|independ|routine|disrupt|plan)/u},
 Neptune:{ar:'التوقعات والانطباعات مقابل الوقائع',en:'expectations and impressions versus evidence',terms:/توقع|انطباع|حقيق|وقائع|تخمين|غامض|غموض|\b(?:expectation|impression|evidence|guess|ambig|hope)/u},
 Pluto:{ar:'السيطرة والحدود والتغيير العميق',en:'control, boundaries and deep change',terms:/سيطر|تحكم|حدود|تغيير.*عميق|\b(?:control|boundar|deep change|power)/u},
 Chiron:{ar:'النقد والنقاط الحساسة وتجربة قديمة',en:'criticism, sensitive topics and past experience',terms:/نقد|حساس|قديم|ذكرى|\b(?:critic|sensitiv|past experience|old experience)/u},
 Ceres:{ar:'المساعدة والرعاية وتوازن العطاء',en:'care, help and reciprocal support',terms:/مساعد|رعاي|اهتمام|عطاء|\b(?:care|help|support|nurtur)/u},
 Pallas:{ar:'حل المشكلة والبحث عن سببها',en:'problem-solving and identifying causes',terms:/مشكلة|مشكل[ةت]|سبب|اسباب|حلول|حل |فرضيات|\b(?:problem|solution|cause|hypothes)/u},
 Juno:{ar:'الاتفاق والالتزام والمسؤولية المشتركة',en:'commitment, shared expectations and agreements',terms:/اتفاق|التزام|توقع|مشترك|\b(?:agreement|commitment|expectation|shared responsibil)/u},
 Vesta:{ar:'التركيز والاستمرار في مهمة',en:'focus and sustained effort on a task',terms:/تركيز|مهم[ةت]|استمرار|تفرغ|تشتت|\b(?:focus|task|sustain|devot|distraction)/u},
 Pholus:{ar:'التفاصيل الصغيرة وتبعات القرار',en:'small details and wider consequences',terms:/تفصيل|تفاصيل|صغير|تبعات|منسي|شرط|\b(?:detail|small|consequence|overlook|condition)/u},
 Ascendant:{ar:'الانطباع الاول وطريقة تقديم نفسك',en:'first impressions and presenting yourself',terms:/انطباع.*اول|تقديم.*نفس|تقدم.*نفس|لقاء.*جديد|اول.*رسال|\b(?:first impression|presenting yourself|introduc|first meeting)/u},
 MC:{ar:'المسار المهني والعمل والصورة العامة',en:'career direction, work and professional standing',terms:/مهني|شغل|عمل|وظيف|مدير|سمع[ةت]|\b(?:career|work|professional|job|reputation|deliverable)/u},
};
const driverMeanings:Record<string,Meaning>={
 Sun:{ar:'اتخاذ موقف واضح',en:'taking a clear position',terms:/موقف|وضوح|واضح|حسم|قناع[ةت]|\b(?:position|clear|decid|conviction)/u},
 Moon:{ar:'التفاعل مع الشعور الحالي',en:'reacting to current feelings',terms:/شعور|مشاعر|مزاج|رد.?فعل|انفعال|\b(?:feeling|mood|react|emotion)/u},
 Mercury:{ar:'المعلومة وطريقة توصيلها',en:'information and communication',terms:/معلوم|تواصل|رسال|مراسل|وضح|وضوح|سؤال|اجاب|\b(?:information|communicat|messag|clarif|question|reply)/u},
 Venus:{ar:'التقدير وقيمة العلاقة او الاختيار',en:'appreciation and the value of a connection or choice',terms:/تقدير|علاق|قيمة|اهتمام|متبادل|\b(?:appreciat|value|connection|affection|reciproc)/u},
 Mars:{ar:'الاستعجال والمبادرة',en:'urgency and taking initiative',terms:/استعج|تستعجل|مبادر|اندفاع|سرع|\b(?:urgency|rush|initiative|impuls|quick)/u},
 Jupiter:{ar:'توسيع الخيارات والفرص',en:'expanding options and opportunities',terms:/توسع|توسيع|فرص|خيارات|\b(?:expand|opportunit|options|growth)/u},
 Saturn:{ar:'المسؤولية وحدود القدرة',en:'responsibility and limits of capacity',terms:/مسؤول|التزام|قدرت|قدرة|حدود|طاقت|عبء|واجب|\b(?:responsibil|commitment|limit|capacity|obligation|burden)/u},
 Uranus:{ar:'كسر الروتين والتغيير',en:'disrupting routine and making changes',terms:/روتين|تغيير|تغير|استقلال|\b(?:routine|change|independ|disrupt)/u},
 Neptune:{ar:'الانطباع والحقيقة',en:'impressions versus reality',terms:/انطباع|حقيق|وقائع|تخمين|غامض|غموض|\b(?:impression|reality|fact|guess|ambig|evidence)/u},
 Pluto:{ar:'التحكم والحدود',en:'control and boundaries',terms:/تحكم|سيطر|حدود|\b(?:control|boundar|power)/u},
 Chiron:{ar:'الحساسية للنقد والذكريات',en:'sensitivity to criticism and memories',terms:/حساس|نقد|ذكرى|ذكريات|قديم|\b(?:sensitiv|critic|memor|past experience)/u},
 Ceres:{ar:'المساعدة والاهتمام العملي',en:'practical care and help',terms:/مساعد|رعاي|اهتمام|عطاء|\b(?:care|help|support|nurtur)/u},
 Pallas:{ar:'البحث عن حل وسبب المشكلة',en:'finding solutions and causes',terms:/حل |حلول|مشكلة|اسباب|سبب|فرضيات|\b(?:solution|problem|cause|hypothes)/u},
 Juno:{ar:'توقع الالتزام والوضوح',en:'expectations of commitment and clarity',terms:/التزام|توقع|اتفاق|مشترك|\b(?:commitment|expectation|agreement|shared)/u},
 Vesta:{ar:'التفرغ والتركيز في مهمة',en:'devotion and focus on a task',terms:/تفرغ|تركيز|مهمة|مهم[ةت]|تشتت|\b(?:devot|focus|task|distraction)/u},
 Pholus:{ar:'اثر التفاصيل والقرارات الصغيرة',en:'the effect of small details and choices',terms:/تفصيل|تفاصيل|صغير|تبعات|شرط|\b(?:detail|small|consequence|condition)/u},
};
const contactKey=(e:AIContact)=>e.transit+':'+e.natal+':'+e.angle;
export function calculatedNarrativeFactors(ctx:AIAdviceContext){
 return ([['support',ctx.support],['challenge',ctx.challenge]] as const).flatMap(([role,e])=>{
  if(!e)return [];
  const target=targetMeanings[e.natal],driver=driverMeanings[e.transit];
  if(!target||!driver)return [];
  return [{contact:contactKey(e),role,target:e.natal,driver:e.transit,
   targetMeaning:target[ctx.language],driverMeaning:driver[ctx.language]}];
 });
}
function semanticLinkProblems(message:string,ctx:AIAdviceContext):string[]{
 const factors=calculatedNarrativeFactors(ctx),problems:string[]=[];
 if(!factors.length)return ['no-interpretable-factor'];
 const paragraphs=message.split(/\n\s*\n/u);
 if(ctx.semanticLinks!==undefined){
  if(ctx.semanticLinks.length!==factors.length||new Set(ctx.semanticLinks.map(x=>x.contact)).size!==factors.length)return ['invalid-semantic-links'];
  if(ctx.semanticLinks.some(link=>!factors.some(f=>f.contact===link.contact)||!link.excerpt.trim()||!message.includes(normalized(link.excerpt))))return ['invalid-semantic-links'];
 }
 for(const factor of factors){
  const candidates=ctx.semanticLinks===undefined?paragraphs:ctx.semanticLinks.filter(link=>link.contact===factor.contact).map(link=>normalized(link.excerpt));
  if(!candidates.some(text=>targetMeanings[factor.target].terms.test(text)&&driverMeanings[factor.driver].terms.test(text)))problems.push('missing-factor-meaning:'+factor.contact);
 }
 return problems;
}
export function conciseAI(text:string):string{
 const stripped=text.replace(/<think>[\s\S]*?<\/think>/gi,'').replace(/<think>[\s\S]*$/gi,'').replace(/<\/?think>/gi,'').trim().slice(0,12000);
 const seen=new Set<string>(),out:string[]=[];
 for(const p of stripped.split(/\n\s*\n/g)){
  const trimmed=p.trim().replace(/\s+/g,' ');
  const id=trimmed.normalize('NFKC').toLocaleLowerCase().replace(/[\p{P}\p{S}\s]+/gu,'');
  if(id&&!seen.has(id)){seen.add(id);out.push(trimmed)}
 }
 return out.join('\n\n');
}
/** Shared by transit and natal explanations. Matching a planet name does not
 * authorize a probability, diagnosis, private desire or certain future event. */
export function unsupportedOutcomeClaims(text:string):string[]{
 const message=normalized(text).replace(/\*\*/g,'');
 const problems:string[]=[];
 if(/\d+(?:[.,٫]\d+)?\s*(?:%|٪|percent|بالمية|بالمائة)/iu.test(message))problems.push('unfounded-percentage');
 // Remove only the negated guarantee itself. A disclaimer elsewhere must not
 // authorize a second, positive certainty claim in the same sentence.
 const assertions=message.replace(/\b(?:not guaranteed|no guarantees?|cannot guarantee)\b|(?:مو|غير|ليس|ليست)\s+مضمون(?:ة|ا)?/gu,' ');
 if(/(?:\bguarantee(?:d|s)?\b|\bcertainly\s+will\b|\bwill\s+(?:definitely|certainly)\b|اكيد\s+(?:راح|حت|يرجع)|مضمون(?:ة)?(?:\s|$))/iu.test(assertions))problems.push('unsupported-certainty');
 // Reject other specific real-world outcomes as certainties. Symbolic contact
 // data cannot establish a promotion, reunion, job offer or future partner.
 if(/\b(?:will|going to)\s+(?:definitely\s+)?(?:marry|win|contact you|return to you|meet your soulmate|find true love|get promoted|land (?:a|the) job|receive a job offer)|\b(?:your ex|your partner)\s+will\s+(?:return|come back|call you)|(?:راح|سوف)\s+(?:تتزوج|تربح|ترجعلك|يرجعلك|يتصل بيك|تتصل بيك|تترقى|تحصل على وظيفة|تلتقي بحب حياتك|تتعرف على شريك حياتك|يرجع|ترجع)/u.test(message))problems.push('unsupported-future-outcome');
 if(/(?:\bshe secretly wants\b|\bhe secretly desires\b|\bknow her private thoughts\b|نعرف\s+افكارها\s+السرية|نقدر\s+نقرا\s+رغباتها|\bshe (?:loves you|wants you sexually)\b|\bhe is sexually attracted to you\b|هي تحبك بالسر|هو يرغب بيك جنسيا)/iu.test(message))problems.push('private-intent-claim');
 if(/\byou (?:have|suffer from) (?:depression|bipolar disorder|cancer|adhd|ptsd)\b|عندك (?:اكتئاب|سرطان|اضطراب ثنايي|اضطراب ثنائي)|مصاب ب(?:الاكتئاب|السرطان)/u.test(message))problems.push('unsupported-diagnosis');
 return [...new Set(problems)];
}
export function hasSymbolicFraming(text:string):boolean{return /symbolic|symbolism|رمزي|رمزية/u.test(normalized(text))}
export function unsafeAIGuesses(message:string,ctx:AIAdviceContext):string[]{
 message=normalized(message).replace(/\*\*/g,'');
 const problems=unsupportedOutcomeClaims(message);
 if(ctx.strict&&!ctx.evidence?.length)problems.push('no-calculated-basis');
 if(!ctx.events.length&&/(?:eclipse|كسوف|خسوف)/iu.test(message))problems.push('unverified-eclipse');
 const dates=[...message.matchAll(/\b(?:18|19|20|21|22|23)\d\d-\d\d-\d\d\b/g)].map(x=>x[0]);
 const known=new Set(ctx.events.map(e=>e.maximum.slice(0,10)));
 if(dates.some(d=>!known.has(d)))problems.push('invented-exact-date');
 for(const m of message.matchAll(/\b(\d{1,2})[\/-](\d{1,2})[\/-]((?:18|19|20|21|22|23)\d\d)\b/g)){
  const date=m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');
  if(!known.has(date))problems.push('invented-exact-date');
 }
 // No signs or houses are supplied by this endpoint. Naming them as a
 // placement would add a new calculation the explanation cannot substantiate.
 if(/\b(?:in|enters?|entering)\s+(?:the\s+sign\s+of\s+)?(?:aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\b|(?:في|ب)\s*(?:برج\s+)(?:الحمل|الثور|الجوزاء|السرطان|الاسد|العذراء|الميزان|العقرب|القوس|الجدي|الدلو|الحوت)|\b(?:house)\s+(?:\d|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)|البيت\s+(?:\d|الاول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر|الحادي|الثاني عشر)/u.test(message))problems.push('unsupplied-placement');
 if(ctx.evidence){
  const contacts=[...ctx.evidence,...(ctx.supplemental??[])];
  if(ctx.strict&&!hasSymbolicFraming(message))problems.push('missing-symbolic-framing');
  if(ctx.strict&&/تاثير مطبق|تاثيرات مطبقة|مدار\s+\d|يدور باتجاه (?:الدعم|التحدي)/u.test(message))problems.push('misleading-motion-terminology');
  if(ctx.strict&&!ctx.comparisonAvailable&&/no (?:major |meaningful |material )?new (?:shifts?|changes?)|no (?:major |meaningful |material )?changes?|contacts (?:are |remain )?stable|مقارنة (?:يومية|اليومية|الساعة)|لا توجد تغييرات|ماكو تغييرات/u.test(message))problems.push('unsupplied-comparison');
  for(const clause of message.split(/(?:[.!?](?!\d)|\n|;|؛|\bwhile\b|بينما|لكن)/u)){
   const matching=contacts.filter(e=>mentions(clause,e.transit)&&mentions(clause,e.natal));
   const pairKeys=new Set(matching.map(e=>e.transit+':'+e.natal));
   // Bind a clear motion/orb claim to its own pair, rather than accepting an
   // orb or phase merely because it belongs to another supplied contact.
   if(pairKeys.size!==1)continue;
   const polarityText=clause.replace(/\bnot (?:a )?(?:supportive|supporting|favorable|favourable|challenging|difficult)\b|(?:مو|غير|ليس)\s+(?:داعم|متحدي|صعب)/gu,'');
   const positive=/\b(?:supportive|supporting|favorable|favourable|harmonious)\b|داعم|ايجابي/u.test(polarityText);
   const negative=/\b(?:challenging|difficult|unfavorable|unfavourable)\b|متحدي|متحدية|معاكس|صعب|يحتاج انتباه/u.test(polarityText);
   const supports=(e:AIContact)=>[60,120].includes(e.angle)||(e.angle===0&&['Venus','Jupiter'].includes(e.transit));
   const challenges=(e:AIContact)=>[90,180].includes(e.angle)||(e.angle===0&&['Saturn','Mars','Pluto','Uranus'].includes(e.transit));
   if(positive&&!negative&&matching.every(e=>!supports(e))||negative&&!positive&&matching.every(e=>!challenges(e)))problems.push('wrong-contact-interpretation');
   const applying=/\bapplying\b|يقترب|تقترب|باتجاه الدقة|في طور الاقتراب/u.test(clause);
   const separating=/\bseparating\b|يبتعد|تبتعد|لا يقترب|لا تقترب|\bnot (?:currently )?applying\b/u.test(clause);
   if((applying||separating)&&matching.every(e=>e.applying!==!separating))problems.push('wrong-contact-motion');
   for(const m of clause.matchAll(/(?:orb|بفارق|بمسافة|فارق(?: زاوي)?|اورب)\s*(\d+(?:[.٫]\d+)?)/gu)){
    if(matching.every(e=>Math.abs(e.orb-Number(m[1].replace('٫','.')))>.011))problems.push('wrong-contact-orb');
   }
  }
  const allowed=new Set(contacts.flatMap(e=>[e.transit,e.natal]));
  for(const id of Object.keys(aliases))if(!allowed.has(id)&&mentions(message,id))problems.push('invented-body:'+id);
  const terms:readonly (readonly [number,string])[]=[[0,'conjunct(?:ion)?|اقتران'],[60,'sextile|تسديس'],[90,'square|تربيع'],[120,'trine|تثليث'],[180,'oppos(?:ition|ite)|مقابلة']];
  for(const a of allowed)for(const b of allowed)for(const [angle,words] of terms){
   const aa=(aliases[a]??[a]).map(v=>escaped(normalized(v))).join('|'),bb=(aliases[b]??[b]).map(v=>escaped(normalized(v))).join('|');
   const pattern=new RegExp('(?:'+aa+')\\s+(?:في\\s+|ب)?(?:'+words+')\\s+(?:مع\\s+|with\\s+|to\\s+|و|ب)?(?:'+bb+')(?:$|[^\\p{L}])','u');
   const reverse=new RegExp('(?:'+words+')\\s+(?:'+aa+')\\s+(?:مع\\s+|with\\s+|to\\s+|و|ب)(?:'+bb+')(?:$|[^\\p{L}])','u');
   if((pattern.test(message)||reverse.test(message))&&!contacts.some(e=>e.transit===a&&e.natal===b&&e.angle===angle))problems.push('invented-aspect:'+a+':'+angle+':'+b);
  }
  const allowedDegrees=contacts.flatMap(e=>[e.angle,e.orb]);
  for(const match of message.matchAll(/(\d+(?:[.٫]\d+)?)\s*(?:°|degrees?|درجة)/gu)){
   if(!allowedDegrees.some(v=>Math.abs(v-Number(match[1].replace('٫','.')))<=.011))problems.push('invented-degree');
  }
  if(ctx.strict&&!ctx.plainLanguage&&contacts.length&&!contacts.some(e=>mentions(message,e.transit)&&mentions(message,e.natal)))problems.push('missing-calculated-basis');
  if(ctx.strict&&!contacts.length)problems.push('no-calculated-basis');
  if(ctx.strict&&ctx.support&&ctx.challenge&&((!ctx.plainLanguage&&![ctx.support,ctx.challenge].every(e=>mentions(message,e.transit)&&mentions(message,e.natal)))||!/mixed|challeng|counter|while|but|however|balance|تحدي|متحد|متعارض|متعاكس|مختلط|بالمقابل|لكن|توازن|من جهة|وبنفس الوقت/u.test(message)))problems.push('missing-counter-evidence');
  if(ctx.plainLanguage){
   // The reader wants no planet names, aspect terminology or degrees in a narrative.
   const technical=/(?:اقتران|تربيع|تثليث|تسديس|مقابلة|اورب|أورب|فارق زاوي|\borb\b|\btrine\b|\bsquare\b|\bsextile\b|\bconjunction\b|\bopposition\b|\bapplying\b|\bseparating\b|\d+(?:[.,]\d+)?\s*°)/iu;
   if(technical.test(message)||Object.keys(aliases).some(id=>mentions(message,id)))problems.push('reader-facing-technical-jargon');
   if(ctx.strict&&contacts.length&&message.length<80)problems.push('too-vague-for-personal-reading');
   if(ctx.strict&&contacts.length)problems.push(...semanticLinkProblems(message,ctx));
  }
  if(ctx.challenge&&/\b(?:no|without any)\s+(?:challenging (?:contacts|factors|aspects)|counter-evidence|tension)\b|(?:ماكو|لا توجد|بدون)\s+(?:عوامل|اتصالات|زوايا)\s+(?:متحدية|معاكسة)|\b(?:entirely|purely|fully)\s+(?:favorable|favourable|supportive|positive)\b|(?:كلها|جميع الاتصالات)\s+داعمة/u.test(message))problems.push('denied-counter-evidence');
 }
 return [...new Set(problems)];
}
export function groundedFallback(ctx:AIAdviceContext){
 const arAngles:Record<number,string>={0:'اقتران',60:'تسديس',90:'تربيع',120:'تثليث',180:'مقابلة'};
 const enAngles:Record<number,string>={0:'conjunction',60:'sextile',90:'square',120:'trine',180:'opposition'};
 const factor=(v:AIContact)=>ctx.language==='ar'?
  (aliases[v.transit]?.at(-1)??v.transit)+' '+arAngles[v.angle]+' '+(aliases[v.natal]?.at(-1)??v.natal)+'، بفارق '+v.orb.toFixed(2)+'° '+(v.applying?'ويقترب حالياً من الدقة':'ولا يقترب حالياً من الدقة'):
  v.transit+' '+enAngles[v.angle]+' '+v.natal+' (orb '+v.orb.toFixed(2)+'°, '+(v.applying?'currently applying':'not currently applying')+')';
 // A verified fallback still needs a useful reading: tailor its practical
 // focus to the actual natal target instead of repeating one generic action.
 const target=(ctx.challenge??ctx.support)?.natal??'';
 const domain=['Sun','MC','Jupiter','Saturn'].includes(target)?'work':['Venus','Ascendant'].includes(target)?'relationships':target==='Mercury'?'communication':target==='Mars'?'energy':['Moon','Neptune'].includes(target)?'reflection':target==='Uranus'?'planning':'priorities';
 const guidance:Record<string,[string,string]>={
  work:['راجع التزام واحد: وضّح المطلوب والموعد قبل ما توافق، وبعدها شوف إذا صار عندك وقت وخطوة تنفيذ أوضح.','Review one commitment: clarify the request and deadline before agreeing, then check whether you have a clearer next step and enough time.'],
  relationships:['إذا التواصل متبادل، عبّر عن شي محدد تقدّره أو اسأل سؤالاً واضحاً بدون ضغط. قيّم وضوح الرد واحترام الحدود؛ لا تعتبر الدرجة دليلاً على مشاعر الطرف الثاني.','Where communication is mutual, express one specific appreciation or ask a clear, unpressured question. Judge the actual response and respect boundaries; the index cannot establish the other person’s feelings.'],
  communication:['اكتب رسالة بطلب واحد واضح واقرأها قبل الإرسال. شوف إذا الجواب تناول طلبك فعلاً، وإذا بقى غموض اسأل عن النقطة الناقصة.','Write one clear request and reread it before sending. Check whether the reply actually addresses it, and ask about any unresolved detail.'],
  energy:['اختار جزءاً صغيراً من مهمة بدل ما تفتح عدة مهام. بعد ما تخلصه، قيّم جهدك وتركيزك الفعلي قبل ما تضيف شي جديد.','Choose one small part of a task instead of opening several tasks. After finishing it, assess your actual effort and focus before adding more.'],
  reflection:['دوّن موقفاً واحداً: شنو صار فعلاً، وشنو التفسير اللي أضفته إنت؟ ارجع للملاحظة بعد استراحة وشوف أي افتراض يحتاج دليل أو تعديل.','Write down one situation: what actually happened, and what did you infer? Revisit it after a break and identify any assumption that needs evidence or revision.'],
  planning:['اختار خطوة قابلة للتعديل وحدد شرطاً واضحاً للاستمرار أو التوقف. دقق الموعد والتفاصيل الواقعية قبل ما توسّع الخطة.','Choose an adjustable step and define a clear condition for continuing or stopping. Verify actual dates and practical details before expanding the plan.'],
  priorities:['حدد أولوية واحدة وجرّب أصغر خطوة ممكنة إلها. سجّل النتيجة الفعلية قبل ما تعتبر الانطباع الأول حكماً نهائياً.','Choose one priority and test its smallest useful step. Record the actual result before treating a first impression as a conclusion.']
 };
 if(ctx.language==='ar'){
  const a=ctx.support?'أكو اتصال داعم محسوب: '+factor(ctx.support)+'.':'ماكو اتصال داعم بارز ضمن الدليل الحالي.';
  const b=ctx.challenge?'بالمقابل اتصال يحتاج انتباه: '+factor(ctx.challenge)+'.':'ما ظهر اتصال معاكس بارز بنفس العينة.';
  return a+' '+b+' هاي مؤشرات تنجيمية رمزية، مو تأكيد لحدث.\n\n'+guidance[domain][0];
 }
 const a=ctx.support?'A supporting calculated contact is '+factor(ctx.support)+'.':'No leading supporting contact is in the supplied evidence.';
 const b=ctx.challenge?'A challenging contact is '+factor(ctx.challenge)+'.':'No leading challenging contact is in this sample.';
 return a+' '+b+' These are symbolic themes, not probabilities.\n\n'+guidance[domain][1];
}
/** Safe fallback in client language, grounded in target domains but without astronomical labels. */
export function groundedPlainFallback(ctx:AIAdviceContext):string{
 return evidenceGroundedPlainAnalysis(ctx);
}
export function reviewGeneratedAdvice(raw:string,ctx:AIAdviceContext){
 const clean=conciseAI(raw),problems=unsafeAIGuesses(clean,ctx);
 if(!clean)return {text:'',problems:['empty'],fallback:false};
 return problems.length?{text:ctx.plainLanguage?groundedPlainFallback(ctx):groundedFallback(ctx),problems,fallback:true}:{text:clean,problems:[],fallback:false};
}
