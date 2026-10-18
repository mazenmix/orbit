/** RFC 5545 iCalendar events for platform calendar reminders.
 * No account, subscription, Web Push or background execution is implied.
 */
const stamp=(date:Date)=>date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
const safe=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const fold=(line:string)=>line.match(/.{1,70}/gu)?.join('\r\n ')??line;
export type CalendarEvent={start:Date;end:Date;title:string;description:string;id:string};
export function calendarEvent(event:CalendarEvent,alarmMinutes=15){
 if(!Number.isFinite(+event.start)||!Number.isFinite(+event.end)||+event.start>=+event.end)throw Error('Invalid calendar range');
 if(!Number.isSafeInteger(alarmMinutes)||alarmMinutes<0||alarmMinutes>1440)throw Error('Invalid reminder');
 const escapedId=event.id.replace(/[^A-Za-z0-9._-]/g,'').slice(0,90);
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MazenmiX//MX Orbit//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
  'UID:'+escapedId+'@mxastro.pages.dev','DTSTAMP:'+stamp(new Date()),'DTSTART:'+stamp(event.start),'DTEND:'+stamp(event.end),
  'SUMMARY:'+safe(event.title),'DESCRIPTION:'+safe(event.description),'BEGIN:VALARM','ACTION:DISPLAY',
  'DESCRIPTION:'+safe(event.title),'TRIGGER:-PT'+alarmMinutes+'M','END:VALARM','END:VEVENT','END:VCALENDAR'];
 return lines.map(fold).join('\r\n')+'\r\n';
}
export function calendarDownload(value:string,name:string){
 const url=URL.createObjectURL(new Blob([value],{type:'text/calendar;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
