import { writable } from 'svelte/store';
import type { Destination } from '$lib/config/api';

// Tipos para el estado global
export interface AppState {
	isLoading: boolean;
	error: Error | null;
	searchResults: Destination[];
	selectedDestination: Destination | null;
	searchQuery: string;
	checkInDate: string;
	checkOutDate: string;
	adults: number;
	children: number;
	rooms: number;
}

// Estado inicial
const initialState: AppState = {
	isLoading: false,
	error: null,
	searchResults: [],
	selectedDestination: null,
	searchQuery: '',
	checkInDate: '',
	checkOutDate: '',
	adults: 2,
	children: 0,
	rooms: 1
};

// Store principal
export const appStore = writable<AppState>(initialState);

// Funciones helper para actualizar el estado
export const appActions = {
	// Loading
	setLoading: (loading: boolean) => {
		appStore.update(state => ({ ...state, isLoading: loading }));
	},
	
	// Error handling
	setError: (error: Error | null) => {
		appStore.update(state => ({ ...state, error }));
	},
	
	clearError: () => {
		appStore.update(state => ({ ...state, error: null }));
	},
	
	// Search
	setSearchResults: (results: Destination[]) => {
		appStore.update(state => ({ ...state, searchResults: results }));
	},
	
	setSearchQuery: (query: string) => {
		appStore.update(state => ({ ...state, searchQuery: query }));
	},
	
	setSelectedDestination: (destination: Destination | null) => {
		appStore.update(state => ({ ...state, selectedDestination: destination }));
	},
	
	// Search form
	setCheckInDate: (date: string) => {
		appStore.update(state => ({ ...state, checkInDate: date }));
	},
	
	setCheckOutDate: (date: string) => {
		appStore.update(state => ({ ...state, checkOutDate: date }));
	},
	
	setAdults: (count: number) => {
		appStore.update(state => ({ ...state, adults: Math.max(1, count) }));
	},
	
	setChildren: (count: number) => {
		appStore.update(state => ({ ...state, children: Math.max(0, count) }));
	},
	
	setRooms: (count: number) => {
		appStore.update(state => ({ ...state, rooms: Math.max(1, count) }));
	},
	
	// Reset
	resetSearch: () => {
		appStore.update(state => ({
			...state,
			searchResults: [],
			selectedDestination: null,
			searchQuery: '',
			error: null
		}));
	},
	
	resetForm: () => {
		appStore.update(state => ({
			...state,
			checkInDate: '',
			checkOutDate: '',
			adults: 2,
			children: 0,
			rooms: 1
		}));
	}
};
