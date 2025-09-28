<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { buildHotelDetailsUrl } from '$lib/config/api';
	import type { HotelDetails } from '$lib/config/api';
	import Header from '$lib/components/common/Header.svelte';
	import Navbar from '$lib/components/common/Navbar.svelte';
	import Hero from '$lib/components/common/Hero.svelte';
	import SearchForm from '$lib/components/common/SearchForm.svelte';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	
	// Estado reactivo
	let hotelDetails: HotelDetails | null = null;
	let isLoading = true;
	let error: string | null = null;
	let searchFormData = {
		destination: null,
		checkInDate: '',
		checkOutDate: '',
		adults: 2,
		children: 0,
		rooms: 1,
		pets: false
	};
	
	onMount(async () => {
		// Obtener parámetros de la URL
		const hotelId = $page.params.hotel_id;
		const urlParams = new URLSearchParams($page.url.search);
		
		const checkinDate = urlParams.get('checkin_date') || '';
		const checkoutDate = urlParams.get('checkout_date') || '';
		
		// Actualizar datos del SearchForm
		searchFormData = {
			destination: null,
			checkInDate: checkinDate,
			checkOutDate: checkoutDate,
			adults: parseInt(urlParams.get('adults_number') || '2'),
			children: parseInt(urlParams.get('children_number') || '0'),
			rooms: parseInt(urlParams.get('room_number') || '1'),
			pets: false
		};
		
		// Cargar detalles del hotel
		await loadHotelDetails(hotelId, checkinDate, checkoutDate);
	});
	
	async function loadHotelDetails(hotelId: string, checkinDate: string, checkoutDate: string) {
		try {
			isLoading = true;
			error = null;
			
			// Construir URL de detalles
			const url = buildHotelDetailsUrl(parseInt(hotelId), checkinDate, checkoutDate);
			
			// Realizar petición
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'x-rapidapi-host': 'booking-com.p.rapidapi.com',
					'x-rapidapi-key': 'f6ab88621dmsh873547794e47243p17758bjsn68fe60b5daf0'
				}
			});
			
			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}
			
			const data = await response.json();
			hotelDetails = data;
			
		} catch (err) {
			console.error('Error cargando detalles del hotel:', err);
			error = err instanceof Error ? err.message : 'Error desconocido al cargar detalles del hotel';
		} finally {
			isLoading = false;
		}
	}
	
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
	
	function getPriceDisplay(): string {
		if (!hotelDetails) return '';
		// Usar el precio en moneda del hotel si está disponible, sino usar el precio general
		const price = hotelDetails.composite_price_breakdown?.all_inclusive_amount_hotel_currency?.value || 
					 hotelDetails.composite_price_breakdown?.all_inclusive_amount?.value || 0;
		const currency = hotelDetails.composite_price_breakdown?.all_inclusive_amount_hotel_currency?.currency || 
						hotelDetails.currency_code || 'USD';
		return formatPrice(price, currency);
	}
</script>

<svelte:head>
	<title>{hotelDetails?.hotel_name || 'Detalles del hotel'} - Booki</title>
	<meta name="description" content="Detalles completos del hotel seleccionado" />
</svelte:head>

<!-- Header completo con SearchForm -->
<Header>
	<Navbar />
	<Hero>
		<SearchForm initialData={searchFormData} />
	</Hero>
</Header>

<!-- Contenido principal -->
<main class="min-h-screen max-w-[1200px] mx-auto mt-[50px]">
	<div class="container mx-auto px-4 py-8">
		{#if isLoading}
			<!-- Estado de carga -->
			<div class="flex flex-col items-center justify-center py-16">
				<LoadingSpinner />
				<p class="text-gray-600 mt-4">Cargando detalles del hotel...</p>
			</div>
		{:else if error}
			<!-- Estado de error -->
			<div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
				<div class="text-red-600 text-6xl mb-4">⚠️</div>
				<h3 class="text-lg font-semibold text-red-800 mb-2">Error al cargar detalles</h3>
				<p class="text-red-600 mb-4">{error}</p>
				<button 
					class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
					on:click={() => window.history.back()}
				>
					Volver atrás
				</button>
			</div>
		{:else if hotelDetails}
			<!-- Detalles del hotel -->
			<div class="space-y-8">
				<!-- Header del hotel -->
				<div class="bg-white rounded-xl shadow-lg p-6">
					<div class="flex flex-col lg:flex-row gap-6">
						<!-- Información principal -->
						<div class="flex-1">
							<h1 class="text-3xl font-bold text-gray-900 mb-2">
								{hotelDetails.hotel_name}
							</h1>
							
							<!-- Ubicación -->
							<div class="flex items-center text-gray-600 mb-4">
								<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
								</svg>
								<span class="text-lg">{hotelDetails.hotel_address_line}</span>
							</div>
							
							<!-- Calificación -->
							<div class="flex items-center mb-4">
								<div class="flex items-center mr-4">
									<span class="text-yellow-400 text-xl mr-2">{getStarRating(4)}</span>
									<span class="text-gray-600">4 estrellas</span>
								</div>
								<div class="flex items-center">
									<span class="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-2">
										{hotelDetails.review_nr} reseñas
									</span>
								</div>
							</div>
							
							<!-- Amenidades destacadas -->
							<div class="flex flex-wrap gap-2">
								{#each hotelDetails.top_ufi_benefits.slice(0, 6) as benefit}
									<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
										{benefit.translated_name}
									</span>
								{/each}
							</div>
						</div>
						
						<!-- Precio -->
						<div class="lg:w-80">
							<div class="bg-blue-50 rounded-lg p-4 text-center">
								<div class="text-4xl font-bold text-blue-900 mb-2">
									{getPriceDisplay()}
								</div>
								<div class="text-sm text-blue-700 mb-4">
									por noche
								</div>
								<button 
									class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
									on:click={() => window.open(hotelDetails.url, '_blank')}
								>
									Ver en Booking.com
								</button>
							</div>
						</div>
					</div>
				</div>
				
				<!-- Servicios y amenidades -->
				{#if hotelDetails.facilities_block?.facilities}
					<div class="bg-white rounded-xl shadow-lg p-6">
						<h2 class="text-2xl font-bold text-gray-900 mb-4">Servicios del hotel</h2>
						<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{#each hotelDetails.facilities_block.facilities as facility}
								<div class="flex items-center space-x-2">
									<span class="text-gray-400">•</span>
									<span class="text-gray-700">{facility.name}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
				
				<!-- Habitaciones disponibles -->
				{#if hotelDetails.block && hotelDetails.block.length > 0}
					<div class="bg-white rounded-xl shadow-lg p-6">
						<h2 class="text-2xl font-bold text-gray-900 mb-4">Habitaciones disponibles</h2>
						<div class="space-y-4">
							{#each hotelDetails.block as room}
								<div class="border border-gray-200 rounded-lg p-4">
									<div class="flex justify-between items-start mb-2">
										<div>
											<h3 class="text-lg font-semibold text-gray-900">{room.room_name}</h3>
											<p class="text-sm text-gray-600">{room.name_without_policy}</p>
										</div>
										<div class="text-right">
											<div class="text-xl font-bold text-gray-900">
												{formatPrice(
													room.product_price_breakdown.all_inclusive_amount_hotel_currency?.value || 
													room.product_price_breakdown.all_inclusive_amount.value, 
													room.product_price_breakdown.all_inclusive_amount_hotel_currency?.currency || 
													room.product_price_breakdown.all_inclusive_amount.currency
												)}
											</div>
											<div class="text-sm text-gray-600">por noche</div>
										</div>
									</div>
									
									<!-- Beneficios y descuentos -->
									{#if room.product_price_breakdown.benefits && room.product_price_breakdown.benefits.length > 0}
										<div class="flex flex-wrap gap-2 mb-3">
											{#each room.product_price_breakdown.benefits as benefit}
												<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
													{benefit.name}
												</span>
											{/each}
										</div>
									{/if}
									
									<!-- Detalles de la habitación -->
									<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
										<div>
											<span class="font-medium">Superficie:</span> {room.room_surface_in_m2} m²
										</div>
										<div>
											<span class="font-medium">Ocupación:</span> {room.max_occupancy} personas
										</div>
										<div>
											<span class="font-medium">Habitaciones:</span> {room.room_count}
										</div>
										<div>
											<span class="font-medium">Desayuno:</span> {room.breakfast_included ? 'Incluido' : 'No incluido'}
										</div>
									</div>
									
									<!-- Políticas -->
									{#if room.block_text?.policies}
										<div class="text-sm text-gray-600">
											{#each room.block_text.policies as policy}
												<p class="mb-1">{policy.content}</p>
											{/each}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</main>
