import {angles,clamp,distance,type Category,type Point} from './math.ts';
import type {Chart} from './engine.ts';

/** Ephemeris-derived sky-to-sky context. Scores are symbolic preferences, never event probabilities. */
export type SkyNote={id:string;arTitle:string;enTitle:string;arMeaning:string;enMeaning:string;categories:readonly Category[];strength:number;kind:'aspect'|'retrograde'|'moon-sign'};
export type SkyClimate={adjustments:Record<Category,number>;notes:SkyNote[]};
const keys:Category[]=['overview','career','love','communication','energy','emotions','recovery','timing'];
const names:Record<string,[string,string]>={
 Sun:['الشمس','Sun'],Moon:['القمر','Moon'],Mercury:['عطارد','Mercury'],Venus:['الزهرة','Venus'],
 Mars:['المريخ','Mars'],Jupiter:['المشتري','Jupiter'],Saturn:['زحل','Saturn'],Uranus:['أورانوس','Uranus'],
 Neptune:['نبتون','Neptune'],Pluto:['بلوتو','Pluto']
};
const aspects:Record<number,[string,string]>={
 0:['اقتران','conjunct'],60:['تسديس','sextile'],90:['تربيع','square'],120:['تثليث','trine'],180:['مقابلة','opposite']
};
const zodiac:readonly [string,string][]=[
 ['الحمل','Aries'],['الثور','Taurus'],['الجوزاء','Gemini'],['السرطان','Cancer'],
 ['الأسد','Leo'],['العذراء','Virgo'],['الميزان','Libra'],['العقرب','Scorpio'],
 ['القوس','Sagittarius'],['الجدي','Capricorn'],['الدلو','Aquarius'],['الحوت','Pisces']
];
const relevance:Record<string,Partial<Record<Category,number>>>={
 Sun:{overview:1,career:.6,energy:.5},Moon:{emotions:1,recovery:.85,love:.4},
 Mercury:{communication:1,love:.5,emotions:.4,career:.3},Venus:{love:1,emotions:.6,communication:.25},
 Mars:{energy:1,communication:.6,emotions:.8,love:.5,recovery:.35},
 Jupiter:{timing:.7,overview:.7,career:.4},Saturn:{career:.7,recovery:.8,emotions:.6,overview:.5},
 Uranus:{timing:1,communication:.4,emotions:.4},Neptune:{emotions:.8,love:.45,communication:.3},
 Pluto:{emotions:.9,love:.65,recovery:.4,overview:.4}
};
/** Full Moon-sign vocabulary: no repeated generic sentence for eleven signs. */
const moonSignMeanings:readonly {ar:string;en:string}[]=[
 {ar:'حماس ومبادرة سريعة، بس الاستعجال ممكن يخلي الرد أقسى من المقصود. اختار شنو يستحق المواجهة.',en:'More initiative and impatience; a quick reply may sound harsher than intended. Choose your battles.'},
 {ar:'حاجة للاستقرار والاطمئنان، ويّا احتمال التمسك بالرأي إذا أحد غيّر الخطة فجأة. وضّح احتياجك بهدوء.',en:'A preference for stability with possible stubbornness when plans change. State what you need calmly.'},
 {ar:'كثرة حچي وأسئلة وتبدّل سريع بالانتباه؛ احتمال الرسائل تنفهم على غير قصدها. ثبّت المعنى قبل الرد.',en:'Quick conversations, curiosity and shifting attention; messages may be misunderstood. Clarify the meaning first.'},
 {ar:'حساسية تجاه الأمان والاهتمام والأهل؛ كلمة عابرة ممكن تلمس موضوع قديم. اطلب الطمأنة بشكل واضح.',en:'Sensitivity around security, care and family; small remarks may revive old concerns. Ask clearly for reassurance.'},
 {ar:'الكبرياء والحساسية تجاه التجاهل أو طريقة الكلام. خَلّ التعبير واضح بدون افتراض إساءة.',en:'Pride and sensitivity to being ignored or to wording; communicate clearly without assuming offense.'},
 {ar:'التدقيق بالتفاصيل يزيد، ومعاه قابلية ملاحظة الأخطاء قبل المحاسن. قدّم الملاحظة بدون نقد شخصي.',en:'Greater focus on details and mistakes; give feedback without turning it into personal criticism.'},
 {ar:'رغبة بالهدوء والإنصاف، ويّا تردد أو انزعاج من عدم التوازن بالعلاقة. احچي عن التوقعات بصراحة.',en:'A stronger pull toward fairness and harmony, with hesitation over imbalanced relationships. Discuss expectations directly.'},
 {ar:'مشاعر عميقة وحذر بالثقة والحدود؛ ممكن السكوت ينفهم كرفض. اسأل قبل ما تفسّر النوايا.',en:'Intense feelings and sensitivity around trust or boundaries; silence may feel like rejection. Ask before assuming motives.'},
 {ar:'صراحة ورغبة بالحرية والتجربة؛ المزحة أو الكلام المباشر ممكن ينفهم جارح. انتبه للنبرة.',en:'Candor and a desire for freedom or exploration; blunt remarks may sound hurtful. Watch the tone.'},
 {ar:'تركيز على الواجب والمسؤولية، مع تحفظ بإظهار المشاعر. لا تخلّي الجدية تبين وكأنها برود.',en:'Focus on duty and responsibility with restrained feelings. Avoid letting seriousness look like indifference.'},
 {ar:'حاجة للمسافة والاستقلال والتفكير المختلف؛ التعلّق الزايد ممكن يسبب شد. احترم مساحة الطرفين.',en:'A stronger need for independence and unconventional thinking; excessive pressure may create friction. Respect space.'},
 {ar:'تعاطف وخيال وحساسية للنبرة والإيحاءات؛ فرّق بين اللي انحچى فعلاً واللي تخيّلته.',en:'Empathy, imagination and sensitivity to subtext; separate what was said from what you imagined.'}
];
const planetTopics:Record<string,[string,string]>={
 Sun:['الثقة والقرارات','confidence and decisions'],Moon:['المشاعر وردود الفعل','emotions and reactions'],
 Mercury:['الكلام وسوء الفهم','communication and interpretation'],Venus:['العلاقات والتقارب','relationships and affection'],
 Mars:['الاندفاع والمواجهة','impulse and confrontation'],Jupiter:['التوسع والمبالغة','growth and exaggeration'],
 Saturn:['الحدود والمسؤولية','boundaries and responsibility'],Uranus:['المفاجآت والاستقلال','surprises and independence'],
 Neptune:['الخيال والوضوح','imagination and clarity'],Pluto:['النفوذ والسيطرة','power and control']
};
const practicalStep:Record<string,[string,string]>={
 Mercury:['دقّق بالرسالة قبل الرد.','Clarify the message before responding.'],
 Moon:['تأكد شنو حسّيت وشنو صار فعلاً.','Distinguish feelings from what happened.'],
 Venus:['اسأل عن التوقعات بدون افتراض مشاعر الطرف الثاني.','Ask about expectations without assuming feelings.'],
 Mars:['أجّل الرد المتسرع وخفف نبرة المواجهة.','Slow down before reacting aggressively.'],
 Saturn:['وضّح الحدود والالتزام المطلوب.','Clarify boundaries and commitments.'],
 Uranus:['خلي مساحة للتغيير بدون قرار مفاجئ.','Allow room for change without impulsive decisions.'],
 Neptune:['تأكد من الوقائع قبل تفسير الإشارات.','Verify facts before reading into signals.'],
 Pluto:['احترم حدود الطرفين ولا تحوّل الموضوع لصراع سيطرة.','Respect boundaries and avoid power struggles.'],
 Jupiter:['راجع التفاصيل قبل الوعد الكبير.','Check details before overpromising.'],
 Sun:['عبّر عن رأيك بدون ما تعتبر الاختلاف إهانة.','Express your view without treating disagreement as an insult.']
};
const retroMeaning:Record<string,{ar:string;en:string;weight:Partial<Record<Category,number>>}>={
 Mercury:{ar:'مراجعة الكلام والرسائل والتفاهمات السابقة؛ تأكد من المعنى قبل اتخاذ موقف.',en:'Revisit messages and earlier agreements; verify meaning before reacting.',weight:{communication:-5,love:-2,emotions:-1}},
 Venus:{ar:'مراجعة العلاقات والحساسيات العاطفية وسوء فهم النوايا. لا تفترض شعور الطرف الثاني.',en:'Reconsider relationships, emotional sensitivities and assumed intentions; ask rather than presume.',weight:{love:-5,emotions:-2,communication:-1}},
 Mars:{ar:'مراجعة أسلوب المواجهة والطاقة والغضب؛ لا تعتبر التأخير فشلاً ولا تستعجل الحسم.',en:'Review confrontation, energy and frustration; do not confuse delay with failure.',weight:{energy:-3,emotions:-2}},
 Jupiter:{ar:'مراجعة الفرص والوعود والتوسع؛ تأكد أن التوقعات تناسب الواقع.',en:'Reassess opportunities, promises and expansion against the facts.',weight:{timing:-2,overview:-2}},
 Saturn:{ar:'إعادة تقييم المسؤوليات والحدود والتأجيلات؛ رتب الالتزامات قبل إضافة غيرها.',en:'Revisit responsibility, boundaries and delays; organize existing commitments.',weight:{recovery:-2,career:-2}},
 Uranus:{ar:'عودة أسئلة الحرية والتغيير المفاجئ؛ جرّب تعديلات قابلة للرجوع.',en:'Revisit independence and sudden changes; use reversible experiments.',weight:{timing:-2}},
 Neptune:{ar:'مراجعة التصورات والوعود الغامضة؛ فرّق بين الأمل والمعلومة المؤكدة.',en:'Reconsider unclear expectations and promises; separate hope from evidence.',weight:{emotions:-2,communication:-1}},
 Pluto:{ar:'مراجعة حدود النفوذ والسيطرة والتمسك القديم؛ اختار اللي تگدر تغيّره فعلاً.',en:'Review control, influence and old attachments; focus on what you can change.',weight:{emotions:-2,love:-1}}
};

const negativeNew=([90,180] as number[]);
const positiveNew=([60,120] as number[]);
const specialized=(a:string,b:string,angle:number):[string,string]|null=>{
 const pair=[a,b].sort().join(':');
 if(pair==='Mars:Mercury'&&angle===90)return [
  'كلام حاد، ردود دفاعية، وسرعة تحوّل النقاش إلى جدال. اسأل عن المقصود قبل الرد.',
  'Sharp words, defensive reactions and a tendency for discussions to escalate; clarify intent first.'
 ];
 if(pair==='Moon:Pluto'&&angle===180)return [
  'شدّ وجذب عاطفي وحساسية تجاه السيطرة والحدود. لا تحوّل اختلاف بسيط إلى معركة.',
  'Emotional push and pull, sensitivity around control and boundaries; avoid escalating disagreements.'
 ];
 return null;
};
function describe(a:string,b:string,angle:number):[string,string]{
 const special=specialized(a,b,angle);
 if(special)return special;
 // Each pair combines two real planetary topics with the actual aspect class.
 // This is a meaning template, not invented knowledge of anyone's intentions.
 const difficult=negativeNew.includes(angle),helpful=positiveNew.includes(angle);
 const [firstAr,firstEn]=planetTopics[a],[secondAr,secondEn]=planetTopics[b];
 const focus=a==='Mercury'||b==='Mercury'?'Mercury':a==='Moon'||b==='Moon'?'Moon':
  a==='Venus'||b==='Venus'?'Venus':a==='Mars'||b==='Mars'?'Mars':
  a==='Saturn'||b==='Saturn'?'Saturn':a==='Neptune'||b==='Neptune'?'Neptune':
  a==='Pluto'||b==='Pluto'?'Pluto':a==='Uranus'||b==='Uranus'?'Uranus':a;
 const [stepAr,stepEn]=practicalStep[focus];
 if(difficult)return [
  'شدّ بين '+firstAr+' و'+secondAr+'؛ '+(angle===90?'سرعة تضارب المواقف ممكن تصعّب التفاهم. ':'كل طرف ممكن يتمسك برأي مختلف. ')+stepAr,
  'Tension between '+firstEn+' and '+secondEn+'; '+(angle===90?'conflicting priorities may quickly strain communication. ':'opposing positions may be harder to reconcile. ')+stepEn
 ];
 if(helpful)return [
  'انسجام بين '+firstAr+' و'+secondAr+'؛ '+(angle===120?'سهولة أكبر بتنظيم هالموضوعين. ':'فرصة للتعاون وخطوة صغيرة عملية. ')+stepAr,
  'A supportive link between '+firstEn+' and '+secondEn+'; '+(angle===120?'these themes may feel easier to coordinate. ':'use a small opportunity to cooperate. ')+stepEn
 ];
 return [
  'تركيز قوي يجمع '+firstAr+' و'+secondAr+'؛ ممكن يصير الموضوع أوضح وأكثر إلحاحاً. '+stepAr,
  'A conjunction intensifies '+firstEn+' and '+secondEn+'; the combined themes may feel more prominent. '+stepEn
 ];
}
/** Current and progressed Moon use the same sign vocabulary but different source dates. */
export function moonSignExplanation(longitude:number,english=false):string{
 if(!Number.isFinite(longitude))return english?'Moon position unavailable.':'موقع القمر مو محسوب لهذا الوقت.';
 const index=Math.floor((((longitude%360)+360)%360)/30);
 return moonSignMeanings[index][english?'en':'ar'];
}
/** Birth-chart angles and six minor bodies are explanatory topics, NOT extra sky-climate weights. */
const natalTopics:Record<string,{topic:[string,string];step:[string,string]}>={
 Ascendant:{topic:['حضورك والانطباع الأول','first impressions and presence'],step:['خلّي أسلوبك واضح ومريح بدون مبالغة.','Keep your presentation clear and natural.']},
 MC:{topic:['الشغل والسمعة والمسؤولية','career, reputation and responsibility'],step:['حدد المطلوب بالشغل والموعد قبل الالتزام.','Clarify the work scope and deadline.']},
 Chiron:{topic:['حساسية التجارب القديمة وتعلّم التعامل وياها','sensitivity from past experience and growth'],step:['اختار ردّ هادئ وما تربط الحاضر تلقائياً بالماضي.','Respond to the present rather than assuming old patterns.']},
 Ceres:{topic:['العناية بالآخرين واحتياجاتك','caregiving and personal needs'],step:['حدد شنو تگدر تقدمه من دون ما تهمل نفسك.','Set caring boundaries without neglecting yourself.']},
 Pallas:{topic:['حلّ المشاكل والتخطيط','problem solving and strategy'],step:['قسم المشكلة لخطوتين واضحين قبل التنفيذ.','Break the problem into two clear steps.']},
 Juno:{topic:['الالتزام والإنصاف بالاتفاقات','commitment and fairness in agreements'],step:['اتفق على الحدود والمسؤوليات بالكلام الواضح.','Discuss commitments and boundaries directly.']},
 Vesta:{topic:['التركيز والالتزام بهدف محدد','focus and commitment to a task'],step:['احمِ وقتك لمهمة واحدة بدل التشتت.','Protect time for one priority.']},
 Pholus:{topic:['التفاصيل الصغيرة اللي تغيّر مسار القرار','small details with wider consequences'],step:['راجع أثر القرار الصغير قبل ما توسّع الخطوة.','Check the small decision before expanding it.']}
};
/** Shared interpretation of verified real contacts, without invented orbs or hidden sky data. */
export function skyAspectExplanation(first:string,second:string,angle:number,english=false):string{
 if(!(angle in aspects))return english?'No supported calculated aspect.':'ماكو زاوية محسوبة مدعومة لهذا الاتصال.';
 if(names[first]&&names[second]){
  // Two occurrences of the same planet refer to a transit-to-natal contact, not two distinct themes.
  if(first!==second)return describe(first,second,angle)[english?1:0];
  const role=planetTopics[first][english?1:0],step=practicalStep[first][english?1:0];
  if(angle===90||angle===180)return english?
   'A tension around '+role+' can make priorities compete. '+step:
   'شدّ حول '+role+'؛ ممكن تتزاحم الأولويات أو تصعب المرونة. '+step;
  if(angle===0)return english?'A strong focus on '+role+'. '+step:'تركيز قوي على '+role+'؛ انتبه لا تبالغ بالموضوع. '+step;
  return english?'A supportive link within '+role+'. '+step:'انسجام نسبي بموضوع '+role+'؛ استثمره بشي عملي. '+step;
 }
 const firstTopic=natalTopics[first]?.topic??planetTopics[first];
 const secondTopic=natalTopics[second]?.topic??planetTopics[second];
 if(!firstTopic||!secondTopic)return english?'The calculated contact has no supported interpretation for these objects.':'الاتصال محسوب، بس ماكو تفسير موثوق لهذني الجرمين؛ ما راح نخترع معنى.';
 const focus=natalTopics[first]??natalTopics[second];
 const action=(focus?.step??practicalStep[first]??practicalStep[second])[english?1:0];
 const one=firstTopic[english?1:0],two=secondTopic[english?1:0];
 if(angle===90||angle===180)return english?
  'Tension between '+one+' and '+two+'; competing priorities may be harder to reconcile. '+action:
  'شدّ بين '+one+' و'+two+'؛ ممكن تتعارض الأولويات أو يحتاج الموضوع توضيح. '+action;
 if(angle===0)return english?
  'These contacts concentrate attention on '+one+' and '+two+'. '+action:
  'تركيز يجمع '+one+' ويا '+two+'؛ ممكن يصير هالموضوع أكثر إلحاحاً. '+action;
 return english?
  'Cooperation between '+one+' and '+two+' may feel easier. '+action:
  'انسجام بين '+one+' و'+two+'؛ التنسيق بينهم أسهل رمزياً. '+action;
}
function aspectTone(a:string,b:string,angle:number){
 if(negativeNew.includes(angle))return -1;
 if(positiveNew.includes(angle))return 1;
 if(a==='Jupiter'||b==='Jupiter'||(a==='Venus'&&b==='Moon')||(b==='Venus'&&a==='Moon'))return .45;
 return 0;
}
export function skyClimate(current:Pick<Chart,'points'>):SkyClimate{
 const byId=new Map<string,Point>();
 for(const p of current.points){
  if(names[p.id]&&Number.isFinite(p.longitude)&&Number.isFinite(p.speed))byId.set(p.id,p);
 }
 if(byId.size<8)throw Error('Insufficient sky bodies for atmosphere calculation');
 const bodies=[...byId.values()],notes:SkyNote[]=[];
 const weights=Object.fromEntries(keys.map(k=>[k,[] as number[]])) as Record<Category,number[]>;
 for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
  const one=bodies[i],two=bodies[j],separation=distance(one.longitude,two.longitude);
  const angle=angles.reduce<number>((best,candidate)=>Math.abs(separation-candidate)<Math.abs(separation-best)?candidate:best,0);
  const orb=Math.abs(separation-angle),hasMoon=one.id==='Moon'||two.id==='Moon';
  const maxOrb=hasMoon?7:5;
  if(orb>maxOrb)continue;
  const closeness=Math.max(0,1-orb/(maxOrb+1));
  const valence=aspectTone(one.id,two.id,angle);
  const extent=closeness*9*valence;
  const relevant:Category[]=[];
  for(const key of keys){
   const intensity=Math.min(1.2,(relevance[one.id][key]??0)+(relevance[two.id][key]??0));
   if(intensity>=.35)relevant.push(key);
   if(valence!==0&&intensity>0)weights[key].push(extent*intensity);
  }
  const words=describe(one.id,two.id,angle);
  const priority=specialized(one.id,two.id,angle)?2:1;
  notes.push({id:'aspect:'+one.id+':'+two.id+':'+angle,
   arTitle:names[one.id][0]+' '+aspects[angle][0]+' '+names[two.id][0],
   enTitle:names[one.id][1]+' '+aspects[angle][1]+' '+names[two.id][1],
   arMeaning:words[0],enMeaning:words[1],categories:relevant,
   strength:closeness*priority,kind:'aspect'});
 }
 // All genuinely retrograde planets receive planet-specific explanations and weights.
 for(const id of Object.keys(retroMeaning)){
  const p=byId.get(id);
  if(!p||p.speed>=-1e-7)continue;
  const sign=zodiac[Math.floor(((p.longitude%360)+360)%360/30)];
  const arSign=sign[0].startsWith('ال')?sign[0].slice(2):sign[0];
  const meaning=retroMeaning[id],isVenus=id==='Venus';
  const relevant=Object.keys(meaning.weight) as Category[];
  notes.push({id:'retro:'+id,arTitle:names[id][0]+' متراجع'+(isVenus?'ة':'')+' بال'+arSign,
   enTitle:names[id][1]+' retrograde in '+sign[1],
   arMeaning:meaning.ar,enMeaning:meaning.en,categories:relevant,
   strength:id==='Venus'?1.85:id==='Mercury'?1.6:1.0,kind:'retrograde'});
  for(const key of relevant)weights[key].push(meaning.weight[key]??0);
 }
 const moon=byId.get('Moon');
 if(moon){
  const sign=zodiac[Math.floor(((moon.longitude%360)+360)%360/30)];
  const arSign=sign[0].startsWith('ال')?sign[0].slice(2):sign[0];
  const signIndex=Math.floor(((moon.longitude%360)+360)%360/30);
  const meaning=moonSignMeanings[signIndex];
  notes.push({id:'moon:sign',arTitle:'القمر بال'+arSign,enTitle:'Moon in '+sign[1],
   arMeaning:meaning.ar,enMeaning:meaning.en,
   categories:['emotions','love','recovery'],strength:1.7,kind:'moon-sign'});
 }
 const adjustments=Object.fromEntries(keys.map(key=>{
  const strongest=[...weights[key]].sort((a,b)=>Math.abs(b)-Math.abs(a)).slice(0,4);
  const raw=strongest.reduce((total,n)=>total+n,0);
  return [key,Math.max(-16,Math.min(16,Math.round(raw)))];
 })) as Record<Category,number>;
 notes.sort((a,b)=>b.strength-a.strength||a.id.localeCompare(b.id));
 return {adjustments,notes};
}
