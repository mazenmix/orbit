import type {SynastryEvidence,Category,Evidence} from './math.ts';

export type TwoLanguage={ar:string;en:string};
export type PlainReading={title:TwoLanguage;meaning:TwoLanguage;advice:TwoLanguage};
const planetThemes:Record<string,TwoLanguage>={
 Sun:{ar:'الهوية والقرار',en:'identity and decisions'},
 Moon:{ar:'الاحتياج العاطفي والراحة',en:'emotional needs and comfort'},
 Mercury:{ar:'التفكير وطريقة الحوار',en:'thinking and communication'},
 Venus:{ar:'المودة والذوق العاطفي',en:'affection and relationship values'},
 Mars:{ar:'المبادرة وحدود الاندفاع',en:'initiative and assertiveness'},
 Jupiter:{ar:'التفاؤل والتوسّع',en:'optimism and growth'},
 Saturn:{ar:'الالتزام والحدود',en:'commitment and boundaries'},
 Uranus:{ar:'الاستقلال والتغيير',en:'independence and change'},
 Neptune:{ar:'الخيال والتوقعات',en:'imagination and expectations'},
 Pluto:{ar:'العمق والتحولات',en:'depth and transformation'},
 Ascendant:{ar:'الانطباع الأول وطريقة التعامل',en:'first impressions and presence'},
 MC:{ar:'الأهداف والاتجاه المهني',en:'ambition and public direction'}
};
const aspects:Record<number,TwoLanguage>={
 60:{ar:'التسديس',en:'sextile'},
 120:{ar:'التثليث',en:'trine'},
 90:{ar:'التربيع',en:'square'},
 180:{ar:'المقابلة',en:'opposition'},
 0:{ar:'الاقتران',en:'conjunction'}
};
const pairTitle=(a:string,b:string):TwoLanguage=>{
 const ids=[a,b];
 const has=(...xs:string[])=>xs.every(x=>ids.includes(x));
 if(has('Venus','Mars'))return {ar:'المودة والمبادرة',en:'Affection & initiative'};
 if(has('Sun','Moon'))return {ar:'الشخصية والاحتياج العاطفي',en:'Identity & emotional needs'};
 if(has('Venus','Moon'))return {ar:'المشاعر وطريقة التعبير عن الحب',en:'Emotional comfort & affection'};
 if(has('Mercury','Mercury'))return {ar:'لغة الحوار بينكم',en:'Your communication styles'};
 if(ids.includes('Mercury'))return {ar:'التفاهم وطريقة الكلام',en:'Understanding & communication'};
 if(ids.includes('Saturn'))return {ar:'الالتزام والحدود',en:'Commitment & boundaries'};
 if(ids.includes('Pluto'))return {ar:'العمق ومساحة السيطرة',en:'Intensity & autonomy'};
 if(ids.includes('Neptune'))return {ar:'التوقعات والوضوح',en:'Expectations & clarity'};
 if(ids.includes('Uranus'))return {ar:'القرب والمساحة الشخصية',en:'Closeness & independence'};
 if(ids.includes('Venus'))return {ar:'المودة والقيم المشتركة',en:'Affection & values'};
 if(ids.includes('Moon'))return {ar:'الألفة والراحة',en:'Emotional ease'};
 if(ids.includes('Mars'))return {ar:'الحماس والاختلاف',en:'Drive & friction'};
 if(ids.includes('Jupiter'))return {ar:'التفاؤل والتجارب المشتركة',en:'Optimism & discovery'};
 return {ar:'أسلوب التعامل بينكم',en:'Your interaction styles'};
};
const adviceFor=(a:string,b:string,challenge:boolean):TwoLanguage=>{
 const ids=[a,b];
 if(ids.includes('Mercury'))return challenge?
  {ar:'جرّبوا توضحون المقصود بالكلام، واسألوا قبل تفسير النبرة أو السكوت.',en:'Clarify what was meant and ask before interpreting tone or silence.'}:
  {ar:'استفادوا من فرصة الحوار: احچوا عن موضوع يهمكم واسمعوا وجهتي النظر.',en:'Use this opening for a genuine conversation and listen to both viewpoints.'};
 if(ids.includes('Saturn'))return challenge?
  {ar:'اتفقوا على الحدود والالتزامات بوضوح، ولا تحوّلون التأخير إلى اتهام.',en:'Agree on boundaries and commitments; avoid treating delays as accusations.'}:
  {ar:'خلي الوعود صغيرة وواضحة وقابلة للتنفيذ حتى تبنون الثقة بالفعل.',en:'Make small, clear commitments and follow through to build trust.'};
 if(ids.includes('Pluto')||ids.includes('Mars'))return challenge?
  {ar:'من يصير خلاف، ابتعدوا عن شدّ الحبل والسيطرة وخلي الحوار بهدوء.',en:'When tension appears, avoid power struggles and talk calmly.'}:
  {ar:'إذا أكو اهتمام متبادل، بادروا بخطوة بسيطة بدون ضغط أو استعجال.',en:'If interest is mutual, take one simple step without pressure or rushing.'};
 if(ids.includes('Neptune'))return {ar:'اسألوا عن التوقعات بصراحة بدل الاعتماد على الإشارات الغامضة.',en:'Discuss expectations openly rather than assuming vague hints.'};
 if(ids.includes('Uranus'))return {ar:'خلّوا مساحة للاستقلال والاهتمامات الشخصية ويا القرب.',en:'Leave room for individual interests and independence alongside closeness.'};
 if(ids.includes('Moon'))return {ar:'اسألوا بعض شنو يساعدكم تحسون بالراحة والأمان، بدون افتراض.',en:'Ask each other what genuinely creates comfort instead of assuming.'};
 if(ids.includes('Venus'))return {ar:'احچوا عن الشي اللي كل واحد يعتبره اهتمام ومودة، واحترموا الاختلاف.',en:'Discuss how each person actually expresses care and respect differences.'};
 return {ar:'شوفوا التصرفات الحقيقية بمرور الوقت، وخلو الاتفاق والتفاهم أساس العلاقة.',en:'Observe real behavior over time and build on mutual understanding.'};
};
/** Classical synastry symbolism grounded in the two recorded planets and exact aspect type.
 * Never infer consent, hidden desires, or the reality of a relationship from a chart.
 */
export function synastryPlainReading(e:SynastryEvidence|undefined,kind:'harmony'|'challenge'):PlainReading{
 if(!e)return {
  title:kind==='harmony'?{ar:'ماكو زاوية انسجام قريبة',en:'No close harmony aspect'}:{ar:'ماكو زاوية تحدّي قريبة',en:'No close challenging aspect'},
  meaning:kind==='harmony'?{ar:'الحساب الحالي ما وجد تثليث أو تسديس قريب بين الخارطتين. هذا مو معناه ماكو انسجام بالحياة الواقعية.',en:'No close trine or sextile was calculated. That does not mean there is no real-life compatibility.'}:
   {ar:'الحساب الحالي ما وجد تربيع أو مقابلة قريبة. هذا مو ضمان لخلو العلاقة من المشاكل.',en:'No close square or opposition was calculated. This does not guarantee an absence of relationship challenges.'},
  advice:{ar:'خلّ تقييم العلاقة مبني على الحوار والاحترام والتجارب الفعلية.',en:'Assess the relationship through communication, respect and actual experience.'}
 };
 const bodies=new Set([e.first.id,e.second.id]);
 if(kind==='harmony'&&(e.angle===120||e.angle===60)&&bodies.has('Venus')&&bodies.has('Mars')){
  return {
   title:{ar:'المودة والمبادرة بينكم',en:'Affection meets initiative'},
   meaning:{ar:'اتصال الزهرة بالمريخ هنا يربط أسلوب التعبير عن الاهتمام عند واحد منكم بطريقة المبادرة عند الثاني. '+(e.angle===120?'التثليث':'التسديس')+' يُقرأ رمزياً كسهولة محتملة بالتقارب إذا الاهتمام متبادل فعلاً، مو كدليل أكيد على انجذاب الشخص الآخر.',
            en:'The Venus–Mars contact links how one person expresses affection with the other person’s initiative. '+(e.angle===120?'A trine':'A sextile')+' traditionally suggests smoother interaction if interest is genuinely mutual, not proof of anyone’s attraction.'},
   advice:{ar:'إذا الاهتمام متبادل والتواصل مريح للطرفين، جرّبوا خطوة بسيطة وواضحة وخلي المبادرة بدون ضغط.',
           en:'If communication feels good to both, try one clear, low-pressure next step.'}
  };
 }
 if(kind==='challenge'&&e.angle===90&&bodies.has('Sun')&&bodies.has('Neptune')){
  return {
   title:{ar:'الوضوح مقابل التوقعات',en:'Clarity versus expectations'},
   meaning:{ar:'هذا التربيع بين الشمس ونبتون يرمز لاحتمال اختلاف بين الصورة اللي يتخيلها كل واحد والواقع اللي يصير بينكم. مو اتهام بالكذب ولا دليل على نية مخفية، لكنه يلفت النظر لسوء الفهم إذا التوقعات ما تنحچي بصراحة.',
            en:'A challenging Sun–Neptune contact symbolically highlights a gap between imagined expectations and what each person actually communicates. It is not evidence of lies or hidden motives; unclear expectations may create misunderstandings.'},
   advice:{ar:'وضحوا التوقعات: شنو يريد كل واحد من التواصل؟ واعتمدوا على الكلام والأفعال الواضحة بدل التخمين.',
           en:'Say what each of you expects and rely on clear words and behavior rather than guesswork.'}
  };
 }
 const topic=pairTitle(e.first.id,e.second.id);
 const first=planetThemes[e.first.id]??{ar:'جانب من شخصية الأول',en:'one person\'s tendencies'};
 const second=planetThemes[e.second.id]??{ar:'جانب من شخصية الثاني',en:'the other person\'s tendencies'};
 const angle=aspects[e.angle]??{ar:'الاتصال',en:'aspect'};
 const challenge=kind==='challenge';
 const manner=challenge?
  (e.angle===180?{ar:'المقابلة تصوّر شدّاً بين احتياجين مختلفين، وتحتاج تفاهم بدل تنافس.',en:'The opposition symbolizes contrasting needs that call for understanding rather than competition.'}:
  {ar:'التربيع يرمز لاحتكاك أو اختلاف أسلوب، مو حكم بفشل العلاقة.',en:'The square suggests different approaches or friction, not relationship failure.'}):
  (e.angle===120?{ar:'التثليث يرمز لسهولة نسبية بتفاهم هالجانبين إذا أكو تواصل حقيقي.',en:'The trine symbolizes a potentially smoother interaction when there is real communication.'}:
  {ar:'التسديس يرمز لفرصة تعاون يمكن تستفادون منها بالمبادرة والتواصل.',en:'The sextile points to a symbolic opening for cooperation through initiative and communication.'});
 return {
  title:topic,
  meaning:{ar:'الاتصال يربط '+first.ar+' من خارطة بالـ'+second.ar+' من الخارطة الثانية. '+manner.ar,
           en:'This aspect links '+first.en+' in one chart with '+second.en+' in the other. '+manner.en},
  advice:adviceFor(e.first.id,e.second.id,challenge)
 };
}
const transitAreas:Record<Category,TwoLanguage>={
 overview:{ar:'طريقة ترتيب الأولويات',en:'setting priorities'},
 career:{ar:'الشغل والقرارات المهنية',en:'work and career decisions'},
 love:{ar:'التقارب والعلاقات',en:'connection and relationships'},
 communication:{ar:'الرسائل وطريقة التواصل',en:'messages and communication'},
 energy:{ar:'المبادرة وتوزيع الجهد',en:'initiative and pacing'},
 emotions:{ar:'الاستجابة العاطفية',en:'emotional responses'},
 recovery:{ar:'الراحة واستعادة التوازن',en:'rest and recuperation'},
 timing:{ar:'تنظيم الوقت والتوقيت',en:'planning and timing'}
};
const transitScenes:Record<Category,TwoLanguage>={
 overview:{ar:'مثلاً: قرر شنو تسوي اليوم بنفسك، وشنو يحتاج جواب أو موافقة من غيرك.',en:'For example, separate what you can decide today from what needs another person\'s input.'},
 career:{ar:'مثلاً: قبل ما تقبل مهمة، تأكد من المطلوب والموعد حتى ما تدخل بالتزام غامض.',en:'Before accepting work, clarify the scope and deadline.'},
 love:{ar:'مثلاً: رسالة اهتمام واضحة تنفع أكثر من قراءة كل تأخير بالرد كإشارة عاطفية.',en:'A clear expression of interest helps more than treating response delays as emotional signals.'},
 communication:{ar:'مثلاً: اسأل شنو المقصود من رسالة مبهمة قبل ما تجاوب على افتراض.',en:'Clarify an ambiguous message before responding to an assumption.'},
 energy:{ar:'مثلاً: ابدي جزء واحد من مهمة أو تمرين؛ لا تخلي الحماس يسحبك لالتزام أكبر.',en:'Start one manageable task or workout step instead of overcommitting.'},
 emotions:{ar:'مثلاً: إذا تضايقت من موقف، افصل الحدث عن القصة اللي رسمها بالك.',en:'If upset by a situation, separate the event from the story you constructed around it.'},
 recovery:{ar:'مثلاً: أخر التزام ثانوي حتى ترجع لإيقاع مريح، من دون شعور بالذنب.',en:'Defer one secondary commitment to make space for meaningful rest.'},
 timing:{ar:'مثلاً: خلي خطة بديلة لموعد يعتمد على ظروف أو رد شخص ثاني.',en:'Have an alternative plan for appointments dependent on someone else.'}
};
export function personalTransitPlainReading(e:Pick<Evidence,'transit'|'natal'|'angle'|'orb'|'applying'>|undefined,category:Category|undefined):PlainReading{
 if(!e||!category)return {title:{ar:'ماكو عبور شخصي مهيمن',en:'No dominant personal transit'},meaning:{ar:'ماكو اتصال مقترب قريب كافي حتى نحدد موضوع بارز لهاللحظة.',en:'No sufficiently close applying contact establishes a leading theme for this moment.'},advice:{ar:'لا تبني قرارك على مؤشر فلكي وحده.',en:'Do not base a decision on an astrological index alone.'}};
 const area=transitAreas[category],transit=planetThemes[e.transit.id]??{ar:'حركة الكوكب',en:'the transiting planet'},natal=planetThemes[e.natal.id]??{ar:'موضوع من خارطة الميلاد',en:'a natal theme'};
 const challenge=e.angle===90||e.angle===180;
 const link=e.angle===0?{ar:'الاقتران يركز الموضوعين بقوة، لكنه وحده مو فرصة ولا تهديد.',en:'A conjunction concentrates both themes, without making it inherently good or bad.'}:challenge?{ar:'زاوية شدّ تحتاج موازنة بين الاحتياجين بدل الاستعجال بالحكم.',en:'A challenging angle asks for balancing competing needs rather than rushing to a verdict.'}:{ar:'الزاوية تتيح مساحة تعاون رمزي، مو ضمان نجاح.',en:'The angle suggests symbolic cooperation, not guaranteed success.'};
 return {
  title:{ar:'عبور مرتبط بـ'+area.ar,en:'Transit involving '+area.en},
  meaning:{
   ar:'ضمن '+area.ar+'، اتصال '+transit.ar+' بـ'+natal.ar+' يلفت النظر رمزياً إلى طريقة تعاملك مع هالموضوع. '+link.ar+' '+(e.applying?'هذا الاتصال يقترب من الدقة.':'هذا الاتصال يبتعد عن الدقة.')+' '+transitScenes[category].ar,
   en:'Within '+area.en+', '+transit.en+' meets natal '+natal.en+' symbolically. '+link.en+' '+(e.applying?'The aspect is applying.':'The aspect is separating.')+' '+transitScenes[category].en
  },
  advice:{ar:'الوقت المعروض هو وقت رصد الحساب، مو موعد وقوع حدث. خلّ الوقائع وردّ الطرف الثاني يحددون الخطوة الجاية.',en:'The displayed time is the calculation timestamp, not a predicted event time. Let real circumstances and the other person\'s response guide the next step.'}
 };
}
