import Link from "next/link";
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { SITE_NAME, SUPPORT_EMAIL, SUPPORT_PHONE, SITE_ADDRESS } from "@/lib/site";
import Logo from "@/components/Logo";
import MobileMenu from "@/components/MobileMenu";
import AccountNav from "@/components/account/AccountNav";
import { BRANDS } from "@/lib/brands";

const FOOTER_BRANDS = [
  "ford", "chevrolet", "toyota", "honda", "nissan", "bmw", "jeep",
  "tesla", "hyundai", "kia", "gmc", "ram", "subaru", "lexus",
];

const CHECK_TYPES: { label: string; href: string }[] = [
  { label: "Salvage title check", href: "/salvage-check" },
  { label: "Stolen vehicle check", href: "/stolen-vehicle-check" },
  { label: "Odometer check", href: "/odometer-check" },
  { label: "Lien check", href: "/lien-check" },
  { label: "Flood damage check", href: "/flood-damage-check" },
  { label: "Accident history", href: "/accident-check" },
  { label: "Recall check", href: "/recalls" },
  { label: "VIN decoder", href: "/vin-decoder" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center group shrink-0" aria-label={`${SITE_NAME} home`}>
          <Logo className="h-9 sm:h-10 w-auto group-hover:opacity-90 transition-opacity" />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="/#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
          <Link href="/vin-check" className="hover:text-slate-900 transition-colors">Brands</Link>
          <Link href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
          <Link href="/how-to" className="hover:text-slate-900 transition-colors">How-to</Link>
          <Link href="/blog" className="hover:text-slate-900 transition-colors">Blog</Link>
          <a href="/#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <AccountNav />
          <a
            href="/#vin-search"
            className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-blue-600/25 transition-all hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.97]"
          >
            Run a VIN check
          </a>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const brandName = (slug: string) => BRANDS.find((b) => b.slug === slug)?.name ?? slug;

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand blurb */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" aria-hidden="true" />
              </span>
              <span className="text-white font-bold">{SITE_NAME}</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Instant U.S. vehicle history reports from NMVTIS, NICB, and state DMV records. Know before you buy.
            </p>
            <address className="not-italic mt-5 space-y-2.5 text-sm">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4 shrink-0 text-blue-400" aria-hidden="true" />
                {SUPPORT_EMAIL}
              </a>
              {SUPPORT_PHONE && (
                <a href={`tel:${SUPPORT_PHONE.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 shrink-0 text-blue-400" aria-hidden="true" />
                  {SUPPORT_PHONE}
                </a>
              )}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" aria-hidden="true" />
                <span className="not-italic leading-relaxed">
                  {SITE_ADDRESS.line1}{SITE_ADDRESS.line2 ? `, ${SITE_ADDRESS.line2}` : ""}<br />
                  {SITE_ADDRESS.city}, {SITE_ADDRESS.region} {SITE_ADDRESS.postalCode}<br />
                  {SITE_ADDRESS.country}
                </span>
              </div>
            </address>
          </div>

          {/* Popular brands */}
          <div>
            <h2 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Popular brands</h2>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_BRANDS.map((slug) => (
                <li key={slug}>
                  <Link href={`/vin-check/${slug}`} className="hover:text-white transition-colors">
                    {brandName(slug)} VIN check
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/vin-check" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  All {BRANDS.length} brands →
                </Link>
              </li>
            </ul>
          </div>

          {/* VIN checks */}
          <div>
            <h2 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">VIN checks</h2>
            <ul className="space-y-2.5 text-sm">
              {CHECK_TYPES.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="hover:text-white transition-colors">{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div>
            <h2 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Product</h2>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/#vin-search" className="hover:text-white transition-colors">VIN check</a></li>
              <li><Link href="/vin-check" className="hover:text-white transition-colors">VIN check by brand</Link></li>
              <li><Link href="/window-sticker" className="hover:text-white transition-colors">Window sticker lookup</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><a href="/#examples" className="hover:text-white transition-colors">Sample reports</a></li>
              <li><Link href="/compare" className="hover:text-white transition-colors">Compare providers</Link></li>
              <li><Link href="/auto-loan-calculator" className="hover:text-white transition-colors">Auto loan calculator</Link></li>
              <li><Link href="/lease-calculator" className="hover:text-white transition-colors">Lease calculator</Link></li>
              <li><Link href="/depreciation-calculator" className="hover:text-white transition-colors">Depreciation calculator</Link></li>
            </ul>
          </div>

          {/* Guides */}
          <div>
            <h2 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Guides</h2>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/blog/how-to-read-a-vin-number" className="hover:text-white transition-colors">How to read a VIN</Link></li>
              <li><Link href="/blog/salvage-title-vs-rebuilt-title" className="hover:text-white transition-colors">Salvage vs. rebuilt</Link></li>
              <li><Link href="/blog/check-car-for-flood-damage" className="hover:text-white transition-colors">Flood damage guide</Link></li>
              <li><Link href="/auctions" className="hover:text-white transition-colors">Salvage auction guide</Link></li>
              <li><Link href="/problems" className="hover:text-white transition-colors">Used-car problems</Link></li>
              <li><Link href="/glossary" className="hover:text-white transition-colors">VIN &amp; title glossary</Link></li>
              <li><Link href="/data-sources" className="hover:text-white transition-colors">Data sources &amp; methodology</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h2 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Company</h2>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col gap-4 text-xs">
          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-slate-700" aria-hidden="true">·</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span className="text-slate-700" aria-hidden="true">·</span>
            <Link href="/refund" className="hover:text-white transition-colors">Refund &amp; Cancellation</Link>
            <span className="text-slate-700" aria-hidden="true">·</span>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            <span className="text-slate-700" aria-hidden="true">·</span>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <span className="text-slate-700" aria-hidden="true">·</span>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </nav>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-center">
            <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved. Data from NMVTIS, NICB &amp; state DMVs.</p>
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
              Secure checkout · Reports delivered instantly
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
