<script lang="ts">
	import type { Hotel } from '$lib/config/api';
	import { goto } from '$app/navigation';
	
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
	
	function getHotelName(): string {
		return hotel.name || 'Hotel sin nombre';
	}
	
	function getCityName(): string {
		// Usar datos reales disponibles
		if (hotel.wishlistName) {
			return hotel.wishlistName;
		}
		if (hotel.propertyType) {
			return hotel.propertyType;
		}
		return 'Ubicación disponible';
	}
	
	function getDistanceFromCenter(): string {
		// Usar datos reales si están disponibles, sino mostrar mensaje genérico
		if (hotel.latitude && hotel.longitude) {
			// En una implementación real, aquí se calcularía la distancia al centro de la ciudad
			// Por ahora, usamos un valor estimado basado en la posición
			const estimatedDistance = Math.abs(hotel.latitude) * 0.1; // Estimación simple
			return `a ${estimatedDistance.toFixed(1)} km del centro`;
		}
		return 'Ubicación disponible';
	}
	
	function getRoomDescription(): string {
		if (hotel.proposedAccommodation && hotel.proposedAccommodation.length > 0) {
			// Mostrar solo el primer tipo de habitación para evitar texto muy largo
			return hotel.proposedAccommodation[0] || 'Habitación estándar';
		}
		// Usar información del hotel si está disponible
		if (hotel.propertyType) {
			return hotel.propertyType;
		}
		return 'Habitación estándar';
	}
	
	function getRoomCount(): string {
		// Usar datos reales si están disponibles
		if (hotel.proposedAccommodation && hotel.proposedAccommodation.length > 0) {
			const roomTypes = hotel.proposedAccommodation.length;
			return `${roomTypes} tipo${roomTypes > 1 ? 's' : ''} de habitación${roomTypes > 1 ? 'es' : ''} disponible${roomTypes > 1 ? 's' : ''}`;
		}
		return 'Habitaciones disponibles';
	}
	
	function getReviewWord(score: number): string {
		if (score >= 9) return 'Excelente';
		if (score >= 8.5) return 'Fabuloso';
		if (score >= 8) return 'Muy bueno';
		if (score >= 7) return 'Bueno';
		return 'Aceptable';
	}
	
	function getReviewColor(score: number): string {
		if (score >= 9) return 'text-green-600';
		if (score >= 8) return 'text-blue-600';
		if (score >= 7) return 'text-yellow-600';
		return 'text-gray-600';
	}
	
	function getPriceDisplay(): string {
		const price = hotel.priceBreakdown?.grossPrice?.value || 0;
		const currency = hotel.priceBreakdown?.grossPrice?.currency || hotel.currency || 'USD';
		return formatPrice(price, currency);
	}
	
	function getTaxAmount(): string {
		// Calcular aproximadamente 20% del precio como impuestos
		const price = hotel.priceBreakdown?.grossPrice?.value || 0;
		const taxAmount = Math.round(price * 0.2);
		const currency = hotel.priceBreakdown?.grossPrice?.currency || hotel.currency || 'USD';
		return formatPrice(taxAmount, currency);
	}
	
	function getNightsAndGuests(): string {
		const adults = searchParams?.adults_number || 2;
		const children = searchParams?.children_number || 0;
		const rooms = searchParams?.room_number || 1;
		
		// Calcular noches basado en fechas si están disponibles
		let nights = 1;
		if (searchParams?.checkin_date && searchParams?.checkout_date) {
			const checkIn = new Date(searchParams.checkin_date);
			const checkOut = new Date(searchParams.checkout_date);
			const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
			nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		}
		
		let config = `${nights} noche${nights > 1 ? 's' : ''}, ${adults} adulto${adults > 1 ? 's' : ''}`;
		if (children > 0) {
			config += `, ${children} niño${children > 1 ? 's' : ''}`;
		}
		
		return config;
	}
	
	function getRemainingRooms(): number {
		// Usar datos reales basados en la disponibilidad del hotel
		if (hotel.proposedAccommodation && hotel.proposedAccommodation.length > 0) {
			// Estimación basada en el número de tipos de habitación disponibles
			return Math.min(hotel.proposedAccommodation.length, 5);
		}
		return 1; // Mínimo 1 habitación disponible
	}
	
	// Variable para controlar si ya se está navegando
	let isNavigating = false;
	
	function handleViewAvailability() {
		// Evitar múltiples navegaciones simultáneas
		if (isNavigating) {
			console.log('⏳ Ya se está navegando, ignorando clic');
			return;
		}
		
		isNavigating = true;
		
		const url = `/hotel/${hotel.id}?${new URLSearchParams({
			checkin_date: searchParams?.checkin_date || '',
			checkout_date: searchParams?.checkout_date || '',
			adults_number: searchParams?.adults_number || '2',
			children_number: searchParams?.children_number || '0',
			room_number: searchParams?.room_number || '1'
		}).toString()}`;
		
		console.log('🔗 Navegando a:', url);
		goto(url).finally(() => {
			// Resetear el flag después de un pequeño delay
			setTimeout(() => {
				isNavigating = false;
			}, 1000);
		});
	}
</script>

<!-- Tarjeta de hotel con nuevo diseño -->
<div class="bg-white rounded-lg border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
	<div class="flex flex-col sm:flex-row">
		<!-- Columna 1: Imagen cuadrada -->
		<div class="p-4 sm:w-64 lg:w-72 h-48 sm:h-64 lg:h-72 relative">
			{#if hotel.photoMainUrl}
				<img 
					src={hotel.photoMainUrl} 
					alt={getHotelName()}
					class="w-full rounded-lg h-full object-cover"
					loading="lazy"
				/>
			{:else}
				<div class="w-full h-full bg-gray-200 flex items-center justify-center">
					<span class="text-gray-500 text-lg">Sin imagen</span>
				</div>
			{/if}
			
			<!-- Icono de corazón -->
			<button class="absolute top-5 right-5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors duration-200">
				<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
				</svg>
			</button>
		</div>
		
		<!-- Columna 2: Información del hotel -->
		<div class="flex-1 p-2 px-4 min-w-0">
			<!-- Nombre del hotel -->
			<h3 class="text-lg sm:text-xl lg:text-xl font-bold mb-2 truncate" style="color: #006CE4;">
				{getHotelName()}
			</h3>
			
			<!-- Ubicación y mapa -->
			<div class="flex flex-col sm:flex-row sm:items-center text-sm lg:text-xs mb-3 gap-1 sm:gap-0" style="color: #006CE4;">
				<span class="underline truncate">{getCityName()}</span>
				<span class="hidden sm:inline mx-1 text-gray-400">-</span>
				<button class="underline hover:no-underline text-left sm:text-center">Mostrar en el mapa</button>
				<span class="hidden sm:inline mx-1 text-gray-400">-</span>
				<span class="text-gray-600 truncate">{getDistanceFromCenter()}</span>
			</div>
			
			<!-- Descripción de habitación -->
			<div class="text-sm lg:text-xs text-gray-700 mb-2">
				<div class="font-semibold">{getRoomDescription()}</div>
				<div class="text-gray-600">{getRoomCount()}</div>
			</div>
			
			<!-- Características en verde -->
			<div class="flex flex-col gap-2 mb-2">
				<span class="inline-flex items-start text-sm lg:text-xs text-green-600">
					<svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
					</svg>
					<span>Parking</span>
				</span>
				<span class="inline-flex items-start text-sm lg:text-xs text-green-600">
					<svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
					</svg>
					<span>Cancelación gratis</span>
				</span>
				<span class="inline-flex items-start text-sm lg:text-xs text-green-600">
					<svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
					</svg>
					<span class="hidden sm:inline">Sin pago por adelantado - Pagarás en el alojamiento</span>
					<span class="sm:hidden">Pago en el alojamiento</span>
				</span>
			</div>
			
			<!-- Habitaciones restantes -->
			<div class="text-sm lg:text-xs text-red-600 mb-4 font-semibold">
				Solo quedan {getRemainingRooms()} habitaciones a este precio en nuestra web
			</div>
		</div>
		
		<!-- Columna 3: Precios y calificaciones -->
		<div class="sm:w-44 p-2 text-right px-4 flex-shrink-0">
			<!-- Contenedor de calificaciones -->
			<div class="flex justify-end gap-2 mb-2">
				<div class="text-right">
					<div class="text-sm lg:text-sm font-medium text-gray-900">{getReviewWord(hotel.reviewScore)}</div>
					<div class="text-xs lg:text-xs text-gray-600">{hotel.reviewCount} comentarios</div>
				</div>
				<div class="bg-[#003b95] text-white px-2 py-1 rounded-lg font-bold text-sm text-center flex items-center justify-center">
					{hotel.reviewScore}
				</div>
			</div>
			
			<!-- Noches y huéspedes -->
			<div class="text-sm lg:text-xs text-gray-600 mb-3">
				{getNightsAndGuests()}
			</div>
			
			<!-- Precio principal -->
			<div class="text-2xl lg:text-2xl font-bold text-gray-900 mb-1">
				{getPriceDisplay()}
			</div>
			
			<!-- Impuestos -->
			<div class="text-sm lg:text-sm text-gray-500 mb-4">
				+ {getTaxAmount()} de impuestos y cargos
			</div>
			
			<!-- Botón -->
			<button 
				class="text-sm w-full bg-[#003b95] hover:bg-[#005bb5] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
				on:click={handleViewAvailability}
				disabled={isNavigating}
			>
				{#if isNavigating}
					<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Cargando...
				{:else}
					Ver disponibilidad
					<svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
					</svg>
				{/if}
			</button>
		</div>
	</div>
</div>
