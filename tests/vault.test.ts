import test from 'node:test';import assert from 'node:assert/strict';
const data=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{value:{getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,String(v)),removeItem:(k:string)=>data.delete(k)},configurable:true});
import {setupVault,unlockVault,vaultOpened,vaultProfiles,vaultJournal,replaceVaultProfiles,flushVault,lockVault,VAULT_KEY} from '../src/vault.ts';
const profile={id:'self',name:'Private',date:'1985-03-29',time:'19:20',zone:'Asia/Baghdad',city:'Baghdad',lat:33.31,lon:44.36,kind:'self',known:true,sex:'male'};
test('local vault migrates only after encryption and removes legacy plaintext',async()=>{
 data.clear();localStorage.setItem('mx.orbit.profiles.v1',JSON.stringify([profile]));localStorage.setItem('mx.orbit.journal.v1','[]');
 await setupVault('long enough encrypted passphrase',[profile] as any,[]);
 assert.ok(data.get(VAULT_KEY)?.includes('ciphertext'));assert.ok(!data.get(VAULT_KEY)?.includes('Private'));
 assert.equal(data.has('mx.orbit.profiles.v1'),false);assert.equal(data.has('mx.orbit.journal.v1'),false);
 assert.equal(vaultProfiles()[0].name,'Private');
 lockVault();assert.equal(vaultOpened(),false);
 await assert.rejects(unlockVault('wrong passphrase here'));
 await unlockVault('long enough encrypted passphrase');assert.equal(vaultProfiles()[0].name,'Private');
 replaceVaultProfiles([{...profile,name:'Updated'}] as any);await flushVault();
 lockVault();await unlockVault('long enough encrypted passphrase');assert.equal(vaultProfiles()[0].name,'Updated');assert.deepEqual(vaultJournal(),[]);
});
