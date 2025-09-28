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

// Tipos para detalles de hotel (respuesta del endpoint v2 /hotels/details)
export interface HotelDetails {
	hotel_id: number;
	hotel_name: string;
	hotel_name_trans: string;
	accommodation_type: number;
	accommodation_type_name: string;
	url: string;
	hotel_address_line: string;
	country_trans: string;
	countrycode: string;
	district: string;
	zip: string;
	city: string;
	city_name_en: string;
	city_trans: string;
	city_in_trans: string;
	address: string;
	address_trans: string;
	timezone: string;
	latitude: number;
	longitude: number;
	currency_code: string;
	review_nr: number;
	class_is_estimated: number;
	hotel_facilities: string;
	facilities_block: {
		name: string;
		type: string;
		facilities: Array<{
			name: string;
			icon: string;
		}>;
	};
	property_highlight_strip: any;
	top_ufi_benefits: Array<{
		icon: string;
		translated_name: string;
	}>;
	preferences: any[];
	block: Array<{
		block_id: string;
		room_id: number;
		room_name: string;
		name: string;
		name_without_policy: string;
		room_surface_in_m2: number;
		room_surface_in_feet2: number;
		max_occupancy: string;
		nr_adults: number;
		nr_children: number;
		children_ages: number[];
		room_count: number;
		refundable: number;
		refundable_until: string;
		breakfast_included: number;
		all_inclusive: number;
		half_board: number;
		full_board: number;
		lunch_included: number;
		dinner_included: number;
		smoking: number;
		product_price_breakdown: {
			gross_amount: {
				value: number;
				currency: string;
				amount_rounded: string;
				amount_unrounded: string;
			};
			all_inclusive_amount: {
				value: number;
				currency: string;
				amount_rounded: string;
				amount_unrounded: string;
			};
			net_amount: {
				value: number;
				currency: string;
				amount_rounded: string;
				amount_unrounded: string;
			};
			included_taxes_and_charges_amount: {
				value: number;
				currency: string;
				amount_rounded: string;
				amount_unrounded: string;
			};
			items: Array<{
				name: string;
				kind: string;
				inclusion_type: string;
				item_amount: {
					value: number;
					currency: string;
					amount_rounded: string;
					amount_unrounded: string;
				};
				base: {
					kind: string;
					base_amount?: number;
					percentage?: number;
				};
				details?: string;
				identifier?: string;
			}>;
			benefits?: Array<{
				name: string;
				kind: string;
				badge_variant: string;
				icon: any;
				identifier: string;
				details: string;
			}>;
			strikethrough_amount?: {
				value: number;
				currency: string;
				amount_rounded: string;
				amount_unrounded: string;
			};
			discounted_amount?: {
				value: number;
				currency: string;
				amount_rounded: string;
				amount_unrounded: string;
			};
			all_inclusive_amount_hotel_currency?: {
				value: number;
				currency: string;
				amount_rounded: string;
				amount_unrounded: string;
			};
			gross_amount_hotel_currency?: {
				value: number;
				currency: string;
				amount_rounded: string;
				amount_unrounded: string;
			};
		};
		paymentterms: {
			prepayment: {
				type: string;
				type_translation: string;
				description: string;
				timeline: {
					stages: Array<{
						text: string;
						amount: string;
						amount_pretty: string;
						is_free: number;
						after_checkin?: number;
					}>;
				};
			};
			cancellation: {
				type: string;
				type_translation: string;
				description: string;
				timeline: {
					stages: Array<{
						text: string;
						text_refundable: string;
						limit_until: string;
						limit_until_date: string;
						fee: number;
						fee_pretty: string;
						is_free: number;
					}>;
				};
			};
		};
		block_text: {
			policies: Array<{
				content: string;
				class: string;
				mealplan_vector?: string;
				currencycode?: string;
				price?: number;
			}>;
		};
		detail_mealplan: Array<{
			icon: string;
			price?: number;
			title: string;
			currency?: string;
		}>;
		mealplan: string;
	}>;
	composite_price_breakdown: {
		gross_amount: {
			value: number;
			currency: string;
			amount_rounded: string;
			amount_unrounded: string;
		};
		all_inclusive_amount: {
			value: number;
			currency: string;
			amount_rounded: string;
			amount_unrounded: string;
		};
		net_amount: {
			value: number;
			currency: string;
			amount_rounded: string;
			amount_unrounded: string;
		};
		included_taxes_and_charges_amount: {
			value: number;
			currency: string;
			amount_rounded: string;
			amount_unrounded: string;
		};
		charges_details: {
			mode: string;
			amount: {
				value: number;
				currency: string;
			};
			translated_copy: string;
		};
		benefits?: Array<{
			name: string;
			kind: string;
			badge_variant: string;
			icon: any;
			identifier: string;
			details: string;
		}>;
		strikethrough_amount?: {
			value: number;
			currency: string;
			amount_rounded: string;
			amount_unrounded: string;
		};
		discounted_amount?: {
			value: number;
			currency: string;
			amount_rounded: string;
			amount_unrounded: string;
		};
		all_inclusive_amount_hotel_currency?: {
			value: number;
			currency: string;
			amount_rounded: string;
			amount_unrounded: string;
		};
		gross_amount_hotel_currency?: {
			value: number;
			currency: string;
			amount_rounded: string;
			amount_unrounded: string;
		};
	};
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

// Función helper para construir la URL de detalles de hotel (v2)
export function buildHotelDetailsUrl(hotelId: number, checkinDate: string, checkoutDate: string): string {
    const params = new URLSearchParams({
        hotel_id: hotelId.toString(),
        checkin_date: checkinDate,
        checkout_date: checkoutDate,
        locale: 'es-mx',
        currency: 'COP'
    });
    
    return `https://${BOOKING_API_CONFIG.HEADERS['x-rapidapi-host']}/v2/hotels/details?${params.toString()}`;
}

// Función helper para obtener la configuración de un tipo de destino
export function getDestinationTypeConfig(type: string): DestinationTypeConfig {
    return BOOKING_API_CONFIG.DESTINATION_TYPES[type] || {
        icon: '/assets/search/alojamiento_icon.png',
        label: 'Destino',
        color: 'gray'
    };
}
