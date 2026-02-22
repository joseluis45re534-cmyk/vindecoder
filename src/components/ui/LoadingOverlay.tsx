"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
    isVisible: boolean;
    text?: string;
}

export function LoadingOverlay({ isVisible, text = "Loading..." }: LoadingOverlayProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25
                        }}
                        className="flex flex-col items-center justify-center p-8 rounded-2xl bg-card border shadow-xl max-w-sm w-full mx-4"
                    >
                        <div className="relative mb-6">
                            <motion.div
                                className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
                        </div>

                        <h3 className="text-xl font-semibold mb-2 text-center">{text}</h3>
                        <p className="text-sm text-muted-foreground text-center">
                            Please wait while we process your request.
                        </p>

                        <div className="w-full mt-6 bg-muted rounded-full h-1.5 overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{
                                    duration: 3,
                                    ease: "easeInOut",
                                    repeat: Infinity
                                }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
