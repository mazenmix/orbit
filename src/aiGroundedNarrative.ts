import type {AIAdviceContext,AIContact} from './aiQuality.ts';

/** Human-readable, calculation-bound backup when a model response is rejected.
 * Never use a generic canned paragraph that masks a rejected model answer.
 * Each sentence is assembled from a REAL supplied transit+natal contact and
 * its aspect polarity. No invented personal events or predictions.
 */
type Pair=readonly [string,string];
type Theme={subject:Pair;example:Pair;check:Pair};
const targets:Record<string,Theme>={
 Sun:{subject:['قرار يخص اتجاهك وثقتك بقرارك','a choice about personal direction'],example:['اختيار بين خطوتين يخصّك شخصياً','a choice between two personal directions'],check:['اكتب هدفك من كل خيار وشوف أي واحد يخدمه بالفعل','write the goal of each option and compare it with your actual priorities']},
 Moon:{subject:['طريقة تعاملك ويه الضغط والراحة','how you handle pressure and emotional comfort'],example:['موقف مستفز أو رد ناوي ترسله وإنت منزعج','a tense interaction or a reply drafted while upset'],check:['فرّق بين اللي انقال فعلاً واللي فهمته، وبعدها قرر إذا الرد لازم اليوم','separate what was said from what you inferred before choosing whether to reply today']},
 Mercury:{subject:['مراسلة أو معلومة لازم تتوضح','an unresolved message or piece of information'],example:['جواب منتظره أو اتفاق تفاصيله مو واضحة','an awaited reply or an agreement with unclear terms'],check:['اسأل سؤال واحد محدد عن النقطة الناقصة وخلي الرد قابل للتحقق','ask one precise question about the missing detail and check the answer']},
 Venus:{subject:['التقارب والحدود والتقدير المتبادل','affection, boundaries and mutual appreciation'],example:['دعوة أو تواصل شخصي تريد تعرف إذا الاهتمام بيه متبادل','an invitation or a personal exchange where reciprocity is uncertain'],check:['عبّر عن اهتمامك بكلام واضح، وخلي تجاوب الطرف الثاني الفعلي يحدد خطوتك','express one clear invitation and let the other person’s actual response guide your next step']},
 Mars:{subject:['سرعة المبادرة وردّ الفعل','initiative and impulsive reactions'],example:['موضوع دا تستعجل تحسمه أو نقاش ممكن يحتد','a decision you are rushing or a conversation that might escalate'],check:['نفّذ أصغر خطوة قابلة للتراجع وخلي القرار الأكبر بعد مراجعة النتيجة','try the smallest reversible step and review what happened before a bigger commitment']},
 Jupiter:{subject:['التوسع والفرص مقابل الإمكانات','opportunities versus real capacity'],example:['فكرة سفر أو مشروع أو فرصة تتطلب وقت وفلوس','a trip, project or opportunity with a cost in time and money'],check:['قارن المكسب الممكن بالكلفة الفعلية والوقت المطلوب قبل الالتزام','compare potential benefit with the real cost and time required']},
 Saturn:{subject:['المسؤوليات والالتزامات اللي عليك','responsibilities and obligations'],example:['شغل وعدت بيه أو موعد ومو متأكد من قدرتك عليه','a promise or deadline you may not have the capacity to meet'],check:['حدد المطلوب والموعد والموارد كتابة قبل ما توعد بنتيجة','define scope, deadline and resources before promising an outcome']},
 Uranus:{subject:['تغيير مفاجئ بالخطة والاستقلال','change, independence and disruption'],example:['قرار تغير بيه روتينك أو تفك ارتباط من طريقة قديمة','a choice to change a routine or leave an old approach'],check:['جرّب نسخة صغيرة من التغيير وتأكد أن عندك طريق للرجوع','pilot one small change and keep a way to reverse it']},
 Neptune:{subject:['التوقعات مقابل الوقائع','expectations versus evidence'],example:['إشارة غامضة جاي تفسرها على أساس رغبتك','an ambiguous signal you may be interpreting through hope'],check:['دوّن الشي اللي تعرفه من مصدر مباشر وافصله عن التخمين','list what you directly know and separate it from guesses']},
 Pluto:{subject:['حدود السيطرة والتغيير العميق','control, boundaries and deep change'],example:['خلاف متكرر أو موضوع دا تحاول تتحكم بكل تفاصيله','a recurring disagreement or a situation you cannot fully control'],check:['حدد شنو تكدر تغيّره بتصرفك وحدك وشنو يرجع لقرار الآخرين','identify what your own actions can change and what belongs to others']},
 Chiron:{subject:['ردة فعلك تجاه نقطة حساسة','a sensitive personal topic'],example:['نقد أو تعليق يرجّعك لموقف قديم','criticism that reminds you of an older experience'],check:['افصل الموقف الجديد عن التجربة القديمة واطلب توضيحاً إذا احتجت','separate the new situation from past experience and request clarification if useful']},
 Ceres:{subject:['توازن المساعدة والاهتمام','care and reciprocal support'],example:['شخص يعتمد عليك أكثر مما وقتك يسمح','someone asking for more help than your schedule permits'],check:['حدد نوع المساعدة اللي تكدر تقدمها من دون إنهاك نفسك','state what support you can realistically offer without overcommitting']},
 Pallas:{subject:['حل مشكلة بخطوات واضحة','structured problem-solving'],example:['مشكلة دا تعالج أعراضها بدل سببها','a problem where you are addressing symptoms, not causes'],check:['اكتب ثلاث فرضيات وجرب أبسط اختبار يفرق بينها','list three possible causes and test the easiest distinction']},
 Juno:{subject:['توقعات الالتزام بالاتفاقات','expectations around commitment'],example:['تفاهم عن حدود علاقة أو مسؤولية مشتركة','an agreement about relationship boundaries or shared responsibility'],check:['اسأل الطرفين عن توقع واحد محدد بدل الاعتماد على الافتراض','ask for one explicit shared expectation instead of assuming agreement']},
 Vesta:{subject:['التركيز على شي مهم ويحتاج استمرار','focus and sustained effort'],example:['هدف دا تتشتت عنه بأعمال جانبية','an important task crowded out by distractions'],check:['خصص فترة محددة لهدف واحد وقارن الإنجاز الفعلي بعدها','reserve one defined period for that task and review concrete progress']},
 Pholus:{subject:['أثر التفاصيل الصغيرة على قرار أكبر','small triggers with larger consequences'],example:['تفصيل بسيط ممكن يغير طريقة تنفيذ اتفاق','a small detail that could change how an agreement works'],check:['راجع الشرط المخفي أو الخطوة المنسية قبل التوسع','check overlooked conditions before expanding the plan']},
 Ascendant:{subject:['الانطباع الأول وطريقة تقديم نفسك','first impressions and presentation'],example:['لقاء جديد أو أول رسالة لشخص','a first meeting or introductory message'],check:['خلّ رسالتك واضحة وقصيرة ولا تفترض رأي الآخر قبل ما يتجاوب','be clear and concise, without assuming someone’s impression']},
 MC:{subject:['المسار المهني والصورة العامة لشغلك','career direction and professional standing'],example:['طلب جديد بالشغل أو فرصة تبين بيها نتائجك','a work request or opportunity to demonstrate a result'],check:['حدد النتيجة اللي راح تسلمها ومتى وكيف تنقاس','define the concrete deliverable, deadline and a measure of completion']}
};
const moving:Record<string,Pair>={
 Sun:['الحاجة لاتخاذ موقف واضح','taking an explicit position'],
 Moon:['التفاعل السريع ويه الشعور الحالي','reacting to a momentary feeling'],
 Mercury:['المعلومة وطريقة توصيلها','information and how it is communicated'],
 Venus:['قيمة العلاقة أو الاختيار بالنسبة إلك','the value you place on a connection or choice'],
 Mars:['الاستعجال بالمبادرة','the urge to act quickly'],
 Jupiter:['الرغبة بتوسيع الخيارات','the temptation to expand your options'],
 Saturn:['ثقل المسؤولية وحدود القدرة','responsibility and limits'],
 Uranus:['الرغبة بكسر الروتين','the urge to disrupt a routine'],
 Neptune:['الفرق بين الانطباع والحقيقة','the gap between impression and reality'],
 Pluto:['محاولة التحكم باتجاه الأمور','the need to control an outcome'],
 Chiron:['الحساسية تجاه نقد أو ذكرى','sensitivity around criticism'],
 Ceres:['الاهتمام العملي بالآخرين','practical care'],
 Pallas:['البحث عن الحل الأذكى','looking for a better solution'],
 Juno:['توقع الاستمرارية والوضوح','expectations of commitment'],
 Vesta:['التفرغ للمهمة','devotion to a single task'],
 Pholus:['تأثير قرار صغير على اللي بعده','the effect of small choices']
};
const pick=(pair:Pair,ar:boolean)=>pair[ar?0:1];
function describe(e:AIContact,kind:'support'|'challenge',ar:boolean):string{
 const target=targets[e.natal]??targets.Sun,driver=moving[e.transit]??moving.Sun;
 const area=pick(target.subject,ar),lens=pick(driver,ar),scene=pick(target.example,ar),action=pick(target.check,ar);
 const closer=e.orb<=.5,hard=kind==='challenge';
 if(ar){
  return (hard?'الجانب اللي يحتاج انتباه':'أبرز مجال تگدر تشتغل عليه')+' هو '+area+'؛ الحساب يجمعه ويه '+lens+'. '+
   'إذا عندك '+scene+'، '+(hard?'لا تعتمد على أول انطباع ولا تستعجل بالحسم':'استثمر الوضوح الموجود من دون ما تفترض أن النتيجة مضمونة')+'. '+
   (closer?'هذا الاتصال قريب جداً من دقته الحسابية؛ ':'')+action+'.';
 }
 return (hard?'The counterweight to review':'The clearest area to work on')+' is '+area+', alongside '+lens+'. '+
  'If you face '+scene+', '+(hard?'avoid treating the first impression as proof or rushing a choice':'use the opening without assuming any outcome')+'. '+
  (closer?'This is a particularly close calculated contact. ':'')+action+'.';
}
export function evidenceGroundedPlainAnalysis(ctx:AIAdviceContext):string{
 const ar=ctx.language==='ar';
 const supports=ctx.support,challenges=ctx.challenge;
 if(!supports&&!challenges)return ar?
  'ما وصلتني اتصالات ولادية محسوبة تكفي لقراءة شخصية بهالوقت. ما راح أعطيك كلام عام وأنسبه لخريطتك.':
  'No verified natal contacts were supplied for this moment. A personal reading cannot be justified from empty evidence.';
 const primary=supports??challenges!;
 const first=describe(primary,supports?'support':'challenge',ar);
 const other=supports&&challenges?describe(challenges,'challenge',ar):'';
 if(other)return first+'\n\n'+other;
 return first+'\n\n'+(ar?'هاي نقطة واحدة مدعومة بالاتصال المحسوب بهالوقت؛ ماكو عامل ثانٍ كافي حتى أنسبلك موضوع إضافي.':'Only one calculated contact supports this focus; no second personal theme is justified.');
}
