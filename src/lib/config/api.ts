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

// Función helper para construir la URL de búsqueda
export function buildSearchUrl(query: string): string {
    const params = new URLSearchParams({
        locale: BOOKING_API_CONFIG.SEARCH_CONFIG.locale,
        name: query
    });
    
    return `${BOOKING_API_CONFIG.BASE_URL}?${params.toString()}`;
}

// Función helper para obtener la configuración de un tipo de destino
export function getDestinationTypeConfig(type: string): DestinationTypeConfig {
    return BOOKING_API_CONFIG.DESTINATION_TYPES[type] || {
        icon: '/assets/search/alojamiento_icon.png',
        label: 'Destino',
        color: 'gray'
    };
}
