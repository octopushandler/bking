import { writable } from 'svelte/store';
import type { Hotel, HotelSearchParams } from '$lib/config/api';

// Estado de resultados de búsqueda
export interface SearchResultsState {
	// Parámetros de búsqueda
	searchParams: HotelSearchParams | null;
	destination: {
		name: string;
		dest_id: string;
	} | null;
	
	// Resultados
	hotels: Hotel[];
	totalCount: number;
	primaryCount: number;
	
	// Estado de carga
	isLoading: boolean;
	isFiltering: boolean;
	error: string | null;
	
	// Filtros aplicados
	filters: {
		checkIn: string;
		checkOut: string;
		adults: number;
		children: number;
		rooms: number;
		currency: string;
		sortBy: string;
		
		// Nuevos filtros
		// Precios (dinámicos)
		priceMin: number;
		priceMax: number;
		priceRange: { min: number; max: number };
		
		// Servicios y Amenidades
		services: {
			freeCancellation: boolean;
			wifi: boolean;
			parking: boolean;
			pool: boolean;
			gym: boolean;
			spa: boolean;
			restaurant: boolean;
			bar: boolean;
			roomService: boolean;
			concierge: boolean;
			businessCenter: boolean;
			meetingRooms: boolean;
			airportShuttle: boolean;
			petFriendly: boolean;
			nonSmoking: boolean;
		};
		
		// Tipos de Alojamiento
		accommodationTypes: {
			hotel: boolean;
			apartment: boolean;
			hostel: boolean;
			guesthouse: boolean;
			resort: boolean;
			villa: boolean;
			bedAndBreakfast: boolean;
		};
		
		// Políticas de Pago
		paymentPolicies: {
			payAtHotel: boolean;
			prepaymentRequired: boolean;
			noPrepayment: boolean;
		};
		
		// Características Especiales
		specialFeatures: {
			beachfront: boolean;
			cityCenter: boolean;
			airportNearby: boolean;
			trainStationNearby: boolean;
			metroNearby: boolean;
		};
		
		// Puntuación mínima
		minReviewScore: number;
	};
}

// Estado inicial
const initialState: SearchResultsState = {
	searchParams: null,
	destination: null,
	hotels: [],
	totalCount: 0,
	primaryCount: 0,
	isLoading: false,
	isFiltering: false,
	error: null,
	filters: {
		checkIn: '',
		checkOut: '',
		adults: 2,
		children: 0,
		rooms: 1,
		currency: 'COP',
		sortBy: 'popularity',
		
		// Valores por defecto para nuevos filtros
		priceMin: 0,
		priceMax: 1000,
		priceRange: { min: 0, max: 1000 },
		
		services: {
			freeCancellation: false,
			wifi: false,
			parking: false,
			pool: false,
			gym: false,
			spa: false,
			restaurant: false,
			bar: false,
			roomService: false,
			concierge: false,
			businessCenter: false,
			meetingRooms: false,
			airportShuttle: false,
			petFriendly: false,
			nonSmoking: false,
		},
		
		accommodationTypes: {
			hotel: false,
			apartment: false,
			hostel: false,
			guesthouse: false,
			resort: false,
			villa: false,
			bedAndBreakfast: false,
		},
		
		paymentPolicies: {
			payAtHotel: false,
			prepaymentRequired: false,
			noPrepayment: false,
		},
		
		specialFeatures: {
			beachfront: false,
			cityCenter: false,
			airportNearby: false,
			trainStationNearby: false,
			metroNearby: false,
		},
		
		minReviewScore: 0,
	}
};

// Store principal
export const searchResultsStore = writable<SearchResultsState>(initialState);

// Funciones para manejar el estado
export const searchResultsActions = {
	// Iniciar búsqueda
	startSearch: (params: HotelSearchParams, destination: { name: string; dest_id: string }, filters: any) => {
		searchResultsStore.update(state => ({
			...state,
			searchParams: params,
			destination,
			filters,
			isLoading: true,
			error: null,
			hotels: []
		}));
	},
	
	// Actualizar resultados
	updateResults: (hotels: Hotel[], totalCount: number, primaryCount: number) => {
		searchResultsStore.update(state => ({
			...state,
			hotels,
			totalCount,
			primaryCount,
			isLoading: false,
			error: null
		}));
	},
	
	// Manejar error
	setError: (error: string) => {
		searchResultsStore.update(state => ({
			...state,
			error,
			isLoading: false,
			hotels: []
		}));
	},
	
	// Limpiar resultados
	clearResults: () => {
		searchResultsStore.set(initialState);
	},
	
	// Actualizar filtros específicos
	updateFilter: (category: string, key: string, value: boolean | number) => {
		searchResultsStore.update(state => ({
			...state,
			filters: {
				...state.filters,
				[category]: {
					...(state.filters[category as keyof typeof state.filters] as any),
					[key]: value
				}
			}
		}));
	},
	
	// Actualizar múltiples filtros
	updateFilters: (newFilters: Partial<SearchResultsState['filters']>) => {
		searchResultsStore.update(state => ({
			...state,
			filters: { ...state.filters, ...newFilters }
		}));
	},
	
	// Limpiar todos los filtros (mantener los básicos)
	clearAllFilters: () => {
		searchResultsStore.update(state => ({
			...state,
			filters: {
				...state.filters,
				priceMin: 0,
				priceMax: 1000,
				priceRange: { min: 0, max: 1000 },
				services: {
					freeCancellation: false,
					wifi: false,
					parking: false,
					pool: false,
					gym: false,
					spa: false,
					restaurant: false,
					bar: false,
					roomService: false,
					concierge: false,
					businessCenter: false,
					meetingRooms: false,
					airportShuttle: false,
					petFriendly: false,
					nonSmoking: false,
				},
				accommodationTypes: {
					hotel: false,
					apartment: false,
					hostel: false,
					guesthouse: false,
					resort: false,
					villa: false,
					bedAndBreakfast: false,
				},
				paymentPolicies: {
					payAtHotel: false,
					prepaymentRequired: false,
					noPrepayment: false,
				},
				specialFeatures: {
					beachfront: false,
					cityCenter: false,
					airportNearby: false,
					trainStationNearby: false,
					metroNearby: false,
				},
				minReviewScore: 0,
			}
		}));
	},
	
	// Acciones para estado de filtrado
	setFiltering: (isFiltering: boolean) => {
		searchResultsStore.update(state => ({
			...state,
			isFiltering
		}));
	}
};
