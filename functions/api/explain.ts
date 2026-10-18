type Message={role:'system'|'user';content:string};
type AIInput={messages:Message[];temperature:number;max_tokens:number;stream:false};
type Env={AI?:{run:(model:string,input:AIInput)=>Promise<unknown>};QWEN_GATEWAY_URL?:string;QWEN_GATEWAY_TOKEN?:string;QWEN_MODEL?:string};
type Context={request:Request;env:Env};
const CF_MODEL='@cf/qwen/qwen3-30b-a3b-fp8';
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const connection=(env:Env)=>env.QWEN_GATEWAY_URL?{configured:true,provider:'gateway',model:env.QWEN_MODEL??'qwen3'}:env.AI?{configured:true,provider:'cloudflare',model:CF_MODEL}:{configured:false,provider:'none',model:CF_MODEL};
const bodies=new Set(['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','Ceres','Pallas','Juno','Vesta','Pholus','Ascendant','MC']);
const categories=['overview','career','love','communication','energy','emotions','recovery','timing'];
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
 const evidence:unknown[]=[];
 for(const e of input.evidence){
  if(!e||!bodies.has(e.transit)||!bodies.has(e.natal)||![0,60,90,120,180].includes(e.angle)||typeof e.orb!=='number'||!Number.isFinite(e.orb)||e.orb<0||e.orb>6||typeof e.weight!=='number'||!Number.isFinite(e.weight)||e.weight<0||e.weight>1||typeof e.applying!=='boolean')return json({error:'Invalid numeric evidence.'},400);
  evidence.push({transit:e.transit,natal:e.natal,angle:e.angle,orb:e.orb,applying:e.applying,weight:e.weight});
 }
 const indices:Record<string,number>={};
 for(const c of categories){const v=input.indices?.[c];if(typeof v==='number'&&Number.isFinite(v)&&v>=1&&v<=99)indices[c]=v}
 const system=`You explain calculated astrological evidence in ${input.language==='ar'?'natural Iraqi Arabic, using short clear sentences':'English'}. Explain the strongest supporting factor and strongest counter-factor, then one small reversible practical action. Use only the supplied evidence and symbolic indices. Never change calculations or invent contacts. Indices out of 100 are not measured probabilities, scientific predictions, or guarantees. Never infer another person's private feelings, consent or intentions. If no evidence exists, say there is insufficient evidence. Do not expose internal reasoning or output think tags. Do not include private profile details. /no_think`;
 const messages:Message[]=[{role:'system',content:system},{role:'user',content:JSON.stringify({indices,evidence})+'\n/no_think'}];
 try{
  let result:any;
  if(status.provider==='gateway'){
   const upstream=new URL(env.QWEN_GATEWAY_URL!);if(upstream.protocol!=='https:')return json({error:'Gateway must use HTTPS.'},503);
   const response=await fetch(upstream,{method:'POST',headers:{'Content-Type':'application/json',...(env.QWEN_GATEWAY_TOKEN?{Authorization:`Bearer ${env.QWEN_GATEWAY_TOKEN}`}:{})},body:JSON.stringify({model:status.model,messages,temperature:.3,max_tokens:1200,stream:false}),signal:AbortSignal.timeout(50000)});
   if(!response.ok)return json({error:'Qwen3 gateway did not complete the request.',code:'AI_UPSTREAM_ERROR'},502);
   result=await response.json();
  }else{
   result=await env.AI!.run(CF_MODEL,{messages,temperature:.3,max_tokens:1200,stream:false});
  }
  const raw=result?.choices?.[0]?.message?.content??result?.response;
  if(typeof raw!=='string')return json({error:'Qwen3 returned no explanation. Please retry.',code:'AI_EMPTY_RESPONSE'},502);
  const explanation=raw.replace(/<think>[\s\S]*?<\/think>/gi,'').replace(/<think>[\s\S]*$/gi,'').replace(/<\/?think>/gi,'').trim().slice(0,12000);
  if(!explanation)return json({error:'Qwen3 returned no explanation. Please retry.',code:'AI_EMPTY_RESPONSE'},502);
  return json({explanation,model:status.model,provider:status.provider});
 }catch{return json({error:input.language==='ar'?'خدمة Qwen3 على السيرفر غير متاحة حالياً. تحقق من تفعيل Workers AI وحصته بحساب Cloudflare، وجرّب مرة ثانية.':'Qwen3 is unavailable. Check Workers AI activation and quota in Cloudflare, then retry.',code:'AI_UNAVAILABLE'},503)}
}
