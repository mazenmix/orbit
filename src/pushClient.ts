import type {EyeSettings} from './eye.ts';
const key='mx.astro.push.device.v1',consentKey='mx.astro.push.optin.v1',refreshKey='mx.astro.push.refreshed.v1';
type Credentials={deviceId:string;secret:string};
export type PushStatus={configured:boolean;schedulerEnabled:boolean;vapidPublicKey:string|null;requiresInstalledPWAOnIOS:boolean};
export type MoonPushEvent={kind:'voc'|'ingress';at:string};
const b64=(value:Uint8Array)=>btoa(String.fromCharCode(...value)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const from64=(s:string)=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
function device():Credentials{
 try{const saved=JSON.parse(localStorage.getItem(key)??'null');if(saved&&/^[A-Za-z0-9_-]{22}$/.test(saved.deviceId)&&/^[A-Za-z0-9_-]{43}$/.test(saved.secret))return saved}catch{}
 const value={deviceId:b64(crypto.getRandomValues(new Uint8Array(16))),secret:b64(crypto.getRandomValues(new Uint8Array(32)))};
 localStorage.setItem(key,JSON.stringify(value));return value;
}
const send=async(body:unknown)=>{
 const res=await fetch('/api/push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(24000)});
 const data=await res.json();if(!res.ok)throw Error(data.error??'Background push service failed');return data;
};
export async function getPushStatus():Promise<PushStatus>{
 const res=await fetch('/api/push',{cache:'no-store',signal:AbortSignal.timeout(10000)});
 if(!res.ok)throw Error('Could not inspect Push service');
 return res.json();
}
export function pushAvailableOnThisDevice(){
 return typeof window!=='undefined'&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
}
export async function subscribeBackgroundPush(settings:EyeSettings,zone:string,events:MoonPushEvent[]){
 if(!pushAvailableOnThisDevice())throw Error('Web Push is not available here; install this site as a Home Screen app on iPhone');
 const permission=Notification.permission==='granted'?'granted':await Notification.requestPermission();
 if(permission!=='granted')throw Error('Notification permission was not granted');
 const status=await getPushStatus();
 if(!status.configured||!status.vapidPublicKey)throw Error('Cloudflare D1 and VAPID are not configured on this website yet');
 const registration=await navigator.serviceWorker.ready;
 let subscription=await registration.pushManager.getSubscription();
 if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:Uint8Array.from(from64(status.vapidPublicKey)).buffer});
 const browser=subscription.toJSON();
 if(!browser.keys?.p256dh||!browser.keys?.auth)throw Error('Browser did not provide push encryption keys');
 const result=await send({action:'subscribe',...device(),subscription:browser,zone,moon:settings.moon,hourly:settings.hourly,daily:settings.daily,events});
 localStorage.setItem(consentKey,'true');localStorage.setItem(refreshKey,String(Date.now()));
 return {...result,schedulerEnabled:status.schedulerEnabled};
}
export const backgroundPushOptedIn=()=>localStorage.getItem(consentKey)==='true';
export async function unsubscribeBackgroundPush(){
 const saved=localStorage.getItem(key),value=saved?JSON.parse(saved):null;
 let remoteFailure='';
 if(value){try{await send({action:'unsubscribe',...value})}catch(e){remoteFailure=String(e)}}
 if(pushAvailableOnThisDevice()){
  const reg=await navigator.serviceWorker.getRegistration();
  const sub=await reg?.pushManager.getSubscription();
  if(sub)await sub.unsubscribe();
 }
 localStorage.removeItem(consentKey);localStorage.removeItem(refreshKey);
 if(!remoteFailure)localStorage.removeItem(key);
 return {enabled:false,remotelyRemoved:!remoteFailure,warning:remoteFailure};
}
export async function refreshBackgroundPushIfNeeded(settings:EyeSettings,zone:string,events:MoonPushEvent[],maxAgeHours=20){
 if(!backgroundPushOptedIn()||!pushAvailableOnThisDevice()||Notification.permission!=='granted'||!settings.enabled)return {refreshed:false};
 const last=Number(localStorage.getItem(refreshKey)??0);
 if(Number.isFinite(last)&&Date.now()-last<maxAgeHours*3600000)return {refreshed:false};
 await subscribeBackgroundPush(settings,zone,events);
 return {refreshed:true};
}
export async function sendBackgroundPushTest(){
 return send({action:'test',...device()});
}
