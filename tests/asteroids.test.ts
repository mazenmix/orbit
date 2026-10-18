import test from 'node:test';import assert from 'node:assert/strict';
import {namedAsteroids,asteroidFile,asteroidSourcePath,asteroidExpectedFiles} from '../src/asteroids.ts';
test('exact MX Eye source has 56 unique named numbered asteroids with valid Swift-compatible IDs',()=>{
 assert.equal(namedAsteroids.length,56);
 assert.equal(new Set(namedAsteroids.map(x=>x.number)).size,56);
 assert.equal(new Set(namedAsteroids.map(x=>x.name)).size,56);
 assert.ok(namedAsteroids.every(x=>x.swissBodyId===10000+x.number));
});
test('Swiss asteroid data files respect subdirectory and padded short-file naming',()=>{
 assert.equal(asteroidSourcePath(433),'ast0/se00433s.se1');
 assert.equal(asteroidSourcePath(33154),'ast33/se33154s.se1');
 assert.equal(asteroidFile(7066),'se07066s.se1');
 assert.equal(asteroidExpectedFiles().length,56);
});
test('missing/invalid file identifiers fail closed',()=>{
 assert.throws(()=>asteroidFile(NaN));
 assert.throws(()=>asteroidFile(-1));
});
