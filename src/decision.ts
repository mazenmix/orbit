import {rankedFactors,supportive,difficult,type Evidence,type Signal} from './math.ts';
export type DecisionTone='supportive'|'challenging'|'mixed'|'unclear'|'insufficient';
export type DecisionReview={tone:DecisionTone;positive:number;negative:number;neutral:number;topSupport:Evidence|null;topChallenge:Evidence|null;dominance:number;contradictory:boolean;sourceCount:number;sensitive:boolean};
/** Keep contrary astrological evidence explicit; never turn symbolic indices
 * into a prediction, certainty, or one-sided instruction.
 */
export function reviewEvidence(factors:readonly Evidence[]):DecisionReview{
 const sorted=rankedFactors(factors);
 const plus=sorted.filter(supportive),minus=sorted.filter(difficult);
 const positive=plus.reduce((sum,e)=>sum+e.weight,0),negative=minus.reduce((sum,e)=>sum+e.weight,0);
 const neutral=sorted.filter(e=>!supportive(e)&&!difficult(e)).length;
 const contradictory=plus.length>0&&minus.length>0;
 const sourceIds=[...new Set(sorted.map(e=>e.transit.id))];
 const net=positive-negative,direction=(v:number)=>Math.abs(v)<1e-10?0:Math.sign(v);
 // Deterministic sensitivity, not statistical confidence: does removing all
 // contacts from one transiting body reverse or erase the aggregate direction?
 const sensitive=direction(net)!==0&&sourceIds.some(id=>{
  const contribution=sorted.filter(e=>e.transit.id===id).reduce((sum,e)=>sum+(supportive(e)?e.weight:0)-(difficult(e)?e.weight:0),0);
  return direction(net-contribution)!==direction(net);
 });
 const tone:DecisionTone=!sorted.length?'insufficient':contradictory?'mixed':positive>0?'supportive':negative>0?'challenging':'unclear';
 return {tone,positive:Number(positive.toFixed(3)),negative:Number(negative.toFixed(3)),neutral,
  topSupport:plus[0]??null,topChallenge:minus[0]??null,dominance:Number(net.toFixed(3)),contradictory,sourceCount:sourceIds.length,sensitive};
}
export function reviewSignal(signal:Pick<Signal,'factors'|'allFactors'>):DecisionReview{return reviewEvidence(signal.allFactors??signal.factors)}
