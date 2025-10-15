import { HotelDetailsService } from '$lib/services/hotelDetailsService';
import type { HotelDetails, HotelPhoto, HotelDescription, RoomListResponse } from '$lib/stores/hotelDetails';

export interface HotelData {
	hotelDetails: HotelDetails | null;
	hotelPhotos: HotelPhoto[] | null;
	hotelDescription: HotelDescription | null;
	roomList: RoomListResponse | null;
}

export interface SearchParams {
	checkInDate: string;
	checkOutDate: string;
	adults: number;
	children: number;
	rooms: number;
	pets: boolean;
}

/**
 * Funciones puras para derivar datos del hotel sin reactividad
 */

export function getHotelName(data: HotelData): string {
	return data?.hotelDetails?.hotel_name || '---';
}

export function getHotelAddress(data: HotelData): string {
	if (!data || !data.hotelDetails) {
		return '--- - <span class="text-blue-600 hover:underline font-semibold cursor-pointer">--- - Ver en el mapa</span>';
	}
	return `${data.hotelDetails.hotel_address_line} - <span class="text-blue-600 hover:underline font-semibold cursor-pointer">Excelente ubicación - Ver en el mapa</span>`;
}

export function getStarRating(data: HotelData): string {
	if (!data || !data.hotelDetails?.class) return '---';
	return HotelDetailsService.generateStarRating(data.hotelDetails.class);
}

export function getDistanceToCenter(data: HotelData): string {
	if (!data || !data.hotelDetails?.distance_to_cc) return '---';
	return HotelDetailsService.getDistanceToCenter(data.hotelDetails.distance_to_cc);
}

export function getHotelDescription(data: HotelData): string {
	return data?.hotelDescription?.description || 'Descripción no disponible';
}

export function getHotelFacilities(data: HotelData): any[] {
	return data?.hotelDetails?.facilities_block?.facilities || [];
}

export function getTopBenefits(data: HotelData): any[] {
	return data?.hotelDetails?.top_ufi_benefits || [];
}

export function getGroupedRooms(data: HotelData): any[] {
	if (!data || !data.roomList) return [];
	return HotelDetailsService.groupRoomsByType(data.roomList);
}

export function hasRoomData(data: HotelData): boolean {
	return getGroupedRooms(data).length > 0;
}

export function getHotelPhotos(data: HotelData): Array<{ src: string; alt: string }> {
	if (!data || !data.hotelPhotos || data.hotelPhotos.length === 0) {
		// Fotos placeholder cuando no hay datos de la API
		return [
			{ src: '---', alt: '---' },
			{ src: '---', alt: '---' },
			{ src: '---', alt: '---' },
			{ src: '---', alt: '---' },
			{ src: '---', alt: '---' },
			{ src: '---', alt: '---' },
			{ src: '---', alt: '---' },
			{ src: '---', alt: '---' }
		];
	}
	
	return data.hotelPhotos.map(photo => ({
		src: photo.url_max,
		alt: photo.tags?.[0]?.tag || 'Hotel'
	}));
}

export function getCountryTrans(data: HotelData): string {
	return data?.hotelDetails?.country_trans || 'Colombia';
}

export function getDistrict(data: HotelData): string {
	return data?.hotelDetails?.district || 'Cundinamarca';
}

export function getCityTrans(data: HotelData): string {
	return data?.hotelDetails?.city_trans || 'Bogotá';
}

export function getAccommodationTypeName(data: HotelData): string {
	return data?.hotelDetails?.accommodation_type_name || 'Hotel';
}

export function getHotelNameForTitle(data: HotelData): string {
	return data?.hotelDetails?.hotel_name || 'Hotel Plaza Real';
}

/**
 * Función para limpiar cache antiguo del localStorage
 */
export function cleanOldCache(): void {
	const now = Date.now();
	const maxAge = 5 * 60 * 1000; // 5 minutos
	
	for (let i = localStorage.length - 1; i >= 0; i--) {
		const key = localStorage.key(i);
		if (key && key.startsWith('hotel_')) {
			try {
				const data = JSON.parse(localStorage.getItem(key) || '{}');
				if (data.timestamp && (now - data.timestamp) > maxAge) {
					localStorage.removeItem(key);
					console.log('🧹 Cache limpiado:', key);
				}
			} catch (error) {
				// Si hay error parseando, eliminar la entrada
				localStorage.removeItem(key);
			}
		}
	}
}
