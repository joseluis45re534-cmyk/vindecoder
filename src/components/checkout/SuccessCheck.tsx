'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Animated success checkmark (circle + tick drawn via pathLength). Reduced-motion
// renders the final, fully-drawn mark with no animation.
export default function SuccessCheck({ size = 76 }: { size?: number }) {
    const reduce = useReducedMotion();
    const stroke = 'var(--color-security, #059669)';
    return (
        <svg width={size} height={size} viewBox="0 0 76 76" fill="none" role="img" aria-label="Payment successful">
            <motion.circle
                cx="38"
                cy="38"
                r="34"
                stroke={stroke}
                strokeWidth="4"
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0, opacity: 0.4 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
            />
            <motion.path
                d="M23 39.5 L33.5 50 L54 28"
                stroke={stroke}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: reduce ? 0 : 0.28 }}
            />
        </svg>
    );
}
