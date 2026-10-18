import test from 'node:test';import assert from 'node:assert/strict';
import {permittedPushEndpoint,validatePushSubscription,encryptWebPush,vapidAuthorization} from '../src/webPushCrypto.ts';
const b64=(a:Uint8Array)=>btoa(String.fromCharCode(...a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
test('Push crypto cannot be used to send user data to random URLs',()=>{
 for(const url of ['https://evil.test/a','http://web.push.apple.com/a','https://web.push.apple.com.evil.test/a'])assert.equal(permittedPushEndpoint(url),false);
 assert.equal(permittedPushEndpoint('https://web.push.apple.com/QAAA'),true);
});
test('WebPush aes128gcm contains random salt, a valid 65-byte sender key and authentic encrypted message',async()=>{
 const keys=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
 const pub=new Uint8Array(await crypto.subtle.exportKey('raw',keys.publicKey)),auth=crypto.getRandomValues(new Uint8Array(16));
 const subscription={endpoint:'https://fcm.googleapis.com/fcm/send/example',keys:{p256dh:b64(pub),auth:b64(auth)}};
 const body=await encryptWebPush({body:'Hello MX Astro'},validatePushSubscription(subscription));
 assert.equal(body.length>110,true);
 assert.equal(body[20],65);assert.equal(body[21],4);
 const second=await encryptWebPush({body:'Hello MX Astro'},subscription);assert.notDeepEqual(body,second);
});
test('VAPID signs actual ES256 JWT with a random P-256 keypair',async()=>{
 const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
 const jwk=await crypto.subtle.exportKey('jwk',pair.privateKey),publicKey=b64(new Uint8Array(await crypto.subtle.exportKey('raw',pair.publicKey)));
 const auth=await vapidAuthorization('https://web.push.apple.com/abc',publicKey,JSON.stringify(jwk));
 assert.ok(auth.startsWith('vapid t='));assert.ok(auth.includes(', k='+publicKey));
});
