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

// Hotel interface actualizada para API v2
export interface Hotel {
	id: number;
	name: string;
	mainPhotoId: number;
	photoMainUrl: string;
	photoUrls: string[];
	position: number;
	rankingPosition: number;
	countryCode: string;
	latitude: number;
	longitude: number;
	priceBreakdown: {
		benefitBadges: Array<{
			text: string;
			variant: string;
			identifier: string;
			explanation: string;
		}>;
		taxExceptions: any[];
		grossPrice: {
			value: number;
			currency: string;
		};
		strikethroughPrice?: {
			value: number;
			currency: string;
		};
	};
	currency: string;
	checkin: {
		fromTime: string;
		untilTime: string;
	};
	checkout: {
		fromTime: string;
		untilTime: string;
	};
	checkoutDate: string;
	checkinDate: string;
	reviewScore: number;
	reviewScoreWord: string;
	reviewCount: number;
	qualityClass: number;
	isFirstPage: boolean;
	accuratePropertyClass: number;
	propertyClass: number;
	ufi: number;
	wishlistName: string;
	optOutFromGalleryChanges: number;
	wishlistToggle: {
		destinationId: string;
		propertyId: number;
		wishlistName: string;
	};
	propertyType: string;
	proposedAccommodation: string[];
	priceDetails: {
		info: string;
		strikethrough: string | null;
		gross: string;
		taxInfo: string;
	};
	additionalLabels: any[];
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

// Respuesta de búsqueda de hoteles v2
export interface HotelSearchResponse {
	count: number;
	mapPageFields: any;
	results: Hotel[];
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

// Función helper para construir la URL de búsqueda de hoteles v2
export function buildHotelSearchUrl(params: HotelSearchParams, filters?: any): string {
    const searchParams = new URLSearchParams({
        dest_id: params.dest_id,
        checkin_date: params.checkin_date,
        checkout_date: params.checkout_date,
        adults_number: params.adults_number.toString(),
        room_number: params.room_number.toString(),
        locale: 'es-mx',
        dest_type: params.dest_type || 'city',
        filter_by_currency: 'COP',
        order_by: filters?.sortBy || 'popularity',
        units: 'metric',
        page_number: (params.page_number || 0).toString(),
        include_adjacency: 'true'
    });
    
    // Solo agregar children_number si hay niños
    if (params.children_number && params.children_number > 0) {
        searchParams.set('children_number', params.children_number.toString());
        // También agregar children_ages si hay niños
        const childrenAges = Array(params.children_number).fill('5').join(',');
        searchParams.set('children_ages', childrenAges);
    }
    
    // Aplicar filtros si están disponibles
    if (filters) {
        // Filtros de precio
        if (filters.priceMin && filters.priceMin > 0) {
            searchParams.set('price_min', filters.priceMin.toString());
        }
        if (filters.priceMax && filters.priceMax < 1000) {
            searchParams.set('price_max', filters.priceMax.toString());
        }
        
        // Filtro de puntuación mínima
        if (filters.minReviewScore && filters.minReviewScore > 0) {
            searchParams.set('min_review_score', filters.minReviewScore.toString());
        }
        
        // Construir filtros de categorías
        const categoryFilters = buildCategoryFilters(filters);
        if (categoryFilters.length > 0) {
            searchParams.set('categories_filter_ids', categoryFilters.join(','));
        }
    }
    
    return `https://${BOOKING_API_CONFIG.HEADERS['x-rapidapi-host']}/v2/hotels/search?${searchParams.toString()}`;
}

// Función para construir filtros de categorías
function buildCategoryFilters(filters: any): string[] {
    const categories = [];
    
    // Servicios y Amenidades
    if (filters.services) {
        const serviceMapping = {
            freeCancellation: 'free_cancellation',
            wifi: 'wifi',
            parking: 'parking',
            pool: 'pool',
            gym: 'gym',
            spa: 'spa',
            restaurant: 'restaurant',
            bar: 'bar',
            roomService: 'room_service',
            concierge: 'concierge',
            businessCenter: 'business_center',
            meetingRooms: 'meeting_rooms',
            airportShuttle: 'airport_shuttle',
            petFriendly: 'pet_friendly',
            nonSmoking: 'non_smoking'
        };
        
        Object.entries(filters.services).forEach(([key, value]) => {
            if (value && serviceMapping[key as keyof typeof serviceMapping]) {
                categories.push(`${serviceMapping[key as keyof typeof serviceMapping]}::1`);
            }
        });
    }
    
    // Tipos de Alojamiento
    if (filters.accommodationTypes) {
        const typeMapping = {
            hotel: 'hotel',
            apartment: 'apartment',
            hostel: 'hostel',
            guesthouse: 'guesthouse',
            resort: 'resort',
            villa: 'villa',
            bedAndBreakfast: 'bed_and_breakfast'
        };
        
        Object.entries(filters.accommodationTypes).forEach(([key, value]) => {
            if (value && typeMapping[key as keyof typeof typeMapping]) {
                categories.push(`${typeMapping[key as keyof typeof typeMapping]}::1`);
            }
        });
    }
    
    // Políticas de Pago
    if (filters.paymentPolicies) {
        const paymentMapping = {
            payAtHotel: 'pay_at_hotel',
            prepaymentRequired: 'prepayment_required',
            noPrepayment: 'no_prepayment'
        };
        
        Object.entries(filters.paymentPolicies).forEach(([key, value]) => {
            if (value && paymentMapping[key as keyof typeof paymentMapping]) {
                categories.push(`${paymentMapping[key as keyof typeof paymentMapping]}::1`);
            }
        });
    }
    
    // Características Especiales
    if (filters.specialFeatures) {
        const featureMapping = {
            beachfront: 'beachfront',
            cityCenter: 'city_center',
            airportNearby: 'airport_nearby',
            trainStationNearby: 'train_station_nearby',
            metroNearby: 'metro_nearby'
        };
        
        Object.entries(filters.specialFeatures).forEach(([key, value]) => {
            if (value && featureMapping[key as keyof typeof featureMapping]) {
                categories.push(`${featureMapping[key as keyof typeof featureMapping]}::1`);
            }
        });
    }
    
    return categories;
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
