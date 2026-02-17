"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ReportGenerationLoaderProps {
    vinRequestId: number;
}

export function ReportGenerationLoader({ vinRequestId }: ReportGenerationLoaderProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generate = async () => {
            try {
                const response = await fetch("/api/generate-report", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ vinRequestId }),
                });

                if (!response.ok) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const data = (await response.json()) as any;
                    throw new Error(data.error || `Error ${response.status}: Failed to generate report`);
                }

                // Refresh the page to show the generated report (handled by Server Component)
                router.refresh();
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Failed to generate report. Please contact support.");
            }
        };

        generate();
    }, [vinRequestId, router]);

    if (error) {
        return (
            <div className="text-center p-8 text-destructive">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Generating your comprehensive vehicle history...</h2>
            <p className="text-muted-foreground">Checking National Theft Database, Written-Off Register, and Financial Encumbrances.</p>
        </div>
    );
}
