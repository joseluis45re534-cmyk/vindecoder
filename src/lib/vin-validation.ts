export function validateVinOrRego(input: string, mode?: 'vin' | 'rego'): { isValid: boolean; error?: string; isRego?: boolean } {
    const cleanInput = input.toUpperCase().replace(/\s+/g, '').trim();

    if (!cleanInput) {
        return { isValid: false, error: "Please enter a VIN or Registration Number." };
    }

    if (mode === 'rego') {
        if (cleanInput.length < 2 || cleanInput.length > 8) {
            return { isValid: false, error: `Registration must be between 2 and 8 characters. Current length: ${cleanInput.length}` };
        }
        if (!/^[A-Z0-9]+$/.test(cleanInput)) {
            return { isValid: false, error: "Registration contains invalid characters. Only letters and numbers allowed." };
        }
        return { isValid: true, isRego: true };
    }

    if (mode === 'vin') {
        if (cleanInput.length !== 17) {
            return { isValid: false, error: `VIN must be exactly 17 characters. Current length: ${cleanInput.length}` };
        }
        if (/[IOQ]/.test(cleanInput)) {
            return { isValid: false, error: "VIN cannot contain letters I, O, or Q." };
        }
        if (!/^[A-HJ-NPR-Z0-9]+$/.test(cleanInput)) {
            return { isValid: false, error: "VIN contains invalid characters. Only A-Z and 0-9 are allowed." };
        }
        return { isValid: true, isRego: false };
    }

    // Generic fallback mode if not specified (legacy)
    if (cleanInput.length >= 2 && cleanInput.length <= 8) {
        if (!/^[A-Z0-9]+$/.test(cleanInput)) return { isValid: false, error: "Registration contains invalid characters." };
        return { isValid: true, isRego: true };
    }

    if (cleanInput.length !== 17) return { isValid: false, error: `Must be a 17-character VIN or 2-8 char Rego. Current length: ${cleanInput.length}` };
    if (/[IOQ]/.test(cleanInput)) return { isValid: false, error: "VIN cannot contain letters I, O, or Q." };
    if (!/^[A-HJ-NPR-Z0-9]+$/.test(cleanInput)) return { isValid: false, error: "VIN contains invalid characters." };

    return { isValid: true, isRego: false };
}

