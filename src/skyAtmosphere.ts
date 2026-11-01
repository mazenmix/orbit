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
/** Retrograde meanings include actual zodiac-specific behavior, not an identical message in every sign. */
const retroSignFocus:readonly [string,string][]=[
 ['بالحمل، لا تستعجل رسالة أو مواجهة بس لأنك تريد تنهي الموضوع اليوم.','In Aries, do not rush a message or confrontation just to finish it today.'],
 ['بالثور، راجع قيمة الالتزام أو المصروف قبل ما تتمسك بخطة قديمة.','In Taurus, reconsider the cost or value of an old commitment.'],
 ['بالجوزاء، تحقق من نسختين مختلفتين للخبر قبل ما تنقل أي معلومة.','In Gemini, compare conflicting accounts before sharing a story.'],
 ['بالسرطان، لا تعامل ذكرى قديمة كدليل على موقف شخص منك هسه.','In Cancer, do not treat a memory as evidence of someone’s present intentions.'],
 ['بالأسد، لا تربط كرامتك بسرعة الرد أو مقدار المدح اللي تسمعه.','In Leo, avoid tying your worth to a quick reply or praise.'],
 ['بالعذراء، صحح تفصيلاً واحداً بدل ما تفتح قائمة أخطاء بلا نهاية.','In Virgo, correct one specific detail rather than every imperfection.'],
 ['بالميزان، وضّح شنو تعطي وشنو تتوقع بدل اختبار الطرف الثاني بالسكوت.','In Libra, discuss mutual expectations instead of testing someone through silence.'],
 ['بالعقرب، التلميح مو اعتراف؛ اسأل عن المقصود بدل تفتيش النوايا.','In Scorpio, hints are not admissions; ask directly rather than interrogating intent.'],
 ['بالقوس، قبل وعد السفر أو الدراسة دقق الموعد والكلفة والالتزامات.','In Sagittarius, double-check travel or study promises and their costs.'],
 ['بالجدي، لا تضيف مسؤولية جديدة قبل ما تغلق القديمة أو تعدّل موعدها.','In Capricorn, finish or reschedule existing responsibilities before taking more.'],
 ['بالدلو، لا تفاجئ الناس بتغيير نظام مشترك من غير ما تحچي وياهم.','In Aquarius, discuss a change to shared routines before springing it on others.'],
 ['بالحوت، افصل شعورك عن دليل فعلي قبل ما تبني عليه قرار.','In Pisces, separate intuition from verifiable evidence before deciding.']
];
const retroSpecific:Readonly<Record<string,[string,string]>>={
 'Mercury:Scorpio':['إذا وصلت رسالة بيها تلميحات أو رجع حچي قديم، لا تفسر السكوت كاتهام. اسأل عن قصد الجملة قبل الرد.','If an old topic or cryptic message returns, do not assume hidden accusations. Clarify the words first.'],
 'Venus:Libra':['خلاف قديم حول التقدير أو المبادرة ممكن ينفتح للنقاش. لا تختبر الاهتمام بالسكوت؛ احچي شنو تحتاج واترك للطرف الثاني حرية الجواب.','An old disagreement about affection or effort may come up. Say what you need instead of testing the other person with silence.']
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

/** Forty-five editorially authored pair situations; no shared vague 'harmony between themes' template. */
const pairScenes:Record<string,[string,string,string,string,string,string]>={
 "Moon|Sun":["قرار تريد تحسمه وانت منزعج ممكن يعاكس احتياجك للراحة؛ وتطلع كلمتك أقسى من قصدك.","من تحدد شنو يهمك وشنو مضايقك، يصير أسهل تختار الخطوة بدون ما تكبت إحساسك.","انتظر لحد ما تهدأ، واكتب سبب القرار بجملة واحدة.","A decision made while upset may conflict with your need for rest.","Clarifying what matters and what hurts can make a calm decision easier.","Wait until you settle, then write the reason for your choice."],
 "Mercury|Moon":["رسالة عادية ممكن تنفهم تجريح لأن المزاج سبق الفهم، فترد على معنى محد كاله.","الكلام عن شعورك بصيغة واضحة يسهل التفاهم بدل التلميح والعتب.","اسأل شنو المقصود قبل الرد، واحچي عن الشي اللي ضايقك تحديداً.","A normal message can sting when feelings race ahead of comprehension.","Clear words about a feeling can prevent unnecessary assumptions.","Ask what was meant before replying."],
 "Moon|Venus":["حاجتك للاهتمام ممكن تخليك تقرأ تأخير الرد كأنه تجاهل، رغم ما عندك دليل.","مبادرة لطيفة ورسالة قصيرة ممكن توصل المودة من غير ضغط أو اختبار للطرف الثاني.","عبّر عن اهتمامك مرة واحدة وخلي الرد الحقيقي يحدد الخطوة الجاية.","A delayed reply might feel like rejection without evidence.","A gentle gesture can communicate care without pressure.","Express care once and allow room for a real reply."],
 "Mars|Moon":["من تعصب، ممكن تتصرف بسرعة حتى تدافع عن نفسك ثم تندم على نبرة الكلام.","الحماس يتحول لفعل مفيد إذا فرغت توترك بمهمة أو حركة بدل الجدال.","ابتعد دقايق عن النقاش، وبعدها احچي بالمطلوب مو بالاتهام.","Anger can prompt a defensive reaction you later regret.","Energy helps when directed toward a task rather than a fight.","Pause the argument, then state your request."],
 "Jupiter|Moon":["الحماس لوعد كبير أو طلعة ممكن يغطي على تعبك أو احتياجك الفعلي للراحة.","التفاؤل يرفع المعنويات إذا ما حمّلت نفسك أو غيرك توقعات أكبر من الممكن.","خلّ الخطة بسيطة وقابلة للتأجيل، واحسب وقتك وطاقة يومك.","Big plans can overlook your actual emotional energy.","Optimism helps when promises stay manageable.","Make plans flexible and account for your energy."],
 "Moon|Saturn":["ضغط المسؤوليات ممكن يخليك تكتم ضيقك وتفسّر الطلب البسيط كعبء إضافي.","هدوء المزاج يساعدك ترتب التزام قديم، وتوضح للناس شنو تگدر تنجزه فعلاً.","اكتب شغلة واحدة لازم تنتهي، وحدد مسؤولها وموعدها بهدوء.","Responsibility can feel heavier when feelings go unspoken.","Emotional steadiness helps organize an outstanding commitment.","Write one task, its owner and a realistic deadline."],
 "Moon|Uranus":["تغيير مفاجئ بالخطة ممكن يستفزك ويخليك تقطع تواصل أو تلغي موعد بعصبية.","المرونة تخليك تغير جوك أو تجرب حل غير معتاد بدون ما تخرب ترتيباتك.","غيّر تفصيل صغير بالخطة وخلي قرارك الكبير لبعد ما تهدأ.","A surprise change in plans can provoke an abrupt reaction.","Flexibility makes room for novelty without disrupting everything.","Change one small detail and avoid drastic decisions."],
 "Moon|Neptune":["إحساس قوي تجاه سكوت شخص قد يتحول بقصتك إلى حقيقة ما حد أكدها.","الخيال والتعاطف يساعدنك تفهم الاحتمالات إذا فصلت الشعور عن الخبر.","ميّز اللي صار فعلاً عن اللي تخيلته، واسأل قبل ما تحكم.","Silence may invite a story that nobody confirmed.","Empathy helps when feelings are kept separate from evidence.","Separate facts from guesses before confronting anyone."],
 "Moon|Pluto":["شدّ وجذب عاطفي وحساسية تجاه السيطرة والحدود؛ الاختلاف البسيط ممكن يتحول لمعركة.","معرفة سبب ردّة فعلك تساعدك تحچي عن حدودك من دون تفتيش بنوايا الآخرين.","سمّ الشي اللي يزعجك وحدد حدّك بهدوء، ولا تختبر ولاء أحد.","Emotional push and pull can turn a small disagreement into a control struggle.","Naming the emotion can support a clear boundary.","State your boundary calmly rather than testing loyalty."],
 "Mercury|Sun":["تريد تثبت رأيك بسرعة، فتقاطع أحد أو تتمسك بصياغة كلامك بدل مضمون الموضوع.","تحديد الفكرة الأساسية يسهل عرض قرارك على الناس ويحسن التفاهم.","لخص قرارك بثلاث جمل واسمع الاعتراض كامل قبل ما تجاوب.","Defending your view too quickly may obscure the actual point.","Clear priorities help you present a decision.","Summarize your point and hear objections fully."],
 "Sun|Venus":["رغبتك بالتقدير ممكن تخليك تجامل على حساب موقفك أو توافق وأنت مو مقتنع.","تگدر تظهر ذوقك واهتمامك بثقة من غير ما تتخلى عن رأيك.","گول شنو يعجبك وشنو ما يناسبك بكلام لطيف ومباشر.","Seeking appreciation can lead to agreement you do not mean.","You can show warmth without abandoning your priorities.","State your preference politely and clearly."],
 "Mars|Sun":["الإصرار على الفوز بالنقاش قد يدفعك ترفع الصوت أو تسرع بتنفيذ قرار ناقص.","الشجاعة تخدم هدفك إذا وجهتها لخطوة عمل محددة بدل إثبات القوة.","حدد النتيجة اللي تريدها قبل المبادرة وابتعد عن معركة كرامة.","The urge to win can turn an ordinary decision into a contest.","Courage works best when focused on a specific task.","Define the outcome and avoid pride contests."],
 "Jupiter|Sun":["الثقة الزايدة بفرصة جديدة ممكن تخليك توعد بأكثر من وقتك أو إمكاناتك.","التوسع يصير مفيد إذا عندك هدف واضح وخطوة أولى تگدر تنفذها.","اختبر فرصة واحدة بتكلفة محددة قبل التزام طويل.","Overconfidence can lead to promises beyond your capacity.","Ambition helps when tied to a workable first step.","Test one opportunity with a defined cost."],
 "Saturn|Sun":["التزامات الشغل ممكن تضغط على قرارك الشخصي وتخليك تشوف أي تأخير كفشل.","الانضباط يخدم خطتك إذا قسمت المسؤولية وحافظت على حقك بالراحة.","راجع أهم موعد وحدد شنو تگدر تلتزم بيه فعلاً.","Duties may crowd out your own priorities.","Discipline helps when commitments are realistic.","Review the deadline and renegotiate what you cannot deliver."],
 "Sun|Uranus":["رغبة مفاجئة بتغيير طريقك ممكن تخليك تهدم ترتيب شغال بس لأنك متضايق.","فكرة جديدة تفتح خيار إذا جربتها بصورة صغيرة وما قطعت جسورك.","جرّب تعديل واحد قابل للرجوع قبل ما تغير المسار كله.","A sudden wish for change can threaten a working plan.","A small experiment can create genuine options.","Try one reversible change before a major switch."],
 "Neptune|Sun":["صورة مثالية عن نفسك أو مشروع قد تخفي نقص بالتفاصيل اللي يحتاج قرارك.","الإلهام يصير مفيد لما تحوله لمعلومات ونتيجة قابلة للفحص.","اطلب رقم أو موعد أو دليل واحد قبل ما تلتزم.","An idealized plan may hide missing details.","Inspiration becomes useful when checked against facts.","Ask for one verifiable detail before committing."],
 "Pluto|Sun":["الإصرار على السيطرة على القرار ممكن يخلّي الحوار معركة نفوذ مو بحث عن حل.","القدرة على التغيير تتحسن من تركز على أفعالك مو التحكم برد غيرك.","حدد الشي اللي بإيدك وعدّل تصرفك بدل فرض رأيك.","Trying to control a decision can become a power struggle.","Change is easier when focused on your own actions.","Adjust what you control rather than forcing agreement."],
 "Mercury|Venus":["مجاملة مبهمة أو رسالة فيها تلميح ممكن تنفهم وعد أو اهتمام أكثر من قصدك.","الكلام اللطيف والواضح يساعد على تقريب المسافة أو إنهاء سوء فهم.","اكتب قصدك صراحة بجملة قصيرة من غير اختبارات عاطفية.","A vague compliment can be mistaken for a bigger promise.","Kind, direct language can ease a misunderstanding.","Say what you mean without emotional tests."],
 "Mars|Mercury":["كلام حاد، ردود دفاعية، وسرعة تحوّل النقاش إلى جدال لأنك تريد تجاوب قبل ما تفهم.","سرعة التفكير تخدمك بحسم مشكلة لو استخدمت السؤال بدل المواجهة.","وقف الرد المتسرع واسأل عن المقصود قبل الاعتراض.","Sharp words and defensive replies can turn discussion into an argument.","Fast thinking can solve problems when paired with curiosity.","Clarify the point before objecting."],
 "Jupiter|Mercury":["معلومات كثيرة أو اقتراح كبير قد يغريك تنشر خبر قبل ما تتأكد من مصدره.","شرح فكرة واسعة يصير أسهل إذا قسمت التفاصيل وربطتها بخطوة عملية.","ثبت المعلومة الأساسية والمصدر قبل ما ترسل أو تعد.","A big idea may tempt you to repeat unverified information.","A broader idea becomes practical when organized clearly.","Check the source before sharing or promising."],
 "Mercury|Saturn":["نقاش عن موعد أو تعليمات قد يصير ثقيل لأن طرف يريد سرعة والثاني يدقق التفاصيل.","الكلام المنظم يساعدك تثبت اتفاق مهني أو تحل التباس بمسؤولية.","اكتب المطلوب ومنو مسؤول ومتى التسليم حتى ما يتكرر الخلاف.","Deadlines and detailed instructions can slow a conversation.","Structured communication can establish a workable agreement.","Write the task, owner and deadline."],
 "Mercury|Uranus":["خبر مفاجئ أو فكرة سريعة قد تدفعك ترد قبل ما تستوعب أثرها.","حل جديد يطلع من سؤال مختلف إذا عطيته فرصة للفحص.","سجل الفكرة وبعدين اختبرها بدل إرسال قرار فوري.","Unexpected news may trigger a rushed reply.","An unusual question can unlock a better solution.","Write the idea down and test it first."],
 "Mercury|Neptune":["كلام ناقص أو رسالة مبهمة ممكن يخليك تبني قرار على تفسير من عندك.","الحدس يساعدك تطرح سؤال مناسب إذا ما عوضت بيه المعلومة المفقودة.","اطلب توضيحاً مكتوباً للكلمة أو الموعد اللي مو مفهوم.","Vague wording can lead you to decide based on assumptions.","Intuition can guide a better question, not replace evidence.","Request written clarification of the ambiguous point."],
 "Mercury|Pluto":["سؤال عادي قد ينقلب تحقيق إذا تريد تعرف كل تفاصيل شخص أو اتفاق.","التركيز يساعدك تكشف ثغرة مهمة من غير ضغط أو تشكيك.","اسأل سؤال محدد وخلّ للشخص مساحة يجاوب.","A normal question can become an interrogation.","Focused inquiry can uncover a real issue respectfully.","Ask one precise question without pressuring anyone."],
 "Mars|Venus":["واحد يريد يقرب بسرعة والثاني يحتاج مساحة، وقد ينفهم التأخير كرفض.","المبادرة واللطافة يشتغلن سوى إذا كان الاهتمام متبادل والحدود واضحة.","اعرض موعداً بسيطاً وخلي الموافقة والإيقاع للطرفين.","One person may want closeness faster than the other.","Initiative can work with warmth when interest is mutual.","Suggest a low-pressure plan and respect the reply."],
 "Jupiter|Venus":["حماس عاطفي أو شراء مغرٍ ممكن يخليك تصرف أكثر مما نويت لإرضاء أحد.","المتعة تصير أريح إذا عرفت حدود الميزانية والتوقعات من البداية.","حدد سقف الصرف أو طبيعة العلاقة قبل الوعد.","Enthusiasm in love or spending can inflate expectations.","Pleasure is easier when budgets and expectations are clear.","Set limits before making promises."],
 "Saturn|Venus":["المسؤولية أو قلة الوقت قد تنفهم برود عاطفي حتى لو القصد ترتيب الأمور.","الثبات يظهر بأفعال صغيرة منتظمة بدل وعود كبيرة ما تلحگ عليها.","وضح وقتك الحقيقي واتفگوا على طريقة اهتمام ممكنة.","Limited time may be mistaken for a lack of care.","Consistency can communicate affection better than big promises.","Explain your availability and agree on a realistic rhythm."],
 "Uranus|Venus":["رغبة بالحرية أو مفاجأة بالعلاقة ممكن تربك الطرف الثاني إذا ما اتفگتوا.","تجربة شي جديد بالعلاقة تكون ألطف من الطرفين يختارون بإرادتهم.","اسأل عن راحة الطرف الثاني قبل تغيير الخطة.","Surprise or a need for freedom can unsettle a partner.","Novelty works better when both people choose it.","Ask before changing shared plans."],
 "Neptune|Venus":["المثالية قد تخليك تشوف اهتمام ما انقال أو تتجاهل حد واضح.","الحنان يصير أصدق من تبني العلاقة على الكلام والتصرف الحقيقي.","فرق بين رغبتك وبين موافقة الطرف الثاني الفعلية.","Idealization can make an imagined interest feel real.","Affection is stronger when grounded in actions.","Check actual consent rather than guessing desire."],
 "Pluto|Venus":["الانشداد القوي ممكن يصير غيرة أو رغبة بمعرفة كل تحركات الطرف الثاني.","الصدق بشأن الخوف والثقة يساعد القرب من دون سيطرة.","احچي عن حدودك ولا تفتش أو تختبر الشخص.","Strong attraction can slide into jealousy or monitoring.","Honesty about fears can build trust without control.","Discuss boundaries without testing loyalty."],
 "Jupiter|Mars":["حماس البداية ممكن يخليك تفتح أكثر من مشروع وتستهلك طاقتك بسرعة.","الاندفاع يصير إنجاز إذا ركزت الجهد على هدف قابل للقياس.","ابدأ بمهمة واحدة وقس نتيجتها قبل التوسع.","Starting too many projects can drain your energy.","Drive produces results when focused on one measurable goal.","Complete one task before expanding."],
 "Mars|Saturn":["تريد تنجز بسرعة بس الالتزامات أو التعليمات توقفك، فتتعصب وتستعجل.","الصبر مع خطة تنفيذ يحول الحماس لإنجاز ثابت.","قسم المهمة لمراحل واحسب وقت كل مرحلة.","Urgency may clash with rules or limited time.","Patience and a plan can turn effort into steady progress.","Break the task into realistic stages."],
 "Mars|Uranus":["ردة فعل سريعة لتغيير مفاجئ ممكن تدفعك تقطع علاقة أو تلغي ترتيبات.","جرأة التجربة تنفع إذا عندك خيار رجوع واضح.","لا تحسم وأنت معصب؛ جرّب البديل أولاً.","A surprise can provoke a drastic reaction.","Experimentation helps when you can reverse course.","Test the alternative before committing."],
 "Mars|Neptune":["حماس لشي مو واضح ممكن يضيع الجهد أو يخليك تتعامل مع إشاعة كحقيقة.","طاقتك تنصرف صح من تحدد هدف واضح وتعرف منو مسؤول.","قبل المباشرة، اسأل عن النتيجة المطلوبة والدليل.","Energy can be wasted on a vague or imagined goal.","Effort works better when the target is clear.","Confirm the outcome and evidence before acting."],
 "Mars|Pluto":["الإصرار على فرض النتيجة ممكن يحول الخلاف إلى تحدي قوة.","التصميم يساعدك تغير وضع صعب إذا ركزت على خطواتك وحدودك.","انسحب من صراع الكرامة وحدد طلباً واحداً واقعياً.","A need to dominate can escalate conflict.","Determination helps when focused on your own steps.","Exit the power contest and state one request."],
 "Jupiter|Saturn":["الفرصة تبدو كبيرة، بس الوقت أو الميزانية ما يسمحون بكل الوعود.","التوسع المدروس يصير أقوى إذا قسمته مراحل واضحة.","احسب الكلفة والموعد قبل ما توقع التزام جديد.","Opportunity may exceed available time or budget.","Gradual growth can be more sustainable.","Calculate cost and timing before committing."],
 "Jupiter|Uranus":["فرصة مفاجئة قد تغريك تقفز على خيار قديم بدون فحص العواقب.","التغيير المفيد يصير من توازن بين التجربة والبديل الآمن.","اختبر الفكرة بحجم صغير وخلي خطة بديلة.","A sudden opportunity can invite an untested leap.","Innovation works best with a controlled trial.","Test small and keep a backup."],
 "Jupiter|Neptune":["وعد كبير أو فرصة خيالية قد تخفي شروط ما قريتها.","الأمل يساعدك تبدأ إذا سألـت عن الأرقام والتفاصيل.","تحقق من السعر والمدة ومنو ينفذ الوعد.","An attractive promise may hide missing conditions.","Hope is useful when paired with verification.","Verify the terms, price and responsible party."],
 "Jupiter|Pluto":["رغبتك بالتوسع قد تدفعك تسيطر على قرار جماعي أو تراهن على نتيجة.","التأثير يكون أقوى إذا شاركت الهدف والمسؤولية بدل احتكارها.","استشر شخص معني قبل ما توسع الالتزام.","Ambition may tempt you to control a collective decision.","Shared responsibility can strengthen a plan.","Consult those affected before expanding."],
 "Saturn|Uranus":["التغيير السريع يصطدم بالقواعد القديمة وقد يخليك تنهي خطة نافعة دفعة واحدة.","تعديل خطوة واحدة يخليك تجدد الروتين من غير خسارة الاستقرار.","بدل جزء من النظام وجربه أسبوع قبل التعميم.","New ideas can clash with existing obligations.","Small adjustments allow innovation without chaos.","Change one routine and assess the result."],
 "Neptune|Saturn":["قواعد واضحة تتعارض ويا توقع مبهم، فيصير لوم لأن الاتفاق ما كان مكتوب.","الحدود تساعدك تحول فكرة جميلة إلى خطة قابلة للتنفيذ.","ثبت التفاصيل والمواعيد والحد الأدنى للالتزام.","Unclear expectations can clash with firm obligations.","Boundaries can turn an ideal into a workable plan.","Put terms, deadlines and minimum commitments in writing."],
 "Pluto|Saturn":["المسؤولية الثقيلة قد تتحول لسيطرة أو خوف من فقدان التحكم.","مراجعة نظام قديم تخليك تغيره من دون صراع ويا أصحابه.","حدد شنو لازم يتغير ومنو يقرر، خطوة بخطوة.","Heavy responsibility can become a struggle for control.","Revising a system can help without forcing others.","Define what changes and who decides."],
 "Neptune|Uranus":["فكرة غريبة أو خبر صادم ممكن يخلط الحقيقة بالتخمين.","الإبداع يفتح احتمال جديد إذا اختبرته بدل الانبهار بيه.","اسأل عن مصدر الخبر وجرب الفكرة تجريباً محدوداً.","Striking news can mix novelty with speculation.","Creativity benefits from a practical test.","Check the source and try a limited experiment."],
 "Pluto|Uranus":["رغبة بتغيير جذري قد تدفعك لقطع اتفاق أو نظام ما عدك بديل إله.","التغيير العميق يصير أكثر أماناً من تحدد مشكلة واحدة قابلة للإصلاح.","جهّز بديل قبل إلغاء القديم.","Radical change can dismantle a system without a replacement.","Deep improvement starts with one fixable problem.","Prepare an alternative before replacing the old one."],
 "Neptune|Pluto":["الإصرار على كشف نوايا خفية قد يخليك تفسر كل إشارة كدليل.","فهم دوافعك يساعدك تشوف الحقيقة بدون الدخول بدوامة شك.","اطلب دليل مباشر ولا تحاول تقرأ أفكار الناس.","Searching for hidden motives can turn guesses into certainty.","Self-reflection can reduce suspicion and clarify facts.","Ask for evidence rather than reading minds."],
};
const exactScenes:Record<string,[string,string]>={
 'Moon|Saturn|120':['هدوء المشاعر يساعدك تكمّل مسؤولية مأجلة من غير توتر أو دفاعية. حدّد مهمة واحدة ومنو مسؤول عنها ووقت تسليمها.','Calmer emotions can help finish a postponed responsibility without defensiveness. Set one task, owner and deadline.'],
 'Moon|Saturn|60':['ممكن ترتاح نفسياً من تسوي خطوة بسيطة بواجب متراكم. رتّب أول مهمة بدل ما تفكر بكل الالتزامات دفعة واحدة.','A small step on an overdue task may ease the mental load. Start with just one duty.'],
 'Moon|Sun|90':['قرار تريد تحسمه بسرعة ممكن يتعارض ويا شعور داخلي ما حچيته. لا تتخذ موقف وانت متضايق؛ سمّي الشي اللي ضاغط عليك أولاً.','A rushed decision may conflict with feelings you have not expressed. Name what is upsetting you before deciding.'],
 'Mercury|Moon|90':['كلمة عابرة ممكن تبين جارحة لأن مزاجك متوتر، وتجاوب على تفسيرك مو كلام الشخص. اسأل عن قصده قبل الاعتراض.','A harmless remark may sound hurtful when you are stressed. Ask what was meant before challenging it.'],
 'Moon|Venus|60':['رسالة اهتمام قصيرة أو مجاملة واضحة ممكن تخفف سوء فهم وتقرّب الجو. لا تعتبر تجاوب الطرف الثاني مضمون؛ خله يقرر بنفسه.','A kind, brief message may ease tension. Allow the other person to choose whether to respond.'],
 'Mars|Mercury|90':['كلام حاد، ردود دفاعية، وسرعة تحوّل النقاش إلى جدال. إذا اختلفت على رسالة أو تعليمات، اسأل عن المقصود قبل الرد.','Sharp words and defensive replies could escalate a conversation. Clarify the original message first.'],
 'Moon|Pluto|180':['شدّ وجذب عاطفي وحساسية تجاه السيطرة والحدود. إذا حسّيت أن أحد يضغط عليك، حدّد الحد المطلوب بدل تحويل الاختلاف لمعركة.','Emotional push and pull may turn into control struggles. State your boundary instead of escalating.']
};
const specialized=(a:string,b:string,angle:number):[string,string]|null=>exactScenes[[a,b].sort().join('|')+'|'+angle]??null;
function describe(a:string,b:string,angle:number):[string,string]{
 const special=specialized(a,b,angle);
 if(special)return special;
 const scene=pairScenes[[a,b].sort().join('|')];
 if(!scene)throw Error('Missing editorial pair scene: '+a+' '+b);
 const [risk,ease,step,riskEn,easeEn,stepEn]=scene;
 if(angle===90)return [risk+' '+step,riskEn+' '+stepEn];
 if(angle===180)return ['إذا انقسم موقفك بين رغبتين، '+risk+' '+step,
  'When two priorities pull in opposite directions, '+riskEn+' '+stepEn];
 if(angle===60)return ['تگدر تستثمر فرصة بسيطة: '+ease+' '+step,
  'A small opportunity: '+easeEn+' '+stepEn];
 if(angle===120)return [ease+' '+step,easeEn+' '+stepEn];
 return ['الانتباه ينشد لهالموضوع: '+ease+' '+step,'The focus is concentrated here: '+easeEn+' '+stepEn];
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
  const context=retroSpecific[id+':'+sign[1]];
  const signFocus=retroSignFocus[Math.floor(((p.longitude%360)+360)%360/30)];
  const narrative=context?.[0]??meaning.ar+' '+signFocus[0];
  const narrativeEn=context?.[1]??meaning.en+' '+signFocus[1];
  const relevant=Object.keys(meaning.weight) as Category[];
  notes.push({id:'retro:'+id,arTitle:names[id][0]+' متراجع'+(isVenus?'ة':'')+' بال'+arSign,
   enTitle:names[id][1]+' retrograde in '+sign[1],
   arMeaning:narrative,enMeaning:narrativeEn,categories:relevant,
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
