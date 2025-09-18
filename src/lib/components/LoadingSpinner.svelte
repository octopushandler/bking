<script>
	// Props
	export let size = 'md';
	export let text = 'Cargando...';
	export let overlay = false;
	export let show = false;
	
	// Clases de tamaño
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12'
	};
	
	// Clases de texto
	const textSizeClasses = {
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-lg'
	};
</script>

{#if show}
	{#if overlay}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Cargando">
			<div class="bg-white rounded-lg p-6 flex flex-col items-center space-y-4 shadow-xl">
				<div class="animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 {sizeClasses[size]}"></div>
				{#if text}
					<p class="text-gray-700 {textSizeClasses[size]} font-medium">{text}</p>
				{/if}
			</div>
		</div>
	{:else}
		<div class="flex items-center justify-center space-x-2">
			<div class="animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 {sizeClasses[size]}"></div>
			{#if text}
				<p class="text-gray-700 {textSizeClasses[size]} font-medium">{text}</p>
			{/if}
		</div>
	{/if}
{/if}

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	
	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
