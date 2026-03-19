import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { getLocaleForCurrency, normalizeCurrency, type SupportedCurrency } from './currency';
import { ENV_CONFIG } from './env';

export interface MarketConfig {
	countryCode: string;
	countryName: string;
	flagAsset: string;
	currency: SupportedCurrency;
	locale: string;
}

const MARKET_STORAGE_KEY = 'booking-market-config';

const MARKET_BY_COUNTRY: Record<string, Omit<MarketConfig, 'locale'>> = {
	CO: {
		countryCode: 'CO',
		countryName: 'Colombia',
		flagAsset: '/assets/common/co.png',
		currency: 'COP'
	},
	EC: {
		countryCode: 'EC',
		countryName: 'Ecuador',
		flagAsset: '/assets/common/ec.png',
		currency: 'USD'
	},
	SV: {
		countryCode: 'SV',
		countryName: 'El Salvador',
		flagAsset: '/assets/common/sv.png',
		currency: 'USD'
	},
	PA: {
		countryCode: 'PA',
		countryName: 'Panamá',
		flagAsset: '/assets/common/pa.png',
		currency: 'USD'
	},
	MX: {
		countryCode: 'MX',
		countryName: 'México',
		flagAsset: '/assets/common/mx.png',
		currency: 'MXN'
	}
};

export const DEFAULT_MARKET: MarketConfig = {
	...MARKET_BY_COUNTRY.CO,
	locale: getLocaleForCurrency('COP')
};

function getFallbackCountryCode(): string {
	const fallbackCountryCode = ENV_CONFIG.FALLBACK_COUNTRY_CODE?.trim().toUpperCase();
	return fallbackCountryCode && MARKET_BY_COUNTRY[fallbackCountryCode] ? fallbackCountryCode : 'CO';
}

function buildMarketConfig(base: Omit<MarketConfig, 'locale'>): MarketConfig {
	return {
		...base,
		locale: getLocaleForCurrency(base.currency)
	};
}

export function getMarketByCountryCode(countryCode?: string | null): MarketConfig {
	const normalizedCountryCode = countryCode?.trim().toUpperCase();
	const market = normalizedCountryCode ? MARKET_BY_COUNTRY[normalizedCountryCode] : undefined;
	return buildMarketConfig(market || MARKET_BY_COUNTRY[getFallbackCountryCode()]);
}

export function loadStoredMarket(): MarketConfig {
	if (!browser) {
		return DEFAULT_MARKET;
	}

	try {
		const rawMarket = localStorage.getItem(MARKET_STORAGE_KEY);
		if (!rawMarket) {
			return DEFAULT_MARKET;
		}

		const parsedMarket = JSON.parse(rawMarket) as Partial<MarketConfig>;
		const baseMarket = getMarketByCountryCode(parsedMarket.countryCode || DEFAULT_MARKET.countryCode);
		const currency = normalizeCurrency(parsedMarket.currency, baseMarket.currency);

		return buildMarketConfig({
			countryCode: baseMarket.countryCode,
			countryName: baseMarket.countryName,
			flagAsset: baseMarket.flagAsset,
			currency
		});
	} catch (error) {
		return DEFAULT_MARKET;
	}
}

export function persistMarket(market: MarketConfig) {
	if (!browser) {
		return;
	}

	localStorage.setItem(MARKET_STORAGE_KEY, JSON.stringify(market));
}

export function getCurrentMarket(): MarketConfig {
	return browser ? loadStoredMarket() : DEFAULT_MARKET;
}

export function getCurrentCurrency(): SupportedCurrency {
	return getCurrentMarket().currency;
}

export function getCurrentLocale(): string {
	return getCurrentMarket().locale;
}

async function fetchCountryCode(
	url: string,
	extractCountryCode: (data: any) => string | null
): Promise<string | null> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return extractCountryCode(data);
	} catch (error) {
		return null;
	}
}

async function resolveCountryCodeFromIp(): Promise<string | null> {
	const providers: Array<{
		url: string;
		extractCountryCode: (data: any) => string | null;
	}> = [
		{
			url: 'https://ipapi.co/json/',
			extractCountryCode: (data) =>
				typeof data?.country_code === 'string' ? data.country_code : null
		},
		{
			url: 'https://freeipapi.com/api/json/',
			extractCountryCode: (data) =>
				typeof data?.countryCode === 'string' ? data.countryCode : null
		},
		{
			url: 'https://ipwho.is/',
			extractCountryCode: (data) =>
				data?.success && typeof data?.country_code === 'string' ? data.country_code : null
		}
	];

	for (const provider of providers) {
		const countryCode = await fetchCountryCode(provider.url, provider.extractCountryCode);
		if (countryCode) {
			return countryCode;
		}
	}

	return getFallbackCountryCode();
}

function createMarketStore() {
	const initialMarket = getCurrentMarket();
	const { subscribe, set } = writable<MarketConfig>(initialMarket);

	return {
		subscribe,
		setMarket: (countryCode: string) => {
			const market = getMarketByCountryCode(countryCode);
			persistMarket(market);
			set(market);
			return market;
		},
		initialize: async () => {
			const storedMarket = loadStoredMarket();
			set(storedMarket);

			const countryCode = await resolveCountryCodeFromIp();
			const market = getMarketByCountryCode(countryCode);
			persistMarket(market);
			set(market);
			return market;
		}
	};
}

export const marketStore = createMarketStore();
