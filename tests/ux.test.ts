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


test('Moon is a full-sized main navigation item directly after Today on desktop and mobile',()=>{
 assert.match(main,/const primaryRoutes=\['today','chart','people','go','travelmode','calendar','more'\]/);
 assert.match(main,/function nav\(names:string\[\],mobile=false\)/);
 assert.match(main,/nav\(primaryRoutes\)/);
 assert.match(main,/nav\(primaryRoutes,true\)/);
 assert.ok(main.includes("data-go=\"lunar\" class=\"nav-item"));
 assert.ok(main.includes("if(n!=='today')return main"));
 assert.ok(!main.includes('nav-subitem'));
 assert.ok(main.includes("lunar:()=>t('القمر','Moon')"));
 assert.ok(main.includes("if(uiMode==='simple'||current==='today')return ''"));
 assert.ok(main.includes("card('signals'"),'Keep existing Signals page discoverable');
 assert.ok(main.includes("function morePage()"));
 assert.ok(main.includes("localStorage.setItem('mx.uiMode',uiMode)"));
});
test('Moon deep link remains under Today category without top duplicate or calendar copy',()=>{
 assert.match(main,/if\(route==='signals'\|\|route==='lunar'\)return 'today'/);
 assert.match(main,/calendar:\['calendar','time','eclipses','advanced'\]/);
 assert.ok(!main.includes('mx-today-section-tabs'));
 const more=main.slice(main.indexOf('function morePage(){'),main.indexOf('function scoresHTML('));
 assert.ok(!more.includes("card('lunar'"));
 assert.ok(main.includes("case 'lunar':inner=lunarPage()"));
});

test('Today exact events show calculated event-specific impact and next action, without disclaimer line',()=>{
 assert.ok(!main.includes('اتصالات شخصية وقمرية محسوبة؛ ما نعرض تواريخ مستقبلية بلا تحقق.'));
 assert.ok(main.includes("todayEventPlain(e.reading,lang)"));
 assert.ok(main.includes("t('دلالته:','Meaning:')"));
 assert.ok(main.includes("t('شنو تسوي:','What to do:')"));
 assert.ok(main.includes("reading:{kind:'personal-aspect',transit:e.transit.id,target:e.natal.id,angle:e.angle}"));
 assert.ok(main.includes('scanWholeSky(selected,at=>chart(at,active,false,false).points)'));
 assert.ok(main.includes('wholeSkyEventItems(brief.upcoming'));
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

test('calendar stays independent and Go Mode includes all 29 indices',()=>{assert.ok(main.includes("case 'calendar':inner=uiMode==='simple'?focusedCalendar():astroCalendarPage()"));assert.ok(main.includes("go:()=>t('Go Mode','Go Mode')"));assert.ok(main.includes('indicators.map(m=>indicatorGaugeCard(m)).join'));});

test('lunar explanations are anchored to actual aspect events, not raw angles alone',()=>{
 assert.ok(main.includes('function moonMomentNarrative('));
 assert.ok(main.includes('function moonAspectNarrative('));
 assert.ok(main.includes('mx-lunar-aspect-story'));
});
test('Go-mode uses unique domain-specific recommendations rather than repetitive filler',()=>{
 assert.ok(main.includes('function mxGoNarrative('));
 assert.ok(!main.includes("t('اسأل عن التفاصيل قبل القرار'"));
 assert.ok(!main.includes('تظهر زاوية رمزية داعمة؛ استثمرها بخطوة محدودة'));
 assert.ok(main.includes('contextGaugeNarrative(sky,memo.sourceCategories'), 'Go Mode text derives from each domain\'s current chart categories');
});

test('Moon sign has live five-line calculation tied to owner natal data',()=>{
 assert.ok(main.includes('moonHumanReading(sign,r,active.known,lang)'));
 assert.ok(main.includes('id="mx-moon-sign-reading"'));
 assert.ok(main.includes('function updateLiveMoonSign('));
});
test('chart interpretation is calculated per person, not generic repeated boilerplate',()=>{
 assert.ok(main.includes('natalPortrait(r.natal,person.known,lang)')); // Personal natal portrait remains
 assert.ok(main.includes('natalAsteroidDetails(person,r.natal)'));
 assert.ok(main.includes('chartSpecificFingerprint(person,natal)'));
 assert.ok(!main.includes('<summary>'+ "'+t('طريقة القراءة'" ));
});
test('calendar uses English-only weekdays and month names, no large hero',()=>{
 assert.ok(main.includes("const weekdays=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']"));
 assert.ok(main.includes("new Intl.DateTimeFormat('en-US'"));
 assert.ok(!main.includes("const header='<div class=\"astro-cal-hero\""));
});
test('real-time redraw retains open details, wheel DOM and Time Machine selection',()=>{
 assert.ok(main.includes('function reconcileLiveNode('));
 assert.ok(main.includes('function reconcileLiveHTML('));
 assert.ok(main.includes("const keepOpen=element.tagName==='DETAILS'"));
 assert.ok(main.includes("element.matches('svg.chart-wheel')"));
 assert.ok(main.includes('function refreshLiveBody('));
 assert.ok(main.includes('if(liveTimePinned)return;'));
 assert.ok(!main.includes('region.innerHTML=content()'));
 const redraw=main.slice(main.indexOf('function reconcileLiveNode('),main.indexOf('function refreshLiveView('));
 assert.ok(!redraw.includes('location.reload('),'Live sky ticks must not reload the page; only a new installed release may reload');
});
test('live ephemeris updates main, chart, and enlarged sky wheels independently of full content',()=>{
 assert.ok(main.includes('LIVE_SKY_INTERVAL_MS=5000'));
 assert.ok(main.includes("const at=new Date(now),sky=chart(at,active,true)"));
 assert.ok(main.includes('reconcileLiveHTML(enlarged,html)'));
 assert.ok(main.includes('reconcileLiveHTML(chartWheel,'));
 assert.ok(main.includes("screen==='chart'"));
 assert.ok(main.includes("screen==='lunar'&&!boundary"));
 assert.ok(main.includes('const at=new Date(now),fresh=getReport(at)'));
 assert.ok(main.includes('people:30000'));
 assert.ok(main.includes('time:30000'));
 assert.ok(main.includes("document.addEventListener('visibilitychange'"));
});
test('VOC no longer displays confusing out-of-void wording',()=>{
 assert.ok(main.includes("t('ماشي عدل','Moon on course')"));
 assert.ok(main.includes("t('القمر ماشي عدل','Moon is on course')"));
 assert.ok(!main.includes("t('خارج خلو المسار'"));
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
test('fortune calendar score still derives from actual samples without the removed daily proof panel',()=>{
 assert.ok(main.includes('calendarDaySynthesis(samples)'));
 assert.ok(main.includes('calendarMomentEvidence(current,natal,sampledAt,active.known)'));
 assert.ok(main.includes("CALENDAR_SAMPLE_HOURS.map(hour=>"));
 assert.ok(!main.includes('colorizeAstroDay(r.scores)'));
 assert.ok(main.includes("localValue(sampledAt,active.zone).slice(0,16)"));
 assert.ok(main.includes('calendarFailures.set(day.iso'));
});

test('MX Ai no longer renders the WHY NOW audit box',()=>{
 const block=main.slice(main.indexOf('function goModePage(){'),main.indexOf('function asteroidsPage(){'));
 for(const word of ['WHY NOW','ليش هسه؟','intel-audit','مجموع أوزان الإشارات الداعمة'])assert.ok(!block.includes(word),word);
 assert.ok(block.includes('go-grid')&&block.includes('metrics-grid'));
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

test('calendar keeps three numeric color bands but removes the legend and explanatory subtitle',()=>{
 const calendar=readFileSync('src/astroCalendar.ts','utf8');
 assert.ok(calendar.includes("value<30?'red':value<=70?'yellow':'green'"));
 assert.ok(!main.includes('astro-legend-item'));
 assert.ok(!main.includes('astro-cal-toolbar'));
 assert.ok(!main.includes('كل الأشهر الاثني عشر ظاهرة'));
 assert.ok(!main.includes('All twelve months are shown'));
 assert.ok(main.includes('function calendarColorLabel('));
 assert.ok(!main.includes('شلون تحدد لون الحظ؟'));
 assert.ok(!main.includes('How is the fortune color determined?'));
 assert.ok(!calendar.includes("'orange'"));
});

test('calendar omits the entire unwanted daily summary, labels and technical appendix',()=>{
 const calendar=main.slice(main.indexOf('function astroCalendarPage(){'),main.indexOf('function calendarTargetDays()'));
 assert.ok(!main.includes('function astroCalendarDetail('));
 assert.ok(!calendar.includes('id="astro-calendar-detail"'));
 for(const text of ['خلاصة مبنية على ثلاث مراجعات للوقت المختار','مؤشر رمزي · 3 أوقات','الفحص: 04 / 12 / 20','مؤشر رمزي مو تنبؤ']){
  assert.ok(!main.includes(text),text);
 }
 assert.ok(!calendar.includes('astro-day-compact-head'));
 assert.ok(!calendar.includes('astro-day-compact-aspects'));
 assert.ok(!calendar.includes('astro-day-main-score'));
 assert.match(calendar,/class="astro-cal-months"/);
 assert.match(calendar,/class="astro-cal-days"/);
 const click=main.slice(main.indexOf('function bindAstroCalendar(){'),main.indexOf('function moonAspectNarrative('));
 assert.match(click,/zonedInstant\(iso\+'T12:00',active\.zone\)/);
 assert.match(click,/navigate\('time'\)/);
});

test('precision calendar samples 3 separately calculated local chart times',()=>{
 const source=readFileSync('src/astroCalendar.ts','utf8');
 assert.ok(source.includes('CALENDAR_SAMPLE_HOURS=[4,12,20]'));
 assert.ok(source.includes('for(const id of primaryBodies)'));
 assert.ok(source.includes('aspects([transit.get(id)!],fixed,at)'));
 assert.ok(main.includes('rating.minimum'));
 assert.ok(main.includes('rating.maximum'));
 assert.ok(!main.includes('colorizeAstroDay(r.evidence)'));
});

test('calendar computations reuse one verified natal chart and never use truncated report data',()=>{
 const start=main.indexOf('function startCalendarWork(){'),end=main.indexOf('function bindAstroCalendar(){',start);
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

test('simple home has the main focus, Moon and exact-event cards without duplicate AI reading',()=>{
 const start=main.indexOf('function focusedToday()'),end=main.indexOf('function focusedCalendar()',start);
 const focus=main.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.ok(focus.includes('mx-focus-hero'));
 assert.ok(!focus.includes('mx-focus-ai'));
 assert.ok(!focus.includes('Short explanation'));
 assert.ok(!focus.includes('aiSnippet'));
 assert.ok(main.includes('function aiPage()'),'Keep separate AI page available');
 assert.ok(focus.includes('mx-focus-moon'));
 assert.ok(focus.includes('Upcoming events · all planets'));
 assert.ok(!focus.includes('mx-focus-metrics')&&!focus.includes('Two additional signals'));
 assert.ok(main.includes('unique.find(x=>Math.abs(+x.at-+e.at)<60000&&x.reading.kind===e.reading.kind&&'));
 assert.ok(focus.includes('currentWholeSky()'));
 assert.ok(focus.includes('data-sky-reading-id'));
 assert.ok(focus.includes('mx-sky-live-checked'));
 assert.ok(!focus.includes('orb.toFixed')&&!focus.includes('momentProof'));
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

test('public place and time zone labels show city only, preserving IANA values for calculations',async()=>{
 const {timezoneCityLabel,placeCityLabel}=await import('../src/placeDisplay.ts');
 assert.equal(timezoneCityLabel('Asia/Baghdad'),'Baghdad');
 assert.equal(timezoneCityLabel('Asia/Manila'),'Manila');
 assert.equal(timezoneCityLabel('America/Denver'),'Denver');
 assert.equal(timezoneCityLabel('America/Argentina/Buenos_Aires'),'Buenos Aires');
 assert.equal(timezoneCityLabel('Etc/UTC'),'UTC');
 assert.equal(placeCityLabel('Baghdad, Baghdad Governorate, Iraq'),'Baghdad');
 assert.equal(placeCityLabel('Manila, Metro Manila, Philippines'),'Manila');
 assert.equal(placeCityLabel('بغداد, بغداد, العراق'),'بغداد');
 assert.ok(main.includes("esc(timezoneCityLabel(z))"));
 assert.ok(main.includes("new Option(timezoneCityLabel(city.zone),city.zone)"));
 assert.ok(main.includes("zone.value=city.zone"));
 assert.ok(main.includes("item.textContent=city.name"));
 assert.ok(main.includes("chosen.textContent=city.name"));
 assert.ok(!main.includes("item.textContent=city.label+' · '+city.zone"));
 assert.ok(!main.includes("esc(active.zone)"));
});

test('expanded live sky wheel shows only the timestamp and interactive wheel, without redundant titles and notes',()=>{
 const start=main.indexOf('const expandSky=()=>');
 const end=main.indexOf("on('expand-sky-wheel',expandSky)",start);
 assert.ok(start>0&&end>start);
 const modal=main.slice(start,end);
 for(const phrase of ['✦ MX ASTRO · LIVE SKY','سماء اللحظة · الدائرة المكبرة','Current sky · Expanded wheel','مواضع فلكية محسوبة بالزودياك الاستوائي. معانيها تنجيمية رمزية.','Calculated tropical zodiac positions; interpretations are astrological symbolism.'])assert.ok(!modal.includes(phrase),'Unwanted modal text: '+phrase);
 assert.ok(modal.includes('mx-expanded-sky-time'));
 assert.ok(modal.includes('mx-expanded-wheel'));
 assert.ok(modal.includes('updateLiveSkyWheel(liveSkyLastTick)'));
});

test('People page omits real interaction log card and entry controls while keeping relationship planning',()=>{
 const people=main.slice(main.indexOf('function peoplePage(){'),main.indexOf('function aiPayload(){'));
 for(const removed of ['journalPanel(', 'journal-panel', 'journal-form','سجل التفاعل الحقيقي','Real-world interaction history','Timing windows and private journal'])assert.ok(!people.includes(removed), 'unexpected interaction log surface: '+removed);
 assert.ok(!main.includes('function journalPanel('));
 assert.ok(!main.includes("querySelector<HTMLFormElement>('#journal-form')"));
 assert.ok(!main.includes('[data-journal-delete]'));
 assert.ok(people.includes('relationshipWindowUI(partner)'));
 assert.ok(people.includes("t('أيام التواصل واللقاءات','Communication and meeting windows')"));
 assert.ok(main.includes("journal:readJournal()"),'existing private backup must preserve previously stored data');
});

test('People timeline card advice is computed per local day, not identical canned sentences',()=>{
 const section=main.slice(main.indexOf('function relationshipWindowUI('),main.indexOf('function relationshipFocus('));
 assert.ok(section.includes('relationshipDayReading(day,kind,period,getReport(day.day).signals,used)'));
 assert.ok(section.includes("21,active.zone"));
 assert.ok(section.includes('relation-window-reason'));
 assert.ok(!section.includes('جرب رسالة واحدة واضحة، وراقب الرد الحقيقي بدون إلحاح'));
 assert.ok(!section.includes('اقترح لقاء بسيط بمكان مناسب، وخلي الموافقة متبادلة.'));
});

test('People relationship view has full-width meters, distinct avatars, and the technical appendix last',()=>{
 const p=main.slice(main.indexOf('function peoplePage(){'),main.indexOf('function aiPayload(){'));
 assert.ok(p.includes("technical='<details class=\"panel synastry-technical\""));
 assert.ok(p.includes(":'')+technical+'</div>';"));
 assert.ok(p.includes('partnerCardStory(x,c.dimensions'));
 assert.ok(!p.includes('MX ASTRO · SYNASTRY'));
 assert.ok(!p.includes('التصرف المفيد: '));
 assert.ok(p.includes('mx-people-gauge-track'));
 assert.ok(main.includes('personHue(p.id)'));
 const win=main.slice(main.indexOf('function relationshipWindowUI('),main.indexOf('function relationshipFocus('));
 assert.ok(!win.includes('هاي مقارنة رمزية بين 21 يوم'));
});

test('People cards inherit Go Mode classes and break down to readable mobile columns',()=>{
 const people=main.slice(main.indexOf('function peoplePage(){'),main.indexOf('function aiPayload(){'));
 assert.ok(main.includes("import './peopleCards.css';"));
 assert.ok(people.includes('mx-people-page'));
 assert.ok(people.includes('partner-score metric-card'));
 assert.ok(people.includes('partner-insight metric-card'));
 assert.ok(people.includes('person-card metric-card'));
 assert.ok(main.includes('relation-window metric-card'));
 assert.ok(main.includes('mx-brief-card metric-card'));
 assert.ok(people.includes(":'')+technical+'</div>'"));
 const css=readFileSync('src/peopleCards.css','utf8');
 for(const label of ['--metric-accent:#68e0a6','height:6px','@media(max-width:590px)','@media(max-width:410px)','@media(prefers-reduced-motion:reduce)','min-height:44px'])assert.ok(css.includes(label));
});


test('the year calendar stays left-to-right for Arabic and English, preserving weekday chronology',()=>{
 const main=readFileSync('src/main.ts','utf8');
 const css=readFileSync('src/astroCalendar.css','utf8');
 const render=main.slice(main.indexOf('function astroCalendarPage(){'),main.indexOf('function calendarTargetDays()'));
 assert.match(render,/const weekdays=\['Mon','Tue','Wed','Thu','Fri','Sat','Sun'\]/);
 assert.match(render,/class="astro-cal-weekdays" dir="ltr"/);
 assert.match(render,/class="astro-cal-days" dir="ltr"/);
 assert.match(render,/class="astro-cal-months" dir="ltr"/);
 assert.match(render,/class="astro-cal-month panel" dir="ltr"/);
 assert.match(css,/\.astro-cal-months,/);
 assert.match(css,/\.astro-cal-days\{/);
 assert.match(css,/direction:ltr!important/);
});

test('Calendar shows all twelve months immediately and has no show-more control',()=>{
 const main=readFileSync('src/main.ts','utf8');
 const focus=readFileSync('src/focus.css','utf8');
 const cal=readFileSync('src/astroCalendar.css','utf8');
 const surface=main.slice(main.indexOf('function focusedCalendar(){'),main.indexOf('function focusedTime(){'));
 assert.doesNotMatch(surface,/calendar-expand|calendarExpanded|إظهار شهرين|إظهار كل الأشهر/);
 assert.match(surface,/mx-calendar-compact is-expanded/);
 assert.match(main,/calendarDays=firstTwelveCalendarMonths\(astroCalendarDays\(today\)\)/);
 assert.match(main,/function calendarTargetDays\(\):number\{return calendarDays\.length;\}/);
 assert.doesNotMatch(focus,/astro-cal-month:nth-child\(n\+3\)\{display:none\}/);
 assert.match(cal,/\.astro-cal-months\[dir="ltr"\]/);
 const render=main.slice(main.indexOf('function astroCalendarPage(){'),main.indexOf('function calendarTargetDays()'));
 for(const className of ['astro-cal-months','astro-cal-month panel','astro-cal-weekdays','astro-cal-days']){
   assert.match(render,new RegExp('class="'+className+'" dir="ltr" style="direction:ltr!important'));
 }
 assert.match(render,/astroCalendarGridPosition\(initial\.weekday,dayIndex\)/);
 assert.match(render,/grid-column:'\+position\.column/);
 assert.match(render,/grid-row:'\+position\.row/);
 assert.doesNotMatch(render,/const blanks=/);
});
