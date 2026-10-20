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


test('main navigation exposes five primary destinations and preserves professional deep links',()=>{
 assert.match(main,/const primaryRoutes=\['today','chart','people','calendar','more'\]/);
 assert.ok(main.includes("if(uiMode==='simple')return ''"));
 assert.ok(main.includes("function morePage()"));
 assert.ok(main.includes("localStorage.setItem('mx.uiMode',uiMode)"));
 assert.match(main,/nav\(primaryRoutes\)/);
 assert.match(main,/nav\(primaryRoutes,true\)/);
 assert.ok(!main.includes("nav(['today','signals','people','chart'])"));
 assert.ok(!main.includes("nav(['time','lunar','eclipses','asteroids','advanced','intel','evidence','ai','settings'])"));
});
test('grouped feature tabs preserve old deep links and keep evidence contextual',()=>{
 for(const route of ["signals","asteroids","lunar","eclipses","advanced","ai","evidence"]){
  assert.ok(main.includes("case '"+route+"'"),route+' deep link remains');
 }
 assert.match(main,/return sectionTabs\(\)/);
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

test('calendar is a focused route and MX Ai retains all original indices',()=>{assert.ok(main.includes("case 'calendar':inner=uiMode==='simple'?focusedCalendar():astroCalendarPage()"));assert.ok(main.includes("t('MX Ai','MX Ai')"));assert.ok(main.includes("مصفوفة المؤشرات الـ29"));});

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
 assert.ok(main.includes('moonHumanReading(sign,r,active.known,lang)'));
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
 assert.ok(main.includes('calendarDaySynthesis(samples)'));
 assert.ok(main.includes('calendarMomentEvidence(current,natal,sampledAt,active.known)'));
 assert.ok(main.includes("CALENDAR_SAMPLE_HOURS.map(hour=>"));
 assert.ok(!main.includes('colorizeAstroDay(r.scores)'));
 assert.ok(main.includes('snap.strongestSupport'));
 assert.ok(main.includes('snap.strongestChallenge'));
 assert.ok(main.includes("localValue(sampledAt,active.zone).slice(0,16)"));
 assert.ok(main.includes('calendarFailures.set(day.iso'));
});

test('MX Ai no longer renders the WHY NOW audit box',()=>{
 const block=main.slice(main.indexOf('function intelPage(){'),main.indexOf('function asteroidsPage(){'));
 for(const word of ['WHY NOW','ليش هسه؟','intel-audit','مجموع أوزان الإشارات الداعمة'])assert.ok(!block.includes(word),word);
 assert.ok(block.includes('وين تركز هسّه؟')&&block.includes('مصفوفة المؤشرات الـ29'));
});
test('presentation labels use Ai and never expose provider model branding',()=>{
 const soul=readFileSync('src/soulUI.ts','utf8'),ai=main.slice(main.indexOf('function aiPage(){'),main.indexOf('function moonPushSchedule()',main.indexOf('function aiPage(){')));
 assert.ok(!soul.includes('Qwen3')&&!soul.includes('QWEN3'));
 assert.ok(!ai.includes('Qwen3')&&!ai.includes('QWEN3'));
 assert.ok(ai.includes('aria-label="Ai"'));
 assert.ok(main.includes("t('شرح Ai','Ai explanations')"));
});
test('Tahoma style covers all application surfaces after prior feature styles',()=>{
 const font=readFileSync('src/typography.css','utf8');
 assert.match(main,/import '\.\/astroCalendar\.css';\s*import '\.\/typography\.css';/);
 assert.ok(font.includes('Tahoma, Arial, sans-serif !important'));
 assert.ok(font.includes('svg text'));
 assert.ok(font.includes('.mobile-nav'));
});

test('calendar shows only three numeric color bands and no methodology expander',()=>{
 const calendar=readFileSync('src/astroCalendar.ts','utf8');
 assert.ok(calendar.includes("value<=30?'red':value<=70?'yellow':'green'"));
 assert.ok(main.includes("(['green','yellow','red'] as const).map(legend)"));
 assert.ok(!main.includes('شلون تحدد لون الحظ؟'));
 assert.ok(!main.includes('How is the fortune color determined?'));
 assert.ok(!calendar.includes("'orange'"));
});

test('calendar focused-day card is compact, with core evidence but no verbose breakdown',()=>{
 const begin=main.indexOf('function astroCalendarDetail(iso:string){'),end=main.indexOf('function calendarColorLabel(',begin);
 const detail=main.slice(begin,end);
 assert.ok(detail.includes('astro-day-compact-head'));
 assert.ok(detail.includes('astro-day-compact-aspects'));
 assert.ok(detail.includes('astro-day-compact-footer'));
 assert.ok(detail.includes('snap.strongestSupport')&&detail.includes('snap.strongestChallenge'));
 assert.ok(detail.includes('data-calendar-open'));
 assert.ok(!detail.includes('astro-fortune-proof'));
 assert.ok(!detail.includes('astro-day-summary'));
 assert.ok(!detail.includes('شلون تحدد لون الحظ'));
 const styles=readFileSync('src/astroCalendar.css','utf8');
 assert.match(styles, /#live-view-body \.astro-calendar-detail\{\s*padding:14px 18px!important;/);
});

test('precision calendar samples 3 separately calculated local chart times',()=>{
 const source=readFileSync('src/astroCalendar.ts','utf8');
 assert.ok(source.includes('CALENDAR_SAMPLE_HOURS=[4,12,20]'));
 assert.ok(source.includes('for(const id of primaryBodies)'));
 assert.ok(source.includes('aspects([transit.get(id)!],fixed,at)'));
 assert.ok(main.includes('rating.minimum'));
 assert.ok(main.includes('rating.maximum'));
 assert.ok(main.includes('snap.minimum'));
 assert.ok(main.includes('snap.maximum'));
 assert.ok(!main.includes('colorizeAstroDay(r.evidence)'));
});

test('calendar computations reuse one verified natal chart and never use truncated report data',()=>{
 const start=main.indexOf('function startCalendarWork(){'),end=main.indexOf('function bindCalendarDayButtons(){',start);
 const task=main.slice(start,end);
 assert.ok(task.includes('calendarNatal=chart(birthInstant(active),active)'));
 assert.ok(task.includes('chart(sampledAt,active,false,false)'));
 assert.ok(task.includes('calendarMomentEvidence(current,natal,sampledAt,active.known)'));
 assert.ok(!task.includes('getReport(at)'));
 assert.ok(!task.includes('r.evidence'));
 assert.ok(task.includes('calendarCursor+2'));
});

test('Today and Time Machine compact styles scope card density without removing controls',()=>{
 assert.ok(main.includes('dashboard-grid mx-today-compact'));
 assert.ok(main.includes('panel time-controls mx-time-compact'));
 const compact=readFileSync('src/typography.css','utf8');
 assert.ok(compact.includes('.mx-today-compact .score-card'));
 assert.ok(compact.includes('#live-view-body:has(.mx-time-compact) .score-card'));
 assert.ok(compact.includes('.mx-time-compact .quick-times'));
 for(const term of ['id="time-form"','data-shift="','scoresHTML(data!)','expand-sky-wheel'])assert.ok(main.includes(term),term);
});
test('Moon timing status and four milestones use matching inline SVG pictograms',()=>{
 const lunar=main.slice(main.indexOf('function lunarUiIcon('),main.indexOf('function timePage(){'));
 assert.ok(lunar.includes('mx-lunar-icon'));
 assert.ok(lunar.includes('aria-hidden="true"'));
 for(const id of ["moon","void","entered","next","voc-start","voc-end"])assert.ok(lunar.includes(id),id);
 for(const glyph of ["'↘'","'↗'","'↤'","'↦'"])assert.ok(!lunar.includes(glyph),glyph);
 const styles=readFileSync('src/typography.css','utf8');
 assert.ok(styles.includes('.lunar-emblem .mx-lunar-icon'));
 assert.ok(styles.includes('.mx-lunar-tile-icon .mx-lunar-icon'));
});

test('simple home keeps four evidence-first cards, no repeated score tiles, and refines exact peaks on demand',()=>{
 const start=main.indexOf('function focusedToday()'),end=main.indexOf('function focusedCalendar()',start);
 const focus=main.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.ok(focus.includes('mx-focus-hero'));
 assert.ok(focus.includes('mx-focus-ai'));
 assert.ok(focus.includes('mx-focus-moon'));
 assert.ok(focus.includes('Next 3 exact sky events'));
 assert.ok(!focus.includes('mx-focus-metrics')&&!focus.includes('Two additional signals'));
 assert.ok(main.includes('unique.find(x=>Math.abs(+x.at-+e.at)<60000)'));
 assert.ok(focus.includes('factor.orb.toFixed(2)'));
 assert.ok(main.includes('refineNatalTransit(f,selected,'));
 assert.ok(main.includes('function startFocusEventScan()'));
 assert.ok(main.includes('function focusEventMarkup(events:FocusEvent[])'));
 assert.ok(main.includes("e.transit.id==='Moon'?3:21"));
 assert.ok(main.includes('calendarTargetDays():number'));
 assert.ok(main.includes('calendarCursor<calendarTargetDays()'));
 assert.ok(main.includes('function focusedCalendar()'));
 assert.ok(main.includes('function focusedTime()'));
 assert.ok(main.includes('function morePage()'));
 assert.ok(main.includes("case 'today':inner=uiMode==='simple'?focusedToday():today()"));
});
