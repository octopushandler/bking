<script lang="ts">
	import { notificationAPI } from '$lib/stores/notifications';

	// Ejemplos de uso del sistema de notificaciones
	function showSuccess() {
		notificationAPI.success(
			'Reserva completada',
			'Tu reserva se ha procesado exitosamente. Recibirás un email de confirmación.'
		);
	}

	function showError() {
		notificationAPI.error(
			'Error de pago',
			'No se pudo procesar el pago. Verifica los datos de tu tarjeta.',
			{
				actions: [
					{
						id: 'retry',
						label: 'Reintentar',
						action: () => console.log('Reintentando pago...'),
						variant: 'primary'
					},
					{
						id: 'contact',
						label: 'Contactar soporte',
						action: () => console.log('Abriendo chat de soporte...'),
						variant: 'secondary'
					}
				]
			}
		);
	}

	function showWarning() {
		notificationAPI.warning(
			'Sesión expirando',
			'Tu sesión expirará en 5 minutos. Guarda tu trabajo.',
			{
				duration: 10000,
				actions: [
					{
						id: 'extend',
						label: 'Extender sesión',
						action: () => console.log('Extendiendo sesión...'),
						variant: 'primary'
					}
				]
			}
		);
	}

	function showInfo() {
		notificationAPI.info(
			'Nueva funcionalidad',
			'Ahora puedes guardar tus búsquedas favoritas para acceder más rápido.'
		);
	}

	function showPersistent() {
		notificationAPI.error(
			'Error crítico',
			'Se ha detectado un problema con tu conexión. Algunas funciones pueden no estar disponibles.',
			{
				persistent: true,
				actions: [
					{
						id: 'dismiss',
						label: 'Entendido',
						action: () => console.log('Notificación cerrada'),
						variant: 'primary'
					}
				]
			}
		);
	}

	function showMultiple() {
		// Mostrar múltiples notificaciones para probar la cola
		notificationAPI.info('Notificación 1', 'Primera notificación');
		setTimeout(() => notificationAPI.success('Notificación 2', 'Segunda notificación'), 500);
		setTimeout(() => notificationAPI.warning('Notificación 3', 'Tercera notificación'), 1000);
		setTimeout(() => notificationAPI.error('Notificación 4', 'Cuarta notificación'), 1500);
	}
</script>

<div class="p-6 max-w-2xl mx-auto">
	<h2 class="text-2xl font-bold mb-6">Ejemplos del Sistema de Notificaciones</h2>
	
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<button
			on:click={showSuccess}
			class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
		>
			Mostrar Éxito
		</button>

		<button
			on:click={showError}
			class="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
		>
			Mostrar Error
		</button>

		<button
			on:click={showWarning}
			class="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
		>
			Mostrar Advertencia
		</button>

		<button
			on:click={showInfo}
			class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
		>
			Mostrar Información
		</button>

		<button
			on:click={showPersistent}
			class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
		>
			Mostrar Persistente
		</button>

		<button
			on:click={showMultiple}
			class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
		>
			Mostrar Múltiples
		</button>
	</div>

	<div class="mt-8 p-4 bg-gray-100 rounded-lg">
		<h3 class="font-semibold mb-2">Características del sistema:</h3>
		<ul class="text-sm text-gray-700 space-y-1">
			<li>• Colores consistentes por tipo de notificación</li>
			<li>• Animaciones suaves de entrada y salida</li>
			<li>• Barra de progreso para auto-dismiss</li>
			<li>• Botones de acción personalizables</li>
			<li>• Cola automática (máximo 3 simultáneas)</li>
			<li>• Pausar timer al hacer hover</li>
			<li>• Notificaciones persistentes</li>
			<li>• Accesibilidad completa (ARIA)</li>
		</ul>
	</div>
</div>
