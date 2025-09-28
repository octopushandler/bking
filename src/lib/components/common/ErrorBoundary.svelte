<script>
	import { onMount } from 'svelte';
	
	// Props
	export let error = null;
	export let fallback = 'Algo salió mal. Por favor, intenta de nuevo.';
	
	// Estado
	let isVisible = false;
	let retryCount = 0;
	
	// Función para mostrar el error
	function showError() {
		isVisible = true;
		// Auto-ocultar después de 5 segundos
		setTimeout(() => {
			isVisible = false;
		}, 5000);
	}
	
	// Función para reintentar
	function retry() {
		retryCount++;
		isVisible = false;
		// Emitir evento para que el componente padre maneje el retry
		dispatch('retry');
	}
	
	// Función para cerrar el error
	function dismiss() {
		isVisible = false;
	}
	
	// Mostrar error cuando cambie
	$: if (error) {
		showError();
	}
	
	// Event dispatcher
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

{#if isVisible && error}
	<div 
		class="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg z-50 max-w-md"
		role="alert"
		aria-live="assertive"
	>
		<div class="flex items-start">
			<div class="flex-shrink-0">
				<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
				</svg>
			</div>
			<div class="ml-3 flex-1">
				<h3 class="text-sm font-medium text-red-800">
					Error
				</h3>
				<div class="mt-1 text-sm text-red-700">
					{error.message || fallback}
				</div>
				<div class="mt-3 flex space-x-2">
					<button
						on:click={retry}
						class="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
					>
						Reintentar
					</button>
					<button
						on:click={dismiss}
						class="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
					>
						Cerrar
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Animación de entrada */
	div {
		animation: slideIn 0.3s ease-out;
	}
	
	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
