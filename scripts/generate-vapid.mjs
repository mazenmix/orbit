#!/usr/bin/env node
/** Run on user's trusted computer. Output includes PRIVATE KEY; never commit. */
import {generateKeyPairSync} from 'node:crypto';
const {privateKey,publicKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'});
const jwk=privateKey.export({format:'jwk'}),pub=publicKey.export({format:'jwk'});
const decode=x=>Buffer.from(x.replace(/-/g,'+').replace(/_/g,'/'),'base64');
const bytes=Buffer.concat([Buffer.from([4]),decode(pub.x),decode(pub.y)]);
if(bytes.length!==65)throw Error('Unexpected P-256 public key length');
console.log('VAPID PUBLIC KEY - Pages and Worker MX_VAPID_PUBLIC_KEY:\n'+bytes.toString('base64url'));
console.log('\nPRIVATE JWK - SECRET MX_VAPID_PRIVATE_JWK on Pages and Worker - NEVER COMMIT:\n'+JSON.stringify(jwk));
console.log('\nProtect the private JWK. Rotating keys requires users to resubscribe.');
