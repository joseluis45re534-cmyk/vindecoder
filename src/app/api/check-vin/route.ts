
import { NextResponse } from 'next/server';
import { fetchVehicleData } from '@/lib/vehicle-api';
import { getEnv } from '@/lib/cf';

export const runtime = 'edge';

export async function POST(request: Request) {
    try {
        const body = await request.json() as { vin?: string; plate?: string };
        const identifier = body.vin || body.plate;

        if (!identifier) {
            return NextResponse.json({ error: 'VIN or Plate is required' }, { status: 400 });
        }

        const env = await getEnv();
        const data = await fetchVehicleData(identifier, env.AUTODEV_API_KEY);

        // In a real app, save to DB here. 
        // For now, we just return a "reportId" which is the VIN/Plate for simplicity in this demo.
        const reportId = identifier.toUpperCase();

        return NextResponse.json({
            success: true,
            reportId,
            preview: {
                make: data.make,
                model: data.model,
                year: data.year,
            }
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
