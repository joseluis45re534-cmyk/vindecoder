
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Loader2, Lock, ShieldAlert, ShieldCheck } from 'lucide-react';

function ReportContent() {
    const params = useParams();
    const id = params.id as string;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Mock Fetch Logic
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/check-vin', {
                    method: 'POST',
                    body: JSON.stringify({ vin: id }), // Sending ID as VIN/Plate to mock endpoint
                });
                const result = await res.json() as any;

                if (result.success) {
                    // In a real app, we would get more data here.
                    // For now, let's augment the preview with local mock logic for the full view
                    // to simulate the "locked" state properly.
                    setData({
                        ...result.preview,
                        vin: id,
                        lien_status: 'LOCKED',
                        title_brand: 'LOCKED',
                        theft_status: 'LOCKED',
                        is_locked: true
                    });
                } else {
                    setError(result.error || 'Failed to load report');
                }
            } catch (err) {
                setError('Failed to load report');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-slate-500 text-sm font-medium">Pulling vehicle records…</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-medium">
                {error || 'Report not found'}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 px-8 py-7 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Vehicle History Report</h1>
                        <p className="text-blue-200/80 text-sm mt-0.5">Report ID: {id}</p>
                    </div>
                    <div className="bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur">
                        Free Preview
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-8 space-y-8">
                    {/* Vehicle Identity */}
                    <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-600/25">
                            <span className="font-extrabold text-xl">{data.year.toString().slice(-2)}</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{data.year} {data.make} {data.model}</h2>
                            <p className="text-slate-500 font-mono text-sm mt-0.5">VIN: {data.vin}</p>
                        </div>
                    </div>

                    {/* Title & History Highlights (Blurred) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Lien */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center text-center p-4 rounded-2xl">
                                <span className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                                    <Lock className="w-5 h-5 text-slate-500" aria-hidden="true" />
                                </span>
                                <span className="font-bold text-slate-900">Lien Status Hidden</span>
                                <p className="text-sm text-slate-500 mb-4">Check if there is an open loan or lien on this car.</p>
                                <button className="bg-orange-600 text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-orange-600/25 hover:bg-orange-500 transition">
                                    Unlock Full Report — $24.99
                                </button>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 blur-sm select-none">
                                <div className="flex items-center space-x-2 text-red-500 mb-2">
                                    <ShieldAlert className="w-5 h-5" aria-hidden="true" />
                                    <span className="font-bold">Active Lien</span>
                                </div>
                                <p className="text-sm text-slate-600">A lender currently holds a lien against this vehicle.</p>
                            </div>
                        </div>

                        {/* Title Brand */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center text-center p-4 rounded-2xl">
                                <span className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                                    <Lock className="w-5 h-5 text-slate-500" aria-hidden="true" />
                                </span>
                                <span className="font-bold text-slate-900">Title History Hidden</span>
                                <p className="text-sm text-slate-500 mb-4">See if it has a salvage, flood, or rebuilt title.</p>
                                <button className="bg-orange-600 text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-orange-600/25 hover:bg-orange-500 transition">
                                    Unlock Full Report — $24.99
                                </button>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 blur-sm select-none">
                                <div className="flex items-center space-x-2 text-emerald-600 mb-2">
                                    <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                                    <span className="font-bold">Clean Title</span>
                                </div>
                                <p className="text-sm text-slate-600">No salvage or brand history found in NMVTIS.</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <p className="text-slate-500 text-sm flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                        Full NMVTIS vehicle history report included.
                    </p>
                    <button className="bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold text-lg shadow-lg shadow-orange-600/25 hover:bg-orange-500 hover:scale-[1.02] transition-all">
                        Unlock Full Report Now
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ReportPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReportContent />
        </Suspense>
    );
}
