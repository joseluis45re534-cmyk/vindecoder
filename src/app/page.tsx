import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VinInput } from "@/components/VinInput";
import { CheckCircle2, Shield, Search, Zap, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background py-20 md:py-32 border-b border-border/50">
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
              <Shield className="mr-2 h-4 w-4 text-primary" />
              Trusted by 50,000+ Australians
            </div>
            <h1 className="mb-6 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Instant Australian <br />
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Vehicle History Reports</span>
            </h1>
            <p className="mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Check any VIN instantly. Uncover finance owing, stolen status, write-offs, odometer rollbacks, and more before you buy.
            </p>

            <div className="w-full max-w-xl">
              <VinInput className="shadow-2xl" />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm">
                <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Instant Delivery</h3>
                <p className="text-muted-foreground">Get your full vehicle history report delivered to your email seconds after purchase.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm">
                <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Comprehensive Check</h3>
                <p className="text-muted-foreground">We search official government databases (PPSR) and insurer records for complete peace of mind.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm">
                <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                  <Lock className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Secure Purchase</h3>
                <p className="text-muted-foreground">Your data is safe. We use enterprise-grade encryption and secure payment processing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Report Preview Section */}
        <section className="py-24 border-y border-border/50">
          <div className="container">
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">What&apos;s Inside The Report?</h2>
              <p className="text-muted-foreground max-w-2xl text-lg">Don&apos;t risk buying a lemon. Our reports reveal the critical hidden history of used cars.</p>
            </div>

            <div className="relative mx-auto max-w-5xl rounded-2xl border bg-card p-2 md:p-4 shadow-2xl">
              <div className="absolute -top-12 -left-12 -z-10 h-[300px] w-[300px] bg-primary/20 blur-[100px] rounded-full opacity-50" />
              <div className="absolute -bottom-12 -right-12 -z-10 h-[300px] w-[300px] bg-accent/20 blur-[100px] rounded-full opacity-50" />

              <div className="grid md:grid-cols-2 gap-8 p-6 md:p-10">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-lg">PPSR Certificate</h4>
                      <p className="text-sm text-muted-foreground">Official government certificate verifying finance owing and encumbrance status.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-lg">Stolen Status Check</h4>
                      <p className="text-sm text-muted-foreground">Verify if the vehicle has been reported as stolen to police.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-lg">Written-Off History</h4>
                      <p className="text-sm text-muted-foreground">Check if the car has been in a major accident or flooded and repaired.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-lg">Registration Details</h4>
                      <p className="text-sm text-muted-foreground">Confirm registration status, expiry date, and plate details.</p>
                    </div>
                  </div>
                </div>

                {/* Visual Placeholder for Report */}
                <div className="relative rounded-lg border bg-muted/10 p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="h-6 w-32 bg-primary/20 rounded animate-pulse" />
                    <div className="h-8 w-20 bg-accent/20 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-muted/40 rounded" />
                    <div className="h-4 w-3/4 bg-muted/40 rounded" />
                    <div className="h-4 w-5/6 bg-muted/40 rounded" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="h-24 bg-card rounded border p-4 flex flex-col justify-center gap-2">
                      <div className="h-2 w-16 bg-muted/40 rounded" />
                      <div className="h-6 w-8 bg-green-500/20 rounded-full" />
                    </div>
                    <div className="h-24 bg-card rounded border p-4 flex flex-col justify-center gap-2">
                      <div className="h-2 w-16 bg-muted/40 rounded" />
                      <div className="h-6 w-8 bg-green-500/20 rounded-full" />
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent flex items-end justify-center pb-6">
                    <Button variant="outline" className="pointer-events-none opacity-80 backdrop-blur-sm">View Full Detail</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Simple, Transparent Pricing</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                No hidden fees. Just one comprehensive report for complete peace of mind.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-[400px]">
              <div className="flex flex-col overflow-hidden rounded-3xl border bg-background shadow-xl ring-1 ring-primary/20">
                <div className="p-8 sm:p-10">
                  <h3 className="text-xl font-semibold tracking-tight">Full History Report</h3>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold text-foreground">
                    $29<span className="text-lg font-medium text-muted-foreground ml-1">.99</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">One-time payment. Instant access.</p>

                  <div className="mt-8 space-y-4">
                    {[
                      "Official PPSR Check",
                      "Stolen Vehicle Check",
                      "Written-Off Check",
                      "Registration Status",
                      "Finance Check",
                      "Odometer Discrepancy",
                      "Instant PDF Download"
                    ].map((feature) => (
                      <div key={feature} className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-accent mr-2" />
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col p-6 sm:p-10 bg-muted/20 border-t">
                  <Link href="/vin-check" className="w-full">
                    <Button size="lg" className="w-full text-lg h-12">Get Report Now</Button>
                  </Link>
                  <p className="mt-4 text-xs text-center text-muted-foreground">
                    Secure payment via Stripe. 100% Satisfaction Guarantee.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 border-t">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Everything you need to know about our vehicle history reports.</p>
            </div>

            <div className="space-y-4">
              {[
                { q: "How long does it take to get the report?", a: "Reports are generated instantly after payment validation. You will receive an email with the download link within seconds." },
                { q: "Where does the data come from?", a: "We source our data directly from the official Australian Government Personal Property Securities Register (PPSR) and NEVDIS database." },
                { q: "What if the car has finance owing?", a: "Our report will detail any finance encumbrances recorded against the VIN, helping you avoid repossession risks." },
                { q: "Can I get a refund?", a: "Yes, if we cannot generate a report for a valid Australian VIN, we will issue a full refund in accordance with our refund policy." }
              ].map((faq, i) => (
                <div key={i} className="rounded-lg border bg-card px-6 py-4">
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between font-medium list-none">
                      <span>{faq.q}</span>
                      <span className="transition group-open:rotate-180">
                        <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><polyline points="6 9 12 15 18 9" /></svg>
                      </span>
                    </summary>
                    <p className="mt-4 text-muted-foreground group-open:animate-accordion-down">
                      {faq.a}
                    </p>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5 text-center">
          <div className="container max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to check a vehicle?</h2>
            <p className="text-lg text-muted-foreground mb-10">Don&apos;t take risks with your next car purchase. Get the facts instantly.</p>
            <div className="max-w-md mx-auto">
              <VinInput />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
