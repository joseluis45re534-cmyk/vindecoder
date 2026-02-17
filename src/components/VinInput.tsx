"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateVin } from "@/lib/vin-validation";
import { Loader2 } from "lucide-react";

interface VinInputProps {
    className?: string; // Add className prop for flexibility
}


export function VinInput({ className }: VinInputProps) {
    const [vin, setVin] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const validation = validateVin(vin);
        if (!validation.isValid) {
            setError(validation.error || "Invalid VIN");
            setIsLoading(false);
            return;
        }

        // Save to local storage
        if (typeof window !== "undefined") {
            localStorage.setItem("currentVin", vin.toUpperCase());
        }

        // Try to save to database via API
        try {
            const response = await fetch("/api/save-vin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vin: vin.toUpperCase() }),
            });

            if (response.status === 401) {
                router.push(`/login?redirect=/vin-check?vin=${vin.toUpperCase()}`);
                return;
            }

            if (!response.ok) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = (await response.json()) as any;
                throw new Error(data.error || "Failed to save VIN");
            }

            // Redirect to VIN check page for preview
            router.push(`/vin-check?vin=${vin.toUpperCase()}`);
        } catch (err) {
            console.error(err);
            // Fallback
            router.push(`/vin-check?vin=${vin.toUpperCase()}`);
        }
    };

    return (
        <div className={`w-full max-w-md mx-auto ${className}`}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <label htmlFor="vin-input" className="sr-only">Enter VIN</label>
                <div className="relative flex items-center">
                    <input
                        id="vin-input"
                        type="text"
                        placeholder="Enter 17-digit VIN"
                        value={vin}
                        onChange={(e) => {
                            setVin(e.target.value.toUpperCase());
                            if (error) setError(null);
                        }}
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        maxLength={17}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || vin.length === 0}
                        className="absolute right-1 top-1 bottom-1 px-4 bg-primary text-primary-foreground font-medium rounded-sm hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Check"}
                    </button>
                </div>
                {error && <p className="text-sm text-destructive font-medium px-1">{error}</p>}
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
                We check 100+ databases instantly.
            </p>
        </div>
    );
}
