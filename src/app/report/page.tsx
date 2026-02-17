import { redirect } from 'next/navigation';
import { getAuthUserServer } from '@/lib/auth-server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, FileText, Download } from 'lucide-react';

export const runtime = 'edge';

interface ReportPageProps {
    searchParams: Promise<{
        session_id?: string;
        vin?: string;
    }>;
}

export default async function ReportPage(props: ReportPageProps) {
    const searchParams = await props.searchParams;
    const { session_id, vin } = searchParams;

    const user = await getAuthUserServer();
    if (!user) {
        redirect(`/login?redirect=/report?vin=${vin || ''}`);
    }

    if (!vin) {
        redirect('/vin-check');
    }

    let reportStatus = 'pending';
    let errorMessage = null;

    // Check database status
    try {
        // Safe access for local dev fallback
        let db;
        try {
            const { env } = getRequestContext();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            db = (env as any).DB;
        } catch {
            // Local dev fallback
            if (process.env.NODE_ENV === 'development') {
                // Mock paid status for local check if session exists?
                // Or just assume paid if ?session_id is present for testing
                if (session_id) reportStatus = 'paid';
            }
        }

        if (db) {
            // Check status in DB
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const request: any = await db.prepare(
                'SELECT * FROM vin_requests WHERE vin_number = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1'
            )
                .bind(vin, user.userId)
                .first();

            if (request) {
                reportStatus = request.status;
            }
        }
    } catch (error) {
        console.error('Report Page DB Error:', error);
    }

    // If pending but session_id exists, ideally we'd verify with Stripe here too
    // But webhook should have handled it. If not, user sees pending.

    if (reportStatus !== 'paid') {
        return (
            <div className="min-h-screen bg-background pt-24 pb-12 px-4">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg inline-flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Payment Required</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Report for VIN: {vin}</h1>
                    <p className="text-muted-foreground">
                        Access to this report is restricted. Please complete payment to view the full history.
                    </p>
                    <div className="pt-4">
                        <Link
                            href={`/vin-check?vin=${vin}`}
                            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                        >
                            Go to Payment
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Success View (Mock Report Data)
    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">Report Generated Successfully</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Vehicle History Report</h1>
                        <p className="text-muted-foreground mt-1">VIN: {vin}</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="inline-flex items-center gap-2 h-9 px-4 rounded-md border bg-background hover:bg-accent text-sm font-medium transition-colors">
                            <Download className="h-4 w-4" />
                            PDF
                        </button>
                        <button className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors">
                            <FileText className="h-4 w-4" />
                            Print
                        </button>
                    </div>
                </div>

                {/* Mock Report Content */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between"><dt className="text-muted-foreground">Make</dt><dd className="font-medium">Toyota</dd></div>
                            <div className="flex justify-between"><dt className="text-muted-foreground">Model</dt><dd className="font-medium">Camry</dd></div>
                            <div className="flex justify-between"><dt className="text-muted-foreground">Year</dt><dd className="font-medium">2019</dd></div>
                            <div className="flex justify-between"><dt className="text-muted-foreground">Body Type</dt><dd className="font-medium">Sedan</dd></div>
                            <div className="flex justify-between"><dt className="text-muted-foreground">Colour</dt><dd className="font-medium">White</dd></div>
                        </dl>
                    </div>

                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Registration Status</h3>
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md mb-4">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">Currently Registered</span>
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between"><dt className="text-muted-foreground">State</dt><dd className="font-medium">VIC</dd></div>
                            <div className="flex justify-between"><dt className="text-muted-foreground">Expiry</dt><dd className="font-medium">15 Aug 2026</dd></div>
                        </dl>
                    </div>

                    <div className="bg-card rounded-lg border p-6 shadow-sm md:col-span-2">
                        <h3 className="text-lg font-semibold mb-4">Stolen & Written-Off Check</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                                <div>
                                    <p className="font-medium text-green-900">Stolen Status</p>
                                    <p className="text-sm text-green-700">No stolen record found</p>
                                </div>
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                                <div>
                                    <p className="font-medium text-green-900">Written-Off Status</p>
                                    <p className="text-sm text-green-700">No written-off record found</p>
                                </div>
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
