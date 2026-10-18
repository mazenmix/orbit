import {dueBackgroundPush,type PushSettings} from '../src/pushSchedule.ts';
import {sendWebPush,validatePushSubscription} from '../src/webPushCrypto.ts';
type Stmt={bind:(...args:any[])=>Stmt;all:<T>()=>Promise<{results:T[]}>;run:()=>Promise<{meta:{changes:number}}>};
type D1={prepare:(sql:string)=>Stmt;exec:(sql:string)=>Promise<any>};
type Env={MX_SYNC_DB:D1;MX_VAPID_PUBLIC_KEY:string;MX_VAPID_PRIVATE_JWK:string};
type Device={device_id:string;subscription:string;zone:string;moon:number;daily:number;hourly:number;events:string};
export async function sendDueBackgroundNotifications(env:Env,now=new Date()){
 if(!env.MX_SYNC_DB||!env.MX_VAPID_PRIVATE_JWK||!env.MX_VAPID_PUBLIC_KEY)throw Error('Missing D1 or VAPID sender secrets');
 const db=env.MX_SYNC_DB;
 await db.prepare("DELETE FROM mx_push_sent_v1 WHERE delivered_at < ?").bind(new Date(+now-35*86400000).toISOString()).run();
 const {results:devices}=await db.prepare('SELECT device_id,subscription,zone,moon,daily,hourly,events FROM mx_push_v1 LIMIT 500').bind().all<Device>();
 let sent=0,failed=0,duplicates=0,removed=0;
 for(const device of devices){
  let options:PushSettings;
  try{options={zone:device.zone,moon:device.moon===1,daily:device.daily===1,hourly:device.hourly===1,events:JSON.parse(device.events)}}catch{failed++;continue}
  let due:ReturnType<typeof dueBackgroundPush>;
  try{due=dueBackgroundPush(options,now)}catch{failed++;continue}
  if(!due.length)continue;
  let subscription;try{subscription=validatePushSubscription(JSON.parse(device.subscription))}catch{failed++;continue}
  for(const note of due.slice(0,3)){
   const claimed=await db.prepare('INSERT OR IGNORE INTO mx_push_sent_v1(device_id,event_id,delivered_at) VALUES(?,?,?)').bind(device.device_id,note.id,now.toISOString()).run();
   if(claimed.meta.changes!==1){duplicates++;continue}
   try{
    const result=await sendWebPush(subscription,note,env.MX_VAPID_PUBLIC_KEY,env.MX_VAPID_PRIVATE_JWK);
    if(result.expired){await db.prepare('DELETE FROM mx_push_v1 WHERE device_id=?').bind(device.device_id).run();removed++;continue}
    if(!result.ok)throw Error('Push provider rejected delivery status '+result.status);
    sent++;
   }catch{
    failed++;
    // Attempt delivery at the next cron tick; unique key prevents duplicate confirmed successes.
    await db.prepare('DELETE FROM mx_push_sent_v1 WHERE device_id=? AND event_id=?').bind(device.device_id,note.id).run();
   }
  }
 }
 return {sent,failed,duplicates,removed,checked:devices.length};
}
export default {
 async scheduled(_event:ScheduledEvent,env:Env,ctx:ExecutionContext){ctx.waitUntil(sendDueBackgroundNotifications(env))}
};
type ScheduledEvent={scheduledTime:number};
type ExecutionContext={waitUntil:(work:Promise<unknown>)=>void};
