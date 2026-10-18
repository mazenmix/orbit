import test from 'node:test';
import assert from 'node:assert/strict';
import {calendarEvent} from '../src/calendar.ts';
test('lunar event uses UTC dates, VALARM and CRLF',()=>{
 const ics=calendarEvent({id:'moon-voc-2026',start:new Date('2026-10-18T10:00:00Z'),end:new Date('2026-10-18T11:00:00Z'),title:'Moon VOC',description:'Astrological convention'},15);
 assert.match(ics,/DTSTART:20261018T100000Z/);
 assert.match(ics,/DTEND:20261018T110000Z/);
 assert.match(ics,/TRIGGER:-PT15M/);
 assert.ok(ics.endsWith('\r\n'));
});
test('calendar controls reject invalid windows and dangerous reminders',()=>{
 const start=new Date('2026-10-18T10:00:00Z');
 assert.throws(()=>calendarEvent({start,end:start,id:'bad',title:'',description:''}));
 assert.throws(()=>calendarEvent({start,end:new Date(+start+60000),id:'x',title:'',description:''},-1));
});
test('calendar text escapes new lines and delimiters',()=>{
 const start=new Date('2026-10-18T10:00:00Z');
 const s=calendarEvent({start,end:new Date(+start+60000),id:'foo@bar',title:'Comma,Test',description:'New\nline;go'});
 assert.match(s,/SUMMARY:Comma\\,Test/);
 assert.match(s,/DESCRIPTION:New\\nline\\;go/);
 assert.match(s,/UID:foobar@mxastro.pages.dev/);
});
