"use client";

import { motion } from "framer-motion";
import { Keyboard, SearchCheck, FileText } from "lucide-react";

const steps = [
    {
        icon: Keyboard,
        number: "1",
        title: "Enter VIN",
        description: "Input your vehicle's 17-digit Identification Number into our secure search bar.",
    },
    {
        icon: SearchCheck,
        number: "2",
        title: "Run Search",
        description: "Our powerful algorithm scans millions of government and insurance records instantly.",
    },
    {
        icon: FileText,
        number: "3",
        title: "Get Report",
        description: "Receive a detailed history report including accidents, title status, and specs.",
    },
];

export function HowItWorksSection() {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-16 md:px-10 lg:px-40">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-12 flex flex-col items-center text-center"
            >
                <span className="mb-3 rounded-full bg-[#135bec]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#135bec] dark:bg-[#135bec]/20 dark:text-[#eef4ff]">
                    Simple Process
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
                    How It Works
                </h2>
                <p className="mt-4 max-w-2xl text-gray-500 dark:text-gray-400">
                    Get your comprehensive vehicle report in three simple steps.
                </p>
            </motion.div>

            {/* Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                {steps.map((step, i) => {
                    const Icon = step.icon;
                    return (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.12 }}
                            whileHover={{ y: -4 }}
                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-[#135bec]/50 hover:shadow-xl dark:border-[#2d3748] dark:bg-[#1a2230] dark:hover:border-[#135bec]/50"
                        >
                            {/* Glow accent on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#135bec]/5 to-transparent rounded-2xl" />

                            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#135bec]/10 text-[#135bec] dark:bg-[#135bec]/20 dark:text-[#eef4ff] group-hover:bg-[#135bec] group-hover:text-white transition-colors">
                                <Icon className="h-7 w-7" />
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                                {step.number}. {step.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">{step.description}</p>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
