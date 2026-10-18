import {soulTopics} from './soulData.ts';

/** Editorial priorities are explicit per topic, never a rotation by array index.
 * Resources/challenges are reflection prompts, not measured personality traits. */
const groups:readonly (readonly (readonly [string,string,string,string,string])[])[]=[
 [
  ['Sun Moon Ascendant','ملاحظة اتساق اختياراتك مع قيمك عند تغير الجمهور والظروف','Noticing how choices align with values across audiences and circumstances','اختزال هويتك في صفة واحدة وإهمال اختلافك بين المواقف','Reducing identity to one label and overlooking changes across situations'],
  ['Ascendant Sun Saturn','تقديم نفسك بطريقة تناسب المكان وتحافظ على قيمك','Presenting yourself appropriately without abandoning your values','الانشغال بالصورة العامة حتى يصعب التعبير عن رأي مخالف','Managing appearances until disagreement becomes difficult'],
  ['Ascendant Venus Mercury','ترك مساحة للتعارف قبل الحكم على الانطباع الأول','Allowing familiarity to develop before judging an introduction','اعتبار ارتباك اللقاء الأول وصفاً دائماً لشخصيتك','Treating first-meeting awkwardness as a permanent personal trait'],
  ['Sun Uranus Ascendant','تحويل اختلافك إلى اختيار ملموس له قيمة في حياتك','Turning individuality into a concrete and useful choice','معارضة المألوف لمجرد إثبات أنك مختلف','Rejecting convention simply to appear different'],
  ['Sun Saturn Venus','بناء الثقة من إنجاز يمكن ملاحظته وتطويره','Building confidence through observable and improvable achievements','ربط الثقة بمديح متقلب يصعب التحكم به','Tying confidence to praise that fluctuates beyond your control'],
  ['Sun Uranus Saturn','تحديد القرارات التي تخصك والقرارات التي تستلزم اتفاقاً','Separating personal decisions from those requiring agreement','الخلط بين حماية استقلالك والتحكم في اختيارات الآخرين','Confusing autonomy with control over other people'],
  ['Mercury Moon Sun','إدخال الشعور والمعلومة في القرار دون إلغاء أحدهما','Including feelings and information without silencing either','اعتبار الارتياح دليلاً كافياً رغم وجود معلومات مخالفة','Treating comfort as sufficient evidence despite contrary information'],
  ['Sun Venus Saturn','تقدير جهدك حتى قبل أن يراه الآخرون','Recognizing your effort before anyone else notices it','تغيير معيار نجاحك في كل مرة تتغير فيها آراء الناس','Changing your standard of success whenever opinions change']
 ],
 [
  ['Moon Venus Saturn','تحديد السلوك المتكرر الذي يمنحك شعوراً بالاطمئنان','Identifying the repeated behavior that helps you feel secure','طلب تطمين جديد كل مرة دون معالجة سبب القلق','Seeking fresh reassurance without addressing the underlying worry'],
  ['Moon Saturn Mercury','تسمية الموقف الحساس وشرح أثره بكلمات محددة','Naming a sensitive situation and describing its specific impact','قراءة ملاحظة عابرة بوصفها رفضاً لشخصك كله','Reading a passing remark as rejection of your whole self'],
  ['Moon Saturn Neptune','إعطاء الحزن مساحة مع الحفاظ على احتياجاتك الأساسية','Allowing sadness while maintaining your basic needs','الانسحاب من كل مصادر الدعم في الوقت الذي تحتاجها فيه','Withdrawing from every source of support when it is needed'],
  ['Moon Venus Saturn','اختيار تواصل يخفف الوحدة ويحترم طاقتك الحالية','Choosing contact that eases loneliness and fits your energy','ملء الفراغ بأي علاقة رغم عدم الارتياح لها','Filling loneliness with any relationship despite discomfort'],
  ['Moon Mercury Venus','إيصال الشعور دون انتظار أن يفهمه الآخر تلقائياً','Expressing a feeling without expecting automatic understanding','إخفاء الاحتياج ثم محاسبة الطرف الآخر لأنه لم يكتشفه','Hiding a need and blaming someone for not discovering it'],
  ['Moon Venus Saturn','ملاحظة الفرق بين قرب مريح وقرب تقوده المخاوف','Distinguishing comfortable closeness from fear-driven proximity','تحويل تأخر بسيط في الرد إلى اختبار لقيمة العلاقة','Turning a delayed reply into a test of the relationship'],
  ['Moon Venus Saturn','معرفة أثر المكان والإيقاع اليومي على راحتك','Recognizing how surroundings and daily rhythm affect comfort','انتظار أن تصلح العلاقة وحدها تعباً ناتجاً عن نمط الحياة','Expecting a relationship alone to repair lifestyle exhaustion'],
  ['Moon Saturn Pluto','الفصل بين التسامح وإعادة منح الثقة بشروط واضحة','Separating forgiveness from rebuilding trust under clear conditions','تجاهل تكرار الأذى حتى تحافظ على صورة الشخص','Ignoring repeated harm to preserve an image of someone']
 ],
 [
  ['Mercury Saturn Sun','تحويل القرار إلى معايير يمكن المفاضلة بينها','Turning a decision into criteria that can be compared','جمع تفاصيل إضافية لا تغير القرار وتؤخر تنفيذه','Collecting details that delay action without changing the decision'],
  ['Mercury Jupiter Saturn','اختبار فهمك بالتطبيق والشرح بدلاً من الشعور بالألفة','Testing understanding through use and explanation rather than familiarity','اعتبار سهولة متابعة الشرح دليلاً على إتقان المهارة','Mistaking an easy explanation for mastery of a skill'],
  ['Mercury Neptune Moon','استخدام الحدس لاقتراح فرضية ثم فحصها','Using intuition to propose a hypothesis and then checking it','انتقاء المعلومة التي تؤيد إحساسك وترك ما يخالفه','Selecting evidence that confirms a feeling and ignoring objections'],
  ['Mercury Jupiter Uranus','متابعة سؤال يثير فضولك حتى تصل إلى معرفة أعمق','Following a compelling question toward deeper knowledge','التنقل بين المواضيع قبل تكوين فهم متماسك لأي منها','Switching subjects before developing coherent understanding'],
  ['Mercury Jupiter Saturn','ربط المعلومة الصغيرة بالهدف الذي تخدمه','Connecting a small detail to the purpose it serves','فقدان الهدف أثناء التدقيق أو إهمال قيد حاسم أثناء التعميم','Losing the goal in details or missing a decisive constraint'],
  ['Mercury Saturn Uranus','ترك هامش تعديل داخل خطة واضحة','Keeping room for adjustment within a clear plan','التمسك بالخطة بعد تغير الظروف التي بُنيت عليها','Clinging to a plan after its assumptions have changed'],
  ['Mercury Uranus Jupiter','فحص الفكرة الجديدة دون ربط قيمتها بكونها جديدة','Evaluating an idea independently of its novelty','الحماس للاختلاف قبل فهم تكلفة التطبيق','Celebrating novelty before understanding implementation costs'],
  ['Mercury Sun Jupiter','اختيار مشكلة تستحق وقتك وتنسجم مع اهتماماتك','Choosing a problem worthy of your time and interests','تحويل الفضول إلى التزام لا يخدم هدفاً تختاره','Turning curiosity into an obligation unrelated to chosen goals']
 ],
 [
  ['Mercury Moon Venus','تعديل درجة الصراحة بحسب وضوح العلاقة والسياق','Adjusting directness to the relationship and context','الافتراض أن أسلوبك المفضل مريح للجميع','Assuming your preferred style suits every listener'],
  ['Mercury Venus Jupiter','بناء الحوار على سؤال وإصغاء وتعقيب مرتبط بالجواب','Building conversation through questions, listening and relevant responses','محاولة إبهار المتحدث على حساب فهم ما يقوله','Trying to impress someone instead of understanding them'],
  ['Mercury Pluto Jupiter','فتح موضوع شخصي بقدر يسمح به ارتياح الطرفين','Opening a personal subject at a mutually comfortable pace','اعتبار كشف الأسرار شرطاً لوجود حوار عميق','Treating disclosure of secrets as necessary for depth'],
  ['Mercury Jupiter Mars','استخدام الدعابة بما يزيد الألفة ويترك مجالاً للاعتراض','Using humor that builds connection and permits objection','تغطية الإهانة بعبارة أنها مجرد مزحة','Excusing an insult by calling it a joke'],
  ['Mercury Venus Mars','إظهار الاهتمام بكلام واضح يتيح قبولاً أو رفضاً مريحاً','Expressing interest with room for comfortable acceptance or refusal','تأويل الرد المهذب بوصفه دعوة للاستمرار','Reading politeness as an invitation to persist'],
  ['Mercury Mars Saturn','شرح نقطة الاعتراض دون تحويلها إلى هجوم على الشخص','Explaining disagreement without attacking the person','رفع حدة الكلام حتى تضيع المسألة الأصلية','Escalating tone until the original issue is lost'],
  ['Mercury Moon Saturn','الاتفاق على إيقاع رسائل يناسب التزامات الطرفين','Agreeing on a messaging rhythm that fits both schedules','استنتاج النية من طول الرسالة أو سرعة الرد وحدهما','Inferring intent from message length or response speed alone'],
  ['Mercury Mars Moon','طلب استراحة محددة ثم العودة إلى النقطة المختلف عليها','Taking a defined pause and returning to the disputed issue','استخدام الصمت لإطالة التوتر أو انتزاع موافقة','Using silence to prolong tension or force agreement']
 ],
 [
  ['Saturn Sun Pluto','قبول ملاحظة محددة عن سلوك يمكن تغييره','Accepting specific feedback about changeable behavior','رفض الملاحظة لأنها تهدد الصورة التي تريدها عن نفسك','Rejecting feedback because it threatens your self-image'],
  ['Mars Moon Saturn','التعرف على أول علامة للانفعال قبل التصعيد','Recognizing the earliest sign of escalation','تبرير رد مؤذٍ لأن الموقف كان مستفزاً','Justifying a harmful response because the situation was provocative'],
  ['Saturn Mars Sun','تمييز الثبات على مبدأ عن التمسك بطريقة لم تعد نافعة','Distinguishing commitment to a principle from clinging to an ineffective method','رفض تعديل الوسيلة حتى عندما لا تحقق الغرض منها','Refusing to change a method even when it defeats its purpose'],
  ['Sun Venus Saturn','استقبال التقدير دون الحاجة إلى منافسة مستمرة عليه','Receiving recognition without constantly competing for it','المبالغة في عرض الإنجاز عند الشعور بعدم الانتباه','Overstating achievements when attention feels insufficient'],
  ['Moon Pluto Saturn','التحقق من الواقعة المؤذية قبل اختيار حد أو رد','Checking a hurtful event before choosing a boundary or response','معاقبة شخص على نية مفترضة قبل طلب توضيح','Punishing someone for presumed intentions before seeking clarification'],
  ['Pluto Mercury Saturn','استخدام التأثير لشرح اختيارك وترك حرية القرار لغيرك','Using influence to explain a choice while preserving others’ freedom','الضغط غير المباشر للحصول على موافقة تبدو طوعية','Applying indirect pressure to obtain apparently voluntary agreement'],
  ['Saturn Mercury Sun','تمييز السبب الحقيقي للتأخير عن التفسير المريح له','Distinguishing a real delay from a convenient explanation','إتقان تبرير التأجيل بدلاً من معالجة عائقه','Perfecting explanations for delay instead of removing the obstacle'],
  ['Moon Uranus Venus','إفساح مجال لاحتياجين مختلفين داخل اتفاق واقعي','Making room for different needs within a workable agreement','توقع قرب دائم وحرية مطلقة دون تفاوض','Expecting constant closeness and unrestricted freedom without negotiation']
 ],
 [
  ['Venus Moon Sun','تقييم الميل الخاص بحسب قيمك وأثره الفعلي','Evaluating a private preference by its values and real effects','اعتبار كل ما تخفيه عيباً يحتاج إلى إدانة','Condemning every private preference as a flaw'],
  ['Moon Saturn Pluto','الاعتراف بالحاجة للدعم دون التخلي عن استقلالك','Acknowledging support needs without abandoning autonomy','تكرار أنك لا تحتاج أحداً كي لا تختبر احتمال الخيبة','Insisting on needing nobody to avoid possible disappointment'],
  ['Moon Mercury Venus','تحويل الاحتياج غير المعلن إلى طلب يمكن فهمه','Turning an unspoken need into an understandable request','استبدال الطلب الواضح بتلميحات ثم الشعور بالإهمال','Replacing a clear request with hints and then feeling neglected'],
  ['Moon Saturn Venus','الفصل بين خوف الفقد وبين المؤشرات الواقعية للعلاقة','Separating fear of loss from actual relationship evidence','تصرفات وقائية تخلق البعد الذي كنت تخشاه','Taking precautions that create the distance you feared'],
  ['Venus Saturn Sun','تحمل رفض محدود دون تحويله إلى حكم على قيمتك','Tolerating a limited rejection without judging your whole worth','ترك الفرص كلها معلقة لتجنب جواب قد لا يعجبك','Leaving opportunities unresolved to avoid an unwelcome answer'],
  ['Uranus Venus Mercury','منح اهتمام غير مألوف مساحة آمنة للتجربة','Giving an unusual interest safe room for experimentation','إحاطة اهتمام بسيط بقصة سرية أكبر من حجمه','Turning an ordinary private interest into an inflated mystery'],
  ['Saturn Moon Sun','طلب مساعدة محددة مع الاحتفاظ بمسؤوليتك','Requesting specific help while retaining responsibility','تحمل كل العبء حتى يصير قبول العون أصعب','Carrying everything until accepting help becomes harder'],
  ['Saturn Moon Mercury','اختيار حدود مختلفة للمعلومات والعلاقات والأهداف','Choosing distinct boundaries for information, relationships and goals','توقع أن يفهم الآخر حدوداً لم توضحها له','Expecting others to understand boundaries you never explained']
 ],
 [
  ['Venus Sun Moon','ملاحظة القيم التي يجسدها التصرف الجذاب','Identifying the values expressed by an appealing action','الخلط بين الانجذاب إلى موقف ومعرفة الشخصية كاملة','Confusing attraction to one action with knowing the whole person'],
  ['Venus Moon Saturn','التعرف على اجتماع اللطف والحدود في سلوك واحد','Recognizing kindness and boundaries in the same behavior','تصنيف الحزم بروداً أو اللطف ضعفاً من دون سياق','Labeling firmness coldness or kindness weakness without context'],
  ['Venus Pluto Mercury','تمييز الفضول الممتع عن الغموض الذي يعيق الثقة','Distinguishing enjoyable curiosity from trust-eroding ambiguity','ملء نقص المعلومات بخيال يضاعف الانجذاب','Filling information gaps with fantasies that intensify attraction'],
  ['Venus Mercury Jupiter','تقدير الحماس والإصغاء مع المعرفة','Valuing enthusiasm and listening alongside knowledge','افتراض التوافق لمجرد تشابه الاهتمامات الفكرية','Assuming compatibility from shared intellectual interests alone'],
  ['Venus Uranus Moon','تحديث تفضيلاتك حين تتغير ظروف حياتك','Updating preferences as your circumstances change','التمسك بصورة قديمة لما يفترض أنه يجذبك','Clinging to an outdated image of what should attract you'],
  ['Venus Saturn Mars','اعتبار احترام الحدود سلوكاً جذاباً قابلاً للملاحظة','Recognizing respect for boundaries as an observable appealing quality','الإعجاب بالإصرار حتى حين يتجاوز رفضاً واضحاً','Admiring persistence even when it overrides a clear refusal'],
  ['Venus Ascendant Sun','الاحتفاظ بفضول التعارف بعد انطباع أول جميل','Staying curious after a pleasing first impression','منح المظهر الأول سلطة أكبر من السلوك اللاحق','Giving appearance more weight than subsequent behavior'],
  ['Venus Moon Saturn','ملاحظة الانجذاب الذي يتغير مع الثقة والخبرة المشتركة','Observing attraction as trust and shared experience develop','اعتبار هدوء الانبهار دليلاً تلقائياً على غياب التوافق','Treating calmer excitement as automatic evidence of incompatibility']
 ],
 [
  ['Venus Mercury Mars','إرسال إشارة اهتمام بسيطة ومراقبة التبادل','Offering a modest sign of interest and noticing reciprocity','زيادة الإشارات عندما يكون تجاوب الآخر غير واضح','Intensifying signals when the response remains unclear'],
  ['Venus Ascendant Mercury','قراءة التواصل البصري ضمن حديث وسياق أوسع','Reading eye contact within a wider interaction','بناء قصة عن النية من نظرة واحدة','Building a story about intent from a single glance'],
  ['Mars Venus Saturn','المبادرة مرة بوضوح وترك وقت ومساحة للرد','Making a clear invitation and allowing room to respond','اعتبار تكرار المحاولة دليلاً على قوة المشاعر','Treating repeated attempts as proof of stronger feelings'],
  ['Venus Mercury Saturn','اختيار توقيت ومكان يسمحان بمجاملة مريحة','Choosing a comfortable time and setting for a compliment','مفاجأة شخص بكلام حميم أمام جمهور لا يختاره','Surprising someone with intimate remarks before an unwanted audience'],
  ['Mercury Venus Sun','مدح اختيار أو جهد تعرفه بدلاً من ادعاء معرفة الداخل','Praising observed choices or effort rather than claiming inner knowledge','تضخيم المجاملة حتى تصير توقعاً يثقل التعارف','Inflating praise until it creates pressure in a new connection'],
  ['Mars Venus Ascendant','تكييف المبادرة مع الرد الفعلي لا مع تصنيف الشخص','Adapting an approach to actual responses rather than labels','اعتبار الخجل موافقة مخفية أو الجرأة اهتماماً مؤكداً','Treating shyness as hidden consent or boldness as certain interest'],
  ['Venus Moon Mercury','صنع جو يتيح انتباهاً متبادلاً وحديثاً غير متكلف','Creating a setting for mutual attention and unforced conversation','الانشغال بإخراج اللقاء أكثر من راحة المشاركين فيه','Focusing on staging an encounter more than participants’ comfort'],
  ['Venus Saturn Mercury','التوقف عند سلوك ينفرك حتى لو استمر الانجذاب','Acknowledging a turn-off even while attraction remains','تبرير المقاطعة والاستهزاء حفاظاً على صورة رومانسية','Excusing interruption or ridicule to preserve a romantic image']
 ],
 [
  ['Venus Neptune Moon','الاستمتاع ببداية المشاعر مع إبقاء مساحة للتعرف','Enjoying emerging feelings while leaving room to learn','نسب صفات لشخص لم تتح لك فرصة ملاحظتها بعد','Assigning qualities you have not yet had time to observe'],
  ['Moon Venus Saturn','ربط زيادة الثقة بمواقف متكررة يمكن تذكرها','Linking growing trust to repeated and memorable experiences','التعامل مع كثافة التواصل كبديل عن اختبار الاعتمادية','Treating intense contact as a substitute for demonstrated reliability'],
  ['Venus Moon Saturn','التفريق بين حماس اللقاء والاستعداد لالتزام فعلي','Distinguishing early excitement from readiness for commitment','إعطاء ثقة طويلة الأمد لتواصل مكثف قصير','Granting long-term trust after a brief period of intense contact'],
  ['Venus Uranus Saturn','إدخال التجديد ضمن علاقة يمكن الاعتماد عليها','Introducing novelty within a dependable relationship','افتعال القلق حتى يبدو الرابط أكثر شغفاً','Manufacturing uncertainty to make a bond feel more passionate'],
  ['Venus Moon Mercury','سؤال الشريك عن الفعل الذي يجعله يشعر بالمحبة','Asking which actions help a partner feel loved','تقديم ما تحبه أنت مع تجاهل ما يفضله الطرف الثاني','Offering your preference while overlooking the other person’s'],
  ['Moon Uranus Venus','طلب القرب أو المساحة مع توضيح المدة والسبب','Requesting closeness or space with a clear duration and reason','استخدام المساحة ستاراً للاختفاء دون اتفاق','Using personal space to justify disappearing without agreement'],
  ['Mercury Venus Saturn','مقارنة التعبير اللفظي بنمط الفعل عبر الوقت','Comparing loving language with actions over time','الاكتفاء بوعود متكررة لا يتبعها تغير ملموس','Accepting repeated promises without observable change'],
  ['Venus Sun Moon','إيصال التقدير بصيغة يفهمها الشخص المقصود','Expressing appreciation in a form the recipient understands','انتظار أن يعرف الآخر مقدار امتنانك دون تعبير','Expecting gratitude to be understood without expressing it']
 ],
 [
  ['Venus Moon Saturn','تحديد قيم الشراكة قبل الانشغال بتشابه المزاج','Defining partnership values before focusing on matching moods','اعتبار الانسجام اللحظي اتفاقاً على القرارات الأساسية','Mistaking momentary harmony for agreement on major decisions'],
  ['Venus Mars Saturn','مراجعة التصرفات اليومية بعد الانجذاب الأول','Reviewing everyday conduct after initial attraction','إعفاء شخص جذاب من معايير الاحترام التي تهمك','Exempting an attractive person from your standards of respect'],
  ['Venus Uranus Saturn','بناء اتفاق يتيح اهتمامات مشتركة وأخرى مستقلة','Building an agreement with shared and independent interests','اشتراط التشابه الكامل حتى تشعر بالأمان','Requiring complete similarity to feel secure'],
  ['Sun Venus Saturn','اختيار شريك يدعم طموحك ضمن توزيع وقت منصف','Choosing a partner who supports ambition within a fair schedule','افتراض أن الطموح المشترك يحل وحده تضارب الأولويات','Assuming shared ambition resolves competing priorities by itself'],
  ['Moon Mercury Venus','توضيح الاحتياج العاطفي بلغة يمكن الاستجابة لها','Explaining emotional needs in language someone can act on','استخدام التوقعات غير المعلنة معياراً لنجاح الشريك','Judging a partner by expectations never communicated'],
  ['Mercury Venus Jupiter','تقدير حوار يسمح بالاختلاف والسؤال دون تقليل','Valuing conversation that allows questions and respectful disagreement','اختيار الإبهار الفكري مع تجاهل الاحتقار في الحوار','Choosing intellectual brilliance while overlooking conversational contempt'],
  ['Saturn Venus Sun','اختبار معنى الاحترام عند اختلاف أو وعد مكسور','Testing the meaning of respect during disagreement or a broken promise','الاعتماد على وصف الشخص لقيمه دون رؤية تطبيقها','Relying on stated values without observing their application'],
  ['Venus Saturn Jupiter','مناقشة السكن والأطفال والالتزامات قبل قرار كبير','Discussing home, children and responsibilities before major commitment','تأجيل خلاف جوهري على أمل أن يختفي مع الحب','Postponing fundamental disagreement in the hope love erases it']
 ],
 [
  ['Saturn Venus Sun','تمييز رغبتك بالالتزام عن الحاجة إلى إرضاء المحيط','Separating a wish to commit from pressure to satisfy others','اختيار توقيت الزواج استجابة للمقارنة الاجتماعية','Timing marriage in response to social comparison'],
  ['Venus Saturn Moon','تخيل التعاون خلال المرض والتعب والمسؤوليات','Imagining cooperation during illness, fatigue and responsibility','بناء تصور المستقبل على أيام الراحة وحدها','Building a future around easy days alone'],
  ['Saturn Venus Uranus','تجديد عادات المشاركة مع حماية استقرار الاتفاق','Refreshing shared routines while protecting the agreement','تفسير الملل المؤقت بوصفه نهاية حتمية للمشاعر','Reading temporary boredom as an inevitable end to affection'],
  ['Uranus Venus Saturn','الاتفاق على وقت خاص ينسجم مع وقت مشترك واضح','Agreeing on personal time alongside defined shared time','ترك معنى الاستقلال غامضاً بين الطرفين','Leaving the meaning of independence undefined'],
  ['Saturn Moon Venus','توزيع العمل الظاهر وغير المرئي بطريقة قابلة للمراجعة','Sharing visible and invisible work through revisable agreements','قياس الإنصاف بعدد المهام دون النظر إلى كلفتها','Measuring fairness by task count without considering their burden'],
  ['Saturn Mercury Mars','كشف التوقع المختلف خلف خلاف عملي متكرر','Uncovering different expectations behind recurring practical disputes','مناقشة العرض الظاهر وترك أصل الخلاف دون تسمية','Arguing over symptoms while leaving the underlying dispute unnamed'],
  ['Saturn Venus Pluto','الجمع بين الثقة والمساءلة عند الإخلال بالاتفاق','Combining trust with accountability after a broken agreement','اعتبار طلب التوضيح دليلاً على انعدام الحب','Treating a request for clarification as a lack of love'],
  ['Saturn Moon Mars','مناقشة جدية الالتزام خارج لحظة الخصام','Discussing commitment outside the heat of an argument','استخدام التهديد بالرحيل وسيلة لإنهاء أي خلاف','Threatening departure as a way to end every disagreement']
 ],
 [
  ['Venus Moon Mars','اختيار قرب يناسب الطاقة والوقت والارتياح المشترك','Choosing closeness that fits energy, timing and mutual comfort','توقع نجاح مبادرة رومانسية لمجرد حسن النية','Expecting a romantic initiative to work solely because intentions are kind'],
  ['Moon Venus Saturn','معرفة ما يهيئ الأمان قبل أي تقارب حميم','Learning what establishes safety before intimate closeness','افتراض أن ما يطمئن شخصاً يطمئن كل شريك','Assuming what reassures one person reassures every partner'],
  ['Mars Venus Moon','إفساح مجال لمبادرة ورغبة واضحتين من الطرفين','Making room for clear initiative and desire on both sides','اعتبار استمرار العلاقة موافقة تلقائية على كل مبادرة','Treating an ongoing relationship as automatic consent to every initiative'],
  ['Venus Uranus Saturn','مناقشة التجديد بما يحفظ الراحة وحق التراجع','Discussing novelty while preserving comfort and the right to stop','تحويل الرغبة بالتجربة إلى ضغط لإثبات الانفتاح','Turning experimentation into pressure to prove openness'],
  ['Moon Venus Neptune','الانتباه لخصوصية المكان والتعب والحالة المزاجية','Considering privacy, fatigue and present mood','نسب عدم الارتياح لصفة ثابتة وإغفال ظرف قابل للتغيير','Attributing discomfort to a fixed trait while overlooking context'],
  ['Saturn Venus Mars','احترام تغير الرأي دون طلب تبرير أو تعويض','Respecting a change of mind without demanding justification or compensation','اعتبار التردد تحدياً ينبغي التغلب عليه','Treating hesitation as a challenge to overcome'],
  ['Mercury Moon Venus','السؤال عن الارتياح بلغة تتيح جواباً صادقاً','Asking about comfort in language that permits an honest answer','الاعتماد على الصمت لتجنب محادثة ضرورية','Relying on silence to avoid a necessary conversation'],
  ['Saturn Moon Venus','مراجعة الحدود كلما تغير السياق أو الرغبة','Revisiting boundaries when context or desire changes','نقل موافقة سابقة إلى موقف جديد دون سؤال','Carrying previous consent into a new situation without asking']
 ],
 [
  ['Neptune Venus Moon','التفريق بين خيال خاص ورغبة في تطبيقه','Distinguishing a private fantasy from a wish to enact it','اعتبار كل فكرة التزاماً أو تعريفاً لهويتك','Treating every thought as a commitment or identity label'],
  ['Pluto Venus Saturn','مناقشة فضول نظري دون افتراض قبول سلوك فعلي','Discussing theoretical curiosity without assuming behavioral consent','استنتاج تفضيل حميم من اهتمام فكري بأدوار القوة','Inferring an intimate preference from intellectual interest in power roles'],
  ['Mars Venus Saturn','اختيار الدور المناسب للموقف باتفاق مستقل','Choosing a context-appropriate role through a separate agreement','إسقاط دور القيادة اليومي على الحياة الحميمية','Projecting everyday leadership onto intimate preferences'],
  ['Venus Neptune Mercury','الاستمتاع بالغموض الفني مع وضوح الحدود الواقعية','Enjoying imaginative mystery alongside clear real-world boundaries','استخدام التلميح بديلاً عن سؤال صريح عند التردد','Substituting hints for a clear question when hesitation appears'],
  ['Uranus Venus Saturn','مناقشة فكرة جديدة مع إبقاء حق عدم تجربتها','Discussing a new idea while preserving the choice not to try it','اعتبار الفضول الأول موافقة على المضي حتى النهاية','Treating initial curiosity as consent to complete an activity'],
  ['Moon Saturn Mercury','بناء ثقة تسمح بالسؤال والرفض دون إحراج','Building trust that permits questions and refusal without embarrassment','اختبار القرب بمدى استعداد الآخر لتجاوز حدوده','Testing intimacy by willingness to cross personal boundaries'],
  ['Uranus Venus Mercury','استكشاف اهتماماتك بكلمات تختارها أنت','Exploring interests using language you choose yourself','إلصاق هوية أو ممارسة بشخص اعتماداً على خارطته','Assigning identity or practices to someone from their chart'],
  ['Saturn Moon Venus','حماية الخصوصية مع وضوح ما يلزم للاتفاق المشترك','Protecting privacy while clarifying what a shared agreement needs','اعتبار الامتناع عن كشف فكرة خاصة نقصاً في الثقة','Treating a private thought left undisclosed as a failure of trust']
 ],
 [
  ['Moon Venus Pluto','تحديد الحدث الذي أثار الغيرة قبل تفسيره','Identifying what triggered jealousy before interpreting it','التعامل مع الإحساس بوصفه دليلاً على خيانة','Treating a feeling as evidence of betrayal'],
  ['Mars Moon Saturn','طرح سؤال عن واقعة أثارت التهديد قبل رد فعل حاد','Asking about a threatening event before reacting sharply','تراكم الافتراضات عن المنافسة قبل إعطاء فرصة للتوضيح','Accumulating assumptions about a rival before allowing clarification'],
  ['Moon Venus Saturn','رعاية اهتمامات ودعم اجتماعي خارج العلاقة','Maintaining interests and social support outside a relationship','جعل شخص واحد المصدر الوحيد للأمان والقيمة','Making one person the sole source of security and worth'],
  ['Moon Saturn Venus','طلب طمأنة محددة دون جعلها شرطاً متجدداً بلا نهاية','Requesting specific reassurance without making it an endless condition','نقل مسؤولية تهدئة كل قلق إلى الشريك','Making a partner responsible for calming every worry'],
  ['Moon Saturn Pluto','التمييز بين قلق قديم ومؤشر حالي يحتاج نقاشاً','Distinguishing earlier anxiety from current evidence needing discussion','إسقاط تجربة مؤلمة سابقة على كل تصرف للشريك الحالي','Projecting an earlier painful experience onto every current action'],
  ['Pluto Venus Saturn','التفريق بين شعور الغيرة وقرار تقييد حرية الآخر','Separating jealousy as a feeling from restricting someone’s freedom','فرض قواعد للرقابة لا تقبل أن تطبق عليك','Imposing monitoring rules you would not accept for yourself'],
  ['Moon Saturn Venus','تنظيم المسافة والدعم بعد الانفصال بحسب حاجتك الواقعية','Arranging distance and support after separation according to actual needs','استخدام تواصل متكرر لإطالة علاقة انتهى اتفاقها','Using repeated contact to prolong a relationship whose agreement has ended'],
  ['Moon Venus Neptune','قبول بقاء ذكرى مع بناء روتين وحياة حاضرة','Allowing a memory while building present routines and connections','اعتبار تذكر شريك سابق دليلاً على وجوب العودة إليه','Treating memory of a former partner as a reason you must return']
 ],
 [
  ['Venus Saturn Neptune','مقارنة بداية العلاقة بتصرفات تظهر مع مرور الوقت','Comparing early impressions with behavior revealed over time','إعادة اختيار النمط نفسه مع تغيير التبرير فقط','Choosing the same pattern repeatedly while changing only the explanation'],
  ['Mercury Mars Saturn','تحديد المسألة التي تعود بعد كل مصالحة','Identifying the issue that returns after each reconciliation','إنهاء الخصام دون تعديل الاتفاق الذي يولده','Ending an argument without revising the agreement that recreates it'],
  ['Venus Saturn Neptune','ملاحظة استعداد الشخص للتواصل المتبادل لا وعده بالقرب فقط','Observing readiness for reciprocal contact rather than promises alone','تحويل الانتظار المستمر لشخص غير متاح إلى دليل إخلاص','Treating endless waiting for an unavailable person as proof of devotion'],
  ['Mercury Mars Venus','طرح خلاف صغير مبكراً بلغة محددة','Raising a small disagreement early in specific language','تقديم تنازلات صامتة ثم المطالبة بمقابل لم يُتفق عليه','Making silent sacrifices and later demanding an unagreed return'],
  ['Venus Neptune Saturn','إبقاء توقعك عن العلاقة قابلاً للتعديل مع المعرفة','Keeping expectations open to revision as knowledge grows','توقع تفاهم تلقائي يلغي الحاجة إلى الاتفاق والكلام','Expecting automatic understanding to replace discussion and agreement'],
  ['Moon Saturn Mercury','توضيح حاجتك لاستراحة مع وقت للعودة إلى الحوار','Explaining a need for a pause with a time to resume discussion','ترك الطرف الآخر يفسر انسحاباً متكرراً دون توضيح','Leaving someone to interpret recurring withdrawal without explanation'],
  ['Moon Venus Saturn','تمييز الرغبة بخير الشخص عن الخوف من فقده','Distinguishing care for a person from fear of losing them','اعتبار صعوبة الابتعاد دليلاً كافياً على صحة العلاقة','Treating difficulty leaving as sufficient evidence of a healthy relationship'],
  ['Venus Saturn Jupiter','تحويل مراجعة العلاقة إلى معيار عملي للخطوة التالية','Turning relationship reflection into criteria for the next step','الاستمرار لمجرد أن وقتاً طويلاً قد استُثمر','Continuing solely because much time has already been invested']
 ],
 [
  ['Ascendant Venus Moon','اختيار جرعة تواصل تناسب طاقتك لا صورة اجتماعية مفروضة','Choosing contact levels that fit your energy rather than an imposed image','الموافقة على لقاءات تستنزفك خوفاً من سوء الفهم','Accepting exhausting invitations for fear of being misunderstood'],
  ['Venus Mercury Jupiter','بناء صداقة من اهتمام متبادل ومواقف صغيرة','Building friendship through mutual interest and small shared experiences','اعتبار الألفة السريعة ضماناً لثقة عميقة','Treating rapid familiarity as a guarantee of deep trust'],
  ['Sun Venus Ascendant','المشاركة بطريقة تضيف للمجموعة دون إلغاء صوتك','Contributing to a group without losing your own voice','مطابقة رأي الجماعة رغم عدم اقتناعك به','Matching group opinion despite personal disagreement'],
  ['Sun Mercury Ascendant','اختيار دور اجتماعي يسمح لك بالمشاركة والتعلم','Choosing a social role that permits contribution and learning','البقاء في دور المسلي أو المنقذ حتى حين يستنزفك','Remaining the entertainer or rescuer even when it drains you'],
  ['Sun Venus Moon','طلب اهتمام بطريقة تسمح أيضاً بحضور الآخرين','Seeking attention while making room for other people','قياس نجاحك الاجتماعي بمقدار سيطرتك على الحديث','Measuring social success by how much conversation you control'],
  ['Venus Saturn Moon','بناء الثقة في الصداقة من حفظ اتفاقات ومعلومات','Building friendship trust through kept agreements and confidences','كشف خصوصية كبيرة قبل اختبار الاعتمادية في مواقف صغيرة','Sharing major confidences before testing reliability in small situations'],
  ['Moon Saturn Uranus','اختيار مساحة هادئة دون قطع روابط مهمة','Choosing quiet time without severing important connections','إهمال تواصل ترغب به بسبب تأجيل متكرر','Neglecting wanted contact through repeated postponement'],
  ['Venus Uranus Mercury','تقدير أصدقاء يضيفون منظوراً مختلفاً ويحترمون قيمك','Valuing friends with different perspectives who respect your values','حصر الصداقة في تشابه كامل يضيق فرص التعارف','Requiring complete similarity and narrowing opportunities for friendship']
 ],
 [
  ['Moon Saturn Sun','اختيار القيم العائلية التي تريد استمرارها عن قناعة','Choosing which family values to continue deliberately','اتباع عرف مؤذٍ فقط لأنه مألوف منذ الطفولة','Following a harmful custom solely because it is familiar'],
  ['Moon Venus Saturn','تحديد ما يجعل البيت مريحاً ضمن ظروفه الواقعية','Defining home comfort within actual circumstances','مطاردة صورة مثالية للبيت على حساب راحة ساكنيه','Pursuing an ideal home image at residents’ expense'],
  ['Moon Saturn Venus','بناء قرب عائلي يسمح بالاختلاف والحدود','Building family closeness that allows differences and boundaries','قياس المحبة بمقدار التنازل عن قرارك الشخصي','Measuring love by surrender of personal decisions'],
  ['Saturn Sun Moon','شرح قرارك للأهل دون الوعد بإرضاء الجميع','Explaining decisions to family without promising universal approval','تحمل توقعات متعارضة ثم لوم نفسك على عدم تحقيقها','Carrying contradictory expectations and blaming yourself for failing them'],
  ['Moon Pluto Saturn','ملاحظة عادة موروثة وتحديد بديل عملي لها','Recognizing an inherited habit and choosing a workable alternative','تفسير تكرار السلوك بأنه قدر عائلي لا يتغير','Treating repeated behavior as an unchangeable family fate'],
  ['Moon Mars Saturn','إنشاء قواعد حوار تحفظ الأمان وقت الخلاف المنزلي','Creating discussion rules that protect safety during domestic conflict','تطبيع الخوف أو الصراخ بوصفه جزءاً عادياً من البيت','Normalizing fear or shouting as an ordinary part of home life'],
  ['Moon Venus Jupiter','بحث مسؤوليات تكوين عائلة إلى جانب الرغبة فيها','Considering family responsibilities alongside the wish to start one','اتخاذ قرار الإنجاب أو الرعاية استجابة لضغط خارجي','Choosing parenthood or caregiving in response to external pressure'],
  ['Moon Uranus Saturn','تحديد شكل استقلال يحافظ على الروابط التي تختارها','Defining independence that preserves chosen family ties','تحويل كل اختلاف مع الأهل إلى قطع أو خضوع كامل','Turning every family disagreement into total submission or estrangement']
 ],
 [
  ['MC Saturn Sun','ربط بيئة العمل بمهام وشروط تستطيع وصفها','Connecting a work environment to concrete tasks and conditions','اختيار مسمى جذاب مع تجاهل يوم العمل الفعلي','Choosing an appealing title while ignoring the actual working day'],
  ['Mercury Venus MC','اختبار مهمة تقنية وأخرى إبداعية قبل تصنيف قدراتك','Trying technical and creative tasks before categorizing abilities','اعتبار الميل المعلن بديلاً عن تجربة العمل نفسه','Treating a stated preference as a substitute for trying the work'],
  ['Sun Saturn MC','تحديد متى تضيف القيادة قيمة ومتى يخدمك التركيز المستقل','Identifying when leadership adds value and when independent focus helps','طلب دور قيادي دون رغبة في مسؤولياته اليومية','Seeking leadership without wanting its everyday responsibilities'],
  ['MC Saturn Mercury','فحص طريقة القرار والتواصل داخل المؤسسة قبل الانضمام','Examining organizational decisions and communication before joining','الاكتفاء بقيم معلنة لا تظهر في الممارسات','Accepting advertised values absent from daily practices'],
  ['Saturn Jupiter MC','تقدير المخاطرة المهنية بحسب الموارد والبدائل المتاحة','Assessing career risk against available resources and alternatives','تسمية اندفاع غير محسوب شجاعة مهنية','Calling an unexamined impulse professional courage'],
  ['Sun Saturn Jupiter','تمييز الإنجاز الذي يهمك عن المكافأة التي تبدو لامعة','Distinguishing meaningful achievement from a glamorous reward','الاستمرار في مسار مرهق لأن الاعتراف الخارجي مرتفع','Remaining in an exhausting path because external recognition is high'],
  ['Mars Sun MC','استخدام المنافسة لتحسين أداء يمكن قياسه','Using competition to improve measurable performance','الانشغال بتجاوز الزملاء على حساب جودة العمل','Focusing on outperforming colleagues at the expense of quality'],
  ['Saturn Mercury MC','تحديد عادة مهنية تعطل النتيجة ويمكن تعديلها','Identifying a work habit that impedes results and can change','استخدام وصف الشخصية عذراً لتجنب تطوير مهارة مطلوبة','Using personality labels to avoid developing a needed skill']
 ],
 [
  ['Venus Saturn Jupiter','تسمية ما يمثله المال لك ومقارنته بواقع اختياراتك','Naming what money represents and comparing it with actual choices','استخدام الرصيد وحده لقياس القيمة الشخصية','Using account balance as the sole measure of self-worth'],
  ['Venus Saturn Jupiter','معرفة أثر المصروف الصغير المتكرر على أولوياتك','Recognizing how repeated small purchases affect priorities','الحكم على عاداتك المالية من عملية شراء استثنائية','Judging financial habits by one exceptional purchase'],
  ['Saturn Uranus Venus','تعريف الأمان والحرية بأهداف عملية تخص ظروفك','Defining security and freedom through goals suited to your circumstances','معاملة كل توفير حرماناً أو كل إنفاق تحرراً','Treating all saving as deprivation or all spending as liberation'],
  ['Jupiter Saturn Venus','مراجعة قدرتك على تحمل الخسارة قبل وصف ميلك للمخاطرة','Reviewing loss tolerance before labeling risk preferences','استخدام الخارطة مبرراً لقرار استثماري أو ثقة في ربح','Using a chart to justify an investment or confidence in profit'],
  ['Venus Moon Jupiter','التعرف على الشعور الذي يسبق شراءً غير مخطط','Recognizing the feeling preceding an unplanned purchase','تكرار الشراء لتسكين شعور دون ملاحظة النمط','Repeatedly buying to soothe a feeling without noticing the pattern'],
  ['Saturn Mercury Jupiter','اختيار أسلوب متابعة تستطيع الاستمرار عليه فعلياً','Choosing a tracking method you can sustain in practice','بناء خطة مفصلة لا تناسب دخلك أو وقتك','Building a detailed plan unsuited to income or available time'],
  ['Moon Saturn Venus','تمييز التزام مالي حقيقي عن خوف يحتاج معلومات','Distinguishing a real obligation from worry requiring information','تجنب مراجعة الأرقام لأن توقعها يبدو مخيفاً','Avoiding actual figures because imagined numbers feel frightening'],
  ['Saturn Venus Jupiter','اختيار تغيير مالي صغير ومراجعة أثره بأرقام فعلية','Choosing a small financial change and reviewing its actual figures','استبدال المتابعة الواقعية بتوقع رمزي عن الحظ','Replacing practical tracking with symbolic expectations of luck']
 ],
 [
  ['Venus Neptune Mercury','تحويل إحساس فني إلى عمل صغير يمكن عرضه ومراجعته','Turning an artistic impression into a small reviewable work','انتظار إلهام كامل قبل إنتاج أي تجربة','Waiting for complete inspiration before making anything'],
  ['Venus Moon Neptune','استكشاف الموسيقى بالاستماع والممارسة لا بتوقع نوع مفضل','Exploring music through listening and practice rather than predicted taste','اعتبار موضع كوكب دليلاً على موهبة موسيقية مكتسبة','Treating a placement as proof of developed musical ability'],
  ['Mercury Venus Neptune','مقارنة تجربة كتابة وتجربة بصرية بالجهد والرضا الناتج','Comparing writing and visual work through effort and satisfaction','حصر الإبداع في وسيط واحد قبل تجربتهما','Restricting creativity to one medium before trying both'],
  ['Venus Mercury Saturn','تحسين تصميم وفق غرضه وقابلية استخدامه','Improving a design according to purpose and usability','الخلط بين ذوقك الشخصي واحتياجات من يستخدم التصميم','Confusing personal taste with the needs of a design’s users'],
  ['Venus Saturn Neptune','إنهاء مشروع محدود يكشف أسلوب عملك الإبداعي','Completing a bounded project that reveals your creative process','بدء مشاريع كثيرة لإبقاء كل فكرة في صورة مثالية','Starting many projects to keep every idea idealized'],
  ['Uranus Mercury Venus','تجريب حل غير مألوف ومقارنته بنتيجة أبسط','Trying an unconventional solution against a simpler alternative','اعتبار التعقيد أو الغرابة دليلاً كافياً على الابتكار','Treating complexity or strangeness as sufficient evidence of innovation'],
  ['Sun Venus MC','اختبار الحضور أمام جمهور صغير مع ملاحظة قابلة للتطبيق','Trying a small audience with actionable feedback','ربط قيمة التعبير كله برد فعل أول جمهور','Tying all expressive value to the first audience’s response'],
  ['Venus Mercury Jupiter','منح مهارة محتملة وقت تدريب محدداً قبل الحكم عليها','Giving a possible skill defined practice time before judging it','اعتبار غياب السهولة الأولى دليلاً على غياب الموهبة','Treating initial difficulty as proof of absent talent']
 ],
 [
  ['Venus Neptune Moon','تمييز ما تحبه بصرياً مما اعتدت رؤيته فقط','Distinguishing visual preference from mere familiarity','اختيار ذوق مستعار لإرضاء صورة اجتماعية','Borrowing a taste to satisfy a social image'],
  ['Venus Saturn Uranus','مزج قطعة مألوفة وأخرى معاصرة وفق استخدامك الحقيقي','Mixing familiar and contemporary pieces for actual use','اتباع تصنيف كلاسيكي أو حديث حتى حين لا يناسبك','Following a classic or modern label despite poor personal fit'],
  ['Venus Sun Uranus','اختيار مقدار ظهور يريحك في المكان المقصود','Choosing a degree of visibility comfortable for the setting','الاعتقاد أن البساطة نقص أو أن الجرأة شرط للتميز','Believing simplicity is lacking or boldness is necessary for distinction'],
  ['Venus Sun Moon','اختبار لوحة ألوان على ضوء وخامة واستخدام فعلي','Testing a palette with real lighting, materials and use','عرض لون رمزي بوصفه لونك الحقيقي أو الأنسب قطعاً','Presenting a symbolic color as your objectively correct choice'],
  ['Venus Neptune Moon','مقارنة العطر بعد تجربته على مهل وفي ظروفك','Comparing fragrances after unhurried trials in your own conditions','استنتاج تفضيل حسي دقيق من برج أو كوكب','Inferring a precise sensory preference from a sign or planet'],
  ['Venus Saturn Jupiter','تقدير جودة الاستخدام بجانب الجاذبية البصرية','Considering useful quality alongside visual appeal','دفع كلفة إضافية لمظهر لا يحقق حاجة تختارها','Paying extra for an appearance that serves no chosen need'],
  ['Moon Venus Saturn','تنسيق مساحة تخدم روتين ساكنيها وراحتهم','Arranging a space around its occupants’ routines and comfort','نسخ صورة جميلة تتعارض مع مساحة البيت واستخدامه','Copying an attractive image incompatible with the home’s use'],
  ['Venus Mercury Saturn','ملاحظة التفصيل الذي يحسن التوازن أو الوضوح','Noticing details that improve balance or clarity','الاستمرار في تعديلات دقيقة لا تحسن النتيجة','Continuing fine adjustments that no longer improve the result']
 ],
 [
  ['Sun Mars Saturn','تحديد إنجاز يستحق الجهد حتى دون تصفيق','Defining an achievement worth pursuing without applause','مطاردة كل فرصة تثبت القدرة ولو شتتت أولوياتك','Chasing every chance to prove ability despite scattered priorities'],
  ['Pluto Sun Saturn','اختيار تأثير قابل للمساءلة دون احتكار القرار','Choosing accountable influence without monopolizing decisions','اعتبار الامتثال الصامت دليلاً على اقتناع الفريق','Treating silent compliance as evidence of team agreement'],
  ['Sun Venus Saturn','طلب اعتراف محدد بجهد واضح بدلاً من انتظار التخمين','Requesting recognition for clear effort instead of waiting to be noticed','تقييم عملك كله بحسب حجم الانتباه الذي يحصل عليه','Judging all your work by the attention it receives'],
  ['Sun Ascendant Saturn','اختيار مساحة ظهور تخدم هدفك وتحترم خصوصيتك','Choosing visibility that serves goals and respects privacy','الموافقة على انكشاف لا تريده خوفاً من ضياع الفرصة','Accepting unwanted exposure for fear of losing an opportunity'],
  ['Mars Pluto Sun','الرد على المنافسة بتطوير ما يقع تحت سيطرتك','Responding to competition by improving what you control','تحويل اختلاف الأداء إلى صراع على القيمة الشخصية','Turning performance differences into a struggle over personal worth'],
  ['Sun Venus Moon','توضيح طريقة تقدير تفضلها دون فرضها على الجميع','Explaining preferred recognition without prescribing it for everyone','اعتبار شكل التكريم غير المفضل دليلاً على عدم التقدير','Treating an unfamiliar recognition style as lack of appreciation'],
  ['Sun Saturn Mars','الجمع بين حسم القرار وسماع المعلومة المخالفة','Combining decisiveness with hearing contrary information','التمسك بقرار خاطئ حتى لا تبدو متردداً','Defending a mistaken decision to avoid appearing uncertain'],
  ['Saturn Sun Moon','تسمية الكلفة التي تقبلها وتلك التي لا تريد دفعها','Naming the costs you accept and those you decline','زيادة التضحيات بعد كل إنجاز دون مراجعة عائدها','Increasing sacrifices after every achievement without reviewing the return']
 ],
 [
  ['Moon Saturn Uranus','بناء روتين يخفف العبء مع مساحة لتغير اليوم','Building a burden-reducing routine with room for daily changes','تحويل العادة المريحة إلى قيد لا يمكن تعديله','Turning a helpful habit into an inflexible restriction'],
  ['Moon Sun Saturn','معرفة وقت نشاطك من متابعة نومك وأدائك الفعلي','Learning active hours from sleep and performance observations','اعتبار الولادة دليلاً على نمط صباحي أو مسائي ثابت','Treating birth data as proof of a fixed morning or evening type'],
  ['Moon Mars Venus','اختيار مستوى حركة يناسب المهمة وطاقة اليوم','Choosing stimulation that fits the task and current energy','تفسير الحاجة المؤقتة للهدوء بوصفها طبعاً دائماً','Treating a temporary need for quiet as a permanent disposition'],
  ['Moon Venus Jupiter','تجريب طعام وروتين طبخ يناسبان وقتك وذوقك','Trying food and cooking routines that fit your time and taste','نسب تفضيل غذائي محدد للخارطة دون تجربة','Attributing a specific food preference to a chart without trying it'],
  ['Moon Venus Uranus','موازنة متعة المكان مع حاجتك الفعلية للراحة','Balancing enjoyment of a venue with actual recovery needs','اختيار مكان مرهق فقط لأنه يلائم صورة عن شخصيتك','Choosing an exhausting venue to match an identity label'],
  ['Jupiter Uranus Saturn','ترك جزء مرن في رحلة لها أساس عملي واضح','Keeping flexibility within a practically grounded trip','المبالغة في التخطيط أو الارتجال بما يضيع غرض السفر','Overplanning or improvising until the purpose of travel is lost'],
  ['Venus Saturn Jupiter','اختيار مقتنى بحسب استخدامه والرضا المستمر عنه','Choosing possessions by use and sustained satisfaction','تكديس مقتنيات تعبر عن صورة لا عن حاجة','Accumulating possessions to represent an image rather than a need'],
  ['Moon Venus Neptune','تمييز استرخاء يجدد طاقتك عن تشتيت يؤجل التعب','Distinguishing restorative rest from distraction that postpones fatigue','العودة لنشاط مريح ظاهرياً يتركك أكثر إنهاكاً','Repeating seemingly relaxing activities that leave you more exhausted']
 ],
 [
  ['Mars Moon Saturn','معرفة أول استجابة للضغط واختيار خطوة قابلة للتنفيذ','Recognizing an initial stress response and choosing an actionable step','تعميم رد فعل يوم صعب على شخصيتك كلها','Generalizing one difficult day’s response to your entire character'],
  ['Mars Moon Mercury','وصف سبب الغضب دون تهديد أو تقليل','Describing the source of anger without threats or contempt','استخدام الغضب لتبرير تجاوز حدود الآخرين','Using anger to justify crossing other people’s boundaries'],
  ['Mars Saturn Moon','اختيار مواجهة أو تأجيل بحسب أمان الموقف وفائدته','Choosing confrontation or delay according to safety and usefulness','اعتبار المواجهة شجاعة دائماً والتأجيل ضعفاً دائماً','Treating confrontation as always brave and delay as always weak'],
  ['Mars Mercury Saturn','تمييز تأخير خارج سيطرتك عن عائق تستطيع تغييره','Distinguishing uncontrollable delay from an obstacle you can change','استنزاف طاقتك في مقاومة ما لا يتغير الآن','Exhausting energy resisting what cannot currently change'],
  ['Moon Saturn Mars','طلب نوع مساعدة محدد مع توضيح ما ستفعله بنفسك','Requesting specific help while clarifying your own contribution','رفض الدعم حتى تتجاوز الضغوط قدرتك العملية','Refusing support until demands exceed practical capacity'],
  ['Mercury Saturn Moon','تمييز تفكير ينتج معلومة جديدة عن دوران حول السؤال','Distinguishing useful thought from circling the same question','إعادة تحليل الاحتمال نفسه دون دليل أو خطوة إضافية','Reanalyzing the same possibility without new evidence or action'],
  ['Moon Saturn Mercury','تسمية الشعور واختيار استجابة لا تزيد الموقف تعقيداً','Naming a feeling and choosing a response that avoids escalation','كبت الشعور حتى يخرج في وقت أو اتجاه غير مناسب','Suppressing emotion until it emerges at the wrong time or target'],
  ['Saturn Moon Jupiter','ملاحظة ما ساعدك على التعافي وتكراره بمرونة','Recognizing what helped recovery and adapting it again','اعتبار الصمود قدرة على تحمل المزيد دون راحة','Defining resilience as endless endurance without recovery']
 ],
 [
  ['Sun Venus Saturn','تحويل قيمة مهمة إلى اختيار متكرر يمكن ملاحظته','Turning an important value into a repeated observable choice','وصف قيمة مثالية لا تجد لها مكاناً في قراراتك','Naming an ideal value absent from actual decisions'],
  ['Sun Jupiter Saturn','اختيار نمو يخدم حاجة تخصك لا مقارنة مفروضة','Choosing growth that serves your needs rather than imposed comparison','التعامل مع التطوير بوصفه دليلاً دائماً على أنك غير كافٍ','Treating self-development as constant proof of inadequacy'],
  ['Jupiter Mercury Uranus','الانفتاح على ثقافة عبر التعلم والاحتكاك المحترم','Engaging with a culture through learning and respectful contact','توقع أن يغير السفر وحده نمطاً لم تراجعه','Expecting travel alone to change an unexamined pattern'],
  ['Moon Jupiter Saturn','مقارنة الاستقرار والانتقال بحسب احتياجات المرحلة','Comparing staying and relocating against current needs','اعتبار الانتقال حلاً تلقائياً لكل ضيق','Treating relocation as an automatic solution to every discomfort'],
  ['Saturn Jupiter Sun','استخلاص مهارة من تجربة صعبة دون تمجيد الألم','Learning a skill from difficulty without glorifying suffering','الاعتقاد أن النمو لا يحصل إلا عبر معاناة','Believing growth is possible only through suffering'],
  ['Sun Moon Jupiter','معرفة مصادر رضا مختلفة حتى لا تعتمد على إنجاز واحد','Recognizing several sources of satisfaction beyond one achievement','تأجيل الرضا كله حتى بلوغ محطة تتغير باستمرار','Deferring all satisfaction until reaching an ever-moving milestone'],
  ['Saturn Pluto Sun','تعريف النمط المتكرر بمثيره واستجابتك ونتيجته','Defining a recurring pattern by trigger, response and outcome','تغيير الهدف مع الإبقاء على السلوك الذي يعطل الوصول','Changing the goal while keeping the behavior that obstructs it'],
  ['Sun Jupiter Saturn','ربط طموح بعيد بخطوة حاضرة وموعد مراجعة','Connecting a long-term aspiration to a current step and review date','حماية الحلم من الاختبار حتى يبقى وعداً بلا مسار','Protecting a dream from testing until it remains a promise without a path']
 ]
];

export type SoulTopicRule={planets:readonly string[];resource:{ar:string;en:string};risk:{ar:string;en:string}};
if(groups.length!==25||groups.some(group=>group.length!==8))throw Error('Incomplete topic-specific evidence and editorial rules');
export const soulTopicRules:readonly SoulTopicRule[]=groups.flatMap(group=>group.map(([planets,ar,en,riskAr,riskEn])=>({planets:planets.split(' '),resource:{ar,en},risk:{ar:riskAr,en:riskEn}})));
if(soulTopicRules.length!==soulTopics.length)throw Error('Topic rule catalogue mismatch');
export function soulRule(id:number):SoulTopicRule{
 const rule=soulTopicRules[id-1];if(!Number.isInteger(id)||!rule)throw Error('Unknown Soul topic rule');return rule;
}
