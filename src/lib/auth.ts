// Minimal stateless admin auth using a signed (HMAC-SHA256) cookie.
// Edge/Workers compatible — uses Web Crypto only. No external session store.

const COOKIE = 'cvl_admin';
const TTL_SECONDS = 60 * 60 * 12; // 12h

function b64url(bytes: ArrayBuffer | Uint8Array): string {
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let bin = '';
    for (const b of arr) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(secret: string, data: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
    return b64url(sig);
}

export async function createSession(secret: string): Promise<string> {
    const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
    const payload = `admin.${exp}`;
    const sig = await hmac(secret, payload);
    return `${payload}.${sig}`;
}

export async function verifySession(token: string | undefined, secret: string): Promise<boolean> {
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [role, exp, sig] = parts;
    if (role !== 'admin') return false;
    if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
    const expected = await hmac(secret, `${role}.${exp}`);
    // constant-time-ish compare
    if (expected.length !== sig.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
}

export function sessionCookie(token: string): string {
    return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${TTL_SECONDS}`;
}

export function clearCookie(): string {
    return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

export const COOKIE_NAME = COOKIE;

// Sensible dev fallbacks so the panel is usable before secrets are set.
export function adminSecret(env: { ADMIN_SESSION_SECRET?: string }): string {
    return env.ADMIN_SESSION_SECRET || 'dev-insecure-secret-change-me';
}
export function adminPassword(env: { ADMIN_PASSWORD?: string }): string {
    return env.ADMIN_PASSWORD || 'admin';
}

function readCookie(request: Request, name: string): string | undefined {
    const header = request.headers.get('cookie') || '';
    for (const part of header.split(';')) {
        const [k, ...v] = part.trim().split('=');
        if (k === name) return v.join('=');
    }
    return undefined;
}

// Verify the admin session from a request — for API routes under /api, which
// the /admin middleware does not cover.
export async function requireAdmin(
    request: Request,
    env: { ADMIN_SESSION_SECRET?: string }
): Promise<boolean> {
    return verifySession(readCookie(request, COOKIE), adminSecret(env));
}
