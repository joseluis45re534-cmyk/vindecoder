"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import { VinInput } from "@/components/VinInput";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-background py-20 md:py-32 border-b border-border/50">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background/50 to-background" />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px]"
                />
            </div>

            <div className="container relative z-10 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 inline-flex items-center rounded-full border bg-background/50 backdrop-blur-sm px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm ring-1 ring-inset ring-gray-200/20"
                >
                    <Shield className="mr-2 h-4 w-4 text-primary animate-pulse" />
                    Trusted by 50,000+ Australians
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-6 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                >
                    Instant Australian <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-accent bg-300% animate-gradient">
                        Vehicle History Reports
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl"
                >
                    Check any VIN instantly. Uncover finance owing, stolen status, write-offs, odometer rollbacks, and more.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="w-full max-w-xl"
                >
                    <VinInput className="shadow-2xl shadow-primary/10" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 flex items-center gap-4 text-sm text-muted-foreground"
                >
                    <span className="flex items-center"><ArrowRight className="h-3 w-3 mr-1 text-primary" /> Instant Delivery</span>
                    <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                    <span className="flex items-center"><ArrowRight className="h-3 w-3 mr-1 text-primary" /> Official Data</span>
                </motion.div>
            </div>
        </section>
    );
}
