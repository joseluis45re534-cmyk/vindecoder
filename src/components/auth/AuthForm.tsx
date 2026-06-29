'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, User, ShieldCheck, CheckCircle2 } from 'lucide-react';

const PERKS = ['All your reports in one place', 'Manage your subscription', 'Secure & private'];

function Form({ mode }: { mode: 'login' | 'register' }) {
    const router = useRouter();
    const params = useSearchParams();
    const isRegister = mode === 'register';
    const next = params.get('next') || '/account';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(isRegister ? '/api/auth/register' : '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isRegister ? { email, password, name } : { email, password }),
            });
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            if (res.ok) {
                router.push(next);
                router.refresh();
            } else {
                setError(data.error || 'Something went wrong — please try again.');
            }
        } catch {
            setError('Network error — please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <span className="inline-flex w-12 h-12 rounded-2xl bg-primary/10 text-primary items-center justify-center mb-4">
                        <ShieldCheck className="w-6 h-6" aria-hidden="true" />
                    </span>
                    <h1 className="font-display text-2xl font-bold text-slate-900">
                        {isRegister ? 'Create your account' : 'Welcome back'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5">
                        {isRegister ? 'Save your reports and manage your subscription.' : 'Sign in to your dashboard.'}
                    </p>
                </div>

                <form onSubmit={submit} className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 p-6 sm:p-7 space-y-4">
                    {isRegister && (
                        <Field icon={User} label="Name" htmlFor="name">
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                                placeholder="Your name (optional)"
                                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                            />
                        </Field>
                    )}

                    <Field icon={Mail} label="Email" htmlFor="email">
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            placeholder="you@example.com"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                    </Field>

                    <Field icon={Lock} label="Password" htmlFor="password">
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={isRegister ? 'new-password' : 'current-password'}
                            required
                            minLength={isRegister ? 8 : undefined}
                            placeholder={isRegister ? 'At least 8 characters' : '••••••••'}
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                    </Field>

                    {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-xl hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : isRegister ? 'Create account' : 'Sign in'}
                    </button>

                    <p className="text-center text-sm text-slate-500">
                        {isRegister ? (
                            <>
                                Already have an account?{' '}
                                <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
                            </>
                        ) : (
                            <>
                                New here?{' '}
                                <Link href="/register" className="font-semibold text-primary hover:underline">Create an account</Link>
                            </>
                        )}
                    </p>
                </form>

                {isRegister && (
                    <ul className="mt-6 flex flex-col items-center gap-2">
                        {PERKS.map((p) => (
                            <li key={p} className="flex items-center gap-2 text-sm text-slate-500">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" /> {p}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

function Field({ icon: Icon, label, htmlFor, children }: { icon: typeof Mail; label: string; htmlFor: string; children: React.ReactNode }) {
    return (
        <div>
            <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                {children}
            </div>
        </div>
    );
}

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
    return (
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>}>
            <Form mode={mode} />
        </Suspense>
    );
}
