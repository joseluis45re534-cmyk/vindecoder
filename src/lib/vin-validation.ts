export function validateVin(vin: string): { isValid: boolean; error?: string } {
    const cleanVin = vin.toUpperCase().trim();

    // Basic length check
    if (cleanVin.length !== 17) {
        return { isValid: false, error: `VIN must be exactly 17 characters. Current length: ${cleanVin.length}` };
    }

    // Illegal characters check (I, O, Q are not allowed in standard VINs)
    if (/[IOQ]/.test(cleanVin)) {
        return { isValid: false, error: "VIN cannot contain letters I, O, or Q." };
    }

    // Alphanumeric check
    if (!/^[A-HJ-NPR-Z0-9]+$/.test(cleanVin)) {
        return { isValid: false, error: "VIN contains invalid characters. Only A-Z and 0-9 are allowed." };
    }

    // Pre-1981 vehicles might have shorter VINs, but for this SaaS we focus on modern standard.
    // We can add more complex checksum validation later if needed.

    return { isValid: true };
}
