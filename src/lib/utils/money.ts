import { DEFAULT_CURRENCY, getLocaleForCurrency, normalizeCurrency, type SupportedCurrency } from '$lib/config/currency';
import { getCurrentLocale } from '$lib/config/market';

export function formatMoney(
	amount: number,
	currency: string = DEFAULT_CURRENCY,
	locale?: string
): string {
	const normalizedCurrency = normalizeCurrency(currency, DEFAULT_CURRENCY);
	const normalizedLocale = locale || getCurrentLocale() || getLocaleForCurrency(normalizedCurrency);

	try {
		return new Intl.NumberFormat(normalizedLocale, {
			style: 'currency',
			currency: normalizedCurrency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	} catch (error) {
		return `${normalizedCurrency} ${Math.round(amount).toLocaleString(normalizedLocale)}`;
	}
}

export function formatMoneyAmount(
	amount: { value: number; currency: string; amount_rounded?: string },
	locale?: string
): string {
	if (amount.amount_rounded) {
		return amount.amount_rounded;
	}

	return formatMoney(amount.value, amount.currency, locale);
}

export function getCurrencyLabel(currency: string = DEFAULT_CURRENCY): SupportedCurrency {
	return normalizeCurrency(currency, DEFAULT_CURRENCY);
}
