import type {Chart} from './engine.ts';
import {rankedFactors,houseNumber,supportive,difficult,type Signal,type Evidence,type Category} from './math.ts';

/** Editorial interpretation, exclusively from calculated factors.
 * This is symbolic astrology, never a claim about a real event, consent, private thoughts or probability. */
type Language='ar'|'en';
type Bi=readonly [string,string];
const index=(lang:Language)=>lang==='ar'?0:1;
const names:Record<string,Bi>={
 Sun:['الشمس','Sun'],Moon:['القمر','Moon'],Mercury:['عطارد','Mercury'],Venus:['الزهرة','Venus'],
 Mars:['المريخ','Mars'],Jupiter:['المشتري','Jupiter'],Saturn:['زحل','Saturn'],
 Uranus:['أورانوس','Uranus'],Neptune:['نبتون','Neptune'],Pluto:['بلوتو','Pluto'],
 Ascendant:['الطالع','Ascendant'],MC:['وسط السماء','Midheaven'],Chiron:['كيرون','Chiron'],
 Ceres:['سيريس','Ceres'],Pallas:['بالاس','Pallas'],Juno:['جونو','Juno'],
 Vesta:['فيستا','Vesta'],Pholus:['فولوس','Pholus']
};
const headings:Record<string,Bi>={
 Sun:['القرار والهوية','decisions and identity'],Moon:['المشاعر والراحة','feelings and comfort'],Mercury:['وضوح الكلام','clear communication'],
 Venus:['القرب والتقدير','affection and appreciation'],Mars:['المبادرة والاندفاع','action and impulse'],
 Jupiter:['الفرص والتوسع','opportunity and growth'],Saturn:['الالتزام والحدود','duty and boundaries'],
 Uranus:['الحرية والتغيير','freedom and change'],Neptune:['التوقعات والواقع','expectations and reality'],
 Pluto:['التحوّل والسيطرة','change and control'],Ascendant:['الانطباع والحضور','presence and first impressions'],
 MC:['المسار المهني','career direction']
};
const causes:Record<string,Bi>={
 Sun:['رغبتك باتخاذ قرار يمثّلك بدل إرضاء الجميع','your need to choose a direction that reflects your priorities'],
 Moon:['حاجتك للراحة والاطمئنان قبل ردّة الفعل','your need for security before responding'],
 Mercury:['رغبتك بفهم المقصود والتعبير الواضح','the need to understand and express things clearly'],
 Venus:['الاهتمام والتقدير وطريقة التقارب','care, attraction and feeling valued'],
 Mars:['الدافع والمبادرة والقدرة على قول لا','initiative, motivation and assertiveness'],
 Jupiter:['الرغبة بالتوسع وتجربة فرصة جديدة','the desire to expand or explore an opportunity'],
 Saturn:['حساب المسؤولية والتكلفة والحدود','the need for structure, responsibility and boundaries'],
 Uranus:['الرغبة بالاستقلال وتغيير الأسلوب المعتاد','the urge for autonomy and a different approach'],
 Neptune:['الفارق بين التصور الجميل والوقائع المؤكدة','the gap between hopes and verified facts'],
 Pluto:['الإصرار على معرفة ما يمكن تغييره والسيطرة عليه','the desire for deeper change and awareness of power'],
 Ascendant:['الانطباع الأول وطريقة حضورك أمام الناس','first impressions and how you come across'],
 MC:['اتجاهك بالشغل وسمعتك المهنية','career direction and public responsibility']
};
const places:readonly Bi[]=[
 ['',''],['صورتك عن نفسك والمبادرات','identity and initiative'],['الموارد والصرف والقيمة الشخصية','resources, money and self-worth'],
 ['الحوارات والرسائل والتعلّم','messages, conversations and learning'],['البيت والعائلة والخصوصية','home, family and privacy'],
 ['الرومانسية والمتعة والتعبير','romance, play and creative expression'],['الشغل اليومي والعادات','daily work and habits'],
 ['العلاقات والاتفاق بين طرفين','relationships and agreements'],['الثقة والموارد المشتركة','trust and shared resources'],
 ['السفر والتعلّم والقناعات','travel, study and beliefs'],['الشغل والسمعة والمسؤولية','career and reputation'],
 ['الأصدقاء والمجموعات','friends and communities'],['الراحة والخلوة والأمور الخاصة','rest, solitude and private matters']
];
const meanings:Record<number,Bi>={
 0:['الاقتران يجمع الموضوعين، فممكن يصير من الصعب تفصل الرغبة عن القلق أو الحماس عن الحساب.','A conjunction brings both themes together, making it useful to separate impulse from judgment.'],
 60:['التسديس يفتح فرصة للتنسيق بين هالجانبين، بس يحتاج مبادرة فعلية منك.','A sextile points to cooperation that still needs deliberate effort.'],
 90:['التربيع يصوّر شدّ بين احتياجين، والتحدي هو ما تخلي أحدهما يلغي الثاني.','A square highlights competing needs; the task is not to let one erase the other.'],
 120:['التثليث يرمز لسهولة نسبية بالتعامل، مو ضمان أن أي خطوة حتنجح.','A trine represents relative symbolic ease, not guaranteed success.'],
 180:['المقابلة تبرز طرفين للموضوع؛ الحل غالباً بالحوار والحدود مو بحسم متسرع.','An opposition asks for dialogue and boundaries between two different priorities.']
};
const aspects:Record<number,Bi>={0:['اقتران','conjunction'],60:['تسديس','sextile'],90:['تربيع','square'],120:['تثليث','trine'],180:['مقابلة','opposition']};
const domains:Record<Category,Bi>={
 overview:['إدارة الأولويات','priorities'],career:['العمل والقرار المهني','career decisions'],love:['العلاقة والتقارب','connection and relationships'],
 communication:['الكلام والرسائل','conversations and messages'],energy:['المبادرة والجهد','initiative and effort'],
 emotions:['المشاعر وردّ الفعل','emotional reactions'],recovery:['الراحة واستعادة التوازن','rest and recovery'],timing:['الوقت ومرونة الخطة','planning and timing']
};
const scenes:Record<string,Bi>={
 Neptune:['إذا وصلتك إشارة مبهمة من شخص أو عرض مغري، لا تعتبر اللي تتمنى يصير حقيقة؛ اسأل عن التفاصيل وشوف التصرف المتكرر.','If a message is ambiguous or an offer sounds ideal, verify details instead of treating hope as evidence.'],
 Mercury:['إذا انتظرت جواب برسالة أو قرار شغل، فرّق بين التأخير وبين الرفض، واطلب توضيح واحد محدد.','If a reply is delayed, separate the delay from rejection and ask one clear question.'],
 Venus:['إذا جذبك شخص، احچي عن اهتمامك بوضوح وخلي تجاوبه الحقيقي يحدد الخطوة، مو إشارات تتخيلها.','If attracted to someone, communicate clearly and let their actual response guide you.'],
 Mars:['إذا عندك مواجهة أو خطوة مأجلها، اختار فعل صغير محسوب بدل ردّ قوي ما تگدر تتراجع عنه.','For a confrontation or postponed task, choose a measured small action rather than an irreversible reaction.'],
 Saturn:['إذا أكو مسؤولية تثقل عليك، اكتب شنو عليك وشنو مو من واجبك قبل لا تعطي وعد جديد.','With a heavy obligation, distinguish what is yours to do from what is not before promising more.'],
 Sun:['إذا شفت نفسك تحاول ترضي الكل، اختار قرار واحد ينسجم ويا أولوياتك واشرحه بلا دفاع طويل.','If you are trying to please everyone, name one decision that fits your priorities and explain it simply.'],
 Moon:['إذا موقف حرّك مشاعرك، سمّ الشعور أولاً واسأل نفسك إذا تحتاج راحة أو معلومة قبل الرد.','If a situation stirs feelings, name them and decide whether you need rest or more information before replying.'],
 Jupiter:['إذا فكرة سفر أو شغل أو تعلّم حمّستك، قارن الوقت والكلفة بالنتيجة الواقعية قبل الالتزام.','When travel, work or learning excites you, compare time and cost with real outcomes before committing.'],
 Uranus:['إذا تريد تغيّر روتين أو علاقة، جرّب تعديل يمكن ترجع عنه بدل القطع المفاجئ.','If you want change, test a reversible adjustment rather than abruptly cutting ties.'],
 Pluto:['إذا عندك موضوع تريد تحسمه بالقوة، فكّر بالحدود اللي تتحكم بيها وبالنتيجة اللي ما تقدر تفرضها.','If you want to force an outcome, distinguish boundaries you control from responses you cannot.'],
 Ascendant:['إذا تعرّفت على شخص جديد، ركّز على وضوح الحچي والانطباع الحقيقي بدل تمثيل صورة مثالية.','For a new introduction, prioritize straightforward communication over performing an ideal image.'],
 MC:['إذا عندك اجتماع أو طلب من مسؤول، قدّم إنجاز محدد واطلب المطلوب منك بصراحة.','For a work meeting, present one concrete result and clarify expectations.']
};
const categories:Record<Category,Bi>={
 overview:['سوّي ترتيب بسيط لأولويتين بدل تعالج كل حياتك دفعة وحدة.','Choose two priorities rather than trying to fix everything at once.'],
 career:['خلي الاتفاق مكتوب: شنو المطلوب ومنو مسؤول ومتى التسليم.','Document the deliverable, owner and deadline.'],
 love:['إذا أكو اهتمام متبادل، اقترح خطوة واضحة واترك مساحة لقبول أو رفض الطرف الثاني.','If interest is mutual, make one clear invitation and allow room for either response.'],
 communication:['اسأل سؤال واحد محدد وخلي جواب الشخص الآخر يوضح الصورة.','Ask one specific question and allow the actual answer to clarify things.'],
 energy:['اختار مهمة أو تمرين بحدود معقولة، وسجّل شنو أنجزت فعلاً.','Choose a manageable task or workout and review what you really completed.'],
 emotions:['راقب شنو صار فعلاً وشنو أضفته من تفسير قبل أي رد.','Distinguish the actual event from your interpretation before responding.'],
 recovery:['احجز وقت راحة محدد ولا تخلّي كل فراغ يتحول لمهمة جديدة.','Protect one real rest window rather than filling every gap with work.'],
 timing:['جهّز بديل واضح لأي موعد يعتمد على ظروف أو موافقة غيرك.','Prepare a fallback for any plan dependent on external circumstances.']
};
const everydayCases:Record<Category,Bi>={
 overview:['بين شغلتين ببالك، اختار أي وحدة تحتاج جواب اليوم وأي وحدة تكدر تأجلها.','When two priorities compete, identify what needs an answer today and what can wait.'],
 career:['إذا مسؤول طلب منك شغلة مستعجلة، وضّح النتيجة والموعد قبل ما تعطي وعد.','If a manager asks for something urgent, clarify the result and deadline before committing.'],
 love:['إذا شخص يعجبك وتأخر ردّه، لا تعتبر الصمت قبول أو رفض؛ وضّح اهتمامك باحترام مرة وحدة.','If someone you like replies late, do not treat silence as acceptance or rejection; express interest respectfully once.'],
 communication:['إذا وصلت رسالة مبهمة، اسأل عن المعنى المقصود قبل لا تبني قرار على تخمين.','If a message is vague, clarify its meaning before acting on an assumption.'],
 energy:['إذا طاقة البدايات عالية بس تركيزك مشتت، اختار خطوة تگدر تكملها بدون استنزاف.','If you feel motivated but scattered, choose a small step you can finish without exhaustion.'],
 emotions:['إذا موقف ضايقك، افصل التصرف اللي صار فعلاً عن المعنى اللي تخيلته وراه.','If something upset you, separate what happened from the meaning you inferred.'],
 recovery:['إذا يومك مزدحم، احجز وقت راحة حقيقي وخلي مهمة ثانوية لبعدين.','When the day is full, protect actual recovery time and postpone one optional task.'],
 timing:['إذا موعد يعتمد على موافقة شخص أو وسيلة سفر، جهز خيار احتياطي قبل ما ترتبط بيه.','If a plan depends on someone else or travel logistics, have a fallback before committing.']
};
const name=(id:string,lang:Language)=>(names[id]??[id,id])[index(lang)];
const focus=(id:string,lang:Language)=>(causes[id]??[id,id])[index(lang)];
const nextSteps:Record<string,Bi>={
 Neptune:['حدّد المعلومة الناقصة واسأل عنها سؤال واحد مباشر؛ لا تكمّل القصة من خيالك.','Identify the missing fact and ask one direct question rather than filling gaps with hope.'],
 Mercury:['اكتب جملة واحدة توضّح المطلوب، وبعدين راقب الرد الحقيقي من غير استنتاج مسبق.','Write one clear question, then use the real response rather than guessing.'],
 Venus:['إذا الاهتمام متبادل، اقترح موعداً أو حديثاً واضحاً بلا اختبار مشاعر أو ضغط.','Where interest is reciprocal, suggest a clear low-pressure conversation or date.'],
 Mars:['انجز أول جزء من المهمة أو النقاش وحدّد شنو يحتاج مهلة قبل أي تصعيد.','Complete the first manageable step, then decide what needs more time.'],
 Saturn:['ثبّت حدود مسؤوليتك وموعد التنفيذ قبل أي التزام جديد.','Define your responsibility and deadline before agreeing to anything else.'],
 Moon:['خذ مساحة قصيرة حتى تهدأ، وبعدها احچي عن الحاجة اللي فعلاً تريد توصلها.','Take a short pause, then state the need you actually want understood.'],
 Sun:['حدّد موقفاً واحداً ينسجم ويا أولوياتك وفسّره للمعنيين بكلام واضح.','Choose one position consistent with your priorities and explain it clearly.'],
 Jupiter:['احسب كلفة الفرصة والوقت المطلوب إلها قبل ما تتحول الفكرة إلى وعد.','Price the opportunity in time and resources before making a commitment.'],
 Uranus:['جرّب تغييراً بسيطاً أسبوع واحد قبل ما تقلب الخطة كلها.','Test one reversible change for a week before reshaping the whole plan.'],
 Pluto:['اكتب شنو تملك تغيّره بنفسك، وشنو يبقى قرار غيرك؛ بعدها تحرك على الجزء الأول فقط.','Separate what you control from what another person decides, then act on your part only.'],
 Ascendant:['ابدأ بالتعارف بشغلة طبيعية تخصك، واسأل الشخص عن رأيه بلا مبالغة.','Introduce yourself naturally and ask a genuine question without performing a persona.'],
 MC:['اختصر النقاش المهني بمطلوب واحد ومؤشر واضح تعرف بيه إن المهمة انجزت.','Define one work deliverable and a clear test of completion.']
};
const action=(e:Evidence,c:Category,lang:Language)=>{
 const p=index(lang),tension=e.angle===90||e.angle===180;
 // Category is the topic the reader opened; the individual natal factor
 // modulates that topic. Do not answer a romance question with work advice.
 const direct=c==='overview'?(nextSteps[e.natal.id]??nextSteps[e.transit.id]??categories[c])[p]:categories[c][p];
 const focused=focus(e.natal.id,lang);
 const nuance=lang==='ar'?
  (tension?' إذا حسّيت الموضوع معقّد، راقب هل '+focused+' ديدفعك للتسرع بالحكم.':' بعد التجربة، راقب شلون '+focused+' أثّر على قرارك الحقيقي.'):
  (tension?' If the situation feels tense, notice whether '+focused+' pushes you toward a rushed judgment.':' After trying it, notice how '+focused+' affected your real decision.');
 return direct+nuance+(e.applying?
  (lang==='ar'?' خلّ خطوتك قابلة للتعديل.':' Keep the action reversible.'):
  (lang==='ar'?' إذا جربتها قبل، عدّلها على ضوء النتيجة.':' If you tried it already, adjust based on the result.'));
};
function houseOf(e:Evidence,natal:Chart|undefined,known:boolean):number{
 if(!known||!natal||natal.cusps.length!==12||['Ascendant','MC'].includes(e.natal.id))return 0;
 return houseNumber(e.natal.longitude,natal.cusps);
}
export type SignalStory={title:string;good:string;careful:string;action:string;basis:string};
export function signalStory(s:Signal,natal:Chart|undefined,known:boolean,language:Language,preferred?:Evidence):SignalStory|null{
 const factors=rankedFactors(s.allFactors??s.factors);
 // Interpret the EXACT priority contact shown in the technical evidence.
 // Do not silently switch back to the category's highest generic factor.
 const e=preferred?factors.find(f=>f.id===preferred.id&&f.transit.id===preferred.transit.id&&f.natal.id===preferred.natal.id&&f.angle===preferred.angle):factors[0];
 if(!e||e.weight<.30)return null;
 const p=index(language),a=meanings[e.angle]?.[p]??'',angle=aspects[e.angle]?.[p]??String(e.angle);
 const area=domains[s.category][p],first=name(e.transit.id,language),second=name(e.natal.id,language);
 const h=houseOf(e,natal,known);
 const home=h>=1&&h<=12?places[h][p]:null;
 const contrast=factors.find(x=>x!==e&&((supportive(e)&&difficult(x))||(difficult(e)&&supportive(x))));
 const tension=e.angle===90||e.angle===180;
 const merged=e.angle===0;
 const roleA=focus(e.transit.id,language),roleB=focus(e.natal.id,language);
 const labelA=(headings[e.transit.id]??domains[s.category])[p];
 const labelB=(headings[e.natal.id]??domains[s.category])[p];
 const title=language==='ar'?
  (labelA===labelB?'ركز على '+labelA:'وازن بين '+labelA+' و'+labelB):
  (labelA===labelB?'Focus on '+labelA:'Balance '+labelA+' with '+labelB);
 const takeaway=language==='ar'?
  tension?'القراءة تبرز شدّاً محتملاً بين '+roleA+' وبين '+roleB+'. إذا ظهر عندك تردد بقرار أو اختلاف بحوار، حدد الأولوية اللي تحتاج معالجة أولاً بدل ما تضغط على نفسك وتحسم بسرعة.':
  merged?'الموضوع الأبرز يجمع بين '+roleA+' وبين '+roleB+'. إذا واجهت موقفاً مشابهاً، اسأل نفسك: شنو أعرفه فعلاً وشنو مجرد توقع؟ هالفرق يساعدك تقرر أوضح.':
  'قد يكون أسهل عليك توفّق بين '+roleA+' وبين '+roleB+'، خصوصاً إذا رتبت أولوياتك بخطوة عملية واحدة. احكم على النتيجة من تصرفاتك والواقع، مو من الانطباع وحده.':
  tension?'A possible tension lies between '+roleA+' and '+roleB+'. It could show up as indecision or a conversation you want to settle too quickly.':
  merged?'The strongest theme brings '+roleA+' together with '+roleB+'. Separate what you genuinely want from what you assume should happen.':
  'The pattern symbolically favors coordinating '+roleA+' and '+roleB+', provided real circumstances support it.';
 const place=home?(language==='ar'?' أقرب مجال حتى تراجع هذا الموضوع هو '+home+'.':' The area to reflect on is '+home+'.'):'';
 const balance=contrast?(language==='ar'?' وأكو جانب معاكس بنفس القراءة؛ لذلك لا تعتبر الصورة كلها سهلة أو كلها صعبة.':' A competing theme is present, so avoid treating the whole situation as either easy or difficult.'):'';
 const good=(language==='ar'?'على صعيد '+area+'، ':'In '+area+', ')+takeaway+place+balance;
 const caution=language==='ar'?
  'مثال عملي: '+everydayCases[s.category][0] :
  'A practical example: '+everydayCases[s.category][1];
 const practical=action(e,s.category,language);
 const basis=first+' '+angle+' '+second+' · '+e.orb.toFixed(2)+'°';
 return {title,good,careful:caution,action:practical,basis};
}
