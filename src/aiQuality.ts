/** Reconcile Qwen3 text with supplied evidence; never present guessed certainty,
 * probabilities, exact future dates, or private-person claims as calculations.
 */
import {bodies} from './math.ts';
export type AIContact={transit:string;natal:string;angle:number;orb:number;applying:boolean};
export type AIAdviceContext={language:'ar'|'en';support:AIContact|null;challenge:AIContact|null;events:readonly {kind:string;type:string;maximum:string}[];evidence?:readonly AIContact[];supplemental?:readonly AIContact[];strict?:boolean};
const normalized=(s:string)=>s.normalize('NFKC').toLocaleLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/[٠-٩]/g,v=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(v))).replace(/[۰-۹]/g,v=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(v)));
const aliases:Record<string,string[]>={...Object.fromEntries(bodies.map(b=>[b[1],[b[1],b[2]]])),Ascendant:['Ascendant','الطالع'],MC:['MC','Midheaven','وسط السماء']};
const escaped=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const mentions=(text:string,id:string)=>[...(aliases[id]??[id])].some(alias=>new RegExp('(?:^|[^\\p{L}])(?:و)?'+escaped(normalized(alias))+'(?:$|[^\\p{L}])','u').test(text));
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
export function unsafeAIGuesses(message:string,ctx:AIAdviceContext):string[]{
 message=normalized(message).replace(/\*\*/g,'');
 const problems:string[]=[];
 if(/\d+(?:[.,٫]\d+)?\s*(?:%|٪|percent)/iu.test(message))problems.push('unfounded-percentage');
 if(/(?:\bguarantee(?:d|s)?\b|\bcertainly\s+will\b|\bwill\s+(?:definitely|certainly)\b|اكيد\s+(?:راح|حت|يرجع)|مضمون(?:ة)?(?:\s|$))/iu.test(message)&&!/(?:not guaranteed|no guarantee|مو مضمونة|مو مضمون|غير مضمون)/u.test(message))problems.push('unsupported-certainty');
 if(/(?:\bshe secretly wants\b|\bhe secretly desires\b|\bknow her private thoughts\b|نعرف\s+افكارها\s+السرية|نقدر\s+نقرا\s+رغباتها)/iu.test(message))problems.push('private-intent-claim');
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
  if(ctx.strict&&contacts.length&&!contacts.some(e=>mentions(message,e.transit)&&mentions(message,e.natal)))problems.push('missing-calculated-basis');
  if(ctx.strict&&!contacts.length)problems.push('no-calculated-basis');
  if(ctx.strict&&ctx.support&&ctx.challenge&&(![ctx.support,ctx.challenge].every(e=>mentions(message,e.transit)&&mentions(message,e.natal))||!/mixed|challeng|counter|while|but|however|balance|تحدي|متحد|متعارض|متعاكس|مختلط|بالمقابل|لكن|توازن/u.test(message)))problems.push('missing-counter-evidence');
 }
 return [...new Set(problems)];
}
export function groundedFallback(ctx:AIAdviceContext){
 const arAngles:Record<number,string>={0:'اقتران',60:'تسديس',90:'تربيع',120:'تثليث',180:'مقابلة'};
 const enAngles:Record<number,string>={0:'conjunction',60:'sextile',90:'square',120:'trine',180:'opposition'};
 const factor=(v:AIContact)=>ctx.language==='ar'?
  (aliases[v.transit]?.at(-1)??v.transit)+' '+arAngles[v.angle]+' '+(aliases[v.natal]?.at(-1)??v.natal)+'، بفارق '+v.orb.toFixed(2)+'° '+(v.applying?'ويقترب حالياً من الدقة':'ولا يقترب حالياً من الدقة'):
  v.transit+' '+enAngles[v.angle]+' '+v.natal+' (orb '+v.orb.toFixed(2)+'°, '+(v.applying?'currently applying':'not currently applying')+')';
 if(ctx.language==='ar'){
  const a=ctx.support?'أكو اتصال داعم محسوب: '+factor(ctx.support)+'.':'ماكو اتصال داعم بارز ضمن الدليل الحالي.';
  const b=ctx.challenge?'بالمقابل اتصال يحتاج انتباه: '+factor(ctx.challenge)+'.':'ما ظهر اتصال معاكس بارز بنفس العينة.';
  return a+' '+b+' هاي مؤشرات تنجيمية رمزية، مو كشف لنوايا الآخرين ولا تأكيد لحدث.\n\nاختار خطوة صغيرة قابلة للتراجع تناسب ظرفك، وراقب النتيجة الحقيقية قبل ما تتوسع.';
 }
 const a=ctx.support?'A supporting calculated contact is '+factor(ctx.support)+'.':'No leading supporting contact is in the supplied evidence.';
 const b=ctx.challenge?'A challenging contact is '+factor(ctx.challenge)+'.':'No leading challenging contact is in this sample.';
 return a+' '+b+' These are symbolic themes, not probabilities or access to private intentions.\n\nTry one small reversible action, and judge it by the real result.';
}
export function reviewGeneratedAdvice(raw:string,ctx:AIAdviceContext){
 const clean=conciseAI(raw),problems=unsafeAIGuesses(clean,ctx);
 if(!clean)return {text:'',problems:['empty'],fallback:false};
 return problems.length?{text:groundedFallback(ctx),problems,fallback:true}:{text:clean,problems:[],fallback:false};
}
