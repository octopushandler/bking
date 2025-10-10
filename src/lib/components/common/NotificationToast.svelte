<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Notification, NotificationAction } from '$lib/utils/notificationHelpers';
	import { COLORS_BY_TYPE, ICONS_BY_TYPE } from '$lib/utils/notificationHelpers';
	import { notificationActions } from '$lib/stores/notifications';

	// Props
	export let notification: Notification;
	export let index: number = 0;

	// Estado local
	let isVisible = false;
	let isRemoving = false;
	let progressBar = 0;
	let timeoutId: NodeJS.Timeout | null = null;

	// Clases CSS dinámicas
	$: colors = COLORS_BY_TYPE[notification.type];
	$: icon = ICONS_BY_TYPE[notification.type];

	// Función para cerrar la notificación
	function dismiss() {
		if (isRemoving) return;
		
		isRemoving = true;
		setTimeout(() => {
			notificationActions.remove(notification.id);
		}, 300); // Tiempo para la animación de salida
	}

	// Función para ejecutar acción
	function executeAction(action: NotificationAction) {
		action.action();
		// No cerrar automáticamente si tiene acciones
		if (!notification.persistent) {
			dismiss();
		}
	}

	// Función para pausar el timer
	function pauseTimer() {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	}

	// Función para reanudar el timer
	function resumeTimer() {
		if (notification.persistent || notification.duration === 0) return;
		
		const remainingTime = notification.duration - (Date.now() - notification.createdAt);
		if (remainingTime > 0) {
			timeoutId = setTimeout(dismiss, remainingTime);
		} else {
			dismiss();
		}
	}

	// Función para actualizar la barra de progreso
	function updateProgress() {
		if (notification.persistent || notification.duration === 0) {
			progressBar = 0;
			return;
		}

		const elapsed = Date.now() - notification.createdAt;
		const progress = Math.min((elapsed / notification.duration) * 100, 100);
		progressBar = progress;
	}

	onMount(() => {
		// Mostrar con animación
		setTimeout(() => {
			isVisible = true;
		}, 50);

		// Configurar auto-dismiss si no es persistente
		if (!notification.persistent && notification.duration > 0) {
			timeoutId = setTimeout(dismiss, notification.duration);
		}

		// Actualizar barra de progreso cada 100ms
		const progressInterval = setInterval(updateProgress, 100);
		
		// Cleanup
		return () => {
			clearInterval(progressInterval);
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});

	onDestroy(() => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
	});
</script>

<!-- Notificación Toast -->
<div 
	class="notification-toast {colors.background} {colors.border} border rounded-lg shadow-lg w-full max-w-[1100px] mx-auto transform transition-all duration-300 ease-in-out {isVisible && !isRemoving ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}"
	style="z-index: {1000 + index};"
	role="alert"
	aria-live="assertive"
	aria-atomic="true"
	on:mouseenter={pauseTimer}
	on:mouseleave={resumeTimer}
>
	<!-- Barra de progreso (solo si no es persistente) -->
	{#if !notification.persistent && notification.duration > 0}
		<div class="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-lg overflow-hidden">
			<div 
				class="h-full bg-current {colors.icon} transition-all duration-100 ease-linear"
				style="width: {progressBar}%;"
			></div>
		</div>
	{/if}

	<div class="p-4">
		<div class="flex items-start">
			<!-- Icono -->
			<div class="flex-shrink-0 {colors.icon}">
				{@html icon}
			</div>

			<!-- Contenido -->
			<div class="ml-3 flex-1 min-w-0">
				<!-- Título -->
				<h3 class="text-sm font-medium {colors.text}">
					{notification.title}
				</h3>

				<!-- Mensaje -->
				<div class="mt-1 text-sm {colors.text} opacity-90">
					{notification.message}
				</div>

				<!-- Acciones -->
				{#if notification.actions && notification.actions.length > 0}
					<div class="mt-3 flex space-x-2">
						{#each notification.actions as action (action.id)}
							<button
								on:click={() => executeAction(action)}
								class="px-3 py-1 rounded text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 {
									action.variant === 'danger' 
										? 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500' 
										: action.variant === 'primary'
										? 'bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-500'
										: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500'
								}"
							>
								{action.label}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Botón de cerrar -->
			<div class="ml-4 flex-shrink-0">
				<button
					on:click={dismiss}
					class="inline-flex {colors.text} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-gray-500 rounded-md p-1"
					aria-label="Cerrar notificación"
				>
					<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
					</svg>
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.notification-toast {
		backdrop-filter: blur(10px);
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	/* Animación de entrada */
	.notification-toast {
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	/* Animación de salida */
	.notification-toast.removing {
		animation: slideOut 0.3s ease-in;
	}

	@keyframes slideOut {
		from {
			transform: translateY(0);
			opacity: 1;
		}
		to {
			transform: translateY(100%);
			opacity: 0;
		}
	}
</style>
