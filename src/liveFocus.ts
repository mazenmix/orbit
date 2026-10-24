import {category,rankedFactors,type Evidence} from './math.ts';
import type {RankedPriority} from './focusPriority.ts';

/**
 * Highlight a genuinely active short-lived personal transit before a slow
 * background aspect. No arbitrary clock-based rotation: the selected contact
 * MUST be in the freshly calculated ephemeris and in its real topic signal.
 */
export function currentFocus(rows:readonly RankedPriority[], evidence:readonly Evidence[]):RankedPriority|undefined{
 const background=rows[0];
 if(!background)return undefined;
 const near=rankedFactors(evidence).filter(e=>{
  if(e.transit.id==='Moon')return e.orb<=Math.min(.70,e.maximumOrb);
  if(['Mercury','Venus','Mars','Sun'].includes(e.transit.id))return e.orb<=Math.min(.18,e.maximumOrb);
  return false;
 }).sort((a,b)=>{
  const moonA=a.transit.id==='Moon',moonB=b.transit.id==='Moon';
  if(moonA!==moonB)return moonA?-1:1;
  return a.orb-b.orb||Number(b.applying)-Number(a.applying)||a.id.localeCompare(b.id);
 });
 for(const factor of near){
  const source=rows.find(row=>row.signal.category===category(factor)&&
   (row.signal.allFactors??row.signal.factors).some(e=>
    e.id===factor.id&&e.transit.id===factor.transit.id&&e.natal.id===factor.natal.id&&e.angle===factor.angle));
  if(source)return {...source,factor};
 }
 return background;
}
