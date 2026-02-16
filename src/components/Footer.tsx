import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t bg-muted/20">
            <div className="container py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 font-bold text-xl text-primary mb-4">
                            <ShieldCheck className="h-6 w-6" />
                            <span>VINDecoder<span className="text-foreground">AU</span></span>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Australia&apos;s trusted vehicle history report provider. Get comprehensive details on any vehicle instantly. Check for finance, stolen status, and more.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
                            <li><Link href="/vin-check" className="hover:text-foreground">Check VIN</Link></li>
                            <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
                            <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                            <li><Link href="/refund-policy" className="hover:text-foreground">Refund Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} VINDecoderAU. All rights reserved.</p>
                    <p className="mt-2 text-xs">This site is not affiliated with any government agency.</p>
                </div>
            </div>
        </footer>
    );
}
