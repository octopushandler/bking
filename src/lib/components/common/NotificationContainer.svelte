<script lang="ts">
	import { onMount } from 'svelte';
	import { notifications, notificationConfig } from '$lib/stores/notifications';
	import NotificationToast from './NotificationToast.svelte';

	// Estado local
	let containerElement: HTMLDivElement;

	// Clases CSS dinámicas basadas en la posición
	$: positionClasses = {
		'top-right': 'top-0 left-0 right-0',
		'top-left': 'top-0 left-0 right-0', 
		'bottom-right': 'bottom-0 left-0 right-0',
		'bottom-left': 'bottom-0 left-0 right-0'
	};

	$: containerClass = `fixed ${positionClasses[$notificationConfig.position]} z-50 pointer-events-none`;

	onMount(() => {
		// Asegurar que el contenedor esté en el DOM
		if (containerElement) {
			// Agregar estilos adicionales si es necesario
			containerElement.style.maxHeight = '50vh';
			containerElement.style.overflowY = 'auto';
		}
	});
</script>

<!-- Contenedor de notificaciones -->
<div 
	bind:this={containerElement}
	class={containerClass}
	aria-live="polite"
	aria-label="Notificaciones del sistema"
>
	<div class="flex flex-col-reverse space-y-reverse space-y-3 pointer-events-auto p-4" style="gap: {$notificationConfig.spacing}px;">
		{#each $notifications as notification, index (notification.id)}
			<NotificationToast {notification} {index} />
		{/each}
	</div>
</div>

<style>
	/* Estilos para el scrollbar del contenedor */
	div::-webkit-scrollbar {
		width: 4px;
	}

	div::-webkit-scrollbar-track {
		background: transparent;
	}

	div::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 2px;
	}

	div::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 0, 0, 0.3);
	}

	/* Asegurar que las notificaciones no interfieran con otros elementos */
	:global(.notification-toast) {
		pointer-events: auto;
	}
</style>
