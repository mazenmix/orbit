import {validateProfile,type Profile} from './engine.ts';
/** One-time, fragment-only local personalization.
 * Birth information is never compiled into the public JS bundle and URL
 * fragments are not sent by browsers in HTTP requests. Remove fragment on import.
 */
export function decodePrivateSetup(fragment:string):Profile|null{
 const match=/^#private-profile=([A-Za-z0-9_-]{20,1800})$/.exec(fragment);
 if(!match)return null;
 const base=match[1].replace(/-/g,'+').replace(/_/g,'/');
 const bytes=Uint8Array.from(atob(base),c=>c.charCodeAt(0));
 const p=JSON.parse(new TextDecoder().decode(bytes)) as Profile;
 validateProfile(p);if(p.kind!=='self')throw Error('Personal setup accepts My Profile only');
 return p;
}
