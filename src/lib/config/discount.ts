// Configuración de descuento global (NO depende de variables de entorno)
// Valor expresado como proporción: 0.10 == 10%
export const PRICE_DISCOUNT = 0.10;

export function applyPriceDiscount(originalPrice: number): number {
    if (!originalPrice || originalPrice <= 0) return 0;
    if (!PRICE_DISCOUNT || PRICE_DISCOUNT <= 0) return originalPrice;
    const discounted = originalPrice * (1 - PRICE_DISCOUNT);
    return Math.max(0, Math.round(discounted));
}


