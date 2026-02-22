"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = await res.json() as any;

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            // Redirect to admin dashboard
            router.push("/admin");
            router.refresh();
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="p-8 text-center bg-slate-900 border-b border-slate-800">
                    <ShieldAlert className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                    <p className="text-slate-400 text-sm mt-2">Secure access restricted to authorized personnel</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-80">Admin Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                placeholder="name@vindecoder.com.au"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-80">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border bg-transparent focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-semibold"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                            {isLoading ? "Authenticating..." : "Login to Dashboard"}
                        </Button>
                    </form>
                </div>
            </div>
            <div className="mt-8 text-center text-sm text-slate-500">
                &copy; {new Date().getFullYear()} VINDecoder Australia
            </div>
        </div>
    );
}
