<script>
	import '../app.css';
	import ErrorBoundary from '$lib/components/common/ErrorBoundary.svelte';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	import NotificationContainer from '$lib/components/common/NotificationContainer.svelte';
	import { appStore, appActions } from '$lib/stores/app';
	import { notificationAPI } from '$lib/stores/notifications';
	
	// Suscribirse al store para obtener el estado global
	$: isLoading = $appStore.isLoading;
	$: error = $appStore.error;
	
	// Función para manejar el retry de errores
	function handleRetry() {
		appActions.clearError();
		// Aquí se podría implementar lógica de retry específica
	}

	// Migrar errores del appStore al sistema de notificaciones
	$: if (error) {
		notificationAPI.error(
			'Error del sistema',
			error.message || 'Ha ocurrido un error inesperado',
			{
				actions: [
					{
						id: 'retry',
						label: 'Reintentar',
						action: handleRetry,
						variant: 'primary'
					}
				],
				persistent: true
			}
		);
		// Limpiar el error del appStore para evitar duplicados
		appActions.clearError();
	}
</script>

<!-- Loading global -->
<LoadingSpinner bind:show={isLoading} overlay={true} text="Cargando..." />

<!-- Error global (legacy - mantenido para compatibilidad, pero los errores se manejan via notificaciones) -->
<ErrorBoundary {error} on:retry={handleRetry} />

<!-- Sistema de notificaciones centralizado -->
<NotificationContainer />

<!-- Contenido principal -->
<slot />