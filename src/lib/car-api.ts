// src/lib/car-api.ts

export interface LiveVehicleData {
    Make?: string;
    Model?: string;
    Year?: string;
    Description?: string;
    RegistrationYear?: string;
    CarMake?: { CurrentTextValue: string };
    CarModel?: { CurrentTextValue: string };
    Colour?: string;
    VechileIdentificationNumber?: string;
    Engine?: string;
    Stolen?: string;
    RegistrationSerialNumber?: string;
    ComplianceDate?: string;
    Expiry?: string;
    State?: string;
    ImageUrl?: string;
}

export interface StandardReport {
    vehicleInfo: {
        vin: string;
        make: string;
        model: string;
        year: string;
        engineId: string;
        colour: string;
        registrationState?: string;
        registrationExpiry?: string;
    };
    stolenCheck: {
        status: 'clear' | 'stolen' | 'unknown';
        details: string;
    };
    financeCheck: {
        status: 'clear' | 'encumbered' | 'unknown';
        details: string;
    };
    wovrCheck: {
        status: 'clear' | 'written_off' | 'unknown';
        details: string;
    };
    images: string[];
}

export async function fetchLiveVehicleData(vinOrRego: string, state: string = 'NSW', apiUser?: string, apiPass?: string): Promise<StandardReport | null> {
    const user = apiUser || process.env.CAR_REG_API_USER;
    const pass = apiPass || process.env.CAR_REG_API_PASS;

    if (!user || !pass) {
        throw new Error('CAR_REG_API credentials are not configured');
    }

    // The API seems to prefer CheckAustralia for Rego. For VIN, we previously tried CheckVIN, but it throws 500 errors for standard Australian VINs (like the VF Ute).
    // The unified CheckAustralia endpoint successfully resolves both License Plates and VINs using the RegistrationNumber parameter.
    const url = `https://www.carregistrationapi.com/api/reg.asmx/CheckAustralia?RegistrationNumber=${encodeURIComponent(vinOrRego)}&State=${encodeURIComponent(state)}&username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`CarRegAPI HTTP Error: ${response.status}`);
            return null;
        }

        const xmlText = await response.text();

        // The API returns XML with a <vehicleJson> CDATA or text node inside it.
        // We'll extract it using a simple regex to avoid needing a heavy XML parser.
        const jsonMatch = xmlText.match(/<vehicleJson>([\s\S]*?)<\/vehicleJson>/);

        if (!jsonMatch || !jsonMatch[1]) {
            console.error('CarRegAPI: Could not extract vehicleJson from response', xmlText.slice(0, 200));
            return null;
        }

        const rawData: LiveVehicleData = JSON.parse(jsonMatch[1]);

        // Normalize to our standard report format so the frontend doesn't break
        const standardReport: StandardReport = {
            vehicleInfo: {
                vin: rawData.VechileIdentificationNumber || vinOrRego,
                make: rawData.CarMake?.CurrentTextValue || rawData.Make || 'Unknown',
                model: rawData.CarModel?.CurrentTextValue || rawData.Model || 'Unknown',
                year: rawData.RegistrationYear || rawData.Year || 'Unknown',
                engineId: rawData.Engine || 'N/A',
                colour: rawData.Colour || 'Unknown',
                registrationState: rawData.State || state,
                registrationExpiry: rawData.Expiry || 'Unknown'
            },
            stolenCheck: {
                status: rawData.Stolen && rawData.Stolen.toLowerCase() !== 'false' && rawData.Stolen !== '' ? 'stolen' : 'clear',
                details: rawData.Stolen ? 'Vehicle has a stolen record marker.' : 'No stolen records found.'
            },
            financeCheck: {
                // carregistrationapi generic doesn't always include PPSR finance
                // We default to unknown or clear based on what they provide
                status: 'unknown',
                details: 'PPSR equivalent finance check not explicitly provided in this tier.'
            },
            wovrCheck: {
                status: 'unknown',
                details: 'WOVR (Written-off) status not explicitly provided in this tier.'
            },
            images: rawData.ImageUrl ? [rawData.ImageUrl] : []
        };

        return standardReport;

    } catch (error) {
        console.error('CarRegAPI Fetch Error:', error);
        return null;
    }
}
