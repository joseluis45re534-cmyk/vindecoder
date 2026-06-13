import { getEnv } from '@/lib/cf';

export const runtime = 'edge';

// TEMPORARY diagnostic route — probe arbitrary auto.dev paths to find a VIN that
// has retail photos so we can verify the real-photo path. Remove after debugging.
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const env = await getEnv();
    const apiKey = env.AUTODEV_API_KEY;
    if (!apiKey) return Response.json({ error: 'no key configured' });
    const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

    async function probe(url: string) {
        try {
            const r = await fetch(url, { headers });
            const text = await r.text();
            let json: unknown = null;
            try { json = JSON.parse(text); } catch { /* keep raw */ }
            return { url, status: r.status, ok: r.ok, json, raw: json ? undefined : text.slice(0, 400) };
        } catch (e) {
            return { url, error: String(e) };
        }
    }

    const path = searchParams.get('path');
    if (path) return Response.json(await probe(`https://api.auto.dev/${path.replace(/^\/+/, '')}`));

    return Response.json({ hint: 'pass ?path=listings?make=Toyota or ?path=photos/VIN' });
}
