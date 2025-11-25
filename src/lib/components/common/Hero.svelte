<script>
	import { PRICE_DISCOUNT } from '$lib/config/discount';
	
	// Props
	export let showText = true; // Por defecto muestra el texto
	
	// Calcular el porcentaje de descuento para mostrar
	const discountPercentage = Math.round(PRICE_DISCOUNT * 100);
</script>

<div class="relative pb-[145px] md:pb-16 z-50">
	<!-- Etiqueta de descuento roja -->
	<div class="absolute top-4 right-4 md:top-6 md:right-6 z-50 animate-bounce-subtle">
		<div class="relative">
			<!-- Etiqueta principal -->
			<div class="bg-red-600 text-white px-4 py-2 rounded-lg shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
				<div class="flex items-center gap-2">
					<span class="text-2xl font-bold" style="font-family: 'Bebas Neue', sans-serif;">{discountPercentage}%</span>
					<div class="flex flex-col">
						<span class="text-xs font-bold leading-tight">OFF</span>
						<span class="text-[10px] leading-tight opacity-90">BLACK DAYS</span>
					</div>
				</div>
			</div>
			<!-- Efecto de brillo -->
			<div class="absolute inset-0 bg-red-400 rounded-lg blur-sm opacity-50 -z-10 animate-pulse"></div>
		</div>
	</div>
	
	{#if showText}
		<p class="px-2 text-5xl font-bold text-white mt-10">Encuentra tu próxima estancia</p>
		<p class="px-2 text-white text-xl mt-2">Busca ofertas en hoteles, casas y mucho más...</p>
	{/if}
	<slot />
</div>
