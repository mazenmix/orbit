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


test('main navigation exposes seven primary destinations without redundant sections',()=>{
 assert.match(main,/const primaryRoutes=\['today','chart','people','time','lunar','intel','settings'\]/);
 assert.match(main,/nav\(primaryRoutes\)/);
 assert.match(main,/nav\(primaryRoutes,true\)/);
 assert.ok(!main.includes("nav(['today','signals','people','chart'])"));
 assert.ok(!main.includes("nav(['time','lunar','eclipses','asteroids','advanced','intel','evidence','ai','settings'])"));
});
test('grouped feature tabs preserve old deep links and keep evidence contextual',()=>{
 for(const route of ["signals","asteroids","lunar","eclipses","advanced","ai","evidence"]){
  assert.ok(main.includes("case '"+route+"'"),route+' deep link remains');
 }
 assert.match(main,/sectionTabs\(\)\+inner/);
 assert.match(main,/data-go="evidence"/);
 assert.match(main,/data-go="ai"/);
 assert.ok(!main.includes('function annualOutlookUI()'));
});

test('Qwen3 has one automatic answer panel without manual controls',()=>{
 const begin=main.indexOf('function aiPage(){'),end=main.indexOf('function qwenLiveMarkup(){',begin);
 const ui=main.slice(begin,end);
 assert.ok(ui.includes('mx-qwen-live'));
 assert.ok(!ui.includes('ask-ai')&&!ui.includes('copy-prompt')&&!ui.includes('EXPLANATION LAYER'));
 assert.ok(!main.includes("on('ask-ai'")&&!main.includes("on('copy-prompt'"));
 assert.ok(main.includes('async function refreshLiveQwen('));
 assert.ok(main.includes("fetch('/api/explain',{method:'POST'"));
 assert.ok(main.includes('AI_MIN_INTERVAL_MS'));
});

test('automatic Qwen reading resets promptly when active profile or language switches',()=>{
 assert.ok(main.includes('minute===aiLastCheckMinute&&liveQwenScope()===aiScope'));
 assert.ok(main.includes("if(scope!==aiScope){"));
 assert.ok(main.includes("aiRequestId++"));
});
