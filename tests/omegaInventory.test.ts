import test from 'node:test';
import assert from 'node:assert/strict';
import {generateOmegaInventory} from '../scripts/omega-inventory.mjs';

test('Omega inventory maps every source module, route, and existing test file',()=>{
 const result=generateOmegaInventory();
 assert.ok(result.modules.length>=85);
 assert.ok(result.testFiles.length>=90);
 assert.equal(new Set(result.modules.map(m=>m.file)).size,result.modules.length);
 assert.equal(new Set(result.testFiles).size,result.testFiles.length);
 for(const route of ['today','now','go','travelmode','people','chart','lunar','calendar','eclipses','settings'])
  assert.ok(result.routes.some(r=>r.section===route),'Missing route '+route);
 for(const module of result.modules){
  assert.ok(module.lines>0,module.file);
  assert.ok(Array.isArray(module.imports));
  assert.ok(Array.isArray(module.functions));
 }
 const sky=result.modules.find(m=>m.file==='src/skyContext.ts');
 assert.ok(sky?.functions.includes('skyContext'));
 assert.ok(sky?.imports.includes('src/math.ts'));
 assert.ok(sky?.directlyReferencedByTests.includes('tests/skyContext.test.ts'));
});
