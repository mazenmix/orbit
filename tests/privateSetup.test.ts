import test from 'node:test';import assert from 'node:assert/strict';
import {decodePrivateSetup} from '../src/privateSetup.ts';
const p={id:'setup-self',name:'Example User',date:'1980-01-01',time:'09:00',zone:'Asia/Baghdad',lat:33.33,lon:44.44,city:'Baghdad',known:true,kind:'self'};
test('private onboarding parses a valid fragment and never requires a public default user birth date',()=>{
 const blob=Buffer.from(JSON.stringify(p)).toString('base64url');
 const result=decodePrivateSetup('#private-profile='+blob);
 assert.deepEqual(result,p);
 assert.equal(decodePrivateSetup('#today'),null);
});
test('private fragment validates before local import',()=>{
 const val=Buffer.from(JSON.stringify({...p,lat:999})).toString('base64url');
 assert.throws(()=>decodePrivateSetup('#private-profile='+val));
});
