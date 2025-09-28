<script lang="ts">
	import type { Hotel } from '$lib/config/api';
	
	// Props
	export let hotel: Hotel;
	export let searchParams: any;
	
	// Funciones helper
	function formatPrice(price: number, currency: string): string {
		return new Intl.NumberFormat('es-CO', {
			style: 'currency',
			currency: currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(price);
	}
	
	function getStarRating(starClass: number): string {
		return '★'.repeat(starClass);
	}
	
	function getReviewColor(score: number): string {
		if (score >= 9) return 'text-green-600';
		if (score >= 8) return 'text-blue-600';
		if (score >= 7) return 'text-yellow-600';
		return 'text-gray-600';
	}
	
	function getPriceDisplay(): string {
		const price = hotel.composite_price_breakdown?.all_inclusive_amount?.value || 
					 hotel.price_breakdown?.all_inclusive_price || 0;
		const currency = hotel.currency_code || 'USD';
		return formatPrice(price, currency);
	}
	
	function getConfigurationText(): string {
		const adults = searchParams?.adults_number || 2;
		const children = searchParams?.children_number || 0;
		const rooms = searchParams?.room_number || 1;
		
		let config = `${adults} adulto${adults > 1 ? 's' : ''}`;
		if (children > 0) {
			config += `, ${children} niño${children > 1 ? 's' : ''}`;
		}
		config += `, ${rooms} habitación${rooms > 1 ? 'es' : ''}`;
		
		return config;
	}
</script>

<div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
	<div class="flex flex-col lg:flex-row">
		<!-- Columna izquierda: Imagen -->
		<div class="lg:w-1/2 h-64 lg:h-auto">
			{#if hotel.main_photo_url}
				<img 
					src={hotel.main_photo_url} 
					alt={hotel.hotel_name || hotel.hotel_name_trans}
					class="w-full h-full object-cover"
					loading="lazy"
				/>
			{:else}
				<div class="w-full h-full bg-gray-200 flex items-center justify-center">
					<span class="text-gray-500 text-lg">Sin imagen</span>
				</div>
			{/if}
		</div>
		
		<!-- Columna derecha: Información -->
		<div class="lg:w-1/2 p-6 flex flex-col justify-between">
			<div>
				<!-- Nombre del hotel -->
				<h3 class="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
					{hotel.hotel_name || hotel.hotel_name_trans}
				</h3>
				
				<!-- Ubicación -->
				<div class="flex items-center text-gray-600 mb-3">
					<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
					</svg>
					<span class="text-sm">{hotel.address}, {hotel.city}</span>
				</div>
				
				<!-- Calificación y estrellas -->
				<div class="flex items-center mb-3">
					<div class="flex items-center mr-4">
						<span class="text-yellow-400 text-lg mr-1">{getStarRating(hotel.class)}</span>
						<span class="text-gray-600 text-sm">{hotel.class} estrellas</span>
					</div>
					<div class="flex items-center">
						<span class="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-2">
							{hotel.review_score}/10
						</span>
						<span class="text-gray-600 text-sm">({hotel.review_nr} reseñas)</span>
					</div>
				</div>
				
				<!-- Amenidades -->
				<div class="flex flex-wrap gap-2 mb-4">
					{#if hotel.has_swimming_pool}
						<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
							🏊 Piscina
						</span>
					{/if}
					{#if hotel.has_free_parking}
						<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
							🅿️ Estacionamiento gratis
						</span>
					{/if}
					{#if hotel.is_free_cancellable}
						<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
							❌ Cancelación gratis
						</span>
					{/if}
				</div>
				
				<!-- Configuración de habitación -->
				<div class="mb-4">
					<p class="text-sm text-gray-600">{@html hotel.unit_configuration_label}</p>
				</div>
			</div>
			
			<!-- Precio y botón -->
			<div class="flex items-center justify-between">
				<div>
					<div class="text-3xl font-bold text-gray-900">
						{getPriceDisplay()}
					</div>
					<div class="text-sm text-gray-600">
						para {getConfigurationText()}
					</div>
				</div>
				
				<button 
					class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
					on:click={() => window.open(hotel.url, '_blank')}
				>
					Ver disponibilidad
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
