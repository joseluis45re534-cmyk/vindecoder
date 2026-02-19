"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
    {
        title: "PPSR Certificate",
        desc: "Official government certificate verifying finance owing and encumbrance status."
    },
    {
        title: "Stolen Status Check",
        desc: "Verify if the vehicle has been reported as stolen to police."
    },
    {
        title: "Written-Off History",
        desc: "Check if the car has been in a major accident or flooded and repaired."
    },
    {
        title: "Registration Details",
        desc: "Confirm registration status, expiry date, and plate details."
    }
];

export function ReportPreviewSection() {
    return (
        <section className="py-24 border-y border-border/50 overflow-hidden">
            <div className="container">
                <div className="flex flex-col items-center text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold tracking-tight sm:text-4xl mb-4"
                    >
                        What&apos;s Inside The Report?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground max-w-2xl text-lg"
                    >
                        Don&apos;t risk buying a lemon. Our reports reveal the critical hidden history of used cars.
                    </motion.p>
                </div>

                <div className="relative mx-auto max-w-5xl rounded-2xl border bg-card p-2 md:p-4 shadow-2xl">
                    <div className="absolute -top-12 -left-12 -z-10 h-[300px] w-[300px] bg-primary/20 blur-[100px] rounded-full opacity-50 animate-pulse" />
                    <div className="absolute -bottom-12 -right-12 -z-10 h-[300px] w-[300px] bg-accent/20 blur-[100px] rounded-full opacity-50 animate-pulse delay-700" />

                    <div className="grid md:grid-cols-2 gap-8 p-6 md:p-10">
                        <div className="space-y-6">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-default"
                                >
                                    <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-lg">{feature.title}</h4>
                                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Visual Placeholder for Report */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 50, delay: 0.2 }}
                            className="relative rounded-lg border bg-muted/10 p-6 flex flex-col gap-4 overflow-hidden"
                            whileHover={{ scale: 1.02, rotate: 1 }}
                        >
                            {/* Scanline effect */}
                            <motion.div
                                animate={{ top: ["0%", "100%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-1 bg-primary/20 z-10 box-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            />

                            <div className="flex items-center justify-between border-b pb-4">
                                <div className="h-6 w-32 bg-primary/20 rounded animate-pulse" />
                                <div className="h-8 w-20 bg-accent/20 rounded-full animate-pulse" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-muted/40 rounded" />
                                <div className="h-4 w-3/4 bg-muted/40 rounded" />
                                <div className="h-4 w-5/6 bg-muted/40 rounded" />
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="h-24 bg-card rounded border p-4 flex flex-col justify-center gap-2">
                                    <div className="h-2 w-16 bg-muted/40 rounded" />
                                    <div className="h-6 w-8 bg-green-500/20 rounded-full" />
                                </div>
                                <div className="h-24 bg-card rounded border p-4 flex flex-col justify-center gap-2">
                                    <div className="h-2 w-16 bg-muted/40 rounded" />
                                    <div className="h-6 w-8 bg-green-500/20 rounded-full" />
                                </div>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent flex items-end justify-center pb-6">
                                <Button variant="outline" className="pointer-events-none opacity-80 backdrop-blur-sm">View Full Detail</Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
