import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceCommit} from '../scripts/buildProvenance.mjs';
const cloud='a'.repeat(40),github='b'.repeat(40);
test('production revision prefers actual Cloudflare Pages source commit over CI SHA',()=>{
 assert.equal(sourceCommit({CF_PAGES_COMMIT_SHA:cloud,GITHUB_SHA:github}),cloud);
 assert.equal(sourceCommit({GITHUB_SHA:github}),github);
});
test('source provenance never invents a release SHA for local or malformed build',()=>{
 assert.equal(sourceCommit({}),null);
 assert.equal(sourceCommit({CF_PAGES_COMMIT_SHA:'main'}),null);
 assert.equal(sourceCommit({CF_PAGES_COMMIT_SHA:'deadbeef'}),null);
 assert.equal(sourceCommit({CF_PAGES_COMMIT_SHA:'Z'.repeat(40)}),null);
});
