import type {Evidence} from './math.ts';

/** Deterministic, compact interpretation of one VERIFIED transit-to-natal contact.
 * The astronomical source is the Evidence object; these are symbolic, not event predictions.
 * Wording changes when the actual phase or contact changes, never from a random clock rotation.
 */
type Lang='ar'|'en';
type Bi={ar:string;en:string};
type Topic={label:Bi;theme:Bi;do:Bi;review:Bi};
const tx=(value:Bi,lang:Lang)=>value[lang];
const topics:Record<string,Topic>={
 Sun:{label:{ar:'الشمس',en:'Sun'},theme:{ar:'تحديد موقفك وهويتك',en:'decisions and identity'},do:{ar:'اكتب قرار واحد يعكس أولويتك وحدّد خطوته الأولى',en:'Write one decision that reflects your priorities and its first step'},review:{ar:'راجع قرار اتخذته: هل خدم أولويتك الفعلية؟',en:'Review whether a recent decision served your real priority'}},
 Moon:{label:{ar:'القمر',en:'Moon'},theme:{ar:'الراحة وردّة الفعل',en:'comfort and emotional reactions'},do:{ar:'حدّد احتياجك الحقيقي قبل ما ترد على موقف',en:'Identify your actual need before responding'},review:{ar:'راجع شعورك بعد الموقف بدون ما تستنتج نوايا غيرك',en:'Review your reaction without guessing someone else’s motives'}},
 Mercury:{label:{ar:'عطارد',en:'Mercury'},theme:{ar:'الرسائل والتفاصيل',en:'messages and details'},do:{ar:'اكتب سؤال واضح عن معلومة ناقصة',en:'Ask one precise question about a missing fact'},review:{ar:'راجع الرد الفعلي قبل ما تبني عليه تفسير جديد',en:'Review the actual reply before drawing another conclusion'}},
 Venus:{label:{ar:'الزهرة',en:'Venus'},theme:{ar:'التقارب والتقدير',en:'affection and appreciation'},do:{ar:'عبّر عن اهتمام بسيط واترك مجال لجواب الطرف الثاني',en:'Show simple interest and allow room for a reply'},review:{ar:'قيّم تجاوب الطرف الثاني الفعلي، مو التوقعات',en:'Assess the other person’s actual response, not expectations'}},
 Mars:{label:{ar:'المريخ',en:'Mars'},theme:{ar:'المبادرة والاحتكاك',en:'initiative and friction'},do:{ar:'ابدأ مهمة مؤجلة بخطوة محسوبة بدون استعجال',en:'Start a delayed task with one measured step'},review:{ar:'راجع نتيجة الخطوة قبل ما تزيد سرعتك أو تصعّد',en:'Check the outcome before accelerating or escalating'}},
 Jupiter:{label:{ar:'المشتري',en:'Jupiter'},theme:{ar:'فرصة سفر أو تعلّم أو توسّع',en:'travel, learning or growth opportunities'},do:{ar:'اختار فرصة واحدة وافحص كلفتها وموعدها قبل الالتزام',en:'Choose one opportunity and check cost and timing before committing'},review:{ar:'راجع فرصة فكّرت بيها: شنو جدواها وكلفتها الحقيقية؟',en:'Review an opportunity’s real value and cost'}},
 Saturn:{label:{ar:'زحل',en:'Saturn'},theme:{ar:'المسؤوليات والحدود',en:'responsibilities and boundaries'},do:{ar:'ثبّت المطلوب ومنو مسؤول ووقت التسليم',en:'Confirm the deliverable, owner and deadline'},review:{ar:'راجع عبء واحد: هل هو فعلاً ضمن مسؤوليتك؟',en:'Review whether one obligation is actually yours'}},
 Uranus:{label:{ar:'أورانوس',en:'Uranus'},theme:{ar:'التغيير والاستقلال',en:'change and independence'},do:{ar:'جرّب تغيير صغير قابل للتراجع',en:'Try one reversible change'},review:{ar:'قيّم نتيجة التغيير قبل ما توسّعه',en:'Evaluate the change before scaling it up'}},
 Neptune:{label:{ar:'نبتون',en:'Neptune'},theme:{ar:'الفارق بين التوقعات والوقائع',en:'the gap between expectations and facts'},do:{ar:'افصل المعلومة المثبتة عن الشي اللي تتمنّاه',en:'Separate verified facts from hopes'},review:{ar:'راجع شنو تأكد فعلاً وشنو بعده مجرد افتراض',en:'Review what is confirmed and what remains assumed'}},
 Pluto:{label:{ar:'بلوتو',en:'Pluto'},theme:{ar:'التغيير والسيطرة على قرارك',en:'personal change and control'},do:{ar:'اختار خطوة تحت سيطرتك واترك قرار الآخرين إلهم',en:'Choose a step under your control and leave others their decisions'},review:{ar:'راجع شنو تغيّر فعلاً بدل محاولة فرض النتيجة',en:'Review actual change instead of trying to force an outcome'}},
 Ascendant:{label:{ar:'الطالع',en:'Ascendant'},theme:{ar:'الحضور والانطباع الأول',en:'presence and first impressions'},do:{ar:'خلّ أول تعريف بنفسك بسيط وواضح',en:'Keep your introduction simple and clear'},review:{ar:'قيّم إذا رسالتك كانت واضحة بدون مبالغة',en:'Review whether you communicated clearly without exaggeration'}},
 MC:{label:{ar:'وسط السماء',en:'Midheaven'},theme:{ar:'الشغل والسمعة المهنية',en:'career and reputation'},do:{ar:'حدّد نتيجة عمل واحدة وموعد إنجازها',en:'Define one work outcome and its deadline'},review:{ar:'قارن المنجَز بالمطلوب، مو بالانطباع العام',en:'Compare the actual deliverable with the requirement'}},
 Chiron:{label:{ar:'كيرون',en:'Chiron'},theme:{ar:'الحساسية والتعافي',en:'sensitivity and recovery'},do:{ar:'ناقش نقطة حساسة بهدوء وبدون لوم',en:'Discuss one sensitive issue without blame'},review:{ar:'راجع إذا الحوار خفّف المشكلة أو زادها',en:'Review whether the conversation helped'}},
 Ceres:{label:{ar:'سيريس',en:'Ceres'},theme:{ar:'الرعاية والاحتياجات اليومية',en:'care and everyday needs'},do:{ar:'رتّب احتياج أساسي بدون ما تهمل نفسك',en:'Address one concrete need without neglecting yourself'},review:{ar:'راجع إذا احتياجك الأساسي أخذ حقه اليوم',en:'Check whether your basic needs were met today'}},
 Pallas:{label:{ar:'بالاس',en:'Pallas'},theme:{ar:'التخطيط وربط التفاصيل',en:'planning and finding patterns'},do:{ar:'قسّم مشكلة إلى خطوتين وحدّد المعلومة الناقصة',en:'Break a problem into two steps and identify missing facts'},review:{ar:'راجع شنو حلّته خطتك وشنو بقى',en:'Review what your plan resolved and what remains'}},
 Juno:{label:{ar:'جونو',en:'Juno'},theme:{ar:'الاتفاق والالتزام',en:'agreements and commitment'},do:{ar:'تأكد إن الطرفين متفقين على نفس الشروط',en:'Check both parties agree on the same terms'},review:{ar:'راجع شروط الاتفاق مثل ما انذكرت فعلاً',en:'Review the terms that were actually agreed'}},
 Vesta:{label:{ar:'فيستا',en:'Vesta'},theme:{ar:'التركيز والانضباط',en:'focus and dedication'},do:{ar:'خصص وقت محدد لمهمة واحدة بدون مشتتات',en:'Reserve a distraction-free block for one task'},review:{ar:'قارن الوقت اللي صرفته بالنتيجة اللي طلعت',en:'Compare time spent with the actual result'}},
 Pholus:{label:{ar:'فولوس',en:'Pholus'},theme:{ar:'تبعات القرارات الصغيرة',en:'consequences of small decisions'},do:{ar:'فكّر بنتيجتين قبل خطوة يصعب التراجع عنها',en:'Consider two consequences before an irreversible step'},review:{ar:'راجع أثر قرار صغير قبل تكراره',en:'Review the effects of a small decision before repeating it'}}
};
const frames:Record<number,{label:Bi;link:Bi;extra:Bi}>={
 0:{label:{ar:'اقتران',en:'Conjunction'},link:{ar:'الاقتران يجمع',en:'This conjunction brings together'},extra:{ar:'حدّد الأولوية الأساسية حتى ما تختلط الدوافع.',en:'Identify the priority so motivations do not blur.'}},
 60:{label:{ar:'تسديس',en:'Sextile'},link:{ar:'التسديس يفتح مجال تنسّق بين',en:'This sextile opens a way to coordinate'},extra:{ar:'التعاون يحتاج خطوة منك، مو انتظار علامة.',en:'Cooperation still needs an actual step.'}},
 90:{label:{ar:'تربيع',en:'Square'},link:{ar:'التربيع يبرز شدّ بين',en:'This square highlights tension between'},extra:{ar:'لا تحسم تحت ضغط لحظي.',en:'Avoid deciding under momentary pressure.'}},
 120:{label:{ar:'تثليث',en:'Trine'},link:{ar:'التثليث يشير لسهولة نسبية بين',en:'This trine suggests relative ease between'},extra:{ar:'السهولة الرمزية مو ضمان للنتيجة.',en:'Symbolic ease does not guarantee the result.'}},
 180:{label:{ar:'مقابلة',en:'Opposition'},link:{ar:'المقابلة تخلي التوازن مطلوب بين',en:'This opposition calls for balance between'},extra:{ar:'اسمع الطرف الثاني إذا القرار يخص أكثر من شخص.',en:'Hear the other side when others are involved.'}}
};
export type MomentNarrative={title:string;effect:string;action:string;phase:string;orbText:string};
export function momentNarrative(e:Evidence,lang:Lang):MomentNarrative|null{
 if(!Number.isFinite(e.orb)||e.orb<0||!Number.isFinite(e.maximumOrb)||e.maximumOrb<=0||e.orb>e.maximumOrb)return null;
 const moving=topics[e.transit.id],target=topics[e.natal.id],frame=frames[e.angle];
 if(!moving||!target||!frame)return null;
 const closeness=e.orb/e.maximumOrb;
 // Near-exact threshold is an ORB statement, not a fabricated timestamp.
 const state=e.orb<=0.10?'near':e.applying?'applying':closeness>=0.7?'fading':'separating';
 const phases:Record<typeof state,Bi>={
  near:{ar:'الزاوية ضمن 0.10° من الدقة',en:'Within 0.10° of exact'},
  applying:{ar:'الزاوية تقترب من الدقة',en:'The aspect is applying'},
  separating:{ar:'الزاوية ابتعدت عن الدقة',en:'The aspect is separating'},
  fading:{ar:'الزاوية تبتعد وتقرب تخرج من نطاقها',en:'The aspect is separating toward its orb limit'}
 };
 const title=tx(moving.label,lang)+' '+tx(frame.label,lang)+' '+tx(target.label,lang);
 const effect=tx(frame.link,lang)+' '+tx(moving.theme,lang)+(lang==='ar'?' و':' and ')+tx(target.theme,lang)+'.';
 const action=tx(state==='separating'||state==='fading'?target.review:target.do,lang)+'. '+tx(frame.extra,lang);
 return {title,effect,action,phase:tx(phases[state],lang),orbText:e.orb.toFixed(3)+'°'};
}
