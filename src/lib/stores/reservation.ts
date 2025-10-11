import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { HotelDetails, HotelPhoto, HotelDescription, RoomListResponse } from './hotelDetails';
import { StorageService } from '$lib/services/storageService';

// Interfaces para la reserva
export interface SelectedRoom {
	roomId: number;
	roomType: string;
	roomName: string;
	quantity: number;
	pricePerNight: number;
	totalNights: number;
	subtotal: number;
	taxes: number;
	total: number;
	options: {
		breakfast: boolean;
		cancellation: boolean;
		prepayment: boolean;
		refundableUntil?: string;
		mealplan?: string;
	};
	roomData: any; // Datos completos de la habitación desde la API
}

export interface ReservationSearchParams {
	checkInDate: string;
	checkOutDate: string;
	adults: number;
	children: number;
	rooms: number;
	pets: boolean;
}

export interface ReservationData {
	// Información completa del hotel (para evitar nuevas peticiones)
	hotel: {
		id: number;
		name: string;
		nameTrans: string;
		address: string;
		addressLine: string;
		country: string;
		countryTrans: string;
		district: string;
		city: string;
		cityTrans: string;
		rating: number;
		class: number;
		reviewCount: number;
		distanceToCenter: number;
		latitude: number;
		longitude: number;
		timezone: string;
		currency: string;
		spokenLanguages: string[];
		accommodationType: string;
		url: string;
		// Datos completos del hotel
		hotelDetails: HotelDetails | null;
		hotelPhotos: HotelPhoto[] | null;
		hotelDescription: HotelDescription | null;
		roomList: RoomListResponse | null;
	};
	
	// Parámetros de búsqueda
	searchParams: ReservationSearchParams;
	
	// Habitaciones seleccionadas
	selectedRooms: SelectedRoom[];
	
	// Totales calculados
	totals: {
		subtotal: number;
		taxes: number;
		total: number;
		currency: string;
	};
	
	// Estado de la reserva
	isValid: boolean;
	lastUpdated: string;
}

// Funciones de persistencia usando el servicio centralizado
function loadFromStorage(): ReservationData | null {
	return StorageService.loadReservationData();
}

function saveToStorage(data: ReservationData) {
	StorageService.saveReservationData(data);
}

// Estado inicial
const initialState: ReservationData = {
	hotel: {
		id: 0,
		name: '',
		nameTrans: '',
		address: '',
		addressLine: '',
		country: '',
		countryTrans: '',
		district: '',
		city: '',
		cityTrans: '',
		rating: 0,
		class: 0,
		reviewCount: 0,
		distanceToCenter: 0,
		latitude: 0,
		longitude: 0,
		timezone: '',
		currency: 'COP',
		spokenLanguages: [],
		accommodationType: '',
		url: '',
		hotelDetails: null,
		hotelPhotos: null,
		hotelDescription: null,
		roomList: null
	},
	searchParams: {
		checkInDate: '',
		checkOutDate: '',
		adults: 2,
		children: 0,
		rooms: 1,
		pets: false
	},
	selectedRooms: [],
	totals: {
		subtotal: 0,
		taxes: 0,
		total: 0,
		currency: 'COP'
	},
	isValid: false,
	lastUpdated: new Date().toISOString()
};

function createReservationStore(initialData: ReservationData = initialState) {
	const { subscribe, set, update } = writable<ReservationData>(initialData);

	// Función helper para persistir cambios
	function persistUpdate(updater: (state: ReservationData) => ReservationData) {
		update(state => {
			const newState = updater(state);
			saveToStorage(newState);
			return newState;
		});
	}

	return {
		subscribe,
		
		// Inicializar reserva con datos del hotel
		initializeReservation: (
			hotelDetails: HotelDetails,
			hotelPhotos: HotelPhoto[] | null,
			hotelDescription: HotelDescription | null,
			roomList: RoomListResponse | null,
			searchParams: ReservationSearchParams
		) => {
			persistUpdate(state => {
				const newState = {
					...state,
					hotel: {
						id: hotelDetails.hotel_id,
						name: hotelDetails.hotel_name,
						nameTrans: hotelDetails.hotel_name_trans,
						address: hotelDetails.address,
						addressLine: hotelDetails.hotel_address_line,
						country: hotelDetails.countrycode,
						countryTrans: hotelDetails.country_trans,
						district: hotelDetails.district,
						city: hotelDetails.city,
						cityTrans: hotelDetails.city_trans,
						rating: hotelDetails.class,
						class: hotelDetails.class,
						reviewCount: hotelDetails.review_nr,
						distanceToCenter: hotelDetails.distance_to_cc,
						latitude: hotelDetails.latitude,
						longitude: hotelDetails.longitude,
						timezone: hotelDetails.timezone,
						currency: hotelDetails.currency_code,
						spokenLanguages: hotelDetails.spoken_languages,
						accommodationType: hotelDetails.accommodation_type_name,
						url: hotelDetails.url,
						// Guardar datos completos para evitar nuevas peticiones
						hotelDetails,
						hotelPhotos,
						hotelDescription,
						roomList
					},
					searchParams,
					selectedRooms: [], // Limpiar selecciones anteriores
					totals: {
						subtotal: 0,
						taxes: 0,
						total: 0,
						currency: hotelDetails.currency_code
					},
					isValid: false,
					lastUpdated: new Date().toISOString()
				};
				
				return newState;
			});
		},
		
		// Actualizar parámetros de búsqueda
		updateSearchParams: (newParams: Partial<ReservationSearchParams>) => {
			persistUpdate(state => ({
				...state,
				searchParams: { ...state.searchParams, ...newParams },
				lastUpdated: new Date().toISOString()
			}));
		},
		
		// Agregar habitación a la reserva
		addRoomToReservation: (roomData: any, quantity: number = 1) => {
			console.log('🏨 Agregando habitación a reserva:', { roomData, quantity });
			persistUpdate(state => {
				const existingRoomIndex = state.selectedRooms.findIndex(
					room => room.roomId === roomData.room_id
				);
				
				console.log('🔍 Índice de habitación existente:', existingRoomIndex);
				let newSelectedRooms = [...state.selectedRooms];
				
				if (existingRoomIndex >= 0) {
					// Actualizar cantidad existente y recalcular totales
					const room = newSelectedRooms[existingRoomIndex];
					const totalNights = calculateNights(state.searchParams.checkInDate, state.searchParams.checkOutDate);
					const subtotal = room.pricePerNight * totalNights * quantity;
					const taxes = (room.roomData.product_price_breakdown.gross_amount.value - room.roomData.product_price_breakdown.net_amount.value) * totalNights * quantity;
					
					newSelectedRooms[existingRoomIndex] = {
						...room,
						quantity,
						totalNights,
						subtotal,
						taxes,
						total: subtotal + taxes
					};
				} else {
					// Agregar nueva habitación
					const totalNights = calculateNights(state.searchParams.checkInDate, state.searchParams.checkOutDate);
					const pricePerNight = roomData.product_price_breakdown.gross_amount.value;
					const subtotal = pricePerNight * totalNights * quantity;
					const taxes = (roomData.product_price_breakdown.gross_amount.value - roomData.product_price_breakdown.net_amount.value) * totalNights * quantity;
					
					const newRoom: SelectedRoom = {
						roomId: roomData.room_id,
						roomType: roomData.name || roomData.room_name,
						roomName: roomData.name || roomData.room_name,
						quantity,
						pricePerNight,
						totalNights,
						subtotal,
						taxes,
						total: subtotal + taxes,
						options: {
							breakfast: roomData.breakfast_included === 1,
							cancellation: roomData.refundable === 1,
							prepayment: roomData.paymentterms?.prepayment?.type !== 'no_prepayment',
							refundableUntil: roomData.refundable_until,
							mealplan: roomData.mealplan
						},
						roomData
					};
					
					newSelectedRooms.push(newRoom);
				}
				
				// Recalcular totales
				const totals = calculateTotals(newSelectedRooms, state.hotel.currency);
				
				console.log('💰 Totales calculados:', totals);
				console.log('🏨 Habitaciones seleccionadas:', newSelectedRooms);
				
				return {
					...state,
					selectedRooms: newSelectedRooms,
					totals,
					isValid: newSelectedRooms.length > 0,
					lastUpdated: new Date().toISOString()
				};
			});
		},
		
		// Remover habitación de la reserva
		removeRoomFromReservation: (roomId: number) => {
			persistUpdate(state => {
				const newSelectedRooms = state.selectedRooms.filter(room => room.roomId !== roomId);
				const totals = calculateTotals(newSelectedRooms, state.hotel.currency);
				
				return {
					...state,
					selectedRooms: newSelectedRooms,
					totals,
					isValid: newSelectedRooms.length > 0,
					lastUpdated: new Date().toISOString()
				};
			});
		},
		
		// Actualizar cantidad de una habitación
		updateRoomQuantity: (roomId: number, quantity: number) => {
			update(state => {
				const newSelectedRooms = state.selectedRooms.map(room => {
					if (room.roomId === roomId) {
						const subtotal = room.pricePerNight * room.totalNights * quantity;
						const taxes = (room.roomData.product_price_breakdown.gross_amount.value - room.roomData.product_price_breakdown.net_amount.value) * room.totalNights * quantity;
						
						return {
							...room,
							quantity,
							subtotal,
							taxes,
							total: subtotal + taxes
						};
					}
					return room;
				});
				
				const totals = calculateTotals(newSelectedRooms, state.hotel.currency);
				
				return {
					...state,
					selectedRooms: newSelectedRooms,
					totals,
					lastUpdated: new Date().toISOString()
				};
			});
		},
		
		// Limpiar toda la reserva
		clearReservation: () => {
			set(initialState);
		},
		
		// Validar reserva
		validateReservation: () => {
			persistUpdate(state => ({
				...state,
				isValid: state.selectedRooms.length > 0 && 
						state.searchParams.checkInDate !== '' && 
						state.searchParams.checkOutDate !== '' &&
						state.searchParams.adults > 0,
				lastUpdated: new Date().toISOString()
			}));
		},
		
		// Obtener resumen de la reserva
		getReservationSummary: () => {
			let summary: any = null;
			subscribe(state => {
				summary = {
					hotel: state.hotel,
					searchParams: state.searchParams,
					selectedRooms: state.selectedRooms,
					totals: state.totals,
					isValid: state.isValid,
					lastUpdated: state.lastUpdated
				};
			})();
			return summary;
		},
		
		// Método set para actualizar el estado completo
		set: (newState: ReservationData) => {
			saveToStorage(newState);
			set(newState);
		}
	};
}

// Funciones helper
function calculateNights(checkIn: string, checkOut: string): number {
	if (!checkIn || !checkOut) return 0;
	
	const checkInDate = new Date(checkIn);
	const checkOutDate = new Date(checkOut);
	const diffTime = checkOutDate.getTime() - checkInDate.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	
	return Math.max(0, diffDays);
}

function calculateTotals(selectedRooms: SelectedRoom[], currency: string) {
	const subtotal = selectedRooms.reduce((sum, room) => sum + room.subtotal, 0);
	const taxes = selectedRooms.reduce((sum, room) => sum + room.taxes, 0);
	const total = subtotal + taxes;
	
	return {
		subtotal,
		taxes,
		total,
		currency
	};
}

// Crear el store con estado inicial limpio
export const reservationStore = createReservationStore(initialState);

// Cargar datos persistidos de forma segura después de la inicialización
if (browser) {
	// Usar setTimeout para evitar problemas de hidratación
	setTimeout(() => {
		const savedData = loadFromStorage();
		if (savedData) {
			reservationStore.set(savedData);
		}
	}, 0);
}
