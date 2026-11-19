import test from 'node:test';
import assert from 'node:assert/strict';
import {loadProfiles,StoredProfilesError} from '../src/storage.ts';
import {defaultProfile} from '../src/engine.ts';

test('damaged saved profiles never become a silent demo profile',()=>{
 const data=new Map<string,string>();
 const previous=globalThis.localStorage;
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{
  getItem:(key:string)=>data.get(key)??null,
  setItem:(key:string,value:string)=>data.set(key,value),
  removeItem:(key:string)=>data.delete(key)
 }});
 try{
  assert.equal(loadProfiles()[0].id,defaultProfile.id);
  for(const raw of ['{broken','[]',JSON.stringify([{...defaultProfile,zone:'not/a-zone'}])]){
   data.set('mx.orbit.profiles.v1',raw);
   assert.throws(()=>loadProfiles(),StoredProfilesError);
   assert.equal(data.get('mx.orbit.profiles.v1'),raw);
  }
  data.set('mx.orbit.profiles.v1',JSON.stringify([defaultProfile]));
  assert.equal(loadProfiles()[0].id,defaultProfile.id);
 }finally{Object.defineProperty(globalThis,'localStorage',{configurable:true,value:previous})}
});
