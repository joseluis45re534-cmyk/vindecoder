"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VinInput } from "@/components/VinInput";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2, FileText, Lock, DollarSign } from "lucide-react";
import { validateVin } from "@/lib/vin-validation";

function VinCheckContent() {
    const searchParams = useSearchParams();
    const vinParam = searchParams.get("vin");

    const [vin, setVin] = useState("");
    const [status, setStatus] = useState<"input" | "analyzing" | "found" | "error">("input");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reportData, setReportData] = useState<any>(null); // Dummy data

    useEffect(() => {
        if (vinParam) {
            const cleanVin = vinParam.toUpperCase();
            setVin(cleanVin);
            const validation = validateVin(cleanVin);

            if (validation.isValid) {
                handleAnalyze(cleanVin);
            } else {
                setStatus("input");
            }
        }
    }, [vinParam]);

    const handleAnalyze = (vinToAnalyze: string) => {
        setStatus("analyzing");

        // Simulate API calls
        setTimeout(() => {
            setReportData({
                make: "Simulated Make",
                model: "Simulated Model",
                year: "2020",
                vin: vinToAnalyze,
                records: 5,
                issues: 0
            });
            setStatus("found");
        }, 2500);
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
                            <h2 className="text-2xl font-bold">{reportData?.year} {reportData?.make} {reportData?.model}</h2>
                            <p className="font-mono text-muted-foreground mt-2">{vin}</p>
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
                                    <span className="font-medium text-green-600 flex items-center"><CheckCircle2 className="h-4 w-4 mr-1" /> Ready</span>
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
                                <Button className="w-full h-14 text-lg" size="lg">
                                    Unlock Full Report - $29.99
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
