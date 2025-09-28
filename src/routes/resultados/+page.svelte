<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { searchResultsStore, searchResultsActions } from '$lib/stores/searchResults';
	import { BOOKING_API_CONFIG } from '$lib/config/api';
	import Header from '$lib/components/common/Header.svelte';
	import Navbar from '$lib/components/common/Navbar.svelte';
	import Hero from '$lib/components/common/Hero.svelte';
	import SearchForm from '$lib/components/common/SearchForm.svelte';
	import HotelCard from '$lib/components/search/HotelCard.svelte';
	import FiltersPanel from '$lib/components/search/FiltersPanel.svelte';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	
	
	// Estado reactivo
	$: searchState = $searchResultsStore;
	
	// Datos iniciales para el SearchForm
	$: searchFormData = {
		destination: searchState.destination || null,
		checkInDate: searchState.filters?.checkIn || '',
		checkOutDate: searchState.filters?.checkOut || '',
		adults: searchState.filters?.adults || 2,
		children: searchState.filters?.children || 0,
		rooms: searchState.filters?.rooms || 1,
		pets: false
	};
	
	// Debug: Log cuando cambien los datos
	$: console.log('📊 Datos del SearchForm generados:', searchFormData);
	
	onMount(async () => {
		// Obtener parámetros de búsqueda desde la URL
		const urlParams = new URLSearchParams($page.url.search);
		
		const searchParams = {
			dest_id: urlParams.get('dest_id') || '',
			checkin_date: urlParams.get('checkin_date') || '',
			checkout_date: urlParams.get('checkout_date') || '',
			adults_number: parseInt(urlParams.get('adults_number') || '2'),
			children_number: parseInt(urlParams.get('children_number') || '0'),
			room_number: parseInt(urlParams.get('room_number') || '1'),
			locale: 'es',
			dest_type: 'city',
			filter_by_currency: 'COP',
			order_by: 'popularity',
			units: 'metric',
			page_number: 0,
			include_adjacency: true
		};
		
		const destination = {
			name: urlParams.get('destination_name') || 'Destino no especificado',
			dest_id: urlParams.get('dest_id') || ''
		};
		
		const filters = {
			checkIn: urlParams.get('checkin_date') || '',
			checkOut: urlParams.get('checkout_date') || '',
			adults: parseInt(urlParams.get('adults_number') || '2'),
			children: parseInt(urlParams.get('children_number') || '0'),
			rooms: parseInt(urlParams.get('room_number') || '1'),
			currency: 'COP',
			sortBy: 'popularity'
		};
		
		// Iniciar búsqueda
		searchResultsActions.startSearch(searchParams, destination, filters);
		
		// Realizar búsqueda
		await searchHotels(searchParams);
	});
	
	async function searchHotels(params: any) {
		try {
			// Construir parámetros de búsqueda
			const searchParams = new URLSearchParams({
				dest_id: params.dest_id,
				checkin_date: params.checkin_date,
				checkout_date: params.checkout_date,
				adults_number: params.adults_number.toString(),
				room_number: params.room_number.toString(),
				locale: 'es',
				dest_type: 'city',
				filter_by_currency: 'COP',
				order_by: 'popularity',
				units: 'metric',
				page_number: '0',
				include_adjacency: 'true'
			});
			
			// Solo agregar children_number si hay niños
			if (params.children_number > 0) {
				searchParams.set('children_number', params.children_number.toString());
				const childrenAges = Array(params.children_number).fill('5').join(',');
				searchParams.set('children_ages', childrenAges);
			}
			
			// Construir URL de búsqueda
			const url = `https://booking-com.p.rapidapi.com/v1/hotels/search?${searchParams.toString()}`;
			
			// Realizar búsqueda
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
			
			// Verificar si hay resultados
			if (!data.result || data.result.length === 0) {
				searchResultsActions.setError('No se encontraron hoteles con los criterios de búsqueda');
				return;
			}
			
			// Actualizar resultados
			searchResultsActions.updateResults(data.result, data.total_count_with_filters, data.primary_count);
			
		} catch (error) {
			console.error('Error en la búsqueda:', error);
			searchResultsActions.setError('Error al buscar hoteles. Intenta nuevamente.');
		}
	}
</script>

<svelte:head>
	<title>Resultados de búsqueda - Booki</title>
	<meta name="description" content="Encuentra los mejores hoteles para tu viaje" />
</svelte:head>

<!-- Header completo con SearchForm -->
<Header>
	<Navbar />
	<Hero>
		<SearchForm initialData={searchFormData} />
	</Hero>
</Header>

<!-- Contenido principal -->
<main class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<!-- Título -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">
				Resultados de búsqueda
			</h1>
			<p class="text-gray-600">
				{#if searchState.destination}
					Hoteles en {searchState.destination.name}
				{:else}
					Cargando resultados...
				{/if}
			</p>
		</div>
		
		<!-- Layout responsivo -->
		<div class="flex flex-col lg:flex-row gap-8">
			<!-- Panel lateral de filtros (oculto en móviles, visible en desktop) -->
			<div class="lg:w-1/4 order-2 lg:order-1">
				<div class="lg:sticky lg:top-8">
					<FiltersPanel 
						filters={searchState.filters}
						destination={searchState.destination}
						totalCount={searchState.totalCount}
						primaryCount={searchState.primaryCount}
					/>
				</div>
			</div>
			
			<!-- Lista de hoteles -->
			<div class="lg:w-3/4 order-1 lg:order-2">
				{#if searchState.isLoading}
					<!-- Estado de carga -->
					<div class="flex flex-col items-center justify-center py-16">
						<LoadingSpinner />
						<p class="text-gray-600 mt-4">Buscando hoteles...</p>
					</div>
				{:else if searchState.error}
					<!-- Estado de error -->
					<div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
						<div class="text-red-600 text-6xl mb-4">⚠️</div>
						<h3 class="text-lg font-semibold text-red-800 mb-2">Error en la búsqueda</h3>
						<p class="text-red-600 mb-4">{searchState.error}</p>
						<button 
							class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
							on:click={() => window.history.back()}
						>
							Volver a buscar
						</button>
					</div>
				{:else if searchState.hotels.length === 0}
					<!-- Sin resultados -->
					<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
						<div class="text-yellow-600 text-6xl mb-4">🔍</div>
						<h3 class="text-lg font-semibold text-yellow-800 mb-2">No se encontraron hoteles</h3>
						<p class="text-yellow-600 mb-4">Intenta con otros criterios de búsqueda</p>
						<button 
							class="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
							on:click={() => window.history.back()}
						>
							Modificar búsqueda
						</button>
					</div>
				{:else}
					<!-- Lista de hoteles -->
					<div class="space-y-6">
						{#each searchState.hotels as hotel (hotel.id)}
							<HotelCard {hotel} searchParams={searchState.searchParams} />
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</main>
