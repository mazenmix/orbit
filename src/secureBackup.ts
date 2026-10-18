/** Password-protected portable backup; data in localStorage remains unencrypted.
 * AES-256-GCM, PBKDF2-SHA256 with random per-export salt and IV.
 */
const iterations=310000;
const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true});
export type EncryptedBackup={format:'mx-orbit-encrypted-v1';kdf:'PBKDF2-SHA256';iterations:number;salt:string;iv:string;ciphertext:string};
function base64(bytes:Uint8Array){let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(text)}
function fromBase64(text:string){if(!/^[A-Za-z0-9+/]*={0,2}$/.test(text)||text.length>3000000)throw Error('Invalid protected backup encoding');return Uint8Array.from(atob(text),x=>x.charCodeAt(0))}
async function derive(passphrase:string,salt:Uint8Array,usage:KeyUsage[]){
 const raw=await crypto.subtle.importKey('raw',encoder.encode(passphrase),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt:Uint8Array.from(salt).buffer,iterations,hash:'SHA-256'},raw,{name:'AES-GCM',length:256},false,usage);
}
function validatePassword(password:string){if(typeof password!=='string'||password.length<12||password.length>256)throw Error('Use a passphrase of 12–256 characters')}
export async function encryptBackup(payload:unknown,password:string):Promise<EncryptedBackup>{
 validatePassword(password);
 const data=encoder.encode(JSON.stringify(payload));
 if(data.length>1000000)throw Error('Backup payload too large');
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const key=await derive(password,salt,['encrypt']);
 const ciphertext=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,data));
 return {format:'mx-orbit-encrypted-v1',kdf:'PBKDF2-SHA256',iterations,salt:base64(salt),iv:base64(iv),ciphertext:base64(ciphertext)};
}
export async function decryptBackup(value:unknown,password:string):Promise<unknown>{
 validatePassword(password);
 const p=value as Partial<EncryptedBackup>|null;
 if(!p||p.format!=='mx-orbit-encrypted-v1'||p.kdf!=='PBKDF2-SHA256'||p.iterations!==iterations||!p.salt||!p.iv||!p.ciphertext)throw Error('Invalid encrypted backup format');
 const salt=fromBase64(p.salt),iv=fromBase64(p.iv),ciphertext=fromBase64(p.ciphertext);
 if(salt.length!==16||iv.length!==12||ciphertext.length<16||ciphertext.length>1000016)throw Error('Invalid encrypted backup data');
 const key=await derive(password,salt,['decrypt']);
 try {return JSON.parse(decoder.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},key,ciphertext)))}
 catch {throw Error('Incorrect password or damaged encrypted backup')}
}
