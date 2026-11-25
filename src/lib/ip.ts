/** The client IP Cloudflare reports for a request ('unknown' when absent). */
export function clientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/**
 * Rate-limit bucket for an IP: IPv4 as-is, IPv6 by its /64 — one client
 * controls a whole /64, so per-address keys would be trivial to rotate.
 */
export function ipBucket(ip: string): string {
  if (!ip.includes(':')) return ip;
  if (ip.includes('.')) return ip.slice(ip.lastIndexOf(':') + 1); // IPv4-mapped (::ffff:1.2.3.4)
  const [head, tail = ''] = ip.split('::');
  const h = head ? head.split(':') : [];
  const t = tail ? tail.split(':') : [];
  const groups = [...h, ...Array<string>(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t];
  return `${groups
    .slice(0, 4)
    .map((g) => g.toLowerCase().replace(/^0+(?=.)/, ''))
    .join(':')}::/64`;
}
