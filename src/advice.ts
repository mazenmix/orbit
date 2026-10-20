import type {Signal,Evidence,Category} from './math.ts';
import {rankedFactors} from './math.ts';
import {reviewSignal} from './decision.ts';
type Pair=[string,string];
type Guide={title:Pair;good:Pair;careful:Pair;do:Pair;ease:Pair};
const guides:Record<Category,Guide>={
overview:{title:['خلّص المهم وخلي الباقي ينتظر','Finish what matters; let the rest wait'],good:['إنجاز شي مأجّله وفتح مساحة براسك.','Finish something pending and clear some mental space.'],careful:['توزيع نفسك على أكثر من موضوع يضيّع الأولوية.','Too many competing tasks can obscure your priority.'],do:['اختَر شغلة معلّقة وأنهِ الجزء اللي بإيدك منها.','Pick one pending task and finish the part you control.'],ease:['راجع اللي خلصته قبل ما تضيف التزام جديد.','Review what you finished before adding a new commitment.']},
career:{title:['رتّب طلبك قبل ما تحسم','Make your request clear before deciding'],good:['عرض شغلك بوضوح وطلب جواب محدد.','Present your work clearly and ask for a specific answer.'],careful:['وعد أكبر من وقتك أو موافقة والتفاصيل ناقصة.','Overpromising or agreeing before the details are clear.'],do:['اكتب المطلوب والموعد ومنو مسؤول؛ بعدها ناقش الاتفاق.','Write down the deliverable, deadline and owner before discussing agreement.'],ease:['ثبّت الاتفاق الموجود وتابع نقطة التنفيذ المتأخرة.','Confirm the existing agreement and follow up on the delayed step.']},
love:{title:['قرّب المسافة بكلام واضح','Close the distance with clear words'],good:['مبادرة لطيفة تفتح مجال لحوار بدون ضغط.','A thoughtful gesture can make room for an unpressured conversation.'],careful:['العتاب المبطّن أو تفسير تأخير الرد على كيفك.','Indirect blame or reading intentions into a delayed reply.'],do:['گول شنو تحتاج بصراحة، وخلي للطرف الثاني مجال يجاوب.','Say what you need clearly and give the other person room to respond.'],ease:['ارجع لنقطة اتفقتوا عليها؛ لا تعيد فتح كل الخلافات.','Return to one point of agreement instead of reopening every disagreement.']},
communication:{title:['وصل فكرتك بدون لف ودوران','Get your point across plainly'],good:['سؤال مباشر يختصر سوء الفهم.','A direct question can clear up a misunderstanding.'],careful:['الاستعجال بالرد قبل ما تفهم المقصود.','Replying quickly before understanding what was meant.'],do:['اكتب رسالتك بطلب واحد واضح، واقرأها قبل الإرسال.','Write one clear request and reread it before sending.'],ease:['وضّح جملة انفهِمت غلط بدل ما تطوّل النقاش.','Clarify one misunderstood sentence instead of extending the argument.']},
energy:{title:['حط جهدك بمكان يستاهل','Put your effort where it counts'],good:['بداية عملية لشي ظلّ على قائمة الانتظار.','Make a practical start on something that has been waiting.'],careful:['الحماس الزايد يخلّيك تحمل نفسك أكثر من اللازم.','Overenthusiasm can lead you to take on too much.'],do:['ابدأ بالجزء الأصعب من مهمة وحدة، وبعدين قيّم طاقتك.','Start the hardest part of one task, then check your energy.'],ease:['أكمل اللي بديته وخفّف إضافة مهام جديدة.','Finish what you started and limit new tasks.']},
emotions:{title:['افهم شعورك قبل ما تتصرف','Understand your feeling before acting'],good:['تسمية الشي المزعج بدل حمله طول اليوم.','Name what is bothering you rather than carrying it all day.'],careful:['تحويل إحساس مؤقت إلى حكم على نفسك أو غيرك.','Turning a passing feeling into a judgment about yourself or others.'],do:['اكتب شنو صار فعلاً وشنو فسّرته إنت؛ افصل الاثنين.','Write what happened and what you inferred; keep them separate.'],ease:['راجع رد فعلك بهدوء، وعدّل موقفك إذا ظهرت معلومة جديدة.','Review your response calmly and adjust if new information appears.']},
recovery:{title:['خفّف الحمل حتى ترجع بتركيز','Reduce the load to regain focus'],good:['ترك مساحة بين الالتزامات حتى تلملم نفسك.','Leave room between commitments to regroup.'],careful:['تملأ كل فراغ بشغل وتتعامل ويا الراحة كأنها تقصير.','Filling every gap with work and treating rest as failure.'],do:['شيل مهمة مو ضرورية من جدولك واحجز مكانها استراحة.','Remove one nonessential task and reserve that time for a break.'],ease:['ارجع لروتينك بالتدريج؛ مو لازم تعوّض كلشي دفعة وحدة.','Return to your routine gradually rather than catching up all at once.']},
timing:{title:['خلّي خطوتك قابلة للتعديل','Keep your next step adjustable'],good:['تجربة محدودة تعطيك جواب قبل الالتزام الكامل.','A limited trial can answer a question before full commitment.'],careful:['ربط كل خططك بموعد واحد أو جواب بعده مو مؤكد.','Basing every plan on one deadline or an unconfirmed answer.'],do:['جرّب أصغر نسخة من خطتك وحدد شنو يخليك تكمل أو توقف.','Try the smallest version of your plan and define when to continue or stop.'],ease:['قيّم نتيجة المحاولة السابقة قبل ما تعيدها بنفس الطريقة.','Assess the last attempt before repeating it unchanged.']}
};
/** Editorial layer shared by Today, Signals, Time Machine and evidence cards.
 * The calculated aspect chooses a symbolic focus; situations are examples,
 * never claims that an event or emotion actually occurred. */
const livedScenes:Record<Category,Pair>={
 overview:['مثلاً: عندك أكثر من شغلة تنتظر جواب؟ افصل القرار اللي بإيدك عن الشي اللي يتوقف على غيرك.','For example: separate the decision you control from the one awaiting someone else.'],
 career:['مثلاً: قبل اجتماع أو موافقة على مشروع، اطلب النتيجة المطلوبة والموعد ومنو صاحب القرار.','Before a meeting or project approval, clarify the deliverable, deadline and decision owner.'],
 love:['مثلاً: إذا تريد تقرب من شخص، رسالة صريحة وخفيفة أنفع من اختبار غيرته أو تفسير سكوته.','If you want to connect, a clear gentle invitation beats testing jealousy or interpreting silence.'],
 communication:['مثلاً: إذا وصلتك رسالة مبهمة، اسأل عن المقصود قبل ما ترد على معنى يمكن ما كان مقصود.','If a message is vague, clarify it before reacting to a meaning nobody intended.'],
 energy:['مثلاً: عندك مشروع متأخر أو تمرين صعب؟ حدد خطوة يمكن تكمّلها اليوم بلا استنزاف.','With a delayed task or demanding workout, pick one sustainable step today.'],
 emotions:['مثلاً: إذا ضايقك موقف أو تأخر رد شخص، ميّز بين الشي اللي صار وبين التفسير اللي دار ببالك.','If a situation or late reply bothers you, separate what happened from your interpretation.'],
 recovery:['مثلاً: إذا جدولك مزدحم، احجز فسحة راحة حقيقية بدل ما تنتظر يخلص كل الشغل.','If your schedule is packed, protect an actual rest window rather than waiting for work to end.'],
 timing:['مثلاً: قبل موعد أو قرار، جهز بديل بسيط إذا تأخر الرد أو تغيرت الظروف.','Before an appointment or decision, prepare one small alternative if circumstances change.']
};
const planetMeaning:Record<string,Pair>={
 Sun:['إثبات الذات والاختيار','identity and personal choice'],
 Moon:['الراحة والانفعال','comfort and emotional response'],
 Mercury:['الأفكار والكلام','thinking and communication'],
 Venus:['المودة والقيمة والانجذاب','affection, values and attraction'],
 Mars:['المبادرة والاحتكاك','initiative and friction'],
 Jupiter:['التوسع والمبالغة بالوعود','expansion and overpromising'],
 Saturn:['المسؤولية والحدود','responsibility and boundaries'],
 Uranus:['التغيير والاستقلال','change and independence'],
 Neptune:['التوقعات والخيال والوضوح','expectations, imagination and clarity'],
 Pluto:['العمق والسيطرة والتغيير البطيء','intensity, power and gradual change'],
 Ascendant:['الانطباع الأول','first impressions'],
 MC:['المسار المهني','career direction']
};
const angleStory:Record<number,Pair>={
 0:['يتجمع الموضوعان بنقطة وحدة؛ راقب شنو صار ياخذ اهتمام أكثر من حجمه.','Both themes gather in one place; notice what demands disproportionate attention.'],
 60:['أكو مجال لتعاون هادئ بين الموضوعين إذا بادرت بخطوة صغيرة.','The themes suggest a possible opening for a modest cooperative step.'],
 90:['أكو شدّ رمزي بين احتياجين؛ مو لازم تحسم واحد وتلغي الثاني.','The themes suggest friction between needs; neither has to cancel the other.'],
 120:['الجمع بين الموضوعين يبدو أسهل رمزياً، لكن النتيجة تعتمد على تصرفاتك والواقع.','The themes symbolically flow more easily, but outcomes still depend on real actions.'],
 180:['ممكن تشوف احتياجين على طرفين مختلفين؛ ناقش التوازن بدل ردّة الفعل.','Two opposing needs are highlighted; look for balance instead of reflex.']
};
const direction=(e:Evidence)=>[60,120].includes(e.angle)||(e.angle===0&&['Venus','Jupiter'].includes(e.transit.id))?1:[90,180].includes(e.angle)||(e.angle===0&&['Saturn','Mars','Pluto','Uranus'].includes(e.transit.id))?-1:0;
export function advice(s:Signal,language:'ar'|'en'){
 const pick=(v:Pair)=>v[language==='ar'?0:1],g=guides[s.category];
 const ranked=rankedFactors(s.allFactors??s.factors),review=reviewSignal(s);
 const positive=ranked.find(e=>direction(e)>0),negative=ranked.find(e=>direction(e)<0),lead=ranked[0];
 if(!lead||lead.weight<.30)return {title:pick(['ماكو أساس كافي لترجيح هالمجال','Insufficient evidence for a direction']),good:pick(['ما نثبت فرصة من عوامل غائبة أو ضعيفة.','Absent or weak factors do not establish an opportunity.']),careful:pick(g.careful),action:pick(g.ease)};
 let title=g.title,good=g.good,careful=g.careful,action=lead.applying?g.do:g.ease;
 if(['career','timing','overview'].includes(s.category)&&negative?.transit.id==='Saturn'){
 title=['لا توعد قبل ما تتأكد','Check before you promise'];careful=['التزام ناقص التفاصيل ممكن يرجع عليك بشغل إضافي.','An unclear commitment can create extra work.'];action=negative.applying?['اسأل عن الشرط الناقص وثبّت حدود مسؤوليتك قبل الموافقة.','Ask about the missing condition and clarify your responsibility before agreeing.']:['راجع التزام قديم وحدد شنو بقى عليك وشنو يحتاج تفاوض.','Review an existing commitment and identify what remains or needs renegotiation.'];
 }
 if(['communication','career'].includes(s.category)&&(negative?.transit.id==='Neptune'||negative?.natal.id==='Mercury')){
 title=['تأكد من المقصود قبل الرد','Check what was meant before replying'];careful=['كلام مبهم أو افتراض صغير ممكن يكبّر سوء الفهم.','Vague wording or a small assumption can deepen misunderstanding.'];action=['اسأل: «تقصد كذا؟» وخذ جواب واضح قبل ما تبني عليه.','Ask “Do you mean this?” and get a clear answer before acting on it.'];
 }
 if(['love','emotions'].includes(s.category)&&positive?.transit.id==='Venus'){title=['خلّي الاهتمام يبين بتصرف','Show care through an action'];good=['لفتة بسيطة أو تقدير صريح يفتح باب للتقارب.','A small gesture or sincere appreciation can invite connection.'];action=['عبّر عن شي محدد تقدّره، بدون اختبار مشاعر الطرف الثاني.','Name something specific you appreciate without testing the other person’s feelings.'];}
 if(positive?.transit.id==='Mars'&&['energy','overview'].includes(s.category)){title=['ابدأ بالشي اللي ظلّ معلّق','Start what has been on hold'];good=['توجيه حماسك لإنجاز ملموس بدل نقاش طويل.','Channel enthusiasm into a tangible result rather than a long debate.'];action=positive.applying?['افتح المهمة المؤجلة وأنجز أول جزء واضح منها.','Open the postponed task and complete its first clear step.']:['كمّل الخطوة اللي بديتها، وراجع النتيجة قبل التوسع.','Finish the step you started and check the result before expanding.'];}
 if(!negative)careful=g.careful;
 if(review.contradictory){
  title=[g.title[0]+' · إشارات متعارضة',g.title[1]+' · mixed contacts'];
  good=[g.good[0]+' يوجد جانب رمزي داعم، ويقابله عامل يحتاج انتباه.',g.good[1]+' A supporting symbolic contact coexists with a challenging factor.'];
  careful=review.sensitive?['الترجيح يتبدل باستبعاد اتصالات جرم واحد؛ لا تحوّله لحكم نهائي.','Removing one transiting body changes the balance; do not treat the direction as settled.']:[g.careful[0]+' لا تتجاهل الجانب المعاكس.',g.careful[1]+' Keep the counter-evidence in view.'];
  action=[g.do[0]+' جرّب خطوة محدودة وراجع النتيجة قبل التوسع.',g.do[1]+' Keep the first step small and review the result before expanding.'];
 }
 // Explain the meaning of the actual leading transit before offering an example.
 // Avoid saying that the interpretation proves the user's mood, another person's interest, or a future event.
 const transitRole=planetMeaning[lead.transit.id]??[lead.transit.id,lead.transit.id];
 const natalRole=planetMeaning[lead.natal.id]??[lead.natal.id,lead.natal.id];
 const angleRole=angleStory[lead.angle]??['هذا اتصال محسوب بين دلالتين، وتأويله مو حدث مضمون.','This is a calculated link between two symbolic themes, not a guaranteed event.'];
 const situation=livedScenes[s.category];
 const context:Pair=[
  'هنا القراءة تربط '+transitRole[0]+' بـ'+natalRole[0]+'. '+angleRole[0]+' '+situation[0],
  'This reading links '+transitRole[1]+' with '+natalRole[1]+'. '+angleRole[1]+' '+situation[1]
 ];
 // Keep the action specific; show the calculation in the evidence panel instead of repeating orb tables.
 good=[context[0],context[1]];
 return {title:pick(title),good:pick(good),careful:pick(careful),action:pick(action)};
}
