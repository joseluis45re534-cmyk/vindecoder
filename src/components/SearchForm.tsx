
'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function SearchForm() {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const validateInput = (value: string) => {
        const clean = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        if (clean.length === 17 && !/[IOQ]/.test(clean)) return { type: 'VIN', value: clean };
        if (clean.length > 0 && clean.length <= 8) return { type: 'PLATE', value: clean };
        return null;
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const valid = validateInput(input);
        if (!valid) {
            setError('Please enter a valid 17-character VIN or U.S. license plate.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/check-vin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [valid.type.toLowerCase()]: valid.value }),
            });
            const data = await response.json() as any;

            if (data.success && data.reportId) {
                router.push(`/report/${data.reportId}`);
            } else {
                setError(data.error || 'Failed to generate report.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value.toUpperCase())}
                    placeholder="Enter VIN or License Plate"
                    aria-label="VIN or U.S. license plate"
                    className="w-full px-6 py-4 rounded-full border-2 border-gray-200 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all pl-12"
                    disabled={loading}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                <button
                    type="submit"
                    disabled={loading || !input}
                    className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white rounded-full px-8 font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[100px]"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Check'}
                </button>
            </form>
            {error && <p className="mt-3 text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm inline-block">{error}</p>}
        </div>
    );
}
