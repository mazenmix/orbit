/** Remote sync is strictly opt-in: only ciphertext and a SHA-256 hash of a
 * 256-bit random capability are ever stored in the Cloudflare D1 database.
 * A binding named MX_SYNC_DB is mandatory; never silently fall back to public storage.
 */
type Row={slot:string;verifier:string;revision:number;payload:string;updated_at:string};
type Statement={bind:(...a:any[])=>Statement;first:<T=Row>()=>Promise<T|null>;run:()=>Promise<{meta:{changes:number}}>};
type D1Database={exec:(sql:string)=>Promise<unknown>;prepare:(sql:string)=>Statement};
type Env={MX_SYNC_DB?:D1Database};
const send=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
const isSlot=(v:unknown)=>typeof v==='string'&&/^[A-Za-z0-9_-]{22}$/.test(v);
const isSecret=(v:unknown)=>typeof v==='string'&&/^[A-Za-z0-9_-]{43}$/.test(v);
const encrypted=(v:any)=>v&&v.format==='mx-orbit-encrypted-v1'&&v.kdf==='PBKDF2-SHA256'&&v.iterations===310000&&typeof v.salt==='string'&&v.salt.length===24&&typeof v.iv==='string'&&v.iv.length===16&&typeof v.ciphertext==='string'&&v.ciphertext.length>=24&&v.ciphertext.length<=1400000&&/^[A-Za-z0-9+/]+=*$/.test(v.ciphertext);
const equal=(a:string,b:string)=>{if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0};
const hash=async(text:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const table="CREATE TABLE IF NOT EXISTS mx_sync_v1 (slot TEXT PRIMARY KEY, verifier TEXT NOT NULL, revision INTEGER NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL)";
export const onRequestGet=({env}:{env:Env})=>send({configured:!!env.MX_SYNC_DB,storage:env.MX_SYNC_DB?'cloudflare-d1':'not-connected',encryption:'client-side AES-256-GCM'});
export async function onRequestPost({request,env}:{request:Request;env:Env}){
 const url=new URL(request.url);
 if(request.headers.get('origin')!==url.origin)return send({error:'Same origin only'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return send({error:'JSON body required'},415);
 if(!env.MX_SYNC_DB)return send({error:'Sync storage not configured. Bind Cloudflare D1 as MX_SYNC_DB.',code:'SYNC_NOT_CONFIGURED'},503);
 let value:any;
 try{
  if(Number(request.headers.get('content-length')??0)>1600000)return send({error:'Payload too large'},413);
  const raw=await request.text();if(raw.length>1600000)return send({error:'Payload too large'},413);
  value=JSON.parse(raw);
 }catch{return send({error:'Invalid JSON'},400)}
 if(!value||!['pull','push'].includes(value.action)||!isSlot(value.slot)||!isSecret(value.secret))return send({error:'Invalid sync credentials'},400);
 if(value.action==='push'&&(!Number.isInteger(value.revision)||value.revision<0||value.revision>100000000||!encrypted(value.encrypted)))return send({error:'An encrypted backup and revision are required'},400);
 const db=env.MX_SYNC_DB;
 try{
  await db.exec(table);
  const verifier=await hash(value.secret),existing=await db.prepare('SELECT slot,verifier,revision,payload,updated_at FROM mx_sync_v1 WHERE slot=?').bind(value.slot).first<Row>();
  if(value.action==='pull'){
   if(!existing)return send({error:'No synced encrypted backup at this address',code:'SYNC_EMPTY'},404);
   if(!equal(existing.verifier,verifier))return send({error:'Access denied',code:'SYNC_DENIED'},403);
   return send({revision:existing.revision,encrypted:JSON.parse(existing.payload),updatedAt:existing.updated_at});
  }
  const now=new Date().toISOString(),payload=JSON.stringify(value.encrypted);
  if(!existing){
   if(value.revision!==0)return send({error:'Missing remote version',code:'SYNC_CONFLICT'},409);
   const result=await db.prepare('INSERT OR IGNORE INTO mx_sync_v1(slot,verifier,revision,payload,updated_at) VALUES(?,?,1,?,?)').bind(value.slot,verifier,payload,now).run();
   if(result.meta.changes!==1)return send({error:'Sync conflict; pull first',code:'SYNC_CONFLICT'},409);
   return send({revision:1,updatedAt:now});
  }
  if(!equal(existing.verifier,verifier))return send({error:'Access denied',code:'SYNC_DENIED'},403);
  if(existing.revision!==value.revision)return send({error:'Another device changed this backup; pull and merge first',code:'SYNC_CONFLICT',remoteRevision:existing.revision},409);
  const result=await db.prepare('UPDATE mx_sync_v1 SET revision=revision+1,payload=?,updated_at=? WHERE slot=? AND revision=? AND verifier=?').bind(payload,now,value.slot,value.revision,verifier).run();
  if(result.meta.changes!==1)return send({error:'Simultaneous sync conflict; pull before retrying',code:'SYNC_CONFLICT'},409);
  return send({revision:value.revision+1,updatedAt:now});
 }catch{return send({error:'Secure sync database is unavailable',code:'SYNC_STORAGE_ERROR'},503)}
}
