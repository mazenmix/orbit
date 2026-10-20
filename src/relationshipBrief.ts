import type {SynastryEvidence} from './math.ts';
import {synastryPlainReading,type TwoLanguage} from './relationshipPlain.ts';

type ContactKind='attraction'|'sexual';
export type RelationshipBrief={
 attraction:TwoLanguage;sexual:TwoLanguage;
 attractionContact:SynastryEvidence|null;sexualContact:SynastryEvidence|null;
 harmony:TwoLanguage;harmonyAction:TwoLanguage;harmonyTitle:TwoLanguage;harmonyContact:SynastryEvidence|null;
 challenge:TwoLanguage;challengeAction:TwoLanguage;challengeTitle:TwoLanguage;challengeContact:SynastryEvidence|null;
};
const joined=(e:SynastryEvidence)=>[e.first.id,e.second.id].sort().join('|');
const weights:Record<ContactKind,Record<string,number>>={
 attraction:{'Mars|Venus':1.55,'Ascendant|Venus':1.45,'Sun|Venus':1.22,'Moon|Venus':1.1,'Venus|Venus':1,'Ascendant|Mars':1.05,'Pluto|Venus':1.18,'Mars|Pluto':.95},
 sexual:{'Mars|Venus':1.65,'Mars|Mars':1.18,'Pluto|Venus':1.34,'Mars|Pluto':1.35,'Ascendant|Mars':1.1,'Mars|Moon':1.02,'Uranus|Venus':.9}
};
const pairSubject=(e:SynastryEvidence):TwoLanguage=>{
 const pair=joined(e);
 if(pair==='Mars|Venus')return {ar:'الزهرة والمريخ',en:'Venus and Mars'};
 if(pair==='Pluto|Venus')return {ar:'الزهرة وبلوتو',en:'Venus and Pluto'};
 if(pair==='Mars|Pluto')return {ar:'المريخ وبلوتو',en:'Mars and Pluto'};
 if(pair==='Mars|Mars')return {ar:'المريخ في الخارطتين',en:'Mars in both charts'};
 if(pair==='Ascendant|Venus')return {ar:'الزهرة والطالع',en:'Venus and the Ascendant'};
 if(pair==='Ascendant|Mars')return {ar:'المريخ والطالع',en:'Mars and the Ascendant'};
 if(pair==='Mars|Moon')return {ar:'القمر والمريخ',en:'Moon and Mars'};
 if(pair==='Moon|Venus')return {ar:'القمر والزهرة',en:'Moon and Venus'};
 if(pair==='Sun|Venus')return {ar:'الشمس والزهرة',en:'Sun and Venus'};
 if(pair==='Uranus|Venus')return {ar:'الزهرة وأورانوس',en:'Venus and Uranus'};
 return {ar:'الاتصالات بين الخارطتين',en:'the chart contacts'};
};
const aspectKind=(e:SynastryEvidence):TwoLanguage=>e.angle===120?
 {ar:'بتثليث',en:'trine'}:e.angle===60?{ar:'بتسديس',en:'sextile'}:
 e.angle===90?{ar:'بتربيع',en:'square'}:e.angle===180?{ar:'بمقابلة',en:'opposition'}:
 {ar:'باقتران',en:'conjunction'};
const find=(evidence:readonly SynastryEvidence[],kind:ContactKind):SynastryEvidence|null=>{
 const ranked=evidence.filter(e=>weights[kind][joined(e)]&&Number.isFinite(e.influence)&&Number.isFinite(e.orb)).slice()
 .sort((a,b)=>{
  const magnitude=(e:SynastryEvidence)=>weights[kind][joined(e)]*e.influence*((e.angle===90||e.angle===180)?.87:1);
  return magnitude(b)-magnitude(a)||a.orb-b.orb;
 });
 return ranked[0]??null;
};
const chemistryDetails:Record<string,{attraction:TwoLanguage;sexual:TwoLanguage}>={
 'Mars|Venus':{
  attraction:{ar:'أسلوب إظهار المودة عند طرف يلتقي ويا جرأة المبادرة عند الثاني؛ ممكن يصير التقارب سريع إذا الاهتمام متبادل، بس سرعة واحد مو بالضرورة سرعة الثاني.',en:'One person’s affectionate style meets the other’s initiative. Attraction may feel lively if it is mutual, though the two may move at different speeds.'},
  sexual:{ar:'الزهرة والمريخ يرمزان لكيمياء جنسية تجمع الحنان والمبادرة؛ اسألوا عن الإيقاع والحدود بدل افتراض إن الشرارة تكفي.',en:'Venus and Mars symbolize sexual chemistry through affection and physical initiative; discuss pace and boundaries rather than assuming attraction is sufficient.'}
 },
 'Pluto|Venus':{
  attraction:{ar:'الزهرة وبلوتو يركزان على قوة الانشداد وحساسية الثقة؛ الانبهار وحده ما يكشف نوايا الطرف الثاني.',en:'Venus and Pluto highlight magnetism and trust. Intensity does not disclose the other person’s intentions.'},
  sexual:{ar:'الدلالة الحميمية تميل للعمق والتعلّق، لكن تحتاج وضوح حتى ما تتحول الغيرة أو السيطرة إلى جزء من القرب.',en:'Symbolic intimacy can feel intense; clarity matters so jealousy or control is not confused with closeness.'}
 },
 'Mars|Pluto':{
  attraction:{ar:'الاندفاع يلتقي ويا رغبة السيطرة على الاتجاه؛ ممكن يكون حضور قوي، ويصير متعب إذا كل واحد يريد يفرض إيقاعه.',en:'Initiative meets control. There may be a strong dynamic, but competing attempts to set the pace can create friction.'},
  sexual:{ar:'إشارة لرغبة قوية بالتعبير والمبادرة، بس أي قرب حميمي يحتاج رغبة متبادلة وحدود واضحة، مو صراع قوة.',en:'The symbolism emphasizes strong initiative; intimacy still requires mutual desire, boundaries and no power struggle.'}
 },
 'Mars|Mars':{
  attraction:{ar:'أسلوبا المبادرة عندكما يتفاعلان؛ الانسجام يتحسن إذا كل واحد يعرف شنو يحفز الثاني وشنو يستفزه.',en:'Two styles of initiative interact. Understanding what motivates or frustrates each person helps more than competing.'},
  sexual:{ar:'الحماس الجسدي ممكن يكون سريع، لكن اختلاف الإيقاع أو الطباع يحتاج حچي صريح وراحة للطرفين.',en:'Physical pace may be energetic in the symbolism; differences call for direct conversation and mutual comfort.'}
 },
 'Uranus|Venus':{
  attraction:{ar:'الاهتمام بالجديد والاستقلال يلتقي بالمودة؛ عنصر المفاجأة ممكن يجذب، بس الاستمرارية ما تنعرف من زاوية فلكية.',en:'Novelty meets affection. The unpredictable can be exciting, but consistency cannot be calculated.'},
  sexual:{ar:'الانفتاح على التجربة رمزياً حاضر، لكن ميول أو تفضيلات الشخص الحميمة ما تنكشف من الخارطة.',en:'Experimentation is a symbolic theme, not access to anyone’s private sexual preferences.'}
 },
 'Moon|Venus':{
  attraction:{ar:'الحاجة للاطمئنان تلتقي بأسلوب الاهتمام؛ ممكن تشعرون بألفة إذا التقدير واضح ومتبادل.',en:'Emotional comfort meets affection; mutual care could make closeness feel easier.'},
  sexual:{ar:'الأمان العاطفي جزء من قراءة التقارب هنا، مو مجرد شغف جسدي؛ احچوا عن الراحة والثقة.',en:'Emotional safety is part of the symbolic chemistry, not only physical attraction; discuss comfort and trust.'}
 },
 'Ascendant|Venus':{
  attraction:{ar:'طريقة الظهور والانطباع الأول ترتبط بالذوق والمودة؛ انجذاب المظهر وحده ما يحدد عمق العلاقة.',en:'First impressions meet preferences and affection; initial attraction does not determine relationship depth.'},
  sexual:{ar:'تناسق الانطباع والحضور ممكن يزيد جاذبية اللقاء الأول رمزياً؛ الباقي يعتمد على التواصل الحقيقي.',en:'Presence and first impressions may symbolically support chemistry; actual connection depends on communication.'}
 }
};
const meaningFor=(e:SynastryEvidence,kind:ContactKind):TwoLanguage=>{
 const pair=joined(e),lens=chemistryDetails[pair]?.[kind];
 const challenging=e.angle===90||e.angle===180,conj=e.angle===0;
 const subject=pairSubject(e),contact=aspectKind(e);
 const prefix=subject.ar+' '+contact.ar+'؛ ',prefixEn=subject.en+' '+contact.en+': ';
 const base=lens??(kind==='attraction'?
  {ar:'هذا الرابط يوضح نوع التفاعل الرمزي بين المودة والمبادرة، مو إثبات أن شخصاً منكما معجب بالآخر.',en:'This aspect describes symbolic interaction, not proof of either person’s feelings.'}:
  {ar:'هنا يتقاطع التعبير الجسدي ويا الحاجة للارتياح، وما ممكن نستنتج رغبات خاصة أو موافقة من الخارطة.',en:'Physical expression and personal comfort meet symbolically; private desires and consent cannot be inferred.'});
 return {
  ar:prefix+(kind==='attraction'?'الجاذبية هنا تتعلق بطبيعة التفاعل، مو بضمان مشاعر متبادلة. ':'')+base.ar+(challenging?' الزاوية المتحدية تضيف شدّ واختلاف بالإيقاع يحتاج تفاهم، مو حكم بفشل العلاقة.':conj?' الاقتران يزيد التركيز على الموضوع، من دون اتجاه مضمون.':''),
  en:prefixEn+base.en+(challenging?' The challenging aspect adds potential friction and pacing differences to discuss, not a failed relationship.':conj?' The conjunction intensifies the theme without predicting an outcome.':'')
 };
};
const initial:TwoLanguage={ar:'ماكو اتصال قريب يدعم تقييم هالجانب فلكياً.',en:'No close calculated aspect supports a reading of this area.'};
export function relationshipBrief(evidence:readonly SynastryEvidence[]):RelationshipBrief{
 const attractionContact=find(evidence,'attraction'),sexualContact=find(evidence,'sexual');
 const supportive=evidence.filter(e=>e.angle===60||e.angle===120).slice().sort((a,b)=>b.influence-a.influence||a.orb-b.orb);
 const challenging=evidence.filter(e=>e.angle===90||e.angle===180).slice().sort((a,b)=>b.influence-a.influence||a.orb-b.orb);
 // When possible, let the harmony box explain a different contact from the attraction and sex box.
 const selected=new Set([attractionContact,sexualContact].filter(Boolean));
 const harmonyContact=supportive.find(e=>!selected.has(e))??supportive[0]??null;
 const challengeContact=challenging.find(e=>!selected.has(e))??challenging[0]??null;
 const harmony=synastryPlainReading(harmonyContact??undefined,'harmony');
 const challenge=synastryPlainReading(challengeContact??undefined,'challenge');
 const attraction=attractionContact?meaningFor(attractionContact,'attraction'):initial;
 const sexual=sexualContact?meaningFor(sexualContact,'sexual'):initial;
 const focusedMeaning=(full:TwoLanguage):TwoLanguage=>{
  const trim=(s:string)=>s.replace(/\s+/g,' ').trim();
  return {ar:trim(full.ar),en:trim(full.en)};
 };
 return {attraction,sexual,attractionContact,sexualContact,
  harmony:focusedMeaning(harmony.meaning),harmonyAction:harmony.advice,harmonyTitle:harmony.title,harmonyContact,
  challenge:focusedMeaning(challenge.meaning),challengeAction:challenge.advice,challengeTitle:challenge.title,challengeContact};
}
