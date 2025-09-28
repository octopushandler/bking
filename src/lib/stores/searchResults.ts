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
	error: null,
	filters: {
		checkIn: '',
		checkOut: '',
		adults: 2,
		children: 0,
		rooms: 1,
		currency: 'COP',
		sortBy: 'popularity'
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
	}
};
