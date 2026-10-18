import {soulTopics} from '../../src/soulData.ts';
import {getSoulTheme} from '../../src/soulThemes.ts';
import {soulDeepFor} from '../../src/soulDeep.ts';
import {detectInventedNatalText} from '../../src/soulGrounding.ts';
type Env={AI?:{run:(model:string,arg:any)=>Promise<any>}};
const respond=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const valid=new Set(['Sun','Moon','Ascendant','MC','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','Ceres','Pallas','Juno','Vesta','Pholus']);
export async function onRequestPost({request,env}:{request:Request;env:Env}){
 const url=new URL(request.url);
 if(request.headers.get('origin')!==url.origin)return respond({error:'Same origin only'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return respond({error:'JSON required'},415);
 if(!env.AI)return respond({error:'Qwen3 unavailable'},503);
 let input:any;try{
  const raw=await request.text();if(raw.length>6000)return respond({error:'Request too large'},413);
  input=JSON.parse(raw);
 }catch{return respond({error:'Invalid JSON'},400)}
 if(!['ar','en'].includes(input?.language)||!Number.isInteger(input?.topicId)||input.topicId<1||input.topicId>200)return respond({error:'Unknown topic'},400);
 const basis=input.evidence;
 if(!Array.isArray(basis)||basis.length<1||basis.length>3)return respond({error:'Invalid evidence'},400);
 for(const p of basis){
  if(!valid.has(p?.planet)||!Number.isFinite(p.longitude)||p.longitude<0||p.longitude>=360||p.sign!==Math.floor(p.longitude/30)||p.house!==null&&(!Number.isInteger(p.house)||p.house<1||p.house>12)||typeof p.retrograde!=='boolean')return respond({error:'Invalid natal placement'},400);
  if(p.angle!==null&&p.angle!==undefined&&(!valid.has(p.angle.planet)||![0,60,90,120,180].includes(p.angle.type)||!Number.isFinite(p.angle.orb)||p.angle.orb<0||p.angle.orb>3))return respond({error:'Invalid natal angle'},400);
 }
 if(new Set(basis.map((x:any)=>x.planet)).size!==basis.length)return respond({error:'Duplicate planets'},400);
 const selected=soulTopics[input.topicId-1],theme=getSoulTheme(selected.id),depth=soulDeepFor(selected.id),ar=input.language==='ar';
 const system='Act as an astrology interpretation editor in '+(ar?'natural Iraqi Arabic':'clear English')+'. Use ONLY provided validated natal placements and aspects. Zodiac positions are supplied from client Swiss Ephemeris: NEVER invent a new planet, aspect, sign, degree, house or person. The goal is thoughtful symbolic self-reflection, not a clinical psychological diagnosis, validated personality fact, secret desire, future certainty or statistical probability. Return ONLY valid JSON containing summary (string), detailedAnalysis (string), strengths (array of 2 strings), challenges (array of 2 strings), practicalInsights (array of 2 strings), reflectionQuestions (array of 1 string). Write about the UNIQUE topic-specific editorial angle and concrete real-life counterexample provided. Do not repeat the same sentence or advice across summary, detailed analysis, strengths, challenges and practical insights. Avoid generic horoscope filler such as everyone wants love, trust and growth. Avoid mathematical degree tables in reader-facing prose; computed evidence stays separate. If any placement does not appear in the computedNatalEvidence, DO NOT mention that planet, sign or house at all. Do not invent a precise degree. Specific to the topic. No markdown or think tags. /no_think';
 const message=JSON.stringify({topic:ar?selected.ar:selected.en,uniqueEditorialAngle:ar?theme.focusAr:theme.focusEn,realLifeCounterExample:ar?depth.ar:depth.en,nonRepeatedPracticalAction:ar?theme.actionAr:theme.actionEn,computedNatalEvidence:basis})+'\n/no_think';
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
   if(begin<0||end<begin)return respond({error:'Unstructured Qwen3 response',code:'MODEL_NON_JSON',diagnostic:{responseKind:typeof responseValue,rawLength:raw.length}},502);
   try{parsed=JSON.parse(raw.slice(begin,end+1))}catch{return respond({error:'Invalid Qwen3 JSON',code:'MODEL_INVALID_JSON'},502)}
  }
  const validText=(x:unknown,min=3,max=900)=>typeof x==='string'&&x.trim().length>=min&&x.length<=max;
  const validList=(v:unknown)=>Array.isArray(v)&&v.length>=1&&v.length<=3&&v.every(x=>validText(x,3,250));
  if(!validText(parsed.summary,8,400)||!validText(parsed.detailedAnalysis,20,950)||!validList(parsed.strengths)||!validList(parsed.challenges)||!validList(parsed.practicalInsights)||!validList(parsed.reflectionQuestions))return respond({error:'Incomplete Qwen3 interpretation'},502);
  const all=[parsed.summary,parsed.detailedAnalysis,...parsed.strengths,...parsed.challenges,...parsed.practicalInsights,...parsed.reflectionQuestions];
  const normalize=(x:string)=>x.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,'');
  if(new Set(all.map(normalize)).size!==all.length)return respond({error:'Qwen3 repeated the same passage'},502);
  const sections=[parsed.summary,parsed.detailedAnalysis,...parsed.strengths,...parsed.challenges,...parsed.practicalInsights,...parsed.reflectionQuestions];
  const errors=detectInventedNatalText(sections,basis);
  if(errors.length){
   const prepared=ar?{
    summary:theme.focusAr,
    detailedAnalysis:depth.ar+' فلكياً عندنا فقط '+basis.map((b:any)=>b.planet+' في البرج '+b.sign+(b.house?' والبيت '+b.house:'')).join('، ')+'. هاي مو حقائق عن شخصية الشخص، وأي دلالة تحتاج تحقق من السلوك الحقيقي.',
    strengths:['توضيح السؤال الحقيقي في هذا المجال','مقارنة تجربة واقعية بدل الاعتماد على توقع'],
    challenges:['تجنب افتراض أفكار أو دوافع الآخرين','لا تعامل رمز الخارطة كدليل على سلوك قطعي'],
    practicalInsights:[theme.actionAr,'اختبر الفكرة بموقف صغير قابل للمراجعة قبل اتخاذ قرار كبير'],
    reflectionQuestions:['شنو موقف حقيقي يدعم أو يخالف هذا التفسير؟']
   }:{
    summary:theme.focusEn,
    detailedAnalysis:depth.en+' Only these natal indicators were provided: '+basis.map((b:any)=>b.planet+' in sign '+b.sign+(b.house?' and house '+b.house:'')).join(', ')+'. These symbols are not proven psychological facts.',
    strengths:['Framing a clearer question about this theme','Checking real experiences instead of assuming a hidden trait'],
    challenges:['Assuming access to another person’s private motives','Confusing symbolic placements with factual behavior'],
    practicalInsights:[theme.actionEn,'Test the idea with a small reversible step before any major decision'],
    reflectionQuestions:['What actual experience supports or challenges this interpretation?']
   };
   return respond({topicId:selected.id,...prepared,astrologicalEvidence:basis,provider:'qwen3',quality:'verified-editorial-fallback'});
  }
  return respond({topicId:selected.id,summary:parsed.summary,detailedAnalysis:parsed.detailedAnalysis,strengths:parsed.strengths,challenges:parsed.challenges,practicalInsights:parsed.practicalInsights,reflectionQuestions:parsed.reflectionQuestions,astrologicalEvidence:basis,provider:'qwen3',quality:'source-grounded-model'});
 }catch{return respond({error:'Qwen3 service currently unavailable'},503)}
}
