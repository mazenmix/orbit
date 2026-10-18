import test from 'node:test';import assert from 'node:assert/strict';
import {encryptBackup,decryptBackup} from '../src/secureBackup.ts';
const sample={schema:1,profiles:[{name:'Private Person',date:'1985-03-29',city:'Baghdad'}]};
test('AES-GCM encrypted backup roundtrip and randomized ciphertext',async()=>{
 const a=await encryptBackup(sample,'a long private passphrase'),b=await encryptBackup(sample,'a long private passphrase');
 assert.equal(a.format,'mx-orbit-encrypted-v1');
 assert.ok(!JSON.stringify(a).includes('Private Person'));
 assert.notEqual(a.ciphertext,b.ciphertext);
 assert.deepEqual(await decryptBackup(a,'a long private passphrase'),sample);
});
test('decryption rejects bad password and tampered ciphertext',async()=>{
 const a=await encryptBackup(sample,'another private passphrase');
 await assert.rejects(decryptBackup(a,'wrong password here'),/Incorrect password/);
 await assert.rejects(decryptBackup({...a,ciphertext:a.ciphertext.slice(0,-3)+'abc'},'another private passphrase'));
});
test('invalid KDF work factors and short passwords are rejected',async()=>{
 await assert.rejects(encryptBackup(sample,'short'));
 await assert.rejects(decryptBackup({format:'mx-orbit-encrypted-v1',iterations:1},'correct horse battery staple'));
});
