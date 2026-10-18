import {bodies,angles,aspectArabic,aspectNames,type Category,type Signal,type Evidence} from './math.ts';
export type Lang='ar'|'en';
export let lang:Lang=(localStorage.getItem('mx.language')==='en'?'en':'ar');
export const setLang=(value:Lang)=>{lang=value;localStorage.setItem('mx.language',value)};
export const t=(ar:string,en:string)=>lang==='ar'?ar:en;
export const categoryLabels:Record<Category,[string,string,string]>={overview:['الصورة العامة','Overview','◉'],career:['العمل والقرار','Work & decisions','◇'],love:['الحب والعلاقات','Love & relationships','♡'],communication:['الكلام والتواصل','Communication','☷'],energy:['الطاقة','Energy','ϟ'],emotions:['المزاج والداخل','Emotions','☾'],recovery:['الراحة والاستعادة','Recovery','✧'],timing:['التوقيت والحركة','Timing','◷']};
export const cat=(c:Category)=>t(categoryLabels[c][0],categoryLabels[c][1]);
export const planet=(id:string)=>t(bodies.find(b=>b[1]===id)?.[2]??({Ascendant:'الطالع',MC:'وسط السماء'}[id]??id),id);
export const signSymbols=['♈︎','♉︎','♊︎','♋︎','♌︎','♍︎','♎︎','♏︎','♐︎','♑︎','♒︎','♓︎'];
export const signsAr=['الحمل','الثور','الجوزاء','السرطان','الأسد','العذراء','الميزان','العقرب','القوس','الجدي','الدلو','الحوت'];
export const signsEn=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
export const signName=(lon:number)=>(lang==='ar'?signsAr:signsEn)[Math.floor(lon/30)];
export const aspect=(angle:number)=>t(aspectArabic[angles.indexOf(angle as 0)],aspectNames[angles.indexOf(angle as 0)]);
export const toneLabels={exceptional:['نافذة استثنائية','Exceptional window'],opportunity:['فرصة قوية','Strong opportunity'],supportive:['داعم','Supportive'],neutral:['متوازن','Balanced'],watch:['انتبه','Watch'],caution:['تمهّل','Caution']} as const;
export const tone=(s:Signal)=>{const v=toneLabels[s.tone];return t(v[0],v[1])};
export const notice=()=>t('المواضع الفلكية محسوبة. الإرشاد رمزي؛ المؤشرات من 100 مو نسب احتمال، وما تضمن حدوث شي.','Astronomical positions are calculated. Guidance is symbolic; indices out of 100 are not probabilities or guarantees.');
export function copy(s:Signal){const positive=['exceptional','opportunity','supportive'].includes(s.tone);
 const texts:Record<Category,[[string,string],[string,string],[string,string],[string,string]]>={
 career:[['نافذة إنجاز تستحق الاستغلال','A productive window is open'],['لا تحسم تحت ضغط لحظي','Do not decide under momentary pressure'],['اختر مهمة واحدة عالية الأثر وأنهِ أول خطوة منها اليوم.','Choose one high-impact task and complete its first step today.'],['راجع التفاصيل والأرقام ثم أجّل المواجهة إذا كانت النبرة متوترة.','Check details and numbers; delay confrontation if the tone is tense.']],
 love:[['افتح باب الكلام الدافئ','Open a warm conversation'],['لا تفسّر الصمت كرفض','Do not read silence as rejection'],['اكتب رسالة قصيرة، صادقة، ولا تطلب جواباً فورياً.','Write a short, honest message without demanding an immediate reply.'],['اسأل مباشرة وبهدوء بدل بناء استنتاج من إشارة ناقصة.','Ask directly and calmly instead of drawing conclusions from incomplete signals.']],
 communication:[['كلمتك اليوم مؤثرة','Your words carry weight'],['اختَر كلامك بدقة','Choose your words carefully'],['ابدأ بالنتيجة ثم أعطِ ثلاثة أسباب فقط.','Lead with the outcome, then give just three reasons.'],['انتظر عشر دقائق، اقرأ رسالتك مرة ثانية، ثم أرسلها.','Wait ten minutes, reread your message, then send it.']],
 energy:[['حوّل الطاقة إلى حركة','Turn energy into movement'],['خفّف الاحتكاك','Reduce friction'],['استخدم دفعة طاقة لمدة 25 دقيقة في تمرين أو مهمة صعبة.','Use a 25-minute burst for a workout or a difficult task.'],['تحرك خمس دقائق، اشرب ماء، ولا تدخل نقاشاً وأنت مشدود.','Move for five minutes, drink water, and avoid tense conversations.']],
 emotions:[['مساحة صافية للترتيب الداخلي','Space to find your balance'],['لا تصدّق كل شعور لحظي','Question a passing feeling'],['دوّن شعورك والسبب الواقعي المقابل له بجملتين.','Write down your feeling and the real-world reason behind it.'],['لا تتخذ قراراً عاطفياً نهائياً قبل نوم أو استراحة جيدة.','Rest before making a final emotional decision.']],
 recovery:[['الراحة اليوم استثمار','Rest is an investment'],['لا تهمل إشارات الإرهاق','Pay attention to fatigue'],['اقطع الشاشة قبل النوم بثلاثين دقيقة وخفف المنبهات مساءً.','Put screens away thirty minutes before sleep.'],['ضع استراحة قصيرة محسوبة قبل أي مهمة تحتاج دقة.','Take a short break before work that needs precision.']],
 timing:[['ابدأ بخطوة صغيرة محسوبة','Take one measured step'],['اترك هامشاً للتغيير','Leave room for change'],['نفّذ خطوة قابلة للرجوع وراقب النتيجة قبل التوسّع.','Take a reversible step and observe the result before expanding.'],['أضف خطة بديلة ووقت احتياط ولا تربط كل شيء بموعد واحد.','Allow extra time and keep an alternative plan.']],
 overview:[['اجمع قوتك حول هدف واحد','Gather your focus around one goal'],['اليوم يحتاج قيادة هادئة','Lead with a steady hand'],['حدد قرار اليوم بجملة واحدة واحذف منه كل ما ليس ضرورياً.','Define today’s decision in one sentence.'],['قسّم اليوم إلى قرار، تنفيذ، ثم مراجعة قبل أي التزام جديد.','Decide, act, then review before making another commitment.']]
 };const v=texts[s.category];return {title:t(...v[positive?0:1]),action:t(...v[positive?2:3])};
}
export const technical=(e:Evidence)=>`${e.transit.symbol} ${planet(e.transit.id)} · ${aspect(e.angle)} · ${planet(e.natal.id)} ${e.natal.symbol} — ${e.orb.toFixed(2)}° · ${e.applying?t('مقترب','applying'):t('مبتعد','separating')}`;
