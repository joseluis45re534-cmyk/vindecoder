"use client";

import { motion } from "framer-motion";
import { Zap, Search, Lock } from "lucide-react";

const benefits = [
    {
        icon: Zap,
        title: "Instant Delivery",
        description: "Get your full vehicle history report delivered to your email seconds after purchase.",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10"
    },
    {
        icon: Search,
        title: "Comprehensive Check",
        description: "We search official government databases (PPSR) and insurer records for complete peace of mind.",
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        icon: Lock,
        title: "Secure Purchase",
        description: "Your data is safe. We use enterprise-grade encryption and secure payment processing.",
        color: "text-green-500",
        bg: "bg-green-500/10"
    }
];

export function BenefitsSection() {
    return (
        <section className="py-20 bg-muted/30">
            <div className="container">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.2
                            }
                        }
                    }}
                    className="grid gap-8 md:grid-cols-3"
                >
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
                            }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className={`mb-4 rounded-full p-4 ${benefit.bg} ${benefit.color}`}>
                                <benefit.icon className="h-8 w-8" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold">{benefit.title}</h3>
                            <p className="text-muted-foreground">{benefit.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
