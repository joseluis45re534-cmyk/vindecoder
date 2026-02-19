"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
    { q: "How long does it take to get the report?", a: "Reports are generated instantly after payment validation. You will receive an email with the download link within seconds." },
    { q: "Where does the data come from?", a: "We source our data directly from the official Australian Government Personal Property Securities Register (PPSR) and NEVDIS database." },
    { q: "What if the car has finance owing?", a: "Our report will detail any finance encumbrances recorded against the VIN, helping you avoid repossession risks." },
    { q: "Can I get a refund?", a: "Yes, if we cannot generate a report for a valid Australian VIN, we will issue a full refund in accordance with our refund policy." }
];

export function FaqSection() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="py-20 border-t bg-background">
            <div className="container max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground">Everything you need to know about our vehicle history reports.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="rounded-lg border bg-card overflow-hidden">
                            <button
                                onClick={() => toggleFaq(i)}
                                className="flex w-full items-center justify-between p-6 text-left font-medium transition-colors hover:bg-muted/50"
                            >
                                <span>{faq.q}</span>
                                <motion.div
                                    animate={{ rotate: activeIndex === i ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {activeIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="p-6 pt-0 text-muted-foreground">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
