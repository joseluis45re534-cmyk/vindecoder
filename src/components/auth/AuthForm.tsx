'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, User, ShieldCheck, CheckCircle2, MailCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const PERKS = ['All your reports in one place', 'Manage your subscription', 'Secure & private'];

// Friendlier copy for the handful of Supabase auth errors users actually hit.
// Takes the whole error so we can sanitize opaque payloads (e.g. "{}") that
// GoTrue returns when confirmation-email sending fails.
function friendlyError(err: unknown): string {
    const raw = String(
        (err && typeof err === 'object' && 'message' in err ? (err as { message?: unknown }).message : err) ?? '',
    ).trim();
    const m = raw.toLowerCase();
    // Network-level failure (Supabase unreachable / misconfigured / offline) —
    // supabase-js surfaces this as "Failed to fetch" / "NetworkError" / "Load failed".
    if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('load failed') || m.includes('fetch failed')) {
        return "We couldn't reach the account service right now. Please try again in a moment.";
    }
    if (m.includes('invalid login credentials')) return 'Incorrect email or password.';
    if (m.includes('already registered') || m.includes('already exists') || m.includes('user already')) return 'An account with this email already exists — try signing in.';
    if (m.includes('email not confirmed')) return 'Please confirm your email first — check your inbox for the link.';
    if (m.includes('password should be at least') || m.includes('weak password')) return 'Password must be at least 6 characters.';
    if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts — please wait a minute and try again.';
    if (m.includes('sending') || m.includes('confirmation email') || m.includes('smtp') || m.includes('unexpected_failure')) {
        return "We couldn't send your confirmation email — the email service looks misconfigured. Please try again shortly.";
    }
    // Never surface an empty/opaque payload.
    if (!raw || raw === '{}' || raw === '[object Object]') return 'Something went wrong — please try again.';
    return raw;
}

function Form({ mode }: { mode: 'login' | 'register' }) {
    const router = useRouter();
    const params = useSearchParams();
    const isRegister = mode === 'register';
    const next = params.get('next') || '/account';
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmSent, setConfirmSent] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { name }, emailRedirectTo },
                });
                if (error) {
                    setError(friendlyError(error));
                    return;
                }
                // No session means email confirmation is required.
                if (!data.session) {
                    setConfirmSent(true);
                    return;
                }
                router.push(next);
                router.refresh();
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    setError(friendlyError(error));
                    return;
                }
                router.push(next);
                router.refresh();
            }
        } catch {
            setError('Something went wrong — please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (confirmSent) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 py-16">
                <div className="w-full max-w-md text-center bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 p-7 sm:p-9">
                    <span className="inline-flex w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 items-center justify-center mb-5">
                        <MailCheck className="w-7 h-7" aria-hidden="true" />
                    </span>
                    <h1 className="font-display text-2xl font-bold text-slate-900">Confirm your email</h1>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        We sent a confirmation link to <span className="font-semibold text-slate-700">{email}</span>. Click it
                        to activate your account, then sign in.
                    </p>
                    <p className="text-xs text-slate-400 mt-4">Didn&apos;t get it? Check spam, or wait a minute and try again.</p>
                    <Link
                        href="/login"
                        className="mt-6 inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:brightness-110 transition"
                    >
                        Go to sign in
                    </Link>
                </div>
            </div>
        );
    }

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
