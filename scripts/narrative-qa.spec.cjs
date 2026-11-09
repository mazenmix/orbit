const {test,expect}=require('/tmp/astro-qa/node_modules/@playwright/test');

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
