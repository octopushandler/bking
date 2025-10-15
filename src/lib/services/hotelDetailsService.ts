import { hotelDetailsStore, type HotelDetails, type RoomAvailability, type HotelPhoto, type HotelDescription, type RoomListResponse } from '$lib/stores/hotelDetails';
import { buildHotelDetailsUrl, buildHotelRoomsUrl, BOOKING_API_CONFIG } from '$lib/config/api';
import { fetchWithRetry, handleApiError, fetchWithTimeout } from '$lib/utils/apiHelpers';
import { notificationAPI } from '$lib/stores/notifications';
import { PRICE_DISCOUNT, applyPriceDiscount } from '$lib/config/discount';

export class HotelDetailsService {
	/**
	 * Función para hacer fetch con reintento silencioso (solo 1 reintento)
	 */
	private static async fetchWithSilentRetry(
		url: string,
		options: RequestInit = {},
		timeout: number = 15000
	): Promise<Response> {
		let lastError: Error;
		
		// Primer intento
		try {
			const response = await fetchWithTimeout(url, options, timeout);
			if (response.ok) {
				return response;
			}
			// Si no es exitosa, guardamos el error para el reintento
			lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
		} catch (error) {
			lastError = error as Error;
		}
		
		// Reintento silencioso (solo 1 vez más)
		try {
			// Pequeña pausa antes del reintento
			await new Promise(resolve => setTimeout(resolve, 1000));
			const response = await fetchWithTimeout(url, options, timeout);
			if (response.ok) {
				return response;
			}
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		} catch (error) {
			// Si el reintento también falla, lanzamos el error original
			throw lastError;
		}
	}

	/**
	 * Crea datos básicos de fallback cuando la API de detalles falla
	 */
	private static createFallbackHotelDetails(hotelId: number, checkinDate: string, checkoutDate: string): HotelDetails {
		
		// Crear datos básicos de fallback
		const fallbackDetails: HotelDetails = {
			hotel_id: hotelId,
			hotel_name: `Hotel ${hotelId}`,
			hotel_name_trans: `Hotel ${hotelId}`,
			accommodation_type: 1,
			accommodation_type_name: 'Hotel',
			url: `https://www.booking.com/hotel/${hotelId}`,
			hotel_address_line: 'Dirección no disponible',
			country_trans: 'Colombia',
			countrycode: 'CO',
			district: 'Distrito no disponible',
			district_id: 0,
			ufi: 0,
			distance_to_cc: 0,
			class: 3,
			zip: '00000',
			city: 'Ciudad no disponible',
			city_name_en: 'City not available',
			city_trans: 'Ciudad no disponible',
			city_in_trans: 'en la ciudad no disponible',
			address: 'Dirección no disponible',
			address_trans: 'Dirección no disponible',
			timezone: 'America/Bogota',
			latitude: 4.6097,
			longitude: -74.0817,
			currency_code: 'COP',
			review_nr: 0,
			class_is_estimated: 1,
			hotel_facilities: 'Facilidades no disponibles',
			spoken_languages: ['es'],
			facilities_block: {
				name: 'Facilidades',
				type: 'general',
				facilities: []
			},
			property_highlight_strip: null,
			top_ufi_benefits: [],
			preferences: [],
			block: [],
			composite_price_breakdown: {
				gross_amount: {
					value: 0,
					currency: 'COP',
					amount_rounded: '0',
					amount_unrounded: '0'
				},
				all_inclusive_amount: {
					value: 0,
					currency: 'COP',
					amount_rounded: '0',
					amount_unrounded: '0'
				}
			}
		};

		// Guardar en el store
		hotelDetailsStore.setHotelDetails(fallbackDetails);
		
		// Mostrar notificación informativa
		notificationAPI.info(
			'Información limitada',
			'No se pudieron cargar todos los detalles del hotel. Se mostrará información básica.',
			{ duration: 5000 }
		);

		return fallbackDetails;
	}

	/**
	 * Crea fotos de fallback cuando la API de fotos falla
	 */
	private static createFallbackHotelPhotos(hotelId: number): HotelPhoto[] {
		
		const fallbackPhotos: HotelPhoto[] = [
			{
				photo_id: 1,
				url_max: '/assets/placeholder-hotel.jpg',
				url_square60: '/assets/placeholder-hotel.jpg',
				url_1440: '/assets/placeholder-hotel.jpg',
				tags: []
			}
		];

		hotelDetailsStore.setHotelPhotos(fallbackPhotos);
		return fallbackPhotos;
	}

	/**
	 * Crea descripción de fallback cuando la API de descripción falla
	 */
	private static createFallbackHotelDescription(hotelId: number): HotelDescription {
		
		const fallbackDescription: HotelDescription = {
			description: 'Descripción no disponible temporalmente. Por favor, intente más tarde.',
			languagecode: 'es'
		};

		hotelDetailsStore.setHotelDescription(fallbackDescription);
		return fallbackDescription;
	}

	/**
	 * Crea lista de habitaciones de fallback cuando la API de habitaciones falla
	 */
	private static createFallbackRoomList(
		hotelId: number, 
		checkinDate: string, 
		checkoutDate: string, 
		adults: number, 
		children: number
	): RoomListResponse {
		
		const fallbackRoomList: RoomListResponse = {
			hotel_id: hotelId,
			arrival_date: checkinDate,
			departure_date: checkoutDate,
			currency_code: 'COP',
			cheapest_avail_price_eur: 0,
			total_blocks: 0,
			block: []
		};

		hotelDetailsStore.setRoomList(fallbackRoomList);
		return fallbackRoomList;
	}

	/**
	 * Carga los detalles del hotel desde la API
	 */
	static async loadHotelDetails(hotelId: number, checkinDate: string, checkoutDate: string): Promise<HotelDetails | null> {
		try {
			// Validar si el ID del hotel está dentro del rango soportado por la API
			// if (hotelId > 6576745) {
			// 	console.log(`⚠️ [DETAILS] Hotel ID ${hotelId} excede el límite de la API (6576745)`);
			// 	throw new Error(`Hotel ID ${hotelId} no está disponible en la API. Límite máximo: 6576745`);
			// }
			
			hotelDetailsStore.setLoading(true);
			
			const url = buildHotelDetailsUrl(hotelId, checkinDate, checkoutDate);
			console.log(`🔗 [DETAILS] URL para hotel ${hotelId}:`, url);
			console.log(`📋 [DETAILS] Headers para hotel ${hotelId}:`, BOOKING_API_CONFIG.HEADERS);
			console.log(`🚀 [DETAILS] Iniciando fetch para hotel ${hotelId}...`);
			
			const response = await fetchWithTimeout(url, {
				method: 'GET',
				headers: BOOKING_API_CONFIG.HEADERS
			}, 5000);
			
			console.log(`📡 [DETAILS] Respuesta recibida para hotel ${hotelId}:`, response.status, response.statusText);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			console.log(`📄 [DETAILS] Parseando JSON para hotel ${hotelId}...`);
			const data: HotelDetails = await response.json();
			console.log(`✅ [DETAILS] Datos recibidos para hotel ${hotelId}:`, data ? 'OK' : 'NULL');
			hotelDetailsStore.setHotelDetails(data);
			return data;
			
		} catch (error) {
			// Verificar si es un error de límite de ID
			if (error instanceof Error && error.message.includes('no está disponible en la API')) {
				const errorMessage = `Hotel ID ${hotelId} excede el límite soportado por la API (máximo: 6576745)`;
				
				notificationAPI.error(
					'Hotel no disponible',
					'Este hotel no está disponible en nuestra base de datos. Por favor, selecciona otro hotel.',
					{
						duration: 8000
					}
				);
				
				hotelDetailsStore.setError(errorMessage);
				return null;
			}
			
			const errorMessage = handleApiError(error as any, 'carga de detalles del hotel');
			
			// Mostrar notificación más suave
			notificationAPI.warning(
				'Detalles no disponibles',
				'No se pudieron cargar los detalles del hotel.',
				{
					duration: 6000,
					actions: [
						{
							id: 'retry',
							label: 'Reintentar manualmente',
							action: () => this.loadHotelDetails(hotelId, checkinDate, checkoutDate),
							variant: 'primary'
						}
					]
				}
			);
			
			hotelDetailsStore.setError(errorMessage);
			return null;
		}
	}

	/**
	 * Carga la descripción del hotel desde la API
	 */
	static async loadHotelDescription(hotelId: number, locale: string = 'es-mx'): Promise<HotelDescription | null> {
		try {
			const url = `https://${BOOKING_API_CONFIG.HEADERS['x-rapidapi-host']}/v2/hotels/description?hotel_id=${hotelId}&locale=${locale}`;
			
			const response = await this.fetchWithSilentRetry(url, {
				method: 'GET',
				headers: BOOKING_API_CONFIG.HEADERS
			});

			const data: HotelDescription = await response.json();
			
			hotelDetailsStore.setHotelDescription(data);
			return data;
			
		} catch (error) {
			console.error('Error loading hotel description:', error);
			const errorMessage = handleApiError(error as any, 'carga de descripción del hotel');
			
			notificationAPI.warning(
				'Descripción no disponible',
				'No se pudo cargar la descripción del hotel, se mostrará información por defecto.',
				{ duration: 5000 }
			);
			
			// No marcamos como error crítico, solo mostramos warning
			return null;
		}
	}

	/**
	 * Carga la lista de habitaciones desde la API
	 */
	static async loadRoomList(
		hotelId: number, 
		checkinDate: string, 
		checkoutDate: string, 
		adults: number = 2, 
		children: number = 0,
		locale: string = 'es-mx',
		currency: string = 'COP'
	): Promise<RoomListResponse | null> {
		try {
			// Construir el parámetro de adultos por habitación
			const adultsByRooms = Array(1).fill(adults).join('%2C');
			
			const url = `https://${BOOKING_API_CONFIG.HEADERS['x-rapidapi-host']}/v2/hotels/room-list?units=metric&checkout_date=${checkoutDate}&locale=${locale}&currency=${currency}&hotel_id=${hotelId}&adults_number_by_rooms=${adultsByRooms}&checkin_date=${checkinDate}`;
			
			const response = await this.fetchWithSilentRetry(url, {
				method: 'GET',
				headers: BOOKING_API_CONFIG.HEADERS
			});

			const data: RoomListResponse = await response.json();
			
			hotelDetailsStore.setRoomList(data);
			return data;
			
		} catch (error) {
			console.error('Error loading room list:', error);
			const errorMessage = handleApiError(error as any, 'carga de lista de habitaciones');
			
			notificationAPI.warning(
				'Lista de habitaciones no disponible',
				'No se pudo cargar la lista de habitaciones, se mostrará información por defecto.',
				{ duration: 5000 }
			);
			
			// No marcamos como error crítico, solo mostramos warning
			return null;
		}
	}

	/**
	 * Carga las fotos del hotel desde la API
	 */
	static async loadHotelPhotos(hotelId: number): Promise<HotelPhoto[] | null> {
		try {
			const url = `https://${BOOKING_API_CONFIG.HEADERS['x-rapidapi-host']}/v1/hotels/photos?hotel_id=${hotelId}&locale=es-mx`;
			
			const response = await this.fetchWithSilentRetry(url, {
				method: 'GET',
				headers: BOOKING_API_CONFIG.HEADERS
			});

			const data: HotelPhoto[] = await response.json();
			
			hotelDetailsStore.setHotelPhotos(data);
			return data;
			
		} catch (error) {
			console.error('Error loading hotel photos:', error);
			const errorMessage = handleApiError(error as any, 'carga de fotos del hotel');
			
			notificationAPI.warning(
				'Fotos no disponibles',
				'No se pudieron cargar las fotos del hotel, se mostrarán imágenes por defecto.',
				{ duration: 5000 }
			);
			
			// No marcamos como error crítico, solo mostramos warning
			return null;
		}
	}

	/**
	 * Carga la disponibilidad de habitaciones desde la API
	 */
	static async loadRoomAvailability(
		hotelId: number, 
		checkinDate: string, 
		checkoutDate: string, 
		adults: number = 2, 
		children: number = 0,
		childrenAges: number[] = []
	): Promise<RoomAvailability | null> {
		try {
			hotelDetailsStore.setLoading(true);
			
			const url = buildHotelRoomsUrl(hotelId, checkinDate, checkoutDate, adults, children);
			
			const response = await this.fetchWithSilentRetry(url, {
				method: 'GET',
				headers: BOOKING_API_CONFIG.HEADERS
			});

			const data: RoomAvailability = await response.json();
			
			hotelDetailsStore.setRoomAvailability(data);
			return data;
			
		} catch (error) {
			console.error('Error loading room availability (after silent retry):', error);
			const errorMessage = handleApiError(error as any, 'carga de disponibilidad de habitaciones');
			
			// Mostrar notificación más suave ya que ya se intentó reintentar silenciosamente
			notificationAPI.warning(
				'Habitaciones no disponibles',
				'No se pudo cargar la disponibilidad de habitaciones después de reintentar automáticamente.',
				{
					duration: 6000,
					actions: [
						{
							id: 'retry',
							label: 'Reintentar manualmente',
							action: () => this.loadRoomAvailability(hotelId, checkinDate, checkoutDate, adults, children, childrenAges),
							variant: 'primary'
						}
					]
				}
			);
			
			hotelDetailsStore.setError(errorMessage);
			return null;
		}
	}

	// Variable para controlar cargas en progreso
	private static loadingPromises = new Map<string, Promise<any>>();

	/**
	 * Carga todos los datos del hotel (detalles + habitaciones + fotos + descripción)
	 */
	static async loadHotelData(
		hotelId: number, 
		checkinDate: string, 
		checkoutDate: string, 
		adults: number = 2, 
		children: number = 0,
		childrenAges: number[] = []
	): Promise<{ hotelDetails: HotelDetails | null; roomAvailability: RoomAvailability | null; hotelPhotos: HotelPhoto[] | null; hotelDescription: HotelDescription | null; roomList: RoomListResponse | null }> {
		const cacheKey = `${hotelId}-${checkinDate}-${checkoutDate}-${adults}-${children}`;
		
		// Si ya hay una carga en progreso para estos parámetros, esperar a que termine
		if (this.loadingPromises.has(cacheKey)) {
			console.log('⏳ Ya hay una carga en progreso para este hotel, esperando...');
			return await this.loadingPromises.get(cacheKey);
		}
		
		const loadPromise = this._loadHotelDataInternal(hotelId, checkinDate, checkoutDate, adults, children, childrenAges);
		this.loadingPromises.set(cacheKey, loadPromise);
		
		try {
			const result = await loadPromise;
			return result;
		} finally {
			// Limpiar la promesa del cache cuando termine
			this.loadingPromises.delete(cacheKey);
		}
	}

	private static async _loadHotelDataInternal(
		hotelId: number, 
		checkinDate: string, 
		checkoutDate: string, 
		adults: number = 2, 
		children: number = 0,
		childrenAges: number[] = []
	): Promise<{ hotelDetails: HotelDetails | null; roomAvailability: RoomAvailability | null; hotelPhotos: HotelPhoto[] | null; hotelDescription: HotelDescription | null; roomList: RoomListResponse | null }> {
		try {
			console.log(`🏨 Iniciando carga de datos para hotel ID: ${hotelId}`);
			
			// NO establecer parámetros de búsqueda en el store para evitar bucles de reactividad
			// hotelDetailsStore.setSearchParams({ hotelId, checkinDate, checkoutDate, adults, children });
			
			let hotelDetails: HotelDetails | null = null;
		try {
			hotelDetails = await this.loadHotelDetails(hotelId, checkinDate, checkoutDate);
		} catch (error) {
			hotelDetails = this.createFallbackHotelDetails(hotelId, checkinDate, checkoutDate);
		}
			
			let hotelPhotos: HotelPhoto[] | null = null;
			try {
				hotelPhotos = await this.loadHotelPhotos(hotelId);
			} catch (error) {
				hotelPhotos = this.createFallbackHotelPhotos(hotelId);
			}
			
			let hotelDescription: HotelDescription | null = null;
			try {
				hotelDescription = await this.loadHotelDescription(hotelId);
			} catch (error) {
				hotelDescription = this.createFallbackHotelDescription(hotelId);
			}
			
			let roomList: RoomListResponse | null = null;
			try {
				roomList = await this.loadRoomList(hotelId, checkinDate, checkoutDate, adults, children);
			} catch (error) {
				roomList = this.createFallbackRoomList(hotelId, checkinDate, checkoutDate, adults, children);
			}
			
			const roomAvailability = null;
			return { hotelDetails, roomAvailability, hotelPhotos, hotelDescription, roomList };
			
		} catch (error) {
			console.error('Error loading hotel data (after silent retries):', error);
			const errorMessage = handleApiError(error as any, 'carga de datos del hotel');
			
			// NO limpiar el store para evitar bucles de reactividad
			// hotelDetailsStore.clearData();
			
			// Mostrar notificación más suave ya que cada método individual ya reintentó silenciosamente
			notificationAPI.warning(
				'Datos parcialmente no disponibles',
				'Algunos datos del hotel no se pudieron cargar después de reintentar automáticamente.',
				{
					duration: 6000,
					actions: [
						{
							id: 'retry',
							label: 'Reintentar manualmente',
							action: () => this.loadHotelData(hotelId, checkinDate, checkoutDate, adults, children, childrenAges),
							variant: 'primary'
						}
					]
				}
			);
			
			hotelDetailsStore.setError(errorMessage);
			return { hotelDetails: null, roomAvailability: null, hotelPhotos: null, hotelDescription: null, roomList: null };
		}
	}

	/**
	 * Formatea el precio para mostrar
	 */
	static formatPrice(amount: { value: number; currency: string; amount_rounded?: string }): string {
		if (amount.amount_rounded) {
			return amount.amount_rounded;
		}
		
		const formatter = new Intl.NumberFormat('es-CO', {
			style: 'currency',
			currency: amount.currency === 'COP' ? 'COP' : 'EUR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		});
		
		return formatter.format(amount.value);
	}

	/**
	 * Obtiene la distancia al centro de la ciudad
	 */
	static getDistanceToCenter(distanceToCc: number): string {
		if (distanceToCc < 1) {
			return `${Math.round(distanceToCc * 1000)} m del centro`;
		}
		return `${distanceToCc.toFixed(1)} km del centro`;
	}

	/**
	 * Obtiene el número de habitaciones disponibles
	 */
	static getAvailableRoomsCount(roomAvailability: RoomAvailability | null): number {
		if (!roomAvailability || !roomAvailability.block) {
			return 0;
		}
		
		return roomAvailability.block.reduce((total, room) => total + room.room_count, 0);
	}

	/**
	 * Obtiene el precio más bajo disponible
	 */
	static getLowestPrice(roomAvailability: RoomAvailability | null): string | null {
		if (!roomAvailability || !roomAvailability.block || roomAvailability.block.length === 0) {
			return null;
		}
		
		const lowestPrice = roomAvailability.block.reduce((lowest, room) => {
			const roomPrice = parseFloat(room.min_price.price);
			return roomPrice < lowest ? roomPrice : lowest;
		}, parseFloat(roomAvailability.block[0].min_price.price));
		
		return this.formatPrice({
			value: lowestPrice,
			currency: roomAvailability.block[0].min_price.currency
		});
	}

	/**
	 * Obtiene las facilidades más populares
	 */
	static getPopularFacilities(hotelDetails: HotelDetails | null): Array<{ name: string; icon: string }> {
		if (!hotelDetails || !hotelDetails.facilities_block) {
			return [];
		}
		
		return hotelDetails.facilities_block.facilities || [];
	}

	/**
	 * Obtiene los beneficios principales del hotel
	 */
	static getTopBenefits(hotelDetails: HotelDetails | null): Array<{ translated_name: string; icon: string }> {
		if (!hotelDetails || !hotelDetails.top_ufi_benefits) {
			return [];
		}
		
		return hotelDetails.top_ufi_benefits || [];
	}

	/**
	 * Obtiene la imagen principal del hotel
	 */
	static getMainHotelImage(hotelPhotos: HotelPhoto[] | null): string | null {
		if (!hotelPhotos || hotelPhotos.length === 0) {
			return null;
		}
		
		// Buscar imagen de fachada o edificio primero
		const facadeImage = hotelPhotos.find(photo => 
			photo.tags.some(tag => tag.tag.toLowerCase().includes('facade') || tag.tag.toLowerCase().includes('entrance'))
		);
		
		if (facadeImage) {
			return facadeImage.url_max;
		}
		
		// Si no hay fachada, usar la primera imagen disponible
		return hotelPhotos[0].url_max;
	}

	/**
	 * Genera el HTML para las estrellas del hotel
	 */
	static generateStarRating(starCount: number): string {
		const fullStars = Math.floor(starCount);
		const hasHalfStar = starCount % 1 >= 0.5;
		const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
		
		let stars = '';
		
		// Estrellas llenas
		for (let i = 0; i < fullStars; i++) {
			stars += '★';
		}
		
		// Media estrella
		if (hasHalfStar) {
			stars += '☆';
		}
		
		// Estrellas vacías
		for (let i = 0; i < emptyStars; i++) {
			stars += '☆';
		}
		
		return stars;
	}

	/**
	 * Obtiene la puntuación de ubicación formateada
	 */
	static getLocationScoreText(score: number): string {
		if (score >= 9.5) {
			return 'Ubicación excelente';
		} else if (score >= 9.0) {
			return 'Ubicación muy buena';
		} else if (score >= 8.5) {
			return 'Ubicación buena';
		} else {
			return 'Ubicación aceptable';
		}
	}

	/**
	 * Agrupa las habitaciones por tipo para la tabla
	 */
	static groupRoomsByType(roomList: RoomListResponse | null): Array<{
		roomType: string;
		rooms: Array<{
			room: any;
			price: string; // precio con descuento (formateado)
			taxes: string; // impuestos con descuento (formateado)
			priceOriginal?: string; // precio original formateado
			taxesOriginal?: string; // impuestos originales formateados
			currency?: string;
			options: Array<{
				icon: string;
				text: string;
				color: string;
			}>;
		}>;
	}> {
		if (!roomList || !roomList.block) {
			return [];
		}

		const groupedRooms = new Map<string, any[]>();

		// Agrupar habitaciones por tipo
		roomList.block.forEach(room => {
			const roomType = room.name || room.room_name;
			if (!groupedRooms.has(roomType)) {
				groupedRooms.set(roomType, []);
			}
			groupedRooms.get(roomType)!.push(room);
		});

		// Convertir a array y procesar cada grupo
		return Array.from(groupedRooms.entries()).map(([roomType, rooms]) => ({
			roomType,
			rooms: rooms.map(room => {
				const gross = room.product_price_breakdown.gross_amount.value;
				const currency = room.product_price_breakdown.gross_amount.currency;
				const net = room.product_price_breakdown.net_amount?.value ?? Math.round(gross * 0.8);
				const originalTax = Math.max(0, gross - net);
				// Aplicar descuento al bruto y ajustar impuestos proporcionalmente al cambio del bruto
				const discountedGross = applyPriceDiscount(gross);
				const factor = gross > 0 ? discountedGross / gross : 1;
				const discountedTax = Math.round(originalTax * factor);
				return {
					room,
					price: this.formatPrice({ value: discountedGross, currency }),
					taxes: this.formatPrice({ value: discountedTax, currency }),
					priceOriginal: this.formatPrice({ value: gross, currency }),
					taxesOriginal: this.formatPrice({ value: originalTax, currency }),
					currency,
					options: this.getRoomOptions(room)
				};
			})
		}));
	}

	/**
	 * Obtiene las opciones de una habitación (desayuno, cancelación, etc.)
	 */
	static getRoomOptions(room: any): Array<{ icon: string; text: string; color: string }> {
		const options = [];

		// Desayuno
		if (room.breakfast_included) {
			options.push({
				icon: '🍽️',
				text: `Desayuno incluido (${room.mealplan || 'Muy bueno'})`,
				color: 'text-green-600'
			});
		}

		// Cancelación
		if (room.refundable) {
			options.push({
				icon: '✓',
				text: `Cancelación gratis ${room.refundable_until ? `antes del ${room.refundable_until}` : ''}`,
				color: 'text-green-600'
			});
		} else {
			options.push({
				icon: '✗',
				text: 'No reembolsable',
				color: 'text-red-600'
			});
		}

		// Pago por adelantado
		if (room.paymentterms?.prepayment?.type === 'no_prepayment') {
			options.push({
				icon: '✓',
				text: 'Sin pago por adelantado - Pagarás en el alojamiento',
				color: 'text-green-600'
			});
		} else {
			options.push({
				icon: '•',
				text: 'Pagas al alojamiento antes de llegar',
				color: 'text-gray-600'
			});
		}

		// Genius
		options.push({
			icon: '🏷️',
			text: 'Genius Puede haber descuento',
			color: 'text-blue-600'
		});

		return options;
	}

	/**
	 * Obtiene las facilidades de una habitación formateadas
	 */
	static getRoomFacilities(room: any): Array<{ icon: string; text: string }> {
		const facilities = [];

		// Tamaño de la habitación
		if (room.room_surface_in_m2) {
			facilities.push({
				icon: '📐',
				text: `Habitación ${room.room_surface_in_m2} m²`
			});
		}

		// Vista
		if (room.view_type) {
			facilities.push({
				icon: '🏙️',
				text: room.view_type
			});
		}

		// Aire acondicionado (asumir que está disponible)
		facilities.push({
			icon: '❄️',
			text: 'Aire acondicionado'
		});

		// Baño
		facilities.push({
			icon: '🚿',
			text: 'Baño en la habitación'
		});

		// TV
		facilities.push({
			icon: '📺',
			text: 'TV de pantalla plana'
		});

		// Cafetera
		facilities.push({
			icon: '☕',
			text: 'Cafetera'
		});

		return facilities;
	}

	/**
	 * Obtiene las amenidades detalladas de una habitación
	 */
	static getRoomAmenities(room: any): string[] {
		// Lista básica de amenidades que suelen estar disponibles
		return [
			'Artículos de aseo gratis',
			'Bañera o ducha',
			'Caja fuerte',
			'Suelo de madera o parquet',
			'Toallas',
			'Ropa de cama',
			'Enchufe cerca de la cama',
			'Escritorio',
			'TV',
			'Nevera',
			'Teléfono',
			'Utensilios de planchado',
			'Plancha para ropa',
			'Radio',
			'Secador de pelo',
			'Camas extralargas (más de 2 metros)',
			'Servicio de despertador / alarma',
			'Canales por cable',
			'Servicio de despertador',
			'Reloj despertador',
			'Armario',
			'Acceso a pisos superiores en ascensor',
			'Acceso a pisos superiores solo mediante escaleras',
			'Papel higiénico'
		];
	}

	/**
	 * Obtiene el icono y texto formateado para el tipo de cama
	 */
	static getBedTypeInfo(bedType: string | null | undefined): { icon: string; text: string; svg?: string } {
		if (!bedType) {
			return { icon: '🛏️', text: '1 cama doble extragrande' };
		}

		const bedTypeLower = bedType.toLowerCase();
		
		// Mapeo de tipos de cama a emojis, textos y SVGs
		const bedTypeMap: Record<string, { icon: string; text: string; svg?: string }> = {
			// Camas individuales
			'single': { 
				icon: '🛏️', 
				text: '1 cama individual',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>'
			},
			'twin': { 
				icon: '🛏️', 
				text: '1 cama individual',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>'
			},
			'single bed': { 
				icon: '🛏️', 
				text: '1 cama individual',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>'
			},
			
			// Camas dobles
			'double': { 
				icon: '🛏️', 
				text: '1 cama doble',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			'double bed': { 
				icon: '🛏️', 
				text: '1 cama doble',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			'queen': { 
				icon: '🛏️', 
				text: '1 cama queen',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			'queen bed': { 
				icon: '🛏️', 
				text: '1 cama queen',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			
			// Camas grandes
			'king': { 
				icon: '🛏️', 
				text: '1 cama king',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			'king bed': { 
				icon: '🛏️', 
				text: '1 cama king',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			'king size': { 
				icon: '🛏️', 
				text: '1 cama king',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			
			// Camas extragrandes
			'extra large': { 
				icon: '🛏️', 
				text: '1 cama extragrande',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			'extragrande': { 
				icon: '🛏️', 
				text: '1 cama extragrande',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			'extra large bed': { 
				icon: '🛏️', 
				text: '1 cama extragrande',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			'super king': { 
				icon: '🛏️', 
				text: '1 cama super king',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			
			// Múltiples camas
			'twin beds': { 
				icon: '🛏️🛏️', 
				text: '2 camas individuales',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>'
			},
			'two twin': { 
				icon: '🛏️🛏️', 
				text: '2 camas individuales',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>'
			},
			'double beds': { 
				icon: '🛏️🛏️', 
				text: '2 camas dobles',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			'two double': { 
				icon: '🛏️🛏️', 
				text: '2 camas dobles',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			
			// Sofá cama
			'sofa bed': { 
				icon: '🛋️', 
				text: '1 sofá cama',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			'sofá cama': { 
				icon: '🛋️', 
				text: '1 sofá cama',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			'pull-out sofa': { 
				icon: '🛋️', 
				text: '1 sofá cama',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			
			// Literas
			'bunk bed': { 
				icon: '🛏️', 
				text: '1 litera',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			'bunk beds': { 
				icon: '🛏️', 
				text: '1 litera',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			'litera': { 
				icon: '🛏️', 
				text: '1 litera',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			
			// Camas plegables
			'fold-out bed': { 
				icon: '🛏️', 
				text: '1 cama plegable',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			'folding bed': { 
				icon: '🛏️', 
				text: '1 cama plegable',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			
			// Camas de agua
			'water bed': { 
				icon: '🛏️', 
				text: '1 cama de agua',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			},
			'waterbed': { 
				icon: '🛏️', 
				text: '1 cama de agua',
				svg: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h14a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/></svg>'
			}
		};

		// Buscar coincidencia exacta
		if (bedTypeMap[bedTypeLower]) {
			return bedTypeMap[bedTypeLower];
		}

		// Buscar coincidencia parcial
		for (const [key, value] of Object.entries(bedTypeMap)) {
			if (bedTypeLower.includes(key)) {
				return value;
			}
		}

		// Si no encuentra coincidencia, usar el texto original con icono genérico
		return { icon: '🛏️', text: bedType };
	}
}