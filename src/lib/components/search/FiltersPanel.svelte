<script lang="ts">
	import type { SearchResultsState } from '$lib/stores/searchResults';
	import { searchResultsActions } from '$lib/stores/searchResults';
	
	// Props
	export let filters: SearchResultsState['filters'];
	export const destination: SearchResultsState['destination'] = undefined;
	export const totalCount: number = 0;
	export const primaryCount: number = 0;
	export let onFilterChange: () => void;
	export const showMobileFilters: boolean = false;
	export let isFiltering: boolean = false;
	
	// Estado para secciones colapsables
	let expandedSections = {
		services: true,
		payment: true,
		accommodation: true,
		special: true
	};
	
	// Función para manejar cambios en checkboxes
	function handleFilterChange(category: string, key: string, value: boolean) {
		searchResultsActions.updateFilter(category, key, value);
		onFilterChange(); // Lanzar nueva búsqueda
	}
	
	// Helper para manejar eventos de checkbox
	function handleCheckboxChange(category: string, key: string, event: Event) {
		const target = event.target as HTMLInputElement;
		handleFilterChange(category, key, target.checked);
	}
	
	// Función para toggle de secciones
	function toggleSection(section: keyof typeof expandedSections) {
		expandedSections[section] = !expandedSections[section];
		expandedSections = { ...expandedSections };
	}
</script>

<!-- Panel de filtros -->
<div class="relative bg-white rounded-xl border border-zinc-200 p-4 sm:p-6 mb-6">
	<h3 class="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Filtrar por:</h3>
	
	<!-- Servicios y Amenidades -->
	<div class="mb-6">
		<button 
			on:click={() => toggleSection('services')}
			class="w-full flex items-center justify-between text-left mb-4 hover:text-gray-700 transition-colors duration-200"
		>
			<h4 class="text-base font-medium text-gray-900">Servicios y Amenidades</h4>
			<svg 
				class="w-4 h-4 text-gray-500 transform transition-transform duration-200 {expandedSections.services ? 'rotate-180' : ''}" 
				fill="none" 
				stroke="currentColor" 
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
			</svg>
		</button>
		
		{#if expandedSections.services}
			<div class="space-y-3">
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.services?.freeCancellation || false}
						on:change={(e) => handleCheckboxChange('services', 'freeCancellation', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Cancelación gratuita</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.services?.wifi || false}
						on:change={(e) => handleCheckboxChange('services', 'wifi', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Wi-Fi gratuito</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.services?.parking || false}
						on:change={(e) => handleCheckboxChange('services', 'parking', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Estacionamiento</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.services?.pool || false}
						on:change={(e) => handleCheckboxChange('services', 'pool', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Piscina</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.services?.gym || false}
						on:change={(e) => handleCheckboxChange('services', 'gym', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Gimnasio</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.services?.spa || false}
						on:change={(e) => handleCheckboxChange('services', 'spa', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Spa</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.services?.restaurant || false}
						on:change={(e) => handleCheckboxChange('services', 'restaurant', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Restaurante</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.services?.bar || false}
						on:change={(e) => handleCheckboxChange('services', 'bar', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Bar</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.services?.roomService || false}
						on:change={(e) => handleCheckboxChange('services', 'roomService', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Servicio a la habitación</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.services?.concierge || false}
						on:change={(e) => handleCheckboxChange('services', 'concierge', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Conserjería</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.services?.businessCenter || false}
						on:change={(e) => handleCheckboxChange('services', 'businessCenter', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Centro de negocios</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.services?.meetingRooms || false}
						on:change={(e) => handleCheckboxChange('services', 'meetingRooms', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Salas de reuniones</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.services?.airportShuttle || false}
						on:change={(e) => handleCheckboxChange('services', 'airportShuttle', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Traslado al aeropuerto</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.services?.petFriendly || false}
						on:change={(e) => handleCheckboxChange('services', 'petFriendly', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Admite mascotas</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.services?.nonSmoking || false}
						on:change={(e) => handleCheckboxChange('services', 'nonSmoking', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">No fumador</span>
				</label>
		</div>
		{/if}
	</div>
	
	<!-- Políticas de Pago -->
	<div class="mb-6">
		<button 
			on:click={() => toggleSection('payment')}
			class="w-full flex items-center justify-between text-left mb-4 hover:text-gray-700 transition-colors duration-200"
		>
			<h4 class="text-base font-medium text-gray-900">Políticas de Pago</h4>
			<svg 
				class="w-4 h-4 text-gray-500 transform transition-transform duration-200 {expandedSections.payment ? 'rotate-180' : ''}" 
				fill="none" 
				stroke="currentColor" 
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
			</svg>
		</button>
		
		{#if expandedSections.payment}
			<div class="space-y-3">
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.paymentPolicies?.payAtHotel || false}
						on:change={(e) => handleCheckboxChange('paymentPolicies', 'payAtHotel', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Pagar en el hotel</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.paymentPolicies?.prepaymentRequired || false}
						on:change={(e) => handleCheckboxChange('paymentPolicies', 'prepaymentRequired', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Pago anticipado requerido</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.paymentPolicies?.noPrepayment || false}
						on:change={(e) => handleCheckboxChange('paymentPolicies', 'noPrepayment', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Sin pago anticipado</span>
				</label>
		</div>
			{/if}
	</div>
	
	<!-- Tipo de Alojamiento -->
	<div class="mb-6">
		<button 
			on:click={() => toggleSection('accommodation')}
			class="w-full flex items-center justify-between text-left mb-4 hover:text-gray-700 transition-colors duration-200"
		>
			<h4 class="text-base font-medium text-gray-900">Tipo de Alojamiento</h4>
			<svg 
				class="w-4 h-4 text-gray-500 transform transition-transform duration-200 {expandedSections.accommodation ? 'rotate-180' : ''}" 
				fill="none" 
				stroke="currentColor" 
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
			</svg>
		</button>
		
		{#if expandedSections.accommodation}
			<div class="space-y-3">
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.accommodationTypes?.hotel || false}
						on:change={(e) => handleCheckboxChange('accommodationTypes', 'hotel', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Hotel</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.accommodationTypes?.apartment || false}
						on:change={(e) => handleCheckboxChange('accommodationTypes', 'apartment', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Apartamento</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.accommodationTypes?.hostel || false}
						on:change={(e) => handleCheckboxChange('accommodationTypes', 'hostel', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Hostal</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.accommodationTypes?.guesthouse || false}
						on:change={(e) => handleCheckboxChange('accommodationTypes', 'guesthouse', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Casa de huéspedes</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.accommodationTypes?.resort || false}
						on:change={(e) => handleCheckboxChange('accommodationTypes', 'resort', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Resort</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.accommodationTypes?.villa || false}
						on:change={(e) => handleCheckboxChange('accommodationTypes', 'villa', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Villa</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.accommodationTypes?.bedAndBreakfast || false}
						on:change={(e) => handleCheckboxChange('accommodationTypes', 'bedAndBreakfast', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Bed & Breakfast</span>
				</label>
		</div>
			{/if}
	</div>
	
	<!-- Características Especiales -->
	<div class="mb-6">
		<button 
			on:click={() => toggleSection('special')}
			class="w-full flex items-center justify-between text-left mb-4 hover:text-gray-700 transition-colors duration-200"
		>
			<h4 class="text-base font-medium text-gray-900">Características Especiales</h4>
			<svg 
				class="w-4 h-4 text-gray-500 transform transition-transform duration-200 {expandedSections.special ? 'rotate-180' : ''}" 
				fill="none" 
				stroke="currentColor" 
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
			</svg>
		</button>
		
		{#if expandedSections.special}
			<div class="space-y-3">
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.specialFeatures?.beachfront || false}
						on:change={(e) => handleCheckboxChange('specialFeatures', 'beachfront', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Frente al mar</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.specialFeatures?.cityCenter || false}
						on:change={(e) => handleCheckboxChange('specialFeatures', 'cityCenter', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Centro de la ciudad</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.specialFeatures?.airportNearby || false}
						on:change={(e) => handleCheckboxChange('specialFeatures', 'airportNearby', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Cerca del aeropuerto</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.specialFeatures?.trainStationNearby || false}
						on:change={(e) => handleCheckboxChange('specialFeatures', 'trainStationNearby', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Cerca de estación de tren</span>
				</label>
				<label class="flex items-center cursor-pointer">
					<input 
						type="checkbox" 
						checked={filters.specialFeatures?.metroNearby || false}
						on:change={(e) => handleCheckboxChange('specialFeatures', 'metroNearby', e)}
						class="mr-3 w-4 h-4 text-blue-600 outline-0 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
					/>
					<span class="text-sm text-gray-700">Cerca del metro</span>
				</label>
		</div>
		{/if}
	</div>
	
	<!-- Overlay de carga -->
	{#if isFiltering}
		<div class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl z-10">
			<div class="flex flex-col items-center">
				<div class="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 mb-2"></div>
				<p class="text-sm text-gray-600">Aplicando filtros...</p>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Quitar outline de checkboxes */
	input[type="checkbox"]:focus {
		outline: none;
		box-shadow: none;
	}
	
	input[type="checkbox"]:focus-visible {
		outline: none;
		box-shadow: none;
	}
</style>
