export type SupportedCurrency = 'COP' | 'USD' | 'MXN';

const SUPPORTED_CURRENCIES: SupportedCurrency[] = ['COP', 'USD', 'MXN'];

const CURRENCY_LOCALES: Record<SupportedCurrency, string> = {
	COP: 'es-CO',
	USD: 'en-US',
	MXN: 'es-MX'
};

export function normalizeCurrency(value?: string | null, fallback: SupportedCurrency = 'COP'): SupportedCurrency {
	const normalized = value?.trim().toUpperCase() as SupportedCurrency | undefined;
	return normalized && SUPPORTED_CURRENCIES.includes(normalized) ? normalized : fallback;
}

export function getDefaultCurrency(): SupportedCurrency {
	return 'COP';
}

export function getLocaleForCurrency(currency: SupportedCurrency): string {
	return CURRENCY_LOCALES[currency];
}

export function getDefaultLocale(currency: SupportedCurrency = getDefaultCurrency()): string {
	return getLocaleForCurrency(currency);
}

export const DEFAULT_CURRENCY = getDefaultCurrency();
export const DEFAULT_LOCALE = getDefaultLocale(DEFAULT_CURRENCY);
