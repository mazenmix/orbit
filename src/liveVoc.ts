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
/** The upcoming period advances toward the exact start; the active period
 * advances toward ingress. This avoids a motionless zero gauge before VOC. */
export function vocDisplayProgress(enteredAt:number,vocStartsAt:number,ingressAt:number,now:number):{phase:VocPhase;percent:number}{
 if(![enteredAt,vocStartsAt,ingressAt,now].every(Number.isFinite)||
  enteredAt>vocStartsAt||vocStartsAt>=ingressAt)return {phase:'elapsed',percent:0};
 const phase=vocPhase(vocStartsAt,ingressAt,now);
 const percent=phase==='upcoming'?elapsedPercent(enteredAt,vocStartsAt,now):elapsedPercent(vocStartsAt,ingressAt,now);
 return {phase,percent};
}
