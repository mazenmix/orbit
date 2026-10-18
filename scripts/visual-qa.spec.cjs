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
