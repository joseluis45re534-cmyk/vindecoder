import { chromium } from 'playwright';

const BASE = 'https://carvinlookup.us';
const VINS = ['WUABWGFF1KA904970', 'WP0AA2990WS321225']; // Audi RS3, Porsche 911

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 1000 } });

for (const vin of VINS) {
  const page = await ctx.newPage();
  let apiPreview = null;
  page.on('response', async (r) => {
    if (r.url().includes('/api/check-vin')) {
      try { apiPreview = (await r.json()).preview; } catch {}
    }
  });

  await page.goto(`${BASE}/report/${vin}`, { waitUntil: 'networkidle', timeout: 60000 });
  // Wait for the vehicle hero title to render
  await page.waitForSelector('h2', { timeout: 30000 });

  const title = (await page.locator('h2').first().textContent())?.trim();

  // Read the basic-info grid (dt/dd pairs)
  const specs = await page.$$eval('dl dt', (dts) =>
    dts.map((dt) => ({ k: dt.textContent?.trim(), v: dt.nextElementSibling?.textContent?.trim() }))
  );

  // Hero image: src + natural dimensions (0x0 => broken/not loaded)
  const img = await page.$('img[alt*="vehicle"]');
  const imgInfo = img
    ? await img.evaluate((el) => ({ src: el.currentSrc || el.src, w: el.naturalWidth, h: el.naturalHeight }))
    : null;

  console.log(`\n===== ${vin} =====`);
  console.log('API preview:', JSON.stringify(apiPreview));
  console.log('Rendered title:', title);
  console.log('Rendered specs:', JSON.stringify(specs));
  console.log('Hero image:', JSON.stringify(imgInfo));
  console.log('Image OK (loaded, non-zero):', !!imgInfo && imgInfo.w > 0 && imgInfo.h > 0);

  await page.screenshot({ path: `_shot_${vin}.png`, fullPage: false });
  await page.close();
}

await browser.close();
console.log('\nDONE');
