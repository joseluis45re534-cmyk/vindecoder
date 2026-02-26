"use client";

import Link from "next/link";
import { Car, ChevronDown, User, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ModeToggle } from "@/components/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/vin-check", label: "Free Check" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#pricing", label: "Pricing" },
];

export function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/save-vin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ vin: "TEST" }),
                });
                setIsLoggedIn(res.status !== 401);
            } catch {
                setIsLoggedIn(false);
            }
        };
        checkAuth();

        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        setIsLoggedIn(false);
        router.push("/");
    };

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${scrolled
                ? "border-gray-200 dark:border-[#2d3748] bg-white/95 dark:bg-[#1a2230]/95 shadow-sm"
                : "border-transparent bg-white dark:bg-[#1a2230]"
            } backdrop-blur`}>
            <div className="flex items-center justify-between px-4 py-3 md:px-10">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#135bec] text-white shadow-md shadow-[#135bec]/30">
                        <Car className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                        VINDecoder<span className="text-[#135bec]">AU</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex flex-1 justify-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-gray-600 hover:text-[#135bec] dark:text-gray-300 dark:hover:text-[#eef4ff] transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    <ModeToggle />

                    {isLoggedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="hidden sm:flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-[#2d3748] px-4 text-sm font-bold text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <User className="h-4 w-4" />
                                    Account
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" className="flex items-center w-full cursor-pointer">
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings" className="flex items-center w-full cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Link href="/login">
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    className="hidden sm:flex h-10 items-center justify-center rounded-lg px-4 text-sm font-bold text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    Log In
                                </motion.button>
                            </Link>
                            <Link href="/signup">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex h-10 items-center justify-center rounded-lg bg-[#135bec] px-4 text-sm font-bold text-white hover:bg-[#0e45b5] transition-colors shadow-sm shadow-[#135bec]/30"
                                >
                                    Sign Up
                                </motion.button>
                            </Link>
                        </>
                    )}

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden ml-1 flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className="flex flex-col gap-1.5">
                            <span className={`block h-0.5 w-5 bg-gray-900 dark:bg-white transition-all ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
                            <span className={`block h-0.5 w-5 bg-gray-900 dark:bg-white transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
                            <span className={`block h-0.5 w-5 bg-gray-900 dark:bg-white transition-all ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-gray-200 dark:border-[#2d3748] bg-white dark:bg-[#1a2230] overflow-hidden"
                    >
                        <nav className="flex flex-col px-4 py-4 gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[#135bec] dark:hover:text-[#eef4ff] transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-3 border-t border-gray-100 dark:border-[#2d3748] flex gap-2 mt-1">
                                <Link href="/login" className="flex-1">
                                    <button className="w-full h-10 rounded-lg border border-gray-200 dark:border-[#2d3748] text-sm font-bold text-gray-800 dark:text-white">
                                        Log In
                                    </button>
                                </Link>
                                <Link href="/signup" className="flex-1">
                                    <button className="w-full h-10 rounded-lg bg-[#135bec] text-sm font-bold text-white">
                                        Sign Up
                                    </button>
                                </Link>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
