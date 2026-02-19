"use client";

import { motion, useInView } from "framer-motion";
import { VinInput } from "@/components/VinInput";
import { useEffect, useRef, useState } from "react";

export function CtaSection() {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            const end = 132;
            const duration = 2000;
            const startTime = performance.now();

            const animate = (currentTime: number) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);

                setCount(Math.floor(progress * end));

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }
    }, [isInView]);

    return (
        <section className="py-24 bg-primary/5 text-center relative overflow-hidden" ref={ref}>
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

            <div className="container max-w-3xl relative z-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    viewport={{ once: true }}
                    className="mb-8 inline-block"
                >
                    <span className="bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2 rounded-full font-bold text-sm border border-red-500/20 animate-pulse flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        {count} vehicle checks completed today
                    </span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-bold mb-6 tracking-tight"
                >
                    Ready to check a vehicle?
                </motion.h2>
                <div className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                    Don&apos;t take risks with your next car purchase. Get the facts instantly with Australia&apos;s most trusted VIN decoder.
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 100, damping: 10 }}
                    className="max-w-md mx-auto"
                >
                    <VinInput className="shadow-2xl shadow-primary/20" />
                </motion.div>
            </div>
        </section>
    );
}
