import {supportive,difficult,type Evidence,type Signal} from './math.ts';
export type DecisionTone='supportive'|'challenging'|'mixed'|'unclear'|'insufficient';
export type DecisionReview={tone:DecisionTone;positive:number;negative:number;neutral:number;topSupport:Evidence|null;topChallenge:Evidence|null;dominance:number;contradictory:boolean};
/** Keep contrary astrological evidence explicit; never turn symbolic indices
 * into a prediction, certainty, or one-sided instruction.
 */
export function reviewEvidence(factors:readonly Evidence[]):DecisionReview{
 const sorted=[...factors].filter(f=>Number.isFinite(f.weight)&&f.weight>=0&&f.weight<=1).sort((a,b)=>b.weight-a.weight);
 const plus=sorted.filter(supportive),minus=sorted.filter(difficult);
 const positive=plus.reduce((sum,e)=>sum+e.weight,0),negative=minus.reduce((sum,e)=>sum+e.weight,0);
 const neutral=sorted.filter(e=>!supportive(e)&&!difficult(e)).length;
 const contradictory=plus.length>0&&minus.length>0;
 const tone:DecisionTone=!sorted.length?'insufficient':contradictory?'mixed':positive>0?'supportive':negative>0?'challenging':'unclear';
 return {tone,positive:Number(positive.toFixed(3)),negative:Number(negative.toFixed(3)),neutral,
  topSupport:plus[0]??null,topChallenge:minus[0]??null,dominance:Number((positive-negative).toFixed(3)),contradictory};
}
export function reviewSignal(signal:Pick<Signal,'factors'>):DecisionReview{return reviewEvidence(signal.factors)}
