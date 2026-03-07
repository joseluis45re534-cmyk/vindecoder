export function validateVinOrRego(input: string): { isValid: boolean; error?: string; isRego?: boolean } {
    const cleanInput = input.toUpperCase().replace(/\s+/g, '').trim();

    if (!cleanInput) {
        return { isValid: false, error: "Please enter a VIN or Registration Number." };
    }

    // Check if it's a Registration Plate (typically 2-8 characters in Australia)
    if (cleanInput.length >= 2 && cleanInput.length <= 8) {
        if (!/^[A-Z0-9]+$/.test(cleanInput)) {
            return { isValid: false, error: "Registration contains invalid characters. Only letters and numbers allowed." };
        }
        return { isValid: true, isRego: true };
    }

    // Check if it's a VIN (must be exactly 17 characters)
    if (cleanInput.length !== 17) {
        return { isValid: false, error: `Must be a 17-character VIN or a valid Rego. Current length: ${cleanInput.length}` };
    }

    // Illegal characters check for VIN (I, O, Q are not allowed in standard VINs)
    if (/[IOQ]/.test(cleanInput)) {
        return { isValid: false, error: "VIN cannot contain letters I, O, or Q." };
    }

    // Alphanumeric check for VIN
    if (!/^[A-HJ-NPR-Z0-9]+$/.test(cleanInput)) {
        return { isValid: false, error: "VIN contains invalid characters. Only A-Z and 0-9 are allowed." };
    }

    return { isValid: true, isRego: false };
}

