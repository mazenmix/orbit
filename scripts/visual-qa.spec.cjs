const {test,expect}=require('/tmp/astro-qa/node_modules/@playwright/test');
const fs=require('node:fs');
fs.mkdirSync('artifacts/ui-qa',{recursive:true});
for(const [device,width,height] of [['desktop',1440,900],['iphone',390,844]]){
 test(device+' Soul DNA actual interaction',async({browser})=>{
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
  await page.screenshot({path:'artifacts/ui-qa/soul-'+device+'.png',fullPage:true});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow,'horizontal overflow').toBeLessThan(8);
  expect(errors).toEqual([]);
  await ctx.close();
 });
}
test('Moon, eclipse and MX Intelligence premium cards',async({page})=>{
 await page.goto('/#lunar',{waitUntil:'domcontentloaded'});
 await page.locator('.premium-time-tile').first().waitFor({timeout:75000});
 await expect(page.locator('.premium-time-tile')).toHaveCount(4);
 await page.screenshot({path:'artifacts/ui-qa/moon.png',fullPage:true});
 await page.goto('/#eclipses',{waitUntil:'domcontentloaded'});
 await page.locator('.eclipse-premium').first().waitFor({timeout:75000});
 await page.screenshot({path:'artifacts/ui-qa/eclipses.png',fullPage:true});
 await page.goto('/#intel',{waitUntil:'domcontentloaded'});
 await page.locator('.metric-card').first().waitFor({timeout:75000});
 await page.screenshot({path:'artifacts/ui-qa/intelligence.png',fullPage:true});
});
