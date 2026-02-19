"use client";

import { motion } from "framer-motion";
import { VinInput } from "@/components/VinInput";
import { useEffect, useState } from "react";

export function CtaSection() {
    const [seconds, setSeconds] = useState(900); // 15 minutes in seconds

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((prevSeconds) => (prevSeconds > 0 ? prevSeconds - 1 : 900));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (secs: number) => {
        const minutes = Math.floor(secs / 60);
        const remainingSeconds = secs % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <section className="py-24 bg-primary/5 text-center relative overflow-hidden">
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
                    <span className="bg-red-500/10 text-red-600 px-4 py-2 rounded-full font-bold text-sm border border-red-500/20 animate-pulse">
                        ⚠️ Limited Time Offer ends in {formatTime(seconds)}
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
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="max-w-md mx-auto"
                >
                    <VinInput className="shadow-2xl shadow-primary/20" />
                </motion.div>
            </div>
        </section>
    );
}
