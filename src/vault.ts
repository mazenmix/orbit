import {encryptBackup,decryptBackup,type EncryptedBackup} from './secureBackup.ts';
import {validateProfile,type Profile} from './engine.ts';
import type {JournalEntry} from './journal.ts';
export const VAULT_KEY='mx.astro.vault.v1';
const PROFILE_KEY='mx.orbit.profiles.v1',JOURNAL_KEY='mx.orbit.journal.v1';
type VaultData={schema:1;profiles:Profile[];journal:JournalEntry[]};
let memory:VaultData|null=null;
let secret:string|null=null,saveQueue=Promise.resolve(),pending=0,lastError='';
export const isVaultConfigured=()=>typeof localStorage!=='undefined'&&localStorage.getItem(VAULT_KEY)!==null;
export const vaultOpened=()=>memory!==null;
export const vaultPending=()=>pending>0;
export const vaultError=()=>lastError;
const validate=(raw:any):VaultData=>{
 if(!raw||raw.schema!==1||!Array.isArray(raw.profiles)||raw.profiles.length<1||raw.profiles.length>100||!raw.profiles.some((x:Profile)=>x.kind==='self')||!Array.isArray(raw.journal)||raw.journal.length>250)throw Error('Invalid vault contents');
 const profiles=raw.profiles.map((p:Profile)=>validateProfile(p));
 const ids=new Set(profiles.map(p=>p.id));
 if(ids.size!==profiles.length)throw Error('Duplicate vault profile IDs');
 const journal=raw.journal.map((e:JournalEntry)=>{
  if(!e||typeof e.id!=='string'||!ids.has(e.personId)||typeof e.note!=='string'||e.note.length>500||!['message','call','meeting','note'].includes(e.kind)||!['positive','neutral','difficult'].includes(e.outcome)||!Number.isFinite(Date.parse(e.at)))throw Error('Invalid vault journal entry');
  return e;
 });
 if(new Set(journal.map(e=>e.id)).size!==journal.length)throw Error('Duplicate vault journal IDs');
 return {schema:1,profiles,journal};
};
function commitEncrypted(value:EncryptedBackup){localStorage.setItem(VAULT_KEY,JSON.stringify(value))}
function clone<T>(value:T):T{return JSON.parse(JSON.stringify(value))}
export function vaultProfiles():Profile[]{if(!memory)throw Error('Vault is locked');return clone(memory.profiles)}
export function vaultJournal():JournalEntry[]{if(!memory)throw Error('Vault is locked');return clone(memory.journal)}
export async function setupVault(passphrase:string,profiles:Profile[],journal:JournalEntry[]){
 if(isVaultConfigured())throw Error('Encrypted vault already exists');
 const data=validate({schema:1,profiles,journal}),encrypted=await encryptBackup(data,passphrase);
 // Write and verify encrypted backup before deleting either plaintext key.
 commitEncrypted(encrypted);
 try{const restored=validate(await decryptBackup(JSON.parse(localStorage.getItem(VAULT_KEY)!),passphrase));
  memory=restored;secret=passphrase;localStorage.removeItem(PROFILE_KEY);localStorage.removeItem(JOURNAL_KEY);
 }catch(e){memory=null;secret=null;throw e}
}
export async function unlockVault(passphrase:string){
 if(!isVaultConfigured())throw Error('No encrypted vault configured');
 const payload=JSON.parse(localStorage.getItem(VAULT_KEY)!);
 const unlocked=validate(await decryptBackup(payload,passphrase));
 memory=unlocked;secret=passphrase;lastError='';
 // Clean up stray legacy plaintext keys left by an interrupted migration.
 localStorage.removeItem(PROFILE_KEY);localStorage.removeItem(JOURNAL_KEY);
 return {profiles:unlocked.profiles.length,journal:unlocked.journal.length};
}
export function replaceVaultProfiles(items:Profile[]){
 if(!memory)throw Error('Vault is locked');
 memory.profiles=validate({...memory,profiles:items}).profiles;schedule();
}
export function replaceVaultJournal(items:JournalEntry[]){
 if(!memory)throw Error('Vault is locked');
 memory.journal=validate({...memory,journal:items}).journal;schedule();
}
function schedule(){
 if(!memory||!secret)throw Error('Cannot save locked vault');
 const snapshot=clone(memory),password=secret;
 pending++;
 saveQueue=saveQueue.catch(()=>undefined).then(async()=>{try{
  const encrypted=await encryptBackup(snapshot,password);
  commitEncrypted(encrypted);lastError='';
 }catch(e){lastError=String(e);throw e}finally{pending--}});
}
export async function flushVault(){await saveQueue;if(lastError)throw Error(lastError)}
export function lockVault(){memory=null;secret=null}
export async function unlockVaultWithUI(root:HTMLElement){
 if(!isVaultConfigured())return;
 root.innerHTML='<div class="vault-lock-screen"><section class="vault-lock-card"><div class="vault-lock-emblem">✧</div><h1>MX Astro</h1><h2>Encrypted local vault · الخزنة المشفّرة</h2><p>ادخل كلمة السر لفك ملفاتك على هذا الجهاز فقط. كلمة السر ما تُرسل إلى السيرفر. Enter your passphrase to decrypt on this device.</p><form id="vault-unlock"><label for="vault-unlock-password">Passphrase · كلمة السر</label><input id="vault-unlock-password" type="password" autocomplete="current-password" minlength="12" required><button type="submit">Unlock · فتح الخزنة</button><p id="vault-unlock-error" role="alert"></p></form></section></div>';
 await new Promise<void>(resolve=>{
  const form=root.querySelector<HTMLFormElement>('#vault-unlock')!;
  form.onsubmit=async ev=>{
   ev.preventDefault();const input=root.querySelector<HTMLInputElement>('#vault-unlock-password')!;
   const button=form.querySelector<HTMLButtonElement>('button')!;button.disabled=true;
   try{await unlockVault(input.value);input.value='';resolve()}catch{root.querySelector<HTMLElement>('#vault-unlock-error')!.textContent='Incorrect passphrase or damaged vault · كلمة السر غير صحيحة أو الخزنة تالفة';input.value=''}finally{button.disabled=false}
  };
 });
}
