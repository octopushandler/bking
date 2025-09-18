// Re-export your library's components here
export { default as Header } from './components/Header.svelte';
export { default as Navbar } from './components/Navbar.svelte';
export { default as Hero } from './components/Hero.svelte';
export { default as SearchForm } from './components/SearchForm.svelte';
export { default as ErrorBoundary } from './components/ErrorBoundary.svelte';
export { default as LoadingSpinner } from './components/LoadingSpinner.svelte';

// Re-export stores
export { appStore, appActions } from './stores/app';

// Re-export config
export { BOOKING_API_CONFIG, buildSearchUrl, getDestinationTypeConfig } from './config/api';
export { ENV_CONFIG, getApiConfig } from './config/env';

// Re-export types
export type { Destination, ApiConfig, SearchConfig, DestinationTypeConfig } from './config/api';
export type { AppState } from './stores/app';
