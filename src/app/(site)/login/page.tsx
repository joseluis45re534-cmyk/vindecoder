import type { Metadata } from 'next';
import AuthForm from '@/components/auth/AuthForm';

export const runtime = 'edge';

export const metadata: Metadata = {
    title: 'Sign in · CarVinLookup',
    description: 'Sign in to your CarVinLookup account to view your vehicle history reports and manage your subscription.',
    robots: { index: false, follow: false },
};

export default function LoginPage() {
    return <AuthForm mode="login" />;
}
