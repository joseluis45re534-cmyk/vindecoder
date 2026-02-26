"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function CtaSection() {
    return (
        <section className="w-full px-4 py-16 md:px-10 lg:px-20 xl:px-40">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-2xl bg-[#135bec] px-6 py-12 text-center shadow-xl md:px-12 md:py-20"
            >
                {/* Decorative background blobs */}
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-black/10 blur-3xl"
                />

                <div className="relative z-10 mx-auto max-w-3xl">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-4 text-3xl font-black tracking-tight text-white md:text-4xl"
                    >
                        Ready to check a vehicle?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mb-8 text-lg text-white/90"
                    >
                        Don&apos;t risk buying a used car without knowing its full history. Get peace of mind today.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                    >
                        <Link href="/vin-check">
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                className="h-12 w-full min-w-[160px] rounded-lg bg-white px-6 text-base font-bold text-[#135bec] shadow-lg hover:bg-gray-50 sm:w-auto transition-colors"
                            >
                                Get Started Now
                            </motion.button>
                        </Link>
                        <Link href="/#pricing">
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                className="h-12 w-full min-w-[160px] rounded-lg border border-white/30 bg-transparent px-6 text-base font-bold text-white hover:bg-white/10 sm:w-auto transition-colors"
                            >
                                View Pricing
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
