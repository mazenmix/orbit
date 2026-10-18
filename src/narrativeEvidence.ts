import {balancedFactors,type Evidence} from './math.ts';

/** A bounded explanation packet must retain both sides of the calculation.
 * A plain top-N cut can hide the strongest challenge below numerous supports. */
export function narrativeEvidence(input:readonly Evidence[],limit=12):Evidence[]{
 if(!Number.isInteger(limit)||limit<2||limit>48)throw Error('Invalid narrative evidence limit');
 return balancedFactors(input,limit);
}
