import { getEnv } from '@/lib/cf';

export const runtime = 'edge';

// TEMPORARY diagnostic route — returns the raw auto.dev responses so we can fix
// the integration mapping. Remove after debugging.
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const vin = (searchParams.get('vin') || '').toUpperCase();
    if (!vin) return new Response('vin required', { status: 400 });

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
            return { url, status: r.status, ok: r.ok, json, raw: json ? undefined : text.slice(0, 500) };
        } catch (e) {
            return { url, error: String(e) };
        }
    }

    const [decode, photos] = await Promise.all([
        probe(`https://api.auto.dev/vin/${encodeURIComponent(vin)}`),
        probe(`https://api.auto.dev/photos/${encodeURIComponent(vin)}`),
    ]);

    return Response.json({ keyPresent: true, decode, photos });
}
