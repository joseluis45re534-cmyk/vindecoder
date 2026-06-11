
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
                {error || 'Report not found'}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 px-8 py-6 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Vehicle Report</h1>
                        <p className="text-blue-100 text-sm">Report ID: {id}</p>
                    </div>
                    <div className="bg-blue-500/30 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                        Preview Mode
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-8 space-y-8">
                    {/* Vehicle Identity */}
                    <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                            <span className="font-bold text-xl">{data.year.toString().slice(-2)}</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">{data.year} {data.make} {data.model}</h2>
                            <p className="text-gray-500">VIN: {data.vin}</p>
                        </div>
                    </div>

                    {/* Title & History Highlights (Blurred) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Lien */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                                <Lock className="w-8 h-8 text-gray-400 mb-2" aria-hidden="true" />
                                <span className="font-bold text-gray-900">Lien Status Hidden</span>
                                <p className="text-sm text-gray-500 mb-3">Check if there is an open loan or lien on this car.</p>
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:bg-green-700 transition">
                                    Unlock Full Report - $24.99
                                </button>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 blur-sm select-none">
                                <div className="flex items-center space-x-2 text-red-500 mb-2">
                                    <ShieldAlert className="w-5 h-5" aria-hidden="true" />
                                    <span className="font-bold">Active Lien</span>
                                </div>
                                <p className="text-sm text-gray-600">A lender currently holds a lien against this vehicle.</p>
                            </div>
                        </div>

                        {/* Title Brand */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                                <Lock className="w-8 h-8 text-gray-400 mb-2" aria-hidden="true" />
                                <span className="font-bold text-gray-900">Title History Hidden</span>
                                <p className="text-sm text-gray-500 mb-3">See if it has a salvage, flood, or rebuilt title.</p>
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:bg-green-700 transition">
                                    Unlock Full Report - $24.99
                                </button>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 blur-sm select-none">
                                <div className="flex items-center space-x-2 text-green-600 mb-2">
                                    <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                                    <span className="font-bold">Clean Title</span>
                                </div>
                                <p className="text-sm text-gray-600">No salvage or brand history found in NMVTIS.</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Action Bar */}
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-gray-500 text-sm">Full NMVTIS vehicle history report included.</p>
                    <button className="bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-green-700 hover:scale-105 transition-all transform">
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
