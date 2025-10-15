// Utilidades de validación y manejo de fechas para búsquedas y reservas

export type DateValidationRules = {
    minNights?: number; // mínimo de noches
    maxNights?: number; // máximo de noches
    allowSameDay?: boolean; // permite 0 noches
    allowPastCheckIn?: boolean; // permite check-in en el pasado
    maxAdvanceMonths?: number; // ventana máxima en meses hacia el futuro
};

export type DateRangeValidationResult = {
    ok: boolean;
    nights?: number;
    normalizedCheckIn?: Date;
    normalizedCheckOut?: Date;
    error?: string;
};

// Normaliza a medianoche local para evitar issues de zona horaria
export function normalizeToLocalMidnight(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Parsea cadenas ISO YYYY-MM-DD sin ambigüedad
export function parseISODateOnly(value: string): Date | null {
    if (!value || typeof value !== 'string') return null;
    const m = value.match(/^\d{4}-\d{2}-\d{2}$/);
    if (!m) return null;
    const [y, mo, d] = value.split('-').map(Number);
    const date = new Date(y, mo - 1, d);
    // Validar que no haya overflow (e.g., 2025-02-31)
    if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
    return normalizeToLocalMidnight(date);
}

export function formatISODateOnly(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function diffNights(checkIn: Date, checkOut: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const ci = normalizeToLocalMidnight(checkIn).getTime();
    const co = normalizeToLocalMidnight(checkOut).getTime();
    return Math.round((co - ci) / msPerDay);
}

export function validateDateRange(
    checkInStr: string,
    checkOutStr: string,
    rules: DateValidationRules = {}
): DateRangeValidationResult {
    const {
        minNights = 1,
        maxNights = 30,
        allowSameDay = false,
        allowPastCheckIn = false,
        maxAdvanceMonths = 18
    } = rules;

    const checkIn = parseISODateOnly(checkInStr);
    const checkOut = parseISODateOnly(checkOutStr);

    if (!checkIn || !checkOut) {
        return { ok: false, error: 'Fechas con formato inválido. Usa YYYY-MM-DD.' };
    }

    const today = normalizeToLocalMidnight(new Date());
    if (!allowPastCheckIn && checkIn < today) {
        return { ok: false, error: 'La fecha de entrada no puede ser pasada.' };
    }

    if (checkOut <= checkIn) {
        return { ok: false, error: 'La fecha de salida debe ser posterior a la de entrada.' };
    }

    const nights = diffNights(checkIn, checkOut);

    if (!allowSameDay && nights <= 0) {
        return { ok: false, error: 'La estadía debe ser de al menos 1 noche.' };
    }

    if (nights < minNights) {
        return { ok: false, error: `La estadía mínima es de ${minNights} noche(s).` };
    }

    if (nights > maxNights) {
        return { ok: false, error: `La estadía máxima es de ${maxNights} noche(s).` };
    }

    // Ventana máxima de reserva en el futuro
    if (typeof maxAdvanceMonths === 'number' && maxAdvanceMonths > 0) {
        const maxAdvance = new Date(today);
        maxAdvance.setMonth(maxAdvance.getMonth() + maxAdvanceMonths);
        if (checkIn > maxAdvance || checkOut > maxAdvance) {
            return { ok: false, error: `Las fechas no pueden superar ${maxAdvanceMonths} meses desde hoy.` };
        }
    }

    return {
        ok: true,
        nights,
        normalizedCheckIn: checkIn,
        normalizedCheckOut: checkOut
    };
}


