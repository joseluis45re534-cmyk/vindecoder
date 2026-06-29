// Customer account auth — PBKDF2 password hashing + per-user signed-cookie
// sessions. Edge/Workers compatible (Web Crypto only), DB-free so it is safe to
// import from middleware. Mirrors lib/auth.ts (admin) but uses a DISTINCT cookie
// (`cvl_user`) and a 4-part token so customer and admin sessions never collide.

const COOKIE = 'cvl_user';
const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const PBKDF2_ITERATIONS = 100_000;

// ---------- base64url ----------

function b64url(bytes: ArrayBuffer | Uint8Array): string {
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let bin = '';
    for (const b of arr) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(s: string): Uint8Array {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

// ---------- password hashing (PBKDF2-HMAC-SHA256) ----------

async function pbkdf2(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    return crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        key,
        256,
    );
}

/** Returns a self-describing verifier `salt$hash` (both base64url). */
export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await pbkdf2(password, salt);
    return `${b64url(salt)}$${b64url(hash)}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
    if (!stored) return false;
    const [saltB64, hashB64] = stored.split('$');
    if (!saltB64 || !hashB64) return false;
    const hash = await pbkdf2(password, fromB64url(saltB64));
    return timingSafeEqual(b64url(hash), hashB64);
}

// ---------- sessions (HMAC-SHA256 signed cookie) ----------

async function hmac(secret: string, data: string): Promise<string> {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
    return b64url(sig);
}

export async function createUserSession(userId: string, secret: string): Promise<string> {
    const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
    const payload = `user.${userId}.${exp}`;
    return `${payload}.${await hmac(secret, payload)}`;
}

/** Returns the userId when the token is valid and unexpired, else null. */
export async function verifyUserSession(token: string | undefined, secret: string): Promise<string | null> {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 4) return null;
    const [role, userId, exp, sig] = parts;
    if (role !== 'user' || !userId) return null;
    if (Number(exp) < Math.floor(Date.now() / 1000)) return null;
    const expected = await hmac(secret, `${role}.${userId}.${exp}`);
    return timingSafeEqual(expected, sig) ? userId : null;
}

export function userCookie(token: string): string {
    return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${TTL_SECONDS}`;
}

export function clearUserCookie(): string {
    return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

export const USER_COOKIE_NAME = COOKIE;

// Dev fallback so accounts work before the secret is set; reuses the admin
// secret if a dedicated user secret isn't provided.
export function userSessionSecret(env: { USER_SESSION_SECRET?: string; ADMIN_SESSION_SECRET?: string }): string {
    return env.USER_SESSION_SECRET || env.ADMIN_SESSION_SECRET || 'dev-insecure-user-secret-change-me';
}

export function readUserCookie(request: Request): string | undefined {
    const header = request.headers.get('cookie') || '';
    for (const part of header.split(';')) {
        const [k, ...v] = part.trim().split('=');
        if (k === COOKIE) return v.join('=');
    }
    return undefined;
}
