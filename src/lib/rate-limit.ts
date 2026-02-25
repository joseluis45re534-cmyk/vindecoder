/**
 * Edge-compatible in-memory rate limiter using a sliding window.
 * Uses a simple Map to track request counts per IP.
 * Note: This resets on cold starts, which is acceptable for edge workers.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
function cleanup() {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}

// Run cleanup every 60 seconds
let lastCleanup = 0;

export function rateLimit(
    ip: string,
    {
        maxRequests = 10,
        windowMs = 60_000, // 1 minute
        prefix = "global",
    }: {
        maxRequests?: number;
        windowMs?: number;
        prefix?: string;
    } = {}
): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();

    // Periodic cleanup
    if (now - lastCleanup > 60_000) {
        cleanup();
        lastCleanup = now;
    }

    const key = `${prefix}:${ip}`;
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
        // First request or window expired
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
    }

    if (entry.count >= maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: entry.resetTime - now,
        };
    }

    entry.count++;
    return {
        allowed: true,
        remaining: maxRequests - entry.count,
        resetIn: entry.resetTime - now,
    };
}
