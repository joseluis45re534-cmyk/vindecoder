"use client";

import { CheckCircle2, AlertCircle, FileText, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

// Only defining types for the mock data structure we use
interface ReportData {
    vin: string;
    reportDate: string;
    vehicleDetails: {
        make: string;
        model: string;
        year: number;
        bodyType: string;
        colour: string;
        engineNumber: string;
        registration: {
            state: string;
            expiry: string;
            status: string;
        };
    };
    ppsr: {
        stolen: string;
        writtenOff: string;
        finance: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        encumbrance: any[];
    };
    nevdis: {
        stolen: string;
        writtenOff: string;
    };
    odometer: {
        status: string;
        readings: Array<{ date: string; reading: number; source: string }>;
    };
}

interface ReportViewProps {
    report: ReportData;
}

export function ReportView({ report }: ReportViewProps) {
    const isStolenClear = report.ppsr.stolen.includes("NO") && report.nevdis.stolen === "CLEAR";
    const isWrittenOffClear = report.ppsr.writtenOff.includes("NO") && report.nevdis.writtenOff === "CLEAR";
    const isFinanceClear = report.ppsr.finance.includes("NO");

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <div className="flex items-center gap-2 text-green-600 mb-2 bg-green-50 w-fit px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Report Generated Successfully
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Vehicle History Report</h1>
                    <p className="text-muted-foreground mt-1 font-mono">VIN: {report.vin}</p>
                    <p className="text-xs text-muted-foreground mt-1">Generated: {new Date(report.reportDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" /> PDF
                    </Button>
                    <Button size="sm">
                        <Printer className="h-4 w-4 mr-2" /> Print
                    </Button>
                </div>
            </div>

            {/* Vehicle Details */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center"><FileText className="h-5 w-5 mr-2 text-primary" /> Vehicle Details</h3>
                    <dl className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-dashed pb-2"><dt className="text-muted-foreground">Make</dt><dd className="font-medium">{report.vehicleDetails.make}</dd></div>
                        <div className="flex justify-between border-b border-dashed pb-2"><dt className="text-muted-foreground">Model</dt><dd className="font-medium">{report.vehicleDetails.model}</dd></div>
                        <div className="flex justify-between border-b border-dashed pb-2"><dt className="text-muted-foreground">Year</dt><dd className="font-medium">{report.vehicleDetails.year}</dd></div>
                        <div className="flex justify-between border-b border-dashed pb-2"><dt className="text-muted-foreground">Body Type</dt><dd className="font-medium">{report.vehicleDetails.bodyType}</dd></div>
                        <div className="flex justify-between border-b border-dashed pb-2"><dt className="text-muted-foreground">Colour</dt><dd className="font-medium">{report.vehicleDetails.colour}</dd></div>
                        <div className="flex justify-between pt-1"><dt className="text-muted-foreground">Engine No.</dt><dd className="font-medium">{report.vehicleDetails.engineNumber}</dd></div>
                    </dl>
                </div>

                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center"><CheckCircle2 className="h-5 w-5 mr-2 text-green-600" /> Registration Status</h3>
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md mb-4 border border-green-100">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">{report.vehicleDetails.registration.status}</span>
                    </div>
                    <dl className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-dashed pb-2"><dt className="text-muted-foreground">State</dt><dd className="font-medium">{report.vehicleDetails.registration.state}</dd></div>
                        <div className="flex justify-between pt-1"><dt className="text-muted-foreground">Expiry</dt><dd className="font-medium">{new Date(report.vehicleDetails.registration.expiry).toLocaleDateString()}</dd></div>
                    </dl>
                </div>

                {/* Critical Checks */}
                <div className="bg-card rounded-lg border p-6 shadow-sm md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 flex items-center"><AlertCircle className="h-5 w-5 mr-2 text-orange-500" /> Value & Safety Checks</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className={`flex flex-col p-4 rounded-lg border ${isStolenClear ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            <p className={`font-medium mb-1 ${isStolenClear ? 'text-green-900' : 'text-red-900'}`}>Stolen Check</p>
                            <p className={`text-sm ${isStolenClear ? 'text-green-700' : 'text-red-700'}`}>{isStolenClear ? "Clear" : "STOLEN RECORD FOUND"}</p>
                            <div className="mt-2 flex justify-end">
                                {isStolenClear ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
                            </div>
                        </div>

                        <div className={`flex flex-col p-4 rounded-lg border ${isWrittenOffClear ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            <p className={`font-medium mb-1 ${isWrittenOffClear ? 'text-green-900' : 'text-red-900'}`}>Written-Off Check</p>
                            <p className={`text-sm ${isWrittenOffClear ? 'text-green-700' : 'text-red-700'}`}>{isWrittenOffClear ? "Clear" : "WRITTEN-OFF RECORD"}</p>
                            <div className="mt-2 flex justify-end">
                                {isWrittenOffClear ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
                            </div>
                        </div>

                        <div className={`flex flex-col p-4 rounded-lg border ${isFinanceClear ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'}`}>
                            <p className={`font-medium mb-1 ${isFinanceClear ? 'text-green-900' : 'text-yellow-900'}`}>Finance Check</p>
                            <p className={`text-sm ${isFinanceClear ? 'text-green-700' : 'text-yellow-700'}`}>{isFinanceClear ? "Clear" : "FINANCE OWING"}</p>
                            <div className="mt-2 flex justify-end">
                                {isFinanceClear ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-yellow-600" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Odometer History */}
                <div className="bg-card rounded-lg border p-6 shadow-sm md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Odometer History</h3>
                    <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Date</th>
                                    <th className="px-4 py-3 text-left font-medium">Reading</th>
                                    <th className="px-4 py-3 text-left font-medium">Source</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {report.odometer.readings.map((reading, index) => (
                                    <tr key={index} className="hover:bg-muted/10">
                                        <td className="px-4 py-3">{reading.date}</td>
                                        <td className="px-4 py-3 font-mono">{reading.reading.toLocaleString()} km</td>
                                        <td className="px-4 py-3 text-muted-foreground">{reading.source}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
