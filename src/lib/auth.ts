import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function createToken(userId: number, email: string): Promise<string> {
    return new SignJWT({ userId, email })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
    try {
        const verified = await jwtVerify(token, JWT_SECRET);
        return verified.payload as { userId: number; email: string };
    } catch {
        return null;
    }
}

import { cookies } from 'next/headers';

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}
