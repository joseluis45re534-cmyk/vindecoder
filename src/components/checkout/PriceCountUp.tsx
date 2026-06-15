'use client';

import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

// Animated price that counts up from $0 to the target on mount. Respects
// prefers-reduced-motion (renders the final value instantly).
export default function PriceCountUp({
    cents,
    currency = 'usd',
    className,
}: {
    cents: number;
    currency?: string;
    className?: string;
}) {
    const reduce = useReducedMotion();
    const count = useMotionValue(reduce ? cents : 0);
    const whole = cents % 100 === 0;
    const text = useTransform(count, (v) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: whole ? 0 : 2,
            maximumFractionDigits: whole ? 0 : 2,
        }).format(v / 100)
    );

    useEffect(() => {
        if (reduce) {
            count.set(cents);
            return;
        }
        const controls = animate(count, cents, { duration: 0.5, ease: [0.22, 1, 0.36, 1] });
        return () => controls.stop();
    }, [cents, reduce, count]);

    return (
        <motion.span className={className} aria-hidden="true">
            {text}
        </motion.span>
    );
}
