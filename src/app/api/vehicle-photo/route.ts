import { getEnv } from '@/lib/cf';

export const runtime = 'edge';

// auto.dev hosts retail photos on its own domain and (depending on plan) may
// require the API key to serve them — a browser <img> can't send an auth header.
// This route proxies the image server-side: it fetches the photo with the
// AUTODEV_API_KEY held in Cloudflare env and streams the bytes back from our own
// origin, so the report page can render real vehicle photos with a plain <img>.

// Only proxy auto.dev image hosts — prevents this route being used as an open proxy / SSRF.
const ALLOWED_HOSTS = new Set(['api.auto.dev', 'auto.dev', 'cdn.auto.dev']);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const src = searchParams.get('src');
    if (!src) return new Response('Missing src', { status: 400 });

    let target: URL;
    try {
        target = new URL(src);
    } catch {
        return new Response('Invalid src', { status: 400 });
    }
    if (target.protocol !== 'https:' || !ALLOWED_HOSTS.has(target.hostname)) {
        return new Response('Host not allowed', { status: 403 });
    }

    const env = await getEnv();
    const apiKey = env.AUTODEV_API_KEY;

    try {
        const upstream = await fetch(target.toString(), {
            headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
            // auto.dev CDN images are immutable per URL; let Cloudflare cache them.
            cf: { cacheTtl: 86400, cacheEverything: true },
        } as RequestInit);

        if (!upstream.ok || !upstream.body) {
            return new Response('Photo unavailable', { status: 404 });
        }

        const contentType = upstream.headers.get('Content-Type') || 'image/jpeg';
        return new Response(upstream.body, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                // Cache aggressively at the edge and in the browser — photo per VIN is stable.
                'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
            },
        });
    } catch {
        return new Response('Photo unavailable', { status: 502 });
    }
}
