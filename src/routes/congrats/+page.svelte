<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
	import Header from '$lib/components/common/Header.svelte';
	import Navbar from '$lib/components/common/Navbar.svelte';
	import Footer from '$lib/components/common/footer.svelte';
	import { reservationStore } from '$lib/stores/reservation';
	import { DEFAULT_CURRENCY } from '$lib/config/currency';
	import { formatMoney } from '$lib/utils/money';

	// Variables reactivas del store de reserva
	$: reservationData = $reservationStore;
	$: hotel = reservationData.hotel;
	$: searchParams = reservationData.searchParams;
	$: selectedRooms = reservationData.selectedRooms;
	$: totals = reservationData.totals;
	$: guestData = reservationData.guestData;
  console.log(guestData)

	// Estado de carga y validación
	let isLoading = true;
	let hasValidReservation = false;

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

	onMount(async () => {
		console.log('🚀 Inicializando página de confirmación...');
		console.log('📊 Estado del store:', reservationData);
		
		// Pequeño delay para permitir que el store se inicialice
		await new Promise(resolve => setTimeout(resolve, 100));
		
		isLoading = false;
		console.log('✅ Página de confirmación inicializada');
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
		if (hotel.hotelPhotos && hotel.hotelPhotos.length > 0) {
			return hotel.hotelPhotos[0].url_1440;
		}
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

	function formatPrice(amount: number, currency: string = DEFAULT_CURRENCY): string {
		return formatMoney(amount, currency);
	}

	function getTaxPercentage(): number {
		// IVA fijo del 6% del valor total
		return 6;
	}

	function getOriginalCurrencyPrice(): string {
		return formatPrice(totals.total, totals.currency || DEFAULT_CURRENCY);
	}

	function generateConfirmationNumber(): string {
		const year = new Date().getFullYear();
		const randomNumber = Math.floor(Math.random() * 900000) + 100000;
		return `BK-${year}-${randomNumber}`;
	}

	function getCancellationDeadline(): string {
		// Cancelación gratuita en cualquier momento
		return 'en cualquier momento';
	}

	function getCancellationCost(): string {
		// Cancelación siempre gratuita
		return '0';
	}

	function getCheckInTime(): string {
		// Por defecto 16:00, pero se puede hacer dinámico si hay datos
		return '16:00';
	}
</script>

<svelte:head>
	<title>Reserva confirmada - {hotel.name || 'Hotel'} | Booking.com</title>
	<meta name="description" content="Tu reserva en {hotel.name || 'el hotel'} se ha completado con éxito" />
</svelte:head>

<style>
	.checkmark-circle {
		stroke-dasharray: 166;
		stroke-dashoffset: 166;
		animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
	}
	
	.checkmark {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: block;
		stroke-width: 3;
		stroke: #fff;
		stroke-miterlimit: 10;
		margin: 0 auto;
		box-shadow: inset 0px 0px 0px #008009;
		animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
	}
	
	.checkmark-check {
		transform-origin: 50% 50%;
		stroke-dasharray: 48;
		stroke-dashoffset: 48;
		animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
	}
	
	@keyframes stroke {
		100% {
			stroke-dashoffset: 0;
		}
	}
	
	@keyframes scale {
		0%, 100% {
			transform: none;
		}
		50% {
			transform: scale3d(1.1, 1.1, 1);
		}
	}
	
	@keyframes fill {
		100% {
			box-shadow: inset 0px 0px 0px 40px #008009;
		}
	}
</style>

<Header>
	<Navbar />
</Header>

<main class="max-w-[1100px] mx-auto px-4 py-8">
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
      <!-- Success State -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6 text-center">
        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
        
        <h1 class="text-3xl font-bold text-gray-900 mt-6 mb-2">¡Reserva confirmada!</h1>
        <p class="text-lg text-gray-600 mb-4">Tu reserva se ha completado con éxito</p>
        
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
          <p class="text-sm text-gray-700 mb-1">Número de confirmación</p>
          <p class="text-2xl font-bold text-[#003b95]">{generateConfirmationNumber()}</p>
        </div>
        
        <p class="text-sm text-gray-600 mt-4">
          Hemos enviado un email de confirmación a <span class="font-semibold">{guestData?.email || 'tu-email@ejemplo.com'}</span>
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Detalles de tu reserva</h2>
        
        <div class="flex gap-4 pb-6 border-b border-gray-200">
          <img src={getMainHotelImage()} alt={hotel.name || 'Hotel'} class="w-32 h-24 object-cover rounded-lg">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-yellow-500">{@html generateStarRating(hotel.class || 0)}</span>
              <span class="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">{hotel.accommodationType || 'Hotel'}</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-1">{hotel.name || 'Hotel'}</h3>
            <p class="text-sm text-gray-600">{hotel.addressLine || hotel.address || 'Dirección no disponible'}</p>
            <div class="flex items-center gap-2 mt-2">
              <span class="bg-[#003b95] text-white text-sm font-bold px-2 py-1 rounded">{(hotel.class || 0).toFixed(1)}</span>
              <span class="text-sm font-semibold text-gray-900">{getRatingDescription(hotel.class || 0)}</span>
              <span class="text-sm text-gray-600">· {hotel.reviewCount || 0} comentarios</span>
            </div>
          </div>
        </div>
      
        <div class="grid md:grid-cols-3 gap-6 py-6 border-b border-gray-200">
          <div>
            <p class="text-sm text-gray-600 mb-1">Entrada</p>
            <p class="font-bold text-gray-900">{formatDate(searchParams.checkInDate)}</p>
            <p class="text-sm text-gray-600">De {formatTime(searchParams.checkInDate, true)}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-1">Salida</p>
            <p class="font-bold text-gray-900">{formatDate(searchParams.checkOutDate)}</p>
            <p class="text-sm text-gray-600">A {formatTime(searchParams.checkOutDate, false)}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600 mb-1">Duración</p>
            <p class="font-bold text-gray-900">{getTotalNights()} noche{getTotalNights() > 1 ? 's' : ''}</p>
            <p class="text-sm text-gray-600">{searchParams.adults} adulto{searchParams.adults > 1 ? 's' : ''}{#if searchParams.children > 0}, {searchParams.children} niño{searchParams.children > 1 ? 's' : ''}{/if}</p>
          </div>
        </div>
      
        <div class="py-6 border-b border-gray-200">
          <h3 class="font-bold text-gray-900 mb-3">{getSelectedRoomsDetails() || 'Habitación seleccionada'}</h3>
          <div class="space-y-2 text-sm">
            {#each selectedRooms as room}
              <div class="mb-4 p-3 bg-gray-50 rounded">
                <h4 class="font-semibold text-gray-900 mb-2">{room.roomName} {#if room.quantity > 1}(x{room.quantity}){/if}</h4>
                <div class="space-y-1">
                  {#if room.options.breakfast}
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span class="text-gray-700">Desayuno incluido en el precio</span>
                  </div>
                  {/if}
                  {#if room.options.cancellation}
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span class="text-gray-700">
                      Cancelación gratis
                      {#if room.options.refundableUntil}
                        antes del {formatDate(room.options.refundableUntil)}
                      {:else}
                        en cualquier momento
                      {/if}
                    </span>
                  </div>
                  {/if}
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span class="text-gray-700">{searchParams.adults} adulto{searchParams.adults > 1 ? 's' : ''}{#if searchParams.children > 0}, {searchParams.children} niño{searchParams.children > 1 ? 's' : ''}{/if}</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      
        <div class="pt-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-700">{getTotalNights()} noche{getTotalNights() > 1 ? 's' : ''}, {getTotalRooms()} habitación{getTotalRooms() > 1 ? 'es' : ''}</span>
            <span class="text-gray-900">{formatPrice(totals.subtotal)}</span>
          </div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-700">{getTaxPercentage()}% IVA</span>
            <span class="text-gray-900">{formatPrice(totals.taxes)}</span>
          </div>
          <div class="flex justify-between items-center pt-4 border-t border-gray-200">
            <span class="text-xl font-bold text-gray-900">Precio total</span>
            <span class="text-2xl font-bold text-gray-900">{formatPrice(totals.total)}</span>
          </div>
          <p class="text-sm text-gray-600 mt-2">Total en la moneda configurada: {getOriginalCurrencyPrice()}</p>
        </div>
    </div>

      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div class="flex gap-3">
          <svg class="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
          </svg>
          <div>
            <h3 class="font-bold text-gray-900 mb-2">Información de pago</h3>
            <p class="text-sm text-gray-700 mb-2">
              <span class="font-semibold">{hotel.name || 'El alojamiento'}</span> gestionará tu pago.
            </p>
            <p class="text-sm text-gray-700">
              El alojamiento te cobrará <span class="font-semibold">{formatPrice(totals.total)}</span> durante tu estancia.
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">¿Qué ocurre ahora?</h2>
        
        <div class="space-y-4">
          <div class="flex gap-3">
            <div class="flex-shrink-0 w-8 h-8 bg-[#003b95] text-white rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">Recibirás un email de confirmación</h3>
              <p class="text-sm text-gray-600">Hemos enviado los detalles de tu reserva a {guestData?.email || 'tu-email@ejemplo.com'}</p>
            </div>
          </div>
          
          <div class="flex gap-3">
            <div class="flex-shrink-0 w-8 h-8 bg-[#003b95] text-white rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">Prepara tu viaje</h3>
              <p class="text-sm text-gray-600">Consulta los detalles de tu reserva y añade peticiones especiales si lo necesitas</p>
            </div>
          </div>
          
          <div class="flex gap-3">
            <div class="flex-shrink-0 w-8 h-8 bg-[#003b95] text-white rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">Disfruta de tu estancia</h3>
              <p class="text-sm text-gray-600">El check-in es a las {getCheckInTime()}. ¡Que tengas un viaje fantástico!</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div class="flex gap-3">
          <svg class="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 class="font-bold text-gray-900 mb-2">Información importante</h3>
            <ul class="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Cancelación gratis {getCancellationDeadline()}</li>
              <li>El check-in es a las {getCheckInTime()}</li>
              <li>Recuerda llevar un documento de identidad válido y una tarjeta de crédito</li>
            </ul>
          </div>
        </div>
      </div>


      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <h3 class="font-bold text-gray-900 mb-2">¿Necesitas ayuda?</h3>
        <p class="text-sm text-gray-600 mb-4">
          Si tienes alguna pregunta sobre tu reserva, contacta con el alojamiento o con nuestro servicio de atención al cliente.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/contact" class="text-[#003b95] font-semibold hover:underline">Contactar con el alojamiento</a>
          <span class="hidden sm:inline text-gray-400">|</span>
          <a href="/help" class="text-[#003b95] font-semibold hover:underline">Centro de ayuda</a>
        </div>
      </div>
    {/if}
</main>

<Footer />
