// This file is a placeholder for D1 database connection
// In Cloudflare Pages/Workers, the DB binding is automatically available
// via the request context or env

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CloudflareEnv {
    DB: any;
}

// Helper type for user
export interface User {
    id: number;
    email: string;
    password_hash: string;
    created_at: string;
}

// Helper type for VIN request
export interface VinRequest {
    id: number;
    user_id: number;
    vin_number: string;
    status: 'pending' | 'paid' | 'completed';
    created_at: string;
}
