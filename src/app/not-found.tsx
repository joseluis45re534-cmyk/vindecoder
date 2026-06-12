import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Car<span className="text-blue-600">Vin</span>Lookup
          </span>
        </Link>
        <p className="text-6xl font-extrabold text-slate-900 mb-2">404</p>
        <h1 className="text-xl font-bold text-slate-900 mb-3">Page not found</h1>
        <p className="text-slate-500 mb-8">
          That page doesn&apos;t exist. Try a VIN check or one of our buying guides instead.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/#vin-search" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-full transition-colors">
            Run a VIN check
          </Link>
          <Link href="/blog" className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-5 py-2.5 rounded-full transition-colors">
            Read the blog
          </Link>
          <Link href="/pricing" className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-5 py-2.5 rounded-full transition-colors">
            Pricing
          </Link>
        </div>
      </div>
    </main>
  );
}
