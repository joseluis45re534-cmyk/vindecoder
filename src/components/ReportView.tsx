"use client";

import { CheckCircle2, AlertCircle, FileText, Download, Printer, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StandardReport } from "@/lib/car-api";

interface ReportViewProps {
    report: StandardReport;
}

export function ReportView({ report }: ReportViewProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <div className="flex items-center gap-2 text-green-600 mb-2 bg-green-50 w-fit px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Live Report Generated Successfully
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Vehicle History Report</h1>
                    <p className="text-muted-foreground mt-1 font-mono">VIN: {report.vehicleInfo.vin}</p>
                    <p className="text-xs text-muted-foreground mt-1">Generated: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 print:hidden">
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Download className="h-4 w-4 mr-2" /> Save PDF
                    </Button>
                    <Button size="sm" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" /> Print
                    </Button>
                </div>
            </div>

            {/* Images */}
            {report.images && report.images.length > 0 && (
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center"><Car className="h-5 w-5 mr-2 text-primary" /> Vehicle Identification</h3>
                    <div className="flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={report.images[0]} alt="Vehicle Make/Model" className="max-h-64 rounded object-contain" />
                    </div>
                </div>
            )}

            {/* Vehicle Details */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center"><FileText className="h-5 w-5 mr-2 text-primary" /> Vehicle Details</h3>
                    <dl className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-dashed pb-2"><dt className="text-muted-foreground">Make</dt><dd className="font-medium">{report.vehicleInfo.make}</dd></div>
                        <div className="flex justify-between border-b border-dashed pb-2"><dt className="text-muted-foreground">Model</dt><dd className="font-medium">{report.vehicleInfo.model}</dd></div>
                        <div className="flex justify-between border-b border-dashed pb-2"><dt className="text-muted-foreground">Year</dt><dd className="font-medium">{report.vehicleInfo.year}</dd></div>
                        <div className="flex justify-between border-b border-dashed pb-2"><dt className="text-muted-foreground">Colour</dt><dd className="font-medium">{report.vehicleInfo.colour}</dd></div>
                        <div className="flex justify-between pt-1"><dt className="text-muted-foreground">Engine No.</dt><dd className="font-medium">{report.vehicleInfo.engineId}</dd></div>
                    </dl>
                </div>

                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center"><CheckCircle2 className="h-5 w-5 mr-2 text-green-600" /> Registration Status</h3>
                    <dl className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-dashed pb-2"><dt className="text-muted-foreground">State</dt><dd className="font-medium">{report.vehicleInfo.registrationState}</dd></div>
                        <div className="flex justify-between pt-1"><dt className="text-muted-foreground">Expiry</dt><dd className="font-medium">{report.vehicleInfo.registrationExpiry}</dd></div>
                    </dl>
                </div>

                {/* Critical Checks */}
                <div className="bg-card rounded-lg border p-6 shadow-sm md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 flex items-center"><AlertCircle className="h-5 w-5 mr-2 text-orange-500" /> Safety & Legal Checks</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Stolen Check */}
                        <div className={`flex flex-col p-4 rounded-lg border ${report.stolenCheck.status === 'stolen' ? 'bg-red-50 border-red-100' : report.stolenCheck.status === 'clear' ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                            <p className="font-medium mb-1">Stolen Check</p>
                            <p className="text-sm">{report.stolenCheck.details}</p>
                            <div className="mt-2 flex justify-end">
                                {report.stolenCheck.status === 'clear' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
                            </div>
                        </div>

                        {/* Written-off Check */}
                        <div className={`flex flex-col p-4 rounded-lg border ${report.wovrCheck.status === 'clear' ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                            <p className="font-medium mb-1">Written-Off Check</p>
                            <p className="text-sm">{report.wovrCheck.details}</p>
                            <div className="mt-2 flex justify-end">
                                {report.wovrCheck.status === 'clear' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-gray-400" />}
                            </div>
                        </div>

                        {/* Finance Check */}
                        <div className={`flex flex-col p-4 rounded-lg border ${report.financeCheck.status === 'clear' ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                            <p className="font-medium mb-1">Finance Check (PPSR)</p>
                            <p className="text-sm">{report.financeCheck.details}</p>
                            <div className="mt-2 flex justify-end">
                                {report.financeCheck.status === 'clear' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-gray-400" />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-12 print:hidden pb-12">
                Data provided by CarRegistrationAPI Australia and local authorities.
                Always perform physical inspections before purchasing a vehicle.
            </p>
        </div>
    );
}
