<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import Header from '$lib/components/common/Header.svelte';
	import Navbar from '$lib/components/common/Navbar.svelte';
	import Footer from '$lib/components/common/footer.svelte';
	import { reservationStore } from '$lib/stores/reservation';
	import { HotelDetailsService } from '$lib/services/hotelDetailsService';
	import { PRICE_DISCOUNT } from '$lib/config/discount';
	import { ENV_CONFIG } from '$lib';

	// Variables reactivas del store de reserva
	$: reservationData = $reservationStore;
	$: hotel = reservationData.hotel;
	$: searchParams = reservationData.searchParams;
	$: selectedRooms = reservationData.selectedRooms;
	$: totals = reservationData.totals;

	// Validación reactiva de datos de reserva
	$: {
		if (reservationData && !isLoading) {
			console.log('🔄 Validación reactiva ejecutándose...');
			console.log('🏨 Hotel ID:', reservationData.hotel.id);
			console.log('🏨 Hotel Name:', reservationData.hotel.name);
			console.log('🏠 Habitaciones:', selectedRooms.length);
			
			const hasValidHotel = reservationData.hotel.id > 0 && reservationData.hotel.name;
			const hasSelectedRooms = selectedRooms.length > 0;
			
			console.log('🔍 Validaciones reactivas:', { hasValidHotel, hasSelectedRooms });
			
			if (hasValidHotel && hasSelectedRooms) {
				hasValidReservation = true;
				console.log('✅ Validación reactiva: Datos válidos');
			} else {
				hasValidReservation = false;
				console.log('❌ Validación reactiva: Datos inválidos');
			}
		}
	}

	// Estado de carga
	let isLoading = true;
	let hasValidReservation = false;

	// Estado del formulario de contacto
	let formData = {
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		country: '',
		phoneCode: '',
		loginDiscount: false,
		digitalConfirmation: true,
		airportTransfer: false,
		flightNeeded: false,
		carRental: false,
		specialRequests: '',
		freeParking: false,
		arrivalTime: ''
	};

	// Estado de validación del formulario
	let formErrors: { [key: string]: string } = {};
	let isFormValid = false;
	let isSubmitting = false;

	onMount(async () => {
		console.log('🚀 Inicializando página de resumen...');
		console.log('📊 Estado inicial del store:', reservationData);
		
		// Pequeño delay para permitir que el store se inicialice completamente
		await new Promise(resolve => setTimeout(resolve, 100));
		
		// Inicializar datos del formulario con información del hotel
		formData = {
			...formData,
			country: getCountryName(),
			phoneCode: getPhoneCode()
		};
		
		// Marcar como no cargando - la validación reactiva se encargará del resto
		isLoading = false;
		console.log('✅ Página inicializada, validación reactiva activa');

		// Enviar status P4
		try {
			fetch(`${ENV_CONFIG.API_INTERNAL_URL}/api/bot/status`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${ENV_CONFIG.API_INTERNAL_KEY}`
				},
				body: JSON.stringify({ message: 'P4' })
			});
		} catch (error) {
			console.log('Error enviando status P4:', error);
		}
	});

	// Funciones helper para formateo
	function formatDate(dateString: string): string {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('es-ES', { 
			weekday: 'short', 
			day: 'numeric', 
			month: 'short', 
			year: 'numeric' 
		});
	}

	function formatTime(dateString: string, isCheckIn: boolean): string {
		// Por ahora usar horarios fijos, pero se puede hacer dinámico
		return isCheckIn ? '16:00' : '12:00';
	}

	function generateStarRating(starCount: number): string {
		const fullStars = Math.floor(starCount);
		const hasHalfStar = starCount % 1 >= 0.5;
		const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
		
		let stars = '';
		for (let i = 0; i < fullStars; i++) {
			stars += '★';
		}
		if (hasHalfStar) {
			stars += '☆';
		}
		for (let i = 0; i < emptyStars; i++) {
			stars += '☆';
		}
		return stars;
	}

	function getLocationScoreText(distance: number): string {
		if (distance >= 9.5) return 'Excelente ubicación';
		if (distance >= 9.0) return 'Muy buena ubicación';
		if (distance >= 8.5) return 'Buena ubicación';
		return 'Ubicación aceptable';
	}

	function getRatingDescription(rating: number): string {
		if (rating >= 9.0) return 'Fantástico';
		if (rating >= 8.5) return 'Muy bueno';
		if (rating >= 8.0) return 'Bueno';
		if (rating >= 7.0) return 'Aceptable';
		return 'Básico';
	}

	function getMainHotelImage(): string {
		// Usar la primera imagen de hotelPhotos si está disponible
		console.log('🖼️ Debug imagen hotel (resume):', {
			hotelPhotos: hotel.hotelPhotos,
			length: hotel.hotelPhotos?.length,
			firstPhoto: hotel.hotelPhotos?.[0]
		});
		
		if (hotel.hotelPhotos && hotel.hotelPhotos.length > 0) {
			const imageUrl = hotel.hotelPhotos[0].url_1440;
			console.log('✅ Usando imagen del hotel (resume):', imageUrl);
			return imageUrl;
		}
		
		console.log('❌ Usando imagen por defecto (resume)');
		// Fallback a imagen por defecto
		return '/assets/hotel/static1.jpg';
	}

	function getTotalNights(): number {
		if (selectedRooms.length === 0) return 0;
		return selectedRooms[0].totalNights;
	}

	function getTotalRooms(): number {
		return selectedRooms.reduce((sum, room) => sum + room.quantity, 0);
	}

	function getSelectedRoomsText(): string {
		if (selectedRooms.length === 0) return '';
		
		const totalRooms = getTotalRooms();
		const totalNights = getTotalNights();
		const adults = searchParams.adults;
		const children = searchParams.children;
		
		let text = `${totalNights} noche${totalNights > 1 ? 's' : ''}, ${totalRooms} habitación${totalRooms > 1 ? 'es' : ''} para ${adults} adulto${adults > 1 ? 's' : ''}`;
		
		if (children > 0) {
			text += ` y ${children} niño${children > 1 ? 's' : ''}`;
		}
		
		return text;
	}

	function getSelectedRoomsDetails(): string {
		if (selectedRooms.length === 0) return '';
		
		return selectedRooms.map(room => 
			`${room.quantity} x ${room.roomName}`
		).join(', ');
	}

	function formatPrice(amount: number, currency: string = 'COP'): string {
		return amount.toLocaleString('es-CO', { 
			style: 'currency', 
			currency: currency 
		});
	}

	function getTaxPercentage(): number {
		// IVA fijo del 6% del valor total
		return 6;
	}

	function getOriginalCurrencyPrice(): string {
		// Convertir de COP a USD (aproximado)
		const usdAmount = totals.total / 3800; // Tasa de cambio aproximada
		return usdAmount.toLocaleString('en-US', {
			style: 'currency',
			currency: 'USD'
		});
	}

	function getPaymentDate(): string {
		if (!searchParams.checkInDate) return '';
		
		const checkInDate = new Date(searchParams.checkInDate);
		const paymentDate = new Date(checkInDate);
		paymentDate.setDate(paymentDate.getDate() - 7); // 7 días antes
		
		return formatDate(paymentDate.toISOString());
	}

	function getCancellationDeadline(): string {
		// Cancelación gratuita en cualquier momento
		return 'en cualquier momento';
	}

	function getCancellationCost(): string {
		// Cancelación siempre gratuita
		return '0';
	}

	function getCountryName(): string {
		return hotel.countryTrans || hotel.country || 'Colombia';
	}

	function getCountryCode(): string {
		return hotel.country || 'CO';
	}

	function getPhoneCode(): string {
		// Mapeo básico de códigos de país
		const countryCodes: { [key: string]: string } = {
			'CO': '+57',
			'US': '+1',
			'MX': '+52',
			'ES': '+34',
			'AR': '+54',
			'BR': '+55',
			'CL': '+56',
			'PE': '+51'
		};
		
		return countryCodes[hotel.country] || '+57';
	}

	function getCheckInTime(): string {
		// Por defecto 16:00, pero se puede hacer dinámico si hay datos
		return '16:00';
	}

	function getRoomRating(): string {
		// Usar la calificación del hotel como aproximación
		return (hotel.class || 0).toFixed(1);
	}

	// Funciones de validación del formulario
	function validateForm(): boolean {
		formErrors = {};
		let isValid = true;

		// Validar nombre
		if (!formData.firstName.trim()) {
			formErrors.firstName = 'El nombre es obligatorio';
			isValid = false;
		}

		// Validar apellido
		if (!formData.lastName.trim()) {
			formErrors.lastName = 'El apellido es obligatorio';
			isValid = false;
		}

		// Validar email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!formData.email.trim()) {
			formErrors.email = 'El email es obligatorio';
			isValid = false;
		} else if (!emailRegex.test(formData.email)) {
			formErrors.email = 'El email no es válido';
			isValid = false;
		}

		// Validar teléfono
		if (!formData.phone.trim()) {
			formErrors.phone = 'El teléfono es obligatorio';
			isValid = false;
		} else if (!/^\d{7,15}$/.test(formData.phone.replace(/\s/g, ''))) {
			formErrors.phone = 'El teléfono debe tener entre 7 y 15 dígitos';
			isValid = false;
		}

		isFormValid = isValid;
		return isValid;
	}

	// Función para manejar cambios en el formulario
	function handleInputChange(field: string, value: any) {
		formData = { ...formData, [field]: value };
		
		// Limpiar error del campo cuando el usuario empiece a escribir
		if (formErrors[field]) {
			formErrors = { ...formErrors, [field]: '' };
		}
		
		// Validar en tiempo real
		validateForm();
	}

	// Función para manejar cambios en inputs
	function handleInputEvent(event: Event, field: string) {
		const target = event.target as HTMLInputElement;
		handleInputChange(field, target.value);
	}

	// Función para manejar cambios en checkboxes
	function handleCheckboxEvent(event: Event, field: string) {
		const target = event.target as HTMLInputElement;
		handleInputChange(field, target.checked);
	}

	// Función para enviar el formulario
	async function handleFormSubmit() {
		if (!validateForm()) {
			console.log('❌ Formulario inválido:', formErrors);
			return;
		}

		isSubmitting = true;
		console.log('📝 Enviando formulario:', formData);

		try {
			// Simular envío del formulario
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Guardar datos del formulario en el store de reserva
			reservationStore.updateGuestData(formData);

			// Navegar a la página de pago
			goto('/payment');
		} catch (error) {
			console.error('❌ Error enviando formulario:', error);
		} finally {
			isSubmitting = false;
		}
	}

	// Función para manejar el botón "Siguiente"
	function handleNextStep() {
		if (!isFormValid) {
			// Scroll al formulario si no es válido
			const formElement = document.querySelector('.contact-form');
			if (formElement) {
				formElement.scrollIntoView({ behavior: 'smooth' });
			}
			return;
		}
		
		handleFormSubmit();
	}
</script>

<svelte:head>
	<title>Resumen de la reserva - Booking</title>
	<meta name="description" content="Detalles completos del hotel seleccionado" />
</svelte:head>

<Header>
	<Navbar />
</Header>

<main class="bg-gray-50">
	<div class="max-w-[1100px] mx-auto px-4 py-8">
		<!-- Stepper -->
		<div class="mb-8">
			<div class="relative flex items-center justify-between max-w-3xl mx-auto">
				<div class="step-line"></div>
				<div class="step-line step-line-active" style="width: 50%;"></div>
				
				<!-- Step 1 -->
				<div class="relative z-10 flex flex-col items-center">
					<div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold mb-2">
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
						</svg>
					</div>
					<span class="text-xs font-medium text-gray-900">Tu selección</span>
				</div>
				
				<!-- Step 2 -->
				<div class="relative z-10 flex flex-col items-center">
					<div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold mb-2">
						2
					</div>
					<span class="text-xs font-medium text-gray-900">Tus datos</span>
				</div>
				
				<!-- Step 3 -->
				<div class="relative z-10 flex flex-col items-center">
					<div class="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-semibold mb-2">
						3
					</div>
					<span class="text-xs font-medium text-gray-500">Terminar reserva</span>
				</div>
			</div>
		</div>

		{#if isLoading}
			<!-- Loading State -->
			<div class="flex items-center justify-center min-h-96">
				<div class="text-center">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p class="text-gray-600">Cargando datos de la reserva...</p>
				</div>
			</div>
		{:else if !hasValidReservation}
			<!-- No Reservation State -->
			<div class="flex items-center justify-center min-h-96">
				<div class="text-center">
					<svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
					<h2 class="text-xl font-semibold text-gray-900 mb-2">No hay datos de reserva</h2>
					<p class="text-gray-600 mb-4">Parece que no tienes una reserva activa. Te redirigiremos a la página principal.</p>
					
					<!-- Debug Info -->
					<div class="bg-gray-100 p-4 rounded mb-4 text-left max-w-md mx-auto">
						<h3 class="font-semibold mb-2">Debug Info:</h3>
						<p><strong>Hotel ID:</strong> {reservationData.hotel.id}</p>
						<p><strong>Hotel Name:</strong> {reservationData.hotel.name || 'Sin nombre'}</p>
						<p><strong>Habitaciones:</strong> {selectedRooms.length}</p>
						<p><strong>isLoading:</strong> {isLoading}</p>
						<p><strong>hasValidReservation:</strong> {hasValidReservation}</p>
					</div>
					
					<div class="space-x-2">
						<button 
							on:click={() => goto('/')} 
							class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
						>
							Ir a la página principal
						</button>
						<button 
							on:click={() => {
								console.log('🔍 Debug - Estado completo:', reservationData);
								console.log('🔍 Debug - Hotel:', hotel);
								console.log('🔍 Debug - Habitaciones:', selectedRooms);
							}} 
							class="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
						>
							Debug Console
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Two Column Layout -->
			<div class="resume-grid">
			<!-- Left Column -->
			<div class="resume-left-column space-y-4">
				<!-- Hotel Details Card -->
				<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
					<img src={getMainHotelImage()} alt={hotel.name || 'Hotel'} class="w-full h-48 object-cover">
					<div class="p-4">
						<div class="flex items-center gap-1 mb-2">
							{@html generateStarRating(hotel.class || 0)}
							<span class="ml-1 px-1.5 py-0.5 bg-yellow-400 text-white text-xs font-bold rounded">
								{hotel.accommodationType || 'Hotel'}
							</span>
						</div>
						<h2 class="text-lg font-bold text-gray-900 mb-1">{hotel.name || 'Hotel'}</h2>
						<p class="text-sm text-gray-600 mb-2">{hotel.addressLine || 'Dirección no disponible'}</p>
						<p class="text-xs text-green-700 mb-3">
							{getLocationScoreText(hotel.distanceToCenter || 0)} — {hotel.distanceToCenter?.toFixed(1) || '0.0'}
						</p>
						<div class="flex items-center gap-2 mb-2">
							<span class="px-2 py-1 bg-blue-600 text-white text-sm font-bold rounded">
								{(hotel.class || 0).toFixed(1)}
							</span>
							<div>
								<p class="text-sm font-semibold text-gray-900">{getRatingDescription(hotel.class || 0)}</p>
								<p class="text-xs text-gray-600">{hotel.reviewCount || 0} comentarios</p>
							</div>
						</div>
						<div class="space-y-1 text-sm text-gray-700">
							{#if hotel.hotelDetails?.facilities_block?.facilities}
								{#each hotel.hotelDetails.facilities_block.facilities.slice(0, 4) as facility}
									<div class="flex items-center gap-2">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
										</svg>
										<span>{facility.name}</span>
									</div>
								{/each}
							{:else}
								<!-- Fallback para cuando no hay facilidades -->
								<div class="flex items-center gap-2">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
									</svg>
									<span>WiFi gratis</span>
								</div>
								<div class="flex items-center gap-2">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
									</svg>
									<span>Parking</span>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Reservation Details Card -->
				<div class="bg-white rounded-lg border border-gray-200 p-4">
					<h3 class="text-lg font-bold text-gray-900 mb-3">Los datos de tu reserva</h3>
					<div class="grid grid-cols-2 gap-4 mb-4">
						<div>
							<p class="text-sm font-semibold text-gray-900 mb-1">Entrada</p>
							<p class="text-sm text-gray-700">{formatDate(searchParams.checkInDate)}</p>
							<p class="text-xs text-gray-600">De {formatTime(searchParams.checkInDate, true)}</p>
						</div>
						<div>
							<p class="text-sm font-semibold text-gray-900 mb-1">Salida</p>
							<p class="text-sm text-gray-700">{formatDate(searchParams.checkOutDate)}</p>
							<p class="text-xs text-gray-600">A {formatTime(searchParams.checkOutDate, false)}</p>
						</div>
					</div>
					<div class="border-t pt-3">
						<p class="text-sm font-semibold text-gray-900 mb-1">Has seleccionado</p>
						<p class="text-sm text-gray-700 mb-2">{getSelectedRoomsText()}</p>
						{#if getSelectedRoomsDetails()}
							<p class="text-sm text-gray-700">{getSelectedRoomsDetails()}</p>
						{/if}
						<button class="text-sm text-blue-600 hover:underline mt-2">Cambia tu selección</button>
					</div>
				</div>

				<!-- Price Breakdown Card -->
				<div class="bg-white rounded-lg border border-gray-200 p-4">
					<h3 class="text-lg font-bold text-gray-900 mb-3">Desglose del precio</h3>
					<div class="mb-4">
						<div class="flex justify-between items-start mb-2">
							<span class="text-xl font-bold text-gray-900">Precio</span>
							<div class="text-right">
								{#if PRICE_DISCOUNT && PRICE_DISCOUNT > 0}
									<div class="text-xs text-gray-500 line-through">{formatPrice(Math.round(totals.total / (1 - PRICE_DISCOUNT)))}</div>
									<div class="text-xl font-bold text-gray-900">{formatPrice(totals.total)}</div>
									<div class="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1 inline-block">- {Math.round(PRICE_DISCOUNT * 100)}%</div>
								{:else}
									<span class="text-xl font-bold text-gray-900">{formatPrice(totals.total)}</span>
								{/if}
							</div>
						</div>
						<p class="text-xs text-gray-600 text-right">Se pueden aplicar otros cargos</p>
						<p class="text-xs text-gray-600 text-right">En la moneda del alojamiento: {getOriginalCurrencyPrice()}</p>
					</div>
					
					<div class="border-t pt-3 space-y-3">
						<h4 class="text-sm font-semibold text-gray-900">Información sobre el precio</h4>
						
						<div class="flex gap-2 text-sm">
							<svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
							</svg>
							<p class="text-gray-700">No incluye <span class="font-semibold">{formatPrice(Math.round(totals.total * 0.06))}</span> de impuestos y cargos</p>
						</div>
						<p class="text-sm text-gray-700 ml-7">{getTaxPercentage()}% IVA <span class="float-right">{formatPrice(Math.round(totals.total * 0.06))}</span></p>
						
						<div class="flex gap-2 text-sm">
							<svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<p class="text-gray-700">En función de la nacionalidad, pueden aplicarse cargos por IVA adicional. Se aceptan exenciones y deben enviarse a las autoridades antes de tu llegada.</p>
						</div>
						
						<div class="flex gap-2 text-sm">
							<svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<p class="text-gray-700">Hemos convertido el precio para que veas el coste aproximado en COP. Pagarás en <span class="font-semibold">USD</span>. El tipo de cambio puede variar antes de que pagues.</p>
						</div>
						
						<div class="flex gap-2 text-sm">
							<svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
							</svg>
							<p class="text-gray-700">Ten en cuenta que la entidad emisora de tu tarjeta puede aplicar cargos por transacción internacional.</p>
						</div>
						
						<button class="text-sm text-blue-600 hover:underline">Ver menos</button>
					</div>
				</div>

				<!-- Payment Calendar Card -->
				<div class="bg-white rounded-lg border border-gray-200 p-4">
					<h3 class="text-lg font-bold text-gray-900 mb-3">Calendario de pago</h3>
					<p class="text-sm text-gray-700">
						Pagarás por adelantado el precio de la primera noche durante los 7 días antes de la fecha de llegada.
						{#if getPaymentDate()}
							<br><span class="font-semibold">Fecha de pago: {getPaymentDate()}</span>
						{/if}
					</p>
				</div>

				<!-- Cancellation Cost Card -->
				<div class="bg-white rounded-lg border border-gray-200 p-4">
					<h3 class="text-lg font-bold text-gray-900 mb-3">¿Cuánto cuesta cancelar?</h3>
					<p class="text-sm font-semibold text-green-700 mb-2">
						Cancelación gratis {getCancellationDeadline()}
					</p>
					<div class="flex justify-between text-sm text-gray-700">
						<span>Puedes cancelar sin costo adicional</span>
						<span class="font-semibold">COP 0</span>
					</div>
				</div>
			</div>

			<!-- Right Column -->
			<div class="resume-right-column space-y-4">
				<!-- Genius Promotion Banner -->
				<div class="bg-white rounded-lg border border-blue-200 p-4 flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-900 mb-2">Ahorra un 10% o más con esta opción al iniciar sesión en Genius, el programa de fidelización de Booking.com</p>
						<div class="flex gap-3">
							<button class="text-sm text-blue-600 font-semibold hover:underline">Iniciar sesión</button>
							<button class="text-sm text-blue-600 font-semibold hover:underline">Hazte una cuenta gratis</button>
						</div>
					</div>
					<div class="text-blue-600 font-bold text-2xl">Genius</div>
				</div>

				<!-- Contact Form -->
				<div class="bg-white rounded-lg border border-gray-200 p-6 contact-form">
					<h3 class="text-xl font-bold text-gray-900 mb-4">Introduce tus datos</h3>
					
					<div class="bg-orange-50 border border-orange-200 rounded p-3 mb-4 flex gap-2">
						<svg class="w-5 h-5 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
						<p class="text-sm text-gray-900">¡Ya casi estás! Solo tienes que rellenar los campos marcados con <span class="text-red-600">*</span></p>
					</div>

					<form on:submit|preventDefault={handleFormSubmit}>
						<div class="grid grid-cols-2 gap-4 mb-4">
							<div>
								<label for="firstName" class="block text-sm font-medium text-gray-900 mb-1">Nombre <span class="text-red-600">*</span></label>
								<input 
									id="firstName"
									type="text" 
									bind:value={formData.firstName}
									on:input={(e) => handleInputEvent(e, 'firstName')}
									class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {formErrors.firstName ? 'border-red-500' : 'border-gray-300'}"
									placeholder="Tu nombre"
								>
								{#if formErrors.firstName}
									<p class="text-xs text-red-600 mt-1">{formErrors.firstName}</p>
								{/if}
							</div>
							<div>
								<label for="lastName" class="block text-sm font-medium text-gray-900 mb-1">Apellido <span class="text-red-600">*</span></label>
								<input 
									id="lastName"
									type="text" 
									bind:value={formData.lastName}
									on:input={(e) => handleInputEvent(e, 'lastName')}
									class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {formErrors.lastName ? 'border-red-500' : 'border-gray-300'}"
									placeholder="Tu apellido"
								>
								{#if formErrors.lastName}
									<p class="text-xs text-red-600 mt-1">{formErrors.lastName}</p>
								{/if}
							</div>
						</div>

						<div class="mb-4">
							<label for="email" class="block text-sm font-medium text-gray-900 mb-1">E-mail <span class="text-red-600">*</span></label>
							<input 
								id="email"
								type="email" 
								bind:value={formData.email}
								on:input={(e) => handleInputEvent(e, 'email')}
								class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {formErrors.email ? 'border-red-500' : 'border-gray-300'}"
								placeholder="tu@email.com"
							>
							{#if formErrors.email}
								<p class="text-xs text-red-600 mt-1">{formErrors.email}</p>
							{:else}
								<p class="text-xs text-gray-600 mt-1">El e-mail de confirmación se enviará a esta dirección</p>
							{/if}
						</div>

						<div class="mb-4">
							<label class="flex items-center gap-2">
								<input 
									type="checkbox" 
									bind:checked={formData.loginDiscount}
									on:change={(e) => handleCheckboxEvent(e, 'loginDiscount')}
									class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								>
								<span class="text-sm text-gray-900">Inicia sesión para ahorrar un 10% o más (opcional)</span>
							</label>
							<p class="text-xs text-gray-600 ml-6">Las personas con cuenta tienen un descuento inmediato, ¡y hacérsela es gratis!</p>
						</div>

						<div class="mb-4">
							<label for="country" class="block text-sm font-medium text-gray-900 mb-1">País/región <span class="text-red-600">*</span></label>
							<select 
								id="country"
								bind:value={formData.country}
								on:change={(e) => handleInputEvent(e, 'country')}
								class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value={getCountryName()}>{getCountryName()}</option>
							</select>
						</div>

						<div class="mb-4">
							<label for="phone" class="block text-sm font-medium text-gray-900 mb-1">Número de teléfono <span class="text-red-600">*</span></label>
							<div class="flex gap-2">
								<select 
									bind:value={formData.phoneCode}
									on:change={(e) => handleInputEvent(e, 'phoneCode')}
									class="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value={getPhoneCode()}>{getCountryCode()} {getPhoneCode()}</option>
								</select>
								<input 
									id="phone"
									type="tel" 
									bind:value={formData.phone}
									on:input={(e) => handleInputEvent(e, 'phone')}
									class="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {formErrors.phone ? 'border-red-500' : 'border-gray-300'}"
									placeholder="3001234567"
								>
							</div>
							{#if formErrors.phone}
								<p class="text-xs text-red-600 mt-1">{formErrors.phone}</p>
							{:else}
								<p class="text-xs text-gray-600 mt-1">Para verificar la reserva y para que el alojamiento contacte contigo si es necesario</p>
							{/if}
						</div>

						<div>
							<label class="flex items-start gap-2">
								<input 
									type="checkbox" 
									bind:checked={formData.digitalConfirmation}
									on:change={(e) => handleCheckboxEvent(e, 'digitalConfirmation')}
									class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
								>
								<span class="text-sm text-gray-900">Sí, quiero recibir la confirmación digital gratis (recomendado)</span>
							</label>
						</div>
					</form>
				</div>

				<!-- Useful Information -->
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<h3 class="text-xl font-bold text-gray-900 mb-4">Información útil</h3>
					<div class="flex gap-3">
						<svg class="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
						</svg>
						<p class="text-sm text-gray-900">
							Elige flexibilidad: puedes cancelar gratis {getCancellationDeadline()}, así que aprovecha este precio fantástico hoy mismo.
						</p>
					</div>
				</div>

				<!-- Room Details -->
				{#each selectedRooms as room}
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<h3 class="text-xl font-bold text-gray-900 mb-4">{room.roomName} {#if room.quantity > 1}(x{room.quantity}){/if}</h3>
					
					<div class="space-y-3">
						{#if room.options.breakfast}
						<div class="flex items-start gap-2">
							<svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<div>
								<p class="text-sm font-semibold text-green-700">Desayuno incluido en el precio</p>
								{#if room.options.mealplan}
								<p class="text-xs text-gray-600">{room.options.mealplan}</p>
								{/if}
							</div>
						</div>
						{/if}

						{#if room.options.cancellation}
						<div class="flex items-start gap-2">
							<svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<div>
								<p class="text-sm font-semibold text-green-700">
									Cancelación gratis
									{#if room.options.refundableUntil}
										antes del {formatDate(room.options.refundableUntil)}
									{/if}
								</p>
							</div>
						</div>
						{/if}

						<div class="flex items-start gap-2">
							<svg class="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
							</svg>
							<p class="text-sm text-gray-700"><span class="font-semibold">Personas:</span> {searchParams.adults} adulto{searchParams.adults > 1 ? 's' : ''}{#if searchParams.children > 0}, {searchParams.children} niño{searchParams.children > 1 ? 's' : ''}{/if}</p>
						</div>

						<button class="text-sm text-blue-600 hover:underline">Añadir los datos del cliente principal</button>

						<div class="pt-3 border-t space-y-2">
							<div class="flex items-center gap-2 text-sm text-gray-700">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
								</svg>
								<span>Habitaciones impecables: {getRoomRating()}</span>
							</div>
							<div class="flex items-center gap-2 text-sm text-gray-700">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
								</svg>
								<span>No se puede fumar</span>
							</div>
						</div>
					</div>
				</div>
				{/each}

				<!-- Add-on Options -->
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<h3 class="text-xl font-bold text-gray-900 mb-4">Opciones para añadir a tu reserva</h3>
					
					<div class="space-y-4">
						<label class="flex items-start gap-3 p-4 border border-gray-200 rounded hover:border-blue-500 cursor-pointer {formData.airportTransfer ? 'border-blue-500 bg-blue-50' : ''}">
							<input 
								type="checkbox" 
								bind:checked={formData.airportTransfer}
								on:change={(e) => handleCheckboxEvent(e, 'airportTransfer')}
								class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
							>
							<div class="flex-1">
								<p class="text-sm font-semibold text-gray-900 mb-1">Quiero solicitar el servicio de traslado desde el aeropuerto</p>
								<p class="text-xs text-gray-600">Le diremos al alojamiento que te interesa este servicio para que puedan enviarte más información además de los precios.</p>
							</div>
							<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
							</svg>
						</label>

						<label class="flex items-start gap-3 p-4 border border-gray-200 rounded hover:border-blue-500 cursor-pointer {formData.flightNeeded ? 'border-blue-500 bg-blue-50' : ''}">
							<input 
								type="checkbox" 
								bind:checked={formData.flightNeeded}
								on:change={(e) => handleCheckboxEvent(e, 'flightNeeded')}
								class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
							>
							<div class="flex-1">
								<p class="text-sm font-semibold text-gray-900 mb-1">Necesitaré un vuelo para mi viaje</p>
								<p class="text-xs text-gray-600">Ahórrate el estrés de buscar: añadiremos opciones de vuelos (que ofrece Booking.com) a tu destino en la confirmación de la reserva.</p>
							</div>
							<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
							</svg>
						</label>

						<label class="flex items-start gap-3 p-4 border border-gray-200 rounded hover:border-blue-500 cursor-pointer {formData.carRental ? 'border-blue-500 bg-blue-50' : ''}">
							<input 
								type="checkbox" 
								bind:checked={formData.carRental}
								on:change={(e) => handleCheckboxEvent(e, 'carRental')}
								class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
							>
							<div class="flex-1">
								<p class="text-sm font-semibold text-gray-900 mb-1">Quiero alquilar un coche</p>
								<p class="text-xs text-gray-600">¡Aprovecha al máximo el viaje! Consulta las opciones de alquiler de coches en la confirmación de la reserva.</p>
							</div>
							<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
							</svg>
						</label>
					</div>
				</div>

				<!-- Special Requests -->
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<h3 class="text-xl font-bold text-gray-900 mb-4">Peticiones especiales</h3>
					
					<p class="text-sm text-gray-700 mb-3">Las peticiones especiales no se pueden garantizar, pero el alojamiento hará todo lo posible por satisfacerlas. ¡También puedes enviarnos tu petición especial cuando hayas realizado la reserva!</p>
					
					<label for="specialRequests" class="block text-sm font-medium text-gray-900 mb-2">Escribe tus peticiones en inglés o en español. <span class="text-gray-500">(opcional)</span></label>
					<textarea 
						id="specialRequests"
						rows="4" 
						bind:value={formData.specialRequests}
						on:input={(e) => handleInputEvent(e, 'specialRequests')}
						class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" 
						placeholder="Ej: Habitación en piso alto, cuna para bebé, etc."
					></textarea>
					
					<label class="flex items-start gap-2">
						<input 
							type="checkbox" 
							bind:checked={formData.freeParking}
							on:change={(e) => handleCheckboxEvent(e, 'freeParking')}
							class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
						>
						<span class="text-sm text-gray-900">Quiero parking privado gratis en el establecimiento</span>
					</label>
				</div>

				<!-- Arrival Time -->
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<h3 class="text-xl font-bold text-gray-900 mb-4">Tu hora de llegada</h3>
					
					<div class="space-y-3 mb-4">
						<div class="flex gap-3">
							<svg class="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
							</svg>
							<p class="text-sm text-gray-900">Tu habitación estará lista para el check-in a las {getCheckInTime()}</p>
						</div>
						
						<div class="flex gap-3">
							<svg class="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<p class="text-sm text-gray-900">Recepción 24 horas — ¡Tendrás ayuda siempre que la necesites!</p>
						</div>
					</div>
					
					<label class="block text-sm font-medium text-gray-900 mb-2">Añade tu hora de llegada aproximada <span class="text-gray-500">(opcional)</span></label>
					<select class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2">
						<option>Indica una hora</option>
						<option>00:00 - 01:00</option>
						<option>01:00 - 02:00</option>
						<option>02:00 - 03:00</option>
						<option>03:00 - 04:00</option>
						<option>04:00 - 05:00</option>
						<option>05:00 - 06:00</option>
						<option>06:00 - 07:00</option>
						<option>07:00 - 08:00</option>
						<option>08:00 - 09:00</option>
						<option>09:00 - 10:00</option>
						<option>10:00 - 11:00</option>
						<option>11:00 - 12:00</option>
						<option>12:00 - 13:00</option>
						<option>13:00 - 14:00</option>
						<option>14:00 - 15:00</option>
						<option>15:00 - 16:00</option>
						<option>16:00 - 17:00</option>
						<option>17:00 - 18:00</option>
						<option>18:00 - 19:00</option>
						<option>19:00 - 20:00</option>
						<option>20:00 - 21:00</option>
						<option>21:00 - 22:00</option>
						<option>22:00 - 23:00</option>
						<option>23:00 - 00:00</option>
					</select>
					<p class="text-xs text-gray-600">Hora de la zona horaria de Yopal</p>
				</div>

				<!-- Continue Button -->
				<div class="flex items-center justify-between pt-4">
					<button class="text-blue-600 hover:underline flex items-center gap-1">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
						</svg>
						Igualamos el precio
					</button>
					<button 
						on:click={handleNextStep}
						disabled={isSubmitting}
						class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded flex items-center gap-2 transition-colors"
					>
						{#if isSubmitting}
							<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
							Procesando...
						{:else if !isFormValid}
							Completa los datos requeridos
						{:else}
							Siguiente: últimos datos
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
							</svg>
						{/if}
					</button>
				</div>
			</div>
		</div>
		{/if}
	</div>
</main>

<Footer />

<style>
	/* Estilos personalizados para el stepper */
	.step-line {
		position: absolute;
		top: 16px;
		left: 0;
		right: 0;
		height: 2px;
		background-color: #e5e7eb;
		z-index: 0;
	}
	.step-line-active {
		background-color: #0071c2;
	}

	/* Layout de dos columnas forzado */
	.resume-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 768px) {
		.resume-grid {
			grid-template-columns: 1fr 2fr;
		}
	}

	.resume-left-column {
		/* Columna izquierda - 1/3 del ancho */
	}

	.resume-right-column {
		/* Columna derecha - 2/3 del ancho */
	}
</style>
