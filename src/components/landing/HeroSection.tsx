"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, CheckCircle } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
    const [vin, setVin] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleDecode = () => {
        if (vin.trim().length > 0) {
            router.push(`/vin-check?vin=${vin.trim().toUpperCase()}`);
        } else {
            inputRef.current?.focus();
        }
    };

    return (
        <section className="w-full px-4 py-6 md:px-10 lg:px-20 xl:px-40">
            <div className="relative overflow-hidden rounded-2xl bg-[#101622] py-16 px-6 md:py-24 md:px-12 shadow-2xl">
                {/* Background Car Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/hero-car.png"
                        alt="Sleek modern car"
                        fill
                        className="object-cover opacity-40 mix-blend-overlay"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#101622]/90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#135bec]/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-8 text-center">
                    {/* Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl space-y-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="inline-flex items-center gap-2 rounded-full bg-[#135bec]/20 border border-[#135bec]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#eef4ff]"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                            Official PPSR Data Source
                        </motion.div>

                        <h1 className="text-4xl font-black leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                            Instant VIN Decoder &{" "}
                            <span className="text-[#eef4ff]">
                                Vehicle History
                            </span>
                        </h1>
                        <p className="text-lg font-normal text-gray-300 md:text-xl">
                            Unlock detailed vehicle specifications, accident history, and ownership
                            records instantly with Australia&apos;s trusted database.
                        </p>
                    </motion.div>

                    {/* VIN Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="w-full max-w-2xl rounded-xl bg-white p-2 shadow-xl dark:bg-[#1a2230] dark:border dark:border-[#2d3748]"
                    >
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative flex w-full items-center">
                                <div className="absolute left-4 text-gray-400">
                                    <Search className="h-5 w-5" />
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={vin}
                                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === "Enter" && handleDecode()}
                                    placeholder="Enter VIN (17 characters)"
                                    maxLength={17}
                                    className="h-12 w-full rounded-lg border-transparent bg-transparent pl-11 pr-4 text-base text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#135bec] dark:text-white dark:placeholder-gray-500 dark:focus:ring-[#135bec]"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleDecode}
                                className="h-12 shrink-0 rounded-lg bg-[#135bec] px-8 text-base font-bold text-white shadow-md hover:bg-[#0e45b5] transition-colors"
                            >
                                Decode VIN
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Trust badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400"
                    >
                        <span className="flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Official PPSR Check
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Stolen Vehicle Check
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Finance Check
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Instant PDF Report
                        </span>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
