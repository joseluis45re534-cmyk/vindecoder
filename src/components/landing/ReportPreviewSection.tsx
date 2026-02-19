"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Lock } from "lucide-react";
import { useState } from "react";

const features = [
    {
        title: "Finance Owing",
        desc: "Check if the vehicle is encumbered by a loan.",
        status: "CLEAR",
        color: "text-green-500"
    },
    {
        title: "Stolen Status",
        desc: "Verify if the vehicle is recorded as stolen.",
        status: "CLEAR",
        color: "text-green-500"
    },
    {
        title: "Written-Off",
        desc: "Has the car been in a major accident?",
        status: "CLEAR",
        color: "text-green-500"
    },
    {
        title: "Registration",
        desc: "Current registration status and expiry.",
        status: "ACTIVE",
        color: "text-blue-500"
    }
];

export function ReportPreviewSection() {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    return (
        <section className="py-24 border-y border-border/50 overflow-hidden bg-background">
            <div className="container">
                <div className="flex flex-col items-center text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold tracking-tight sm:text-4xl mb-4"
                    >
                        Interactive Report Preview
                    </motion.h2>
                    <p className="text-muted-foreground max-w-2xl text-lg">
                        Hover over the report sections to see what&apos;s covered.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    {/* Mock Report UI */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full lg:w-1/2 bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 relative"
                    >
                        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                            <div className="font-bold flex items-center gap-2">
                                <Lock className="w-4 h-4 text-green-400" />
                                VINDecoder Report
                            </div>
                            <div className="text-xs bg-slate-800 px-2 py-1 rounded">SECURE</div>
                        </div>

                        <div className="p-6 space-y-4">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    onHoverStart={() => setHoverIndex(i)}
                                    onHoverEnd={() => setHoverIndex(null)}
                                    className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${hoverIndex === i ? 'bg-slate-50 border-primary shadow-md scale-[1.02]' : 'bg-white border-slate-100'}`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-slate-700">{feature.title}</h4>
                                        <div className={`flex items-center gap-1 text-sm font-bold ${feature.color}`}>
                                            <CheckCircle2 className="w-4 h-4" />
                                            {feature.status}
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {hoverIndex === i && (
                                            <motion.p
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="text-sm text-slate-500 overflow-hidden"
                                            >
                                                {feature.desc}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Feature List */}
                    <div className="w-full lg:w-1/2 space-y-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`flex items-start gap-4 p-4 rounded-xl transition-colors duration-300 ${hoverIndex === i ? 'bg-primary/5' : ''}`}
                            >
                                <div className={`mt-1 p-2 rounded-full ${hoverIndex === i ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-bold transition-colors ${hoverIndex === i ? 'text-primary' : 'text-foreground'}`}>
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground mt-2">
                                        {feature.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
