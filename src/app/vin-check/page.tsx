"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VinInput } from "@/components/VinInput";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2, FileText, Lock, DollarSign } from "lucide-react";
import { validateVinOrRego } from "@/lib/vin-validation";

function VinCheckContent() {
    const searchParams = useSearchParams();
    const vinParam = searchParams.get("vin");

    const [vin, setVin] = useState("");
    const [status, setStatus] = useState<"input" | "analyzing" | "found" | "error">("input");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reportData, setReportData] = useState<any>(null); // Dummy data
    const [vinRequestId, setVinRequestId] = useState<number | null>(null);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [reportPrice, setReportPrice] = useState("$29.99");

    useEffect(() => {
        fetch("/api/config")
            .then((res) => res.json())
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((data: any) => {
                if (data.reportPriceDollars) setReportPrice(`$${data.reportPriceDollars}`);
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (vinParam) {
            const cleanVin = vinParam.toUpperCase();
            setVin(cleanVin);
            const validation = validateVinOrRego(cleanVin);

            if (validation.isValid) {
                handleAnalyze(cleanVin);
            } else {
                setStatus("input");
            }
        }
    }, [vinParam]);

    const handleAnalyze = async (vinToAnalyze: string) => {
        setStatus("analyzing");

        try {
            // Initiate the save-vin call immediately to fetch preview data
            const saveResponse = await fetch("/api/save-vin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vin: vinToAnalyze }),
            });

            if (!saveResponse.ok) {
                // If it fails (e.g. rate limit), stay on input or show error
                setStatus("input");
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const saveData = (await saveResponse.json()) as any;

            // Set the ID in state so checkout can use it later without re-saving
            if (saveData.vinRequest?.id) {
                setVinRequestId(saveData.vinRequest.id);
            }

            let make = "Vehicle";
            let model = "Data Found";
            let year = "";
            let image = null;
            let stolen = false;

            if (saveData.vinRequest?.preview_data) {
                try {
                    const preview = JSON.parse(saveData.vinRequest.preview_data);
                    make = preview.make || make;
                    model = preview.model || model;
                    year = preview.year || year;
                    image = preview.image || null;
                    stolen = preview.stolen || false;
                } catch {
                    // Ignore parse error
                }
            }

            setReportData({
                make,
                model,
                year,
                image,
                stolen,
                vin: vinToAnalyze,
                records: 5,
                issues: stolen ? 1 : 0
            });
            setStatus("found");

        } catch (error) {
            console.error("Analysis failed:", error);
            setStatus("input");
        }
    };

    const handleCheckout = async () => {
        if (!vinRequestId) return;
        setIsCheckoutLoading(true);
        try {
            // 2. Create Stripe Checkout Session directly using the already saved vinRequestId
            const checkoutResponse = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vinRequestId, vin }),
            });

            if (checkoutResponse.ok) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const session = (await checkoutResponse.json()) as any;
                if (session.url) {
                    window.location.href = session.url;
                    return;
                }
            }
        } catch (error) {
            console.error("Checkout failed:", error);
            // Could add error toast here
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl">
            {status === "input" && (
                <div className="text-center space-y-8">
                    <h1 className="text-3xl font-bold">Check Another Vehicle</h1>
                    <VinInput className="shadow-lg bg-background p-6 rounded-xl border" />
                </div>
            )}

            {status === "analyzing" && (
                <div className="flex flex-col items-center justify-center space-y-8 py-12 text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Analyzing VIN: <span className="text-primary font-mono">{vin}</span></h2>
                        <div className="space-y-2 text-muted-foreground">
                            <p className="animate-pulse">Accessing NEVDIS database...</p>
                            <p className="animate-pulse delay-700">Checking PPSR records...</p>
                            <p className="animate-pulse delay-1000">Verifying insurance history...</p>
                        </div>
                    </div>
                </div>
            )}

            {status === "found" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="rounded-xl border bg-background shadow-2xl overflow-hidden">
                        <div className="bg-primary/5 p-6 border-b text-center">
                            <div className="mx-auto bg-green-100 text-green-700 rounded-full w-fit px-4 py-1 mb-4 flex items-center text-sm font-medium">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Report Generated Successfully
                            </div>
                            {(() => {
                                const displayName = [reportData?.year, reportData?.make, reportData?.model]
                                    .filter(val => val && val !== 'Unknown' && val !== 'Vehicle' && val !== 'Data Found')
                                    .join(' ');
                                return <h2 className="text-2xl font-bold">{displayName || 'Vehicle Data Found'}</h2>;
                            })()}
                            <p className="font-mono text-muted-foreground mt-2 mb-4">{vin}</p>
                            {reportData?.image && (
                                <div className="mt-4 flex justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={reportData.image} alt={`${reportData.make} ${reportData.model}`} className="max-h-48 object-contain rounded-lg shadow-sm" />
                                </div>
                            )}
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="bg-muted/20 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Records Found</h3>
                                    <p className="text-2xl font-bold">{reportData?.records}</p>
                                </div>
                                <div className="bg-muted/20 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Checks Completed</h3>
                                    <p className="text-2xl font-bold">100%</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-dashed">
                                    <span className="flex items-center text-muted-foreground"><FileText className="h-4 w-4 mr-2" /> PPSR Certificate</span>
                                    <span className="font-medium text-green-600 flex items-center"><CheckCircle2 className="h-4 w-4 mr-1" /> Ready</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-dashed">
                                    <span className="flex items-center text-muted-foreground"><AlertCircle className="h-4 w-4 mr-2" /> Stolen Check</span>
                                    {reportData?.stolen ? (
                                        <span className="font-medium text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" /> Stolen</span>
                                    ) : (
                                        <span className="font-medium text-green-600 flex items-center"><CheckCircle2 className="h-4 w-4 mr-1" /> Clear</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-dashed">
                                    <span className="flex items-center text-muted-foreground"><AlertCircle className="h-4 w-4 mr-2" /> Written-Off Check</span>
                                    <span className="font-medium text-green-600 flex items-center"><CheckCircle2 className="h-4 w-4 mr-1" /> Ready</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-dashed">
                                    <span className="flex items-center text-muted-foreground"><DollarSign className="h-4 w-4 mr-2" /> Finance Check</span>
                                    <span className="font-medium text-green-600 flex items-center"><CheckCircle2 className="h-4 w-4 mr-1" /> Ready</span>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    className="w-full h-14 text-lg"
                                    size="lg"
                                    onClick={handleCheckout}
                                    disabled={isCheckoutLoading}
                                >
                                    {isCheckoutLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                                    Unlock Full Report - {reportPrice}
                                </Button>
                                <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center">
                                    <Lock className="h-3 w-3 mr-1" /> Secure 256-bit SSL Payment
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function VinCheckPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-muted/10">
                <div className="container py-12 md:py-24">
                    <Suspense fallback={<div className="text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>}>
                        <VinCheckContent />
                    </Suspense>
                </div>
            </main>
            <Footer />
        </div>
    );
}
