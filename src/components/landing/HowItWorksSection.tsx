"use client";

import { motion } from "framer-motion";
import { Search, Server, FileText, ArrowRight } from "lucide-react";

const steps = [
    {
        icon: Search,
        title: "Enter VIN",
        desc: "Type in the 17-character VIN from your vehicle.",
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        icon: Server,
        title: "We Scan",
        desc: "Our system checks PPSR, NEVDIS & Police records.",
        color: "text-purple-500",
        bg: "bg-purple-500/10"
    },
    {
        icon: FileText,
        title: "Get Report",
        desc: "Instantly download your comprehensive PDF report.",
        color: "text-green-500",
        bg: "bg-green-500/10"
    }
];

export function HowItWorksSection() {
    return (
        <section className="py-24 bg-card relative z-10">
            <div className="container">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold tracking-tight sm:text-4xl mb-4"
                    >
                        How It Works
                    </motion.h2>
                    <p className="text-muted-foreground">Three simple steps to peace of mind.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, i) => (
                        <div key={i} className="relative group perspective-1000">
                            {/* Connector Line */}
                            {i < steps.length - 1 && (
                                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border -z-10 transform -translate-y-1/2">
                                    <ArrowRight className="absolute -right-3 -top-2.5 w-5 h-5 text-muted-foreground" />
                                </div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, rotateY: 90, z: -100 }}
                                whileInView={{ opacity: 1, rotateY: 0, z: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    delay: i * 0.15,
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 20
                                }}
                                whileHover={{
                                    scale: 1.05,
                                    rotateX: 10,
                                    rotateY: -5,
                                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                                }}
                                className="flex flex-col items-center text-center p-8 bg-background rounded-2xl border shadow-sm hover:border-primary/50 transition-colors duration-300 h-full relative z-10"
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                <motion.div
                                    className={`w-16 h-16 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-6 shadow-inner`}
                                    style={{ transform: "translateZ(30px)" }}
                                >
                                    <step.icon className="w-8 h-8" />
                                </motion.div>
                                <h3 className="text-xl font-bold mb-3" style={{ transform: "translateZ(20px)" }}>{step.title}</h3>
                                <p className="text-muted-foreground text-sm" style={{ transform: "translateZ(10px)" }}>{step.desc}</p>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
