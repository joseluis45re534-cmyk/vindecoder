"use client";

import { motion } from "framer-motion";

interface PageRevealProps {
    children: React.ReactNode;
    width?: "w-fit" | "w-full";
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
}

export function PageReveal({
    children,
    width = "w-full",
    className = "",
    delay = 0,
    direction = "up"
}: PageRevealProps) {
    const getDirectionOffset = () => {
        switch (direction) {
            case "up": return { y: 40, x: 0 };
            case "down": return { y: -40, x: 0 };
            case "left": return { x: 40, y: 0 };
            case "right": return { x: -40, y: 0 };
            case "none": return { x: 0, y: 0 };
        }
    };

    const offset = getDirectionOffset();

    return (
        <div className={`relative overflow-hidden ${width} ${className}`}>
            <motion.div
                initial={{ opacity: 0, ...offset }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                    duration: 0.6,
                    delay: delay,
                    ease: [0.22, 1, 0.36, 1] // Custom ease-out curve
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
