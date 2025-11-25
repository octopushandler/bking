// Configuración de descuento global
// Valor expresado como proporción: 0.10 == 10%
// Puede venir de variable de entorno VITE_DISCOUNT_PERCENTAGE (como número: 20 = 20%)
// o VITE_PRICE_DISCOUNT (como proporción: 0.20 = 20%)
const discountFromEnv = import.meta.env.VITE_DISCOUNT_PERCENTAGE 
    ? parseFloat(import.meta.env.VITE_DISCOUNT_PERCENTAGE) / 100 
    : (import.meta.env.VITE_PRICE_DISCOUNT 
        ? parseFloat(import.meta.env.VITE_PRICE_DISCOUNT) 
        : null);

export const PRICE_DISCOUNT = discountFromEnv !== null ? discountFromEnv : 0.10; // Valor por defecto: 10%

export function applyPriceDiscount(originalPrice: number): number {
    if (!originalPrice || originalPrice <= 0) return 0;
    if (!PRICE_DISCOUNT || PRICE_DISCOUNT <= 0) return originalPrice;
    const discounted = originalPrice * (1 - PRICE_DISCOUNT);
    return Math.max(0, Math.round(discounted));
}


