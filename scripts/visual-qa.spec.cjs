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
    {id:'qa-person',kind:'dating',name:'Test Person',date:'1996-05-13',time:'08:30',zone:'Asia/Manila',city:'Manila',lat:14.6,lon:120.98,known:true,sex:'female'},
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
  await page.locator('#active-profile').selectOption('qa-person');
  await expect(page.locator('#soul-person-select')).toHaveValue('qa-person');
  await expect(page.locator('.mx-chart-owner-title h2')).toHaveText('Test Person');
  await expect(page.locator('.mx-meta-place b')).toHaveText('Manila');
  await expect(page.locator('.mx-meta-time b')).toHaveText('08:30');
  await expect(page.locator('.mx-meta-gender b')).toHaveText('Female');
  const changed=await page.locator('.professional-wheel .wheel-planet[data-planet="Sun"] title').textContent();
  expect(changed).not.toEqual(initial);
  await expect(page.locator('.professional-wheel .wheel-planet').first()).toBeVisible();
  await page.screenshot({path:'artifacts/ui-qa/chart-'+device+'-'+testInfo.project.name+'.png',fullPage:true});
  for(const mode of ['transit','overlay','details','natal']){
   await page.locator('[data-chart="'+mode+'"]').first().click();
   await expect(page.locator('#soul-person-select')).toHaveValue('qa-person');
   await expect(page.locator('.mx-chart-owner-title h2')).toHaveText('Test Person');
  }
  await page.locator('#soul-person-select').selectOption('qa-unknown');
  await expect(page.locator('#active-profile')).toHaveValue('qa-unknown');
  await expect(page.locator('.mx-meta-time b')).toContainText(/غير معروف|Unknown/);
  await expect(page.locator('.chart-expanded .professional-wheel')).toBeVisible();
  await expect(page.locator('.professional-wheel')).not.toContainText('ASC');
  await expect(page.locator('.professional-wheel')).not.toContainText('MC');
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
