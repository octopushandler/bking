// Re-export your library's components here
export { default as Header } from './components/common/Header.svelte';
export { default as Navbar } from './components/common/Navbar.svelte';
export { default as Hero } from './components/common/Hero.svelte';
export { default as SearchForm } from './components/common/SearchForm.svelte';
export { default as DatePicker } from './components/common/DatePicker.svelte';
export { default as HotelCard } from './components/search/HotelCard.svelte';
export { default as FiltersPanel } from './components/search/FiltersPanel.svelte';
export { default as ErrorBoundary } from './components/common/ErrorBoundary.svelte';
export { default as LoadingSpinner } from './components/common/LoadingSpinner.svelte';

// Re-export stores
export { appStore, appActions } from './stores/app';
export { searchResultsStore, searchResultsActions } from './stores/searchResults';

// Re-export config
export { BOOKING_API_CONFIG, buildSearchUrl, buildHotelSearchUrl, getDestinationTypeConfig } from './config/api';
export { ENV_CONFIG, getApiConfig } from './config/env';

// Re-export types
export type { Destination, ApiConfig, SearchConfig, DestinationTypeConfig, Hotel, HotelSearchParams, HotelSearchResponse } from './config/api';
export type { AppState } from './stores/app';
