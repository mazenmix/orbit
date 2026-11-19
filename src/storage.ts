import {validateProfile,defaultProfile,type Profile} from './engine.ts';
import {isVaultConfigured,vaultOpened,vaultProfiles,replaceVaultProfiles} from './vault.ts';
const key='mx.orbit.profiles.v1';
export class StoredProfilesError extends Error {
 constructor(){super('Saved profile data is invalid');this.name='StoredProfilesError'}
}
function decodeStoredProfiles(raw:string):Profile[]{
 try{
  const stored=JSON.parse(raw);
  if(!Array.isArray(stored)||!stored.length||stored.length>100)throw Error('Invalid profiles');
  const checked=stored.map(validateProfile);
  if(!checked.some(p=>p.kind==='self')||new Set(checked.map(p=>p.id)).size!==checked.length)throw Error('Invalid profile identities');
  return checked;
 }catch{throw new StoredProfilesError()}
}
export function loadProfiles():Profile[]{
 if(vaultOpened())return vaultProfiles();
 if(isVaultConfigured())throw Error('Encrypted vault is locked');
 const raw=localStorage.getItem(key);
 return raw===null?[{...defaultProfile}]:decodeStoredProfiles(raw);
}
/** Keep unreadable data intact until a user explicitly chooses a valid backup. */
export async function recoverStoredProfiles(root:HTMLElement):Promise<Profile[]>{
 root.innerHTML='<section class="panel" role="alert"><h2>تعذر قراءة ملفات الميلاد</h2><p>بياناتك القديمة بعدها محفوظة بهذا المتصفح. نزّل نسخة منها أولاً، أو اختار نسخة احتياطية صالحة للاسترجاع.</p><button id="recover-raw" type="button">نزّل البيانات القديمة</button><label>استرجع نسخة احتياطية <input id="recover-file" type="file" accept=".json,application/json"></label><p id="recover-error" role="status"></p></section>';
 const raw=localStorage.getItem(key);
 root.querySelector<HTMLButtonElement>('#recover-raw')!.onclick=()=>{
  if(raw===null)return;
  const url=URL.createObjectURL(new Blob([raw],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='mx-astro-saved-profiles-recovery.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return new Promise(resolve=>{
  const input=root.querySelector<HTMLInputElement>('#recover-file')!;
  input.onchange=async()=>{
   try{
    const file=input.files?.[0];if(!file)return;
    const restored=parseBackup(await file.text());
    if(!confirm('استبدال البيانات غير المقروءة بالنسخة الاحتياطية المختارة؟ نزّل البيانات القديمة أولاً إذا تحتاجها.'))return;
    localStorage.setItem(key,JSON.stringify(restored));resolve(restored);
   }catch{root.querySelector<HTMLElement>('#recover-error')!.textContent='ما قدرنا نسترجع النسخة. تأكد إنها نسخة MX Astro صالحة، أو نزّل البيانات القديمة للاحتفاظ بيها.';input.value=''}
  };
 });
}
export function saveProfiles(items:Profile[]){if(!items.length||items.length>100)throw Error('Keep 1–100 profiles.');items.forEach(validateProfile);if(vaultOpened()){replaceVaultProfiles(items);return}if(isVaultConfigured())throw Error('Encrypted vault is locked');localStorage.setItem(key,JSON.stringify(items))}
export function download(data:unknown,filename:string){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export function parseBackup(text:string):Profile[]{const value=JSON.parse(text);if(value.schema!==1||!Array.isArray(value.profiles)||!value.profiles.length||value.profiles.length>100||!value.profiles.some((p:Profile)=>p.kind==='self'))throw Error('Invalid backup.');const seen=new Set<string>();return value.profiles.map((p:Profile)=>{validateProfile(p);if(seen.has(p.id))throw Error('Duplicate profile');seen.add(p.id);return p})}
