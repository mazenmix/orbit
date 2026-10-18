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
