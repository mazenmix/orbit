import test from 'node:test';import assert from 'node:assert/strict';
import {onRequestPost} from '../functions/api/sync.ts';
import {createSyncCode,parseSyncCode,uploadEncrypted,downloadEncrypted,SyncError} from '../src/syncClient.ts';
const domain='https://mxastro.pages.dev',rows=new Map<string,any>();
const fakeDB={
 exec:async(_sql:string)=>({}),
 prepare(query:string){
  let vals:any[]=[];
  const stmt={
   bind(...args:any[]){vals=args;return stmt},
   async first(){
    if(query.startsWith('SELECT'))return rows.get(vals[0])??null;
    throw Error('unknown SELECT');
   },
   async run(){
    if(query.startsWith('INSERT')){
     if(rows.has(vals[0]))return {meta:{changes:0}};
     rows.set(vals[0],{slot:vals[0],verifier:vals[1],revision:1,payload:vals[2],updated_at:vals[3]});return {meta:{changes:1}};
    }
    if(query.startsWith('UPDATE')){
     const row=rows.get(vals[2]);if(!row||row.revision!==vals[3]||row.verifier!==vals[4])return {meta:{changes:0}};
     Object.assign(row,{payload:vals[0],updated_at:vals[1],revision:row.revision+1});return {meta:{changes:1}};
    }
    throw Error('unknown write');
   }
  };
  return stmt;
 }
};
test('Two simulated devices sync only ciphertext; stale writes and wrong secret cannot overwrite',async()=>{
 rows.clear();const originalFetch=globalThis.fetch;
 globalThis.fetch=async(url,opts)=>{
  if(String(url)!=='/api/sync')throw Error('unexpected external URL');
  return onRequestPost({request:new Request(domain+'/api/sync',{method:'POST',headers:{Origin:domain,'Content-Type':'application/json'},body:opts?.body}),env:{MX_SYNC_DB:fakeDB}});
 };
 try{
  const code=createSyncCode(),password='test-synchronization-secret-2026',p1={schema:1,profiles:[{name:'first device'}],journal:[]};
  const first=await uploadEncrypted(code,password,0,p1);
  assert.equal(first.revision,1);
  const entry=rows.get(parseSyncCode(code).slot);
  assert.ok(entry.payload.includes('ciphertext'));
  assert.ok(!entry.payload.includes('first device'));
  const remote=await downloadEncrypted(code,password);
  assert.equal(remote.revision,1);assert.deepEqual(remote.payload,p1);
  await assert.rejects(uploadEncrypted(code,password,0,{schema:1,profiles:[],journal:[]}),(e:any)=>e.code==='SYNC_CONFLICT');
  const updated=await uploadEncrypted(code,password,1,{schema:1,profiles:[{name:'second device'}],journal:[]});
  assert.equal(updated.revision,2);
  const result=await downloadEncrypted(code,password);
  assert.equal(result.revision,2);assert.equal((result.payload as any).profiles[0].name,'second device');
  const {slot}=parseSyncCode(code),invalid=JSON.stringify({action:'pull',slot,secret:'z'.repeat(43)});
  const denied=await onRequestPost({request:new Request(domain+'/api/sync',{method:'POST',headers:{Origin:domain,'Content-Type':'application/json'},body:invalid}),env:{MX_SYNC_DB:fakeDB}});
  assert.equal(denied.status,403);
  await assert.rejects(downloadEncrypted(code,'incorrect secret passphrase'),/Incorrect password/);
 }finally{globalThis.fetch=originalFetch}
});
