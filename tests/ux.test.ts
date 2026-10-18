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


test('main navigation exposes eight primary destinations without redundant sections',()=>{
 assert.match(main,/const primaryRoutes=\['today','chart','people','time','lunar','calendar','intel','settings'\]/);
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

test('calendar is a dedicated route and MX Ai has 29 indices',()=>{assert.ok(main.includes("case 'calendar':inner=astroCalendarPage()"));assert.ok(main.includes("t('MX Ai','MX Ai')"));assert.ok(main.includes("مصفوفة المؤشرات الـ29"));});

test('lunar explanations are anchored to actual aspect events, not raw angles alone',()=>{
 assert.ok(main.includes('function moonMomentNarrative('));
 assert.ok(main.includes('function moonAspectNarrative('));
 assert.ok(main.includes('mx-lunar-aspect-story'));
});
test('Go-mode uses unique domain-specific recommendations rather than repetitive filler',()=>{
 assert.ok(main.includes('function mxGoNarrative('));
 assert.ok(!main.includes("t('اسأل عن التفاصيل قبل القرار'"));
 assert.ok(!main.includes('تظهر زاوية رمزية داعمة؛ استثمرها بخطوة محدودة'));
 assert.ok(main.includes('mxGoNarrative(d.domain,state,memo)'));
});

test('Moon sign has live five-line calculation tied to owner natal data',()=>{
 assert.ok(main.includes('moonSignReading(sign,r.current,r.natal,active.known'));
 assert.ok(main.includes('id="mx-moon-sign-reading"'));
 assert.ok(main.includes('function updateLiveMoonSign('));
});
test('chart interpretation is calculated per person, not generic repeated boilerplate',()=>{
 assert.ok(main.includes('precisionChartStories(r.natal'));
 assert.ok(main.includes('natalAsteroidDetails(person,r.natal)'));
 assert.ok(main.includes('chartSpecificFingerprint(person,natal)'));
 assert.ok(!main.includes('<summary>'+ "'+t('طريقة القراءة'" ));
});
test('calendar uses English-only weekdays and month names, no large hero',()=>{
 assert.ok(main.includes("const weekdays=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']"));
 assert.ok(main.includes("new Intl.DateTimeFormat('en-US'"));
 assert.ok(!main.includes("const header='<div class=\"astro-cal-hero\""));
});
test('live redraw preserves open details and avoids location reload',()=>{
 assert.ok(main.includes('function refreshLiveBody('));
 assert.ok(main.includes("if(liveTimePinned)return;"));
 assert.ok(main.includes('preserved=Array.from('));
 assert.ok(!main.includes('location.reload('));
});

test('soul identity and natal wheel remove decorative face and obsolete labels',()=>{
 const soul=readFileSync('src/soulUI.ts','utf8');
 const wheel=readFileSync('src/chart.ts','utf8');
 assert.ok(!soul.includes('soul-head.svg')&&!soul.includes('MX SOUL DNA'));
 assert.ok(soul.includes('تحليل الخارطة الشخصية'));
 assert.ok(!main.includes('الدائرة الفلكية — البيوت عكس عقارب الساعة'));
 assert.ok(!wheel.includes('خارطة فلكية مفصلة تشمل الأبراج والكواكب والبيوت والزوايا'));
});
test('live sky wheel is directly tappable and launches an expanded SVG modal',()=>{
 assert.ok(main.includes('id="expand-sky-wheel"'));
 assert.ok(main.includes('mx-expanded-wheel'));
 assert.ok(main.includes("on('expand-sky-wheel',expandSky)"));
});
test('fortune calendar color must come from genuine aspect weights and show transparent proof',()=>{
 assert.ok(main.includes('colorizeAstroDay(r.evidence)'));
 assert.ok(!main.includes('colorizeAstroDay(r.scores)'));
 assert.ok(main.includes('snap.favorableWeight.toFixed(3)'));
 assert.ok(main.includes('snap.challengingWeight.toFixed(3)'));
 assert.ok(main.includes("localValue(at,active.zone).slice(0,16)"));
 assert.ok(main.includes('calendarFailures.set(day.iso'));
});
