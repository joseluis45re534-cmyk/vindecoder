
export interface VehicleData {
    vin: string;
    make: string;
    model: string;
    year: number;
    color: string;
    body_type: string;
    engine: string;
    registration: {
        plate: string;
        state: string;
        expiry: string;
    };
    title_brand: 'Clean' | 'Salvage' | 'Rebuilt' | 'Junk' | 'Flood';
    theft_status: 'Clear' | 'Theft Record';
    lien_status: 'Clear' | 'Active Lien';
    odometer_status: 'Verified' | 'Rollback Suspected' | 'Not Actual';
}

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;

/**
 * Decode a VIN with auto.dev (real vehicle specs/identity). Returns null on any
 * failure so callers can fall back to the demo generator. auto.dev provides
 * make/model/year/trim/engine/body — not title/theft/lien history, so those
 * stay behind the paywall (shown as locked in the report preview).
 */
async function fetchFromAutoDev(vin: string, apiKey: string): Promise<VehicleData | null> {
    try {
        const res = await fetch(`https://api.auto.dev/vin/${encodeURIComponent(vin)}`, {
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        });
        if (!res.ok) return null;
        const d = (await res.json()) as Record<string, unknown>;
        const vehicle = (d.vehicle as Record<string, unknown>) || {};
        const year = Number(vehicle.year ?? d.year);
        const make = String(d.make ?? vehicle.make ?? '').toUpperCase();
        const model = String(d.model ?? '').toUpperCase();
        if (!make || !model || !year) return null;

        return {
            vin,
            make,
            model,
            year,
            color: String(d.color ?? 'N/A').toUpperCase(),
            body_type: String(d.body ?? vehicle.body ?? 'N/A').toUpperCase(),
            engine: String(d.engine ?? 'N/A'),
            registration: { plate: '', state: '', expiry: '' },
            // History fields aren't part of a VIN decode — surfaced behind the
            // paywall pending a history provider (NMVTIS/NICB).
            title_brand: 'Clean',
            theft_status: 'Clear',
            lien_status: 'Clear',
            odometer_status: 'Verified',
        };
    } catch {
        return null;
    }
}

export async function fetchVehicleData(identifier: string, apiKey?: string): Promise<VehicleData> {
    const cleanId = identifier.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Real data via auto.dev when a key is set and the input is a valid VIN.
    if (apiKey && VIN_RE.test(cleanId)) {
        const real = await fetchFromAutoDev(cleanId, apiKey);
        if (real) return real;
    }

    // Demo fallback (no key, plate lookup, or provider error).
    await new Promise(resolve => setTimeout(resolve, 800));

    const lastChar = cleanId.slice(-1);

    const baseVehicle = {
        vin: cleanId.length === 17 ? cleanId : `1HGCM...${cleanId.slice(0, 5)}`,
        make: 'TOYOTA',
        model: 'CAMRY',
        year: 2021,
        color: 'WHITE',
        body_type: 'SEDAN',
        engine: '2.5L I4',
        registration: {
            plate: cleanId.length < 10 ? cleanId : 'ABC-1234',
            state: 'CA',
            expiry: '2025-12-31',
        },
        title_brand: 'Clean' as const,
        theft_status: 'Clear' as const,
        lien_status: 'Clear' as const,
        odometer_status: 'Verified' as const,
    };

    // Deterministic Mock Logic based on last character
    if (lastChar === 'S') return { ...baseVehicle, theft_status: 'Theft Record', make: 'SUBARU', model: 'WRX', year: 2019 };
    if (lastChar === 'W') return { ...baseVehicle, title_brand: 'Salvage', make: 'CHEVROLET', model: 'MALIBU', year: 2015 };
    if (lastChar === 'F') return { ...baseVehicle, lien_status: 'Active Lien', make: 'FORD', model: 'F-150', year: 2023 };
    if (lastChar === 'O') return { ...baseVehicle, odometer_status: 'Rollback Suspected', make: 'HONDA', model: 'ACCORD', year: 2017 };

    return baseVehicle;
}
