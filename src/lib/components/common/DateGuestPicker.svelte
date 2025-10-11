<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import DatePicker from './DatePicker.svelte';
	import { StorageService } from '$lib/services/storageService';
	
	// Dispatcher para eventos
	const dispatch = createEventDispatcher();
	
	// ===== PROPS =====
	export let initialData = {
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
	
	// ===== REFERENCIAS DOM =====
	let datePickerContainer;
	let guestPickerContainer;
	
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
	
	// ===== FUNCIONES DE FECHAS =====
	function formatDate(date) {
		return date.toISOString().split('T')[0];
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
	
	// ===== FUNCIONES DE UI =====
	function handleGuestSelectionDone() {
		saveGuestDataToStorage();
		showGuestPicker = false;
	}
	
	function saveGuestDataToStorage() {
		const guestData = { adults, children, rooms, pets };
		StorageService.saveGuestData(guestData, 'datePicker');
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
			const savedGuestData = StorageService.loadGuestData('datePicker');
			if (savedGuestData) {
				adults = savedGuestData.adults || 2;
				children = savedGuestData.children || 0;
				rooms = savedGuestData.rooms || 1;
				pets = savedGuestData.pets || false;
			}
		}
	}
	
	function updateFormData() {
		console.log('🔄 Actualizando datos del DateGuestPicker:', initialData);
		
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
		
		if (showDatePicker && !target.closest('.date-picker')) {
			showDatePicker = false;
		}
		if (showGuestPicker && !target.closest('.guest-picker')) {
			showGuestPicker = false;
		}
	}
	
	// ===== FUNCIONES DE ACCIÓN =====
	function handleApplyChanges() {
		// Emitir evento con los datos actualizados
		dispatch('dataChange', {
			checkInDate,
			checkOutDate,
			adults,
			children,
			rooms,
			pets
		});
		
		console.log('Aplicando cambios:', {
			checkInDate,
			checkOutDate,
			adults,
			children,
			rooms,
			pets
		});
	}
	
	// ===== EXPORTAR DATOS =====
	export function getFormData() {
		return {
			checkInDate,
			checkOutDate,
			adults,
			children,
			rooms,
			pets
		};
	}
	
	onMount(() => {
		initializeDates();
		loadGuestData();
		setupEventListeners();
		
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="bg-[#ffb700] rounded-xl p-1 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-1">
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
	
	<!-- Botón de aplicar cambios -->
	<button 
		type="button"
		class="px-4 py-1 bg-[#006ce4] rounded-lg flex flex-row items-center justify-center text-sm cursor-pointer hover:bg-[#005bb5] transition-colors duration-300 whitespace-nowrap"
		on:click={handleApplyChanges}
		aria-label="Aplicar cambios"
	>
		<p class="font-semibold text-white text-lg">Aplicar cambios</p>
	</button>
</div>

