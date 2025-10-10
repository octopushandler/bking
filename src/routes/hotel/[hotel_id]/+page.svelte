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
	import { HotelDetailsService } from '$lib/services/hotelDetailsService';

	// Estado para controlar el colapso de las opciones de habitación
	let showRoomOptions = true;

	// Fotos dinámicas desde la API
	$: fotos = $hotelDetailsStore.hotelPhotos?.map(photo => ({
		src: photo.url_max,
		alt: photo.tags?.[0]?.tag || 'Hotel'
	})) || [
		// Fotos placeholder cuando no hay datos de la API
		{ src: '---', alt: '---' },
		{ src: '---', alt: '---' },
		{ src: '---', alt: '---' },
		{ src: '---', alt: '---' },
		{ src: '---', alt: '---' },
		{ src: '---', alt: '---' },
		{ src: '---', alt: '---' },
		{ src: '---', alt: '---' }
	];

	// Cargar datos del hotel al montar el componente
	onMount(async () => {
		const hotelId = parseInt($page.params.hotel_id);
		const checkinDate = $page.url.searchParams.get('checkin_date') || '2026-01-31';
		const checkoutDate = $page.url.searchParams.get('checkout_date') || '2026-02-01';
		const adults = parseInt($page.url.searchParams.get('adults_number')) || 2;
		const children = parseInt($page.url.searchParams.get('children_number')) || 0;

		if (hotelId) {
			// Limpiar el store antes de cargar nuevos datos
			hotelDetailsStore.clearData();
			await HotelDetailsService.loadHotelData(hotelId, checkinDate, checkoutDate, adults, children);
		}
	});

	// Limpiar store cuando cambie el hotel_id
	$: if ($page.params.hotel_id) {
		const newHotelId = parseInt($page.params.hotel_id);
		if (newHotelId && newHotelId !== $hotelDetailsStore.searchParams?.hotelId) {
			// Limpiar store cuando cambie el hotel
			hotelDetailsStore.clearData();
		}
	}

	// Variables reactivas para el header
	$: hotelName = $hotelDetailsStore.hotelDetails?.hotel_name || '---';
	
	$: hotelAddress = (() => {
		const details = $hotelDetailsStore.hotelDetails;
		if (details) {
			return `${details.hotel_address_line} - <a href="#" class="text-blue-600 hover:underline font-semibold">Excelente ubicación - Ver en el mapa</a>`;
		}
		return '--- - <a href="#" class="text-blue-600 hover:underline font-semibold">--- - Ver en el mapa</a>';
	})();
	
	$: starRating = (() => {
		const details = $hotelDetailsStore.hotelDetails;
		// Usar class (número de estrellas) o class_is_estimated como fallback
		return details?.class ? HotelDetailsService.generateStarRating(details.class) : '---';
	})();
	
	$: distanceToCenter = (() => {
		const details = $hotelDetailsStore.hotelDetails;
		if (details && details.distance_to_cc) {
			return HotelDetailsService.getDistanceToCenter(details.distance_to_cc);
		}
		return '---';
	})();

	// Variables reactivas adicionales para otros datos dinámicos
	$: hotelDescription = $hotelDetailsStore.hotelDescription?.description || 'Descripción no disponible';
	$: hotelFacilities = $hotelDetailsStore.hotelDetails?.facilities_block?.facilities || [];
	$: topBenefits = $hotelDetailsStore.hotelDetails?.top_ufi_benefits || [];
	$: isLoading = $hotelDetailsStore.loading;
	$: hasError = $hotelDetailsStore.error;
</script>

<svelte:head>
	<title>{hotelName} - Booking</title>
	<meta name="description" content="Detalles completos del hotel {hotelName}" />
</svelte:head>

<!-- Header completo con SearchForm -->
<Header>
	<Navbar />
	<Hero showText={false}>
		<SearchForm/>
	</Hero>
</Header>

<!-- Contenido principal -->
<main class="min-h-screen max-w-[1100px] mx-auto mt-[20px]">
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
		<div class="text-xs gap-2 flex flex-row justify-start items-center mb-4">
			<a href="#" class="text-blue-600 hover:underline">Inicio</a>
			<span>></span>
			<a href="#" class="text-blue-600 hover:underline">Hoteles</a>
			<span>></span>
			<a href="#" class="text-blue-600 hover:underline">Colombia</a>
			<span>></span>
			<a href="#" class="text-blue-600 hover:underline">Cundinamarca</a>
			<span>></span>
			<a href="#" class="text-blue-600 hover:underline">Bogotá</a>
			<span>></span>
			<span>Ofertas en el Hotel Plaza Real (Hotel) (Colombia)</span>
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
		<div class="flex flex-row justify-between items-start">
			<div class="flex flex-col gap-2">
				<img src="/assets/hotel/stars.png" alt="Stars" class="w-[180px] object-contain">
				<p class="text-3xl font-bold">{hotelName}</p>
				<div class="flex flex-row gap-2 items-end text-sm">
					<img src="/assets/hotel/location.png" alt="Map" class="w-[15px] object-contain">
					<p>{@html hotelAddress}</p>
				</div>
			</div>
			<div class="flex flex-col gap-5 items-end justify-end">
				<div class="flex flex-row gap-5 items-center">
					<img src="/assets/hotel/share_heart.png" alt="Hotel" class="w-[90px] object-contain">
					<button class="bg-[#006CE4] text-white px-4 py-2 rounded-lg font-semibold text-sm">Reserva ahora</button>
				</div>
				<div class="flex flex-row gap-3 items-center">
					<img src="/assets/hotel/tag.png" alt="Equal Price" class="w-[20px] object-contain">
					<a href="#" class="text-blue-600 hover:underline font-semibold text-sm">Igualamos el precio</a>
				</div>
			</div>
		</div>

		<!-- Gallery -->
		<div class="mt-8">
			<!-- Galería para desktop -->
			<ImageGalleryDesktop images={fotos} />
			
			<!-- Galería para mobile -->
			<ImageGalleryMobile images={fotos} />
		</div>

		<!-- Description & Main specs -->
		<div class="grid grid-cols-4 w-full mt-8">
			<div class="col-span-3 flex flex-col gap-4">
				<div class="text-sm text-gray-900 whitespace-pre-line">{hotelDescription}</div>
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
			<div class="col-span-1 bg-[#f0f6ff] p-4 rounded-lg">
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

				<button class="w-full bg-[#006CE4] text-white px-4 py-2 rounded-md font-semibold text-sm">Reserva ahora</button>
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
					checkInDate: $page.url.searchParams.get('checkin_date') || '',
					checkOutDate: $page.url.searchParams.get('checkout_date') || '',
					adults: parseInt($page.url.searchParams.get('adults_number')) || 2,
					children: parseInt($page.url.searchParams.get('children_number')) || 0,
					rooms: parseInt($page.url.searchParams.get('room_number')) || 1,
					pets: false
				}}
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
			<div class="overflow-x-auto">
				<table class="w-full border-collapse">
					<!-- Encabezados -->
					<thead>
						<tr class="bg-blue-600 text-white">
							<th class="text-left p-3 font-semibold text-sm border-r border-blue-500">Tipo de habitación</th>
							<th class="text-left p-3 font-semibold text-sm border-r border-blue-500">Número de personas</th>
							<th class="text-left p-3 font-semibold text-sm border-r border-blue-500">Precio para 2 noches</th>
							<th class="text-left p-3 font-semibold text-sm border-r border-blue-500">Tus opciones</th>
							<th class="text-left p-3 font-semibold text-sm">Seleccionar habitaciones</th>
						</tr>
					</thead>
					<tbody>
						<!-- Habitación 1 - Primera variación -->
						<tr class="border-b border-gray-200">
							<!-- Columna de tipo de habitación con rowspan=3 -->
							<td rowspan="3" class="p-4 border-r border-gray-200 align-top bg-gray-50">
								<div class="space-y-3">
									<a href="#" class="text-blue-600 hover:underline font-semibold text-base">
										Habitación Estándar - Cama extragrande
									</a>
									
									<div class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
										Recomendado para 2 adultos
									</div>
									
									<div class="flex items-center gap-1 text-red-600 text-sm font-semibold">
										<span class="text-lg">🔴</span>
										<span>Nos quedan 6</span>
									</div>
									
									<div class="text-sm text-gray-700">
										1 cama doble extragrande
										<div class="mt-1">🛏️</div>
									</div>
									
									<div class="space-y-2 text-sm text-gray-700">
										<div class="flex items-start gap-2">
											<span>📐</span>
											<span>Habitación</span>
											<span>🔲</span>
											<span>21 m²</span>
										</div>
										<div class="flex items-start gap-2">
											<span>🏙️</span>
											<span>Vista a la ciudad</span>
										</div>
										<div class="flex items-start gap-2">
											<span>❄️</span>
											<span>Aire acondicionado</span>
										</div>
										<div class="flex items-start gap-2">
											<span>🚿</span>
											<span>Baño en la habitación</span>
										</div>
										<div class="flex items-start gap-2">
											<span>📺</span>
											<span>TV de pantalla plana</span>
										</div>
										<div class="flex items-start gap-2">
											<span>☕</span>
											<span>Cafetera</span>
										</div>
									</div>
									
									<div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 pt-2 border-t border-gray-200">
										<div class="flex items-center gap-1"><span class="checkmark"></span> Artículos de aseo gratis</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Bañera o ducha</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Caja fuerte</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Suelo de madera o parquet</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Toallas</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Ropa de cama</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Enchufe cerca de la cama</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Escritorio</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> TV</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Nevera</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Teléfono</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Utensilios de planchado</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Plancha para ropa</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Radio</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Secador de pelo</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Camas extralargas (más de 2 metros)</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Servicio de despertador / alarma</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Canales por cable</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Servicio de despertador</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Reloj despertador</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Armario</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Acceso a pisos superiores en ascensor</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Acceso a pisos superiores solo mediante escaleras</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Papel higiénico</div>
									</div>
								</div>
							</td>
							
							<!-- Variación 1 -->
							<td class="p-4 border-r border-gray-200 align-top">
								<div class="flex items-center gap-1">
									<span>👤</span>
									<span>👤</span>
								</div>
							</td>
							<td class="p-4 border-r border-gray-200 align-top">
								<div class="font-bold text-lg text-gray-900">COP 487.080</div>
								<div class="text-xs text-gray-600 mt-1">+ COP 92.560 de impuestos y cargos</div>
							</td>
							<td class="p-4 border-r border-gray-200 align-top">
								<div class="space-y-2 text-sm">
									<div class="flex items-start gap-2">
										<span class="text-green-600">🍽️</span>
										<div>
											<span class="font-semibold text-green-600">Desayuno</span>
											<span class="text-gray-600"> incluido (Muy bueno)</span>
										</div>
									</div>
									<div class="flex items-start gap-2">
										<span class="checkmark"></span>
										<div>
											<span class="font-semibold text-green-600">Cancelación gratis</span>
											<span class="text-gray-600"> antes del 28 de octubre de 2025</span>
										</div>
									</div>
									<div class="text-gray-600">
										• Pagas al alojamiento antes de llegar
									</div>
									<div class="flex items-start gap-2 text-blue-600">
										<span>🏷️</span>
										<span><strong>Genius</strong> Puede haber descuento</span>
									</div>
								</div>
							</td>
							<td class="p-4 align-top">
								<div class="space-y-3">
									<select class="border border-gray-300 rounded px-3 py-2 w-20">
										<option>0</option>
										<option>1</option>
										<option>2</option>
										<option>3</option>
									</select>
									<button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
										Reservaré
									</button>
									<div class="text-xs text-gray-600">
										• Todavía no se te cobrará nada
									</div>
								</div>
							</td>
						</tr>
						
						<!-- Habitación 1 - Segunda variación -->
						<tr class="border-b border-gray-200">
							<td class="p-4 border-r border-gray-200 align-top">
								<div class="flex items-center gap-1">
									<span>👤</span>
									<span>👤</span>
								</div>
							</td>
							<td class="p-4 border-r border-gray-200 align-top">
								<div class="font-bold text-lg text-gray-900">COP 608.860</div>
								<div class="text-xs text-gray-600 mt-1">+ COP 115.680 de impuestos y cargos</div>
							</td>
							<td class="p-4 border-r border-gray-200 align-top">
								<div class="space-y-2 text-sm">
									<div class="flex items-start gap-2">
										<span class="text-green-600">🍽️</span>
										<div>
											<span class="font-semibold text-green-600">Desayuno</span>
											<span class="text-gray-600"> incluido (Muy bueno)</span>
										</div>
									</div>
									<div class="flex items-start gap-2">
										<span class="checkmark"></span>
										<div>
											<span class="font-semibold text-green-600">Cancelación gratis</span>
											<span class="text-gray-600"> antes de las 16:00 del 3 de noviembre de 2025</span>
										</div>
									</div>
									<div class="flex items-start gap-2">
										<span class="checkmark"></span>
										<div>
											<span class="font-semibold text-green-600">Sin pago por adelantado</span>
											<span class="text-gray-600"> - Pagarás en el alojamiento</span>
										</div>
									</div>
									<div class="flex items-start gap-2 text-blue-600">
										<span>🏷️</span>
										<span><strong>Genius</strong> Puede haber descuento</span>
									</div>
								</div>
							</td>
							<td class="p-4 align-top">
								<div class="space-y-3">
									<select class="border border-gray-300 rounded px-3 py-2 w-20">
										<option>0</option>
										<option>1</option>
										<option>2</option>
										<option>3</option>
									</select>
								</div>
							</td>
						</tr>
						
						<!-- Habitación 1 - Tercera variación -->
						<tr class="border-b border-gray-200">
							<td class="p-4 border-r border-gray-200 align-top">
								<div class="flex items-center gap-1">
									<span>👤</span>
									<span>👤</span>
								</div>
							</td>
							<td class="p-4 border-r border-gray-200 align-top">
								<div class="font-bold text-lg text-gray-900">COP 547.200</div>
								<div class="text-xs text-gray-600 mt-1">+ COP 103.980 de impuestos y cargos</div>
							</td>
							<td class="p-4 border-r border-gray-200 align-top">
								<div class="space-y-2 text-sm">
									<div class="flex items-start gap-2">
										<span class="text-green-600">🍽️</span>
										<div>
											<span class="font-semibold text-green-600">Desayuno</span>
											<span class="text-gray-600"> incluido (Muy bueno)</span>
										</div>
									</div>
									<div class="flex items-start gap-2">
										<span class="checkmark"></span>
										<div>
											<span class="font-semibold text-green-600">Incluye un 10% de descuento en comida/bebida</span>
										</div>
									</div>
									<div class="flex items-start gap-2">
										<span class="xmark"></span>
										<div>
											<span class="font-semibold text-red-600">No reembolsable</span>
										</div>
									</div>
									<div class="text-gray-600">
										• Pagas al alojamiento antes de llegar
									</div>
									<div class="flex items-start gap-2 text-blue-600">
										<span>🏷️</span>
										<span><strong>Genius</strong> Puede haber descuento</span>
									</div>
								</div>
							</td>
							<td class="p-4 align-top">
								<div class="space-y-3">
									<select class="border border-gray-300 rounded px-3 py-2 w-20">
										<option>0</option>
										<option>1</option>
										<option>2</option>
										<option>3</option>
									</select>
								</div>
							</td>
						</tr>
						
						<!-- Habitación 2 - Suite Ejecutiva (una sola variación) -->
						<tr class="border-b border-gray-200">
							<!-- Columna de tipo de habitación sin rowspan -->
							<td class="p-4 border-r border-gray-200 align-top bg-gray-50">
								<div class="space-y-3">
									<a href="#" class="text-blue-600 hover:underline font-semibold text-base">
										Suite Ejecutiva - Cama king
									</a>
									
									<div class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
										Recomendado para 2 adultos
									</div>
									
									<div class="flex items-center gap-1 text-red-600 text-sm font-semibold">
										<span class="text-lg">🔴</span>
										<span>Nos quedan 3</span>
									</div>
									
									<div class="text-sm text-gray-700">
										1 cama king
										<div class="mt-1">🛏️</div>
									</div>
									
									<div class="space-y-2 text-sm text-gray-700">
										<div class="flex items-start gap-2">
											<span>📐</span>
											<span>Suite</span>
											<span>🔲</span>
											<span>35 m²</span>
										</div>
										<div class="flex items-start gap-2">
											<span>🏙️</span>
											<span>Vista panorámica a la ciudad</span>
										</div>
										<div class="flex items-start gap-2">
											<span>❄️</span>
											<span>Aire acondicionado</span>
										</div>
										<div class="flex items-start gap-2">
											<span>🚿</span>
											<span>Baño en la habitación</span>
										</div>
										<div class="flex items-start gap-2">
											<span>📺</span>
											<span>TV de pantalla plana 55"</span>
										</div>
										<div class="flex items-start gap-2">
											<span>☕</span>
											<span>Minibar</span>
										</div>
										<div class="flex items-start gap-2">
											<span>🛋️</span>
											<span>Área de estar</span>
										</div>
									</div>
									
									<div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 pt-2 border-t border-gray-200">
										<div class="flex items-center gap-1"><span class="checkmark"></span> Artículos de aseo gratis</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Bañera de hidromasaje</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Caja fuerte</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Suelo de madera o parquet</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Toallas</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Ropa de cama premium</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Enchufe cerca de la cama</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Escritorio ejecutivo</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> TV</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Minibar</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Teléfono</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Utensilios de planchado</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Plancha para ropa</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Radio</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Secador de pelo</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Camas extralargas (más de 2 metros)</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Servicio de despertador / alarma</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Canales por cable</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Servicio de despertador</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Reloj despertador</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Armario</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Acceso a pisos superiores en ascensor</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Acceso a pisos superiores solo mediante escaleras</div>
										<div class="flex items-center gap-1"><span class="checkmark"></span> Papel higiénico</div>
									</div>
								</div>
							</td>
							
							<!-- Variación única -->
							<td class="p-4 border-r border-gray-200 align-top">
								<div class="flex items-center gap-1">
									<span>👤</span>
									<span>👤</span>
								</div>
							</td>
							<td class="p-4 border-r border-gray-200 align-top">
								<div class="font-bold text-lg text-gray-900">COP 892.400</div>
								<div class="text-xs text-gray-600 mt-1">+ COP 169.560 de impuestos y cargos</div>
							</td>
							<td class="p-4 border-r border-gray-200 align-top">
								<div class="space-y-2 text-sm">
									<div class="flex items-start gap-2">
										<span class="text-green-600">🍽️</span>
										<div>
											<span class="font-semibold text-green-600">Desayuno</span>
											<span class="text-gray-600"> incluido (Excelente)</span>
										</div>
									</div>
									<div class="flex items-start gap-2">
										<span class="checkmark"></span>
										<div>
											<span class="font-semibold text-green-600">Cancelación gratis</span>
											<span class="text-gray-600"> antes del 30 de octubre de 2025</span>
										</div>
									</div>
									<div class="flex items-start gap-2">
										<span class="checkmark"></span>
										<div>
											<span class="font-semibold text-green-600">Sin pago por adelantado</span>
											<span class="text-gray-600"> - Pagarás en el alojamiento</span>
										</div>
									</div>
									<div class="flex items-start gap-2">
										<span class="checkmark"></span>
										<div>
											<span class="font-semibold text-green-600">Acceso gratuito al club lounge</span>
										</div>
									</div>
									<div class="flex items-start gap-2 text-blue-600">
										<span>🏷️</span>
										<span><strong>Genius</strong> Puede haber descuento</span>
									</div>
								</div>
							</td>
							<td class="p-4 align-top">
								<div class="space-y-3">
									<select class="border border-gray-300 rounded px-3 py-2 w-20">
										<option>0</option>
										<option>1</option>
										<option>2</option>
										<option>3</option>
									</select>
									<button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
										Reservaré
									</button>
									<div class="text-xs text-gray-600">
										• Todavía no se te cobrará nada
									</div>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		
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
					9,0
				</div>
				<div>
					<span class="font-bold text-gray-900">Fantástico</span>
					<span class="text-gray-600"> · 624 comentarios</span>
					<a href="#" class="text-blue-600 hover:underline ml-2">Leer todos los comentarios</a>
				</div>
			</div>

			<!-- Categories -->
			<div class="mb-8">
				<h3 class="font-bold text-gray-900 mb-4">Categorías:</h3>
				
				<div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
					<!-- Personal -->
					<div class="flex items-center gap-3">
						<div class="flex-1">
							<div class="flex items-center justify-between mb-1">
								<span class="text-sm font-medium text-gray-900 flex items-center gap-1">
									Personal
									<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
										<path d="M10 3l7 7-7 7V3z" transform="rotate(-90 10 10)"/>
									</svg>
								</span>
								<span class="text-sm font-bold text-gray-900">9,4</span>
							</div>
							<div class="w-full bg-gray-200 rounded-full h-2">
								<div class="rating-bar bg-green-600" style="width: 94%"></div>
							</div>
						</div>
					</div>

					<!-- Instalaciones y servicios -->
					<div class="flex items-center gap-3">
						<div class="flex-1">
							<div class="flex items-center justify-between mb-1">
								<span class="text-sm font-medium text-gray-900">Instalaciones y servicios</span>
								<span class="text-sm font-bold text-gray-900">9,0</span>
							</div>
							<div class="w-full bg-gray-200 rounded-full h-2">
								<div class="rating-bar bg-blue-700" style="width: 90%"></div>
							</div>
						</div>
					</div>

					<!-- Limpieza -->
					<div class="flex items-center gap-3">
						<div class="flex-1">
							<div class="flex items-center justify-between mb-1">
								<span class="text-sm font-medium text-gray-900">Limpieza</span>
								<span class="text-sm font-bold text-gray-900">9,3</span>
							</div>
							<div class="w-full bg-gray-200 rounded-full h-2">
								<div class="rating-bar bg-green-600" style="width: 93%"></div>
							</div>
						</div>
					</div>

					<!-- Confort -->
					<div class="flex items-center gap-3">
						<div class="flex-1">
							<div class="flex items-center justify-between mb-1">
								<span class="text-sm font-medium text-gray-900">Confort</span>
								<span class="text-sm font-bold text-gray-900">9,3</span>
							</div>
							<div class="w-full bg-gray-200 rounded-full h-2">
								<div class="rating-bar bg-blue-700" style="width: 93%"></div>
							</div>
						</div>
					</div>

					<!-- Relación calidad-precio -->
					<div class="flex items-center gap-3">
						<div class="flex-1">
							<div class="flex items-center justify-between mb-1">
								<span class="text-sm font-medium text-gray-900">Relación calidad-precio</span>
								<span class="text-sm font-bold text-gray-900">8,7</span>
							</div>
							<div class="w-full bg-gray-200 rounded-full h-2">
								<div class="rating-bar bg-blue-700" style="width: 87%"></div>
							</div>
						</div>
					</div>

					<!-- Ubicación -->
					<div class="flex items-center gap-3">
						<div class="flex-1">
							<div class="flex items-center justify-between mb-1">
								<span class="text-sm font-medium text-gray-900 flex items-center gap-1">
									Ubicación
									<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
										<path d="M10 3l7 7-7 7V3z" transform="rotate(-90 10 10)"/>
									</svg>
								</span>
								<span class="text-sm font-bold text-gray-900">9,6</span>
							</div>
							<div class="w-full bg-gray-200 rounded-full h-2">
								<div class="rating-bar bg-green-600" style="width: 96%"></div>
							</div>
						</div>
					</div>

					<!-- WiFi gratis -->
					<div class="flex items-center gap-3">
						<div class="flex-1">
							<div class="flex items-center justify-between mb-1">
								<span class="text-sm font-medium text-gray-900 flex items-center gap-1">
									WiFi gratis
									<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
										<path d="M10 3l7 7-7 7V3z" transform="rotate(90 10 10)"/>
									</svg>
								</span>
								<span class="text-sm font-bold text-gray-900">7,4</span>
							</div>
							<div class="w-full bg-gray-200 rounded-full h-2">
								<div class="rating-bar bg-red-600" style="width: 74%"></div>
							</div>
						</div>
					</div>
				</div>

				<!-- Score indicators -->
				<div class="flex items-center gap-6 mt-4 text-sm">
					<div class="flex items-center gap-2">
						<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
							<path d="M10 3l7 7-7 7V3z" transform="rotate(-90 10 10)"/>
						</svg>
						<span class="text-gray-700">Puntuación alta para Yopal</span>
					</div>
					<div class="flex items-center gap-2">
						<svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
							<path d="M10 3l7 7-7 7V3z" transform="rotate(90 10 10)"/>
						</svg>
						<span class="text-gray-700">Puntuación baja para Yopal</span>
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
					<!-- Review Card 1 -->
					<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
						<div class="flex items-center gap-3 mb-3">
							<div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold">
								R
							</div>
							<div>
								<div class="font-bold text-gray-900">Rendón</div>
								<div class="flex items-center gap-1 text-xs text-gray-600">
									<span class="text-base">🇨🇴</span>
									<span>Colombia</span>
								</div>
							</div>
						</div>
						<p class="text-sm text-gray-700 mb-3">
							"Únicamente hicimos uso de las instalaciones básicas. Encontramos excelente el hotel y es nuestra segunda visita. Esperamos regresar pronto. Muchas gracias."
						</p>
						<a href="#" class="text-blue-600 text-sm font-medium hover:underline">Más info</a>
					</div>

					<!-- Review Card 2 -->
					<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
						<div class="flex items-center gap-3 mb-3">
							<div class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
								P
							</div>
							<div>
								<div class="font-bold text-gray-900">Pilar</div>
								<div class="flex items-center gap-1 text-xs text-gray-600">
									<span class="text-base">🇨🇴</span>
									<span>Colombia</span>
								</div>
							</div>
						</div>
						<p class="text-sm text-gray-700 mb-3">
							"todo absolutamente todo. ubicación estratégica. el desayuno más que delicioso y sus colaboradores los mejores..."
						</p>
						<a href="#" class="text-blue-600 text-sm font-medium hover:underline">Más info</a>
					</div>

					<!-- Review Card 3 -->
					<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
						<div class="flex items-center gap-3 mb-3">
							<div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
								C
							</div>
							<div>
								<div class="font-bold text-gray-900">Carlos</div>
								<div class="flex items-center gap-1 text-xs text-gray-600">
									<span class="text-base">🇨🇴</span>
									<span>Colombia</span>
								</div>
							</div>
						</div>
						<p class="text-sm text-gray-700 mb-3">
							"Un excelente lugar para ir de paseo o descanso. las instalaciones, la ubicación, la amabilidad de su gente. Totalmente recomendado .una muy buena experiencia Muchas gracias por todo."
						</p>
						<a href="#" class="text-blue-600 text-sm font-medium hover:underline">Más info</a>
					</div>
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
			<div class="border-b border-gray-200 p-6 flex justify-between items-start">
				<div>
					<h1 class="text-2xl font-bold text-gray-900 mb-2">Normas de la casa</h1>
					<p class="text-sm text-gray-600">Holiday Inn Express Yopal by IHG acepta peticiones especiales. ¡Añádelas en el siguiente paso!</p>
				</div>
				<button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium text-sm whitespace-nowrap ml-4">
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
						<p class="text-sm text-gray-700">Las condiciones de cancelación y pago por adelantado pueden variar según el tipo de alojamiento. Consulta las <a href="#" class="text-blue-600 hover:underline">condiciones</a> que puede tener cada opción cuando la elijas.</p>
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
					Los huéspedes deberán mostrar un <a href="#" class="text-blue-600 hover:underline">documento de identidad</a> válido y una <a href="#" class="text-blue-600 hover:underline">tarjeta de crédito</a> al realizar el registro de entrada. Ten en cuenta que todas las <a href="#" class="text-blue-600 hover:underline">peticiones especiales</a> están sujetas a disponibilidad y pueden comportar suplementos.
				</p>
				
				<p>
					Informa a Holiday Inn Express Yopal by IHG con antelación de tu hora prevista de llegada. Para ello, puedes utilizar el <a href="#" class="text-blue-600 hover:underline">apartado de peticiones especiales</a> al hacer la reserva o ponerte en <a href="#" class="text-blue-600 hover:underline">contacto directamente con el alojamiento</a>. Los datos de contacto aparecen en la <a href="#" class="text-blue-600 hover:underline">confirmación de la reserva</a>.
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