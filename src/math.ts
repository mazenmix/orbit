/** Symbolic weights originate in AstrologyEngine.swift / InterpretationEngine.swift
 * at 5f9b199. Full-set scoring and source-review revisions are versioned in
 * VERIFICATION.md. These indices are not calibrated probabilities.
 */
export const normalize=(x:number)=>{const remainder=x%360;return remainder<0?remainder+360:(remainder===0?0:remainder)};
export const distance=(a:number,b:number)=>{const d=Math.abs(normalize(a)-normalize(b));return Math.min(d,360-d)};
export const clamp=(x:number)=>Math.min(99,Math.max(1,x));
export const bodies=[
 [0,'Sun','الشمس','☉',.86,1.4],[1,'Moon','القمر','☾',.54,.8],
 [2,'Mercury','عطارد','☿',.68,1.4],[3,'Venus','الزهرة','♀',.72,1.4],
 [4,'Mars','المريخ','♂',.78,1.4],[5,'Jupiter','المشتري','♃',.90,2.2],
 [6,'Saturn','زحل','♄',1,2.2],[7,'Uranus','أورانوس','♅',1.04,2],
 [8,'Neptune','نبتون','♆',1.02,2],[9,'Pluto','بلوتو','♇',1.08,2],
 [15,'Chiron','كيرون','⚷',.62,1.2],[17,'Ceres','سيريس','⚳',.55,1.2],
 [18,'Pallas','بالاس','⚴',.54,1.2],[19,'Juno','جونو','⚵',.58,1.2],
 [20,'Vesta','فيستا','⚶',.53,1.2],[16,'Pholus','فولوس','⯛',.50,1.2]
] as const;
export const angles=[0,60,90,120,180] as const;
export const aspectNames=['conjunction','sextile','square','trine','opposition'] as const;
export const aspectArabic=['اقتران','تسديس','تربيع','تثليث','مقابلة'];
export type Point={id:string;symbol:string;longitude:number;speed:number};
export type Evidence={id:string;transit:Point;natal:Point;angle:number;orb:number;maximumOrb:number;applying:boolean;weight:number;exact:string|null};
export type Category='overview'|'career'|'love'|'communication'|'energy'|'emotions'|'recovery'|'timing';
export const categories:Category[]=['overview','career','love','communication','energy','emotions','recovery','timing'];
export type Tone='exceptional'|'opportunity'|'supportive'|'neutral'|'watch'|'caution';
export type Signal={category:Category;score:number;tier:'S'|'A'|'B'|'C';tone:Tone;factors:Evidence[];allFactors?:Evidence[]};
/** Instantaneous motion toward a fixed natal point. The step cannot cross the
 * exact contact, even for a fast Moon or a retrograde transit near zero orb. */
export function applyingToNatal(t:Point,n:Point,angle:number):boolean{
 const orb=Math.abs(distance(t.longitude,n.longitude)-angle);
 if(orb<=1e-10||Math.abs(t.speed)<1e-12)return false;
 const step=Math.sign(t.speed)*Math.min(Math.abs(t.speed)/1440,orb/3);
 return Math.abs(distance(normalize(t.longitude+step),n.longitude)-angle)+1e-10<orb;
}
export function importance(id:string){return ['Ascendant','MC','Sun','Moon'].includes(id)?1:['Mercury','Venus','Mars'].includes(id)?.86:['Jupiter','Saturn'].includes(id)?.78:.64}
export function aspects(transits:Point[],natal:Point[],at:Date):Evidence[]{
 if(!Number.isFinite(+at)||[...transits,...natal].some(p=>!Number.isFinite(p.longitude)||!Number.isFinite(p.speed)))throw Error('Invalid aspect coordinates or instant');
 const out:Evidence[]=[];
 for(const t of transits){const spec=bodies.find(b=>b[1]===t.id);if(!spec)continue;const max=spec[5];
  for(const n of natal)for(const angle of angles){const orb=Math.abs(distance(t.longitude,n.longitude)-angle);if(orb>max)continue;
   const applying=applyingToNatal(t,n,angle);
   out.push({id:`${t.id}-${angle}-${n.id}`,transit:t,natal:n,angle,orb,maximumOrb:max,applying,
    weight:Math.min(1,(1-orb/max)*.58+spec[4]*.24+importance(n.id)*.12+([0,180].includes(angle)?1:.92)*.06),
    // Only a numerical ephemeris crossing can establish an exact timestamp.
    exact:null});
  }
 }
 return out.sort((a,b)=>b.weight-a.weight||a.orb-b.orb||a.id.localeCompare(b.id));
}
export const harmonious=(e:Pick<Evidence,'angle'>)=>e.angle===60||e.angle===120;
export const challenging=(e:Pick<Evidence,'angle'>)=>e.angle===90||e.angle===180;
export const supportive=(e:Evidence)=>harmonious(e)||(!challenging(e)&&['Jupiter','Venus'].includes(e.transit.id));
export const difficult=(e:Evidence)=>challenging(e)||(!harmonious(e)&&['Saturn','Mars','Pluto','Uranus'].includes(e.transit.id));
/** One calculated transit/target/angle is one factor, regardless of aliases or
 * repeated records. Conflicting copies must not make direction order-dependent. */
export function rankedFactors(input:readonly Evidence[]):Evidence[]{
 const unique=new Map<string,Evidence>();
 for(const e of input){
  if(!Number.isFinite(e.weight)||e.weight<=0||e.weight>1||!angles.includes(e.angle as 0)||!Number.isFinite(e.orb)||e.orb<0)continue;
  const key=e.transit.id+':'+e.natal.id+':'+e.angle,prior=unique.get(key);
  if(prior){
   if(Math.abs(prior.weight-e.weight)>1e-12||Math.abs(prior.orb-e.orb)>1e-12||prior.applying!==e.applying)throw Error('Conflicting calculated aspect: '+key);
   if((prior.id??key).localeCompare(e.id??key)<=0)continue;
  }
  unique.set(key,e);
 }
 return [...unique.values()].sort((a,b)=>b.weight-a.weight||a.orb-b.orb||(a.id??'').localeCompare(b.id??''));
}
export function balancedFactors(input:readonly Evidence[],limit:number):Evidence[]{
 const ranked=rankedFactors(input);
 const selected=new Map<string,Evidence>();
 for(const predicate of [supportive,difficult]){const e=ranked.find(predicate);if(e)selected.set(e.id,e)}
 for(const e of ranked){if(selected.size>=limit)break;selected.set(e.id,e)}
 return [...selected.values()].sort((a,b)=>b.weight-a.weight||a.orb-b.orb||a.id.localeCompare(b.id));
}
export function category(e:Evidence):Category{
 switch(e.natal.id){case 'Ascendant':case 'Venus':return 'love';case 'MC':case 'Sun':case 'Jupiter':case 'Saturn':return 'career';case 'Mercury':return 'communication';case 'Mars':return 'energy';case 'Moon':return challenging(e)?'emotions':'recovery';case 'Uranus':return 'timing';case 'Neptune':return 'emotions';default:return 'overview'}
}
export function signals(evidence:Evidence[]):Signal[]{
 const out:Signal[]=[];
 for(const c of categories){const factors=balancedFactors(evidence.filter(e=>category(e)===c),4);const e=factors[0];if(!e||e.weight<.30)continue;
  const allFactors=rankedFactors(evidence.filter(e=>category(e)===c));
  const net=allFactors.reduce((v,f)=>v+(supportive(f)?f.weight:0)-(difficult(f)?f.weight:0),0);
  const sources=new Set(allFactors.map(f=>f.transit.id)).size;
  const tier=e.weight>=.86&&sources>=3?'S':e.weight>=.72||(e.weight>=.62&&sources>=2)?'A':e.weight>=.46?'B':'C';
  const tone:Tone=net>=1.35&&tier==='S'?'exceptional':net>=.46?(tier==='A'||tier==='S'?'opportunity':'supportive'):net<=-.72?'caution':net<=-.18?'watch':'neutral';
  const base={exceptional:88,opportunity:76,supportive:64,neutral:52,watch:43,caution:30}[tone];
  const score=tone==='neutral'?Math.round(clamp(50+net*10)):Math.trunc(clamp(base+(Math.min(1,Math.abs(net)/2+e.weight*.55)-.5)*18));
  out.push({category:c,tier,tone,score,factors,allFactors});
 }
 const rank={S:4,A:3,B:2,C:1};return out.sort((a,b)=>rank[b.tier]-rank[a.tier]||b.score-a.score);
}
export function profectionCategory(house:number):Category{return [2,6,10].includes(house)?'career':[5,7,8].includes(house)?'love':[3,9].includes(house)?'communication':house===1?'energy':[4,12].includes(house)?'emotions':house===11?'timing':'overview'}
export function scores(items:Signal[],house:number){const out=Object.fromEntries(categories.map(c=>[c,50])) as Record<Category,number>;for(const s of items)out[s.category]=s.score;if(Number.isInteger(house)&&house>=1&&house<=12){const c=profectionCategory(house);if(items.some(s=>s.category===c))out[c]=Math.min(99,out[c]+5)}return out}
export function houseNumber(lon:number,cusps:number[]){if(cusps.length!==12)return 0;for(let i=0;i<12;i++){const start=normalize(cusps[i]);const arc=normalize(cusps[(i+1)%12]-start);if(normalize(lon-start)<arc)return i+1}return 0}
export type SynastryEvidence={first:Point;second:Point;angle:number;orb:number;influence:number};
export function synastry(a:Point[],b:Point[]):SynastryEvidence[]{const out:SynastryEvidence[]=[];for(const first of a)for(const second of b){
 const ids=[first.id,second.id],pair=[...ids].sort().join('|'),sep=distance(first.longitude,second.longitude);
 const max=ids.includes('Sun')||ids.includes('Moon')?6:ids.includes('Ascendant')?5:ids.some(i=>['Mercury','Venus','Mars'].includes(i))?4.5:3.5;
 const angle=angles.reduce<number>((best,x)=>Math.abs(sep-x)<Math.abs(sep-best)?x:best,0),orb=Math.abs(sep-angle);if(orb>max)continue;
 const imp=['Mars|Venus','Moon|Sun','Moon|Moon','Mercury|Mercury'].includes(pair)?1:ids.some(i=>['Ascendant','Venus','Mars'].includes(i))?.86:.68;
 out.push({first,second,angle,orb,influence:Math.min(1,(1-orb/max)*.68+imp*.32)});
 }return out.sort((a,b)=>b.influence-a.influence||a.orb-b.orb)}
export type Dimension='attraction'|'sexual'|'emotional'|'communication'|'stability'|'conflict';
const relevance:Record<Dimension,Record<string,number>>={
 attraction:{'Mars|Venus':1.55,'Ascendant|Venus':1.45,'Sun|Venus':1.22,'Moon|Venus':1.10,'Venus|Venus':1,'Ascendant|Mars':1.05,'Pluto|Venus':1.18,'Mars|Pluto':.95},
 sexual:{'Mars|Venus':1.65,'Mars|Mars':1.18,'Pluto|Venus':1.34,'Mars|Pluto':1.35,'Ascendant|Mars':1.10,'Moon|Mars':1.02,'Uranus|Venus':.90},
 emotional:{'Moon|Moon':1.55,'Moon|Sun':1.38,'Moon|Venus':1.35,'Jupiter|Moon':1.05,'Moon|Saturn':1.04,'Moon|Neptune':.92},
 communication:{'Mercury|Mercury':1.52,'Mercury|Moon':1.30,'Mercury|Sun':1.22,'Mercury|Venus':1.08,'Jupiter|Mercury':.90,'Mercury|Saturn':.92},
 stability:{'Saturn|Sun':1.30,'Moon|Saturn':1.35,'Saturn|Venus':1.42,'Mars|Saturn':.92,'Sun|Sun':.92,'Moon|Moon':1.05,'Jupiter|Saturn':.84},
 conflict:{'Mars|Mars':1.38,'Mars|Mercury':1.25,'Mars|Moon':1.36,'Mars|Saturn':1.35,'Mars|Uranus':1.22,'Mars|Pluto':1.28,'Mercury|Uranus':.96,'Moon|Pluto':1.08,'Saturn|Sun':.86}
};
export function compatibilityScore(dim:Dimension,evidence:SynastryEvidence[],factor=1,bonus=0){let delta=bonus;for(const e of evidence){const pair=[e.first.id,e.second.id].sort().join('|'),r=relevance[dim][pair]??0;let g:number;
 if(dim==='conflict')g=challenging(e)?1:harmonious(e)?-.42:/Mars|Pluto|Uranus/.test(pair)?.68:.18;
 else if(harmonious(e))g=1;else if(challenging(e))g=(dim==='attraction'||dim==='sexual')?(pair==='Mars|Venus'||pair.includes('Pluto')?.35:-.48):-.78;
 else g=pair.includes('Saturn')?(dim==='stability'?.82:-.18):.82;
 delta+=r*g*e.influence*8.5;
 }return clamp(Math.round(dim==='conflict'?24+Math.max(-18,Math.min(61,delta)):50+Math.max(-34,Math.min(42,delta*factor))))}
