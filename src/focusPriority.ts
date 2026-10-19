import type {Evidence,Signal} from './math.ts';
import {importance,houseNumber,supportive,difficult,rankedFactors} from './math.ts';

export type PriorityContext={
 signals:readonly Signal[];
 natal:{cusps:readonly number[]};
 knownBirthTime:boolean;
 complete:boolean;
};
export type RankedPriority={
 signal:Signal;
 factor:Evidence;
 salience:number;
 status:'supported'|'mixed'|'limited';
 limitation:'unknown-time'|'missing-ephemeris'|null;
 supporting:number;
 challenging:number;
};

/** A ranking of CALCULATED signals, not a statistical probability of events.
 * Applying and angular-house factors make a modest difference, but proximity,
 * source weights and natal target relevance remain the dominant inputs.
 */
export function priorityWeight(e:Evidence,cusps:readonly number[],knownBirthTime:boolean):number{
 if(!Number.isFinite(e.orb)||!Number.isFinite(e.maximumOrb)||e.maximumOrb<=0||
    e.orb<0||e.orb>e.maximumOrb||!Number.isFinite(e.weight)||e.weight<=0||e.weight>1||
    !Number.isFinite(e.natal.longitude)||!Number.isFinite(e.transit.longitude))return 0;
 const proximity=1-e.orb/e.maximumOrb;
 const natalRelevance=importance(e.natal.id);
 const planet=['Saturn','Jupiter','Uranus','Neptune','Pluto'].includes(e.transit.id)?.98:
              e.transit.id==='Moon'?.65:.85;
 const h=knownBirthTime&&cusps.length===12?houseNumber(e.transit.longitude,[...cusps]):0;
 const angularBonus=[1,4,7,10].includes(h)?.06:0;
 return Math.min(1,.38*proximity+.31*e.weight+.18*natalRelevance+.09*planet+(e.applying?.04:0)+angularBonus);
}
export function rankPrioritySignals(input:PriorityContext):RankedPriority[]{
 const rows:RankedPriority[]=[];
 for(const signal of input.signals){
  const factors=rankedFactors(signal.allFactors?.length?signal.allFactors:signal.factors);
  const ranked=factors.map(factor=>({factor,score:priorityWeight(factor,input.natal.cusps,input.knownBirthTime)}))
                      .filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.factor.id.localeCompare(b.factor.id));
  if(!ranked.length)continue;
  const support=factors.filter(supportive).reduce((v,e)=>v+priorityWeight(e,input.natal.cusps,input.knownBirthTime),0);
  const challenge=factors.filter(difficult).reduce((v,e)=>v+priorityWeight(e,input.natal.cusps,input.knownBirthTime),0);
  const mixed=support>=.45&&challenge>=.45&&Math.min(support,challenge)/Math.max(support,challenge)>=.36;
  const limitation:RankedPriority['limitation']=!input.complete?'missing-ephemeris':!input.knownBirthTime?'unknown-time':null;
  rows.push({signal,factor:ranked[0].factor,salience:ranked[0].score,
   status:mixed?'mixed':limitation?'limited':'supported',
   limitation,supporting:support,challenging:challenge});
 }
 return rows.sort((a,b)=>b.salience-a.salience||a.factor.orb-b.factor.orb||a.signal.category.localeCompare(b.signal.category));
}
/** Repeated strongest contacts and identical advice should not become separate headlines.
 * All unselected evidence remains accessible in technical and professional views.
 */
export function distinctPriority<T extends RankedPriority>(
 rows:readonly T[],limit:number,copy:(signal:Signal)=>{title:string;action:string}
):T[]{
 const result:T[]=[],seenContacts=new Set<string>(),seenProse=new Set<string>();
 const norm=(s:string)=>s.normalize('NFKC').toLocaleLowerCase().replace(/[\s\p{P}\p{S}]+/gu,'');
 for(const row of rows){
  const key=row.factor.transit.id+':'+row.factor.angle+':'+row.factor.natal.id;
  const prose=copy(row.signal),title=norm(prose.title),action=norm(prose.action);
  if(seenContacts.has(key)||seenProse.has(title)||seenProse.has(action))continue;
  result.push(row);seenContacts.add(key);seenProse.add(title);seenProse.add(action);
  if(result.length>=limit)break;
 }
 return result;
}
export function conciseInterpretation(input:string,maxSentences=4):{brief:string;full:string;condensed:boolean}{
 const full=input.replace(/\*\*/g,'').replace(/\s+/g,' ').trim();
 if(!full)return {brief:'',full:'',condensed:false};
 // Keep the first distinct complete sentences. Avoid chopping through a stated aspect or timestamp.
 const sentences=full.split(/(?<=[.!؟])\s+/u).map(s=>s.trim()).filter(Boolean);
 const unique:string[]=[];const seen=new Set<string>();
 for(const sentence of sentences){
  const key=sentence.toLocaleLowerCase().replace(/[\s\p{P}\p{S}]+/gu,'');
  if(!key||seen.has(key))continue;
  seen.add(key);unique.push(sentence);
  if(unique.length>=maxSentences)break;
 }
 return {brief:unique.join(' '),full,condensed:unique.join(' ').length<full.length};
}
