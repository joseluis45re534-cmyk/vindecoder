// IndexNow ping — tells Bing, Yandex, Seznam, Naver (and every other IndexNow
// engine) which URLs changed, instead of waiting for them to recrawl.
// Google does not use IndexNow; it reads the sitemap.
//
// Usage (after a deploy is live):
//   npm run indexnow                      -> submit every URL in the live sitemap
//   npm run indexnow -- /pricing /about   -> submit only these paths
//
// The key is public by design: the protocol verifies site ownership by fetching
// https://carvinlookup.us/<KEY>.txt (public/<KEY>.txt), so it is not a secret.

const HOST = 'carvinlookup.us';
const ORIGIN = `https://${HOST}`;
const KEY = '86403b8593158af1af147584bafdf072';
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;

async function sitemapUrls() {
  const res = await fetch(`${ORIGIN}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml -> HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  const args = process.argv.slice(2);
  const urls = args.length
    ? args.map((p) => (p.startsWith('http') ? p : `${ORIGIN}${p.startsWith('/') ? '' : '/'}${p}`))
    : await sitemapUrls();

  const keyRes = await fetch(KEY_LOCATION);
  const keyBody = keyRes.ok ? (await keyRes.text()).trim() : '';
  if (keyBody !== KEY) {
    throw new Error(`Key file not live at ${KEY_LOCATION} (HTTP ${keyRes.status}). Deploy public/${KEY}.txt first.`);
  }

  // IndexNow accepts up to 10,000 URLs per request.
  for (let i = 0; i < urls.length; i += 10000) {
    const urlList = urls.slice(i, i + 10000);
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
    });
    // 200 = accepted, 202 = accepted (key validation pending).
    console.log(`IndexNow: submitted ${urlList.length} URLs -> HTTP ${res.status}`);
    if (res.status >= 400) console.log(await res.text());
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
