import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function RefundPolicyPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container py-12 md:py-24 max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-8">Refund Policy</h1>
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
                    <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-xl font-semibold">1. Satisfaction Guarantee</h2>
                    <p>
                        We stand behind the quality of our data. If you are not satisfied with the report provided, please contact our support team within 14 days of purchase.
                    </p>

                    <h2 className="text-xl font-semibold">2. Eligibility for Refunds</h2>
                    <p>
                        Refunds are generally provided in the following circumstances:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>No data found: If we are unable to provide any data for a valid Australian VIN.</li>
                        <li>Technical Error: If a technical error prevented you from accessing your report.</li>
                        <li>Duplicate Payment: If you were charged multiple times for the same report.</li>
                    </ul>

                    <h2 className="text-xl font-semibold">3. Processing Time</h2>
                    <p>
                        Refunds are processed within 5-7 business days and will be returned to the original payment method used for the purchase.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
