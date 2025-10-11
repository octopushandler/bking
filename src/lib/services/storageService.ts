import { browser } from '$app/environment';

/**
 * Servicio centralizado para manejar localStorage de forma segura
 * Evita conflictos entre componentes y proporciona una API consistente
 */
export class StorageService {
	// Claves únicas para cada tipo de dato
	private static readonly KEYS = {
		GUEST_SELECTION: 'booking-guest-selection',
		DESTINATION: 'booking-selected-destination',
		RESERVATION: 'booking-reservation-data',
		SEARCH_FORM_GUESTS: 'booking-search-form-guests', // Para SearchForm
		DATE_PICKER_GUESTS: 'booking-date-picker-guests'  // Para DateGuestPicker
	} as const;

	/**
	 * Guardar datos de huéspedes de forma segura
	 */
	static saveGuestData(data: {
		adults: number;
		children: number;
		rooms: number;
		pets: boolean;
	}, source: 'searchForm' | 'datePicker' = 'searchForm'): void {
		if (!browser) return;

		try {
			const key = source === 'searchForm' 
				? this.KEYS.SEARCH_FORM_GUESTS 
				: this.KEYS.DATE_PICKER_GUESTS;
			
			localStorage.setItem(key, JSON.stringify(data));
			console.log(`💾 Datos de huéspedes guardados (${source}):`, data);
		} catch (error) {
			console.error(`❌ Error guardando datos de huéspedes (${source}):`, error);
		}
	}

	/**
	 * Cargar datos de huéspedes de forma segura
	 */
	static loadGuestData(source: 'searchForm' | 'datePicker' = 'searchForm'): {
		adults: number;
		children: number;
		rooms: number;
		pets: boolean;
	} | null {
		if (!browser) return null;

		try {
			const key = source === 'searchForm' 
				? this.KEYS.SEARCH_FORM_GUESTS 
				: this.KEYS.DATE_PICKER_GUESTS;
			
			const stored = localStorage.getItem(key);
			if (stored) {
				const parsed = JSON.parse(stored);
				console.log(`📦 Datos de huéspedes cargados (${source}):`, parsed);
				return parsed;
			}
		} catch (error) {
			console.error(`❌ Error cargando datos de huéspedes (${source}):`, error);
		}
		return null;
	}

	/**
	 * Guardar destino seleccionado
	 */
	static saveDestination(destination: any): void {
		if (!browser) return;

		try {
			localStorage.setItem(this.KEYS.DESTINATION, JSON.stringify(destination));
			console.log('💾 Destino guardado:', destination);
		} catch (error) {
			console.error('❌ Error guardando destino:', error);
		}
	}

	/**
	 * Cargar destino seleccionado
	 */
	static loadDestination(): any | null {
		if (!browser) return null;

		try {
			const stored = localStorage.getItem(this.KEYS.DESTINATION);
			if (stored) {
				const parsed = JSON.parse(stored);
				console.log('📦 Destino cargado:', parsed);
				return parsed;
			}
		} catch (error) {
			console.error('❌ Error cargando destino:', error);
		}
		return null;
	}

	/**
	 * Limpiar destino (usado cuando el usuario escribe algo nuevo)
	 */
	static clearDestination(): void {
		if (!browser) return;

		try {
			localStorage.removeItem(this.KEYS.DESTINATION);
			console.log('🗑️ Destino limpiado');
		} catch (error) {
			console.error('❌ Error limpiando destino:', error);
		}
	}

	/**
	 * Guardar datos de reserva
	 */
	static saveReservationData(data: any): void {
		if (!browser) return;

		try {
			localStorage.setItem(this.KEYS.RESERVATION, JSON.stringify(data));
			console.log('💾 Datos de reserva guardados');
		} catch (error) {
			console.error('❌ Error guardando datos de reserva:', error);
		}
	}

	/**
	 * Cargar datos de reserva
	 */
	static loadReservationData(): any | null {
		if (!browser) return null;

		try {
			const stored = localStorage.getItem(this.KEYS.RESERVATION);
			if (stored) {
				const parsed = JSON.parse(stored);
				console.log('📦 Datos de reserva cargados:', parsed);
				return parsed;
			}
		} catch (error) {
			console.error('❌ Error cargando datos de reserva:', error);
		}
		return null;
	}

	/**
	 * Limpiar todos los datos de la aplicación
	 */
	static clearAll(): void {
		if (!browser) return;

		try {
			Object.values(this.KEYS).forEach(key => {
				localStorage.removeItem(key);
			});
			console.log('🗑️ Todos los datos limpiados');
		} catch (error) {
			console.error('❌ Error limpiando datos:', error);
		}
	}

	/**
	 * Obtener información de debug sobre el localStorage
	 */
	static getDebugInfo(): {
		keys: string[];
		usage: { [key: string]: number };
		totalSize: number;
	} {
		if (!browser) return { keys: [], usage: {}, totalSize: 0 };

		try {
			const keys = Object.values(this.KEYS);
			const usage: { [key: string]: number } = {};
			let totalSize = 0;

			keys.forEach(key => {
				const value = localStorage.getItem(key);
				if (value) {
					usage[key] = value.length;
					totalSize += value.length;
				}
			});

			return { keys, usage, totalSize };
		} catch (error) {
			console.error('❌ Error obteniendo información de debug:', error);
			return { keys: [], usage: {}, totalSize: 0 };
		}
	}
}
