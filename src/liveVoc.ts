/** Millisecond-precise state transitions from the computed Moon ephemeris. */
export type VocPhase='upcoming'|'active'|'elapsed';
export function vocPhase(start:number,end:number,now:number):VocPhase{
 if(!Number.isFinite(start)||!Number.isFinite(end)||!Number.isFinite(now)||end<=start)return 'elapsed';
 return now<start?'upcoming':now<end?'active':'elapsed';
}
/** Shared red/green visual status for Today and Moon countdowns. */
export function vocColorState(start:number,end:number,now:number):'is-voc'|'is-clear'{
 return vocPhase(start,end,now)==='active'?'is-voc':'is-clear';
}
export function vocRemaining(start:number,end:number,now:number):number{
 const phase=vocPhase(start,end,now);
 return phase==='elapsed'?0:Math.max(0,Math.ceil(((phase==='active'?end:start)-now)/1000));
}

/** Time remaining as percentage of a valid calculated interval. */
export function remainingPercent(start:number,end:number,now:number):number{
 if(!Number.isFinite(start)||!Number.isFinite(end)||!Number.isFinite(now)||end<=start)return 0;
 return Math.max(0,Math.min(100,100*(end-now)/(end-start)));
}

/** Percentage of the calculated interval that has elapsed, strictly increasing.
 * This is separate from seconds remaining shown alongside the gauge.
 */
export function elapsedPercent(start:number,end:number,now:number):number{
 if(!Number.isFinite(start)||!Number.isFinite(end)||!Number.isFinite(now)||end<=start)return 0;
 return Math.max(0,Math.min(100,100*(now-start)/(end-start)));
}
