<script lang="ts">
	// Recibe un array de imágenes
	export let images: { src: string; alt?: string }[] = [];
  
	// Variables reactivas para las imágenes (como en el componente mobile)
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
	
	// Función mejorada para obtener imagen con fallback (sin reactividad)
	function img(i: number): string {
		const imageSrc = displayImages[i]?.src;
		// Si la imagen es válida y no es placeholder, la devolvemos
		if (imageSrc && imageSrc !== '---' && imageSrc !== '') {
			return imageSrc;
		}
		// Fallback a imagen estática
		return `/assets/hotel/static${(i % 8) + 1}.jpg`;
	}
	
	function alt(i: number): string {
		return displayImages[i]?.alt ?? `Foto ${i + 1}`;
	}
	
	function extra(): number {
		return Math.max(0, displayImages.length - 8); // fotos adicionales
	}
	
	// Estado para manejar errores de carga de imágenes
	let imageErrors = new Set<number>();
	
	// Estado para controlar qué imágenes han cargado
	let loadedImages = new Set<number>();
	
	function handleImageError(index: number) {
		imageErrors.add(index);
		// Forzar re-render
		imageErrors = imageErrors;
	}
	
	function handleImageLoad(index: number) {
		console.log(`🖼️ Imagen ${index} cargada exitosamente`);
		loadedImages.add(index);
		// Forzar re-render
		loadedImages = loadedImages;
		console.log(`📊 Imágenes cargadas:`, Array.from(loadedImages));
	}
	
	function getImageSrc(index: number): string {
		if (imageErrors.has(index)) {
			return `/assets/hotel/static${(index % 8) + 1}.jpg`;
		}
		const baseSrc = img(index);
		// Agregar timestamp para forzar re-render cuando cambien las imágenes
		return `${baseSrc}?t=${imageKey}`;
	}
	
	function isImageLoaded(index: number): boolean {
		const loaded = loadedImages.has(index);
		console.log(`🔍 Imagen ${index} cargada: ${loaded}`);
		return loaded;
	}
	
	// Resetear estados cuando cambien las imágenes (solo al inicio)
	let previousImagesLength = 0;
	let imageKey = 0; // Key para forzar re-render de imágenes
	
	// Función para resetear estados cuando cambien las imágenes
	function resetImageStates() {
		if (images && images.length !== previousImagesLength) {
			console.log(`🔄 Reseteando estados - Nuevas imágenes: ${images.length}, Anteriores: ${previousImagesLength}`);
			// Solo limpiar estados cuando realmente cambien las imágenes
			imageErrors = new Set();
			loadedImages = new Set();
			previousImagesLength = images.length;
			imageKey++; // Incrementar key para forzar re-render
			console.log(`🧹 Estados limpiados, nueva key: ${imageKey}`);
		}
	}
	
	// Llamar resetImageStates cuando cambien las imágenes
	$: if (images) {
		resetImageStates();
	}
</script>
  
  <div class="parent hidden md:grid">
	<!-- 1) Imagen principal -->
	<figure class="div1 frame" class:skeleton={!isImageLoaded(0)}>
	  <img 
		src={getImageSrc(0)} 
		alt={alt(0)} 
		on:error={() => handleImageError(0)}
		on:load={() => handleImageLoad(0)}
		loading="lazy"
	  />
	</figure>
  
	<!-- 2) Columna derecha con 2 imágenes apiladas -->
	<div class="div2">
	  <figure class="frame" class:skeleton={!isImageLoaded(1)}>
		<img 
		  src={getImageSrc(1)} 
		  alt={alt(1)} 
		  on:error={() => handleImageError(1)}
		  on:load={() => handleImageLoad(1)}
		  loading="lazy"
		/>
	  </figure>
	  <figure class="frame" class:skeleton={!isImageLoaded(2)}>
		<img 
		  src={getImageSrc(2)} 
		  alt={alt(2)} 
		  on:error={() => handleImageError(2)}
		  on:load={() => handleImageLoad(2)}
		  loading="lazy"
		/>
	  </figure>
	</div>
  
	<!-- 3) Fila inferior con 5 miniaturas -->
	<div class="div3">
	  {#each [3,4,5,6,7] as i, idx}
		<figure class="frame" class:skeleton={!isImageLoaded(i)}>
		  <img 
			src={getImageSrc(i)} 
			alt={alt(i)} 
			on:error={() => handleImageError(i)}
			on:load={() => handleImageLoad(i)}
			loading="lazy"
		  />
		  {#if idx === 4 && extra() > 0}
			<span class="badge">+{extra()} fotos</span>
		  {/if}
		</figure>
	  {/each}
	</div>
  </div>
  
  <style>
	.parent {
	  display: none;
	  grid-template-columns: repeat(5, 1fr);
	  grid-template-rows: repeat(5, 1fr);
	  gap: 8px;
	  height: 420px; /* altura fija garantizada */
	  min-height: 420px; /* altura mínima adicional */
	}

	@media (min-width: 768px) {
	  .parent {
		display: grid;
	  }
	}
  
	/* 1) Principal: 3 columnas × 4 filas */
	.div1 {
	  grid-column: 1 / span 3;
	  grid-row: 1 / span 4;
	  min-height: 0; /* Permite que el grid funcione correctamente */
	}
  
	/* 2) Columna derecha: 2 columnas × 4 filas, con 2 imágenes apiladas */
	.div2 {
	  grid-column: 4 / span 2;
	  grid-row: 1 / span 4;
	  display: grid;
	  grid-template-rows: 1fr 1fr;
	  gap: 8px;
	  min-height: 0; /* Permite que el grid funcione correctamente */
	}
  
	/* 3) Fila inferior: ocupa toda la fila 5 (5 columnas) */
	.div3 {
	  grid-column: 1 / span 5;
	  grid-row: 5 / span 1;
	  display: grid;
	  grid-template-columns: repeat(5, 1fr);
	  gap: 8px;
	  min-height: 0; /* Permite que el grid funcione correctamente */
	}
  
	.frame {
	  position: relative;
	  overflow: hidden;
	  border-radius: 12px;
	  min-height: 0; /* Importante para que funcione con grid */
	  background-color: #f3f4f6; /* Color de fondo mientras carga */
	}
  
	.frame img {
	  width: 100%;
	  height: 100%;
	  object-fit: cover;
	  display: block;
	  transition: opacity 0.3s ease; /* Transición suave */
	  position: relative;
	  z-index: 2; /* Por encima del skeleton */
	}
  
	/* Placeholder mientras carga la imagen */
	.frame img:not([src]), 
	.frame img[src=""] {
	  opacity: 0;
	}
  
	.frame img[src]:not([src=""]) {
	  opacity: 1;
	}
  
	.badge {
	  position: absolute;
	  right: 8px;
	  bottom: 8px;
	  background: rgba(0, 0, 0, 0.7);
	  color: #fff;
	  font-size: 12px;
	  padding: 4px 8px;
	  border-radius: 6px;
	  z-index: 10;
	}
	
	/* Skeleton loader para imágenes que están cargando */
	.frame.skeleton::before {
	  content: '';
	  position: absolute;
	  top: 0;
	  left: 0;
	  right: 0;
	  bottom: 0;
	  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	  background-size: 200% 100%;
	  animation: loading 1.5s infinite;
	  z-index: 1;
	}
	
	/* Ocultar skeleton cuando la imagen está cargada */
	.frame:not(.skeleton)::before {
	  display: none;
	}
	
	@keyframes loading {
	  0% {
		background-position: 200% 0;
	  }
	  100% {
		background-position: -200% 0;
	  }
	}
  </style>
  