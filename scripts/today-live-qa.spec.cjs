const {test,expect}=require('/tmp/astro-qa/node_modules/@playwright/test');
test('compact Today Moon and VOC green gauges verify actual current-sky evidence',async({page})=>{
 await page.goto('/#today',{waitUntil:'domcontentloaded'});
 const hero=page.locator('.mx-focus-hero');
 await expect(hero).toBeVisible({timeout:75000});
 const movement=hero.locator('.mx-sky-movement');
 await expect(movement).toBeVisible();
 expect((await movement.innerText()).trim().length).toBeGreaterThan(12);
 const checked=hero.locator('.mx-sky-live-checked');
 await expect(checked).toContainText(/الحساب الفلكي|Sky calculated/);
 await expect(page.locator('.mx-sky-planets .mx-sky-planet')).toHaveCount(10);
 const moon=page.locator('.mx-focus-lunar-status');
 await expect(moon).toBeVisible();
 await expect(moon.locator('.mx-focus-moon article')).toHaveCount(2);
 const bars=moon.locator('.mx-focus-moon progress');
 await expect(bars).toHaveCount(2);
 for(const bar of await bars.all()){
  const values=await bar.evaluate(el=>({
   value:el.value,
   start:Number(el.getAttribute('data-progress-start')),
   end:Number(el.getAttribute('data-progress-end'))
  }));
  expect(Number.isFinite(values.value)).toBe(true);
  expect(values.value).toBeGreaterThanOrEqual(0);
  expect(values.value).toBeLessThanOrEqual(100);
  expect(Number.isFinite(values.start)&&Number.isFinite(values.end)).toBe(true);
  expect(values.end).toBeGreaterThan(values.start);
 }
 await expect(moon.locator('time[datetime]')).toHaveCount(2);
 await expect(page.locator('#expand-sky-wheel')).toBeVisible();
 await expect(page.locator('#expand-sky-wheel svg.chart-wheel')).toBeVisible();
});
