import { getEnv } from '@/lib/cf';

export const runtime = 'edge';

// TEMPORARY diagnostic — replicate fetchVehiclePhoto's listings call and report
// exactly what comes back. Remove after debugging.
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const vin = (searchParams.get('vin') || '2C4RDGCG2HR624719').toUpperCase();
    const env = await getEnv();
    const apiKey = env.AUTODEV_API_KEY;
    if (!apiKey) return Response.json({ error: 'no key' });

    try {
        const res = await fetch(`https://api.auto.dev/listings/${encodeURIComponent(vin)}`, {
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        });
        const text = await res.text();
        let parsed: unknown = null;
        try { parsed = JSON.parse(text); } catch { /* */ }
        const d = parsed as { retailListing?: { primaryImage?: unknown } } | null;
        return Response.json({
            status: res.status,
            ok: res.ok,
            primaryImage: d?.retailListing?.primaryImage ?? null,
            hasRetailListing: !!d?.retailListing,
            bodyHead: parsed ? undefined : text.slice(0, 300),
        });
    } catch (e) {
        return Response.json({ error: String(e) });
    }
}
