import { redirect } from 'next/navigation';
import { getAuthUserServer } from '@/lib/auth-server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { ReportGenerationLoader } from '@/components/ReportGenerationLoader';
import { ReportView } from '@/components/ReportView';

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

    let vinRequest = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let reportData: any = null;

    // Check database
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
                // Mock for local dev
                if (session_id) {
                    vinRequest = { id: 1, status: 'paid', vin_number: vin };
                }
            }
        }

        if (db) {
            // 1. Fetch VIN Request
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            vinRequest = await db.prepare(
                'SELECT * FROM vin_requests WHERE vin_number = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1'
            )
                .bind(vin, user.userId)
                .first();

            // 2. Fetch Report if request exists and is paid
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (vinRequest && (vinRequest as any).status === 'paid') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const reportRecord: any = await db.prepare(
                    'SELECT report_data FROM vin_reports WHERE vin_request_id = ?'
                )
                    .bind((vinRequest as any).id)
                    .first();

                if (reportRecord) {
                    reportData = JSON.parse(reportRecord.report_data);
                }
            }
        }
    } catch (error) {
        console.error('Report Page DB Error:', error);
    }

    // Status Determination
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = vinRequest ? (vinRequest as any).status : 'pending';

    if (status !== 'paid') {
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

    // Payment Confirmed
    if (reportData) {
        // Report Exists -> Show View
        return (
            <div className="min-h-screen bg-background pt-24 pb-12 px-4">
                <ReportView report={reportData} />
            </div>
        );
    } else {
        // Report Missing -> Show Generator (Client Component triggers API)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (
            <div className="min-h-screen bg-background pt-24 pb-12 px-4">
                <ReportGenerationLoader vinRequestId={(vinRequest as any).id} />
            </div>
        );
    }
}
