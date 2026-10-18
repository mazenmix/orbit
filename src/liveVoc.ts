/** Millisecond-precise state transitions from the computed Moon ephemeris. */
export type VocPhase='upcoming'|'active'|'elapsed';
export function vocPhase(start:number,end:number,now:number):VocPhase{
 if(!Number.isFinite(start)||!Number.isFinite(end)||!Number.isFinite(now)||end<=start)return 'elapsed';
 return now<start?'upcoming':now<end?'active':'elapsed';
}
export function vocRemaining(start:number,end:number,now:number):number{
 const phase=vocPhase(start,end,now);
 return phase==='elapsed'?0:Math.max(0,Math.ceil(((phase==='active'?end:start)-now)/1000));
}
