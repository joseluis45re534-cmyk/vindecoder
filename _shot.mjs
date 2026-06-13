import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
await page.goto('https://carvinlookup.us/report/WUABWGFF1KA904970', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('h2');
await page.waitForFunction(() => {
  const img = document.querySelector('img[alt*="vehicle"]');
  return img && img.naturalWidth > 0;
}, { timeout: 20000 });
await page.waitForTimeout(700);
await page.locator('h2').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
const cap = await page.evaluate(() => document.querySelector('img[alt*="vehicle"]')?.closest('div')?.querySelector('span')?.textContent);
console.log('caption:', cap);
await page.screenshot({ path: '_hero_audi.png' });
await browser.close();
console.log('done');
