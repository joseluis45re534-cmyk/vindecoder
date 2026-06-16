// Brand lockup (shield + "CarVinLookup" wordmark + tagline). Inlined as SVG so
// the wordmark renders in the site's loaded display font (Space Grotesk via
// --font-display) instead of a system fallback. Source asset also lives at
// public/logo-lockup.svg for OG / external use.

const WORDMARK_FONT = 'var(--font-display, "Segoe UI", Arial, sans-serif)';

export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 372 96"
      className={className}
      role="img"
      aria-label="CarVinLookup — Vehicle History & VIN Check"
    >
      {/* shield + verification check */}
      <g transform="translate(8,20) scale(0.84)">
        <path d="M16 10 H48 Q52 10 52 14 V32 Q52 46 32 57 Q12 46 12 32 V14 Q12 10 16 10 Z" fill="#2563EB" />
        <path d="M22 32 L30 39 L43 24" fill="none" stroke="#FFFFFF" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 32 L30 39 L43 24" fill="none" stroke="#EA580C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* wordmark */}
      <text x="74" y="51" style={{ fontFamily: WORDMARK_FONT, fontWeight: 700, fontSize: 38, letterSpacing: '-0.5px' }}>
        <tspan fill="#1E293B">Car</tspan>
        <tspan fill="#2563EB">Vin</tspan>
        <tspan fill="#1E293B">Lookup</tspan>
      </text>
      {/* tagline */}
      <text x="76" y="72" fill="#1E293B" opacity="0.62" style={{ fontFamily: WORDMARK_FONT, fontWeight: 600, fontSize: 11, letterSpacing: '3px' }}>
        VEHICLE&nbsp;HISTORY&nbsp;&amp;&nbsp;VIN&nbsp;CHECK
      </text>
    </svg>
  );
}
