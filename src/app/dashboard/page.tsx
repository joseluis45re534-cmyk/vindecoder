"use client";

export const runtime = "edge";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Report {
    id: number;
    vin_number: string;
    status: string;
    created_at: string;
    has_report?: number;
}

export default function DashboardReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch("/api/user/reports");
                if (!res.ok) {
                    throw new Error("Failed to load reports");
                }
                const data = await res.json() as { reports?: Report[] };
                setReports(data.reports || []);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">My VIN Reports</h1>

            {reports.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No reports yet</h3>
                    <p className="text-muted-foreground mb-6">You haven&apos;t run any VIN checks yet.</p>
                    <Link href="/vin-check">
                        <Button>Run a Free Check</Button>
                    </Link>
                </div>
            ) : (
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-medium">VIN Number</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {report.vin_number}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {report.status === 'paid' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Pending Payment
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {report.status === 'paid' ? (
                                                <Link href={`/report?vin=${report.vin_number}`}>
                                                    <Button variant="outline" size="sm" className="gap-2">
                                                        View Report <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Link href={`/vin-check?vin=${report.vin_number}`}>
                                                    <Button variant="default" size="sm" className="gap-2">
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
