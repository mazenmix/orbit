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
 await expect(page.locator('.eclipse-premium')).toHaveCount(2); // nearest one of each kind
 await expect(page.locator('.eclipse-countdown')).toHaveCount(2);
 await expect(page.locator('.eclipse-countdown-unit')).toHaveCount(10); // month/day/hour/minute/second per card
 await expect(page.locator('.eclipse-countdown-unit [data-eclipse-unit="seconds"]')).toHaveCount(2);
 const initialSeconds=await page.locator('.eclipse-countdown-unit [data-eclipse-unit="seconds"]').first().textContent();
 expect(initialSeconds).toMatch(/^\d{2}$/);
 await expect(page.locator('.eclipse-live-countdown')).toHaveCount(2);
 await expect(page.locator('.eclipse-geography')).toHaveCount(2);
 await expect(page.locator('.eclipse-overview')).toHaveCount(0);
 await expect(page.locator('.eclipse-countdown[data-eclipse-to]')).toHaveCount(2);
 await expect(page.locator('.page-heading h1')).toHaveCount(0);
 const eclipseTimestamps=await page.locator('.eclipse-countdown').evaluateAll(nodes=>nodes.map(el=>Number(el.getAttribute('data-eclipse-to'))));
 expect(eclipseTimestamps.every(time=>Number.isFinite(time)&&time>Date.now())).toBe(true);
 // Both wide and narrow screens must retain five evenly aligned boxes in one row.
 const initialViewport=page.viewportSize();
 for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:720}]){
  await page.setViewportSize(viewport);
  const geometry=await page.locator('.eclipse-countdown-grid').evaluateAll(grids=>grids.filter(grid=>getComputedStyle(grid).display!=='none'&&grid.getBoundingClientRect().width>0).map(grid=>{
   const parent=grid.getBoundingClientRect(),boxes=Array.from(grid.children).map(child=>child.getBoundingClientRect());
   return {count:boxes.length,sameRow:boxes.every(box=>Math.abs(box.top-boxes[0].top)<2),within:boxes.every(box=>box.left>=parent.left-2&&box.right<=parent.right+2),height:Math.max(...boxes.map(box=>box.height))};
  }));
  expect(geometry.length,'at least one visible upcoming eclipse countdown').toBeGreaterThan(0);
  expect(geometry.every(g=>g.count===5&&g.sameRow&&g.within),'five boxes stay aligned without overflow at '+viewport.width+'px').toBe(true);
  expect(geometry.every(g=>g.height<=64),'countdown units should stay compact').toBe(true);
 }
 if(initialViewport)await page.setViewportSize(initialViewport);
 await page.screenshot({path:'artifacts/ui-qa/eclipses-'+testInfo.project.name+'.png',fullPage:true});
 await page.goto('/#time',{waitUntil:'domcontentloaded'});
 await page.locator('.heatmap-cell').first().waitFor({timeout:75000});
 await expect(page.locator('.rhythm')).toHaveCount(0);
 await expect(page.locator('.heatmap-summary')).toHaveCount(0);
 const classified=await page.locator('.heatmap-cell').evaluateAll(cells=>cells.length>0&&cells.every(c=>{
  const value=Number(c.querySelector('b')?.textContent);
  const band=value<=25?'red':value<=45?'orange':value<=65?'yellow':'green';
  return c.classList.contains('heatmap-'+band);
 }));
 expect(classified,'every displayed heatmap value gets the right discrete color').toBe(true);
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


test('Moon is a standard-size navigation option after Today, without duplicate tabs',async({page})=>{
 await page.goto('/#today',{waitUntil:'domcontentloaded'});
 await page.locator('.sidebar .nav-item').first().waitFor({timeout:75000});
 const buttons=page.locator('.sidebar .nav > .nav-item');
 await expect(buttons).toHaveCount(8);
 await expect(buttons.nth(0)).toHaveAttribute('data-go','today');
 await expect(buttons.nth(1)).toHaveAttribute('data-go','lunar');
 await expect(buttons.nth(1)).toContainText('القمر');
 await expect(page.locator('.mx-section-tabs')).toHaveCount(0);
 const style=await buttons.nth(1).evaluate(el=>{
  const siblings=Array.from(el.parentElement.children);
  const baseline=getComputedStyle(siblings[2]);
  const moon=getComputedStyle(el);
  return {
   equalPadding:moon.padding===baseline.padding,
   equalFont:moon.fontSize===baseline.fontSize,
   equalHeight:Math.abs(el.getBoundingClientRect().height-siblings[2].getBoundingClientRect().height)<2,
   equalMargin:moon.margin===baseline.margin
  };
 });
 expect(style,'Moon must match other primary nav items').toEqual({equalPadding:true,equalFont:true,equalHeight:true,equalMargin:true});
 await buttons.nth(1).click();
 await expect(page).toHaveURL(/#lunar$/);
 await expect(page.locator('.sidebar [data-go="lunar"]')).toHaveAttribute('aria-current','page');
 await expect(page.locator('.sidebar [data-go="today"]')).not.toHaveAttribute('aria-current','page');
 await expect(page.locator('.lunar-premium-grid')).toBeVisible({timeout:75000});
 await expect(page.locator('.mx-section-tabs')).toHaveCount(0);
 await page.locator('.sidebar [data-go="today"]').click();
 await expect(page).toHaveURL(/#today$/);
 await page.evaluate(()=>localStorage.setItem('mx.uiMode','pro'));
 await page.reload();
 await expect(page.locator('.sidebar [data-go="lunar"]')).toBeVisible();
 await expect(page.locator('.mx-section-tabs')).toHaveCount(0);
 await page.locator('.sidebar [data-go="calendar"]').click();
 await expect(page.locator('.mx-section-tabs [data-go="advanced"]')).toBeVisible({timeout:75000});
 await expect(page.locator('.mx-section-tabs [data-go="lunar"]')).toHaveCount(0);
});
test('Moon has the same full-size mobile navigation button and opens the original lunar page',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/#today',{waitUntil:'domcontentloaded'});
 const nav=page.locator('.mobile-nav');
 await expect(nav.locator('.nav-item')).toHaveCount(8);
 await expect(nav.locator('.nav-item').nth(1)).toHaveAttribute('data-go','lunar');
 await expect(nav.locator('.nav-item').nth(1)).toContainText('القمر');
 await expect(page.locator('.mx-section-tabs')).toHaveCount(0);
 await nav.locator('[data-go="lunar"]').click();
 await expect(page).toHaveURL(/#lunar$/);
 await expect(page.locator('.lunar-premium-grid')).toBeVisible({timeout:75000});
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

test('calendar shows twelve ordered month cards and dates on Monday-first LTR columns',async({page})=>{
 await page.goto('/#calendar',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.astro-cal-toolbar')).toBeVisible({timeout:75000});
 await expect(page.locator('.astro-cal-month')).toHaveCount(12);
 await expect(page.locator('#astro-calendar-detail')).toHaveCount(0);
 await expect(page.locator('#calendar-expand')).toHaveCount(0);
 const count=await page.locator('[data-calendar-date]').count();
 expect(count).toBeGreaterThan(300);
 await expect(page.locator('.astro-cal-day:not(.astro-pending)').first()).toBeVisible({timeout:75000});
 const layout=await page.evaluate(()=>{
  const months=[...document.querySelectorAll('.astro-cal-month')];
  const first=months[0],second=months[1];
  const start=first.querySelector('.astro-cal-weekdays>span'),end=first.querySelector('.astro-cal-weekdays>span:last-child');
  const cells=[...first.querySelectorAll('[data-calendar-date]')];
  return {
   monthOrder: months.slice(0,2).map(m=>m.querySelector('.astro-cal-month-head h3')?.textContent),
   monthX: [first.getBoundingClientRect().x,second.getBoundingClientRect().x],
   firstWeekdayX:start.getBoundingClientRect().x,
   lastWeekdayX:end.getBoundingClientRect().x,
   cells:cells.slice(0,3).map(el=>({iso:el.getAttribute('data-calendar-date'),col:Number(getComputedStyle(el).gridColumnStart)}))
  }
 });
 expect(layout.firstWeekdayX).toBeLessThan(layout.lastWeekdayX);
 if(Math.abs(layout.monthX[0]-layout.monthX[1])>5)expect(layout.monthX[0]).toBeLessThan(layout.monthX[1]);
 for(const item of layout.cells)expect(item.col).toBe((new Date(item.iso+'T00:00:00Z').getUTCDay()+6)%7+1);
 await page.locator('[data-calendar-date]').nth(1).click();
 await expect(page.locator('.mx-time-compact')).toBeVisible({timeout:75000});
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
  await expect(page.locator('.mx-today-sky svg.chart-wheel')).toBeVisible({timeout:75000});
  await expect(page.locator('[data-today-gauge]')).toHaveCount(0);
  const nav=device==='iphone'?page.locator('.mobile-nav'):page.locator('.sidebar .nav');
  await expect(nav.locator('[data-go]')).toHaveCount(8);
  const routes=await nav.locator('[data-go]').evaluateAll(rows=>rows.map(row=>row.getAttribute('data-go')));
  expect(routes).toEqual(['today','lunar','chart','people','go','travelmode','calendar','more']);
  await nav.locator('[data-go="go"]').click();
  await expect(page).toHaveURL(/#go$/);
  await expect(page.locator('#live-view-body [data-section="go"]')).toBeVisible({timeout:75000});
  await expect(page.locator('.mx-go-mode-indicators .metric-card')).toHaveCount(29);
  await expect(page.locator('.go-card')).toHaveCount(4);
  await expect(page.locator('.mx-go-mode-page [data-today-gauge]')).toHaveCount(4);
  await expect(page.locator('[data-intel-tab]')).toHaveCount(0);
  const fromGo=Object.fromEntries(await page.locator('.mx-go-mode-page [data-today-gauge]').evaluateAll(rows=>rows.map(n=>[n.getAttribute('data-today-gauge'),Number(n.querySelector('[role="progressbar"]').getAttribute('aria-valuenow'))])));
  expect(Object.keys(fromGo).sort()).toEqual(['career','emotional','love','sexuality']);
  for(const id of ['sexuality','love','emotional','career']){
   expect(Number.isFinite(fromGo[id]),'Gauge not calculated: '+id).toBe(true);
   expect(fromGo[id]).toBeGreaterThanOrEqual(1);
   expect(fromGo[id]).toBeLessThanOrEqual(99);
  }
  await page.screenshot({path:'artifacts/ui-qa/gomode-'+device+'-'+testInfo.project.name+'.png',fullPage:true});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow,'horizontal overflow').toBeLessThan(8);
  await page.goto('/#intel',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.mx-go-mode-indicators .metric-card')).toHaveCount(29);
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
  // The reference is the four compact Sex/Love/Emotions/Work gauges above
  // Go Mode, NOT the larger 29-indicator metric-card template.
  const quickStyle=rows=>rows.map(row=>{
   const el=getComputedStyle(row),label=getComputedStyle(row.querySelector('b')),
    number=getComputedStyle(row.querySelector('strong')),
    icon=getComputedStyle(row.querySelector('.mx-today-gauge-icon')),
    track=getComputedStyle(row.querySelector('.mx-today-gauge-track')),
    fill=getComputedStyle(row.querySelector('.mx-today-gauge-track i'));
   return [row.getAttribute('data-indicator-id'),{
    level:['low','caution','steady','strong'].find(k=>row.classList.contains(k)),
    value:Number(row.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')),
    width:Math.round(row.getBoundingClientRect().width*10)/10,
    padding:el.padding,radius:el.borderRadius,border:el.borderColor,background:el.backgroundColor,
    labelFont:label.fontSize,numberFont:number.fontSize,numberColor:number.color,
    iconFont:icon.fontSize,iconColor:icon.color,trackHeight:track.height,
    trackBg:track.backgroundColor,fillColor:fill.backgroundColor
   }];
  });
  const goQuick=Object.fromEntries(await page.locator('.mx-go-mode-page .mx-today-gauges [data-today-gauge]').evaluateAll(quickStyle));
  expect(Object.keys(goQuick)).toHaveLength(4);
  const goMetricValues=Object.fromEntries(await page.locator('.mx-go-mode-indicators [data-indicator-id]').evaluateAll(rows=>
   rows.map(row=>[row.getAttribute('data-indicator-id'),Number.parseInt(row.querySelector('b')?.textContent??'',10)])));
  const nav=device==='iphone'?page.locator('.mobile-nav'):page.locator('.sidebar .nav');
  const options=await nav.locator('[data-go]').evaluateAll(rows=>rows.map(row=>row.getAttribute('data-go')));
  expect(options).toEqual(['today','lunar','chart','people','go','travelmode','calendar','more']);
  await nav.locator('[data-go="travelmode"]').click();
  await expect(page).toHaveURL(/#travelmode$/);
  await expect(page.locator('[data-section="travelmode"]')).toBeVisible({timeout:75000});
  await expect(page.locator('[data-travel-group]')).toHaveCount(3);
  await expect(page.locator('[data-travel-metric]')).toHaveCount(12);
  const travelStyle=Object.fromEntries(await page.locator('[data-travel-metric]').evaluateAll(quickStyle));
  const reference=goQuick.sexuality;
  expect(reference).toBeTruthy();
  for(const [id,seen] of Object.entries(travelStyle)){
   expect(seen.value,'Travel index '+id+' differs from Go Mode').toEqual(goMetricValues[id]);
   for(const property of ['padding','radius','border','background','labelFont','numberFont','numberColor','iconFont','iconColor','trackHeight','trackBg']){
    expect(seen[property],'Travel compact card differs from the four Go Mode quick gauges: '+id+' / '+property).toEqual(reference[property]);
   }
   expect(Math.abs(seen.width-reference.width),'Compact card width mismatch for '+id).toBeLessThanOrEqual(1);
   const matchingLevel=Object.values(goQuick).find(g=>g.level===seen.level);
   if(matchingLevel)expect(seen.fillColor,'Bar color mismatch for '+id).toEqual(matchingLevel.fillColor);
  }
  expect(await page.locator('[data-travel-group]').evaluateAll(rows=>rows.map(r=>r.querySelectorAll('[data-travel-metric]').length))).toEqual([6,3,3]);
  const ids=await page.locator('[data-travel-metric]').evaluateAll(rows=>rows.map(row=>row.getAttribute('data-travel-metric')));
  expect(ids).toEqual(['dating','newpeople','social','attraction','romance','chemistry','sexuality','desire','nightlife','travel','risk','sleep']);
  for(const id of ids){
   const number=Number(await page.locator('[data-travel-metric="'+id+'"] [role="progressbar"]').getAttribute('aria-valuenow'));
   expect(Number.isFinite(number)).toBe(true);
   expect(number).toBeGreaterThanOrEqual(1);
   expect(number).toBeLessThanOrEqual(99);
  }
  // Compact cards retain the quick gauge's level-driven bar colors.
  const levels=Object.values(travelStyle).map(x=>x.level);
  expect(levels.every(Boolean)).toBe(true);
  const expectedColors=new Set(Object.values(travelStyle).map(x=>x.fillColor));
  expect(expectedColors.size).toBeGreaterThanOrEqual(1);
  await page.screenshot({path:'artifacts/ui-qa/travelmode-'+device+'-'+testInfo.project.name+'.png',fullPage:true});
  const over=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(over,'No horizontal overflow').toBeLessThan(8);
  await nav.locator('[data-go="go"]').click();
  await expect(page.locator('.mx-go-mode-indicators .metric-card')).toHaveCount(29);
  await expect(page.locator('.go-card')).toHaveCount(4);
  expect(errors).toEqual([]);
  await context.close();
 });
}

// Actual browser checks, not just DOM-string assertions. Runs on Chromium and
// WebKit (Safari engine) at desktop, tablet and iPhone-sized viewports.
for(const [device,width,height] of [['desktop',1440,900],['tablet',820,1180],['iphone',390,844]]){
 test(device+' compact Today Moon/VOC gauges match live VOC phase and refresh enlarged sky wheel',async({browser})=>{
  const context=await browser.newContext({
   viewport:{width,height},deviceScaleFactor:1,
   isMobile:device==='iphone',hasTouch:device==='iphone'
  });
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/#today',{waitUntil:'domcontentloaded'});
  const wheel=page.locator('#live-view-body .mx-today-sky svg.chart-wheel');
  await wheel.waitFor({state:'visible',timeout:80000});
  await expect(page.locator('#live-view-body .mx-today-sky')).toBeVisible();
  await expect(page.locator('#live-view-body .mx-today-gauges')).toHaveCount(0);
  const panel=await page.locator('.mx-today-sky').boundingBox();
  expect(panel.width,'Today sky should be a compact panel').toBeLessThanOrEqual(500);
  const progress=page.locator('.mx-focus-moon progress');
  await expect(progress).toHaveCount(2);
  const theme=await page.locator('.mx-focus-lunar-status').evaluate(card=>{
   const active=card.classList.contains('is-voc');
   const start=Number(card.getAttribute('data-voc-start'));
   const end=Number(card.getAttribute('data-voc-end'));
   const bg=getComputedStyle(card.querySelector('.mx-focus-moon article')).backgroundImage;
   return {active,expected:Date.now()>=start&&Date.now()<end,
    correctColor:active?bg.includes('117, 42, 72'):bg.includes('19, 100, 76')};
  });
  expect(theme.active,'VOC card follows the calculated Moon phase').toBe(theme.expected);
  expect(theme.correctColor,'Moon progress cards must be crimson only during VOC').toBe(true);
  await expect.poll(()=>wheel.getAttribute('data-sky-calculated-at'),{timeout:16000}).not.toBeNull();
  const first=await wheel.getAttribute('data-sky-calculated-at');
  await expect.poll(()=>wheel.getAttribute('data-sky-calculated-at'),{timeout:16000}).not.toBe(first);
  await page.locator('#expand-sky-wheel').click();
  const dialog=page.locator('#detail[open]');
  await expect(dialog).toBeVisible();
  const enlarged=dialog.locator('.mx-expanded-wheel svg.chart-wheel');
  await expect(enlarged).toBeVisible();
  // The second-hand must tick while the modal is still open. Five-second
  // ephemeris changes alone are not an adequate live-clock experience.
  const modalTime=dialog.locator('.mx-expanded-sky-time');
  const firstSecond=await modalTime.textContent();
  expect(firstSecond).toMatch(/\d{2}:\d{2}:\d{2}/);
  await expect.poll(()=>modalTime.textContent(),{timeout:4500,intervals:[200,400,600,800]}).not.toBe(firstSecond);
  const firstCalculated=await enlarged.getAttribute('data-sky-calculated-at');
  expect(firstCalculated).not.toBeNull();
  const handle=await enlarged.elementHandle(),old=firstCalculated;
  await expect.poll(()=>enlarged.getAttribute('data-sky-calculated-at'),{timeout:16000}).not.toBe(old);
  expect(await handle.evaluate(node=>node.isConnected),'Zoomed wheel element survives real sky refresh').toBe(true);
  await expect(dialog.locator('.mx-expanded-sky-time')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth),'Horizontal overflow').toBeLessThan(9);
  expect(errors,'Browser exceptions during live updates').toEqual([]);
  await context.close();
 });
}
