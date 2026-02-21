// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export const runtime = "edge";

interface Report {
    id: number;
    vin: string;
    status: string;
    pdf_url: string | null;
    created_at: string;
}

export default function DashboardPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch("/api/user/reports");
                const data = (await res.json()) as { reports?: Report[]; error?: string };

                if (!res.ok) {
                    throw new Error(data.error || "Failed to load reports");
                }

                if (data.reports) {
                    setReports(data.reports);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 gap-4 flex flex-col items-start">
                <div>
                    <h2 className="text-lg font-bold">Error Loading Reports</h2>
                    <p className="text-sm">{error}</p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Reports</h1>
                    <p className="text-muted-foreground">View and download your past VIN checks.</p>
                </div>
                <Link href="/vin-check">
                    <Button>
                        New VIN Check
                    </Button>
                </Link>
            </div>

            {reports.length === 0 ? (
                <div className="rounded-xl border border-dashed p-12 text-center bg-card flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">No Reports Yet</h3>
                    <p className="text-muted-foreground max-w-sm mb-4">
                        You haven&apos;t run any VIN checks on this account yet. Run your first check to see it here.
                    </p>
                    <Link href="/vin-check">
                        <Button>Get Started</Button>
                    </Link>
                </div>
            ) : (
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-medium">VIN</th>
                                    <th scope="col" className="px-6 py-4 font-medium">Date</th>
                                    <th scope="col" className="px-6 py-4 font-medium">Status</th>
                                    <th scope="col" className="px-6 py-4 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id} className="border-b last:border-0 border-border hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-mono font-medium">{report.vin}</td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {report.status === "paid" ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400">
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400">
                                                    Pending Payment
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {report.status === "paid" ? (
                                                <Link href={`/report?vin=${report.vin}`}>
                                                    <Button size="sm" variant="ghost" className="gap-2">
                                                        View Report <ArrowRight className="h-3 w-3" />
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Link href={`/vin-check?vin=${report.vin}`}>
                                                    <Button size="sm">
                                                        Complete Checkout
                                                    </Button>
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
