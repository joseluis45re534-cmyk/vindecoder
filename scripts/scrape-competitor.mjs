import { chromium } from 'playwright';

const URL = 'https://www.carcheckervin.com/';

const browser = await chromium.launch();
const page = await browser.newPage({ userAgent: 'Mozilla/5.0 (compatible; ResearchBot/1.0)' });
await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});

// Footer link map: section heading -> [{text, href}]
const footer = await page.evaluate(() => {
  const f = document.querySelector('footer');
  if (!f) return null;
  const cols = [];
  f.querySelectorAll('h2,h3,h4').forEach((h) => {
    const links = [];
    let el = h.nextElementSibling;
    while (el && !/H[2-4]/.test(el.tagName)) {
      el.querySelectorAll('a').forEach((a) => links.push({ text: a.textContent.trim(), href: a.getAttribute('href') }));
      el = el.nextElementSibling;
    }
    if (links.length) cols.push({ heading: h.textContent.trim(), links });
  });
  return cols;
});

// All brand links anywhere on the page (pattern /vin-check/<slug>)
const brands = await page.evaluate(() => {
  const set = new Map();
  document.querySelectorAll('a[href*="/vin-check/"]').forEach((a) => {
    const m = a.getAttribute('href').match(/\/vin-check\/([a-z0-9-]+)/i);
    if (m) set.set(m[1], a.textContent.trim());
  });
  return [...set.entries()].map(([slug, text]) => ({ slug, text }));
});

console.log('=== FOOTER SECTIONS ===');
for (const c of footer || []) {
  console.log(`\n## ${c.heading} (${c.links.length})`);
  c.links.slice(0, 40).forEach((l) => console.log(`  - ${l.text}  ->  ${l.href}`));
}
console.log('\n=== BRAND SLUGS (/vin-check/<slug>) ===');
console.log(brands.map((b) => b.slug).join(', '));
console.log(`\nTotal brand links found: ${brands.length}`);

await browser.close();
