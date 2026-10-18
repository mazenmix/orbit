/** Guard model-produced natal statements against invented celestial bodies,
 * signs, houses and exact degrees; only actual client Swiss placements authorize them.
 */
export type GroundedPlacement={planet:string;longitude:number;sign:number;house:number|null};
const labels:Readonly<Record<string,readonly string[]>>={
 Sun:['الشمس','Sun'],Moon:['القمر','Moon'],Mercury:['عطارد','Mercury'],Venus:['الزهرة','Venus'],Mars:['المريخ','Mars'],
 Jupiter:['المشتري','Jupiter'],Saturn:['زحل','Saturn'],Uranus:['أورانوس','Uranus'],Neptune:['نبتون','Neptune'],
 Pluto:['بلوتو','Pluto'],Chiron:['كيرون','Chiron'],Ascendant:['الطالع','Ascendant'],MC:['وسط السماء','Midheaven','MC'],
 Ceres:['سيريس','Ceres'],Pallas:['بالاس','Pallas'],Juno:['جونو','Juno'],Vesta:['فيستا','Vesta'],Pholus:['فولوس','Pholus']
};
const signsAr=['الحمل','الثور','الجوزاء','السرطان','الأسد','العذراء','الميزان','العقرب','القوس','الجدي','الدلو','الحوت'];
const signsEn=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const houseAr=['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر','الحادي عشر','الثاني عشر'];
const mention=(body:string,alias:string)=>alias.length<3?new RegExp('(?:^|[^a-z])'+alias+'(?:$|[^a-z])','i').test(body):new RegExp('(?:^|[^\\p{L}])'+alias+'(?:$|[^\\p{L}])','iu').test(body);
export function detectInventedNatalText(texts:readonly string[],placements:readonly GroundedPlacement[]):string[]{
 const body=texts.join(' \n '),authorized=new Set(placements.map(p=>p.planet));
 const errors:string[]=[];
 for(const [id,aliases] of Object.entries(labels))if(!authorized.has(id)&&aliases.some(a=>mention(body,a)))errors.push('invented-planet:'+id);
 // Check per-body sign attribution as well as the overall allowed bodies list.
 // Venus in Cancer is not allowed just because the chart's Moon is in Cancer.
 const byPlanet=new Map(placements.map(p=>[p.planet,p]));
 const escapeAlias=(v:string)=>v.replace(/[.*+?^$()|[\]{}\\]/g,'\\ const allowedSigns=new Set(placements.map(x=>x.sign));');
 const compact=body.normalize('NFKC').replace(/[\u064B-\u065F\u0670]/g,'');
 for(const [id,aliases] of Object.entries(labels)){
  const placement=byPlanet.get(id);if(!placement)continue;
  for(const alias of aliases){
   const planet=escapeAlias(alias);
   const arabicPattern=new RegExp('(?:^|[^\\p{L}])'+planet+'\\s+(?:في\\s+)?(?:برج\\s+)?('+signsAr.join('|')+')(?:$|[^\\p{L}])','giu');
   const englishPattern=new RegExp('(?:^|[^\\p{L}])'+planet+'\\s+in\\s+(?:the\\s+sign\\s+of\\s+)?('+signsEn.join('|')+')(?:$|[^\\p{L}])','giu');
   for(const m of compact.matchAll(arabicPattern)){const sign=signsAr.indexOf(m[1]);if(sign!==placement.sign)errors.push('wrong-planet-sign:'+id+':'+m[1])}
   for(const m of compact.matchAll(englishPattern)){const sign=signsEn.findIndex(v=>v.toLowerCase()===m[1].toLowerCase());if(sign!==placement.sign)errors.push('wrong-planet-sign:'+id+':'+m[1])}
   const houseArPattern=new RegExp('(?:^|[^\\p{L}])'+planet+'\\s+(?:في\\s+|ب)?البيت\\s+('+houseAr.join('|')+')(?:$|[^\\p{L}])','giu');
   const houseEnPattern=new RegExp('(?:^|[^\\p{L}])'+planet+'\\s+in\\s+house\\s+([1-9]|1[0-2])\\b','giu');
   for(const m of compact.matchAll(houseArPattern))if(placement.house!==houseAr.indexOf(m[1])+1)errors.push('wrong-planet-house:'+id+':'+m[1]);
   for(const m of compact.matchAll(houseEnPattern))if(placement.house!==Number(m[1]))errors.push('wrong-planet-house:'+id+':'+m[1]);
  }
 }
 const allowedSigns=new Set(placements.map(x=>x.sign));
 const claim=/\b(?:in\s+|in\s+(?:the\s+)?sign\s+)(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\b/giu;
 const arabic=/(?:برج\s+)(الحمل|الثور|الجوزاء|السرطان|الأسد|العذراء|الميزان|العقرب|القوس|الجدي|الدلو|الحوت)/gu;
 for(const regex of [claim,arabic])for(const m of body.matchAll(regex)){
  const index=signsAr.indexOf(m[1])>=0?signsAr.indexOf(m[1]):signsEn.findIndex(s=>s.toLowerCase()===m[1].toLowerCase());
  if(index>=0&&!allowedSigns.has(index))errors.push('invented-sign:'+m[1]);
 }
 const allowedHouses=new Set(placements.map(p=>p.house).filter(h=>h!==null));
 for(const m of body.matchAll(/البيت\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر|الحادي عشر|الثاني عشر)/gu)){
  if(!allowedHouses.has(houseAr.indexOf(m[1])+1))errors.push('invented-house:'+m[1]);
 }
 for(const m of body.matchAll(/\bhouse\s+([1-9]|1[0-2])\b/giu))if(!allowedHouses.has(Number(m[1])))errors.push('invented-house:'+m[1]);
 if(/[0-9]+(?:\.[0-9]+)?\s*°/.test(body))errors.push('unsourced-precise-degree');
 return [...new Set(errors)];
}

export function safeBasisSummary(positions:readonly GroundedPlacement[],arabic:boolean){
 const arNames:Record<string,string>={Sun:'الشمس',Moon:'القمر',Mercury:'عطارد',Venus:'الزهرة',Mars:'المريخ',Jupiter:'المشتري',Saturn:'زحل',Uranus:'أورانوس',Neptune:'نبتون',Pluto:'بلوتو',Ascendant:'الطالع',MC:'وسط السماء'};
 return positions.map(p=>(arabic?(arNames[p.planet]??p.planet):p.planet)+(arabic?' في ':' in ')+(arabic?signsAr[p.sign]:signsEn[p.sign])+(p.house?(arabic?' بالبيت '+p.house:' in house '+p.house):'')).join(arabic?'، ':', ');
}
