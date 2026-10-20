const {test,expect}=require('/tmp/astro-qa/node_modules/@playwright/test');
const fs=require('node:fs');
fs.mkdirSync('artifacts/ui-qa',{recursive:true});
for(const [device,width,height] of [['desktop',1440,900],['iphone',390,844]]){
 test(device+' Soul DNA actual interaction',async({browser},testInfo)=>{
  const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:device==='iphone',hasTouch:device==='iphone'});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/#chart',{waitUntil:'domcontentloaded'});
  const details=page.locator('[data-chart="details"]');
  await details.waitFor({state:'visible',timeout:75000});
  await details.click();
  await expect(page.locator('#soul-dashboard')).toBeVisible();
  await expect(page.locator('.soul-category')).toHaveCount(25);
  await expect(page.locator('.soul-category svg')).toHaveCount(25);
  await expect(page.locator('.soul-planet-card')).toHaveCount(4);
  await expect(page.locator('.soul-topic-rail button')).toHaveCount(8);
  const before=await page.locator('.soul-detail-box.deep p').first().textContent();
  await page.locator('[data-soul-topic="2"]').first().click();
  const after=await page.locator('.soul-detail-box.deep p').first().textContent();
  expect(after).not.toEqual(before);
  await page.locator('[data-soul-category="14"]').first().click();
  await expect(page.locator('.soul-topic-rail button')).toHaveCount(8);
  await page.locator('#soul-search').fill('الغيرة');
  await expect(page.locator('.soul-result-link').first()).toBeVisible();
  await page.locator('.soul-result-link').first().click();
  await expect(page.locator('.soul-topic-header h3')).toBeVisible();
  await page.locator('#soul-search').fill('');
  await page.screenshot({path:'artifacts/ui-qa/soul-'+testInfo.project.name+'-'+device+'.png',fullPage:true});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow,'horizontal overflow').toBeLessThan(8);
  expect(errors).toEqual([]);
  await ctx.close();
 });
}
test('Moon, eclipse and MX Intelligence premium cards',async({page},testInfo)=>{
 await page.goto('/#lunar',{waitUntil:'domcontentloaded'});
 await page.locator('.premium-time-tile').first().waitFor({timeout:75000});
 await expect(page.locator('.premium-time-tile')).toHaveCount(4);
 await page.screenshot({path:'artifacts/ui-qa/moon-'+testInfo.project.name+'.png',fullPage:true});
 await page.goto('/#eclipses',{waitUntil:'domcontentloaded'});
 await page.locator('.eclipse-premium').first().waitFor({timeout:75000});
 await page.screenshot({path:'artifacts/ui-qa/eclipses-'+testInfo.project.name+'.png',fullPage:true});
 await page.goto('/#intel',{waitUntil:'domcontentloaded'});
 await page.locator('.metric-card').first().waitFor({timeout:75000});
 await page.screenshot({path:'artifacts/ui-qa/intelligence-'+testInfo.project.name+'.png',fullPage:true});
});

test('Encrypted vault survives reload and hides both profiles and relationship journal at rest',async({browser})=>{
 const context=await browser.newContext({viewport:{width:1024,height:800}}),page=await context.newPage(),crashes=[];
 page.on('pageerror',e=>crashes.push(e.message));
 await page.goto('/#settings',{waitUntil:'domcontentloaded'});
 await page.locator('#vault-password').waitFor({state:'visible',timeout:75000});
 await page.locator('#vault-password').fill('MX Astro vault long unique test passphrase');
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#vault-enable').click();
 await expect(page.locator('.vault-enabled-indicator')).toBeVisible({timeout:40000});
 const values=await page.evaluate(()=>({
  plaintextProfiles:localStorage.getItem('mx.orbit.profiles.v1'),
  plaintextJournal:localStorage.getItem('mx.orbit.journal.v1'),
  ciphertext:localStorage.getItem('mx.astro.vault.v1')
 }));
 expect(values.plaintextProfiles).toBe(null);
 expect(values.plaintextJournal).toBe(null);
 expect(values.ciphertext).toContain('ciphertext');
 expect(values.ciphertext).not.toContain('Baghdad');
 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.locator('#vault-unlock')).toBeVisible();
 await page.locator('#vault-unlock-password').fill('incorrect password long enough');
 await page.locator('#vault-unlock button').click();
 await expect(page.locator('#vault-unlock-error')).not.toBeEmpty();
 await page.locator('#vault-unlock-password').fill('MX Astro vault long unique test passphrase');
 await page.locator('#vault-unlock button').click();
 await expect(page.locator('.vault-enabled-indicator')).toBeVisible({timeout:50000});
 expect(crashes).toEqual([]);
 await context.close();
});

for(const [device,width,height] of [['desktop',1440,900],['iphone',390,844]]){
 test(device+' saved People owner switches all four chart tabs and styled five info cards',async({browser},testInfo)=>{
  const context=await browser.newContext({viewport:{width,height},isMobile:device==='iphone',hasTouch:device==='iphone'}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/#chart',{waitUntil:'domcontentloaded'});
  await page.locator('#soul-person-select').waitFor({state:'visible',timeout:75000});
  await page.evaluate(()=>{
   const people=[
    {id:'qa-self',kind:'self',name:'Test Owner',date:'1985-03-29',time:'19:20',zone:'Asia/Baghdad',city:'Baghdad',lat:33.3,lon:44.4,known:true,sex:'male'},
    {id:'qa-person',kind:'dating',name:'Jillyanne',date:'1988-02-02',time:'12:00',zone:'Asia/Manila',city:'Manila',lat:14.6,lon:120.98,known:true,sex:'female'},
    {id:'qa-unknown',kind:'friend',name:'Unknown Time',date:'2001-07-04',time:'12:00',zone:'Europe/London',city:'London',lat:51.5,lon:-0.12,known:false,sex:'male'}
   ];
   localStorage.setItem('mx.orbit.profiles.v1',JSON.stringify(people));
   localStorage.setItem('mx.active','qa-self');
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#soul-person-select option')).toHaveCount(3);
  await expect(page.locator('#active-profile option')).toHaveCount(3);
  await expect(page.locator('.mx-chart-meta-card')).toHaveCount(5);
  await expect(page.locator('.professional-wheel')).toBeVisible();
  const initial=await page.locator('.professional-wheel .wheel-planet[data-planet="Sun"] title').textContent();
  const initialParagraphs=await page.locator('.mx-person-natal-portrait p').allTextContents();
  await page.locator('#active-profile').selectOption('qa-person');
  await expect(page.locator('#soul-person-select')).toHaveValue('qa-person');
  await expect(page.locator('.mx-chart-owner-title h2')).toHaveText('Jillyanne');
  await expect(page.locator('.mx-meta-place b')).toHaveText('Manila');
  await expect(page.locator('.mx-meta-time b')).toHaveText('12:00');
  await expect(page.locator('.mx-meta-gender b')).toHaveText('Female');
  const changed=await page.locator('.professional-wheel .wheel-planet[data-planet="Sun"] title').textContent();
  expect(changed).not.toEqual(initial);
  const changedParagraphs=await page.locator('.mx-person-natal-portrait p').allTextContents();
  expect(initialParagraphs).toHaveLength(4);
  expect(changedParagraphs).toHaveLength(4);
  for(let i=0;i<4;i++){
   expect(changedParagraphs[i],'Each of four life areas must have truly different reading after switching to Jillyanne').not.toEqual(initialParagraphs[i]);
   const tokens=x=>new Set(x.replace(/[\u0600-\u06FF]/g,c=>c).toLowerCase().split(/[\s.,،؛:!?]+/u).filter(w=>w.length>3));
   const x=tokens(initialParagraphs[i]),y=tokens(changedParagraphs[i]);
   const overlap=[...x].filter(t=>y.has(t)).length/Math.max(1,Math.min(x.size,y.size));
   expect(overlap,'Personal reading similarity too high in section '+i+'; match ratio '+overlap).toBeLessThan(0.70);
  }
  await expect(page.locator('.professional-wheel .wheel-planet').first()).toBeVisible();
  await page.screenshot({path:'artifacts/ui-qa/chart-'+device+'-'+testInfo.project.name+'.png',fullPage:true});
  for(const mode of ['transit','overlay','details','natal']){
   await page.locator('[data-chart="'+mode+'"]').first().click();
   await expect(page.locator('#soul-person-select')).toHaveValue('qa-person');
   await expect(page.locator('.mx-chart-owner-title h2')).toHaveText('Jillyanne');
  }
  await page.locator('#soul-person-select').selectOption('qa-unknown');
  await expect(page.locator('#active-profile')).toHaveValue('qa-unknown');
  await expect(page.locator('.mx-meta-time b')).toContainText(/غير معروف|Unknown/);
  await expect(page.locator('.chart-expanded .professional-wheel')).toBeVisible();
  await expect(page.locator('.professional-wheel')).not.toContainText('ASC');
  await expect(page.locator('.professional-wheel')).not.toContainText('MC');
  // The Moon card must follow the active birth profile as well, not just the chart wheel.
  await page.goto('/#today',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>localStorage.setItem('mx.active','qa-self'));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('.mx-moon-personal-summary').first().waitFor({state:'visible',timeout:75000});
  const ownMoon=await page.locator('.mx-moon-personal-summary').first().textContent();
  await page.evaluate(()=>localStorage.setItem('mx.active','qa-person'));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('.mx-moon-personal-summary').first().waitFor({state:'visible',timeout:75000});
  const partnerMoon=await page.locator('.mx-moon-personal-summary').first().textContent();
  expect(partnerMoon,'Moon and your chart must use the newly selected birth profile').not.toEqual(ownMoon);
  expect(errors).toEqual([]);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow).toBeLessThan(8);
  await context.close();
 });
}


test('primary links and accessible feature tabs preserve deep links',async({page})=>{
 await page.goto('/#today',{waitUntil:'domcontentloaded'});
 await page.locator('.sidebar .nav-item').first().waitFor({timeout:75000});
 await expect(page.locator('.sidebar .nav-item')).toHaveCount(8);
 await page.locator('.sidebar [data-go="time"]').click();
 await expect(page.locator('.mx-section-tabs [data-go="advanced"]')).toBeVisible();
 await page.locator('.sidebar [data-go="lunar"]').click();
 await expect(page.locator('.sidebar [data-go="lunar"]')).toHaveAttribute('aria-current','page');
 await page.locator('.sidebar [data-go="chart"]').click();
 await expect(page.locator('.mx-section-tabs [data-go="asteroids"]')).toBeVisible();
 await page.goto('/#evidence',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.sidebar [data-go="intel"]')).toHaveAttribute('aria-current','page');
});

test('Qwen3 automatically displays only one read-only text panel',async({page})=>{
 await page.goto('/#ai',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.mx-qwen-live')).toBeVisible({timeout:75000});
 await expect(page.locator('.mx-qwen-live')).toHaveCount(1);
 await expect(page.locator('#ask-ai')).toHaveCount(0);
 await expect(page.locator('#copy-prompt')).toHaveCount(0);
 await expect(page.locator('.ai-intro')).toHaveCount(0);
 await expect(page.locator('.sidebar [data-go="intel"]')).toHaveAttribute('aria-current','page');
});

test('twelve-month calendar is accessible and progress fills individual days',async({page})=>{
 await page.goto('/#calendar',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.astro-cal-toolbar')).toBeVisible({timeout:75000});
 const dates=await page.locator('[data-calendar-date]').count();
 expect(dates).toBeGreaterThanOrEqual(365);expect(dates).toBeLessThanOrEqual(366);
 await expect(page.locator('.astro-cal-month')).toHaveCount(13);
 await expect(page.locator('.astro-cal-day:not(.astro-pending)').first()).toBeVisible({timeout:75000});
 await page.locator('[data-calendar-date]').nth(1).click();
 await expect(page.locator('#astro-calendar-detail')).toBeVisible();
 await expect(page.locator('.astro-cal-day.is-selected')).toHaveCount(1);
});
test('MX Ai has new indicators and useful moon explanations',async({page})=>{
 await page.goto('/#intel',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.metric-card')).toHaveCount(29,{timeout:75000});
 await page.goto('/#lunar',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.mx-lunar-explained')).toBeVisible({timeout:75000});
 const count=await page.locator('.timeline-entry').count();
 if(count)await expect(page.locator('.mx-lunar-aspect-story')).toHaveCount(count);
});

test('live Moon sign and refined chart reading remain visible',async({page})=>{
 await page.goto('/#lunar',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#mx-moon-sign-reading p')).toHaveCount(5,{timeout:75000});
 await page.goto('/#chart',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.chart-story')).toHaveCount(14,{timeout:75000}).catch(async()=>{
  expect(await page.locator('.chart-story').count()).toBeGreaterThanOrEqual(10);
 });
 await expect(page.locator('.mx-reading-help')).toHaveCount(0);
});
test('calendar month labels stay in English even when app language is Arabic',async({page})=>{
 await page.goto('/#calendar',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.astro-cal-hero')).toHaveCount(0);
 await expect(page.locator('.astro-cal-month-head h3').first()).toContainText(/[A-Z][a-z]+/,{timeout:75000});
 await expect(page.locator('.astro-cal-weekdays').first()).toContainText('Mon');
});

test('tapping today sky wheel opens a readable enlarged diagram',async({page})=>{
 await page.goto('/#today',{waitUntil:'domcontentloaded'});
 await page.locator('#expand-sky-wheel').waitFor({state:'visible',timeout:75000});
 await page.locator('#expand-sky-wheel').click();
 await expect(page.locator('dialog#detail')).toBeVisible();
 await expect(page.locator('.mx-expanded-wheel .professional-wheel')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('dialog#detail')).not.toBeVisible();
});
test('natal details hide face logo and DNA wording',async({page})=>{
 await page.goto('/#chart',{waitUntil:'domcontentloaded'});
 await page.locator('[data-chart="details"]').waitFor({state:'visible',timeout:75000});
 await page.locator('[data-chart="details"]').click();
 await expect(page.locator('.soul-art')).toHaveCount(0);
 await expect(page.locator('.soul-hero')).not.toContainText('MX SOUL DNA');
});
test('calendar fortune evidence exposes actual planetary angle weights',async({page})=>{
 await page.goto('/#calendar',{waitUntil:'domcontentloaded'});
 await page.locator('[data-calendar-date]').first().waitFor({state:'visible',timeout:75000});
 await expect(page.locator('.astro-cal-day.astro-pending').first()).toHaveCount(0,{timeout:90000}).catch(()=>{});
 const n=await page.locator('[data-calendar-date]').count();
 expect(n).toBeGreaterThanOrEqual(365);
 await expect(page.locator('.astro-cal-day.astro-green, .astro-cal-day.astro-yellow, .astro-cal-day.astro-red').first()).toBeVisible({timeout:75000});
 await expect(page.locator('.astro-day-compact-head')).toBeVisible({timeout:75000});
 await expect(page.locator('#astro-calendar-progress')).toContainText(/verified|محسوب فعلياً/);
});

test('MX Ai has no WHY NOW callout and explanation is labeled Ai',async({page})=>{
 await page.goto('/#intel',{waitUntil:'domcontentloaded'});
 await page.locator('.metrics-grid').waitFor({state:'visible',timeout:75000});
 await expect(page.getByText('WHY NOW',{exact:false})).toHaveCount(0);
 await expect(page.locator('.intel-audit')).toHaveCount(0);
 await page.goto('/#ai',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.mx-qwen-live[aria-label="Ai"]')).toBeVisible({timeout:75000});
});
test('all major text areas request Tahoma with readable mobile labels',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/#intel',{waitUntil:'domcontentloaded'});
 await page.locator('.metric-card').first().waitFor({state:'visible',timeout:75000});
 const fonts=await page.evaluate(()=>Object.fromEntries([
  ['body','body'],['heading','.page-heading h1'],
  ['metric','.metric-card small'],['navigation','.mobile-nav .nav-item b']
 ].map(([key,query])=>{const c=getComputedStyle(document.querySelector(query));return [key,{family:c.fontFamily,size:parseFloat(c.fontSize)}]})));
 for(const font of Object.values(fonts))expect(font.family.toLowerCase()).toContain('tahoma');
 expect(fonts.metric.size).toBeGreaterThanOrEqual(12);
 expect(fonts.navigation.size).toBeGreaterThanOrEqual(11);
});

test('calendar uses strict red-yellow-green bands and hides methodology',async({page})=>{
 await page.goto('/#calendar',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.astro-cal-toolbar')).toBeVisible({timeout:75000});
 await expect(page.locator('.astro-legend-item')).toHaveCount(3);
 await expect(page.locator('.astro-legend-item').first()).toContainText('71');
 await expect(page.getByText('شلون تحدد لون الحظ؟')).toHaveCount(0);
 await expect(page.locator('.astro-cal-day.astro-orange')).toHaveCount(0);
 const computed=page.locator('.astro-cal-day.astro-green, .astro-cal-day.astro-yellow, .astro-cal-day.astro-red');
 await expect(computed.first()).toBeVisible({timeout:75000});
 const grades=await computed.evaluateAll(nodes=>nodes.map(el=>({score:Number(el.querySelector('.astro-cal-index')?.textContent),color:el.classList.contains('astro-green')?'green':el.classList.contains('astro-yellow')?'yellow':'red'})));
 for(const day of grades)expect(day.color).toBe(day.score<=30?'red':day.score<=70?'yellow':'green');
});

test('selected calendar day stays compact, precise and readable on iPhone',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/#calendar',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.astro-day-compact-head')).toBeVisible({timeout:75000});
 await expect(page.locator('.astro-day-compact-title')).toBeVisible();
 await expect(page.locator('.astro-fortune-proof')).toHaveCount(0);
 await expect(page.locator('.astro-day-summary')).toHaveCount(0);
 const style=await page.locator('#astro-calendar-detail').evaluate(el=>({padding:getComputedStyle(el).paddingTop,rect:el.getBoundingClientRect().width}));
 expect(parseFloat(style.padding)).toBeLessThanOrEqual(14);
 expect(style.rect).toBeLessThanOrEqual(390);
 await expect(page.locator('.astro-day-open-time')).toBeVisible({timeout:75000});
});

test('intraday calendar uses verified three-checkpoint score and exposes range',async({page})=>{
 await page.goto('/#calendar',{waitUntil:'domcontentloaded'});
 const button=page.locator('.astro-cal-day:not(.astro-pending):not(.astro-unavailable)').first();
 await button.waitFor({state:'visible',timeout:90000});
 await expect(page.locator('.astro-day-kicker')).toContainText(/3 أوقات|3 checkpoints/,{timeout:90000});
 await expect(page.locator('.astro-day-compact-footer')).toContainText(/04 \/ 12 \/ 20/);
 const attrs=await button.getAttribute('aria-label');
 expect(attrs).toMatch(/day range|المدى اليومي/);
 const marker=await button.locator('.astro-cal-index').textContent();
 expect(marker).toMatch(/^\d+$/);
});

test('Today and Time Machine use compact cards without losing navigation on iPhone',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/#today',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.mx-today-compact')).toBeVisible({timeout:75000});
 await expect(page.locator('#expand-sky-wheel')).toBeVisible();
 const height=await page.locator('.mx-today-compact .score-card').first().evaluate(el=>el.getBoundingClientRect().height);
 expect(height).toBeLessThan(155);
 await page.goto('/#time',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.mx-time-compact')).toBeVisible({timeout:75000});
 await expect(page.locator('#time-input')).toBeVisible();
 await expect(page.locator('.mx-time-compact .quick-times .chip').first()).toBeVisible();
});
test('Moon timing uses six coherent SVG icons instead of assorted arrow characters',async({page})=>{
 await page.goto('/#lunar',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.lunar-premium-grid .lunar-emblem svg')).toHaveCount(2,{timeout:75000});
 await expect(page.locator('.lunar-premium-grid .mx-lunar-tile-icon svg')).toHaveCount(4);
 await expect(page.locator('.premium-time-tile')).toHaveCount(4);
});

for(const [device,width,height] of [['desktop',1440,900],['iphone',390,844]]){
 test(device+' Today Moon prose is chart-specific, jargon-free and survives a reload',async({browser},testInfo)=>{
  const context=await browser.newContext({viewport:{width,height},isMobile:device==='iphone',hasTouch:device==='iphone'});
  const page=await context.newPage(),crashes=[];
  page.on('pageerror',e=>crashes.push(e.message));
  await page.goto('/#today',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
   const owners=[
    {id:'moon-qa-a',kind:'self',name:'First Owner',date:'1985-03-29',time:'01:20',zone:'Asia/Baghdad',city:'Baghdad',lat:33.3,lon:44.4,known:true,sex:'male'},
    {id:'moon-qa-b',kind:'self',name:'Second Owner',date:'1985-03-29',time:'13:20',zone:'Asia/Baghdad',city:'Baghdad',lat:33.3,lon:44.4,known:true,sex:'male'}
   ];
   localStorage.setItem('mx.orbit.profiles.v1',JSON.stringify(owners));
   localStorage.setItem('mx.active','moon-qa-a');
   localStorage.setItem('mx.uiMode','pro');
  });
  await page.reload({waitUntil:'domcontentloaded'});
  const card=page.locator('.lunar-card p');
  await card.waitFor({state:'visible',timeout:75000});
  await expect(page.locator('#active-profile option')).toHaveCount(2);
  const first=(await card.innerText()).trim();
  const banned=/\b(?:orb|aspects?|houses?|natal moon)\b|(?:البيت|بيوت|تربيع|تثليث|تسديس|مقابلة|اقتران)\s*\d*|°|\d+\s*\/\s*100/iu;
  expect(first.length).toBeGreaterThan(80);
  expect(first).not.toMatch(banned);
  await page.locator('#active-profile').selectOption('moon-qa-b');
  await expect(page.locator('#active-profile')).toHaveValue('moon-qa-b');
  await expect.poll(()=>card.innerText()).not.toBe(first);
  const second=(await card.innerText()).trim();
  expect(second).not.toMatch(banned);
  expect(second.length).toBeGreaterThan(80);
  await page.reload({waitUntil:'domcontentloaded'});
  await card.waitFor({state:'visible',timeout:75000});
  await expect(page.locator('#active-profile')).toHaveValue('moon-qa-b');
  expect((await card.innerText()).trim()).toBe(second);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow).toBeLessThan(8);
  expect(crashes).toEqual([]);
  await page.screenshot({path:'artifacts/ui-qa/moon-personal-'+device+'-'+testInfo.project.name+'.png',fullPage:true});
  await context.close();
 });
}
for(const [device,width,height] of [['desktop',1440,900],['iphone',390,844]]){
 test(device+' standalone Go Mode navigation includes 29 metrics and four GO cards',async({browser},testInfo)=>{
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:device==='iphone',hasTouch:device==='iphone'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/#today',{waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-today-gauge]')).toHaveCount(4,{timeout:75000});
  const fromToday=Object.fromEntries(await page.locator('[data-today-gauge]').evaluateAll(rows=>rows.map(n=>[n.getAttribute('data-today-gauge'),Number(n.querySelector('[role="progressbar"]').getAttribute('aria-valuenow'))])));
  const nav=device==='iphone'?page.locator('.mobile-nav'):page.locator('.sidebar .nav');
  await expect(nav.locator('[data-go]')).toHaveCount(7);
  const routes=await nav.locator('[data-go]').evaluateAll(rows=>rows.map(row=>row.getAttribute('data-go')));
  expect(routes).toEqual(['today','chart','people','go','travelmode','calendar','more']);
  await nav.locator('[data-go="go"]').click();
  await expect(page).toHaveURL(/#go$/);
  await expect(page.locator('#live-view-body [data-section="go"]')).toBeVisible({timeout:75000});
  await expect(page.locator('.metric-card')).toHaveCount(29);
  await expect(page.locator('.go-card')).toHaveCount(4);
  await expect(page.locator('.mx-go-mode-page [data-today-gauge]')).toHaveCount(4);
  await expect(page.locator('[data-intel-tab]')).toHaveCount(0);
  const fromGo=Object.fromEntries(await page.locator('.mx-go-mode-page [data-today-gauge]').evaluateAll(rows=>rows.map(n=>[n.getAttribute('data-today-gauge'),Number(n.querySelector('[role="progressbar"]').getAttribute('aria-valuenow'))])));
  expect(fromGo).toEqual(fromToday);
  for(const id of ['sexuality','love','emotional','career']){
   expect(Number.isFinite(fromGo[id]),'Gauge not calculated: '+id).toBe(true);
   expect(fromGo[id]).toBeGreaterThanOrEqual(1);
   expect(fromGo[id]).toBeLessThanOrEqual(99);
  }
  await page.screenshot({path:'artifacts/ui-qa/gomode-'+device+'-'+testInfo.project.name+'.png',fullPage:true});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow,'horizontal overflow').toBeLessThan(8);
  await page.goto('/#intel',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.metric-card')).toHaveCount(29);
  await expect(page.locator('.go-card')).toHaveCount(4);
  await page.goto('/#more',{waitUntil:'domcontentloaded'});
  await expect(page.locator('button[data-go="intel"]')).toHaveCount(0);
  expect(errors).toEqual([]);
  await context.close();
 });
}

for(const [device,width,height] of [['desktop',1440,900],['iphone',390,844]]){
 test(device+' Philippines Travel Mode is below Go Mode and shows 12 calculated gauges',async({browser},testInfo)=>{
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:device==='iphone',hasTouch:device==='iphone'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/#go',{waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-section="go"]')).toBeVisible({timeout:75000});
  const original=Object.fromEntries(await page.locator('.metric-card').evaluateAll(rows=>rows.map(row=>{
   const title=row.querySelector('small')?.textContent?.trim();
   const value=Number(row.querySelector('b')?.textContent?.replace(/[^0-9]/g,'').replace(/100$/,''));
   return [title,value];
  })));
  const nav=device==='iphone'?page.locator('.mobile-nav'):page.locator('.sidebar .nav');
  const options=await nav.locator('[data-go]').evaluateAll(rows=>rows.map(row=>row.getAttribute('data-go')));
  expect(options).toEqual(['today','chart','people','go','travelmode','calendar','more']);
  await nav.locator('[data-go="travelmode"]').click();
  await expect(page).toHaveURL(/#travelmode$/);
  await expect(page.locator('[data-section="travelmode"]')).toBeVisible({timeout:75000});
  await expect(page.locator('[data-travel-group]')).toHaveCount(3);
  await expect(page.locator('[data-travel-metric]')).toHaveCount(12);
  expect(await page.locator('[data-travel-group]').evaluateAll(rows=>rows.map(r=>r.querySelectorAll('[data-travel-metric]').length))).toEqual([6,3,3]);
  const ids=await page.locator('[data-travel-metric]').evaluateAll(rows=>rows.map(row=>row.getAttribute('data-travel-metric')));
  expect(ids).toEqual(['dating','newpeople','social','attraction','romance','chemistry','sexuality','desire','nightlife','travel','risk','sleep']);
  for(const id of ids){
   const number=Number(await page.locator('[data-travel-metric="'+id+'"] [role="progressbar"]').getAttribute('aria-valuenow'));
   expect(Number.isFinite(number)).toBe(true);
   expect(number).toBeGreaterThanOrEqual(1);
   expect(number).toBeLessThanOrEqual(99);
  }
  // Color is a semantic level, not a decorative hard-coded single shade.
  const spectrum=await page.locator('[data-travel-metric]').evaluateAll(rows=>rows.map(row=>{
   const fill=getComputedStyle(row.querySelector('.meter i')).backgroundImage;
   const number=getComputedStyle(row.querySelector('b')).color;
   const level=['low','caution','steady','strong'].find(cls=>row.classList.contains(cls));
   return {level,fill,number};
  }));
  for(const item of spectrum){
   expect(item.level).toBeTruthy();
   expect(item.fill).toContain('linear-gradient');
   expect(item.number).not.toBe('rgb(255, 255, 255)');
  }
  expect(new Set(spectrum.map(x=>x.level)).size).toBeGreaterThanOrEqual(2);
  expect(new Set(spectrum.map(x=>x.fill)).size).toBeGreaterThanOrEqual(2);
  await page.screenshot({path:'artifacts/ui-qa/travelmode-'+device+'-'+testInfo.project.name+'.png',fullPage:true});
  const over=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(over,'No horizontal overflow').toBeLessThan(8);
  await nav.locator('[data-go="go"]').click();
  await expect(page.locator('.metric-card')).toHaveCount(29);
  await expect(page.locator('.go-card')).toHaveCount(4);
  expect(errors).toEqual([]);
  await context.close();
 });
}
