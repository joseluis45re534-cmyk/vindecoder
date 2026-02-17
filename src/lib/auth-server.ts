import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function getAuthUserServer() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
        return null;
    }

    try {
        const payload = await verifyToken(token);
        return payload;
    } catch {
        return null;
    }
}
