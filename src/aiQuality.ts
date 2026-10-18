/** Reconcile Qwen3 text with supplied evidence; never present guessed certainty,
 * probabilities, exact future dates, or private-person claims as calculations.
 */
export type AIContact={transit:string;natal:string;angle:number;orb:number;applying:boolean};
export type AIAdviceContext={language:'ar'|'en';support:AIContact|null;challenge:AIContact|null;events:readonly {kind:string;type:string;maximum:string}[]};
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
 const problems:string[]=[];
 if(/(?:^|[^\d])(?:100|[1-9]?\d)\s*(?:%|٪|percent)(?!\w)/iu.test(message))problems.push('unfounded-percentage');
 if(/(?:\bguarantee(?:d|s)?\b|\bcertainly\s+will\b|أكيد\s+(?:راح|حت|يرجع)|مضمون\s+(?:100|بالمية))/iu.test(message))problems.push('unsupported-certainty');
 if(/(?:\bshe secretly wants\b|\bhe secretly desires\b|\bknow her private thoughts\b|نعرف\s+أفكارها\s+السرية|نقدر\s+نقرأ\s+رغباتها)/iu.test(message))problems.push('private-intent-claim');
 if(!ctx.events.length&&/(?:eclipse|كسوف|خسوف)/iu.test(message))problems.push('unverified-eclipse');
 const dates=[...message.matchAll(/\b(?:18|19|20|21|22|23)\d\d-\d\d-\d\d\b/g)].map(x=>x[0]);
 const known=new Set(ctx.events.map(e=>e.maximum.slice(0,10)));
 if(dates.some(d=>!known.has(d)))problems.push('invented-exact-date');
 return problems;
}
export function groundedFallback(ctx:AIAdviceContext){
 const factor=(v:AIContact)=>v.transit+' '+v.angle+'° / '+v.natal+' (orb '+v.orb.toFixed(2)+'°)';
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
