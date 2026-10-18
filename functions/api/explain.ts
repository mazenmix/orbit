import {namedAsteroids} from '../../src/asteroids.ts';
import {reviewGeneratedAdvice} from '../../src/aiQuality.ts';
type Message={role:'system'|'user';content:string};
type AIInput={messages:Message[];temperature:number;max_tokens:number;stream:false};
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
 for(const e of input.evidence){
  if(!e||!bodies.has(e.transit)||!bodies.has(e.natal)||![0,60,90,120,180].includes(e.angle)||typeof e.orb!=='number'||!Number.isFinite(e.orb)||e.orb<0||e.orb>6||typeof e.weight!=='number'||!Number.isFinite(e.weight)||e.weight<0||e.weight>1||typeof e.applying!=='boolean')return json({error:'Invalid numeric evidence.'},400);
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
 const names:Record<string,string>={Sun:'الشمس',Moon:'القمر',Mercury:'عطارد',Venus:'الزهرة',Mars:'المريخ',Jupiter:'المشتري',Saturn:'زحل',Uranus:'أورانوس',Neptune:'نبتون',Pluto:'بلوتو',Chiron:'كيرون',Ceres:'سيريس',Pallas:'بالاس',Juno:'جونو',Vesta:'فيستا',Pholus:'فولوس',Ascendant:'الطالع',MC:'وسط السماء'};
 const label=(id:string)=>input.language==='ar'?names[id]:id;
 const contactLabel=(key:string)=>{const [transit,natal,angle]=key.split(':');return {transit:label(transit),natal:label(natal),angle:Number(angle)}};
 const calculatedAt=typeof input.calculatedAt==='string'&&Number.isFinite(Date.parse(input.calculatedAt))?new Date(input.calculatedAt).toISOString():null;
 const safeKey=(v:unknown)=>typeof v==='string'&&v.split(':').length===3&&bodies.has(v.split(':')[0])&&bodies.has(v.split(':')[1])&&['0','60','90','120','180'].includes(v.split(':')[2]);
 const comparison=Object.fromEntries(['hour','day'].map(period=>{
  const raw=input.comparison?.[period];
  if(!raw)return [period,null];
  const entered=Array.isArray(raw.entered)?raw.entered.filter(safeKey).slice(0,12):[];
  const exited=Array.isArray(raw.exited)?raw.exited.filter(safeKey).slice(0,12):[];
  const changed=Array.isArray(raw.changed)?raw.changed.filter((v:any)=>safeKey(v?.contact)&&[v.orbBefore,v.orbNow].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=6)&&typeof v.applying==='boolean').slice(0,12).map((v:any)=>({contact:v.contact,labels:contactLabel(v.contact),orbBefore:v.orbBefore,orbNow:v.orbNow,applying:v.applying})):[];
  return [period,{entered,exited,changed,stable:!entered.length&&!exited.length&&!changed.length}];
 }));
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
 const system=`You are a cautious astrology interpretation assistant writing in ${input.language==='ar'?'natural Iraqi Arabic':'natural English'}. The application supplies computed symbolic transits, not scientific predictions, event probabilities, or a way to know another person's feelings. Respond with TWO short paragraphs, about 80-130 words total, in clear natural language. First paragraph: explain WHY NOW using the strongestSupporting and strongestChallenging contacts exactly as supplied; cite only those actual transit/natal labels, major angle, current orb and applying/separating state. If either factor is null, explicitly say its side of evidence is absent, never invent one. If both positive and challenging factors exist, explicitly call the reading mixed rather than claiming a guaranteed favorable or unfavorable outcome. If the comparison is stable, state that no meaningful new change was observed in the leading contacts; otherwise describe the provided changes without inventing signs, house positions, extra people or exact future peak dates. Second paragraph: provide one small realistic, reversible action fitting the actual context (love/relationships, communication, work decisions, rest/energy or timing), explain what observation would let the user evaluate it, and do not assume anyone's thoughts, desire or intentions. Never invent celestial data or claim 70%, 90%, 100% accuracy; do not confuse scores with calibrated probabilities. Avoid generic praise, mysticism presented as fact, illness diagnoses, financial predictions, manipulation, coercion or fear. Adapt the grammar of direct address to the user profile: ${grammaticalGender==='female'?'feminine Iraqi Arabic verb endings and pronouns':grammaticalGender==='male'?'masculine Iraqi Arabic verb endings and pronouns':'neutral gender-unspecified phrasing'}. Gender changes language only, not ephemerides or predicted behavior. If verified global eclipse dates are supplied, mention at most one exact supplied date and classification as background context, never as proof of destiny or local visibility. If none supplied, do not mention an eclipse. If supplemental named-asteroid contacts are supplied, they are verified calculations but only SECONDARY symbolic overlays. Mention at most two by name as non-predictive context. Never make unsupported claims from missing extended data. Do not expose chain-of-thought or think tags. /no_think`;
 const describe=(e:Factor|null)=>e?{transit:e.transit,natal:e.natal,transitLabel:label(e.transit),natalLabel:label(e.natal),angle:e.angle,orb:Number(e.orb.toFixed(3)),applying:e.applying,direction:e.direction}:null;
 const symbolicIndices=Object.fromEntries(Object.entries(indices).map(([k,v])=>[k,String(v)+'/100 (symbolic index, not a probability)']));
 const messages:Message[]=[{role:'system',content:system},{role:'user',content:JSON.stringify({calculatedAt,comparison,indices:symbolicIndices,strongestSupporting:describe(strongestSupporting),strongestChallenging:describe(strongestChallenging),evidence:evidence.map(describe),supplementalNamedAsteroids:extendedEvidence,verifiedUpcomingEclipses:eclipseEvents})+'\n/no_think'}];
 try{
  let result:any;
  if(status.provider==='gateway'){
   const upstream=new URL(env.QWEN_GATEWAY_URL!);if(upstream.protocol!=='https:')return json({error:'Gateway must use HTTPS.'},503);
   const response=await fetch(upstream,{method:'POST',headers:{'Content-Type':'application/json',...(env.QWEN_GATEWAY_TOKEN?{Authorization:`Bearer ${env.QWEN_GATEWAY_TOKEN}`}:{})},body:JSON.stringify({model:status.model,messages,temperature:.3,max_tokens:1200,stream:false}),signal:AbortSignal.timeout(50000)});
   if(!response.ok)return json({error:'Ai gateway did not complete the request.',code:'AI_UPSTREAM_ERROR'},502);
   result=await response.json();
  }else{
   result=await env.AI!.run(CF_MODEL,{messages,temperature:.3,max_tokens:1200,stream:false});
  }
  const raw=result?.choices?.[0]?.message?.content??result?.response;
  if(typeof raw!=='string')return json({error:'Ai returned no explanation. Please retry.',code:'AI_EMPTY_RESPONSE'},502);
  const checked=reviewGeneratedAdvice(raw,{language:input.language,support:describe(strongestSupporting),challenge:describe(strongestChallenging),events:eclipseEvents});
  if(!checked.text)return json({error:'Ai returned no explanation. Please retry.',code:'AI_EMPTY_RESPONSE'},502);
  return json({explanation:checked.text,model:status.model,provider:status.provider,quality:checked.fallback?'grounded-fallback':'reviewed-model'});
 }catch{return json({error:input.language==='ar'?'خدمة Ai على السيرفر غير متاحة حالياً. تحقق من تفعيل Workers AI وحصته بحساب Cloudflare، وجرّب مرة ثانية.':'Ai is unavailable. Check Workers AI activation and quota in Cloudflare, then retry.',code:'AI_UNAVAILABLE'},503)}
}
