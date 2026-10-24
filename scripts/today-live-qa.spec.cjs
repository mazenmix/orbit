const {test,expect}=require('/tmp/astro-qa/node_modules/@playwright/test');
test('compact Today Moon and VOC green gauges verify actual current-sky evidence',async({page})=>{
 await page.goto('/#today',{waitUntil:'domcontentloaded'});
 const pulse=page.locator('.mx-focus-hero .mx-live-movement');
 await expect(pulse).toBeVisible({timeout:75000});
 await expect(pulse).toContainText(/القمر الآن|Moon now/);
 await expect(pulse).toContainText(/حُسب الساعة|Calculated at/);
 const details=page.locator('.mx-focus-technical');
 await details.locator('summary').click();
 const basis=(await details.locator('p').innerText()).trim();
 expect(basis).toMatch(/°/);
 await expect(pulse).toContainText(basis);
 const lunar=page.locator('.mx-focus-lunar-status');
 await expect(lunar).toBeVisible();
 await expect(lunar.locator('.mx-focus-moon progress')).toHaveCount(2);
 await expect(page.locator('#expand-sky-wheel')).toBeVisible();
});
