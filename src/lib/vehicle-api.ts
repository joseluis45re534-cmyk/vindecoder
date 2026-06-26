
export interface VehicleData {
    vin: string;
    make: string;
    model: string;
    year: number;
    color: string;
    body_type: string;
    engine: string;
    trim?: string;
    drivetrain?: string;
    transmission?: string;
    /** Real photo of THIS exact vehicle from auto.dev, when one exists. */
    photo_url?: string;
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
// auto.dev returns `engine` as either a clean string ("2.5L I4") or an object
// ({ name, size, cylinder, configuration }). Normalize to a readable string and
// reject raw codes (e.g. "5ITCG2.5") that aren't real engine descriptors.
function formatEngine(eng: unknown): string {
    if (eng && typeof eng === 'object') {
        const e = eng as Record<string, unknown>;
        const parts: string[] = [];
        const size = e.size ?? e.displacement;
        if (size) parts.push(`${size}L`);
        const conf = e.configuration ?? e.type ?? e.name;
        if (conf) parts.push(String(conf));
        else if (e.cylinder ?? e.cylinders) parts.push(`${e.cylinder ?? e.cylinders}-cyl`);
        return parts.join(' ').trim();
    }
    if (typeof eng === 'string') {
        // Accept only values that look like a real engine descriptor — reject raw
        // codes like "5ITCG2.5" that auto.dev sometimes returns.
        if (!/(\d(\.\d)?\s?(L|liter))|V\d|I\d|flat\s?\d|inline|cyl|electric|hybrid|diesel|turbo/i.test(eng)) {
            return '';
        }
        // Clean verbose strings, e.g. "3.6, Flat 6 Cylinder Engine" -> "3.6L Flat 6".
        return eng
            .replace(/cylinder engine/ig, '')
            .replace(/\bcylinder\b/ig, 'cyl')
            .replace(/\bengine\b/ig, '')
            .replace(/,\s*/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/^(\d\.\d)\b(?!\s?L)/i, '$1L');
    }
    return '';
}

// Normalize auto.dev's drivetrain text ("all wheel drive") to a compact label.
function formatDrivetrain(d: unknown): string {
    const s = String(d ?? '').toLowerCase();
    if (!s || s === 'n/a') return '';
    if (s.includes('all')) return 'AWD';
    if (s.includes('front')) return 'FWD';
    if (s.includes('rear')) return 'RWD';
    if (s.includes('four') || s.includes('4wd') || s.includes('4x4')) return '4WD';
    if (s === 'awd' || s === 'fwd' || s === 'rwd' || s === '4wd') return s.toUpperCase();
    return '';
}

// Normalize transmission ("AUTOMATED" / "MANUAL") to title case.
function formatTransmission(t: unknown): string {
    const s = String(t ?? '').toLowerCase();
    if (!s || s === 'n/a') return '';
    if (s.startsWith('auto')) return 'Automatic';
    if (s.startsWith('man')) return 'Manual';
    if (s.includes('cvt')) return 'CVT';
    return '';
}

// Real photo of the actual vehicle. auto.dev's dealer photos live on the public
// CDN retail.photos.vin as `{VIN}-1.jpg`, and they PERSIST after the live listing
// churns — so we construct the URL directly (no API key, no quota) and confirm it
// exists with a lightweight status check. Returns the URL when a real photo exists,
// or undefined (→ stock fallback) otherwise. The dedicated /photos and /listings
// endpoints are unreliable: /photos returns dead URLs, /listings only while listed.
// fetch with a hard timeout so photo lookups can never hang the request.
async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
        return await fetch(url, { ...init, signal: ctrl.signal });
    } finally {
        clearTimeout(t);
    }
}

// Real photo of THIS exact vehicle, or undefined. auto.dev dealer photos live on the
// public CDN retail.photos.vin as `{VIN}-1.jpg` and persist after the listing churns.
// We only ever show the exact vehicle's photo — never a same-model stand-in — so a
// 404 here means there is genuinely no photo of this car (→ neutral placeholder).
export async function exactVinPhoto(vin: string): Promise<string | undefined> {
    const url = `https://retail.photos.vin/${encodeURIComponent(vin)}-1.jpg`;
    try {
        const res = await fetchWithTimeout(url, {}, 4000);
        const type = res.headers.get('content-type') || '';
        res.body?.cancel(); // don't download the body — status + type is enough
        return res.ok && type.startsWith('image') ? url : undefined;
    } catch {
        return undefined;
    }
}

async function fetchFromAutoDev(vin: string, apiKey: string): Promise<VehicleData | null> {
    try {
        // Decode + exact-VIN photo run in parallel — the photo is best-effort and never blocks.
        const [res, photoUrl] = await Promise.all([
            fetch(`https://api.auto.dev/vin/${encodeURIComponent(vin)}`, {
                headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            }),
            exactVinPhoto(vin),
        ]);
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
            engine: formatEngine(d.engine) || 'N/A',
            trim: ((): string | undefined => {
                const t = String(d.trim ?? '').trim();
                // Skip junk/placeholder trims; keep real ones like "quattro".
                return t && t.toLowerCase() !== 'base' && t.toLowerCase() !== 'n/a' ? t : undefined;
            })(),
            drivetrain: formatDrivetrain(d.drive) || undefined,
            transmission: formatTransmission(d.transmission) || undefined,
            photo_url: photoUrl,
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

/** Thrown when a valid VIN can't be decoded via auto.dev (with a key present).
 *  The route turns this into a clear error instead of serving fake demo data. */
export class VinDecodeError extends Error {
    constructor() {
        super('VIN_DECODE_FAILED');
        this.name = 'VinDecodeError';
    }
}

export async function fetchVehicleData(identifier: string, apiKey?: string): Promise<VehicleData> {
    const cleanId = identifier.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Real data via auto.dev when a key is set and the input is a valid VIN.
    if (apiKey && VIN_RE.test(cleanId)) {
        let real = await fetchFromAutoDev(cleanId, apiKey);
        if (!real) {
            // One retry — auto.dev occasionally rate-limits / times out transiently.
            await new Promise((r) => setTimeout(r, 500));
            real = await fetchFromAutoDev(cleanId, apiKey);
        }
        if (real) return real;
        // Valid VIN + key present but decode still failed: surface an error rather
        // than falling through to the hardcoded demo vehicle, which would show the
        // user a completely wrong car (e.g. a Toyota Camry for an Audi VIN).
        throw new VinDecodeError();
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
