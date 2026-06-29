import type { Metadata } from 'next';
import AuthForm from '@/components/auth/AuthForm';

export const runtime = 'edge';

export const metadata: Metadata = {
    title: 'Create your account · CarVinLookup',
    description: 'Create a CarVinLookup account to save your vehicle history reports and manage your subscription.',
    robots: { index: false, follow: false },
};

export default function RegisterPage() {
    return <AuthForm mode="register" />;
}
