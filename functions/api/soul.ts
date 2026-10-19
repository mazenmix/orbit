import {soulTopics} from '../../src/soulData.ts';
import {getSoulTheme} from '../../src/soulThemes.ts';
import {soulDeepFor} from '../../src/soulDeep.ts';
import {detectInventedNatalText,safeBasisSummary} from '../../src/soulGrounding.ts';
import {soulRule} from '../../src/soulTopicRules.ts';
import {soulAspectPairs,type NatalBasis} from '../../src/soulEngine.ts';
import {repeatedSoulPassage} from '../../src/soulQuality.ts';
import {unsupportedOutcomeClaims,hasSymbolicFraming} from '../../src/aiQuality.ts';
type Env={AI?:{run:(model:string,arg:any)=>Promise<any>}};
const respond=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const valid=new Set(['Sun','Moon','Ascendant','MC','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','Ceres','Pallas','Juno','Vesta','Pholus']);
export async function onRequestPost({request,env}:{request:Request;env:Env}){
 const url=new URL(request.url);
 if(request.headers.get('origin')!==url.origin)return respond({error:'Same origin only'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return respond({error:'JSON required'},415);
 if(!env.AI)return respond({error:'Ai unavailable'},503);
 let input:any;try{
  const raw=await request.text();if(raw.length>6000)return respond({error:'Request too large'},413);
  input=JSON.parse(raw);
 }catch{return respond({error:'Invalid JSON'},400)}
 if(!['ar','en'].includes(input?.language)||!Number.isInteger(input?.topicId)||input.topicId<1||input.topicId>200)return respond({error:'Unknown topic'},400);
 const selected=soulTopics[input.topicId-1],rule=soulRule(selected.id);
 const supplied=input.evidence;
 if(!Array.isArray(supplied)||supplied.length<1||supplied.length>3)return respond({error:'Invalid evidence'},400);
 for(const p of supplied){
  if(!valid.has(p?.planet)||!Number.isFinite(p.longitude)||p.longitude<0||p.longitude>=360||p.sign!==Math.floor(p.longitude/30)||p.house!==null&&(!Number.isInteger(p.house)||p.house<1||p.house>12)||typeof p.retrograde!=='boolean')return respond({error:'Invalid natal placement'},400);
  if(p.angle!==null&&p.angle!==undefined&&(!valid.has(p.angle.planet)||![0,60,90,120,180].includes(p.angle.type)||!Number.isFinite(p.angle.orb)||p.angle.orb<0||p.angle.orb>3))return respond({error:'Invalid natal angle'},400);
 }
 if(new Set(supplied.map((x:any)=>x.planet)).size!==supplied.length)return respond({error:'Duplicate planets'},400);
 if(supplied.some((p:any)=>!rule.planets.includes(p.planet)))return respond({error:'Placements do not belong to this topic',code:'UNRELATED_EVIDENCE'},400);
 if(input.birthTimeKnown!==undefined&&typeof input.birthTimeKnown!=='boolean')return respond({error:'Invalid birth-time status'},400);
 if(input.birthTimeKnown===false&&supplied.some((p:any)=>['Moon','Ascendant','MC'].includes(p.planet)||p.house!==null))return respond({error:'Unknown birth time cannot authorize Moon, angles or houses',code:'UNKNOWN_BIRTH_TIME'},400);
 if(supplied.length<2)return respond({error:input.language==='ar'?'المواضع المتاحة غير كافية لهذا الموضوع؛ ما نعوّض النقص بتخمين.':'Insufficient relevant placements for this topic; missing data are not replaced with guesses.',code:'INSUFFICIENT_EVIDENCE'},422);
 // Strip nested extra fields as well as top-level identity/birth metadata.
 const basis:NatalBasis[]=supplied.map(p=>({planet:p.planet,longitude:p.longitude,sign:p.sign,house:p.house,retrograde:p.retrograde,angle:p.angle?{planet:p.angle.planet,type:p.angle.type,orb:p.angle.orb,conflict:[90,180].includes(p.angle.type)}:null}));
 const aspects=soulAspectPairs(basis);
 for(const p of basis)if(p.angle&&!aspects.some(a=>((a.first===p.planet&&a.second===p.angle!.planet)||(a.second===p.planet&&a.first===p.angle!.planet))&&a.type===p.angle!.type&&Math.abs(a.orb-p.angle!.orb)<1e-6))return respond({error:'Natal angle does not match supplied positions'},400);
 const theme=getSoulTheme(selected.id),depth=soulDeepFor(selected.id),ar=input.language==='ar';
 const provenance={claimType:'symbolic-interpretation',origin:'client-ephemeris-placements',inputChecks:['numeric-placement','topic-relevance','aspect-geometry'],birthTimeKnown:input.birthTimeKnown??null,reviewedAt:new Date().toISOString(),predictionValidated:false};
 const system='Act as an astrology interpretation editor in '+(ar?'natural Iraqi Arabic':'clear English')+'. Use ONLY provided validated natal placements and aspects. Zodiac positions are supplied from client Swiss Ephemeris: NEVER invent a new planet, aspect, sign, degree, house or person. The goal is thoughtful symbolic self-reflection, not a clinical psychological diagnosis, validated personality fact, secret desire, future certainty or statistical probability. Return ONLY valid JSON containing summary (string), detailedAnalysis (string), strengths (array of 2 strings), challenges (array of 2 strings), practicalInsights (array of 2 strings), reflectionQuestions (array of 1 string). Write about the UNIQUE topic-specific editorial angle and concrete real-life counterexample provided. Do not repeat the same sentence or advice across summary, detailed analysis, strengths, challenges and practical insights. Avoid generic horoscope filler such as everyone wants love, trust and growth. Avoid mathematical degree tables in reader-facing prose; computed evidence stays separate. If any placement does not appear in the computedNatalEvidence, DO NOT mention that planet, sign or house at all. Do not invent a precise degree. Specific to the topic. No markdown or think tags. /no_think';
 const message=JSON.stringify({topic:ar?selected.ar:selected.en,uniqueEditorialAngle:ar?theme.focusAr:theme.focusEn,illustrativeExample:ar?depth.ar:depth.en,potentialResource:rule.resource[ar?'ar':'en'],patternToExamine:rule.risk[ar?'ar':'en'],nonRepeatedPracticalAction:ar?theme.actionAr:theme.actionEn,computedNatalEvidence:basis,computedAspects:aspects})+'\n/no_think';
 const editorialFallback=(reason:'repetition'|'natal-evidence'|'unsupported-claim')=>respond({
  topicId:selected.id,summary:ar?theme.focusAr:theme.focusEn,
  detailedAnalysis:(ar?'تأويل رمزي للمراجعة: ':'Symbolic reflection: ')+(ar?depth.ar:depth.en)+(ar?' المؤشرات المتاحة: ':' Available indicators: ')+safeBasisSummary(basis,ar)+'.',
  strengths:[rule.resource[ar?'ar':'en']],challenges:[rule.risk[ar?'ar':'en']],
  practicalInsights:[ar?theme.actionAr:theme.actionEn],
  reflectionQuestions:[ar?'أي تجربة تدعم هذه القراءة وأي تجربة تخالفها؟':'Which experience supports this reading and which challenges it?'],
  astrologicalEvidence:basis,provider:'qwen3',quality:'verified-editorial-fallback',fallbackReason:reason,contentOrigin:'editorial-interpretation',provenance:{...provenance,outputReview:{status:'editorial-replacement',reason}}
 });
 try{
  const result=await env.AI.run('@cf/qwen/qwen3-30b-a3b-fp8',{
   messages:[{role:'system',content:system},{role:'user',content:message}],
   temperature:.22,max_tokens:2600,stream:false,response_format:{type:'json_object'}
  });
  const responseValue=result?.response??result?.result?.response??result?.choices?.[0]?.message?.content??result;
  let parsed:any;
  if(responseValue&&typeof responseValue==='object'&&!Array.isArray(responseValue))parsed=responseValue;
  else{
   const raw=String(responseValue??'').replace(/<think>[\s\S]*?<\/think>/gi,'').replace(/<think>[\s\S]*$/gi,'').split(String.fromCharCode(96)).join('').trim();
   const begin=raw.indexOf('{'),end=raw.lastIndexOf('}');
   if(begin<0||end<begin)return respond({error:'Unstructured Ai response',code:'MODEL_NON_JSON',diagnostic:{responseKind:typeof responseValue,rawLength:raw.length}},502);
   try{parsed=JSON.parse(raw.slice(begin,end+1))}catch{return respond({error:'Invalid Ai JSON',code:'MODEL_INVALID_JSON'},502)}
  }
  const validText=(x:unknown,min=3,max=900)=>typeof x==='string'&&x.trim().length>=min&&x.length<=max;
  const validList=(v:unknown)=>Array.isArray(v)&&v.length>=1&&v.length<=3&&v.every(x=>validText(x,3,250));
  if(!validText(parsed.summary,8,400)||!validText(parsed.detailedAnalysis,20,950)||!validList(parsed.strengths)||!validList(parsed.challenges)||!validList(parsed.practicalInsights)||!validList(parsed.reflectionQuestions))return respond({error:'Incomplete Ai interpretation'},502);
  const all=[parsed.summary,parsed.detailedAnalysis,...parsed.strengths,...parsed.challenges,...parsed.practicalInsights,...parsed.reflectionQuestions];
  if(repeatedSoulPassage(all))return editorialFallback('repetition');
  if(unsupportedOutcomeClaims(all.join('\n')).length||!hasSymbolicFraming(parsed.summary+' '+parsed.detailedAnalysis))return editorialFallback('unsupported-claim');
  const sections=[parsed.summary,parsed.detailedAnalysis,...parsed.strengths,...parsed.challenges,...parsed.practicalInsights,...parsed.reflectionQuestions];
  const errors=detectInventedNatalText(sections,basis);
  if(errors.length)return editorialFallback('natal-evidence');
  return respond({topicId:selected.id,summary:parsed.summary,detailedAnalysis:parsed.detailedAnalysis,strengths:parsed.strengths,challenges:parsed.challenges,practicalInsights:parsed.practicalInsights,reflectionQuestions:parsed.reflectionQuestions,astrologicalEvidence:basis,provider:'qwen3',quality:'source-grounded-model',contentOrigin:'generated-interpretation',provenance:{...provenance,outputReview:{status:'passed-bounded-checks',checks:['repetition','unsupported-outcomes','symbolic-framing','natal-evidence']}}});
 }catch{return respond({error:'Ai service currently unavailable'},503)}
}
