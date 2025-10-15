<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { BOOKING_API_CONFIG, buildSearchUrl, getDestinationTypeConfig } from '$lib/config/api';
	import DatePicker from './DatePicker.svelte';
	import { notificationAPI } from '$lib/stores/notifications';
	import { StorageService } from '$lib/services/storageService';
	import { validateDateRange, formatISODateOnly } from '$lib/utils/dateValidation';
	
	// ===== PROPS =====
	export let initialData = {
		destination: null,
		checkInDate: '',
		checkOutDate: '',
		adults: 2,
		children: 0,
		rooms: 1,
		pets: false
	};
	
	// ===== REACTIVIDAD PARA DATOS INICIALES =====
	$: if (initialData) {
		updateFormData();
	}
	
	// ===== CONFIGURACIÓN =====
	const { SEARCH_CONFIG } = BOOKING_API_CONFIG;
	
	// ===== REFERENCIAS DOM =====
	let input;
	let dropdown;
	
	// ===== ESTADO DE BÚSQUEDA =====
	let query = '';
	let results = [];
	let isLoading = false;
	let showDropdown = false;
	let debounceTimer = null;
	let userHasTyped = false; // Rastrea si el usuario ha modificado el campo
	
	// ===== ESTADO DE FECHAS =====
	let checkInDate = '';
	let checkOutDate = '';
	let showDatePicker = false;
	
	// ===== ESTADO DE HUÉSPEDES =====
	let adults = 2;
	let children = 0;
	let rooms = 1;
	let pets = false;
	let showGuestPicker = false;
	let guestText = '';
	
	// ===== REACTIVIDAD =====
	$: {
		guestText = getGuestText();
		console.log('guestText updated:', { adults, children, rooms, pets, guestText });
	}
	
	// ===== FUNCIONES DE BÚSQUEDA =====
	function handleInput(event) {
		const target = event.target;
		query = target.value;
		userHasTyped = true; // Marcar que el usuario ha escrito
		
		// Limpiar destino guardado cuando el usuario escribe algo nuevo
		StorageService.clearDestination();
		
		clearDebounceTimer();
		
		if (!query.trim() || query.trim().length <= 1) {
			showDropdown = false;
			results = [];
			return;
		}
		
		debounceTimer = setTimeout(() => {
			searchDestinations(query.trim());
		}, SEARCH_CONFIG.debounceDelay);
	}
	
	function clearDebounceTimer() {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
	}
	
	async function searchDestinations(searchQuery) {
		if (isLoading) return;
		
		isLoading = true;
		showDropdown = true;
		
		try {
			const response = await fetch(buildSearchUrl(searchQuery), {
				method: 'GET',
				headers: BOOKING_API_CONFIG.HEADERS
			});
			
			if (!response.ok) {
				throw new Error(getErrorMessage(response.status));
			}
			
			const data = await response.json();
			results = data
				.filter(destination => 
					destination.dest_type === 'city' || destination.dest_type === 'hotel'
				)
				.slice(0, SEARCH_CONFIG.maxResults);
			
		} catch (error) {
			console.error('Error buscando destinos:', error);
			const errorMsg = error instanceof Error ? error.message : 'Error desconocido al buscar destinos';
			
			// Mostrar notificación de error
			notificationAPI.error(
				'Error de búsqueda',
				errorMsg,
				{
					duration: 6000,
					actions: [
						{
							id: 'retry',
							label: 'Reintentar',
							action: () => searchDestinations(searchQuery),
							variant: 'primary'
						}
					]
				}
			);
			
			results = [];
		} finally {
			isLoading = false;
		}
	}
	
	function getErrorMessage(status) {
		switch (status) {
			case 429:
				return 'Demasiadas solicitudes. Intenta de nuevo en unos momentos.';
			case 401:
				return 'Error de autenticación. Verifica la configuración de la API.';
			default:
				return `Error del servidor: ${status}`;
		}
	}
	
	function selectDestination(destination) {
		query = destination.name;
		showDropdown = false;
		results = [];
		userHasTyped = false; // Resetear porque el usuario seleccionó específicamente
		
		saveDestinationToStorage(destination);
	}
	
	function saveDestinationToStorage(destination) {
		StorageService.saveDestination(destination);
	}
	
	function closeDropdown() {
		showDropdown = false;
	}
	
	// ===== FUNCIONES DE FECHAS =====
	function formatDate(date) {
		return formatISODateOnly(date);
	}
	
	function formatDateForDisplay(dateString) {
		// Parsear fecha en zona horaria local para evitar desplazamientos
		const [year, month, day] = dateString.split('-').map(Number);
		const date = new Date(year, month - 1, day);
		
		// Formato: sáb, 8 nov
		const dayOfWeek = date.toLocaleDateString('es-ES', { weekday: 'short' });
		const dayOfMonth = date.getDate();
		const monthShort = date.toLocaleDateString('es-ES', { month: 'short' });
		
		const formatted = `${dayOfWeek}, ${dayOfMonth} ${monthShort}`;
		console.log('Formatting date for display:', { dateString, formatted });
		return formatted;
	}
	
	function getTodayDate() {
		return formatDate(new Date());
	}
	
	function getTomorrowDate() {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return formatDate(tomorrow);
	}
	
	function handleDateChange(type, value) {
		if (type === 'checkin') {
			checkInDate = value;
			adjustCheckOutDate();
		} else {
			checkOutDate = value;
		}
		showDatePicker = false;
	}
	
	function adjustCheckOutDate() {
		if (checkOutDate && checkOutDate <= checkInDate) {
			const nextDay = new Date(checkInDate);
			nextDay.setDate(nextDay.getDate() + 1);
			checkOutDate = formatDate(nextDay);
		}
	}
	
	function handleCheckInChange(event) {
		handleDateChange('checkin', event.target.value);
	}
	
	function handleCheckOutChange(event) {
		handleDateChange('checkout', event.target.value);
	}
	
	// ===== FUNCIONES DEL DATEPICKER =====
	function handleDatePickerChange(event) {
		checkInDate = event.detail.checkIn;
		checkOutDate = event.detail.checkOut;
		showDatePicker = false;
	}
	
	function closeDatePicker() {
		showDatePicker = false;
	}
	
	// ===== FUNCIONES DE HUÉSPEDES =====
	function updateGuests(type, delta) {
		console.log('updateGuests called:', { type, delta, adults, children, rooms, pets });
		if (type === 'adults') {
			adults = Math.max(1, adults + delta);
		} else if (type === 'children') {
			children = Math.max(0, children + delta);
		} else if (type === 'rooms') {
			rooms = Math.max(1, rooms + delta);
		}
		console.log('After update:', { adults, children, rooms, pets });
	}
	
	function getGuestText() {
		const guestText = adults > 1 ? 'adultos' : 'adulto';
		const childText = children > 1 ? 'niños' : 'niño';
		const roomText = rooms > 1 ? 'habitaciones' : 'habitación';
		
		let text = children > 0 
			? `${adults} ${guestText} - ${children} ${childText} - ${rooms} ${roomText}`
			: `${adults} ${guestText} - ${rooms} ${roomText}`;
		
		if (pets) {
			text += ' - Con mascotas';
		}
		
		return text;
	}
	
	// ===== FUNCIONES DE VALIDACIÓN =====
	function validateForm() {
		console.log('🔍 Validando formulario:', { query, checkInDate, checkOutDate, adults, children, rooms });
		
		if (!query.trim()) {
			notificationAPI.error('Formulario incompleto', 'Por favor selecciona un destino', { duration: 5000 });
			return false;
		}
		if (!checkInDate || !checkOutDate) {
			notificationAPI.error('Formulario incompleto', 'Selecciona fechas de entrada y salida', { duration: 5000 });
			return false;
		}
		const validation = validateDateRange(checkInDate, checkOutDate, { minNights: 1, maxNights: 30, allowPastCheckIn: false, maxAdvanceMonths: 18 });
		if (!validation.ok) {
			notificationAPI.error('Fechas inválidas', validation.error || 'Revisa las fechas seleccionadas', { duration: 6000 });
			return false;
		}
		console.log('✅ Formulario válido');
		return true;
	}
	
	// ===== FUNCIONES DE BÚSQUEDA =====
	async function handleSearch() {
		if (!validateForm()) return;
		
		let selectedDestination = null;
		
		// Si el usuario ha escrito algo, hacer búsqueda automática
		if (userHasTyped) {
			console.log('🔍 Usuario ha escrito, realizando búsqueda automática para:', query.trim());
			selectedDestination = await performAutoSearch(query.trim());
			
			if (!selectedDestination) {
				notificationAPI.error(
					'Destino no encontrado',
					'No se encontraron destinos para tu búsqueda. Intenta con otro término.',
					{ duration: 6000 }
				);
				return;
			}
		} else if (initialData.destination) {
			// Solo usar destino de initialData si el usuario no ha escrito nada
			selectedDestination = initialData.destination;
			console.log('📍 Usando destino de initialData:', selectedDestination);
		} else {
			// Fallback: hacer búsqueda automática
			console.log('🔍 Fallback: realizando búsqueda automática para:', query.trim());
			selectedDestination = await performAutoSearch(query.trim());
			
			if (!selectedDestination) {
				notificationAPI.error(
					'Destino no encontrado',
					'No se encontraron destinos para tu búsqueda. Intenta con otro término.',
					{ duration: 6000 }
				);
				return;
			}
		}
		
		// Determinar el tipo de destino y redirigir apropiadamente
		console.log('🎯 Destino seleccionado:', selectedDestination);
		
		if (selectedDestination.dest_type === 'hotel') {
			// Si es un hotel, ir a detalles del hotel
			console.log('🏨 Destino es un hotel, redirigiendo a detalles...');
			const urlParams = new URLSearchParams({
				checkin_date: checkInDate,
				checkout_date: checkOutDate,
				adults_number: adults.toString(),
				children_number: children.toString(),
				room_number: rooms.toString()
			});
			
			const url = `/hotel/${selectedDestination.dest_id}?${urlParams.toString()}`;
			console.log('🔗 URL de detalles:', url);
			window.location.href = url;
		} else {
			// Si es una ciudad, landmark u otro tipo, ir a resultados de búsqueda
			console.log(`🏙️ Destino es ${selectedDestination.dest_type}, redirigiendo a resultados...`);
			const urlParams = new URLSearchParams({
				dest_id: selectedDestination.dest_id,
				destination_name: selectedDestination.name,
				checkin_date: checkInDate,
				checkout_date: checkOutDate,
				adults_number: adults.toString(),
				children_number: children.toString(),
				room_number: rooms.toString()
			});
			
			const url = `/resultados?${urlParams.toString()}`;
			console.log('🔗 URL de resultados:', url);
			window.location.href = url;
		}
	}
	
	// Función para realizar búsqueda automática
	async function performAutoSearch(searchQuery: string) {
		if (!searchQuery.trim()) return null;
		
		try {
			console.log('🔍 Realizando búsqueda automática para:', searchQuery);
			
			const response = await fetch(buildSearchUrl(searchQuery), {
				method: 'GET',
				headers: BOOKING_API_CONFIG.HEADERS
			});
			
			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}
			
			const data = await response.json();
			const filteredResults = data.filter(destination => 
				destination.dest_type === 'city' || destination.dest_type === 'hotel'
			);
			
			if (filteredResults.length === 0) {
				console.log('❌ No se encontraron resultados');
				return null;
			}
			
			// Seleccionar el primer resultado
			const selectedDestination = filteredResults[0];
			console.log('✅ Destino seleccionado automáticamente:', selectedDestination);
			
			// Guardar en localStorage para futuras búsquedas
			saveDestinationToStorage(selectedDestination);
			
			return selectedDestination;
			
		} catch (error) {
			console.error('Error en búsqueda automática:', error);
			return null;
		}
	}
	
	// ===== FUNCIONES DE UI =====
	function handleGuestSelectionDone() {
		saveGuestDataToStorage();
		showGuestPicker = false;
	}
	
	function saveGuestDataToStorage() {
		const guestData = { adults, children, rooms, pets };
		StorageService.saveGuestData(guestData, 'searchForm');
	}
	
	// ===== FUNCIONES DE INICIALIZACIÓN =====
	function initializeDates() {
		if (initialData.checkInDate && initialData.checkOutDate) {
			checkInDate = initialData.checkInDate;
			checkOutDate = initialData.checkOutDate;
		} else {
			checkInDate = getTodayDate();
			checkOutDate = getTomorrowDate();
		}
	}
	
	function loadGuestData() {
		// Si hay datos iniciales, usarlos
		if (initialData.adults || initialData.children || initialData.rooms || initialData.pets !== undefined) {
			adults = initialData.adults || 2;
			children = initialData.children || 0;
			rooms = initialData.rooms || 1;
			pets = initialData.pets || false;
		} else {
			// Si no hay datos iniciales, cargar del localStorage usando el servicio
			const savedGuestData = StorageService.loadGuestData('searchForm');
			if (savedGuestData) {
				adults = savedGuestData.adults || 2;
				children = savedGuestData.children || 0;
				rooms = savedGuestData.rooms || 1;
				pets = savedGuestData.pets || false;
			}
		}
	}
	
	function loadDestinationData() {
		if (initialData.destination) {
			query = initialData.destination.name;
			saveDestinationToStorage(initialData.destination);
		}
	}
	
	function updateFormData() {
		console.log('🔄 Actualizando datos del SearchForm:', initialData);
		
		// Actualizar destino
		if (initialData.destination) {
			query = initialData.destination.name;
			saveDestinationToStorage(initialData.destination);
			console.log('📍 Destino actualizado:', initialData.destination.name);
		}
		
		// Actualizar fechas
		if (initialData.checkInDate && initialData.checkOutDate) {
			checkInDate = initialData.checkInDate;
			checkOutDate = initialData.checkOutDate;
			console.log('📅 Fechas actualizadas:', checkInDate, '→', checkOutDate);
		}
		
		// Actualizar huéspedes
		if (initialData.adults !== undefined) adults = initialData.adults;
		if (initialData.children !== undefined) children = initialData.children;
		if (initialData.rooms !== undefined) rooms = initialData.rooms;
		if (initialData.pets !== undefined) pets = initialData.pets;
		
		console.log('👥 Huéspedes actualizados:', { adults, children, rooms, pets });
		
		// Guardar datos de huéspedes en localStorage también
		saveGuestDataToStorage();
	}
	
	function setupEventListeners() {
		document.addEventListener('click', handleClickOutside);
	}
	
	// ===== FUNCIONES DE EVENTOS =====
	function handleClickOutside(event) {
		const target = event.target;
		
		if (dropdown && !dropdown.contains(target) && !input?.contains(target)) {
			closeDropdown();
		}
		if (showDatePicker && !target.closest('.date-picker')) {
			showDatePicker = false;
		}
		if (showGuestPicker && !target.closest('.guest-picker')) {
			showGuestPicker = false;
		}
	}
	
	onMount(() => {
		initializeDates();
		loadGuestData();
		loadDestinationData();
		setupEventListeners();
		
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<!-- Mensajes de error ahora se manejan a través del sistema de notificaciones centralizado -->

<div class="bg-[#ffb700] rounded-xl p-1 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-1 absolute bottom-0 transform translate-y-1/2 left-0 right-0 mx-3">
	<!-- Campo de destino con autocompletado -->
	<div class="px-3 py-1 bg-white rounded-lg flex flex-row items-center gap-0 text-sm relative">
		<img src="/assets/search/alojamiento_icon.png" class="w-[25px]" alt="Destino"/>
		<div class="w-full relative">
			<input 
				bind:this={input}
				bind:value={query}
				on:input={handleInput}
				type="text" 
				placeholder="¿A dónde vas?" 
				class="w-full p-3 rounded-md focus:outline-none" 
				autocomplete="off"
				aria-label="Destino de viaje"
			/>
		</div>
		<!-- Dropdown de resultados -->
		{#if showDropdown}
			<div bind:this={dropdown} class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-[99999] max-h-80 overflow-y-auto overflow-x-hidden mt-1 w-full dropdown">
				{#if isLoading}
					<div class="p-3 text-center text-gray-500">
						<div class="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#003b95] mx-auto mb-2"></div>
						Buscando destinos...
					</div>
				{:else if results.length === 0 && query.trim().length > 1}
					<div class="p-3 text-center text-gray-500">
						No se encontraron destinos
					</div>
				{:else}
					{#each results as destination (destination.dest_id)}
						<button 
							class="destination-item w-full text-left p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 group transition-all duration-150 ease-in-out" 
							on:click={() => selectDestination(destination)}
							aria-label="Seleccionar {destination.name}"
						>
							<div class="flex items-center gap-4">
								<div class="flex-shrink-0 w-8 h-8 flex items-center justify-center">
									<img 
										src={destination.dest_type === 'city' 
											? '/assets/search/ubicacion_icon.png' 
											: '/assets/search/alojamiento_icon.png'} 
										class={destination.dest_type === 'city' ? 'h-6' : 'w-6'} 
										alt="Destino"
									/>
								</div>
								<div class="flex-1 min-w-0">
									<div class="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-150">
										{destination.name}
									</div>
									<div class="text-sm text-gray-500 truncate mt-0.5">
										{#if destination.dest_type === 'city' && destination.hotels}
											{destination.country} • {destination.hotels} hoteles
										{:else if destination.dest_type === 'hotel'}
											{destination.city_name}, {destination.country}
										{:else}
											{destination.country}
										{/if}
									</div>
								</div>
							</div>
						</button>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
	
	<!-- Campo de fechas -->
	<div class="px-3 py-1 bg-white rounded-lg flex flex-row items-center gap-0 text-sm relative date-picker">
		<img src="/assets/search/fecha_icon.png" class="w-[25px]" alt="Fechas"/>
		<button 
			type="button"
			class="w-full p-3 rounded-md focus:outline-none text-left"
			on:click={() => showDatePicker = !showDatePicker}
			aria-label="Seleccionar fechas"
		>
			{#if checkInDate && checkOutDate}
				{formatDateForDisplay(checkInDate)} - {formatDateForDisplay(checkOutDate)}
			{:else}
				Fecha de entrada - Fecha de salida
			{/if}
		</button>
		
		<DatePicker 
			{checkInDate}
			{checkOutDate}
			isOpen={showDatePicker}
			minDate={new Date()}
			on:dateChange={handleDatePickerChange}
			on:close={closeDatePicker}
		/>
	</div>
	
	<!-- Campo de huéspedes -->
	<div class="px-3 py-1 bg-white rounded-lg flex flex-row items-center gap-0 text-sm relative guest-picker">
		<img src="/assets/search/huesped_icon.png" class="w-[25px]" alt="Huéspedes"/>
		<button 
			type="button"
			class="w-full p-3 rounded-md focus:outline-none text-left text-nowrap overflow-hidden"
			on:click={() => showGuestPicker = !showGuestPicker}
			aria-label="Seleccionar huéspedes"
		>
			{guestText}
		</button>
		
		{#if showGuestPicker}
			<div class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-[99999] p-4 mt-1">
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<div class="font-medium text-gray-900">Adultos</div>
							<div class="text-sm text-gray-500">Mayores de 18 años</div>
						</div>
						<div class="flex items-center gap-3">
							<button 
								type="button"
								on:click={() => updateGuests('adults', -1)}
								disabled={adults <= 1}
								class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
							>-</button>
							<span class="w-8 text-center">{adults}</span>
							<button 
								type="button"
								on:click={() => updateGuests('adults', 1)}
								class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
							>+</button>
						</div>
					</div>
					
					<div class="flex items-center justify-between">
						<div>
							<div class="font-medium text-gray-900">Niños</div>
							<div class="text-sm text-gray-500">De 0 a 17 años</div>
						</div>
						<div class="flex items-center gap-3">
							<button 
								type="button"
								on:click={() => updateGuests('children', -1)}
								disabled={children <= 0}
								class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
							>-</button>
							<span class="w-8 text-center">{children}</span>
							<button 
								type="button"
								on:click={() => updateGuests('children', 1)}
								class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
							>+</button>
						</div>
					</div>
					
					<div class="flex items-center justify-between">
						<div>
							<div class="font-medium text-gray-900">Habitaciones</div>
						</div>
						<div class="flex items-center gap-3">
							<button 
								type="button"
								on:click={() => updateGuests('rooms', -1)}
								disabled={rooms <= 1}
								class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
							>-</button>
							<span class="w-8 text-center">{rooms}</span>
							<button 
								type="button"
								on:click={() => updateGuests('rooms', 1)}
								class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
							>+</button>
						</div>
					</div>
					
					<!-- Separador -->
					<hr class="border-gray-200 my-4" />
					
					<!-- Switch de mascotas -->
					<div class="flex items-center justify-between flex-col gap-4">
						<div class="w-full flex flex-row items-center justify-between">
							<div class="font-medium text-gray-900">¿Viajas con mascotas?</div>
							<label class="relative inline-flex items-center cursor-pointer">
								<input 
									type="checkbox" 
									bind:checked={pets}
									class="sr-only peer"
								/>
								<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
							</label>
						</div>
						<div class="text-xs text-gray-500 mt-1">
							Los animales de servicio no se consideran mascotas. 
							<button type="button" class="text-blue-600 hover:underline">Más info sobre viajar con animales de servicio.</button>
						</div>
					</div>
					
					<!-- Botón Listo -->
					<div class="pt-4">
						<button 
							type="button"
							on:click={handleGuestSelectionDone}
							class="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
						>
							Listo
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
	
	<!-- Botón de búsqueda -->
	<button 
		type="button"
		class="px-4 py-1 bg-[#006ce4] rounded-lg flex flex-row items-center justify-center text-sm cursor-pointer hover:bg-[#005bb5] transition-colors duration-300 whitespace-nowrap"
		on:click={handleSearch}
		aria-label="Buscar alojamientos"
	>
		<p class="font-semibold text-white text-lg">Buscar</p>
	</button>
</div>

<style>
	/* Estilos del dropdown */
	.destination-item {
		transition: all 0.15s ease-in-out;
	}
	
	.destination-item:hover {
		background-color: #f8fafc;
		transform: translateX(2px);
	}
	
	.destination-item:last-child {
		border-bottom: none;
	}
	
	/* Animación de carga */
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	
	.animate-spin {
		animation: spin 1s linear infinite;
	}
	
	/* Estilos del dropdown */
	.dropdown {
		backdrop-filter: blur(10px);
		border: 1px solid rgba(229, 231, 235, 0.8);
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}
	
	/* Scrollbar personalizado */
	.dropdown::-webkit-scrollbar {
		width: 6px;
	}
	
	.dropdown::-webkit-scrollbar-track {
		background: #f1f5f9;
		border-radius: 3px;
	}
	
	.dropdown::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 3px;
	}
	
	.dropdown::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}
</style>
