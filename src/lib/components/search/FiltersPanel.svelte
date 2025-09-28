<script lang="ts">
	import type { SearchResultsState } from '$lib/stores/searchResults';
	
	// Props
	export let filters: SearchResultsState['filters'];
	export let destination: SearchResultsState['destination'];
	export let totalCount: number;
	export let primaryCount: number;
	
	// Funciones helper
	function formatDate(dateString: string): string {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('es-ES', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
	
	function getDuration(): string {
		if (!filters.checkIn || !filters.checkOut) return '';
		const checkIn = new Date(filters.checkIn);
		const checkOut = new Date(filters.checkOut);
		const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return `${diffDays} noche${diffDays > 1 ? 's' : ''}`;
	}
</script>

<div class="bg-white rounded-xl shadow-lg p-6 mb-6">
	<h3 class="text-lg font-semibold text-gray-900 mb-4">Filtros aplicados</h3>
	
	<!-- Destino -->
	<div class="mb-4">
		<div class="flex items-center text-gray-600 mb-2">
			<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
			</svg>
			<span class="text-sm font-medium">Destino</span>
		</div>
		<p class="text-gray-900 font-medium">{destination?.name || 'No especificado'}</p>
	</div>
	
	<!-- Fechas -->
	<div class="mb-4">
		<div class="flex items-center text-gray-600 mb-2">
			<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
			</svg>
			<span class="text-sm font-medium">Fechas</span>
		</div>
		<div class="text-sm text-gray-900">
			<p><strong>Check-in:</strong> {formatDate(filters.checkIn)}</p>
			<p><strong>Check-out:</strong> {formatDate(filters.checkOut)}</p>
			<p class="text-blue-600 font-medium">{getDuration()}</p>
		</div>
	</div>
	
	<!-- Huéspedes -->
	<div class="mb-4">
		<div class="flex items-center text-gray-600 mb-2">
			<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
				<path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
			</svg>
			<span class="text-sm font-medium">Huéspedes</span>
		</div>
		<div class="text-sm text-gray-900">
			<p><strong>Adultos:</strong> {filters.adults}</p>
			{#if filters.children > 0}
				<p><strong>Niños:</strong> {filters.children}</p>
			{/if}
			<p><strong>Habitaciones:</strong> {filters.rooms}</p>
		</div>
	</div>
	
	<!-- Moneda y ordenamiento -->
	<div class="mb-4">
		<div class="flex items-center text-gray-600 mb-2">
			<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
			</svg>
			<span class="text-sm font-medium">Configuración</span>
		</div>
		<div class="text-sm text-gray-900">
			<p><strong>Moneda:</strong> {filters.currency}</p>
			<p><strong>Ordenar por:</strong> Popularidad</p>
		</div>
	</div>
	
	<!-- Resultados -->
	<div class="border-t pt-4">
		<div class="flex items-center text-gray-600 mb-2">
			<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
			</svg>
			<span class="text-sm font-medium">Resultados</span>
		</div>
		<div class="text-sm text-gray-900">
			<p><strong>Hoteles encontrados:</strong> {primaryCount}</p>
			<p><strong>Total disponible:</strong> {totalCount}</p>
		</div>
	</div>
</div>
