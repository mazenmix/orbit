/** Guard model-produced natal statements against invented celestial bodies,
 * signs, houses and exact degrees; only actual client Swiss placements authorize them.
 */
import {distance} from './math.ts';
export type GroundedPlacement={planet:string;longitude:number;sign:number;house:number|null};
const labels:Readonly<Record<string,readonly string[]>>={
 Sun:['الشمس','شمسك','شمسج','شمسچ','Sun'],Moon:['القمر','قمرك','قمرج','قمرچ','Moon'],Mercury:['عطارد','Mercury'],Venus:['الزهرة','Venus'],Mars:['المريخ','Mars'],
 Jupiter:['المشتري','Jupiter'],Saturn:['زحل','Saturn'],Uranus:['أورانوس','Uranus'],Neptune:['نبتون','Neptune'],
 Pluto:['بلوتو','Pluto'],Chiron:['كيرون','Chiron'],Ascendant:['الطالع','Ascendant'],MC:['وسط السماء','Midheaven','MC'],
 Ceres:['سيريس','Ceres'],Pallas:['بالاس','Pallas'],Juno:['جونو','Juno'],Vesta:['فيستا','Vesta'],Pholus:['فولوس','Pholus']
};
const signsAr=['الحمل','الثور','الجوزاء','السرطان','الأسد','العذراء','الميزان','العقرب','القوس','الجدي','الدلو','الحوت'];
const signsEn=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const houseAr=['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر','الحادي عشر','الثاني عشر'];
const normalizeNatal=(s:string)=>s.normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/[٠-٩]/g,v=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(v))).replace(/[۰-۹]/g,v=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(v)));
const mention=(body:string,alias:string)=>alias.length<3?new RegExp('(?:^|[^a-z])'+alias+'(?:$|[^a-z])','i').test(body):new RegExp('(?:^|[^\\p{L}])(?:و|ف)?'+alias+'(?:$|[^\\p{L}])','iu').test(body);
export function detectInventedNatalText(texts:readonly string[],placements:readonly GroundedPlacement[]):string[]{
 const body=normalizeNatal(texts.join(' \n ')),authorized=new Set(placements.map(p=>p.planet));
 const errors:string[]=[];
 for(const [id,aliases] of Object.entries(labels))if(!authorized.has(id)&&aliases.some(a=>mention(body,normalizeNatal(a))))errors.push('invented-planet:'+id);
 // Check per-body sign attribution as well as the overall allowed bodies list.
 // Venus in Cancer is not allowed just because the chart's Moon is in Cancer.
 const byPlanet=new Map(placements.map(p=>[p.planet,p]));
 const escapeAlias=(v:string)=>v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const compact=body,arabicSigns=signsAr.map(normalizeNatal),arabicHouses=houseAr.map(normalizeNatal);
 // Bounded copula/location phrases cover ordinary prose without crossing a
 // clause or attributing the next planet's sign to the previous planet.
 const arBridge='(?:\\s+(?:عندك|لديك|موجودة?|واقعة?|يقع|تقع|يكون|تكون|هو|هي|برجها?|موقعها?)){0,3}\\s*(?:في\\s+|ب)?(?:برج\\s+)?';
 const enBridge="(?:'s)?(?:\\s+(?:is|was|lies|sits|located|positioned|placed|falls|sign)){0,3}\\s+(?:in\\s+)?(?:the\\s+sign\\s+of\\s+)?";
 for(const [id,aliases] of Object.entries(labels)){
  const placement=byPlanet.get(id);if(!placement)continue;
  for(const alias of aliases){
   const planet=escapeAlias(normalizeNatal(alias));
   const arabicPattern=new RegExp('(?:^|[^\\p{L}])(?:و|ف)?'+planet+arBridge+'('+arabicSigns.join('|')+')(?:$|[^\\p{L}])','giu');
   const englishPattern=new RegExp('(?:^|[^\\p{L}])'+planet+enBridge+'('+signsEn.join('|')+')(?:$|[^\\p{L}])','giu');
   const reverseAr=new RegExp('(?:^|[^\\p{L}])('+arabicSigns.join('|')+')\\s+(?:هو\\s+)?(?:برج|موضع)\\s+'+planet+'(?:$|[^\\p{L}])','giu');
   for(const pattern of [arabicPattern,reverseAr])for(const m of compact.matchAll(pattern)){const sign=arabicSigns.indexOf(m[1]);if(sign!==placement.sign)errors.push('wrong-planet-sign:'+id+':'+m[1])}
   for(const m of compact.matchAll(englishPattern)){const sign=signsEn.findIndex(v=>v.toLowerCase()===m[1].toLowerCase());if(sign!==placement.sign)errors.push('wrong-planet-sign:'+id+':'+m[1])}
   const houseArPattern=new RegExp('(?:^|[^\\p{L}])(?:و|ف)?'+planet+arBridge+'البيت\\s+('+arabicHouses.join('|')+'|1[0-2]|[1-9])(?:$|[^\\p{L}\\d])','giu');
   const houseEnPattern=new RegExp('(?:^|[^\\p{L}])'+planet+enBridge+'(?:the\\s+)?house\\s+([1-9]|1[0-2])\\b','giu');
   for(const m of compact.matchAll(houseArPattern))if(placement.house!==(Number(m[1])||arabicHouses.indexOf(m[1])+1))errors.push('wrong-planet-house:'+id+':'+m[1]);
   for(const m of compact.matchAll(houseEnPattern))if(placement.house!==Number(m[1]))errors.push('wrong-planet-house:'+id+':'+m[1]);
  }
 }
 const allowedSigns=new Set(placements.map(x=>x.sign));
 const claim=/\b(?:in\s+|in\s+(?:the\s+)?sign\s+)(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\b/giu;
 const arabic=new RegExp('(?:برج\\s+)('+arabicSigns.join('|')+')','gu');
 for(const regex of [claim,arabic])for(const m of body.matchAll(regex)){
  const index=arabicSigns.indexOf(m[1])>=0?arabicSigns.indexOf(m[1]):signsEn.findIndex(s=>s.toLowerCase()===m[1].toLowerCase());
  if(index>=0&&!allowedSigns.has(index))errors.push('invented-sign:'+m[1]);
 }
 const allowedHouses=new Set(placements.map(p=>p.house).filter(h=>h!==null));
 for(const m of compact.matchAll(new RegExp('البيت\\s+('+arabicHouses.join('|')+'|1[0-2]|[1-9])(?:$|[^\\p{L}\\d])','gu'))){
  if(!allowedHouses.has(Number(m[1])||arabicHouses.indexOf(m[1])+1))errors.push('invented-house:'+m[1]);
 }
 for(const m of body.matchAll(/\bhouse\s+([1-9]|1[0-2])\b/giu))if(!allowedHouses.has(Number(m[1])))errors.push('invented-house:'+m[1]);
 if(/[0-9]+(?:\.[0-9]+)?\s*°/.test(compact))errors.push('unsourced-precise-degree');
 const aspectLabels:readonly (readonly [number,string])[]=[[0,'اقتران|conjunction|conjunct'],[60,'تسديس|sextile'],[90,'تربيع|square'],[120,'تثليث|trine'],[180,'مقابلة|opposition|opposite']];
 for(const a of placements)for(const b of placements){
  if(a.planet===b.planet)continue;
  const first=(labels[a.planet]??[a.planet]).map(normalizeNatal).map(escapeAlias).join('|'),second=(labels[b.planet]??[b.planet]).map(normalizeNatal).map(escapeAlias).join('|');
  for(const [angle,terms] of aspectLabels){
   const direct=new RegExp('(?:'+first+')\\s+(?:في\\s+|ب)?(?:'+terms+')\\s+(?:مع\\s+|with\\s+|to\\s+|و|ب)?(?:'+second+')(?:$|[^\\p{L}])','iu');
   const leading=new RegExp('(?:'+terms+')\\s+(?:'+first+')\\s+(?:مع\\s+|with\\s+|to\\s+|و|ب)(?:'+second+')(?:$|[^\\p{L}])','iu');
   if((direct.test(compact)||leading.test(compact))&&Math.abs(distance(a.longitude,b.longitude)-angle)>3)errors.push('invented-aspect:'+a.planet+':'+angle+':'+b.planet);
  }
 }
 return [...new Set(errors)];
}

export function safeBasisSummary(positions:readonly GroundedPlacement[],arabic:boolean){
 const arNames:Record<string,string>={Sun:'الشمس',Moon:'القمر',Mercury:'عطارد',Venus:'الزهرة',Mars:'المريخ',Jupiter:'المشتري',Saturn:'زحل',Uranus:'أورانوس',Neptune:'نبتون',Pluto:'بلوتو',Ascendant:'الطالع',MC:'وسط السماء'};
 return positions.map(p=>(arabic?(arNames[p.planet]??p.planet):p.planet)+(arabic?' في ':' in ')+(arabic?signsAr[p.sign]:signsEn[p.sign])+(p.house?(arabic?' بالبيت '+p.house:' in house '+p.house):'')).join(arabic?'، ':', ');
}
