import { writable } from 'svelte/store';

// Tipos basados en la estructura de la API de Booking.com
export interface HotelPhoto {
	photo_id: number;
	url_square60: string;
	url_max: string;
	url_1440: string;
	tags: Array<{
		id: number;
		tag: string;
	}>;
	ml_tags?: Array<{
		tag_name: string;
		confidence: number;
		tag_id: number;
	}>;
}

export interface HotelDescription {
	description: string;
	languagecode: string;
}

export interface HotelDetails {
	hotel_id: number;
	hotel_name: string;
	hotel_name_trans: string;
	accommodation_type: number;
	accommodation_type_name: string;
	url: string;
	hotel_address_line: string;
	country_trans: string;
	countrycode: string;
	district: string;
	zip: string;
	city: string;
	city_name_en: string;
	city_trans: string;
	city_in_trans: string;
	district_id: number;
	address: string;
	address_trans: string;
	timezone: string;
	ufi: number;
	latitude: number;
	longitude: number;
	currency_code: string;
	review_nr: number;
	distance_to_cc: number;
	class: number;
	class_is_estimated: number;
	spoken_languages: string[];
	hotel_facilities: string;
	facilities_block: {
		type: string;
		name: string;
		facilities: Array<{
			name: string;
			icon: string;
		}>;
	};
	property_highlight_strip: Array<{
		name: string;
		icon_list: Array<{
			icon: string;
			size: number;
		}>;
	}>;
	top_ufi_benefits: Array<{
		translated_name: string;
		icon: string;
	}>;
	preferences: Array<{
		text: string;
		id: string;
		icon_name: string;
		is_disabled: number;
		choices: Array<{
			id: number;
			text: string;
			on_select_text: string;
			description: string;
			selected: number;
		}>;
		room_ids: string[];
	}>;
	block: Array<{
		room_id: number;
		roomtype_id: number;
		name: string;
		room_name: string;
		name_without_policy: string;
		room_surface_in_m2: number;
		room_surface_in_feet2: number;
		block_id: string;
		mealplan: string;
		room_count: number;
		nr_adults: number;
		nr_children: number;
		refundable: number;
		breakfast_included: number;
		all_inclusive: number;
		refundable_until: string;
		paymentterms: {
			cancellation: {
				description: string;
				type: string;
				type_translation: string;
				info: {
					date: string;
					time: string;
					timezone: string;
					refundable: number;
				};
			};
			prepayment: {
				description: string;
				type: string;
				type_translation: string;
				simple_translation: string;
			};
		};
		product_price_breakdown: {
			gross_amount: {
				value: number;
				currency: string;
				amount_rounded: string;
				amount_unrounded: string;
			};
			all_inclusive_amount: {
				value: number;
				currency: string;
				amount_rounded: string;
				amount_unrounded: string;
			};
			net_amount: {
				value: number;
				currency: string;
				amount_rounded: string;
				amount_unrounded: string;
			};
		};
	}>;
	composite_price_breakdown: {
		gross_amount: {
			value: number;
			currency: string;
			amount_rounded: string;
			amount_unrounded: string;
		};
		all_inclusive_amount: {
			value: number;
			currency: string;
			amount_rounded: string;
			amount_unrounded: string;
		};
	};
}

export interface RoomAvailability {
	hotel_id: number;
	arrival_date: string;
	departure_date: string;
	currency_code: string;
	cheapest_avail_price_eur: number;
	total_blocks: number;
	block: Array<{
		room_id: number;
		roomtype_id: number;
		name: string;
		room_name: string;
		room_surface_in_m2: number;
		room_surface_in_feet2: number;
		block_id: string;
		mealplan: string;
		room_count: number;
		nr_adults: number;
		nr_children: number;
		refundable: number;
		breakfast_included: number;
		all_inclusive: number;
		refundable_until: string;
		paymentterms: {
			cancellation: {
				description: string;
				type: string;
				type_translation: string;
			};
			prepayment: {
				description: string;
				type: string;
				type_translation: string;
				simple_translation: string;
			};
		};
		price_breakdown: {
			currency: string;
			gross_price: string;
			all_inclusive_price: number;
		};
		min_price: {
			price: string;
			currency: string;
			extra_charges_breakdown: {
				net_price: string;
				extra_charge: Array<{
					name: string;
					currency: string;
					amount: string;
					type: string;
					inclusion_type: string;
				}>;
			};
		};
		incremental_price: Array<{
			price: string;
			currency: string;
			extra_charges_breakdown: {
				net_price: string;
				extra_charge: Array<{
					name: string;
					currency: string;
					amount: string;
					type: string;
					inclusion_type: string;
				}>;
			};
		}>;
	}>;
}

export interface HotelDetailsState {
	hotelDetails: HotelDetails | null;
	roomAvailability: RoomAvailability | null;
	hotelPhotos: HotelPhoto[] | null;
	hotelDescription: HotelDescription | null;
	loading: boolean;
	error: string | null;
	searchParams: {
		hotelId: number;
		checkinDate: string;
		checkoutDate: string;
		adults: number;
		children: number;
	} | null;
}

const initialState: HotelDetailsState = {
	hotelDetails: null,
	roomAvailability: null,
	hotelPhotos: null,
	hotelDescription: null,
	loading: false,
	error: null,
	searchParams: null
};

function createHotelDetailsStore() {
	const { subscribe, set, update } = writable<HotelDetailsState>(initialState);

	return {
		subscribe,
		
		// Acciones para manejar el estado
		setLoading: (loading: boolean) => {
			update(state => ({ ...state, loading }));
		},
		
		setError: (error: string | null) => {
			update(state => ({ ...state, error, loading: false }));
		},
		
		setHotelDetails: (hotelDetails: HotelDetails) => {
			update(state => ({ ...state, hotelDetails, error: null, loading: false }));
		},
		
		setRoomAvailability: (roomAvailability: RoomAvailability) => {
			update(state => ({ ...state, roomAvailability, error: null, loading: false }));
		},
		
		setHotelPhotos: (hotelPhotos: HotelPhoto[]) => {
			update(state => ({ ...state, hotelPhotos, error: null, loading: false }));
		},
		
		setHotelDescription: (hotelDescription: HotelDescription) => {
			update(state => ({ ...state, hotelDescription, error: null, loading: false }));
		},
		
		setSearchParams: (searchParams: HotelDetailsState['searchParams']) => {
			update(state => ({ ...state, searchParams }));
		},
		
		clearData: () => {
			set(initialState);
		},
		
		// Acción para cargar datos del hotel
		loadHotelData: async (hotelId: number, checkinDate: string, checkoutDate: string, adults: number = 2, children: number = 0) => {
			update(state => ({ 
				...state, 
				loading: true, 
				error: null,
				searchParams: { hotelId, checkinDate, checkoutDate, adults, children }
			}));
		}
	};
}

export const hotelDetailsStore = createHotelDetailsStore();