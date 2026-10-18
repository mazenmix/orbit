export type ScheduledMoon={kind:'voc'|'ingress';at:string};
export type PushSettings={zone:string;moon:boolean;hourly:boolean;daily:boolean;events:ScheduledMoon[]};
export type DuePush={id:string;body:string;page:'#today'|'#lunar'};
const parts=(now:Date,zone:string)=>{
 const tokens=new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit',year:'numeric',month:'2-digit',day:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const get=(kind:string)=>tokens.find(t=>t.type===kind)?.value??'';
 return {hour:Number(get('hour')),minute:Number(get('minute')),date:[get('year'),get('month'),get('day')].join('-')};
};
export function dueBackgroundPush(settings:PushSettings,now:Date):DuePush[]{
 if(!Number.isFinite(+now))return [];
 const clock=parts(now,settings.zone),results:DuePush[]=[];
 // Cron dispatch scheduled every quarter-hour, not exact real-time.
 if(settings.hourly&&clock.minute>=0&&clock.minute<15)results.push({id:'hour-'+clock.date+'-'+clock.hour,body:'MX Eye · مراجعة الساعة الجديدة / New hour check-in',page:'#today'});
 if(settings.daily&&clock.hour===8&&clock.minute>=0&&clock.minute<15)results.push({id:'day-'+clock.date,body:'MX Eye · مراجعة يومية الساعة 08:00 / Daily review',page:'#today'});
 if(settings.moon)for(const event of settings.events){
  const at=Date.parse(event.at),gap=at-+now;
  if(!Number.isFinite(at)||gap<0||gap>16*60000||!['voc','ingress'].includes(event.kind))continue;
  results.push({id:'moon-'+event.kind+'-'+event.at,body:event.kind==='voc'?'MX Eye · خلو مسار القمر يبدأ قريباً / Moon VOC begins soon':'MX Eye · انتقال القمر إلى برج جديد قريباً / Next Moon ingress soon',page:'#lunar'});
 }
 return results;
}
