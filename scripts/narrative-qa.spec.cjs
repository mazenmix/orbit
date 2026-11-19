const {test,expect}=require('/tmp/astro-qa/node_modules/@playwright/test');

test('the career score matches its detail after the annual-house adjustment',async({page})=>{
 await page.clock.install({time:new Date('2026-11-19T10:00:00Z')});
 await page.addInitScript(()=>{
  localStorage.setItem('mx.uiMode','pro');
  localStorage.setItem('mx.language','en');
  localStorage.setItem('mx.orbit.profiles.v1',JSON.stringify([{
   id:'score-owner',name:'Score owner',kind:'self',date:'1985-03-29',time:'19:20',
   zone:'Asia/Baghdad',city:'Baghdad',lat:33.31,lon:44.36,known:true
  }]));
 });
 await page.goto('/#today');
 const career=page.locator('.score-card[data-category="career"] .score-number');
 await expect(career).toContainText('49',{timeout:75000});
 await expect(page.locator('.mx-close-score-note')).toContainText('Close-contact scores');
 await page.locator('.score-card[data-category="career"]').click();
 await page.locator('.signal-card').first().click();
 await expect(page.locator('.detail-score')).toContainText('49/100');
 await page.locator('#close-dialog').click();
 await page.evaluate(()=>{location.hash='/chart'});
 await page.locator('[data-chart="transit"]').click();
 await expect(page.locator('.trend-item').filter({hasText:'Work & decisions'})).toContainText('49');
 await page.evaluate(()=>{location.hash='/evidence'});
 await expect(page.locator('.narrative-heading').filter({hasText:'Work & decisions'})).toContainText('49');
 await expect(page.locator('.insight-lead')).toContainText('close-contact scores');
 await page.evaluate(()=>{location.hash='/go'});
 await expect(page.locator('[data-today-gauge="career"] strong')).toContainText('3/100');
 await expect(page.locator('.go-card').filter({hasText:'Work decision'})).toContainText('38/100');
 await expect(page.locator('.mx-symbolic-index-note')).toContainText('narrower calculation');
 await page.evaluate(()=>{location.hash='/now'});
 await expect(page.locator('[data-now-gauge="today-career"] .mx-now-head b')).toContainText('3/100');
 await expect(page.locator('[data-now-gauge="moon-sign"]')).toContainText('Time elapsed in Moon sign');
});

test('saved chart uses its owner timezone and wording independently of the active self',async({page})=>{
 await page.clock.install({time:new Date('2026-11-09T12:00:00Z')});
 await page.addInitScript(()=>{
  if(!localStorage.getItem('mx.orbit.profiles.v1')){
   const self={id:'demo',name:'Demo',date:'2000-01-01',time:'12:00',zone:'Etc/UTC',lat:51.4779,lon:0,city:'Greenwich',known:false,kind:'self',sex:'male'};
   localStorage.setItem('mx.orbit.profiles.v1',JSON.stringify([self,{...self,id:'owner-fixture',name:'Owner fixture',date:'1994-08-12',time:'23:15',zone:'Asia/Manila',city:'Manila',lat:14.5995,lon:120.9842,known:true,kind:'dating',sex:'female'}]));
  }
  localStorage.setItem('mx.language','en');
 });
 await page.goto('/#chart',{waitUntil:'domcontentloaded'});
 await page.locator('#soul-person-select').waitFor({timeout:75000});
 await page.locator('#soul-person-select').selectOption('owner-fixture');
 await expect(page.locator('.large-wheel > p')).toContainText('23:15');
 await expect(page.locator('#live-page-clock')).toContainText('20:00');
 await expect(page.locator('.demo-notice')).toHaveCount(0);
 await page.locator('#language').click();
 await page.locator('[data-chart="transit"]').click();
 const actions=await page.locator('.chart-transit-summary .trend-item small').allTextContents();
 expect(actions.length).toBeGreaterThan(0);
 await page.evaluate(()=>{
  const profiles=JSON.parse(localStorage.getItem('mx.orbit.profiles.v1'));
  profiles[0].sex='female';localStorage.setItem('mx.orbit.profiles.v1',JSON.stringify(profiles));
 });
 // The owner stays female. Changing only the self must not change her prose.
 await page.reload();await page.locator('#soul-person-select').waitFor({timeout:75000});
 await page.locator('#soul-person-select').selectOption('owner-fixture');
 await page.locator('#language').click();
 await page.locator('[data-chart="transit"]').click();
 expect(await page.locator('.chart-transit-summary .trend-item small').allTextContents()).toEqual(actions);
});

test('daily heatmap shows unique profile dates and real sample times across DST',async({page})=>{
 await page.clock.install({time:new Date('2026-10-31T06:30:00Z')});
 await page.addInitScript(()=>{
  localStorage.setItem('mx.uiMode','pro');localStorage.setItem('mx.language','en');
  localStorage.setItem('mx.orbit.profiles.v1',JSON.stringify([{id:'dst-self',name:'DST fixture',date:'2000-01-01',time:'12:00',zone:'America/Denver',lat:39.7392,lon:-104.9903,city:'Denver',known:true,kind:'self'}]));
 });
 await page.goto('/#time',{waitUntil:'domcontentloaded'});
 await page.locator('.heatmap-cell').first().waitFor({timeout:75000});
 const cells=page.locator('.heatmap-cell');
 const dates=await cells.locator('small:first-child').allTextContents();
 expect(new Set(dates).size).toBe(30);
 await expect(cells.nth(2)).toHaveAttribute('title',/02 Nov.*00:30.*Denver/);
 await expect(page.locator('.mx-heatmap-method')).toContainText('One sample per calendar day');
});

test('saved-city eclipse visibility works with the actual Swiss WASM instance',async({page})=>{
 await page.goto('/#eclipses',{waitUntil:'domcontentloaded'});
 await page.locator('#check-local-eclipses').waitFor({timeout:75000});
 await page.locator('#check-local-eclipses').click();
 await expect(page.locator('#detail')).toBeVisible();
 await expect(page.locator('.eclipse-local-row')).toHaveCount(2);
 await expect(page.locator('#dialog-content')).not.toContainText(/undefined|TypeError/);
});

test('unknown birth time does not produce an exact solar return or progressed Moon interpretation',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('mx.language','en');
  localStorage.setItem('mx.orbit.profiles.v1',JSON.stringify([{id:'unknown-fixture',name:'Unknown fixture',date:'2000-01-01',time:'00:00',zone:'Etc/UTC',lat:51.4779,lon:0,city:'Greenwich',known:false,kind:'self'}]));
 });
 await page.goto('/#advanced',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#main')).toContainText('no minute-precise solar return',{timeout:75000});
 await expect(page.locator('.mx-advanced-reading')).toHaveCount(0);
 await expect(page.locator('#main')).not.toContainText('Exact Solar Return');
});

test('daily partner cards stay unavailable when a compared domain has no calculated contact',async({page})=>{
 await page.clock.install({time:new Date('2026-01-07T12:00:00Z')});
 await page.addInitScript(()=>{
  const self={id:'coverage-self',name:'Coverage self',date:'2000-01-01',time:'12:00',zone:'Etc/UTC',lat:51.4779,lon:0,city:'Greenwich',known:true,kind:'self'};
  localStorage.setItem('mx.uiMode','pro');
  localStorage.setItem('mx.orbit.profiles.v1',JSON.stringify([self,{...self,id:'coverage-partner',name:'Coverage partner',date:'1994-08-12',kind:'dating'}]));
 });
 await page.goto('/#people',{waitUntil:'domcontentloaded'});
 await page.locator('[data-compare="coverage-partner"]').waitFor({timeout:75000});
 await page.locator('[data-compare="coverage-partner"]').click();
 for(const id of ['date','initiative','contactTiming']){
  const card=page.locator('[data-partner-insight="'+id+'"]');
  await expect(card).toHaveClass(/mx-unavailable/);
  await expect(card.locator('.mx-people-gauge')).toHaveCount(0);
  await expect(card).toContainText('—');
 }
 await expect(page.locator('[data-partner-insight="desire"] .mx-people-gauge')).toHaveCount(1);
});

test('symbolic gauges disclose their meaning and GO sections remain siblings',async({page})=>{
 for(const route of ['now','go','travelmode']){
  await page.goto('/#'+route,{waitUntil:'domcontentloaded'});
  await expect(page.locator('.mx-symbolic-index-note')).toBeVisible({timeout:75000});
  await expect(page.locator('.mx-symbolic-index-note')).toContainText(/مو احتمالات|not probabilities/);
  if(route==='go'){
   await expect(page.locator('.mx-go-mode-page > .mx-go-mode-decisions')).toHaveCount(1);
   await expect(page.locator('.mx-go-mode-page > .mx-go-mode-indicators')).toHaveCount(1);
  }
 }
});

test('friend communication windows do not require romantic dimensions',async({page})=>{
 await page.addInitScript(()=>{
  const self={id:'audit-self',name:'Audit self',date:'2000-01-01',time:'12:00',zone:'Etc/UTC',lat:51.4779,lon:0,city:'Greenwich',known:true,kind:'self'};
  localStorage.setItem('mx.orbit.profiles.v1',JSON.stringify([self,{...self,id:'audit-friend',name:'Audit friend',date:'1994-08-12',kind:'friend'}]));
 });
 await page.goto('/#people',{waitUntil:'domcontentloaded'});
 await page.locator('[data-compare="audit-friend"]').waitFor({timeout:75000});
 await page.locator('[data-compare="audit-friend"]').click();
 await expect(page.locator('.relationship-calendar')).toHaveCount(1);
 await expect(page.locator('#main')).not.toContainText('Invalid relationship');
 await expect(page.locator('.relationship-calendar')).toContainText(/12 ظهراً|12:00 noon/);
 await expect(page.locator('.relationship-calendar')).not.toContainText(/عينات اقتراح اللقاء|Available meeting samples/);
 const reminders=page.locator('[data-relationship-calendar]');
 for(let i=0;i<await reminders.count();i++){
  expect(Number(await reminders.nth(i).getAttribute('data-relationship-calendar'))).toBeGreaterThan(await page.evaluate(()=>Date.now()));
  await expect(reminders.nth(i)).toContainText(/12 ظهراً|12 noon/);
 }
});

test('lunar mansion transition names the time and health notes have a neutral label',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('mx.language','en'));
 await page.goto('/#lunar',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.mx-mansion-panel')).toBeVisible({timeout:75000});
 await expect(page.locator('.mx-mansion-transition')).toContainText('Next mansion begins');
 const line=page.locator('.mx-mansion-line.avoid');
 if((await line.textContent()).includes('No evidence-based health restriction'))
  await expect(line.locator('span')).toHaveText('Note');
 else await expect(line.locator('span')).toContainText('Traditionally unfavorable');
});

test('missing heatmap evidence stays unavailable instead of showing a neutral fifty',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('mx.uiMode','pro'));
 await page.goto('/#time',{waitUntil:'domcontentloaded'});
 await page.locator('.heatmap-cell').first().waitFor({timeout:75000});
 await page.locator('#heat-category').selectOption('recovery');
 await expect(page.locator('.heatmap-cell')).toHaveCount(30);
 await expect(page.locator('.heatmap-unavailable')).toHaveCount(30);
 for(const cell of await page.locator('.heatmap-cell').all()){
  await expect(cell.locator('b')).toHaveText('—');
  await expect(cell).toHaveAttribute('aria-label',/غير متاح|Unavailable/);
 }
 await page.locator('#heat-category').selectOption('average');
 await expect(page.locator('.heatmap-coverage')).toHaveCount(30);
 expect(await page.locator('.heatmap-coverage').allTextContents()).not.toContain('8/8');
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThan(9);
});

for(const quality of ['grounded-fallback','reviewed-model']){
 test('Ai reading discloses '+quality+' as the actual reading source',async({page})=>{
  await page.route('**/api/explain',async route=>{
   const req=route.request();
   const body=req.method()==='GET'?{configured:true,provider:'cloudflare',model:'test'}:{
    explanation:'إذا عندك طلب بالشغل، حدد شنو المطلوب ومتى تگدر تسلمه. هذا تأويل رمزي، والنتيجة الفعلية تبين من وضوح الاتفاق وتنفيذه.',
    quality,calculatedAt:req.postDataJSON().calculatedAt,
   };
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  await page.goto('/#ai',{waitUntil:'domcontentloaded'});
  const source=page.locator('[data-ai-quality="'+quality+'"]');
  await expect(source).toBeVisible({timeout:75000});
  await expect(source).toContainText(quality==='grounded-fallback'?/الدليل المحسوب|calculated evidence/:/Ai/);
  await expect(page.locator('.mx-qwen-paragraph').first()).toContainText('طلب بالشغل');
  expect(await page.locator('[data-ai-quality]').count()).toBe(1);
 });
}

test('unknown birth time stays unknown in settings, natal wheel and transit legend',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('mx.language','en');
  localStorage.setItem('mx.orbit.profiles.v1',JSON.stringify([{id:'no-hour',name:'Test',kind:'self',date:'1999-06-01',time:'12:00',zone:'Etc/UTC',lat:0,lon:0,city:'Test city',known:false}]));
 });
 await page.goto('/#/settings');
 const time=page.locator('#profile-form [name=time]');
 await expect(time).toBeDisabled();
 await expect(time).toHaveValue('');
 await page.locator('[name=known]').check();
 await expect(time).toBeEnabled();
 await expect(time).toHaveAttribute('required','');
 await page.locator('[name=known]').uncheck();
 await page.evaluate(()=>{location.hash='/chart'});
 await expect(page.locator('.large-wheel > p')).not.toContainText('12:00');
 await expect(page.locator('.mx-wheel-planet-key b').filter({hasText:/^Moon$/})).toHaveCount(0);
 await page.locator('[data-chart="transit"]').click();
 await expect(page.locator('.wheel-guide')).toContainText('Transiting planets');
 await expect(page.locator('.mx-wheel-planet-key b').filter({hasText:/^Moon$/})).toHaveCount(1);
});

test('eclipse cards and timers use the date selected in Go Mode',async({page})=>{
 await page.clock.install({time:new Date('2026-11-18T18:00:00Z')});
 await page.addInitScript(()=>localStorage.setItem('mx.language','en'));
 await page.goto('/#/go');
 await page.locator('#go-time-input').fill('2024-04-08T18:20');
 await page.locator('#go-time-form button').click();
 await expect(page.locator('.mx-go-time-status')).toContainText('Selected time');
 await page.evaluate(()=>{location.hash='/eclipses'});
 const solar=page.locator('.eclipse-solar');
 await expect(solar).toHaveClass(/eclipse-live/);
 await expect(solar.locator('.eclipse-maximum time')).toHaveAttribute('datetime',/^2024-04-08T/);
 await expect(solar.locator('[data-eclipse-countdown-label]')).toHaveText('MAXIMUM REACHED');
 const before=await solar.locator('.eclipse-live-grid').innerText();
 await page.clock.fastForward(3000);
 await expect(solar.locator('.eclipse-live-grid')).toHaveText(before,{useInnerText:true});
 await page.getByRole('button',{name:'Return to now'}).click();
 await expect(solar.locator('.eclipse-maximum time')).toHaveAttribute('datetime',/^2027-02-06T/);
});

test('live eclipse countdown changes its message when maximum passes',async({page})=>{
 await page.clock.install({time:new Date('2024-04-08T18:16:00Z')});
 await page.addInitScript(()=>localStorage.setItem('mx.language','en'));
 await page.goto('/#eclipses');
 const solar=page.locator('.eclipse-solar');
 await expect(solar).toHaveClass(/eclipse-live/,{timeout:75000});
 await expect(solar.locator('[data-eclipse-countdown-label]')).toHaveText('COUNTDOWN TO MAXIMUM');
 await page.clock.fastForward(120000);
 await expect(solar.locator('[data-eclipse-countdown-label]')).toHaveText('MAXIMUM REACHED');
 await expect(solar.locator('.eclipse-live-countdown')).toHaveAttribute('aria-hidden','false');
});
