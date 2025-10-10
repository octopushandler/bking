<script lang="ts">
	
	// Props para las imágenes
	// export let images: string[] = [];
	
	let currentIndex = 0;
	let carouselContainer: HTMLDivElement;
	
	// Datos de ejemplo para las imágenes
	const sampleImages = [
		{ id: 1, title: 'Piscina en la azotea', type: 'main' },
		{ id: 2, title: 'Exterior del hotel', type: 'exterior' },
		{ id: 3, title: 'Habitación estándar', type: 'room' },
		{ id: 4, title: 'Lobby principal', type: 'lobby' },
		{ id: 5, title: 'Área de comedor', type: 'dining' },
		{ id: 6, title: 'Suite ejecutiva', type: 'suite' },
		{ id: 7, title: 'Área de trabajo', type: 'desk' },
		{ id: 8, title: 'Baño moderno', type: 'bathroom' }
	];
	
	function nextImage() {
		currentIndex = (currentIndex + 1) % sampleImages.length;
	}
	
	function prevImage() {
		currentIndex = currentIndex === 0 ? sampleImages.length - 1 : currentIndex - 1;
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
				<span class="text-gray-600 font-medium text-lg">
					{sampleImages[currentIndex].title}
				</span>
				
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
			{#each sampleImages as _, index}
				<button
					on:click={() => goToImage(index)}
					class="w-2 h-2 rounded-full transition-all {index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}"
					aria-label="Ir a imagen {index + 1}"
				></button>
			{/each}
		</div>
		
		<!-- Contador de imágenes -->
		<div class="text-center mt-2 text-sm text-gray-600">
			{currentIndex + 1} de {sampleImages.length}
		</div>
		
		<!-- Botón para ver más fotos -->
		<div class="text-center mt-4">
			<button class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
				Ver todas las fotos ({sampleImages.length})
			</button>
		</div>
	</div>
</div>
