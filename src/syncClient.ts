import {encryptBackup,decryptBackup,type EncryptedBackup} from './secureBackup.ts';
export type SyncCredentials={v:1;slot:string;secret:string};
export class SyncError extends Error{constructor(public code:string,message:string){super(message)}}
const random=(n:number)=>{const bytes=crypto.getRandomValues(new Uint8Array(n));return Array.from(bytes,x=>String.fromCharCode(x)).join('')};
const b64url=(s:string)=>btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
export const createSyncCode=():string=>b64url(JSON.stringify({v:1,slot:b64url(random(16)),secret:b64url(random(32))} satisfies SyncCredentials));
export function parseSyncCode(value:string):SyncCredentials{
 if(typeof value!=='string'||value.length<140||value.length>350||!/^[\w-]+$/.test(value))throw new SyncError('INVALID_CODE','Invalid sync connection code');
 try{
  const decoded=JSON.parse(atob(value.replace(/-/g,'+').replace(/_/g,'/'))) as SyncCredentials;
  if(decoded.v!==1||!/^[\w-]{22}$/.test(decoded.slot)||!/^[\w-]{43}$/.test(decoded.secret))throw Error();
  return decoded;
 }catch{throw new SyncError('INVALID_CODE','Invalid sync connection code')}
}
const server=async(action:'pull'|'push',code:string,revision?:number,encrypted?:EncryptedBackup)=>{
 const {slot,secret}=parseSyncCode(code);
 let response:Response;
 try{response=await fetch('/api/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,slot,secret,revision,encrypted}),cache:'no-store',signal:AbortSignal.timeout(25000)})}
 catch{throw new SyncError('NETWORK','Could not reach secure sync service')}
 const data=await response.json() as any;
 if(!response.ok)throw new SyncError(String(data.code??'SYNC_FAILED'),String(data.error??'Secure sync failed'));
 return data;
};
export async function uploadEncrypted(code:string,password:string,revision:number,payload:unknown){
 if(!Number.isInteger(revision)||revision<0)throw new Error('Pull current remote version before updating');
 const encrypted=await encryptBackup(payload,password);
 return server('push',code,revision,encrypted) as Promise<{revision:number;updatedAt:string}>;
}
export async function downloadEncrypted(code:string,password:string){
 const packet=await server('pull',code) as {revision:number;encrypted:EncryptedBackup;updatedAt:string};
 return {revision:packet.revision,updatedAt:packet.updatedAt,payload:await decryptBackup(packet.encrypted,password)};
}
export async function syncStatus(){
 try{const response=await fetch('/api/sync',{cache:'no-store',signal:AbortSignal.timeout(8000)});return (await response.json()) as {configured:boolean;storage:string;encryption:string}}
 catch{return {configured:false,storage:'offline',encryption:'client-side AES-256-GCM'}}
}
