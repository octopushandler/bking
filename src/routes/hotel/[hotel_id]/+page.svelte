<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Header from '$lib/components/common/Header.svelte';
	import Navbar from '$lib/components/common/Navbar.svelte';
	import Hero from '$lib/components/common/Hero.svelte';
	import SearchForm from '$lib/components/common/SearchForm.svelte';
	import DateGuestPicker from '$lib/components/common/DateGuestPicker.svelte';
    import Footer from '$lib/components/common/footer.svelte';
	import ImageGalleryDesktop from '$lib/components/hotel/ImageGalleryDesktop.svelte';
	import ImageGalleryMobile from '$lib/components/hotel/ImageGalleryMobile.svelte';
	import { hotelDetailsStore } from '$lib/stores/hotelDetails';
	import { hotelReviewsStore } from '$lib/stores/hotelReviews';
	import { reservationStore } from '$lib/stores/reservation';
	import { validateDateRange, formatISODateOnly } from '$lib/utils/dateValidation';
	import { HotelDetailsService } from '$lib/services/hotelDetailsService';
	import { PRICE_DISCOUNT } from '$lib/config/discount';
	import { 
		type HotelData, 
		type SearchParams,
		getHotelName,
		getHotelAddress,
		getStarRating,
		getDistanceToCenter,
		getHotelDescription,
		getHotelFacilities,
		getTopBenefits,
		getGroupedRooms,
		hasRoomData,
		getHotelPhotos,
		getCountryTrans,
		getDistrict,
		getCityTrans,
		getAccommodationTypeName,
		getHotelNameForTitle,
		cleanOldCache
	} from '$lib/utils/hotelDataHelpers';

	// Estado simple sin reactividad compleja
	let hotelData: HotelData = {
		hotelDetails: null,
		hotelPhotos: null,
		hotelDescription: null,
		roomList: null
	};
	
	let searchParams: SearchParams = {
		checkInDate: '2026-01-31',
		checkOutDate: '2026-02-01',
		adults: 2,
		children: 0,
		rooms: 1,
		pets: false
	};

	// Número de noches dinámico según las fechas seleccionadas
	let nights = 1;
	$: {
		const res = validateDateRange(searchParams.checkInDate, searchParams.checkOutDate);
		nights = res.ok && typeof res.nights === 'number' ? res.nights : 1;
	}
	
	let isLoading = false;
	let hasError = false;
	let errorMessage = '';
	
	// Estado para controlar el colapso de las opciones de habitación
	let showRoomOptions = true;

	async function loadHotelData(hotelId: number) {
		console.log(`🚀 [PAGE] Iniciando carga para hotel ID: ${hotelId}`);
		
		isLoading = true;
		hasError = false;
		errorMessage = '';

		// Obtener parámetros de la URL
		let checkinDate = $page.url.searchParams.get('checkin_date') || '2026-01-31';
		let checkoutDate = $page.url.searchParams.get('checkout_date') || '2026-02-01';
		const adults = parseInt($page.url.searchParams.get('adults_number')) || 2;
		const children = parseInt($page.url.searchParams.get('children_number')) || 0;
		const rooms = parseInt($page.url.searchParams.get('room_number')) || 1;
		const pets = $page.url.searchParams.get('pets') === 'true';

		// Validar y normalizar fechas (reglas realistas)
		const dateValidation = validateDateRange(checkinDate, checkoutDate, { minNights: 1, maxNights: 30, allowPastCheckIn: false, maxAdvanceMonths: 18 });
		if (!dateValidation.ok) {
			const today = new Date();
			const tomorrow = new Date(today);
			tomorrow.setDate(today.getDate() + 1);
			checkinDate = formatISODateOnly(today);
			checkoutDate = formatISODateOnly(tomorrow);
			console.warn('⚠️ [PAGE] Fechas inválidas en URL. Normalizando a hoy+1:', { checkinDate, checkoutDate, error: dateValidation.error });
		}

		// Actualizar searchParams
		searchParams = {
			checkInDate: checkinDate,
			checkOutDate: checkoutDate,
			adults,
			children,
			rooms,
			pets
		};

		console.log(`📋 [PAGE] Parámetros para hotel ${hotelId}:`, searchParams);

		try {
			// Verificar si hay datos pre-cargados
			const urlParams = new URLSearchParams($page.url.search);
			const isPreloaded = urlParams.get('preloaded') === 'true';
			const cacheKey = urlParams.get('cacheKey');

			if (isPreloaded && cacheKey) {
				console.log(`💾 [PAGE] Usando datos pre-cargados para hotel ${hotelId}`);
				
				const cachedData = localStorage.getItem(cacheKey);
				if (cachedData) {
					const parsed = JSON.parse(cachedData);
					hotelData = parsed.data;
					searchParams = parsed.searchParams;
					
					// Limpiar cache después de usar
					localStorage.removeItem(cacheKey);
					console.log(`✅ [PAGE] Datos pre-cargados cargados para hotel ${hotelId}`);
				} else {
					throw new Error('Cache no encontrado');
				}
			} else {
				console.log(`📞 [PAGE] Cargando datos desde API para hotel ${hotelId}`);
				
				// Limpiar el store
				hotelDetailsStore.clearData();
				
				// Cargar datos desde la API
				const apiData = await HotelDetailsService.loadHotelData(hotelId, checkinDate, checkoutDate, adults, children);
				hotelData = apiData;
				
				console.log(`✅ [PAGE] Datos cargados desde API para hotel ${hotelId}`);
			}
			
			// Inicializar el store de reserva
			if (hotelData.hotelDetails) {
				console.log(`💾 [PAGE] Inicializando reserva para hotel ${hotelId}`);
				reservationStore.initializeReservation(
					hotelData.hotelDetails,
					hotelData.hotelPhotos,
					hotelData.hotelDescription,
					hotelData.roomList,
					searchParams
				);
				// Actualizar datos de reserva localmente
				updateReservationData();
				console.log(`✅ [PAGE] Reserva inicializada para hotel ${hotelId}`);
			} else {
				console.log(`❌ [PAGE] No hay detalles del hotel ${hotelId}, no se puede inicializar reserva`);
			}
			
		} catch (error) {
			console.error(`💥 [PAGE] Error cargando datos del hotel ${hotelId}:`, error);
			hasError = true;
			errorMessage = error instanceof Error ? error.message : 'Error desconocido';
		} finally {
			isLoading = false;
		}
	}

	// Cargar datos al montar el componente
	onMount(async () => {
		console.log('🚀 [PAGE] onMount iniciado');
		
		// Limpiar cache antiguo
		console.log('🧹 [PAGE] Limpiando cache antiguo...');
		cleanOldCache();
		console.log('✅ [PAGE] Cache limpiado');
		
		// Cargar datos del hotel
		const hotelId = parseInt($page.params.hotel_id);
		console.log(`🏨 [PAGE] Hotel ID extraído: ${hotelId}`);
		
		if (hotelId) {
			console.log('📞 [PAGE] Iniciando carga de datos del hotel...');
			await loadHotelData(hotelId);
			console.log('✅ [PAGE] Datos del hotel cargados');
			
			console.log('📝 [PAGE] Iniciando carga de reviews...');
			loadReviews(hotelId);
			console.log('✅ [PAGE] Reviews cargadas');
		}
		
		console.log('🎉 [PAGE] onMount completado');
	});
	
	// Variables para reviews (sin reactividad compleja)
	let hotelReviewsData: any = null;
	let overallRating: any = null;
	let categoryRatings: any[] = [];
	let userReviews: any[] = [];
	
	// Función para cargar reviews
	function loadReviews(hotelId: number) {
		console.log(`🔄 [PAGE] Cargando reviews para hotel ${hotelId}...`);
		if (hotelId && !isNaN(hotelId)) {
			// Generar reviews si no existen para este hotel (solo una vez)
			if (!hotelReviewsStore.getReviewsForHotel(hotelId)) {
				console.log(`📝 [PAGE] Generando reviews para hotel ${hotelId}...`);
				hotelReviewsStore.generateReviewsForHotel(hotelId);
			}
			hotelReviewsData = hotelReviewsStore.getReviewsForHotel(hotelId);
			overallRating = hotelReviewsData?.overallRating || null;
			categoryRatings = hotelReviewsData?.categoryRatings || [];
			userReviews = hotelReviewsData?.userReviews || [];
			console.log(`✅ [PAGE] Reviews cargadas para hotel ${hotelId}`);
		}
	}
	
	// Variables para la reserva (sin reactividad)
	let reservationData: any = null;
	let selectedRooms: any[] = [];
	let reservationTotals: any = null;
	let isReservationValid = false;
	
	// Función para actualizar datos de reserva
	function updateReservationData() {
		console.log('🔄 [PAGE] Actualizando datos de reserva...');
		reservationData = $reservationStore;
		selectedRooms = $reservationStore.selectedRooms;
		reservationTotals = $reservationStore.totals;
		isReservationValid = $reservationStore.isValid;
		console.log('✅ [PAGE] Datos de reserva actualizados');
		// Actualizar también el resumen
		updateReservationSummary();
	}
	
	// Funciones para manejar la selección de habitaciones
	function handleRoomQuantityChange(roomData: any, quantity: number) {
		console.log('🔄 Cambiando cantidad de habitación:', { roomData, quantity });
		if (quantity === 0) {
			reservationStore.removeRoomFromReservation(roomData.room_id);
		} else {
			reservationStore.addRoomToReservation(roomData, quantity);
		}
		// Forzar validación después del cambio
		reservationStore.validateReservation();
		// Actualizar datos localmente
		updateReservationData();
	}
	
	function getSelectedRoomQuantity(roomId: number): number {
		const selectedRoom = selectedRooms.find(room => room.roomId === roomId);
		return selectedRoom ? selectedRoom.quantity : 0;
	}
	
	function navigateToResume() {
		if (isReservationValid) {
			window.location.href = '/resume';
		} else {
			alert('Por favor selecciona al menos una habitación para continuar');
		}
	}
	
	// Variable para controlar si ya se está cargando
	let isLoadingNewData = false;
	let lastUpdateParams = '';
	
	function handleDateGuestChange(newData: any) {
		// Crear una clave única para estos parámetros
		const paramsKey = `${newData.checkInDate}-${newData.checkOutDate}-${newData.adults}-${newData.children}`;
		
		// Evitar múltiples cargas simultáneas o cargas duplicadas
		if (isLoadingNewData || lastUpdateParams === paramsKey) {
			console.log('⏳ Ya se está cargando nueva información o parámetros duplicados, ignorando solicitud');
			return;
		}
		
		lastUpdateParams = paramsKey;
		isLoadingNewData = true;
		
		// Actualizar parámetros de búsqueda en el store de reserva
		reservationStore.updateSearchParams(newData);
		// Actualizar datos localmente
		updateReservationData();
		
		// Solo recargar la lista de habitaciones, no todos los datos del hotel
		const hotelId = parseInt($page.params.hotel_id);
		if (hotelId) {
			// Solo recargar la lista de habitaciones que es lo que realmente cambia
			HotelDetailsService.loadRoomList(
				hotelId, 
				newData.checkInDate, 
				newData.checkOutDate, 
				newData.adults, 
				newData.children
			).then(roomList => {
				if (roomList) {
					// Actualizar solo la lista de habitaciones en el store de reservas
					const currentReservation = reservationStore.getReservationSummary();
					if (currentReservation && currentReservation.hotel.hotelDetails) {
						reservationStore.initializeReservation(
							currentReservation.hotel.hotelDetails,
							currentReservation.hotel.hotelPhotos,
							currentReservation.hotel.hotelDescription,
							roomList,
							newData
						);
						// Actualizar datos localmente
						updateReservationData();
					}
				}
			}).catch(error => {
				console.error('Error actualizando lista de habitaciones:', error);
			}).finally(() => {
				isLoadingNewData = false;
				// Resetear la clave después de un delay para permitir futuras actualizaciones
				setTimeout(() => {
					lastUpdateParams = '';
				}, 1000);
			});
		} else {
			isLoadingNewData = false;
			lastUpdateParams = '';
		}
	}
	
	function createRoomChangeHandler(roomData: any) {
		return (event: Event) => {
			const target = event.target as HTMLSelectElement;
			const quantity = parseInt(target.value);
			handleRoomQuantityChange(roomData, quantity);
		};
	}
	
	// Variable para el resumen de la reserva (sin reactividad)
	let reservationSummary: any = {
		hasSelection: false,
		text: '• Todavía no se te cobrará nada'
	};
	
	// Función para actualizar el resumen de la reserva
	function updateReservationSummary() {
		console.log('🔄 [PAGE] Actualizando resumen de reserva...');
		if (selectedRooms.length === 0) {
			reservationSummary = {
				hasSelection: false,
				text: '• Todavía no se te cobrará nada'
			};
		} else {
			const totalRooms = selectedRooms.reduce((sum, room) => sum + room.quantity, 0);
			const totalNights = selectedRooms[0]?.totalNights || 0;
			const totalAmount = reservationTotals?.total || 0;
			
			reservationSummary = {
				hasSelection: true,
				text: `• ${totalRooms} habitación${totalRooms > 1 ? 'es' : ''} • ${totalNights} noche${totalNights > 1 ? 's' : ''} • ${totalAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`
			};
		}
		console.log('✅ [PAGE] Resumen de reserva actualizado');
	}
</script>

<svelte:head>
	<title>{getHotelName(hotelData)} - Booking</title>
	<meta name="description" content="Detalles completos del hotel {getHotelName(hotelData)}" />
</svelte:head>

<!-- Header completo con SearchForm -->
<Header>
	<Navbar />
	<Hero showText={false}>
		<SearchForm initialData={{
			destination: { name: getCityTrans(hotelData) },
			checkInDate: searchParams.checkInDate,
			checkOutDate: searchParams.checkOutDate,
			adults: searchParams.adults,
			children: searchParams.children,
			rooms: searchParams.rooms,
			pets: searchParams.pets
		}} />
	</Hero>
</Header>

<!-- Contenido principal -->
<main class="min-h-screen max-w-[1100px] mx-auto mt-[85px]">
	<div class="container mx-auto px-4 py-8">
		
		<!-- Estado de carga -->
		{#if isLoading}
			<div class="flex items-center justify-center py-12">
				<div class="text-center">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p class="text-gray-600">Cargando información del hotel...</p>
				</div>
			</div>
		{/if}
		
		<!-- Estado de error -->
		{#if hasError}
			<div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">Error al cargar el hotel</h3>
						<div class="mt-2 text-sm text-red-700">
							<p>{hasError}</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
		
		<!-- Contenido principal (solo mostrar si no está cargando) -->
		{#if !isLoading}
		<!-- Ruta pagada -->
		<div class="text-xs gap-2 flex flex-row flex-wrap justify-start items-center mb-4">
			<span class="text-blue-600 hover:underline cursor-pointer">Inicio</span>
			<span>></span>
			<span class="text-blue-600 hover:underline cursor-pointer">Hoteles</span>
			<span>></span>
			<span class="text-blue-600 hover:underline cursor-pointer">{getCountryTrans(hotelData)}</span>
			<span>></span>
			<span class="text-blue-600 hover:underline cursor-pointer">{getDistrict(hotelData)}</span>
			<span>></span>
			<span class="text-blue-600 hover:underline cursor-pointer">{getCityTrans(hotelData)}</span>
			<span>></span>
			<span>Ofertas en el {getHotelNameForTitle(hotelData)} ({getAccommodationTypeName(hotelData)}) ({getCountryTrans(hotelData)})</span>
		</div>

		<!-- Tabs -->
		<div class="hidden md:grid grid-cols-6 gap-0 text-center text-sm cursor-pointer mb-14">

			<!-- Active tab -->
			<div class="col-span-1 py-5 border-b border-b-2 border-blue-800">
				<span class="text-gray-800">Vista general</span>
			</div>
			<div class="col-span-1 py-5 border-b border-zinc-200 hover:bg-zinc-100">
				<span class="text-gray-800">Info y precios</span>
			</div>
			<div class="col-span-1 py-5 border-b border-zinc-200 hover:bg-zinc-100">
				<span class="text-gray-800">Servicios</span>
			</div>
			<div class="col-span-1 py-5 border-b border-zinc-200 hover:bg-zinc-100">
				<span class="text-gray-800">Normas de la casa</span>
			</div>
			<div class="col-span-1 py-5 border-b border-zinc-200 hover:bg-zinc-100">
				<span class="text-gray-800">A tener en cuenta</span>
			</div>
			<div class="col-span-1 py-5 border-b border-zinc-200 hover:bg-zinc-100">
				<span class="text-gray-800">Comentarios</span>
			</div>
		</div>

		<!-- Titles -->
		<div class="flex flex-row flex-wrap justify-between items-start">
			<div class="flex flex-col gap-2">
				<img src="/assets/hotel/stars.png" alt="Stars" class="w-[180px] object-contain">
				<p class="text-3xl font-bold">{getHotelName(hotelData)}</p>
				<div class="flex flex-row gap-2 items-end text-sm">
					<img src="/assets/hotel/location.png" alt="Map" class="w-[15px] object-contain">
					<p>{@html getHotelAddress(hotelData)}</p>
				</div>
			</div>
			<div class="flex flex-col gap-5 items-end justify-end">
				<div class="flex flex-row gap-5 items-center">
					<img src="/assets/hotel/share_heart.png" alt="Hotel" class="w-[90px] object-contain">
					<button 
						class="bg-[#006CE4] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#005bb5] transition-colors"
						on:click={navigateToResume}
					>
						Reserva ahora
					</button>
					<div class="text-xs text-gray-600 mt-1">
						{reservationSummary.text}
					</div>
				</div>
				<div class="flex flex-row gap-3 items-center">
					<img src="/assets/hotel/tag.png" alt="Equal Price" class="w-[20px] object-contain">
					<span class="text-blue-600 hover:underline font-semibold text-sm cursor-pointer">Igualamos el precio</span>
				</div>
			</div>
		</div>

		<!-- Gallery -->
		<div class="mt-8">
			<!-- Galería para desktop -->
			<ImageGalleryDesktop images={getHotelPhotos(hotelData)} />
			
			<!-- Galería para mobile -->
			<ImageGalleryMobile images={getHotelPhotos(hotelData)} />
		</div>

		<!-- Description & Main specs -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mt-8">
			<div class="md:col-span-3 flex flex-col gap-4">
				<div class="text-sm text-gray-900 whitespace-pre-line">{getHotelDescription(hotelData)}</div>
				<span class="text-xs text-gray-600">Las distancias en la descripción del alojamiento se calculan con OpenStreetMap©</span>

				<div>
					<p class="text-md text-gray-900 font-bold">Ideal para tu estancia</p>
					<div class="flex flex-row flex-wrap gap-4 mt-4">
						<div class="flex flex-row items-center justify-center gap-2">
							<img src="/assets/hotel/icons/wifi.png" alt="Bed" class="w-[20px] object-contain">
							<p class="text-sm text-gray-900">WiFi gratis</p>
						</div>
						<div class="flex flex-row items-center justify-center gap-2">
							<img src="/assets/hotel/icons/bano_priv.png" alt="Bed" class="w-[20px] object-contain">
							<p class="text-sm text-gray-900">Baño privado</p>
						</div>
						<div class="flex flex-row items-center justify-center gap-2">
							<img src="/assets/hotel/icons/aire_acond.png" alt="Bed" class="w-[20px] object-contain">
							<p class="text-sm text-gray-900">Aire acondicionado</p>
						</div>
						<div class="flex flex-row items-center justify-center gap-2">
							<img src="/assets/hotel/icons/gym.png" alt="Bed" class="w-[20px] object-contain">
							<p class="text-sm text-gray-900">Gimnasio</p>
						</div>
						<div class="flex flex-row items-center justify-center gap-2">
							<img src="/assets/hotel/icons/mov_red.png" alt="Bed" class="w-[20px] object-contain">
							<p class="text-sm text-gray-900">Adaptado para persona con movilidad reducida</p>
						</div>
						<div class="flex flex-row items-center justify-center gap-2">
							<img src="/assets/hotel/icons/parking.png" alt="Bed" class="w-[20px] object-contain">
							<p class="text-sm text-gray-900">Parking gratuito</p>
						</div>
						<div class="flex flex-row items-center justify-center gap-2">
							<img src="/assets/hotel/icons/tv.png" alt="Bed" class="w-[20px] object-contain">
							<p class="text-sm text-gray-900">TV de pantalla plana</p>
						</div>
						<div class="flex flex-row items-center justify-center gap-2">
							<img src="/assets/hotel/icons/tras_aerop.png" alt="Bed" class="w-[20px] object-contain">
							<p class="text-sm text-gray-900">Traslado al aeropuerto</p>
						</div>
						<div class="flex flex-row items-center justify-center gap-2">
							<img src="/assets/hotel/icons/vistas.png" alt="Bed" class="w-[20px] object-contain">
							<p class="text-sm text-gray-900">Vistas</p>
						</div>
					</div>
				</div>
			</div>
			<div class="col-span-1 md:col-span-1 bg-[#f0f6ff] p-4 rounded-lg mt-6 md:mt-0">
				<p class="text-md font-bold text-gray-900 mb-4">Puntos fuertes del alojamiento</p>
				<p class="text-sm font-bold text-gray-900 mb-2">¡Perfecto para alojarse 1 semana!</p>

				<div class="flex flex-row flex-wrap gap-4">
					<div class="flex flex-row items-start justify-center gap-2">
						<img src="/assets/hotel/icons/s_ubi.png" alt="Bed" class="w-[17px] object-contain">
						<p class="text-xs text-gray-900">La mejor ubicación. Los viajeros recientes le dan una puntuación alta (9,6)</p>
					</div>
					<div class="flex flex-row items-start justify-center gap-2">
						<img src="/assets/hotel/icons/s_cama.png" alt="Bed" class="w-[21px] object-contain">
						<p class="text-xs text-gray-900">¿Quieres dormir a pierna suelta? Este hotel tiene una puntuación muy alta por la comodidad de sus camas.</p>
					</div>
				</div>

				<p class="text-sm font-bold text-gray-900 mb-2">Información sobre el desayuno</p>
				<p class="text-xs text-gray-900 mb-4">Continental, Americano, Buffet, Desayuno para llevar</p>

				<p class="text-sm font-bold text-gray-900 mb-2">Habitaciones con:</p>
				<div class="flex flex-row flex-wrap gap-4 mb-7">
					<div class="flex flex-row items-start justify-center gap-2">
						<img src="/assets/hotel/icons/s_ciudad.png" alt="Bed" class="w-[17px] object-contain">
						<p class="text-xs text-gray-900">Vistas de la ciudad</p>
					</div>
					<div class="flex flex-row items-start justify-center gap-2">
						<img src="/assets/hotel/icons/s_parking.png" alt="Bed" class="w-[21px] object-contain">
						<p class="text-xs text-gray-900">Hay parking privado gratis en el hotel</p>
					</div>
				</div>

				<button 
					class="w-full bg-[#006CE4] text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-[#005bb5] transition-colors"
					on:click={navigateToResume}
				>
					Reserva ahora
				</button>
				<div class="text-xs text-gray-600 mt-2 text-center">
					{@html reservationSummary.text}
				</div>
			</div>
		</div>



	<!-- Tabla de habitaciones y reservación -->
	<div class="max-w-7xl mx-auto px-4 py-8">
		<p class="text-3xl font-bold mb-2">Disponibilidad</p>
		<p class="text-md text-gray-600 mb-6">Precio convertidos a COP 🛈</p>

		<!-- Selector de fechas y huéspedes -->
		<div class="mb-6">
			<DateGuestPicker 
				initialData={{
					checkInDate: reservationData?.searchParams?.checkInDate || searchParams.checkInDate,
					checkOutDate: reservationData?.searchParams?.checkOutDate || searchParams.checkOutDate,
					adults: reservationData?.searchParams?.adults || searchParams.adults,
					children: reservationData?.searchParams?.children || searchParams.children,
					rooms: reservationData?.searchParams?.rooms || searchParams.rooms,
					pets: reservationData?.searchParams?.pets || searchParams.pets
				}}
				on:dataChange={(e) => handleDateGuestChange(e.detail)}
			/>
		</div>

		<!-- Filtros -->
		<div class="mb-6">
			<h3 class="font-semibold mb-3">Filtrar por:</h3>
			<div class="flex gap-6">
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" class="w-4 h-4 border-2 border-gray-400 rounded">
					<span>Habitaciones</span>
				</label>
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" class="w-4 h-4 border-2 border-gray-400 rounded">
					<span>Suites</span>
				</label>
			</div>
		</div>

		<!-- Tabla de habitaciones -->
		<div class="bg-white rounded-lg shadow-sm">
			{#if hasRoomData(hotelData)}
				<div class="overflow-x-auto">
					<table class="w-full border-collapse">
						<!-- Encabezados -->
						<thead>
						<tr class="bg-blue-600 text-white">
								<th class="text-left p-3 font-semibold text-sm border-r border-blue-500">Tipo de habitación</th>
								<th class="text-left p-3 font-semibold text-sm border-r border-blue-500">Número de personas</th>
							<th class="text-left p-3 font-semibold text-sm border-r border-blue-500">Precio para {nights} {nights === 1 ? 'noche' : 'noches'}</th>
								<th class="text-left p-3 font-semibold text-sm border-r border-blue-500">Tus opciones</th>
								<th class="text-left p-3 font-semibold text-sm">Seleccionar habitaciones</th>
							</tr>
						</thead>
						<tbody>
							{#each getGroupedRooms(hotelData) as { roomType, rooms }}
								{#each rooms as roomData, index}
									<tr class="border-b border-gray-200">
									{#if index === 0}
										{@const bedInfo = HotelDetailsService.getBedTypeInfo(roomData.room.bed_type)}
										<!-- Columna de tipo de habitación con rowspan -->
										<td rowspan={rooms.length} class="p-4 border-r border-gray-200 align-top bg-gray-50">
											<div class="space-y-3">
												<span class="text-blue-600 hover:underline font-semibold text-base cursor-pointer">
													{roomData.room.name || roomData.room.room_name}
												</span>
												
												<div class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
													Recomendado para {roomData.room.nr_adults} adultos
												</div>
												
												<div class="flex items-center gap-1 text-red-600 text-sm font-semibold">
													<span class="text-lg">🔴</span>
													<span>Nos quedan {roomData.room.room_count}</span>
												</div>
												
												<div class="text-sm text-gray-700">
													{bedInfo.text}
													<div class="mt-1 flex items-center gap-1">
														{@html bedInfo.svg || bedInfo.icon}
													</div>
												</div>
													
													<div class="space-y-2 text-sm text-gray-700">
														{#each HotelDetailsService.getRoomFacilities(roomData.room) as facility}
															<div class="flex items-start gap-2">
																<span>{facility.icon}</span>
																<span>{facility.text}</span>
															</div>
														{/each}
													</div>
													
													<div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 pt-2 border-t border-gray-200">
														{#each HotelDetailsService.getRoomAmenities(roomData.room) as amenity}
															<div class="flex items-center gap-1">
																<span class="checkmark"></span> {amenity}
															</div>
														{/each}
													</div>
												</div>
											</td>
										{/if}
										
										<!-- Número de personas -->
										<td class="p-4 border-r border-gray-200 align-top">
											<div class="flex items-center gap-1">
												{#each Array(roomData.room.nr_adults) as _}
													<span>👤</span>
												{/each}
											</div>
										</td>
										
										<!-- Precio -->
						<td class="p-4 border-r border-gray-200 align-top">
							{#if roomData.priceOriginal && roomData.price}
								<div class="flex flex-col items-start">
									<div class="text-xs text-gray-500 line-through">{roomData.priceOriginal}</div>
									<div class="font-bold text-lg text-gray-900">{roomData.price}</div>
									<div class="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1">- {Math.round((PRICE_DISCOUNT || 0) * 100)}%</div>
								</div>
							{:else}
								<div class="font-bold text-lg text-gray-900">{roomData.price}</div>
							{/if}
							<div class="text-xs text-gray-600 mt-1">+ {roomData.taxes} de impuestos y cargos</div>
						</td>
										
										<!-- Opciones -->
										<td class="p-4 border-r border-gray-200 align-top">
											<div class="space-y-2 text-sm">
												{#each roomData.options as option}
													<div class="flex items-start gap-2">
														<span class={option.color}>{option.icon}</span>
														<div>
															<span class="font-semibold {option.color}">{option.text}</span>
														</div>
													</div>
												{/each}
											</div>
										</td>
										
										<!-- Seleccionar habitaciones -->
										<td class="p-4 align-top">
											<div class="space-y-3">
												<select 
													class="border border-gray-300 rounded px-3 py-2 w-20"
													value={getSelectedRoomQuantity(roomData.room.room_id)}
													on:change={createRoomChangeHandler(roomData.room)}
												>
													{#each Array(Math.min(roomData.room.room_count + 1, 5)) as _, i}
														<option value={i}>{i}</option>
													{/each}
												</select>
												{#if index === 0}
													<button 
														class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
														disabled={!isReservationValid}
														on:click={navigateToResume}
													>
														{isReservationValid ? 'Reservaré' : 'Selecciona habitaciones'}
													</button>
													<div class="text-xs text-gray-600">
														{reservationSummary.text}
													</div>
												{/if}
											</div>
										</td>
									</tr>
								{/each}
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<!-- Estado cuando no hay datos de habitaciones -->
				<div class="p-8 text-center">
					<div class="text-gray-500 mb-4">
						<svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">No hay habitaciones disponibles</h3>
					<p class="text-gray-600">No se encontraron habitaciones para las fechas seleccionadas.</p>
				</div>
			{/if}
		</div>
		
		<!-- Resumen de selección en tiempo real -->
		{#if selectedRooms.length > 0}
			<div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
				<h3 class="text-lg font-semibold text-blue-900 mb-3">Resumen de tu selección</h3>
				<div class="space-y-2">
					{#each selectedRooms as room}
						<div class="flex justify-between items-center text-sm">
							<span class="text-gray-700">
								{room.quantity}x {room.roomName}
							</span>
							<span class="font-semibold text-gray-900">
								{room.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
							</span>
						</div>
					{/each}
					<hr class="border-blue-200 my-2">
					<div class="flex justify-between items-center font-semibold text-blue-900">
						<span>Total:</span>
						<span>{reservationTotals.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
					</div>
				</div>
			</div>
		{/if}
		
	</div>

	<!-- Comentarios -->
	<div class="max-w-7xl mx-auto px-4 py-8">
		<div class="bg-white p-6 rounded-lg shadow-sm">
			<!-- Header -->
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-bold text-gray-900">Comentarios de los clientes</h2>
				<button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
					Ver disponibilidad
				</button>
			</div>

			<!-- Overall Rating -->
			<div class="flex items-center gap-3 mb-6">
				<div class="bg-blue-800 text-white text-xl font-bold px-3 py-2 rounded-tl-lg rounded-tr-lg rounded-br-lg">
					{overallRating?.score || '9,2'}
				</div>
				<div>
					<span class="font-bold text-gray-900">{overallRating?.description || 'Fantástico'}</span>
					<span class="text-gray-600"> · {overallRating?.totalReviews || '624'} comentarios</span>
					<span class="text-blue-600 hover:underline ml-2 cursor-pointer">Leer todos los comentarios</span>
				</div>
			</div>

			<!-- Categories -->
			<div class="mb-8">
				<h3 class="font-bold text-gray-900 mb-4">Categorías:</h3>
				
				<div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
					{#each categoryRatings as category}
						<div class="flex items-center gap-3">
							<div class="flex-1">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium text-gray-900 flex items-center gap-1">
										{category.name}
										{#if category.isHigh}
											<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
												<path d="M10 3l7 7-7 7V3z" transform="rotate(-90 10 10)"/>
											</svg>
										{:else}
											<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
												<path d="M10 3l7 7-7 7V3z" transform="rotate(90 10 10)"/>
											</svg>
										{/if}
									</span>
									<span class="text-sm font-bold text-gray-900">{category.score}</span>
								</div>
								<div class="w-full bg-gray-200 rounded-full h-2">
									<div class="rating-bar {Math.random() > 0.5 ? 'bg-green-600' : 'bg-blue-800'}" style="width: {category.percentage}%"></div>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- Score indicators -->
				<div class="flex items-center gap-6 mt-4 text-sm">
					<div class="flex items-center gap-2">
						<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
							<path d="M10 3l7 7-7 7V3z" transform="rotate(-90 10 10)"/>
						</svg>
						<span class="text-gray-700">Puntuación alta para {getCityTrans(hotelData)}</span>
					</div>
					<div class="flex items-center gap-2">
						<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
							<path d="M10 3l7 7-7 7V3z" transform="rotate(90 10 10)"/>
						</svg>
						<span class="text-gray-700">Puntuación baja para {getCityTrans(hotelData)}</span>
					</div>
				</div>
			</div>

			<!-- Topic Filters -->
			<div class="mb-8">
				<h3 class="font-bold text-gray-900 mb-4">Elige los temas de los comentarios:</h3>
				<div class="flex flex-wrap gap-3">
					<button class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:border-blue-600 hover:bg-blue-50 transition">
						<span class="text-xl">+</span>
						<span class="text-sm font-medium">Desayuno</span>
					</button>
					<button class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:border-blue-600 hover:bg-blue-50 transition">
						<span class="text-xl">+</span>
						<span class="text-sm font-medium">Ubicacion</span>
					</button>
					<button class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:border-blue-600 hover:bg-blue-50 transition">
						<span class="text-xl">+</span>
						<span class="text-sm font-medium">Piscina</span>
					</button>
					<button class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:border-blue-600 hover:bg-blue-50 transition">
						<span class="text-xl">+</span>
						<span class="text-sm font-medium">Baño</span>
					</button>
					<button class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:border-blue-600 hover:bg-blue-50 transition">
						<span class="text-xl">+</span>
						<span class="text-sm font-medium">Restaurante</span>
					</button>
				</div>
			</div>

			<!-- Reviews Section -->
			<div class="mb-6">
				<h3 class="font-bold text-gray-900 mb-4">Lo que más gustó a quienes se alojaron aquí</h3>
				
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					{#each userReviews as review, index}
						<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
							<div class="flex items-center gap-3 mb-3">
								<div class="w-10 h-10 rounded-full {index === 0 ? 'bg-gradient-to-br from-orange-400 to-pink-500' : index === 1 ? 'bg-green-600' : 'bg-gradient-to-br from-blue-400 to-purple-500'} flex items-center justify-center text-white font-bold">
									{review.avatar}
								</div>
								<div>
									<div class="font-bold text-gray-900">{review.name}</div>
									<div class="flex items-center gap-1 text-xs text-gray-600">
										<span class="text-base">🇨🇴</span>
										<span>{review.country}</span>
									</div>
								</div>
							</div>
							<p class="text-sm text-gray-700 mb-3">
								"{review.comment}"
							</p>
							<span class="text-blue-600 text-sm font-medium hover:underline cursor-pointer">Más info</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Read All Reviews Button -->
			<div class="text-left">
				<button class="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-50 transition">
					Leer todos los comentarios
				</button>
			</div>
		</div>
	</div>

	<!-- Normas de la casa -->
	<div class="max-w-7xl mx-auto px-4 py-8">
		<div class="bg-white rounded-lg shadow-sm">
			<!-- Header -->
			<div class="border-b border-gray-200 p-6 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
				<div>
					<h1 class="text-2xl font-bold text-gray-900 mb-2">Normas de la casa</h1>
					<p class="text-sm text-gray-600">{getHotelNameForTitle(hotelData)} acepta peticiones especiales. ¡Añádelas en el siguiente paso!</p>
				</div>
				<button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium text-sm whitespace-nowrap w-full md:w-auto md:ml-4 md:self-auto">
					Ver disponibilidad
				</button>
			</div>

			<!-- Rules Content -->
			<div class="p-6 space-y-6">
				<!-- Check-in -->
				<div class="flex gap-4">
					<div class="flex-shrink-0 mt-1">
						<div class="icon-circle">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
							</svg>
						</div>
					</div>
					<div class="flex-1">
						<h3 class="font-bold text-gray-900 mb-2">Entrada</h3>
						<p class="text-sm mb-2"><span class="font-semibold">Desde las 16:00</span></p>
						<p class="text-sm text-gray-700 mb-1">Los clientes deben mostrar un documento de identidad con fotografía y una tarjeta de crédito válida en el momento de hacer el check-in.</p>
						<p class="text-sm text-gray-700">Tienes que decirle al alojamiento con antelación a qué hora vas a llegar.</p>
					</div>
				</div>

				<!-- Check-out -->
				<div class="flex gap-4 pt-6 border-t border-gray-200">
					<div class="flex-shrink-0 mt-1">
						<div class="icon-circle">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
							</svg>
						</div>
					</div>
					<div class="flex-1">
						<h3 class="font-bold text-gray-900 mb-2">Salida</h3>
						<p class="text-sm"><span class="font-semibold">Hasta las 12:00</span></p>
					</div>
				</div>

				<!-- Cancellation -->
				<div class="flex gap-4 pt-6 border-t border-gray-200">
					<div class="flex-shrink-0 mt-1">
						<div class="icon-circle">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
						</div>
					</div>
					<div class="flex-1">
						<h3 class="font-bold text-gray-900 mb-2">Cancelación / prepago</h3>
						<p class="text-sm text-gray-700">Las condiciones de cancelación y pago por adelantado pueden variar según el tipo de alojamiento. Consulta las <span class="text-blue-600 hover:underline cursor-pointer">condiciones</span> que puede tener cada opción cuando la elijas.</p>
					</div>
				</div>

				<!-- Children -->
				<div class="flex gap-4 pt-6 border-t border-gray-200">
					<div class="flex-shrink-0 mt-1">
						<div class="icon-circle">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
							</svg>
						</div>
					</div>
					<div class="flex-1">
						<h3 class="font-bold text-gray-900 mb-3">Camas para niños</h3>
						
						<h4 class="font-semibold text-gray-900 mb-3">Condiciones para estancias con niños</h4>
						
						<p class="text-sm text-gray-700 mb-2">Se pueden alojar niños de cualquier edad.</p>
						
						<p class="text-sm text-gray-700 mb-2">Los niños a partir de 18 años pagan como adultos en este alojamiento.</p>
						
						<p class="text-sm text-gray-700 mb-4">Para ver la información correcta sobre precios y ocupación, añade a la búsqueda el número de niños con los que viajas y sus edades.</p>
						
						<h4 class="font-semibold text-gray-900 mb-3">Condiciones sobre cunas y camas supletorias</h4>
						
						<div class="bg-gray-50 border border-gray-200 rounded mb-3">
							<div class="p-3 border-b border-gray-200">
								<p class="text-sm font-semibold text-gray-900">0 - 2 años</p>
							</div>
							<div class="p-3 flex justify-between items-center">
								<div class="flex items-center gap-2">
									<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
									</svg>
									<span class="text-sm text-gray-700">Cuna a petición</span>
								</div>
								<span class="text-sm font-semibold text-gray-900">US$20 por niño y noche</span>
							</div>
						</div>
						
						<p class="text-sm text-gray-700 mb-2">El precio de las cunas no está incluido en el precio total y se tiene que pagar por separado durante la estancia.</p>
						
						<p class="text-sm text-gray-700 mb-2">El número de cunas permitido depende de la opción que escojas. Consulta la opción que has escogido para saber más.</p>
						
						<p class="text-sm text-gray-700 mb-2">No hay camas supletorias disponibles en este alojamiento.</p>
						
						<p class="text-sm text-gray-700">Todas las cunas están sujetas a disponibilidad.</p>
					</div>
				</div>

				<!-- Age Restriction -->
				<div class="flex gap-4 pt-6 border-t border-gray-200">
					<div class="flex-shrink-0 mt-1">
						<div class="icon-circle">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
							</svg>
						</div>
					</div>
					<div class="flex-1">
						<h3 class="font-bold text-gray-900 mb-2">Restricción por edad</h3>
						<p class="text-sm text-gray-700">Edad mínima para el check-in: 18</p>
					</div>
				</div>

				<!-- Pets -->
				<div class="flex gap-4 pt-6 border-t border-gray-200">
					<div class="flex-shrink-0 mt-1">
						<div class="icon-circle">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
						</div>
					</div>
					<div class="flex-1">
						<h3 class="font-bold text-gray-900 mb-2">Mascotas</h3>
						<p class="text-sm text-gray-700">No se admiten.</p>
					</div>
				</div>

				<!-- Groups -->
				<div class="flex gap-4 pt-6 border-t border-gray-200">
					<div class="flex-shrink-0 mt-1">
						<div class="icon-circle">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
							</svg>
						</div>
					</div>
					<div class="flex-1">
						<h3 class="font-bold text-gray-900 mb-2">Grupos</h3>
						<p class="text-sm text-gray-700">Al reservar más de 6 habitaciones, podrán aplicarse condiciones especiales y suplementos.</p>
					</div>
				</div>

				<!-- Payment Methods -->
				<div class="flex gap-4 pt-6 border-t border-gray-200">
					<div class="flex-shrink-0 mt-1">
						<div class="icon-circle">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
							</svg>
						</div>
					</div>
					<div class="flex-1">
						<h3 class="font-bold text-gray-900 mb-3">Tarjetas aceptadas en este hotel</h3>
						<div class="flex items-center gap-3 flex-wrap">
							<div class="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
							<div class="w-12 h-8 bg-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
							<div class="w-12 h-8 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
							<div class="w-12 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">DC</div>
							<div class="w-12 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">MAE</div>
							<span class="text-sm text-gray-700 ml-2 px-3 py-1 border border-gray-300 rounded">No se acepta efectivo</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Info -->
	<div class="max-w-7xl mx-auto px-4 py-8">
		<!-- Header Section -->
		<div class="flex justify-between items-start mb-6">
			<div>
				<h1 class="text-2xl font-bold text-gray-900 mb-1">A tener en cuenta</h1>
				<p class="text-sm text-gray-600">Información importante sobre el alojamiento</p>
			</div>
			<button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded text-sm whitespace-nowrap">
				Ver disponibilidad
			</button>
		</div>

		<!-- Important Information Box -->
		<div class="bg-white border border-gray-300 rounded p-6">
			<div class="space-y-4 text-sm text-gray-800 leading-relaxed">
				<p>
					Se pueden aplicar suplementos en concepto de IVA según la nacionalidad. Se aceptan exenciones, que deben presentarse a las autoridades locales.
				</p>
				
				<p>
					Los huéspedes deberán mostrar un <span class="text-blue-600 hover:underline cursor-pointer">documento de identidad</span> válido y una <span class="text-blue-600 hover:underline cursor-pointer">tarjeta de crédito</span> al realizar el registro de entrada. Ten en cuenta que todas las <span class="text-blue-600 hover:underline cursor-pointer">peticiones especiales</span> están sujetas a disponibilidad y pueden comportar suplementos.
				</p>
				
				<p>
					Informa a {getHotelNameForTitle(hotelData)} con antelación de tu hora prevista de llegada. Para ello, puedes utilizar el <span class="text-blue-600 hover:underline cursor-pointer">apartado de peticiones especiales</span> al hacer la reserva o ponerte en <span class="text-blue-600 hover:underline cursor-pointer">contacto directamente con el alojamiento</span>. Los datos de contacto aparecen en la <span class="text-blue-600 hover:underline cursor-pointer">confirmación de la reserva</span>.
				</p>
				
				<p class="text-gray-700">
					Número de licencia: 36760
				</p>
			</div>
		</div>
	</div>
	{/if}
</main>

<Footer />
<Footer />