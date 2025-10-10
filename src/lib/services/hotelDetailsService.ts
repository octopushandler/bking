import { hotelDetailsStore, type HotelDetails, type RoomAvailability, type HotelPhoto } from '$lib/stores/hotelDetails';
import { buildHotelDetailsUrl, buildHotelRoomsUrl, BOOKING_API_CONFIG } from '$lib/config/api';
import { fetchWithRetry, handleApiError } from '$lib/utils/apiHelpers';
import { notificationAPI } from '$lib/stores/notifications';

export class HotelDetailsService {
	/**
	 * Carga los detalles del hotel desde la API
	 */
	static async loadHotelDetails(hotelId: number, checkinDate: string, checkoutDate: string): Promise<HotelDetails | null> {
		try {
			hotelDetailsStore.setLoading(true);
			
			const url = buildHotelDetailsUrl(hotelId, checkinDate, checkoutDate);
			
			const response = await fetchWithRetry(url, {
				method: 'GET',
				headers: BOOKING_API_CONFIG.HEADERS
			}, {
				timeout: 15000,
				maxRetries: 3,
				retryDelay: 1000
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data: HotelDetails = await response.json();
			
			hotelDetailsStore.setHotelDetails(data);
			return data;
			
		} catch (error) {
			console.error('Error loading hotel details:', error);
			const errorMessage = handleApiError(error as any, 'carga de detalles del hotel');
			
			notificationAPI.error(
				'Error al cargar detalles',
				errorMessage,
				{
					duration: 8000,
					actions: [
						{
							id: 'retry',
							label: 'Reintentar',
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
	 * Carga las fotos del hotel desde la API
	 */
	static async loadHotelPhotos(hotelId: number): Promise<HotelPhoto[] | null> {
		try {
			const url = `https://${BOOKING_API_CONFIG.HEADERS['x-rapidapi-host']}/v1/hotels/photos?hotel_id=${hotelId}&locale=es-mx`;
			
			const response = await fetchWithRetry(url, {
				method: 'GET',
				headers: BOOKING_API_CONFIG.HEADERS
			}, {
				timeout: 15000,
				maxRetries: 3,
				retryDelay: 1000
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

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
			
			const response = await fetchWithRetry(url, {
				method: 'GET',
				headers: BOOKING_API_CONFIG.HEADERS
			}, {
				timeout: 15000,
				maxRetries: 3,
				retryDelay: 1000
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data: RoomAvailability = await response.json();
			
			hotelDetailsStore.setRoomAvailability(data);
			return data;
			
		} catch (error) {
			console.error('Error loading room availability:', error);
			const errorMessage = handleApiError(error as any, 'carga de disponibilidad de habitaciones');
			
			notificationAPI.error(
				'Error al cargar habitaciones',
				errorMessage,
				{
					duration: 8000,
					actions: [
						{
							id: 'retry',
							label: 'Reintentar',
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

	/**
	 * Carga todos los datos del hotel (detalles + habitaciones + fotos)
	 */
	static async loadHotelData(
		hotelId: number, 
		checkinDate: string, 
		checkoutDate: string, 
		adults: number = 2, 
		children: number = 0,
		childrenAges: number[] = []
	): Promise<{ hotelDetails: HotelDetails | null; roomAvailability: RoomAvailability | null; hotelPhotos: HotelPhoto[] | null }> {
		try {
			// Establecer parámetros de búsqueda
			hotelDetailsStore.setSearchParams({ hotelId, checkinDate, checkoutDate, adults, children });
			
			// Cargar detalles del hotel y fotos en paralelo (rooms pausado)
			const [hotelDetails, hotelPhotos] = await Promise.all([
				this.loadHotelDetails(hotelId, checkinDate, checkoutDate),
				// this.loadRoomAvailability(hotelId, checkinDate, checkoutDate, adults, children, childrenAges), // PAUSADO
				this.loadHotelPhotos(hotelId)
			]);
			
			const roomAvailability = null; // PAUSADO

			return { hotelDetails, roomAvailability, hotelPhotos };
			
		} catch (error) {
			console.error('Error loading hotel data:', error);
			const errorMessage = handleApiError(error as any, 'carga de datos del hotel');
			
			// Limpiar el store en caso de error
			hotelDetailsStore.clearData();
			
			notificationAPI.error(
				'Error al cargar datos',
				errorMessage,
				{
					duration: 8000,
					actions: [
						{
							id: 'retry',
							label: 'Reintentar',
							action: () => this.loadHotelData(hotelId, checkinDate, checkoutDate, adults, children, childrenAges),
							variant: 'primary'
						}
					]
				}
			);
			
			hotelDetailsStore.setError(errorMessage);
			return { hotelDetails: null, roomAvailability: null, hotelPhotos: null };
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
}