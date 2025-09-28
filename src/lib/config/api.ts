import { getApiConfig } from './env.js';

// Tipos para la API
export interface Destination {
	dest_id: string;
	name: string;
	dest_type: 'city' | 'hotel' | 'airport';
	country: string;
	city_name?: string;
	hotels?: number;
}

// Tipos para la búsqueda de hoteles
export interface HotelSearchParams {
	dest_id: string;
	checkin_date: string;
	checkout_date: string;
	adults_number: number;
	children_number: number;
	room_number: number;
	locale?: string;
	dest_type?: string;
	filter_by_currency?: string;
	order_by?: string;
	units?: string;
	page_number?: number;
	include_adjacency?: boolean;
	children_ages?: string;
	categories_filter_ids?: string;
}

export interface Hotel {
	id: string;
	hotel_id: number;
	hotel_name: string;
	hotel_name_trans: string;
	address: string;
	address_trans: string;
	city: string;
	city_trans: string;
	country_trans: string;
	zip: string;
	latitude: number;
	longitude: number;
	class: number;
	review_score: number;
	review_score_word: string;
	review_nr: number;
	main_photo_url: string;
	max_photo_url: string;
	max_1440_photo_url: string;
	min_total_price: number;
	currency_code: string;
	price_breakdown: {
		all_inclusive_price: number;
		gross_price: string;
		currency: string;
	};
	composite_price_breakdown: {
		all_inclusive_amount: {
			amount_rounded: string;
			value: number;
			currency: string;
		};
		gross_amount: {
			amount_rounded: string;
			value: number;
			currency: string;
		};
		discounted_amount?: {
			amount_rounded: string;
			value: number;
			currency: string;
		};
		strikethrough_amount?: {
			amount_rounded: string;
			value: number;
			currency: string;
		};
	};
	distances: Array<{
		text: string;
		icon_name: string;
	}>;
	badges: Array<{
		text: string;
		badge_variant: string;
		id: string;
	}>;
	ribbon_text?: string;
	is_free_cancellable: boolean;
	has_free_parking: boolean;
	has_swimming_pool: boolean;
	checkin: {
		from: string;
		until: string;
	};
	checkout: {
		from: string;
		until: string;
	};
	hotel_facilities: string;
	unit_configuration_label: string;
	url: string;
}

export interface HotelSearchResponse {
	primary_count: number;
	count: number;
	total_count_with_filters: number;
	unfiltered_count: number;
	result: Hotel[];
	sort: Array<{
		name: string;
		id: string;
	}>;
	map_bounding_box: {
		ne_long: number;
		sw_long: number;
		ne_lat: number;
		sw_lat: number;
	};
}

export interface ApiConfig {
	baseUrl: string;
	headers: Record<string, string>;
}

export interface SearchConfig {
	locale: string;
	maxResults: number;
	debounceDelay: number;
}

export interface DestinationTypeConfig {
	icon: string;
	label: string;
	color: string;
}

// Configuración de la API de Booking.com
const apiConfig: ApiConfig = getApiConfig();

export const BOOKING_API_CONFIG = {
    // URL base de la API
    BASE_URL: apiConfig.baseUrl,
    
    // Headers de autenticación
    HEADERS: apiConfig.headers,
    
    // Configuración de búsqueda
    SEARCH_CONFIG: {
        locale: 'es', // Idioma en español
        maxResults: 8, // Máximo número de resultados a mostrar
        debounceDelay: 500 // Delay en milisegundos para el debounce
    } as SearchConfig,
    
    // Configuración de tipos de destino
    DESTINATION_TYPES: {
        city: {
            icon: '/assets/search/alojamiento_icon.png',
            label: 'Ciudad',
            color: 'blue'
        },
        hotel: {
            icon: '/assets/search/alojamiento_icon.png',
            label: 'Hotel',
            color: 'green'
        },
        airport: {
            icon: '/assets/navbar/vuelo_icon.png',
            label: 'Aeropuerto',
            color: 'purple'
        }
    } as Record<string, DestinationTypeConfig>
};

// Función helper para construir la URL de búsqueda de destinos
export function buildSearchUrl(query: string): string {
    const params = new URLSearchParams({
        locale: BOOKING_API_CONFIG.SEARCH_CONFIG.locale,
        name: query
    });
    
    return `${BOOKING_API_CONFIG.BASE_URL}?${params.toString()}`;
}

// Función helper para construir la URL de búsqueda de hoteles
export function buildHotelSearchUrl(params: HotelSearchParams): string {
    const searchParams = new URLSearchParams({
        dest_id: params.dest_id,
        checkin_date: params.checkin_date,
        checkout_date: params.checkout_date,
        adults_number: params.adults_number.toString(),
        children_number: params.children_number.toString(),
        room_number: params.room_number.toString(),
        locale: params.locale || 'es',
        dest_type: params.dest_type || 'city',
        filter_by_currency: params.filter_by_currency || 'COP',
        order_by: params.order_by || 'popularity',
        units: params.units || 'metric',
        page_number: (params.page_number || 0).toString(),
        include_adjacency: (params.include_adjacency || true).toString()
    });

    if (params.children_ages) {
        searchParams.set('children_ages', params.children_ages);
    }
    
    if (params.categories_filter_ids) {
        searchParams.set('categories_filter_ids', params.categories_filter_ids);
    }
    
    return `https://${BOOKING_API_CONFIG.HEADERS['x-rapidapi-host']}/v1/hotels/search?${searchParams.toString()}`;
}

// Función helper para obtener la configuración de un tipo de destino
export function getDestinationTypeConfig(type: string): DestinationTypeConfig {
    return BOOKING_API_CONFIG.DESTINATION_TYPES[type] || {
        icon: '/assets/search/alojamiento_icon.png',
        label: 'Destino',
        color: 'gray'
    };
}
