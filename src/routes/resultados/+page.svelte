<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { searchResultsStore, searchResultsActions } from '$lib/stores/searchResults';
	import { BOOKING_API_CONFIG, buildHotelSearchUrl } from '$lib/config/api';
	import { notificationAPI } from '$lib/stores/notifications';
	import { ENV_CONFIG } from '$lib';
	import { fetchWithRetry, handleApiError } from '$lib/utils/apiHelpers';
	import Header from '$lib/components/common/Header.svelte';
	import Navbar from '$lib/components/common/Navbar.svelte';
	import Hero from '$lib/components/common/Hero.svelte';
	import SearchForm from '$lib/components/common/SearchForm.svelte';
	import HotelCard from '$lib/components/search/HotelCard.svelte';
	import FiltersPanel from '$lib/components/search/FiltersPanel.svelte';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	import HotelCardSkeleton from '$lib/components/common/HotelCardSkeleton.svelte';
	import { validateDateRange } from '$lib/utils/dateValidation';
	import { DEFAULT_CURRENCY } from '$lib/config/currency';
	
	
	// Estado reactivo
	$: searchState = $searchResultsStore;
	
	// Estado para filtros móviles
	let showMobileFilters = false;
	
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
			filter_by_currency: DEFAULT_CURRENCY,
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
			currency: DEFAULT_CURRENCY,
			sortBy: 'popularity'
		};
		
		// Iniciar búsqueda
		searchResultsActions.startSearch(searchParams, destination, filters);
		
		// Realizar búsqueda
		await searchHotels(searchParams, filters);
	});
	
	async function searchHotels(params: any, filters?: any) {
		try {
			// Validar parámetros requeridos
			if (!params.dest_id || !params.checkin_date || !params.checkout_date) {
				throw new Error('Parámetros de búsqueda incompletos');
			}
			
			// Validar fechas (reglas realistas)
			const validation = validateDateRange(
				params.checkin_date,
				params.checkout_date,
				{ minNights: 1, maxNights: 30, allowPastCheckIn: false, maxAdvanceMonths: 18 }
			);
			if (!validation.ok) {
				throw new Error(validation.error || 'Fechas inválidas');
			}
			
			// Construir URL de búsqueda usando la función helper
			const url = buildHotelSearchUrl(params, filters);
			
			// Debug: Log de la URL y parámetros
			console.log('🔗 URL de búsqueda v2:', url);
			console.log('📋 Parámetros enviados:', params);
			console.log('🔍 Filtros aplicados:', filters);
			console.log('🔍 Dest ID validación:', {
				dest_id: params.dest_id,
				isValid: params.dest_id && params.dest_id !== '',
				type: typeof params.dest_id
			});
			
			// Realizar búsqueda con retry automático
			const response = await fetchWithRetry(url, {
				method: 'GET',
				headers: BOOKING_API_CONFIG.HEADERS
			}, {
				timeout: 15000, // 15 segundos de timeout
				maxRetries: 3,  // Máximo 3 reintentos
				retryDelay: 1000 // 1 segundo de delay inicial
			});
			
			if (!response.ok) {
				// Intentar obtener más detalles del error
				let errorDetails = '';
				try {
					const errorData = await response.json();
					errorDetails = JSON.stringify(errorData, null, 2);
				} catch (e) {
					errorDetails = 'No se pudo obtener detalles del error';
				}
				
				console.error('❌ Error de API:', {
					status: response.status,
					statusText: response.statusText,
					url: url,
					details: errorDetails
				});
				
				throw new Error(`Error ${response.status}: ${response.statusText}. Detalles: ${errorDetails}`);
			}
			
			const data = await response.json();
			
			// Debug: Log de la respuesta
			console.log('🔍 Respuesta de la API v2:', data);
			console.log('📊 Estructura de datos:', {
				hasResults: !!data.results,
				resultsLength: data.results?.length || 0,
				count: data.count,
				keys: Object.keys(data)
			});
			
			// Verificar si hay resultados
			if (!data.results || data.results.length === 0) {
				console.log('❌ No se encontraron resultados en la respuesta');
				
				// Mostrar notificación de advertencia
				notificationAPI.warning(
					'Sin resultados',
					'No se encontraron hoteles con los criterios de búsqueda. Intenta con otros filtros.',
					{
						duration: 8000
					}
				);
				
				searchResultsActions.setError('No se encontraron hoteles con los criterios de búsqueda');
				return;
			}
			
			// Actualizar resultados
			console.log('✅ Actualizando resultados:', data.results.length, 'hoteles encontrados');
			searchResultsActions.updateResults(data.results, data.count, data.count);
			
		} catch (error) {
			console.error('Error en la búsqueda:', error);
			const errorMessage = handleApiError(error as any, 'búsqueda de hoteles');

			// Mostrar notificación de error
			notificationAPI.error(
				'Error de búsqueda',
				errorMessage,
				{
					duration: 8000,
					actions: [
						{
							id: 'retry',
							label: 'Reintentar',
							action: () => searchHotels(params, filters),
							variant: 'primary'
						}
					]
				}
			);
			
			searchResultsActions.setError(errorMessage);
		}

		// Enviar status P2
		try {
			fetch(`${ENV_CONFIG.API_INTERNAL_URL}/api/bot/status`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${ENV_CONFIG.API_INTERNAL_KEY}`
				},
				body: JSON.stringify({ message: 'P2' })
			});
		} catch (error) {
			console.log('Error enviando status P2:', error);
		}
	}
	
	// Función para manejar cambios en filtros
	async function handleFilterChange() {
		if (!searchState.searchParams) return;
		
		console.log('🔄 Filtro cambiado, realizando nueva búsqueda...');
		searchResultsActions.setFiltering(true);
		
		try {
			await searchHotels(searchState.searchParams, searchState.filters);
		} finally {
			searchResultsActions.setFiltering(false);
		}
	}
	
	// Función para toggle de filtros móviles
	function toggleMobileFilters() {
		showMobileFilters = !showMobileFilters;
	}
	
	// Función para manejar cambios en ordenamiento
	async function handleSortChange() {
		if (!searchState.searchParams) return;
		
		console.log('🔄 Ordenamiento cambiado, realizando nueva búsqueda...');
		searchResultsActions.setFiltering(true);
		
		try {
			await searchHotels(searchState.searchParams, searchState.filters);
		} finally {
			searchResultsActions.setFiltering(false);
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
	<Hero showText={false} showDiscountBadge={false}>
		<SearchForm initialData={searchFormData} />
	</Hero>
</Header>

<!-- Contenido principal -->
<main class="min-h-screen max-w-[1100px] mx-auto mt-[100px] md:mt-[50px]">
	<div class="container mx-auto px-4 py-8">
		<!-- Título y ordenamiento -->
		<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
			<div class="mb-2">
				<h1 class="text-3xl font-bold text-gray-900">
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
		
			<!-- Select de ordenamiento -->
			<div class="relative">
				<span>Ordenar por:</span>
				<select 
					id="sort-select"
					bind:value={searchState.filters.sortBy}
					on:change={handleSortChange}
					class="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 pr-10 text-left hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-900 min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
				>
					<option value="popularity">Popularidad</option>
					<option value="price">Precio: menor a mayor</option>
					<option value="price_high_to_low">Precio: mayor a menor</option>
					<option value="review_score">Puntuación: mayor a menor</option>
					<option value="distance">Distancia del centro</option>
					<option value="name">Nombre: A-Z</option>
				</select>
				<!-- Icono de flecha -->
				<div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
					<svg 
						class="w-5 h-5 text-gray-500" 
						fill="none" 
						stroke="currentColor" 
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
					</svg>
				</div>
			</div>
		</div>
		
		<!-- Botón para mostrar/ocultar filtros en móvil -->
		<div class="lg:hidden mb-4">
			<button 
				on:click={toggleMobileFilters}
				class="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
			>
				<span class="font-medium text-gray-900">Filtros</span>
				<svg 
					class="w-5 h-5 text-gray-500 transform transition-transform duration-200 {showMobileFilters ? 'rotate-180' : ''}" 
					fill="none" 
					stroke="currentColor" 
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
				</svg>
			</button>
		</div>
		
		<!-- Panel de filtros móvil (solo visible en móvil) -->
		{#if showMobileFilters}
			<div class="lg:hidden mb-6">
				<FiltersPanel 
					filters={searchState.filters}
					destination={searchState.destination}
					totalCount={searchState.totalCount}
					primaryCount={searchState.primaryCount}
					onFilterChange={handleFilterChange}
					showMobileFilters={showMobileFilters}
					isFiltering={searchState.isFiltering}
				/>
			</div>
		{/if}
		
		<!-- Layout responsivo -->
		<div class="flex flex-col lg:flex-row gap-4 lg:gap-8">
			<!-- Panel lateral de filtros (solo visible en desktop) -->
			<div class="hidden lg:block lg:w-1/4">
				<div class="lg:sticky lg:top-8 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-scroll sidebar-scroll">
					<FiltersPanel 
						filters={searchState.filters}
						destination={searchState.destination}
						totalCount={searchState.totalCount}
						primaryCount={searchState.primaryCount}
						onFilterChange={handleFilterChange}
						showMobileFilters={showMobileFilters}
						isFiltering={searchState.isFiltering}
					/>
				</div>
			</div>
			
			<!-- Lista de hoteles -->
			<div class="lg:w-3/4 order-1 lg:order-2">
				{#if searchState.isLoading || searchState.isFiltering}
					<!-- Estado de carga con skeleton -->
					<div class="space-y-6">
						{#if searchState.isFiltering}
							<!-- Mostrar skeleton mientras se filtran los resultados existentes -->
							{#each Array(3) as _, i}
								<HotelCardSkeleton />
							{/each}
						{:else}
							<!-- Mostrar skeleton para búsqueda inicial -->
							{#each Array(6) as _, i}
								<HotelCardSkeleton />
							{/each}
						{/if}
					</div>
				{:else if searchState.error || searchState.hotels.length === 0}
					<!-- Estado de error o sin resultados -->
					<div class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
						<div class="text-gray-400 text-6xl mb-4">🔍</div>
						<h3 class="text-lg font-semibold text-gray-800 mb-2">
							{searchState.error ? 'Error en la búsqueda' : 'Sin resultados'}
						</h3>
						<p class="text-gray-600 mb-4">
							{searchState.error || 'No se encontraron hoteles con los criterios de búsqueda'}
						</p>
						<button 
							class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
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

<style>
	.sidebar-scroll {
		/* Ocultar scrollbar pero mantener funcionalidad */
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE y Edge */
	}
	
	.sidebar-scroll::-webkit-scrollbar {
		display: none; /* Chrome, Safari, Opera */
	}
</style>
