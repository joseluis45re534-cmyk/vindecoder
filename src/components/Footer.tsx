"use client";

import Link from "next/link";
import { Car } from "lucide-react";

const footerLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/refund-policy", label: "Refund Policy" },
    { href: "/contact", label: "Contact" },
    { href: "/about", label: "About" },
];

export function Footer() {
    return (
        <footer className="mt-auto border-t border-gray-200 bg-white dark:border-[#2d3748] dark:bg-[#1a2230]">
            <div className="mx-auto max-w-7xl px-4 py-10 md:px-10 lg:px-40">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-[#135bec] text-white">
                            <Car className="h-4 w-4" />
                        </div>
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                            VINDecoder<span className="text-[#135bec]">AU</span>
                        </span>
                    </Link>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        {footerLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-gray-500 hover:text-[#135bec] dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Copyright */}
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        © {new Date().getFullYear()} VINDecoderAU. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
