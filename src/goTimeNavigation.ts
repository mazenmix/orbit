import {Temporal} from '@js-temporal/polyfill';

/** Navigate the exact selected instant without silently using the computer's local zone.
 * A day preserves wall-clock time across IANA daylight-saving changes,
 * while an hour is a true elapsed 60-minute step.
 */
export type GoTimeStep='-day'|'+day'|'-hour'|'+hour';
export function shiftGoTime(at:Date,zone:string,step:GoTimeStep):Date{
 if(!Number.isFinite(+at))throw Error('Invalid selected time');
 const zoned=Temporal.Instant.fromEpochMilliseconds(+at).toZonedDateTimeISO(zone);
 const delta=step==='-day'?{days:-1}:step==='+day'?{days:1}:step==='-hour'?{hours:-1}:{hours:1};
 return new Date(zoned.add(delta).epochMilliseconds);
}
