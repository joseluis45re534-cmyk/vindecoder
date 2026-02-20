import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateVin } from "@/lib/vin-validation";
import { Loader2, Search } from "lucide-react"; // Import Search icon
import { motion, useAnimation } from "framer-motion";

interface VinInputProps {
    className?: string;
    onScanStart?: () => void;
    onScanComplete?: () => void;
}

export function VinInput({ className, onScanStart, onScanComplete }: VinInputProps) {

    const [vin, setVin] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const controls = useAnimation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const validation = validateVin(vin);
        if (!validation.isValid) {
            setError(validation.error || "Invalid VIN");
            setIsLoading(false);
            // Trigger Shake Animation
            controls.start({
                x: [0, -10, 10, -10, 10, 0],
                transition: { duration: 0.4 }
            });
            return;
        }

        // Notify parent to start scanning animation
        if (onScanStart) {
            onScanStart();
            // Simulate scanning delay
            await new Promise(resolve => setTimeout(resolve, 2000));
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

            if (onScanComplete) onScanComplete();

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
            if (onScanComplete) onScanComplete();
            // Fallback
            router.push(`/vin-check?vin=${vin.toUpperCase()}`);
        }
    };

    return (
        <div className={`w-full max-w-md mx-auto ${className}`}>
            <motion.form
                onSubmit={handleSubmit}
                className="flex flex-col gap-2 relative"
                animate={controls}
            >
                <label htmlFor="vin-input" className="sr-only">Enter VIN</label>
                <div className="relative flex items-center group">
                    <div className="absolute left-3 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        id="vin-input"
                        type="text"
                        placeholder="Enter 17-digit VIN"
                        value={vin}
                        onChange={(e) => {
                            setVin(e.target.value.toUpperCase());
                            if (error) setError(null);
                        }}
                        className="flex h-14 w-full rounded-full border border-input bg-background/80 backdrop-blur-sm px-10 py-2 text-lg shadow-sm transition-all duration-300 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary focus-visible:shadow-lg dark:focus-visible:shadow-[0_0_20px_rgba(var(--primary),0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                        maxLength={17}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || vin.length === 0}
                        className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Check"}
                    </button>
                </div>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive font-medium px-4"
                    >
                        {error}
                    </motion.p>
                )}
            </motion.form>
            <p className="text-xs text-muted-foreground mt-3 text-center opacity-80">
                🔒 Secure 256-bit encrypted search
            </p>
        </div>
    );
}
