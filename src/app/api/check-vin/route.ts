
import { NextResponse } from 'next/server';
import { fetchVehicleData } from '@/lib/vehicle-api';
import { getEnv } from '@/lib/cf';

export const runtime = 'edge';

// Country of origin from the VIN's first character (WMI region).
function vinCountry(vin: string): string {
    const c = (vin[0] || '').toUpperCase();
    if ('1457'.includes(c)) return 'United States';
    if (c === '2') return 'Canada';
    if (c === '3') return 'Mexico';
    if ('JK'.includes(c)) return c === 'J' ? 'Japan' : 'South Korea';
    if (c === 'L') return 'China';
    if ('ST'.includes(c)) return 'United Kingdom';
    if (c === 'W') return 'Germany';
    if ('VZ'.includes(c)) return c === 'Z' ? 'Italy' : 'France';
    if (c === 'Y') return 'Sweden';
    if (c === '9') return 'Brazil';
    return 'Imported';
}

export async function POST(request: Request) {
    try {
        const body = await request.json() as { vin?: string; plate?: string };
        const identifier = body.vin || body.plate;

        if (!identifier) {
            return NextResponse.json({ error: 'VIN or Plate is required' }, { status: 400 });
        }

        const env = await getEnv();
        const data = await fetchVehicleData(identifier, env.AUTODEV_API_KEY);
        const reportId = identifier.toUpperCase();

        return NextResponse.json({
            success: true,
            reportId,
            preview: {
                make: data.make,
                model: data.model,
                year: data.year,
                vin: data.vin,
                country: vinCountry(reportId),
                engine: data.engine,
                bodyType: data.body_type,
                trim: data.trim,
                drivetrain: data.drivetrain,
                transmission: data.transmission,
                photoUrl: data.photo_url,
            }
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
