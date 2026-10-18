/** RFC 8291 encrypted Web Push payload and VAPID authentication for Workers.
 * Runtime depends only on standard Web Crypto, no Node or third-party package.
 */
const encode=new TextEncoder(),dec=(s:string)=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),x=>x.charCodeAt(0));
const concat=(...arrays:Uint8Array[])=>{const out=new Uint8Array(arrays.reduce((n,a)=>n+a.length,0));let p=0;for(const a of arrays){out.set(a,p);p+=a.length}return out};
const b64=(a:Uint8Array)=>{let value='';for(let i=0;i<a.length;i+=8192)value+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(value).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const salt=()=>crypto.getRandomValues(new Uint8Array(16));
const hkdf=async(secret:Uint8Array,saltBytes:Uint8Array,info:Uint8Array,size:number)=>{
 const key=await crypto.subtle.importKey('raw',Uint8Array.from(secret),'HKDF',false,['deriveBits']);
 return new Uint8Array(await crypto.subtle.deriveBits({name:'HKDF',hash:'SHA-256',salt:Uint8Array.from(saltBytes).buffer,info:Uint8Array.from(info).buffer},key,size*8));
};
export type PublicSubscription={endpoint:string;keys:{p256dh:string;auth:string}};
export function permittedPushEndpoint(value:string){
 try{const url=new URL(value);
  return url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&(
   url.hostname==='fcm.googleapis.com'||url.hostname==='updates.push.services.mozilla.com'||
   url.hostname==='web.push.apple.com'||url.hostname.endsWith('.push.apple.com')||
   url.hostname.endsWith('.notify.windows.com'))}
 catch{return false}
}
export function validatePushSubscription(value:any):PublicSubscription{
 if(!value||typeof value.endpoint!=='string'||value.endpoint.length>1600||!permittedPushEndpoint(value.endpoint)||!value.keys||typeof value.keys.p256dh!=='string'||typeof value.keys.auth!=='string')throw Error('Unrecognized push endpoint');
 const publicKey=dec(value.keys.p256dh),authentication=dec(value.keys.auth);
 if(publicKey.length!==65||publicKey[0]!==4||authentication.length!==16)throw Error('Invalid browser push encryption keys');
 return {endpoint:value.endpoint,keys:{p256dh:value.keys.p256dh,auth:value.keys.auth}};
}
export async function encryptWebPush(message:unknown,subscription:PublicSubscription){
 const receiver=dec(subscription.keys.p256dh),auth=dec(subscription.keys.auth);
 const privatePair=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
 const sender=new Uint8Array(await crypto.subtle.exportKey('raw',privatePair.publicKey));
 const pub=await crypto.subtle.importKey('raw',Uint8Array.from(receiver),{name:'ECDH',namedCurve:'P-256'},false,[]);
 const shared=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:pub},privatePair.privateKey,256));
 const info=concat(encode.encode('WebPush: info\0'),receiver,sender);
 const ikm=await hkdf(shared,auth,info,32),random=salt();
 const cek=await hkdf(ikm,random,encode.encode('Content-Encoding: aes128gcm\0'),16);
 const iv=await hkdf(ikm,random,encode.encode('Content-Encoding: nonce\0'),12);
 const key=await crypto.subtle.importKey('raw',Uint8Array.from(cek),'AES-GCM',false,['encrypt']);
 const clear=concat(encode.encode(JSON.stringify(message)),new Uint8Array([2]));
 if(clear.length>3000)throw Error('Web Push message too large');
 const encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:Uint8Array.from(iv).buffer},key,clear));
 // salt 16 | record size 4 | key id length 1 | ECDH sender key 65 | cipher bytes
 return concat(random,new Uint8Array([0,0,16,0,65]),sender,encrypted);
}
export async function vapidAuthorization(endpoint:string,publicKey:string,privateJwk:string,subject='https://mxastro.pages.dev/'){
 if(!permittedPushEndpoint(endpoint))throw Error('Untrusted push service domain');
 const jwk=JSON.parse(privateJwk) as JsonWebKey;
 if(jwk.kty!=='EC'||jwk.crv!=='P-256'||!jwk.d||!jwk.x||!jwk.y)throw Error('Invalid VAPID private key');
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 const hdr=b64(encode.encode(JSON.stringify({typ:'JWT',alg:'ES256'})));
 const aud=new URL(endpoint).origin;
 const payload=b64(encode.encode(JSON.stringify({aud,exp:Math.floor(Date.now()/1000)+3600,sub:subject})));
 const data=hdr+'.'+payload;
 const signature=new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,encode.encode(data)));
 if(signature.length!==64)throw Error('VAPID ES256 signature must be raw 64 bytes');
 return 'vapid t='+data+'.'+b64(signature)+', k='+publicKey;
}
export async function sendWebPush(subscription:PublicSubscription,message:unknown,publicKey:string,privateJwk:string){
 const s=validatePushSubscription(subscription);
 const body=await encryptWebPush(message,s),auth=await vapidAuthorization(s.endpoint,publicKey,privateJwk);
 const res=await fetch(s.endpoint,{method:'POST',headers:{Authorization:auth,'Content-Encoding':'aes128gcm','Content-Type':'application/octet-stream',TTL:'3600',Urgency:'normal'},body:Uint8Array.from(body).buffer,signal:AbortSignal.timeout(15000)});
 return {ok:res.status>=200&&res.status<300,expired:[404,410].includes(res.status),status:res.status};
}
