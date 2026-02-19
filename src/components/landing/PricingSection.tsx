"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
    "Official PPSR Check",
    "Stolen Vehicle Check",
    "Written-Off Check",
    "Registration Status",
    "Finance Check",
    "Odometer Discrepancy",
    "Instant PDF Download"
];

export function PricingSection() {
    return (
        <section className="py-24 bg-muted/30 relative overflow-hidden">
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />

            <div className="container px-4 md:px-6">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl"
                    >
                        Simple, Transparent Pricing
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7"
                    >
                        No hidden fees. Just one comprehensive report for complete peace of mind.
                    </motion.p>
                </div>

                <div className="mx-auto mt-12 max-w-[400px]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 50, delay: 0.2 }}
                        whileHover={{ y: -10, transition: { duration: 0.2 } }}
                        className="flex flex-col overflow-hidden rounded-3xl border bg-background shadow-xl ring-1 ring-primary/20 relative"
                    >
                        {/* Popular Badge */}
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
                            POPULAR
                        </div>

                        <div className="p-8 sm:p-10">
                            <h3 className="text-xl font-semibold tracking-tight">Full History Report</h3>
                            <div className="mt-4 flex items-baseline text-5xl font-extrabold text-foreground">
                                $29<span className="text-lg font-medium text-muted-foreground ml-1">.99</span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">One-time payment. Instant access.</p>

                            <div className="mt-8 space-y-4">
                                {features.map((feature, i) => (
                                    <motion.div
                                        key={feature}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + (i * 0.05) }}
                                        className="flex items-center"
                                    >
                                        <CheckCircle2 className="h-5 w-5 text-accent mr-2" />
                                        <span className="text-sm text-foreground/80">{feature}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col p-6 sm:p-10 bg-muted/20 border-t">
                            <Link href="/vin-check" className="w-full">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button size="lg" className="w-full text-lg h-12 shadow-lg shadow-primary/20">Get Report Now</Button>
                                </motion.div>
                            </Link>
                            <p className="mt-4 text-xs text-center text-muted-foreground">
                                Secure payment via Stripe. 100% Satisfaction Guarantee.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
