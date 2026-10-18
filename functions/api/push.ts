import {validatePushSubscription,sendWebPush,type PublicSubscription} from '../../src/webPushCrypto.ts';
type DBStatement={bind:(...args:any[])=>DBStatement;first:<T>()=>Promise<T|null>;run:()=>Promise<{meta:{changes:number}}>};
type D1={exec:(sql:string)=>Promise<unknown>;prepare:(sql:string)=>DBStatement};
type Env={MX_SYNC_DB?:D1;MX_VAPID_PUBLIC_KEY?:string;MX_VAPID_PRIVATE_JWK?:string;MX_PUSH_READY?:string};
type Row={device_id:string;verifier:string;subscription:string;updated_at:string};
const noCache=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
const allowedDevice=(s:any)=>typeof s==='string'&&/^[A-Za-z0-9_-]{22}$/.test(s);
const allowedSecret=(s:any)=>typeof s==='string'&&/^[A-Za-z0-9_-]{43}$/.test(s);
const equal=(a:string,b:string)=>{if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0};
const digest=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const schema='CREATE TABLE IF NOT EXISTS mx_push_v1(device_id TEXT PRIMARY KEY,verifier TEXT NOT NULL,subscription TEXT NOT NULL,zone TEXT NOT NULL,moon INTEGER NOT NULL,hourly INTEGER NOT NULL,daily INTEGER NOT NULL,events TEXT NOT NULL,updated_at TEXT NOT NULL);CREATE TABLE IF NOT EXISTS mx_push_sent_v1(device_id TEXT NOT NULL,event_id TEXT NOT NULL,delivered_at TEXT NOT NULL,PRIMARY KEY(device_id,event_id))';
const validateEvents=(v:any)=>{
 if(!Array.isArray(v)||v.length>90)throw Error('Invalid Moon event list');
 const now=Date.now();
 return v.map((e:any)=>{
  if(!e||!['voc','ingress'].includes(e.kind)||typeof e.at!=='string'||!Number.isFinite(Date.parse(e.at))||new Date(e.at).toISOString()!==e.at||+new Date(e.at)<now-3600000||+new Date(e.at)>now+95*86400000)throw Error('Invalid Moon event');
  return {kind:e.kind,at:e.at};
 });
};
export function pushSchema(){return schema}
export const onRequestGet=({env}:{env:Env})=>noCache({configured:!!(env.MX_SYNC_DB&&env.MX_VAPID_PUBLIC_KEY),schedulerEnabled:env.MX_PUSH_READY==='true',vapidPublicKey:env.MX_SYNC_DB?env.MX_VAPID_PUBLIC_KEY??null:null,requiresInstalledPWAOnIOS:true});
export async function onRequestPost({request,env}:{request:Request;env:Env}){
 const url=new URL(request.url);
 if(request.headers.get('origin')!==url.origin)return noCache({error:'Same origin required'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return noCache({error:'JSON required'},415);
 if(!env.MX_SYNC_DB||!env.MX_VAPID_PUBLIC_KEY)return noCache({error:'Cloudflare D1 and VAPID public key are not configured',code:'PUSH_NOT_CONFIGURED'},503);
 let input:any;try{const text=await request.text();if(text.length>40000)return noCache({error:'Request too large'},413);input=JSON.parse(text)}catch{return noCache({error:'Invalid request JSON'},400)}
 if(!input||!['subscribe','unsubscribe','test'].includes(input.action)||!allowedDevice(input.deviceId)||!allowedSecret(input.secret))return noCache({error:'Invalid device credentials'},400);
 const db=env.MX_SYNC_DB;
 try{
  await db.exec(schema);
  const verifier=await digest(input.secret),row=await db.prepare('SELECT device_id,verifier,subscription,updated_at FROM mx_push_v1 WHERE device_id=?').bind(input.deviceId).first<Row>();
  if(row&&!equal(row.verifier,verifier))return noCache({error:'Device access denied'},403);
  if(input.action==='unsubscribe'){
   if(row)await db.prepare('DELETE FROM mx_push_v1 WHERE device_id=? AND verifier=?').bind(input.deviceId,verifier).run();
   return noCache({enabled:false});
  }
  if(input.action==='test'){
   if(!row)return noCache({error:'Subscribe before testing'},404);
   if(!env.MX_VAPID_PRIVATE_JWK)return noCache({error:'Sender private key not provisioned',code:'PUSH_SENDER_NOT_CONFIGURED'},503);
   if(Date.now()-Date.parse(row.updated_at)<30000)return noCache({error:'Wait 30 seconds before a test'},429);
   const result=await sendWebPush(JSON.parse(row.subscription),{id:'test-'+Date.now(),body:'MX Eye background push test · اختبار إشعار بالخلفية',page:'#today'},env.MX_VAPID_PUBLIC_KEY,env.MX_VAPID_PRIVATE_JWK);
   if(!result.ok)return noCache({error:'Push provider rejected notification',status:result.status},502);
   return noCache({sent:true,providerStatus:result.status});
  }
  let sub:PublicSubscription;
  try{sub=validatePushSubscription(input.subscription)}catch{return noCache({error:'Invalid browser PushSubscription'},400)}
  if(typeof input.zone!=='string'||input.zone.length>85)return noCache({error:'Invalid time zone'},400);
  try{new Intl.DateTimeFormat('en-GB',{timeZone:input.zone})}catch{return noCache({error:'Unknown IANA time zone'},400)}
  let events:{kind:string;at:string}[];
  try{events=validateEvents(input.events)}catch{return noCache({error:'Invalid Moon event schedule'},400)}
  const moon=input.moon===true?1:0,hourly=input.hourly===true?1:0,daily=input.daily===true?1:0,at=new Date().toISOString();
  const payload=JSON.stringify(sub);
  if(row)await db.prepare('UPDATE mx_push_v1 SET subscription=?,zone=?,moon=?,hourly=?,daily=?,events=?,updated_at=? WHERE device_id=? AND verifier=?')
   .bind(payload,input.zone,moon,hourly,daily,JSON.stringify(events),at,input.deviceId,verifier).run();
  else await db.prepare('INSERT INTO mx_push_v1(device_id,verifier,subscription,zone,moon,hourly,daily,events,updated_at) VALUES(?,?,?,?,?,?,?,?,?)')
   .bind(input.deviceId,verifier,payload,input.zone,moon,hourly,daily,JSON.stringify(events),at).run();
  return noCache({enabled:true,subscribedAt:at,schedulerEnabled:env.MX_PUSH_READY==='true'});
 }catch{return noCache({error:'Push database or endpoint unavailable',code:'PUSH_STORAGE_ERROR'},503)}
}
