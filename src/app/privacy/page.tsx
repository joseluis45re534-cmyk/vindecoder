import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container py-12 md:py-24 max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
                    <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-xl font-semibold">1. Introduction</h2>
                    <p>
                        Welcome to VINDecoderAU. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                    </p>

                    <h2 className="text-xl font-semibold">2. Data We Collect</h2>
                    <p>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Identity Data includes first name, last name, username or similar identifier.</li>
                        <li>Contact Data includes email address and telephone number.</li>
                        <li>Transaction Data includes details about payments to and from you and other details of products and services you have purchased from us.</li>
                        <li>Technical Data includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
                    </ul>

                    <h2 className="text-xl font-semibold">3. How We Use Your Data</h2>
                    <p>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Where we need to comply with a legal or regulatory obligation.</li>
                    </ul>
                </div>
            </main>
            <Footer />
        </div>
    );
}
