import test from 'node:test';import assert from 'node:assert/strict';
import {soulCategories,soulTopics,soulSearch} from '../src/soulData.ts';
test('owner brief keeps exactly 25 original sections and 8 unique topics per section',()=>{assert.equal(soulCategories.length,25);assert.equal(soulTopics.length,200);assert.ok(soulCategories.every(c=>c.topics.length===8));assert.equal(new Set(soulTopics.map(x=>x.id)).size,200);});
test('find individual topics by Arabic and English across all categories',()=>{assert.ok(soulSearch('الغيرة').some(c=>c.id===14));assert.ok(soulSearch('intimacy').some(c=>c.id===12));assert.ok(soulSearch('الألوان').some(c=>c.id===21));assert.equal(soulSearch('unlisted impossible topic').length,0);});

test('Iraqi Arabic synonyms search concrete areas and allow direct topical browsing',()=>{
 assert.deepEqual(soulSearch('الجنس').map(c=>c.id),[12,13]);
 assert.deepEqual(soulSearch('الشهوة').map(c=>c.id),[12,13]);
 assert.deepEqual(soulSearch('fetish').map(c=>c.id),[12,13]);
 assert.ok(soulSearch('الوان').some(c=>c.id===21));
 assert.ok(soulSearch('عمل').some(c=>c.id===18));
});
