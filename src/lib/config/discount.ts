import { ENV_CONFIG } from './env';

// Configuracion de descuento global
// Valor expresado como proporcion: 0.10 == 10%
const normalizedDiscount = Number.isFinite(ENV_CONFIG.DISCOUNT_PERCENTAGE)
	? ENV_CONFIG.DISCOUNT_PERCENTAGE / 100
	: 0.10;

export const PRICE_DISCOUNT = normalizedDiscount > 0 ? normalizedDiscount : 0.10;

export function applyPriceDiscount(originalPrice: number): number {
	if (!originalPrice || originalPrice <= 0) return 0;
	if (!PRICE_DISCOUNT || PRICE_DISCOUNT <= 0) return originalPrice;
	const discounted = originalPrice * (1 - PRICE_DISCOUNT);
	return Math.max(0, Math.round(discounted));
}
