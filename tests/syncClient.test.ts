import test from 'node:test';import assert from 'node:assert/strict';
import {createSyncCode,parseSyncCode,SyncError} from '../src/syncClient.ts';
test('sync sharing code contains 128-bit random slot and separate 256-bit secret, no passphrase',()=>{
 const a=createSyncCode(),b=createSyncCode();
 assert.notEqual(a,b);
 const code=parseSyncCode(a);
 assert.match(code.slot,/^[\w-]{22}$/);assert.match(code.secret,/^[\w-]{43}$/);
 assert.ok(!a.includes('passphrase'));assert.equal(code.v,1);
});
test('sync sharing code rejects malformed or underspecified capabilities',()=>{
 assert.throws(()=>parseSyncCode('bad'),SyncError);
 const code=createSyncCode();
 assert.throws(()=>parseSyncCode(code.slice(0,-10)+'s'.repeat(10)),SyncError);
});
