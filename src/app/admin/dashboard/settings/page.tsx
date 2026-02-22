"use client";

export const runtime = "edge";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSettings {
    reportPriceCent: number;
    stripePublicKey: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<AdminSettings>({
        reportPriceCent: 2999,
        stripePublicKey: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/settings");
            if (res.ok) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = await res.json() as any;
                if (data.settings) {
                    setSettings(data.settings);
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                alert("Settings saved successfully!");
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = await res.json() as any;
                alert(`Error saving settings: ${data.error}`);
            }
        } catch (error) {
            console.error("Failed to save settings", error);
            alert("An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm p-6">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">Pricing Configuration</h3>
                            <p className="text-sm text-slate-500 pb-2">Set the price for a single VIN report (in cents).</p>

                            <div>
                                <label className="block text-sm font-medium mb-1">Report Price (Cents)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                    <input
                                        type="number"
                                        required
                                        min="100" // Min $1.00
                                        value={settings.reportPriceCent}
                                        onChange={(e) => setSettings({ ...settings, reportPriceCent: parseInt(e.target.value) || 0 })}
                                        className="w-full pl-8 pr-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary outline-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                        = ${(settings.reportPriceCent / 100).toFixed(2)} AUD
                                    </span>
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-200 dark:border-slate-800" />

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">API Keys</h3>
                            <p className="text-sm text-slate-500 pb-2">
                                Store non-secret API keys here. (Highly sensitive secrets should remain in environment variables).
                            </p>

                            <div>
                                <label className="block text-sm font-medium mb-1">Stripe Publishable Key</label>
                                <input
                                    type="text"
                                    value={settings.stripePublicKey}
                                    onChange={(e) => setSettings({ ...settings, stripePublicKey: e.target.value })}
                                    placeholder="pk_test_..."
                                    className="w-full px-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Configuration
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
