import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xl text-primary">
                    <ShieldCheck className="h-6 w-6" />
                    <span>VINDecoder<span className="text-foreground">AU</span></span>
                </div>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <Link href="/vin-check" className="hover:text-foreground transition-colors">Free Check</Link>
                    <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
                    <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/vin-check">
                        <Button>Get Detailed Report</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}


