"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ModeToggle } from "@/components/theme-toggle";

export function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in by trying to verify cookie
        // In a real app, you'd check the cookie or make an API call
        // For now, we'll just check if the cookie exists
        const checkAuth = async () => {
            try {
                const response = await fetch("/api/save-vin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ vin: "TEST" }),
                });
                setIsLoggedIn(response.status !== 401);
            } catch {
                setIsLoggedIn(false);
            }
        };
        checkAuth();
    }, []);

    const handleLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        setIsLoggedIn(false);
        router.push("/");
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <ShieldCheck className="h-6 w-6" />
                    <span>VINDecoder<span className="text-foreground">AU</span></span>
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <Link href="/vin-check" className="hover:text-foreground transition-colors">Free Check</Link>
                    <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
                    <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <ModeToggle />
                    {isLoggedIn ? (
                        <Button variant="outline" onClick={handleLogout} className="gap-2 text-destructive hover:bg-destructive/10">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link href="/signup">
                                <Button>Sign Up</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
