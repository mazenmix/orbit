import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const build=readFileSync('scripts/finalize.mjs','utf8');
test('PWA push notifications require real incoming subscription event, not a fake client timer',()=>{
 assert.match(build,/self\.addEventListener\('push'/);
 assert.match(build,/self\.registration\.showNotification\('MX Astro'/);
 assert.match(build,/self\.addEventListener\('notificationclick'/);
 assert.match(build,/requireInteraction:false/);
});
test('push display trims body and prevents arbitrary external click-through URLs',()=>{
 assert.ok(build.includes('.slice(0,240)'));
 assert.ok(build.includes('/^#(today|signals|time|people|chart|lunar|eclipses|asteroids|advanced|intel|evidence|ai|settings)$/'))
 assert.ok(build.includes("new URL(c.url).origin===self.location.origin"));
 assert.ok(build.includes("openWindow('/'+page)"));
});
test('new SW cache deletes stale MX Orbit caches without removing user asteroid cache',()=>{
 assert.ok(build.includes("mx-astro-"));
 assert.ok(build.includes("startsWith('mx-orbit-')"));
 assert.ok(!build.includes("caches.delete('mx-asteroid-se1-v1')"));
});
