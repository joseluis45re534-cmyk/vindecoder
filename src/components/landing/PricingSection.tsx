"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MouseEvent } from "react";

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
        <section className="py-24 bg-background text-foreground relative overflow-hidden">
            {/* Background Mesh (Simulated) */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-100 via-background to-background dark:from-slate-900 dark:via-[#0a0a0a] dark:to-black" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground"
                    >
                        Simple, Transparent Pricing
                    </motion.h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        No hidden fees. Just one comprehensive report.
                    </p>
                </div>

                <div className="mx-auto mt-12 max-w-[400px]">
                    <SpotlightCard>
                        <div className="p-8 sm:p-10 relative bg-card/90 rounded-3xl h-full border border-border/50 shadow-xl dark:shadow-none">
                            {/* Popular Badge */}
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-lg">
                                POPULAR
                            </div>

                            <h3 className="text-xl font-semibold tracking-tight text-foreground">Full History Report</h3>
                            <div className="mt-4 flex items-baseline text-5xl font-extrabold text-foreground">
                                $29<span className="text-lg font-medium text-muted-foreground ml-1">.99</span>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">One-time payment. Instant access.</p>

                            <div className="mt-8 space-y-4">
                                {features.map((feature) => (
                                    <div key={feature} className="flex items-center">
                                        <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                                        <span className="text-sm text-muted-foreground">{feature}</span>
                                    </div>
                                ))}


                            </div>

                            <div className="mt-10">
                                <Link href="/vin-check" className="w-full block">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button size="lg" className="w-full text-lg h-14 rounded-full">
                                            Get Report Now
                                        </Button>
                                    </motion.div>
                                </Link>
                                <p className="mt-4 text-xs text-center text-muted-foreground">
                                    Secure payment via Stripe. 100% Satisfaction Guarantee.
                                </p>
                            </div>
                        </div>
                    </SpotlightCard>
                </div>
            </div>
        </section>
    );
}

function SpotlightCard({ children }: { children: React.ReactNode }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className="group relative rounded-3xl border border-border/10 bg-card/50 p-1"
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              var(--spotlight-color, rgba(255,255,255,0.15)),
              transparent 80%
            )
          `,
                }}
            />
            {children}
        </div>
    );
}
