<script lang="ts">
	
	// Props para las imágenes
	export let images: { src: string; alt?: string }[] = [];
	
	let currentIndex = 0;
	let carouselContainer: HTMLDivElement;
	
	// Usar las imágenes reales o fallback a datos de ejemplo
	$: displayImages = images.length > 0 ? images : [
		{ src: '/assets/hotel/static1.jpg', alt: 'Piscina en la azotea' },
		{ src: '/assets/hotel/static2.jpg', alt: 'Exterior del hotel' },
		{ src: '/assets/hotel/static3.jpg', alt: 'Habitación estándar' },
		{ src: '/assets/hotel/static4.jpg', alt: 'Lobby principal' },
		{ src: '/assets/hotel/static5.jpg', alt: 'Área de comedor' },
		{ src: '/assets/hotel/static6.jpg', alt: 'Suite ejecutiva' },
		{ src: '/assets/hotel/static7.jpg', alt: 'Área de trabajo' },
		{ src: '/assets/hotel/static8.jpg', alt: 'Baño moderno' }
	];
	
	function nextImage() {
		currentIndex = (currentIndex + 1) % displayImages.length;
	}
	
	function prevImage() {
		currentIndex = currentIndex === 0 ? displayImages.length - 1 : currentIndex - 1;
	}
	
	function goToImage(index: number) {
		currentIndex = index;
	}
</script>

<div class="md:hidden">
	<div class="relative">
		<!-- Contenedor del carrusel -->
		<div 
			bind:this={carouselContainer}
			class="relative overflow-hidden rounded-lg"
		>
			<!-- Imagen actual -->
			<div class="relative h-[300px] bg-gray-300 flex items-center justify-center">
				{#if displayImages[currentIndex]?.src && displayImages[currentIndex].src !== '---'}
					<img src={displayImages[currentIndex].src} alt={displayImages[currentIndex].alt || 'Hotel'} class="w-full h-full object-cover" />
				{:else}
					<span class="text-gray-600 font-medium text-lg">
						{displayImages[currentIndex]?.alt || 'Imagen no disponible'}
					</span>
				{/if}
				
				<!-- Botones de navegación -->
				<button 
					on:click={prevImage}
					class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
					aria-label="Imagen anterior"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				
				<button 
					on:click={nextImage}
					class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
					aria-label="Siguiente imagen"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>
		</div>
		
		<!-- Indicadores de puntos -->
		<div class="flex justify-center mt-4 space-x-2">
			{#each displayImages as _, index}
				<button
					on:click={() => goToImage(index)}
					class="w-2 h-2 rounded-full transition-all {index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}"
					aria-label="Ir a imagen {index + 1}"
				></button>
			{/each}
		</div>
		
		<!-- Contador de imágenes -->
		<div class="text-center mt-2 text-sm text-gray-600">
			{currentIndex + 1} de {displayImages.length}
		</div>
		
		<!-- Botón para ver más fotos -->
		<div class="text-center mt-4">
			<button class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
				Ver todas las fotos ({displayImages.length})
			</button>
		</div>
	</div>
</div>
