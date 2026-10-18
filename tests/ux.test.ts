import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const main=readFileSync('src/main.ts','utf8'),index=readFileSync('index.html','utf8'),manifest=JSON.parse(readFileSync('public/manifest.webmanifest','utf8'));
test('public browser title, PWA and visible brand all use MX Astro, never the old name',()=>{
 assert.equal(manifest.name,'MX Astro');assert.equal(manifest.short_name,'MX Astro');
 assert.match(index,/<title>MX Astro<\/title>/);
 assert.ok(!main.includes('MX Orbit')&&!main.includes('MX ORBIT')&&!index.includes('MX Orbit'));
 assert.ok(main.includes('brand-wordmark'));
});
test('unwanted repeated technical footer and web-capabilities box are removed',()=>{
 for(const unwanted of ['WEB EDITION · 0.1','حدود نسخة الويب','MAZENMIXORACLE','محلي على جهازك، بدون حساب مستخدم.','المواضع الفلكية محسوبة. الإرشاد رمزي'])assert.ok(!main.includes(unwanted),'public source still has '+unwanted);
});
test('profile location and timezone selection is automatic and allows worldwide IANA zones',()=>{
 assert.match(main,/id="place-search"/);assert.match(main,/id="timezone-list"/);
 assert.match(main,/type="hidden" name="lat"/);assert.match(main,/type="hidden" name="lon"/);
 assert.ok(!main.includes('name="lat" type="number"'));
 assert.ok(main.includes('Intl.supportedValuesOf'));
});
test('Asteroid readings and evidence UI are narrative-first and confidential birth data not embedded in public bundle',()=>{
 assert.ok(main.includes('asteroidReading(a,near'));assert.ok(main.includes('function evidencePage(){'));
 assert.ok(!main.includes('1985-03-29'));assert.ok(!main.includes('19:20'));
});
