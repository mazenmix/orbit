/** Short, event-specific interpretations for calculated exact Moon and natal-transit
 * timestamps. Timing is astronomical; effects are traditional symbolic themes. */
export type FocusReadingInput={
 kind:'moon-ingress'|'voc-start'|'voc-end'|'moon-aspect'|'personal-aspect';
 transit?:string;
 target?:string;
 angle?:number;
 nextSign?:number;
};
type Bi={ar:string;en:string};
type Topic={theme:Bi;step:Bi};
const topics:Record<string,Topic>={
 Sun:{theme:{ar:'القرار والثقة بالنفس',en:'choices and self-confidence'},step:{ar:'حدّد القرار اللي يعبّر عن أولويتك، واكتب أول خطوة لتنفيذه',en:'Name the choice that reflects your priority and write its first step'}},
 Moon:{theme:{ar:'الراحة وردّة الفعل العاطفية',en:'comfort and emotional responses'},step:{ar:'ميّز شعورك عن الوقائع قبل ما ترد على أحد',en:'Separate feelings from facts before replying'}},
 Mercury:{theme:{ar:'الكلام والمعلومات',en:'communication and information'},step:{ar:'راجع الرسالة أو الاتفاق واسأل سؤال واضح عن النقطة المبهمة',en:'Review the message or agreement and ask one clear question about what is vague'}},
 Venus:{theme:{ar:'القرب والتقدير والعلاقات',en:'affection, values and relationships'},step:{ar:'عبّر عن اهتمام محدد بلطف، وخلي مجال لرد الطرف الثاني',en:'Express one specific appreciation gently and make room for a reply'}},
 Mars:{theme:{ar:'المبادرة والطاقة والاحتكاك',en:'initiative, drive and friction'},step:{ar:'اختار مهمة تتطلب مبادرة وابدأ بيها من غير اندفاع أو جدال',en:'Start one task that needs initiative without rushing into conflict'}},
 Jupiter:{theme:{ar:'التوسّع والفرص والتعلّم',en:'growth, opportunities and learning'},step:{ar:'جرّب فرصة صغيرة وافحص تكلفتها قبل أي وعد كبير',en:'Try a small opportunity and check its cost before a big promise'}},
 Saturn:{theme:{ar:'المسؤولية والحدود والالتزامات',en:'duties, boundaries and commitments'},step:{ar:'ثبّت المطلوب والوقت وحدود مسؤوليتك قبل الموافقة',en:'Confirm the deliverable, time and scope before committing'}},
 Uranus:{theme:{ar:'التغيير والاستقلال',en:'change and independence'},step:{ar:'اختبر تغيير صغير قابل للتراجع بدل ما تغيّر الخطة كلها',en:'Test a reversible adjustment instead of changing the whole plan'}},
 Neptune:{theme:{ar:'الخيال والتوقعات والوضوح',en:'imagination, expectations and clarity'},step:{ar:'افصل اللي تعرفه أكيد عن اللي تتمنّاه قبل القرار',en:'Separate verified facts from what you hope is true before deciding'}},
 Pluto:{theme:{ar:'التحوّل والسيطرة والحدود',en:'change, control and boundaries'},step:{ar:'اختار الشي اللي تگدر تغيّره فعلاً، واترك محاولة السيطرة على غيرك',en:'Focus on what you can change, not on controlling others'}},
 Chiron:{theme:{ar:'الحساسية والتعافي',en:'sensitivity and recovery'},step:{ar:'تعامل ويّه نقطة حساسة بحوار هادئ بلا لوم',en:'Address a sensitive issue calmly without blame'}},
 Ceres:{theme:{ar:'الرعاية وتنظيم الاحتياجات',en:'care and practical needs'},step:{ar:'رتّب احتياج أساسي لنفسك بدون ما تهمل وقتك',en:'Take care of one concrete need without neglecting your time'}},
 Pallas:{theme:{ar:'التخطيط وربط التفاصيل',en:'planning and pattern recognition'},step:{ar:'قسّم المشكلة لخطوتين وحدد المعلومة الناقصة',en:'Break the problem into two steps and identify the missing fact'}},
 Juno:{theme:{ar:'الالتزام والاتفاقات',en:'commitment and agreements'},step:{ar:'وضّح توقعات الطرفين قبل ما تعتبر الموضوع اتفاق',en:'Clarify both parties’ expectations before calling it an agreement'}},
 Vesta:{theme:{ar:'التركيز والأولويات',en:'focus and dedication'},step:{ar:'احجز وقت قصير لمهمة واحدة واغلق المشتتات',en:'Protect a short focus block for one task and shut out distractions'}},
 Pholus:{theme:{ar:'القرارات الصغيرة وتبعاتها',en:'small decisions and their consequences'},step:{ar:'فكّر بنتيجتين محتملتين قبل أي خطوة يصعب التراجع عنها',en:'Consider two possible consequences before an irreversible step'}},
 Ascendant:{theme:{ar:'الحضور والانطباع الأول',en:'presence and first impressions'},step:{ar:'اختصر رسالتك الأساسية وخلي طريقتك واضحة',en:'Make your main message concise and your approach clear'}},
 MC:{theme:{ar:'الشغل والسمعة المهنية',en:'career and public responsibilities'},step:{ar:'تابع تكليف واضح وحدد موعد تسليمه',en:'Follow up on a concrete work deliverable and deadline'}}
};
const aspects:Record<number,Bi>={
 0:{ar:'اقتران يجمع الموضوعين ويخلي الحاجة للتوازن أوضح',en:'A conjunction merges the themes and makes their balance more noticeable'},
 60:{ar:'تسديس يرمز لإمكانية تعاون تحتاج منك مبادرة',en:'A sextile represents an opening for cooperation that still takes initiative'},
 90:{ar:'تربيع يرمز لشدّ بين حاجتين؛ لا تخلي وحدة تلغي الثانية',en:'A square symbolizes competing needs; do not let one cancel the other'},
 120:{ar:'تثليث يرمز لسهولة نسبية بالتنسيق بين الجانبين',en:'A trine symbolizes relatively smoother coordination between the themes'},
 180:{ar:'مقابلة تبرز طرفين يحتاجان اتفاق وحدود واضحة',en:'An opposition highlights two sides that need clear agreement and boundaries'}
};
const signs:readonly {theme:Bi;step:Bi}[]=[
 {theme:{ar:'البداية والمبادرة',en:'new starts and initiative'},step:{ar:'اختار خطوة أولى صغيرة لمشروع مأجّل',en:'Pick one small first step for a delayed project'}},
 {theme:{ar:'الاستقرار والمال والراحة',en:'stability, money and comfort'},step:{ar:'راجع صرفك ورتّب حاجة مادية مهمة',en:'Review spending and organize one practical need'}},
 {theme:{ar:'الأخبار والتواصل والتعلّم',en:'news, communication and learning'},step:{ar:'خلّص مكالمة أو رسالة تحتاج جواب واضح',en:'Finish one call or message that needs a clear answer'}},
 {theme:{ar:'البيت والأمان والروابط القريبة',en:'home, security and close bonds'},step:{ar:'رتّب أمر منزلي أو اتواصل بهدوء ويّه شخص مقرّب',en:'Handle one home task or check in calmly with someone close'}},
 {theme:{ar:'التعبير والإبداع والظهور',en:'expression, creativity and visibility'},step:{ar:'شارك شغل أنجزته أو خصّص وقت لهواية تحبها',en:'Share completed work or make time for a favorite creative activity'}},
 {theme:{ar:'التفاصيل والعادات والتنظيم',en:'details, routines and organization'},step:{ar:'راجع قائمة مهامك وخلص أصغر تفصيل معلّق',en:'Review your task list and resolve one unfinished detail'}},
 {theme:{ar:'العلاقات والاتفاق والتوازن',en:'relationships, agreements and balance'},step:{ar:'ناقش توقع واحد بوضوح واسمع جواب الطرف الثاني',en:'Discuss one expectation clearly and listen to the other person'}},
 {theme:{ar:'الثقة والخصوصية والموارد المشتركة',en:'trust, privacy and shared resources'},step:{ar:'راجع حد مالي أو شخصي قبل أي مشاركة أو التزام',en:'Review a financial or personal boundary before sharing or committing'}},
 {theme:{ar:'السفر والتجربة والتعلّم',en:'travel, exploration and learning'},step:{ar:'دقّق تفاصيل فكرة سفر أو جرّب شي تتعلّم منه',en:'Check the details of a travel idea or try a learning activity'}},
 {theme:{ar:'الشغل والمسؤولية والنتائج',en:'work, responsibility and outcomes'},step:{ar:'حدّد نتيجة عملية وحدة وموعد إنجازها',en:'Choose one work deliverable and set its deadline'}},
 {theme:{ar:'الأصدقاء والمجموعات والأفكار',en:'friends, communities and new ideas'},step:{ar:'تواصل ويّه صديق أو شارك فكرة ضمن مجموعة',en:'Reach out to a friend or share an idea with a group'}},
 {theme:{ar:'الهدوء والخيال والحاجة للراحة',en:'quiet, imagination and rest'},step:{ar:'خصّص فترة هادئة للنوم أو الاستراحة بعيد عن التشتت',en:'Protect some quiet time for rest or sleep without distractions'}}
];
export function focusEventReading(event:FocusReadingInput,language:'ar'|'en'):{effect:string;action:string}{
 const ar=language==='ar';
 const select=(text:Bi)=>ar?text.ar:text.en;
 if(event.kind==='voc-start')return {
  effect:ar?'يبدي خلو مسار القمر بعد آخر اتصال رئيسي إله بهذا البرج؛ بالتفسير التقليدي هذا وقت مراجعة أكثر من استعجال.':'The Moon enters its void-of-course interval after its final major aspect in this sign; the traditional theme is review rather than rushing.',
  action:ar?'راجع تفاصيل موعدك أو مهمتك المفتوحة، وحدد شنو يحتاج تأكيد قبل الخطوة الجاية.':'Review the details of an open appointment or task and confirm what is still uncertain.'
 };
 if(event.kind==='voc-end')return {
  effect:ar?'ينتهي خلو المسار ويبدأ القمر برجاً جديداً؛ يتبدّل محور القراءة إلى مرحلة جديدة.':'The void-of-course ends as the Moon enters a new sign, shifting the symbolic focus.',
  action:ar?'اختار خطوة واضحة من الأمور اللي راجعتها وابدأ بتنفيذها حسب ظروفك.':'Choose one concrete step from what you reviewed and carry it out when practical.'
 };
 if(event.kind==='moon-ingress'){
  const sign=Number.isInteger(event.nextSign)&&event.nextSign!>=0&&event.nextSign!<12?signs[event.nextSign!]:null;
  if(!sign)throw Error('Invalid Moon ingress sign');
  return {effect:ar?'انتقال القمر يسلّط الضوء رمزياً على '+sign.theme.ar+'.':'The Moon’s sign change symbolically emphasizes '+sign.theme.en+'.',
   action:select(sign.step)+'.'};
 }
 if(event.kind!=='moon-aspect'&&event.kind!=='personal-aspect')throw Error('Unsupported focus event');
 const t=event.kind==='moon-aspect'?'Moon':event.transit;
 const moving=t?topics[t]:null,target=event.target?topics[event.target]:null,angle=event.angle===undefined?null:aspects[event.angle];
 if(!moving||!target||!angle)throw Error('Invalid calculated aspect evidence');
 const effect=event.kind==='personal-aspect'?
  (ar?'اتصال شخصي يربط '+moving.theme.ar+' بـ'+target.theme.ar+'. ':'A personal contact connects '+moving.theme.en+' with '+target.theme.en+'. '):
  (ar?'اتصال القمر يربط الحالة العاطفية بـ'+target.theme.ar+'. ':'This Moon contact connects emotional response with '+target.theme.en+'. ');
 return {effect:effect+select(angle)+'.',action:select(target.step)+'.'};
}
