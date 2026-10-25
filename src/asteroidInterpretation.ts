import {angles,distance,importance,applyingToNatal,type Point,type Evidence} from './math.ts';
import {namedAsteroids,type NamedAsteroid} from './asteroids.ts';
export type NamedContact=Evidence;
/** Optional real-orb measured extra contacts, distinct from eight source scores.
 * The original general-purpose aspects() intentionally excludes unfamiliar bodies;
 * do not fabricate angles or merge into the original scoring algorithm.
 */
export function namedAsteroidContacts(transits:readonly Point[],natal:readonly Point[],at:Date):NamedContact[]{
 const out:NamedContact[]=[];
 for(const t of transits){
  const asteroid=namedAsteroids.find(a=>a.name===t.id);if(!asteroid)continue;
  for(const n of natal)for(const angle of angles){
   const orb=Math.abs(distance(t.longitude,n.longitude)-angle),limit=1.5;
   if(orb>limit)continue;
   const applying=applyingToNatal(t,n,angle);
   out.push({id:'named-'+asteroid.number+'-'+angle+'-'+n.id,transit:t,natal:n,angle,orb,maximumOrb:limit,applying,weight:Math.min(1,(1-orb/limit)*.62+asteroid.baseWeight*.20+importance(n.id)*.18),exact:null});
  }
 }
 return out.sort((a,b)=>b.weight-a.weight||a.orb-b.orb).slice(0,100);
}
export type AsteroidMeaning={arTheme:string;arAction:string;enTheme:string;enAction:string};
export const meanings:Readonly<Record<string,AsteroidMeaning>>={
 "Eros":{arTheme:"الشغف الجسدي والانجذاب السريع",arAction:"إذا أكو إعجاب، عبّر عنه بوضوح وبلا ضغط؛ تأكد أن الرغبة متبادلة.",enTheme:"physical attraction and immediate chemistry",enAction:"Show interest plainly; make sure any attraction is mutual and freely chosen."},
 "Psyche":{arTheme:"الثقة والانكشاف العاطفي العميق",arAction:"اسأل سؤالاً صادقاً واسمع الجواب بالكامل؛ القرب النفسي ما يثبت بالتخمين.",enTheme:"emotional trust and personal vulnerability",enAction:"Ask a sincere question, and listen without deciding the answer in advance."},
 "Amor":{arTheme:"المودة الهادئة والحب المستمر",arAction:"راقب الاستمرارية بالأفعال الصغيرة، مو بكثرة الكلام والغزل.",enTheme:"patient affection and lasting care",enAction:"Look for consistent small actions, rather than intense declarations."},
 "Sappho":{arTheme:"الألفة الفكرية والذوق المشترك",arAction:"احچي عن فكرة أو فن يجمعكم؛ تابع هل الحوار متبادل ومريح.",enTheme:"shared creative tastes and intellectual closeness",enAction:"Invite a conversation about art or ideas, and notice whether it flows both ways."},
 "Lilith":{arTheme:"الاستقلال والحدود والرغبات غير المعلنة",arAction:"احترم الرفض والمساحة الشخصية؛ لا تفسّر الغموض على أنه موافقة.",enTheme:"freedom, boundaries and unspoken tensions",enAction:"Never interpret mystery or hesitation as consent; make room for a clear answer."},
 "Adonis":{arTheme:"الجاذبية المرتبطة بالصورة الأولى",arAction:"لا تعتمد على الانطباع والشكل وحده؛ اختبر احترام الطرفين بالتعامل.",enTheme:"first impressions and visual magnetism",enAction:"Look beyond appearance and evaluate everyday respect."},
 "Aphrodite":{arTheme:"الجمال والمتعة وطريقة التعبير عن الإعجاب",arAction:"اختار لفتة راقية وبسيطة، وشوف هل الطرف الآخر مرتاح إلها.",enTheme:"pleasure, beauty and how affection is shown",enAction:"Choose a small thoughtful gesture, and notice whether it is welcome."},
 "Apollo":{arTheme:"الظهور والإبداع والثقة بالإنجاز",arAction:"اطلع بشغلك للنور بعد ما تراجع التفاصيل، وخلي النتيجة تحچي.",enTheme:"visibility, creativity and achievement",enAction:"Share a carefully checked piece of work and let the result speak."},
 "Astarte":{arTheme:"الرغبة مع الحاجة للاستقلال",arAction:"خلّ الانجذاب واضحاً واترك مساحة للطرف الآخر يقرر بحرية.",enTheme:"attraction balanced with independence",enAction:"Express what you want while protecting the other person's freedom to choose."},
 "Cupido":{arTheme:"شرارة الإعجاب وبداية المغازلة",arAction:"جرب دعوة خفيفة واضحة؛ عدم الرد جواب يحتاج احترام.",enTheme:"the first spark of a possible romance",enAction:"Offer a light invitation and respect silence or a refusal."},
 "Daphne":{arTheme:"حماية المساحة الخاصة والانسحاب عند الضغط",arAction:"إذا حسّيت انغلاق، خفف المطالب واسأل عن الحدود بشكل مباشر.",enTheme:"withdrawal and the need for privacy",enAction:"Reduce pressure, and ask what boundaries would feel comfortable."},
 "Erato":{arTheme:"الغزل بالكلمات والخيال الرومانسي",arAction:"اكتب رسالة قصيرة شخصية بدل جمل منسوخة، وراقب التفاعل الحقيقي.",enTheme:"flirting through language and imagination",enAction:"Write something genuinely personal instead of copying a familiar line."},
 "Freia":{arTheme:"الحيوية والسحر الاجتماعي",arAction:"خلي حضورك دافئاً بلا استعراض؛ لاحظ من يشاركك الحديث من نفسه.",enTheme:"social vitality and personal presence",enAction:"Bring warmth, and see who initiates conversation on their own."},
 "Frigga":{arTheme:"الأمان العاطفي والمسؤولية داخل العلاقة",arAction:"اتفق على توقع واحد واضح، وشوف إذا الأفعال توافق الوعود.",enTheme:"reliability and emotional safety",enAction:"Make one clear expectation and compare future actions with promises."},
 "Groom":{arTheme:"الالتزام وبناء شراكة طويلة",arAction:"ناقش أهداف العلاقة بصراحة بدل افتراض أن الإعجاب يعني ارتباط.",enTheme:"partnership, commitment and shared plans",enAction:"Discuss your real relationship goals rather than assuming commitment."},
 "Hera":{arTheme:"الإنصاف والولاء في الشراكة",arAction:"اسأل عن معنى الالتزام للطرفين، وحدد ما تعتبره حدوداً عادلة.",enTheme:"fairness and loyalty between partners",enAction:"Explore what commitment and fair boundaries mean to both people."},
 "Isis":{arTheme:"ترميم الثقة بعد تعب أو خلاف",arAction:"ابدأ باعتذار محدد أو إصلاح عملي؛ لا تتوقع النسيان الفوري.",enTheme:"repairing trust after disagreement",enAction:"Offer a specific repair; avoid demanding instant forgiveness."},
 "Klytia":{arTheme:"التركيز الزائد على إعجاب شخص واحد",arAction:"خلّ اهتمامك متوازن؛ لا تهمل حياتك وأصدقاءك بانتظار رسالة.",enTheme:"over-focusing on one person's attention",enAction:"Keep your own routines while waiting for another person's response."},
 "Lancelot":{arTheme:"الرومانسية المرتبطة بالمثالية",arAction:"قارن الوعود بالتصرفات، ولا تضحي بحدودك حتى تلعب دور المنقذ.",enTheme:"romantic idealism and rescuing fantasies",enAction:"Judge promises by actions and keep your own boundaries intact."},
 "Lust":{arTheme:"الحافز الجسدي وحدود الاندفاع",arAction:"الرغبة مو اتفاق؛ أي خطوة حميمة تحتاج تواصل وموافقة واضحة.",enTheme:"desire and impulse control",enAction:"Desire is not agreement; intimacy requires clear mutual consent."},
 "Valentine":{arTheme:"التعبير الحنون والاهتمام المقصود",arAction:"اختر لفتة مناسبة لطبيعة علاقتكم بدل المفاجآت الثقيلة.",enTheme:"gentleness and intentional affection",enAction:"Choose a gesture that fits the relationship rather than overwhelming someone."},
 "Union":{arTheme:"التعاون وتنسيق الطريق المشترك",arAction:"اقترح نشاطاً صغيراً معاً، وراقب سهولة التخطيط والتبادل.",enTheme:"coordination and building together",enAction:"Suggest a small shared activity and watch how planning is reciprocated."},
 "Karma":{arTheme:"تكرار أنماط قديمة في القرارات",arAction:"سجّل الموقف المتكرر وغيّر رد فعل واحد بدل إعادة السيناريو.",enTheme:"repeating patterns in choices",enAction:"Write down a familiar pattern and change one of your responses."},
 "Destinn":{arTheme:"الإحساس بمفترق طريق",arAction:"حدد خيارين واقعيين وموعد مراجعة، ولا تعتبر التوقيت الفلكي قراراً بالنيابة عنك.",enTheme:"a sense of standing at a crossroads",enAction:"Compare two real options; don't outsource decisions to astrology."},
 "Nemesis":{arTheme:"المنافسة والغيرة والصراعات الصامتة",arAction:"لا تفترض نوايا سيئة؛ واجه المشكلة المحددة بدل التصعيد.",enTheme:"competition, insecurity and hidden conflict",enAction:"Name the concrete issue instead of assuming hostile intentions."},
 "Fortuna":{arTheme:"الفرص الصغيرة والتوقيت المواتي للتجربة",arAction:"اغتنم فرصة قابلة للتراجع بعد دراسة مخاطرها، مو على أساس الحظ وحده.",enTheme:"opportunities and experiments",enAction:"Try a reversible opening after checking the risks."},
 "Tyche":{arTheme:"التغيّر والمصادفات غير المخططة",arAction:"جهّز خطة بديلة وابقَ مرناً؛ المصادفة مو ضمان نجاح.",enTheme:"unexpected turns and flexibility",enAction:"Prepare a backup plan and don't mistake luck for a guarantee."},
 "Abundantia":{arTheme:"إدارة الموارد وتوسيع النتيجة",arAction:"راجع المصروف والوقت المتاح قبل ما توزع وعود أكبر من طاقتك.",enTheme:"resources and sustainable growth",enAction:"Check your money and time before making big commitments."},
 "Midas":{arTheme:"القيمة المادية وحدود الطمع",arAction:"قارن الربح بالتكلفة الفعلية، ولا تتعامل مع المال كمعيار وحيد للنجاح.",enTheme:"ambition, money and overreach",enAction:"Compare real costs with rewards, beyond the appeal of winning."},
 "Industria":{arTheme:"المثابرة والعمل المتكرر",arAction:"حدد مهمة واحدة قابلة للإنهاء اليوم وقيّم الإنجاز بعد تنفيذها.",enTheme:"routine effort and discipline",enAction:"Finish one defined task and assess the actual result."},
 "Talent":{arTheme:"اكتشاف المهارة وتطويرها",arAction:"خصص ساعة تدريب لشي تتقنه؛ قِس التحسن بنتيجة ملموسة.",enTheme:"skills and deliberate practice",enAction:"Spend an hour strengthening one ability and measure progress."},
 "Fama":{arTheme:"السمعة وانتشار الانطباع",arAction:"راجع شنو تنشر ولمن؛ استثمر بسمعة مبنية على جودة ثابتة.",enTheme:"reputation and visibility",enAction:"Build a reputation through consistent work rather than image alone."},
 "Academia":{arTheme:"التعلم والتدقيق قبل اتخاذ موقف",arAction:"ارجع لمصدر أساسي، واسأل سؤالاً واحداً يغيّر فهمك للموضوع.",enTheme:"learning and disciplined inquiry",enAction:"Verify one important claim from a primary source."},
 "Enterprise":{arTheme:"روح المبادرة وبناء مشروع",arAction:"جرّب نسخة صغيرة من الفكرة قبل ما تلتزم بموارد كبيرة.",enTheme:"entrepreneurship and initiative",enAction:"Test a small prototype before spending heavily."},
 "Hygeia":{arTheme:"العناية اليومية والعادات الواقعية",arAction:"راجع النوم والماء والحركة كروتين؛ لا تستبدل العلاج بنصيحة فلكية.",enTheme:"health routines and steady care",enAction:"Review your habits; do not substitute astrology for medical care."},
 "Panacea":{arTheme:"البحث عن حل شامل وسريع",arAction:"قسّم المشكلة إلى أسباب محددة؛ الحل السحري غالباً يخفي التفاصيل.",enTheme:"the temptation of one magical solution",enAction:"Break the problem into causes; beware promises of instant fixes."},
 "Asclepius":{arTheme:"التعافي وطلب المساعدة المناسبة",arAction:"إذا عندك أعراض مستمرة، اختار فحصاً طبياً مو تأويلاً رمزياً.",enTheme:"recovery and appropriate support",enAction:"Seek a qualified medical assessment when symptoms persist."},
 "Angel":{arTheme:"الحاجة إلى الدعم والطمأنينة",arAction:"اسأل شخصاً موثوقاً عن مساعدة محددة بدل انتظار أن يفهم وحده.",enTheme:"comfort and reliable support",enAction:"Ask someone trustworthy for a specific kind of help."},
 "Anubis":{arTheme:"إغلاق مرحلة ومواجهة التغيير",arAction:"أنهِ التزاماً معلّقاً بخطوة واضحة، واترك وقتاً للتكيف.",enTheme:"endings and life transitions",enAction:"Close one unfinished obligation, then allow time to adjust."},
 "Hekate":{arTheme:"الاختيار وسط الالتباس",arAction:"دوّن المعلومات الناقصة قبل القرار، ولا تسمّي الغموض قدراً.",enTheme:"choosing through uncertainty",enAction:"List what you still need to know before deciding."},
 "Proserpina":{arTheme:"الانتقال بين الاعتماد والاستقلال",arAction:"حطّ حدوداً واضحة للاستقلال بدون قطع العلاقة أو التواصل.",enTheme:"dependence versus independence",enAction:"Set boundaries without cutting off communication."},
 "Persephone":{arTheme:"التغيير العاطفي والنضج عبر التجارب",arAction:"لا تعاقب نفسك على مرحلة قديمة؛ ركّز على سلوك تختاره الآن.",enTheme:"growth through emotional change",enAction:"Choose how you will respond now rather than punishing your past self."},
 "Orpheus":{arTheme:"تأثير الموسيقى والكلمات على الحنين",arAction:"عبّر عن شعورك مباشرة بدل الاعتماد على تلميحات قد تُفهم غلط.",enTheme:"nostalgia through music and words",enAction:"Say what you feel directly instead of relying on hints."},
 "Prometheus":{arTheme:"التجريب والتمرّد على الطرق المعتادة",arAction:"اختبر فكرة مبتكرة بمخاطر محدودة وشارك نتيجة الاختبار.",enTheme:"novelty and unconventional work",enAction:"Run a low-risk experiment and share what happened."},
 "Icarus":{arTheme:"المبالغة بالحماس وتجاهل الحدود",arAction:"قبل القفزة الكبيرة، اختبر أسوأ احتمال وخلي عندك خطة رجوع.",enTheme:"ambition that can ignore limits",enAction:"Think through your worst case and plan a safe exit."},
 "Narcissus":{arTheme:"الصورة الذاتية والحاجة للإعجاب",arAction:"وازن بين احترام نفسك والفضول الحقيقي تجاه الشخص المقابل.",enTheme:"self-image and desire for admiration",enAction:"Balance self-respect with curiosity about the other person."},
 "Medusa":{arTheme:"الانفعال عند الشعور بالتهديد",arAction:"خذ مهلة قبل الرد الدفاعي وسمِّ الحدث بدل مهاجمة الشخص.",enTheme:"defensive reactions to perceived threats",enAction:"Pause before reacting and describe the specific incident."},
 "Pandora":{arTheme:"الفضول وما يترتب على كشف الأمور",arAction:"اسأل إذا أنت مستعد لجواب قد ما يعجبك قبل ما تفتح موضوعاً حساساً.",enTheme:"curiosity and unintended consequences",enAction:"Decide whether you can accept an uncomfortable answer before asking."},
 "Sisyphus":{arTheme:"التعب من تكرار المحاولة نفسها",arAction:"إذا النتائج ما تتغير، غيّر الخطة مو فقط مقدار الجهد.",enTheme:"fatigue from repeated ineffective effort",enAction:"Change the method when more effort yields the same result."},
 "Toro":{arTheme:"القوة والدفاع عن النفس دون تصعيد",arAction:"استعمل الحزم بحدود واضحة بدل تحويل كل خلاف لمعركة.",enTheme:"assertiveness and conflict escalation",enAction:"Use firm boundaries without turning every disagreement into a fight."},
 "Diana":{arTheme:"حرية الحركة والمسافة الصحية",arAction:"خطط لوقت خاص بك واسمح بنفس المساحة للطرف الآخر.",enTheme:"independence and personal space",enAction:"Protect your freedom while offering others the same."},
 "Circe":{arTheme:"سحر الجاذبية وخطر التلاعب",arAction:"تجنب اختبار غيرة الآخرين أو شدّهم باللعب النفسي؛ كن صريحاً.",enTheme:"charisma and the ethics of influence",enAction:"Avoid jealousy games or psychological pressure; be transparent."},
 "Cleopatra":{arTheme:"الحضور والكاريزما أثناء التفاوض",arAction:"اعرض فكرتك بهدوء وثقة، واختبر قوة مضمونها مو تأثير الشكل.",enTheme:"presence and persuasive communication",enAction:"Lead with evidence, not appearance or charm alone."},
 "Casanova":{arTheme:"سهولة التعارف والتنقّل بين المعارف",arAction:"راجع نيتك قبل المغازلة؛ لا تعطِ انطباع التزام مو موجود.",enTheme:"flirtation and short-lived novelty",enAction:"Be clear whether you want exploration or a committed relationship."},
 "Don Juan":{arTheme:"حب المغامرة العاطفية والبحث عن الجديد",arAction:"كن واضحاً بشأن نوع العلاقة التي تريدها ولا تعد بما لا تنوي.",enTheme:"romantic adventure and new encounters",enAction:"Be candid about your intentions; don't promise a future you don't want."},
 "Nessus":{arTheme:"الحدود والشفاء من أنماط السيطرة",arAction:"انتبه لأي ضغط أو تجاوز؛ اطلب دعماً وحدد حدوداً صارمة عند الحاجة.",enTheme:"power imbalances, harm and boundaries",enAction:"Notice coercive patterns, protect your boundaries and get help if needed."},
};
export function asteroidReading(item:NamedAsteroid,contact:NamedContact|undefined,english=false){
 const c=meanings[item.name];if(!c)throw Error('Missing original asteroid interpretation');
 const theme=english?c.enTheme:c.arTheme;
 const action=contact?(english?c.enAction:c.arAction):'';
 const natalName=contact?(({Sun:'شمسك',Moon:'قمرك',Mercury:'عطاردك',Venus:'زهرتك',Mars:'مريخك',Jupiter:'مشتريك',Saturn:'زحلك',Uranus:'أورانوسك',Neptune:'نبتونك',Pluto:'بلوتوك',Ascendant:'طالعك',MC:'مهنتك',Chiron:'كيرونك',Ceres:'سيريسك',Pallas:'بالاسك',Juno:'جونوك',Vesta:'فيستاك',Pholus:'فولوسك'} as Record<string,string>)[contact.natal.id]??contact.natal.id):'';
 const natalArea:Record<string,[string,string]>={
  Sun:['قراراتك وثقتك بنفسك','decisions and identity'],Moon:['حاجتك للراحة وردّ الفعل','emotional comfort'],Mercury:['طريقة حچيك وفهمك للآخر','communication and understanding'],
  Venus:['التقارب والتقدير','affection and values'],Mars:['المبادرة وحدود الاندفاع','initiative and boundaries'],Jupiter:['التوسع واختيار الفرص','growth and opportunity'],
  Saturn:['الالتزام والمسؤولية','commitment and responsibility'],Uranus:['الاستقلال والتغيير','autonomy and change'],
  Neptune:['التوقعات والخيال','expectations and imagination'],Pluto:['العمق والسيطرة','intensity and control'],
  Ascendant:['حضورك والانطباع الأول','presence and first impressions'],MC:['العمل ودورك العام','career and public role']
 };
 const aspectAr:Record<number,string>={0:'اقتران',60:'تسديس',90:'تربيع',120:'تثليث',180:'مقابلة'};
 const aspectEn:Record<number,string>={0:'conjunction',60:'sextile',90:'square',120:'trine',180:'opposition'};
 const angleMeaning=contact?(
   contact.angle===90||contact.angle===180?
    (english?'There may be a symbolic tension to examine, not evidence that trouble will occur.':'هذا يرمز لشدّ يحتاج توازن، مو دليل أن مشكلة راح تصير.'):
   contact.angle===0?
    (english?'The themes converge; their outcome is not predetermined.':'الدلالتين يجتمعن، بس النتيجة ما تنحسب من الخارطة.'):
    (english?'This aspect suggests room for cooperation when backed by real actions.':'الزاوية تطرح مجال للتنسيق إذا التصرفات الواقعية تدعمه.')
  ):'';
 const emphasis=!contact?(english?'No tight natal contact at this selected moment.':'ماكو اتصال ولادي قريب بهاللحظة.'):english?
  (item.name+' '+aspectEn[contact.angle]+' natal '+contact.natal.id+' (orb '+contact.orb.toFixed(2)+'°). The symbolic theme meets '+(natalArea[contact.natal.id]?.[1]??'a natal priority')+'. '+angleMeaning):
  (item.name+' '+aspectAr[contact.angle]+' ويا '+natalName+' (فارق '+contact.orb.toFixed(2)+'°). هالمعنى يرتبط بموضوع '+(natalArea[contact.natal.id]?.[0]??'أولوياتك')+'. '+angleMeaning);
 return {theme,action,emphasis};
}


/** The visible asteroid card must be based on a successfully calculated position.
 * The broad mythology is not an individualized transit. Without a close natal
 * aspect we report the measured sky state and explicitly withhold an effect claim.
 */
export function currentAsteroidReading(item:NamedAsteroid,position:Point|undefined,contact:NamedContact|undefined,english=false){
 if(!position||!Number.isFinite(position.longitude)||!Number.isFinite(position.speed))return {
  theme:english?'Position unavailable: the Swiss ephemeris for '+item.name+' has not been verified.':
   'موقع '+item.name+' بعده غير محسوب؛ لازم يكتمل تحميل ملفه الفلكي أولاً.',
  action:'',
  emphasis:english?'No current or personal interpretation without ephemeris data.':'ماكو قراءة حالية أو شخصية بدون بيانات الموقع.'
 };
 const base=asteroidReading(item,contact,english);
 const namesAr=['الحمل','الثور','الجوزاء','السرطان','الأسد','العذراء','الميزان','العقرب','القوس','الجدي','الدلو','الحوت'];
 const namesEn=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
 const lon=((position.longitude%360)+360)%360;
 const sign=Math.floor(lon/30),degree=(lon%30).toFixed(2);
 const movement=position.speed<-.00001?(english?'retrograde':'متراجع'):
  position.speed>.00001?(english?'direct':'مباشر'):(english?'stationary':'شبه ثابت');
 const sky=english?
  item.name+' is at '+degree+'° '+namesEn[sign]+' ('+movement+').':
  item.name+' هسه بالـ'+namesAr[sign]+' عند '+degree+'° وحركته '+movement+'.';
 return {
  theme:sky+' '+(english?'Its traditional theme is ':'موضوعه بالتأويل التنجيمي: ')+base.theme+'.',
  emphasis:base.emphasis,
  action:contact?base.action:(english?
   'No tight contact with your natal chart (within 1.5°) was calculated for this time; a specific personal effect is not established.':
   'بهالوقت ماكو اتصال قريب ويا خارطتك ضمن 1.5°؛ لذلك ما ننسب إلك تأثير شخصي محدد.')
 };
}
