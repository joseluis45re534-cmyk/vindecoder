"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowRight, ScanLine, Zap } from "lucide-react";
import { VinInput } from "@/components/VinInput";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { PageReveal } from "@/components/ui/PageReveal";

export function HeroSection() {
    const [isScanning, setIsScanning] = useState(false);

    return (
        <section className="relative overflow-hidden bg-background py-20 md:py-32 border-b border-border/50 min-h-[90vh] flex items-center justify-center">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background/50 to-background" />
                <FloatingParticles />

                {/* Large glow blobs */}
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

            <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
                    <PageReveal direction="up" delay={0}>
                        <div className="mb-6 inline-flex items-center rounded-full border bg-background/50 backdrop-blur-sm px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm ring-1 ring-inset ring-border/20">
                            <Shield className="mr-2 h-4 w-4 text-primary animate-pulse" />
                            Trusted by 50,000+ Australians
                        </div>
                    </PageReveal>

                    <PageReveal direction="up" delay={0.1}>
                        <h1 className="mb-6 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            Instant Australian <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-accent bg-300% animate-gradient">
                                Vehicle History Reports
                            </span>
                        </h1>
                    </PageReveal>

                    <PageReveal direction="up" delay={0.2}>
                        <p className="mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                            Check any VIN instantly. Uncover finance owing, stolen status, write-offs, odometer rollbacks, and more.
                        </p>
                    </PageReveal>

                    <PageReveal direction="up" delay={0.3} className="w-full max-w-xl">
                        <VinInput
                            className="shadow-2xl shadow-black/5 dark:shadow-primary/10 lg:mx-0"
                            onScanStart={() => setIsScanning(true)}
                            onScanComplete={() => setIsScanning(false)}
                        />
                    </PageReveal>

                    <PageReveal direction="none" delay={0.8}>
                        <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground justify-center lg:justify-start w-full">
                            <span className="flex items-center"><ArrowRight className="h-3 w-3 mr-1 text-primary" /> Instant Delivery</span>
                            <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                            <span className="flex items-center"><ArrowRight className="h-3 w-3 mr-1 text-primary" /> Official Data</span>
                        </div>
                    </PageReveal>
                </div>

                {/* 3D Scanning Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotateX: 10 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="relative hidden lg:block"
                    style={{ perspective: "1000px" }}
                >
                    <motion.div
                        animate={{ rotateY: [-5, 5, -5], rotateX: [2, -2, 2] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-black rounded-2xl border border-border/50 shadow-2xl overflow-hidden group"
                    >
                        {/* Placeholder Car UI */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                            <Zap className="w-64 h-64 text-primary" />
                        </div>

                        {/* Scanning Line */}
                        <motion.div
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-1 bg-primary/80 box-shadow-[0_0_20px_rgba(59,130,246,0.8)] z-20"
                        />

                        {/* UI Overlay */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                            <div className={`flex items-center gap-2 backdrop-blur px-3 py-1 rounded-full text-xs font-mono border ${isScanning ? 'text-primary border-primary/20 bg-background/80' : 'text-muted-foreground border-border/50 bg-background/50'}`}>
                                <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-primary animate-pulse' : 'bg-gray-500'}`} />
                                {isScanning ? 'SYSTEM ONLINE' : 'STANDBY'}
                            </div>
                            <ScanLine className={`${isScanning ? 'text-primary/50' : 'text-gray-500/50'} w-6 h-6`} />
                        </div>


                        <div className="absolute bottom-4 left-4 text-xs font-mono text-muted-foreground">
                            &gt; PPSR: CONNECTED<br />
                            &gt; NEVDIS: CONNECTED<br />
                            &gt; ENCRYPTION: 256-BIT
                        </div>
                    </motion.div>

                    {/* Shadow */}
                    <div className="absolute -bottom-10 left-10 right-10 h-8 bg-black/40 blur-xl rounded-[100%]" />
                </motion.div>
            </div>
        </section>
    );
}
