import type {ConfirmedEclipse} from './realEclipses.ts';

/** Select evidence for the explicitly chosen Time Machine instant, not Date.now().
 * The caller must supply independently calculated eclipses whose global maxima
 * were searched around that instant. Visibility is a separate local calculation.
 */
export function eclipseEvidenceAt(at:Date,events:readonly ConfirmedEclipse[],days=100){
 if(!Number.isFinite(+at)||!Number.isFinite(days)||days<0||days>365)throw Error('Invalid selected eclipse interval');
 const horizon=+at+days*86400000;
 return events
  .filter(e=>Number.isFinite(+e.maximum)&&e.type!=='unknown'&&+e.maximum>=+at&&+e.maximum<=horizon)
  .sort((a,b)=>+a.maximum-+b.maximum)
  .slice(0,2)
  .map(e=>({kind:e.kind,type:e.type,maximum:e.maximum.toISOString()}));
}
