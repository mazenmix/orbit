import type {WholeSkyOccurrence} from './wholeSkyBroadcast.ts';
/** Event identity, never editorial text, controls duplicate narration.
 * The exact same astronomical event can be worded differently across
 * Today, Now, English and Iraqi Arabic without becoming two claims.
 * Separate recurrences of the same aspect remain independent events. */
export function sameSkyOccurrence(first:WholeSkyOccurrence,other:WholeSkyOccurrence|null|undefined):boolean{
 if(!other||first.kind!==other.kind||first.first!==other.first)return false;
 if(!Number.isFinite(+first.at)||!Number.isFinite(+other.at)||Math.abs(+first.at-+other.at)>60000)return false;
 if(first.kind==='aspect')return first.second===other.second&&first.angle===other.angle;
 if(first.kind==='ingress')return first.sign===other.sign&&first.retrograde===other.retrograde;
 return first.retrograde===other.retrograde;
}
/** Moon windows must be detected by calculated body ID, not a translated
 * headline that may use a nickname, a full moon label or reordered nouns. */
export function isLunarOccurrence(event:Pick<WholeSkyOccurrence,'first'|'second'>):boolean{
 return event.first==='Moon'||event.second==='Moon';
}
