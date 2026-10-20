import type {Report} from './engine.ts';
import {signalStory} from './readingNarrative.ts';
import {category,type Signal} from './math.ts';

type Bi=readonly [string,string];
const mood:readonly (readonly [Bi,Bi,Bi])[]=[
 [['إذا تريد تبدأ شي، خلي الحماس يخدم هدف واحد.','If you want a fresh start, direct your drive toward one goal.'],['مثلاً: عندك مشروع مأجل؟ اختار أول مهمة بدل ما تعد بتغيير كلشي.','For example, choose the first step of a delayed project rather than remaking your whole plan.'],['انتبه من استعجال الرد أو فرض النتيجة على أحد.','Avoid rushing replies or trying to force a result.']],
 [['الراحة والاستقرار يصيرن أهم من كثرة التغييرات.','Comfort and steadiness take priority over constant change.'],['راجع حاجة بسيطة بالبيت أو المصاريف حتى يخف الضغط اليومي.','Review one practical home or money decision to reduce pressure.'],['لا تخلي التمسك بالمألوف يمنعك من تعديل مفيد.','Do not let familiar habits block a useful adjustment.']],
 [['الحچي والمعلومات الجديدة يستحقن اهتمامك، بس لا تتوزع على عشر مواضيع.','Conversations and new ideas feel relevant, but avoid scattering your attention.'],['إذا وصلت رسالة تحتمل تفسيرين، اسأل سؤال واضح قبل ما تحسم.','If a message is ambiguous, ask one clear question before deciding.'],['انتبه من نقل كلام ناقص أو فهم السكوّت كرفض.','Do not treat missing information or silence as rejection.']],
 [['احتياجك للأمان والانتماء ممكن يظهر بمواضيع البيت أو القرب العاطفي.','Security and belonging may feel important in home or relationships.'],['إذا زعلت من شخص قريب، وضح احتياجك بدل ما تنتظر يفهم من تلقاء نفسه.','If someone close upsets you, explain your need rather than expecting mind-reading.'],['لا تعتبر كل موقف عابر حكم على العلاقة كلها.','Do not treat one incident as a verdict on the relationship.']],
 [['التعبير عن نفسك والمتعة يستحقن مكان بجدولك.','Self-expression and enjoyment deserve room in your day.'],['مثلاً: شارك إنجاز بسيط أو اقترح طلعة خفيفة إذا متفقين.','Share a small accomplishment or suggest an easy outing if interest is mutual.'],['خلّ التقدير إضافة حلوة، مو شرط حتى تحس بقيمة شغلك.','Let appreciation be welcome, not a condition for valuing your work.']],
 [['الترتيب والتفاصيل الصغيرة ممكن يخلون يومك أهدأ.','Organization and small details can make the day easier.'],['اختار ملف أو مهمة تحتاج مراجعة وخلّصها بشكل واضح.','Pick one item that needs checking and complete it clearly.'],['ماكو داعي تصير كل التفاصيل كاملة حتى تبدأ.','You do not need every detail perfect before starting.']],
 [['التفاهم والإنصاف بين طرفين يستحقن اهتمام أكثر.','Mutual understanding and fairness deserve attention.'],['إذا أكو خلاف، اسأل شنو الحل اللي يحترم حاجتك وحاجة الثاني.','During disagreement, ask what respects both people’s needs.'],['لا تساير بس حتى تتجنب نقاش ضروري.','Do not agree merely to avoid a needed conversation.']],
 [['الخصوصية والثقة والحدود ممكن تصير ببالك أكثر.','Privacy, trust and boundaries may feel more relevant.'],['إذا موضوع حساس يضغط عليك، احچي عنه بهدوء مع الشخص المعني فقط.','If a sensitive issue is pressing, speak calmly to the person involved.'],['راقب الفرق بين الحاجة للوضوح ومحاولة السيطرة على جواب غيرك.','Distinguish seeking clarity from controlling someone else’s answer.']],
 [['عندك مجال تراجع فكرة سفر أو تعلم أو تغيير منظور.','You can revisit a travel, learning or broader-life idea.'],['إذا فرصة شدت اهتمامك، اعرف كلفتها ووقتها قبل الالتزام.','If an opportunity appeals, check its time and cost first.'],['الحماس وحده ما يغني عن الترتيب والتحقق.','Excitement cannot replace planning and checking.']],
 [['المسؤولية والنتيجة العملية أهم من كثرة الوعود.','Responsibilities and tangible results matter more than grand promises.'],['حدّد مهمة تنقاس نتيجتها ووضح المطلوب قبل التنفيذ.','Define one measurable task and clarify its requirements.'],['لا تحمل نفسك شغل مو كله من مسؤوليتك.','Do not take on obligations that are not all yours.']],
 [['تجربة أسلوب جديد أو التواصل ويا ناس مختلفين ممكن يفيدك.','A new approach or conversation with different people may help.'],['جرّب حل غير مألوف لمشكلة بسيطة وخلي خيار الرجوع متاح.','Try an alternative for a small problem and keep the option to revert.'],['الاستقلال ما يحتاج قطيعة أو صدمة للطرف الثاني.','Independence does not require sudden rupture.']],
 [['الخيال والراحة والإبداع ممكن يساعدنك تشوف الموضوع من جهة ثانية.','Imagination, rest and creativity can offer perspective.'],['إذا شدّك احتمال عاطفي، اكتب المعلومة المؤكدة وحدها قبل ما تتوقع.','If a romantic possibility interests you, list only confirmed facts before imagining outcomes.'],['لا تعتبر الانطباع وحده دليل على نية شخص.','An impression is not evidence of another person’s intentions.']]
];
export function moonHumanReading(sign:number,report:Report,knownTime:boolean,language:'ar'|'en'):string[]{
 const idx=language==='ar'?0:1,item=mood[sign];
 if(!item)return [];
 const relevant=report.evidence.filter(e=>e.transit.id==='Moon'&&(knownTime||!['Moon','Ascendant','MC'].includes(e.natal.id))).sort((a,b)=>b.weight-a.weight||a.orb-b.orb);
 const e=relevant[0];
 const story=e?signalStory({category:category(e),score:50,tier:'C',tone:'neutral',factors:[e]} as Signal,report.natal,knownTime,language):null;
 const personal=story?story.good:(language==='ar'?'ماكو عامل شخصي قوي إضافي بهالوقت، فالأفضل تقيّم يومك من الواقع مو من فرضية.':'No strong personal factor stands out, so base decisions on real circumstances.');
 const action=story?story.action:(language==='ar'?'اختار خطوة واقعية صغيرة وحدد شلون تعرف إذا نفعت.':'Choose a small practical step and decide how to evaluate it.');
 return [item[0][idx],item[1][idx],item[2][idx],personal,action];
}
