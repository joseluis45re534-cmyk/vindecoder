import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container py-12 md:py-24 max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-6">About Us</h1>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-lg text-muted-foreground mb-6">
                        VINDecoderAU is Australia&apos;s leading independent vehicle history report provider. We are dedicated to providing transparency in the used car market.
                    </p>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
                    <p>
                        Buying a used car can be risky. Hidden finance, odometer rollbacks, and previous accidents are common issues that can cost buyers thousands. Our mission is to empower every Australian car buyer with the information they need to make a safe and informed decision.
                    </p>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">Where We Get Our Data</h2>
                    <p>
                        We source our data directly from official government registers, including the Personal Property Securities Register (PPSR) and NEVDIS (National Exchange of Vehicle and Driver Information System). This ensures that the information in your report is accurate, up-to-date, and reliable.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
