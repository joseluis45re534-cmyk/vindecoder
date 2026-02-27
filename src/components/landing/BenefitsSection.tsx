"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const benefits = [
    {
        title: "Data Accuracy",
        description:
            "We source data directly from official government databases, insurance companies, and service centers.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&q=80",
        alt: "Data analytics dashboard",
    },
    {
        title: "Lightning Fast",
        description:
            "No waiting around. Our optimized search engine delivers comprehensive results in seconds, not minutes.",
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=640&q=80",
        alt: "Fast car on highway",
    },
    {
        title: "Comprehensive Reports",
        description:
            "Uncover hidden issues including salvage titles, odometer rollbacks, theft records, and lemon history.",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=640&q=80",
        alt: "Detailed report document",
    },
];

export function BenefitsSection() {
    return (
        <section className="w-full bg-white dark:bg-[#1a2230]/50 py-16">
            <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-40">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
                >
                    <div className="max-w-xl">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
                            Why Choose VINDecoderAU
                        </h2>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">
                            Trusted by thousands of dealers and buyers for reliable vehicle data you can count on.
                        </p>
                    </div>
                    <Link
                        href="/vin-check"
                        className="hidden md:flex items-center gap-2 text-[#135bec] hover:text-[#0e45b5] font-medium transition-colors group"
                    >
                        Run a Free Check
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                {/* Cards */}
                <div className="grid gap-8 md:grid-cols-3">
                    {benefits.map((benefit, i) => (
                        <motion.div
                            key={benefit.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.12 }}
                            className="flex flex-col gap-4"
                        >
                            <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-[#101622] shadow-sm">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.4 }}
                                    className="h-full w-full"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={benefit.image}
                                        alt={benefit.alt}
                                        className="h-full w-full object-cover"
                                    />
                                </motion.div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {benefit.title}
                                </h3>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    {benefit.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
