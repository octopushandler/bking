<script>
	import '../app.css';
	import ErrorBoundary from '$lib/components/common/ErrorBoundary.svelte';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	import { appStore, appActions } from '$lib/stores/app';
	
	// Suscribirse al store para obtener el estado global
	$: isLoading = $appStore.isLoading;
	$: error = $appStore.error;
	
	// Función para manejar el retry de errores
	function handleRetry() {
		appActions.clearError();
		// Aquí se podría implementar lógica de retry específica
	}
</script>

<!-- Loading global -->
<LoadingSpinner bind:show={isLoading} overlay={true} text="Cargando..." />

<!-- Error global -->
<ErrorBoundary {error} on:retry={handleRetry} />

<!-- Contenido principal -->
<slot />