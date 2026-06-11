
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

export async function fetchVehicleData(identifier: string): Promise<VehicleData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const cleanId = identifier.toUpperCase().replace(/[^A-Z0-9]/g, '');
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
