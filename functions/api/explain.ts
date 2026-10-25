import {namedAsteroids} from '../../src/asteroids.ts';
import {reviewGeneratedAdvice,groundedPlainFallback,calculatedNarrativeFactors,hasSymbolicFraming,conciseAI,type AIAdviceContext,type AIExplanationLink} from '../../src/aiQuality.ts';
import {bodies as ephemerisBodies} from '../../src/math.ts';
type Message={role:'system'|'user';content:string};
type AIInput={messages:Message[];temperature:number;max_tokens:number;stream:false;response_format?:{type:'json_object'}};
type Env={AI?:{run:(model:string,input:AIInput)=>Promise<unknown>};QWEN_GATEWAY_URL?:string;QWEN_GATEWAY_TOKEN?:string;QWEN_MODEL?:string};
type Context={request:Request;env:Env};
const CF_MODEL='@cf/qwen/qwen3-30b-a3b-fp8';
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const connection=(env:Env)=>env.QWEN_GATEWAY_URL?{configured:true,provider:'gateway',model:env.QWEN_MODEL??'qwen3'}:env.AI?{configured:true,provider:'cloudflare',model:CF_MODEL}:{configured:false,provider:'none',model:CF_MODEL};
const bodies=new Set(['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','Ceres','Pallas','Juno','Vesta','Pholus','Ascendant','MC']);
const categories=['overview','career','love','communication','energy','emotions','recovery','timing'];
const originalAsteroids=new Map(namedAsteroids.map(x=>[x.name,x]));
export const onRequestGet=({env}:Context)=>json(connection(env));
export async function onRequestPost({request,env}:Context){
 const url=new URL(request.url);if(request.headers.get('origin')!==url.origin)return json({error:'Same-origin requests only.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required.'},415);
 const status=connection(env);
 if(!status.configured)return json({error:'Workers AI is not bound yet. Add the Workers AI binding named AI to the mxastro Pages project and redeploy.',code:'AI_NOT_CONFIGURED'},503);
 let input:any;
 try{
  const reader=request.body?.getReader();if(!reader)return json({error:'Missing payload.'},400);let bytes=0,text='';const decoder=new TextDecoder();
  while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>20000){await reader.cancel();return json({error:'Payload too large.'},413)}text+=decoder.decode(value,{stream:true})}text+=decoder.decode();
  input=JSON.parse(text);
 }catch{return json({error:'Invalid JSON payload.'},400)}
 if(!input||!['ar','en'].includes(input.language)||!Array.isArray(input.evidence)||input.evidence.length>12)return json({error:'Invalid evidence packet.'},400);
 type Factor={transit:string;natal:string;angle:number;orb:number;applying:boolean;weight:number;direction:'supportive'|'challenging'|'neutral'};
 const evidence:Factor[]=[];
 const seenEvidence=new Set<string>();
 for(const e of input.evidence){
  if(!e||!bodies.has(e.transit)||!bodies.has(e.natal)||![0,60,90,120,180].includes(e.angle)||typeof e.orb!=='number'||!Number.isFinite(e.orb)||e.orb<0||e.orb>6||typeof e.weight!=='number'||!Number.isFinite(e.weight)||e.weight<0||e.weight>1||typeof e.applying!=='boolean')return json({error:'Invalid numeric evidence.'},400);
  const spec=ephemerisBodies.find(b=>b[1]===e.transit),key=e.transit+':'+e.natal+':'+e.angle;
  if(!spec||e.orb>spec[5]||seenEvidence.has(key))return json({error:'Inconsistent or duplicate calculated aspect.'},400);
  seenEvidence.add(key);
  const direction=[60,120].includes(e.angle)||(e.angle===0&&['Venus','Jupiter'].includes(e.transit))?'supportive':[90,180].includes(e.angle)||(e.angle===0&&['Saturn','Mars','Pluto','Uranus'].includes(e.transit))?'challenging':'neutral';
  evidence.push({transit:e.transit,natal:e.natal,angle:e.angle,orb:e.orb,applying:e.applying,weight:e.weight,direction});
 }
 const extendedEvidence:{transit:string;natal:string;angle:number;orb:number;applying:boolean;areas:readonly string[]}[]=[];
 if(input.extendedEvidence!==undefined){
  if(!Array.isArray(input.extendedEvidence)||input.extendedEvidence.length>8)return json({error:'Invalid extended evidence.'},400);
  for(const e of input.extendedEvidence){
   const asteroid=originalAsteroids.get(e?.transit);
   if(!asteroid||!bodies.has(e?.natal)||![0,60,90,120,180].includes(e.angle)||typeof e.orb!=='number'||!Number.isFinite(e.orb)||e.orb<0||e.orb>6||typeof e.applying!=='boolean')return json({error:'Invalid named asteroid evidence.'},400);
   extendedEvidence.push({transit:asteroid.name,natal:e.natal,angle:e.angle,orb:Number(e.orb.toFixed(3)),applying:e.applying,areas:asteroid.areas});
  }
 }
 const indices:Record<string,number>={};
 for(const c of categories){const v=input.indices?.[c];if(typeof v==='number'&&Number.isFinite(v)&&v>=1&&v<=99)indices[c]=v}
 const strongestSupporting=evidence.filter(e=>e.direction==='supportive').sort((a,b)=>b.weight-a.weight)[0]??null;
 const strongestChallenging=evidence.filter(e=>e.direction==='challenging').sort((a,b)=>b.weight-a.weight)[0]??null;
 if(!strongestSupporting&&!strongestChallenging)return json({error:input.language==='ar'?'ماكو دليل كافي لشرح شخصي؛ ما نستبدله بكلام عام.':'Insufficient calculated evidence for a personal explanation.',code:'INSUFFICIENT_EVIDENCE'},422);
 const names:Record<string,string>={Sun:'الشمس',Moon:'القمر',Mercury:'عطارد',Venus:'الزهرة',Mars:'المريخ',Jupiter:'المشتري',Saturn:'زحل',Uranus:'أورانوس',Neptune:'نبتون',Pluto:'بلوتو',Chiron:'كيرون',Ceres:'سيريس',Pallas:'بالاس',Juno:'جونو',Vesta:'فيستا',Pholus:'فولوس',Ascendant:'الطالع',MC:'وسط السماء'};
 const label=(id:string)=>input.language==='ar'?names[id]:id;
 const contactLabel=(key:string)=>{const [transit,natal,angle]=key.split(':');return {transit:label(transit),natal:label(natal),angle:Number(angle)}};
 const calculatedAt=typeof input.calculatedAt==='string'&&Number.isFinite(Date.parse(input.calculatedAt))?new Date(input.calculatedAt).toISOString():null;
 const safeKey=(v:unknown)=>typeof v==='string'&&v.split(':').length===3&&bodies.has(v.split(':')[0])&&bodies.has(v.split(':')[1])&&['0','60','90','120','180'].includes(v.split(':')[2]);
 let invalidComparison=false;
 const comparison=Object.fromEntries(['hour','day'].map(period=>{
  const raw=input.comparison?.[period];
  if(!raw)return [period,null];
  if(typeof raw!=='object'||Array.isArray(raw)||!['entered','exited','changed'].every(key=>Array.isArray(raw[key])&&raw[key].length<=12)){invalidComparison=true;return [period,null]}
  const entered=Array.isArray(raw.entered)?raw.entered.filter(safeKey).slice(0,12):[];
  const exited=Array.isArray(raw.exited)?raw.exited.filter(safeKey).slice(0,12):[];
  const changed=Array.isArray(raw.changed)?raw.changed.filter((v:any)=>safeKey(v?.contact)&&[v.orbBefore,v.orbNow].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=6)&&typeof v.applying==='boolean').slice(0,12).map((v:any)=>({contact:v.contact,labels:contactLabel(v.contact),orbBefore:v.orbBefore,orbNow:v.orbNow,applying:v.applying})):[];
  let totals={entered:entered.length,exited:exited.length,changed:changed.length};
  if(raw.totals!==undefined){
   const expected={entered:entered.length,exited:exited.length,changed:changed.length};
   if(!raw.totals||!Object.entries(expected).every(([key,count])=>Number.isInteger(raw.totals[key])&&raw.totals[key]>=count&&raw.totals[key]<=512&&count===Math.min(raw.totals[key],12))){invalidComparison=true;return [period,null]}
   totals={entered:raw.totals.entered,exited:raw.totals.exited,changed:raw.totals.changed};
  }
  const scope=raw.scope==='all-computed-contacts'&&raw.totals?'all-computed-contacts':'leading-packet';
  return [period,{entered,exited,changed,totals,scope,truncated:Object.values(totals).some(n=>n>12),stable:!totals.entered&&!totals.exited&&!totals.changed}];
 }));
 if(invalidComparison)return json({error:'Inconsistent comparison totals.'},400);
 const eclipseEvents:{kind:'solar'|'lunar';type:'total'|'annular'|'hybrid'|'partial'|'penumbral';maximum:string}[]=[];
 if(input.eclipseEvents!==undefined){
  if(!Array.isArray(input.eclipseEvents)||input.eclipseEvents.length>2)return json({error:'Invalid eclipse list'},400);
  for(const item of input.eclipseEvents){
   if(!item||!['solar','lunar'].includes(item.kind)||!['total','annular','hybrid','partial','penumbral'].includes(item.type)||item.kind==='solar'&&item.type==='penumbral'||item.kind==='lunar'&&['annular','hybrid'].includes(item.type))return json({error:'Invalid eclipse type'},400);
   const at=new Date(item.maximum);
   if(typeof item.maximum!=='string'||!Number.isFinite(+at)||at.toISOString()!==item.maximum||!calculatedAt||+at<+new Date(calculatedAt)||+at>+new Date(calculatedAt)+100*86400000)return json({error:'Invalid eclipse time'},400);
   eclipseEvents.push({kind:item.kind,type:item.type,maximum:item.maximum});
  }
 }
 const grammaticalGender=input.grammaticalGender==='male'?'male':input.grammaticalGender==='female'?'female':'unspecified';
 const system=`You are a precision-focused astrology editorial assistant writing in ${input.language==='ar'?'clear, refined Iraqi Arabic':'natural, clear English'}. The user explicitly wants only useful interpretation, never the math behind it.
The incoming JSON is an internal calculator packet: read the supplied actual strongest supporting and challenging factors, the natal targets and comparison changes. Use their meanings to choose the right real-life theme (work, affection, intimacy, boundaries, messages, energy, travel or rest) and the degree of ease or caution, but NEVER reproduce or refer to celestial body names, zodiac signs, aspect labels, angles, orb, degrees, applying/separating or planetary transits in the OUTPUT. Do not copy JSON field names.
Write two compact but substantive paragraphs, 85–130 words total. Paragraph 1: speak DIRECTLY to the reader, identify one specific situation they could realistically recognize, explain the concrete trade-off created by BOTH supplied factors when there are two, and make the reading conditional rather than asserting it happened. Paragraph 2: one precise reversible action and the observation that would show whether it helped. Examples should vary depending on the actual supplied natal targets. No repeated advice, no vague generalities, no numerology, no fate claims, no percentages, no invented relationship, no other person's private desire or consent, no medical or financial prediction. Call the interpretation symbolic once, in natural language, without repetitive disclaimers. If neither factor is provided, clearly say there isn't enough to make a personal inference. If only one is present, never invent a second. If a comparison is absent, do not claim anything is unchanged.
Address the profile using ${grammaticalGender==='female'?'female Iraqi Arabic grammar':grammaticalGender==='male'?'male Iraqi Arabic grammar':'neutral phrasing'}. Prioritize the meaning in daily life, not astrological terminology. No markdown, no headings, no internal reasoning.
Return one JSON object with explanation (the two reader-facing paragraphs) and grounding (one item per required factor, each with contact copied from interpretationPlan and excerpt copied exactly from explanation). Each excerpt must actually connect BOTH that factor's targetMeaning and driverMeaning in a concrete situation. A list of contact IDs or a generic paragraph about priorities is insufficient. Keep all IDs and technical names in grounding only, never in explanation. /no_think`;
 const describe=(e:Factor|null)=>e?{transit:e.transit,natal:e.natal,transitLabel:label(e.transit),natalLabel:label(e.natal),angle:e.angle,orb:Number(e.orb.toFixed(3)),applying:e.applying,direction:e.direction}:null;
 const symbolicIndices=Object.fromEntries(Object.entries(indices).map(([k,v])=>[k,String(v)+'/100 (symbolic index, not a probability)']));
 const context:AIAdviceContext={language:input.language,support:describe(strongestSupporting),challenge:describe(strongestChallenging),events:eclipseEvents,evidence,supplemental:extendedEvidence,strict:true,plainLanguage:true,comparisonAvailable:Object.values(comparison).some(v=>v!==null)};
 const interpretationPlan=calculatedNarrativeFactors(context);
 const messages:Message[]=[{role:'system',content:system},{role:'user',content:JSON.stringify({calculatedAt,comparison,indices:symbolicIndices,strongestSupporting:describe(strongestSupporting),strongestChallenging:describe(strongestChallenging),evidence:evidence.map(describe),interpretationPlan,supplementalNamedAsteroids:extendedEvidence,verifiedUpcomingEclipses:eclipseEvents})+'\n/no_think'}];
 try{
  const runModel=async(send:Message[])=>{
   let response:any;
   if(status.provider==='gateway'){
    const upstream=new URL(env.QWEN_GATEWAY_URL!);
    if(upstream.protocol!=='https:')throw Error('Gateway must use HTTPS');
    const result=await fetch(upstream,{method:'POST',headers:{'Content-Type':'application/json',...(env.QWEN_GATEWAY_TOKEN?{Authorization:'Bearer '+env.QWEN_GATEWAY_TOKEN}:{})},body:JSON.stringify({model:status.model,messages:send,temperature:.2,max_tokens:1500,stream:false,response_format:{type:'json_object'}}),signal:AbortSignal.timeout(50000)});
    if(!result.ok)throw Error('Ai gateway could not complete request');
    response=await result.json();
   }else{
    response=await env.AI!.run(CF_MODEL,{messages:send,temperature:.2,max_tokens:1500,stream:false,response_format:{type:'json_object'}});
   }
   return response?.choices?.[0]?.message?.content??response?.response??response?.result?.response;
  };
  const review=(raw:unknown)=>{
   let value:any=raw;
   if(typeof raw==='string'){
    const text=conciseAI(raw).replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/i,'$1').trim();
    if(!text)return null;
    if(text.startsWith('{')){try{value=JSON.parse(text)}catch{value={}}}
    else value={explanation:text}; // Older gateways may return plain prose.
   }
   if(value===null||value===undefined)return null;
   if(typeof value.explanation!=='string'||!value.explanation.trim())return {text:groundedPlainFallback(context),problems:['invalid-model-structure'],fallback:true,framingAdded:false};
   let links:AIExplanationLink[]|undefined;
   if(value.grounding!==undefined){
    if(!Array.isArray(value.grounding)||value.grounding.length>2||value.grounding.some((link:any)=>!link||typeof link.contact!=='string'||typeof link.excerpt!=='string'||link.excerpt.length>6000))links=[];
    else links=value.grounding.map((link:AIExplanationLink)=>({contact:link.contact,excerpt:link.excerpt}));
   }
   // Framing is owned by the application rather than relying on a model to
   // remember a disclaimer. All factual and semantic checks still run on the
   // actual prose; adding this prefix cannot authorize unrelated content.
   const framingAdded=!hasSymbolicFraming(value.explanation);
   const explanation=framingAdded?(input.language==='ar'?'قراءة رمزية: ':'Symbolic interpretation: ')+value.explanation:value.explanation;
   return {...reviewGeneratedAdvice(explanation,{...context,semanticLinks:links}),framingAdded};
  };
  const first=await runModel(messages);
  let checked=review(first),retried=false;
  if(!checked)return json({error:'Ai returned no explanation. Please retry.',code:'AI_EMPTY_RESPONSE'},502);
  const modelReasonCodes=[...checked.problems,...(checked.framingAdded?['missing-symbolic-framing']:[])];
  if(checked.fallback){
   // Do not silently show a canned paragraph just because the model omitted
   // evidence or added a fabricated certainty. Give the model one targeted
   // chance to correct itself, then use a deterministic evidence-bound reading.
   retried=true;
   const correction:Message={role:'user',content:
    'Your previous draft failed factual/style validation ('+checked.problems.join(', ')+'). '+
    'Rewrite from the provided calculated factors ONLY: make the actual natal target and transit theme determine a recognizable daily-life scene, include the distinct strongest challenge if present, and end with a concrete checkable action. '+
    'Use interpretationPlan: each excerpt must connect its actual targetMeaning and driverMeaning, and must be copied from your explanation. '+
    'Do not invent an event, private feelings or precise dates. Write natural Iraqi Arabic when language=ar; no body names, math or angle jargon in the explanation. Return the same JSON explanation and grounding schema. /no_think'};
   try{
    const second=await runModel([...messages,correction]);
    const reviewed=review(second);
    if(reviewed&&!reviewed.fallback)checked=reviewed;
   }catch{ /* The verified calculation-grounded fallback remains available. */ }
  }
  if(!checked.text)return json({error:'No grounded explanation available.',code:'AI_EMPTY_RESPONSE'},502);
  return json({explanation:checked.text,model:status.model,provider:status.provider,
   quality:checked.fallback?'grounded-fallback':'reviewed-model',calculatedAt,
   review:{corrected:retried||checked.framingAdded,grounded:!checked.fallback,status:checked.fallback?'editorial-replacement':'passed-bounded-checks',checks:['unsupported-outcomes','symbolic-framing','calculated-factor-meaning','counter-evidence'],adjustments:checked.framingAdded?['symbolic-framing']:[],modelReasonCodes,reasonCodes:checked.fallback?checked.problems:[]}});

 }catch{return json({error:input.language==='ar'?'خدمة Ai على السيرفر غير متاحة حالياً. تحقق من تفعيل Workers AI وحصته بحساب Cloudflare، وجرّب مرة ثانية.':'Ai is unavailable. Check Workers AI activation and quota in Cloudflare, then retry.',code:'AI_UNAVAILABLE'},503)}
}
