import type {Chart,Report} from './engine.ts';
import {houseNumber} from './math.ts';

/** Plain-language Moon reflection for the selected person's calculated chart.
 * The calculations remain available on detailed screens, never in this card.
 * Moon-over-natal houses control the immediate PERSONAL topic. Natal Moon's
 * own house adds a secondary personal need. Neither is confused with the
 * momentary location-based sky chart's houses.
 */
type Lang='ar'|'en';
type Text={ar:string;en:string};
const signGuidance:readonly Text[]=[
 {ar:'هسه إذا عندك فكرة جديدة، ابدي بخطوة صغيرة وخلي حماسك يساعدك مو يستعجلك.',en:'If a new idea appeals to you, try one small step without rushing into a commitment.'},
 {ar:'هسه اختار الشي اللي يريحك ويثبّت يومك، ولا تغيّر خططك فقط بسبب ضغط لحظي.',en:'Choose what gives your day stability, and avoid changing plans because of momentary pressure.'},
 {ar:'عندك مجال تستفيد من حوار أو معلومة جديدة؛ اسأل بوضوح قبل ما تستنتج.',en:'A conversation or new information may be useful; ask clearly before drawing conclusions.'},
 {ar:'خلّ احتياجاتك العاطفية واضحة إلك وللناس القريبين منك، ولا تتوقع يفهمون السكوت.',en:'Be clear about your emotional needs with yourself and people close to you; do not expect silence to explain them.'},
 {ar:'لا تخفي الفكرة اللي تعبت عليها، بس خلي ثقتك بمجهودك مو بردّة فعل الآخرين.',en:'Share work you care about, but let your confidence rest on your effort, not only on others’ reactions.'},
 {ar:'إذا يومك مزدحم، رتّب أولوياتك وخلّص مهمة وحدة زين بدل ما تتشتت.',en:'If your day feels crowded, order your priorities and complete one task well.'},
 {ar:'بأي نقاش اليوم، حاول تسمع الطرف الثاني وتوضح موقفك بدون ما تتنازل عن اللي يهمك.',en:'In a conversation, hear the other side while stating what matters to you.'},
 {ar:'إذا شي مضايقك، اطلب الوضوح بصورة مباشرة بدل ما تقعد تحلل نوايا الآخرين.',en:'If something bothers you, seek clarity directly rather than guessing hidden motives.'},
 {ar:'إذا بالك بسفرة أو تجربة جديدة، شوف الخطوة العملية والكلفة قبل الحسم.',en:'If you are considering travel or something new, check the practical details before committing.'},
 {ar:'ركّز على مسؤولية واحدة تگدر تنجزها اليوم، ولا تحمل نفسك أكثر من اللازم.',en:'Focus on one responsibility you can realistically complete; do not take on everything at once.'},
 {ar:'هسه يمكن يفيدك تبدّل روتينك أو تجرب فكرة مختلفة، بس بدون قرارات مفاجئة أو قطع علاقات.',en:'A fresh approach could help right now; try it without sudden decisions or cutting people off.'},
 {ar:'خذ مساحة للراحة وصفاء البال، وافصل إحساسك عن الوقائع قبل أي قرار.',en:'Make room for rest and separate what you feel from what you know before deciding.'}
];
const personalFocus:readonly Text[]=[
 {ar:'',en:''},
 {ar:'اهتم بنفسك وطريقة حضورك؛ لا تخلي رأي أحد يحدد قيمتك أو قرارك.',en:'Pay attention to how you carry yourself, without letting someone else define your worth.'},
 {ar:'راجع مصاريفك وشنو تحتاج فعلاً؛ اشترِ أو التزم بس بالشي اللي يخدمك.',en:'Review your spending and actual needs before buying or making a commitment.'},
 {ar:'إذا عندك رسالة أو موضوع معلق، وضّح المقصود بكلام مباشر بدل التخمين.',en:'If a message or conversation is unresolved, ask plainly instead of guessing.'},
 {ar:'رتّب مساحة الراحة إلك، وإذا أكو موضوع ويا المقرّبين احچي عن احتياجك بهدوء.',en:'Make some room for comfort; if something with loved ones needs attention, say what you need calmly.'},
 {ar:'إذا تريد تتقرب من شخص أو تطلع وتستانس، بادر بشي خفيف وشوف التجاوب الحقيقي.',en:'If you want to connect or enjoy yourself, make a low-pressure invitation and follow the actual response.'},
 {ar:'خفف زحمة المهام وراجع روتينك؛ خطوة منظمة تفيدك أكثر من الاستنزاف.',en:'Ease your workload where possible; one organized step beats pushing yourself to exhaustion.'},
 {ar:'بعلاقة أو شراكة مهمة، وضّح توقعاتك واسمع جواب الطرف الثاني بدل افتراض نيّته.',en:'In a close relationship or partnership, explain expectations and listen instead of assuming intentions.'},
 {ar:'إذا موضوع الثقة أو الالتزامات المشتركة مشغلك، ثبّت الحدود والاتفاقات قبل الحسم.',en:'If trust or shared obligations concern you, clarify boundaries and agreements first.'},
 {ar:'إذا بالك بخطة سفر أو تعلّم، حوّل الفكرة إلى خطوة واضحة بدل ما تبقى مجرد احتمال.',en:'If travel or learning is on your mind, turn the idea into one concrete step.'},
 {ar:'بالشغل، خلّ أولويتك واضحة وبيّن شنو تگدر تسلّم فعلاً؛ لا تعد بأكثر من طاقتك.',en:'At work, set one clear priority and be realistic about what you can deliver.'},
 {ar:'التواصل ويا صديق أو معارف يفيدك أكثر من الانتظار؛ بادر بكلام بسيط وخلي ردّهم يوضح الصورة.',en:'Reach out to a friend or contact simply, and let their actual response guide you.'},
 {ar:'خلي عندك وقت هدوء بعيد عن الضوضاء؛ مو لازم تجاوب على كلشي فوراً.',en:'Give yourself some quiet time; not everything needs an immediate response.'}
];
const emotionalSupport:readonly Text[]=[
 {ar:'',en:''},
 {ar:'من تحس بضغط، رجّع تركيزك لشنو تريد إنت قبل ما تستجيب لتوقعات غيرك.',en:'Under pressure, check what you want before reacting to others’ expectations.'},
 {ar:'إذا القلق زاد، راجع احتياجاتك الأساسية وخططك المالية بهدوء.',en:'When anxious, check your practical needs and financial plans calmly.'},
 {ar:'الحچي الواضح ويا شخص تثق بيه ممكن يساعدك ترتب أفكارك.',en:'A clear conversation with someone you trust can help you sort your thoughts.'},
 {ar:'خذ وقت بمكان ترتاح بيه، ولا تكتم الاحتياج اللي تريد توضحه.',en:'Spend time somewhere comfortable, and speak up about what you need.'},
 {ar:'لا تربط مزاجك بكمية الاهتمام اللي يجيك؛ سوِّ شي تستمتع بيه لنفسك.',en:'Do something you enjoy without making your mood depend on attention from others.'},
 {ar:'الروتين الخفيف والراحة يساعدنك ترتّب أفكارك بدل الضغط المستمر.',en:'A gentler routine and rest can help you think clearly.'},
 {ar:'إذا موضوع عاطفي محيّرك، الحوار الصريح أحسن من اختبار ردود الناس.',en:'If a relationship worries you, direct conversation beats testing someone’s reaction.'},
 {ar:'لا تخلي القلق عن نية الآخرين ياخذ مكان الكلام الواضح والحدود.',en:'Do not let worry about others’ motives replace clear boundaries and conversation.'},
 {ar:'من تضيع بين احتمالات، ارجع لهدف واضح تگدر تتحرك باتجاهه.',en:'When possibilities overwhelm you, return to one achievable goal.'},
 {ar:'لا تعتبر تقييم الآخرين لشغلك مقياساً لقيمتك الشخصية.',en:'Do not confuse how others evaluate your work with your personal worth.'},
 {ar:'وإذا تحتاج أحد يسمعك، اختار صديق قريب واحچي وياه بصراحة.',en:'If you need to talk things through, choose a trusted friend and be straightforward.'},
 {ar:'لا تضغط على نفسك حتى تبين دائماً متماسك؛ الراحة هم جزء من التوازن.',en:'You do not need to appear strong every moment; rest is part of balance.'}
];
const contactAdvice:Record<string,Text>={
 Sun:{ar:'إذا تعارضت راحتك ويا رغبتك تثبت نفسك، اختار الأولوية اللي تعني إلك أكثر.',en:'If comfort and proving yourself pull in different directions, choose what matters most.'},
 Moon:{ar:'إذا انزعجت من موقف، سمِّ احتياجك قبل ما ترد.',en:'If something upsets you, name your need before responding.'},
 Mercury:{ar:'إذا وصلتك رسالة مبهمة، اسأل عن معناها ولا تعتبر السكوت جواب.',en:'If a message is unclear, ask rather than treating silence as an answer.'},
 Venus:{ar:'بالتقارب، عبّر عن اهتمامك بدون ضغط وخلي تصرّف الطرف الثاني يوضح موقفه.',en:'When showing affection, keep it low-pressure and trust the other person’s actual response.'},
 Mars:{ar:'إذا استفزك موقف، اصرف اندفاعك بخطوة مفيدة بدل رد سريع.',en:'If something provokes you, take one useful action rather than reacting impulsively.'},
 Jupiter:{ar:'إذا فرصة شدت بالك، تحقق من تفاصيلها قبل ما توعد بشي كبير.',en:'If an opportunity excites you, check its details before making big promises.'},
 Saturn:{ar:'اسأل نفسك شنو مسؤوليتك فعلاً وشنو حمل زايد تگدر تخففه.',en:'Separate your real responsibilities from unnecessary pressure.'},
 Uranus:{ar:'جرّب تغيير بسيط وخلي لنفسك مجال ترجع إذا ما ناسبك.',en:'Try a small change and leave yourself room to adjust.'},
 Neptune:{ar:'إذا إحساسك قوي والمعلومات قليلة، انتظر الوقائع قبل ما تقرر.',en:'If feelings are strong but facts are scarce, wait for evidence before deciding.'},
 Pluto:{ar:'لا تحاول تفرض نتيجة على شخص أو موقف؛ ركّز على حدودك وخطوتك الجاية.',en:'Do not try to force a person or situation; focus on your boundaries and next step.'}
};
const point=(chart:Chart,id:string)=>chart.points.find(p=>p.id===id);
const moonSign=(longitude:number)=>Math.floor(((longitude%360+360)%360)/30);
export function moonPersonalSummary(report:Report,knownTime:boolean,lang:Lang):string{
 const moon=point(report.current,'Moon');
 if(!moon||!Number.isFinite(moon.longitude))return lang==='ar'?'حالياً ما عندي معلومات كافية حتى أعطيك قراءة موجهة إلك.':'There is not enough current information for a personal reflection.';
 const lines:string[]=[];
 // Sign supplies only the tone, never an invented event.
 lines.push(signGuidance[moonSign(moon.longitude)][lang]);
 const natalMoon=knownTime?point(report.natal,'Moon'):undefined;
 // Only calculated natal cusps can personalize the immediate area of life.
 const hasHouses=knownTime&&report.natal.cusps.length===12;
 const currentPersonalArea=hasHouses?houseNumber(moon.longitude,report.natal.cusps):0;
 const natalEmotionalArea=hasHouses&&natalMoon?houseNumber(natalMoon.longitude,report.natal.cusps):0;
 if(currentPersonalArea)lines.push(personalFocus[currentPersonalArea][lang]);
 // Secondary emotional context: don't echo the exact same domain twice.
 if(natalEmotionalArea&&natalEmotionalArea!==currentPersonalArea)lines.push(emotionalSupport[natalEmotionalArea][lang]);
 const relevant=report.evidence
  .filter(e=>e.transit.id==='Moon'&&(knownTime||!['Moon','Ascendant','MC'].includes(e.natal.id)))
  .sort((a,b)=>b.weight-a.weight||a.orb-b.orb)[0];
 const advice=relevant&&relevant.weight>=.35&&contactAdvice[relevant.natal.id]?.[lang];
 // Never discard the strongest calculated personal contact just because two
 // natal-house themes already occupy the first paragraphs. Without this,
 // different people's readings can misleadingly collapse to the same prose.
 if(advice){
  const challenging=relevant!.angle===90||relevant!.angle===180;
  const joining=relevant!.angle===0;
  const intro=lang==='ar'?
   (challenging?'وانتبه لموضوع إضافي ممكن يحتاج تروّي: ':joining?'وموضوع إضافي يستحق تركيزك: ':'وموضوع إضافي ممكن تتعامل وياه بسهولة نسبية: '):
   (challenging?'A second theme may need care: ':joining?'A second theme deserves attention: ':'A second theme may be easier to work with: ');
  lines.push(intro+advice);
 }
 if(lines.length===1){
  // No birth-house assumptions if the birth time or cusps are absent.
  lines.push(lang==='ar'
   ?'خلّ حكمك على الموقف من اللي صار فعلاً، وخذ خطوة بسيطة تناسبك بدل انتظار إشارة أكيدة.'
   :'Judge the situation by what actually happens, and take one small practical step.');
 }
 return lines.join(' ');
}
