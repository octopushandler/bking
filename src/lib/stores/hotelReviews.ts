import { writable } from 'svelte/store';

// Interfaces para los datos de reviews
export interface HotelReview {
	name: string;
	country: string;
	comment: string;
	avatar: string; // Inicial del nombre
}

export interface CategoryRating {
	name: string;
	score: number;
	percentage: number; // Para las barras de progreso
	isHigh: boolean; // Para indicadores de puntuación alta/baja
}

export interface OverallRating {
	score: number;
	description: string;
	totalReviews: number;
}

export interface HotelReviewsData {
	overallRating: OverallRating;
	categoryRatings: CategoryRating[];
	userReviews: HotelReview[];
}

export interface HotelReviewsState {
	reviews: Map<number, HotelReviewsData>;
}

// Datos de semilla para generar contenido aleatorio pero consistente
const SEED_NAMES = [
	'Carlos', 'María', 'Ana', 'Luis', 'Carmen', 'José', 'Isabel', 'Miguel', 'Elena', 'Antonio',
	'Laura', 'Francisco', 'Patricia', 'Manuel', 'Rosa', 'David', 'Sofía', 'Javier', 'Lucía', 'Pedro',
	'Paula', 'Rafael', 'Mónica', 'Fernando', 'Cristina', 'Alejandro', 'Beatriz', 'Roberto', 'Natalia', 'Diego'
];

const SEED_COMMENTS = [
	'Excelente ubicación y servicio impecable. Definitivamente volveré.',
	'Las instalaciones están muy bien mantenidas y el personal es muy amable.',
	'Desayuno delicioso y habitaciones muy cómodas. Totalmente recomendado.',
	'Ubicación perfecta para conocer la ciudad. El hotel superó mis expectativas.',
	'Personal muy atento y habitaciones limpias. Una experiencia maravillosa.',
	'El hotel tiene todas las comodidades necesarias y el servicio es excelente.',
	'Muy buena relación calidad-precio. Las instalaciones están en perfecto estado.',
	'Desayuno variado y habitaciones espaciosas. El personal siempre dispuesto a ayudar.',
	'Ubicación estratégica y servicio de primera. Sin duda regresaré.',
	'Hotel muy bien ubicado con todas las facilidades. Experiencia inolvidable.',
	'Personal profesional y habitaciones muy confortables. Altamente recomendado.',
	'Excelente limpieza y atención al detalle. Un hotel de primera categoría.',
	'Desayuno exquisito y habitaciones amplias. El servicio superó mis expectativas.',
	'Ubicación perfecta para turismo de negocios. Muy satisfecho con la estadía.',
	'Hotel moderno con todas las comodidades. El personal es muy cordial.',
	'Instalaciones impecables y servicio personalizado. Una experiencia única.',
	'Muy buena atención y habitaciones cómodas. Definitivamente lo recomiendo.',
	'Desayuno variado y habitaciones bien equipadas. Servicio de calidad.',
	'Ubicación excelente y personal muy profesional. Hotel de primera.',
	'Instalaciones modernas y servicio impecable. Una estadía perfecta.',
	'Hotel muy bien mantenido con personal atento. Experiencia maravillosa.',
	'Desayuno delicioso y habitaciones espaciosas. Totalmente satisfecho.',
	'Ubicación estratégica y todas las comodidades. Altamente recomendado.',
	'Personal muy amable y habitaciones confortables. Un hotel excepcional.',
	'Excelente limpieza y atención al cliente. Sin duda regresaré.'
];

const SEED_COUNTRIES = [
	'Colombia', 'México', 'Argentina', 'España', 'Chile', 'Perú', 'Venezuela', 'Ecuador', 'Uruguay', 'Brasil'
];

const SEED_DESCRIPTIONS = [
	{ min: 9.5, max: 10.0, text: 'Fantástico' },
	{ min: 9.0, max: 9.4, text: 'Excelente' },
	{ min: 8.5, max: 8.9, text: 'Muy bueno' },
	{ min: 8.0, max: 8.4, text: 'Bueno' },
	{ min: 7.5, max: 7.9, text: 'Satisfactorio' }
];

const CATEGORY_RANGES = [
	{ name: 'Personal', range: [8.5, 9.8] },
	{ name: 'Instalaciones y servicios', range: [7.5, 9.5] },
	{ name: 'Limpieza', range: [8.0, 9.8] },
	{ name: 'Confort', range: [7.8, 9.6] },
	{ name: 'Relación calidad-precio', range: [7.0, 9.2] },
	{ name: 'Ubicación', range: [8.8, 9.9] },
	{ name: 'WiFi gratis', range: [6.0, 8.5] }
];

// Función para generar números pseudo-aleatorios consistentes
function seededRandom(seed: number): number {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

// Función para seleccionar elementos únicos del array
function selectUniqueItems<T>(array: T[], count: number, seed: number): T[] {
	const selected: T[] = [];
	const used = new Set<number>();
	let currentSeed = seed;
	
	for (let i = 0; i < count; i++) {
		let index;
		do {
			currentSeed = Math.floor(seededRandom(currentSeed) * array.length);
			index = currentSeed;
		} while (used.has(index));
		
		used.add(index);
		selected.push(array[index]);
	}
	
	return selected;
}

// Función para generar puntuación en un rango específico
function generateScoreInRange(range: [number, number], seed: number): number {
	const [min, max] = range;
	const random = seededRandom(seed);
	return Math.round((min + random * (max - min)) * 10) / 10;
}

// Función para calcular porcentaje para las barras de progreso
function calculatePercentage(score: number): number {
	return Math.round((score / 10) * 100);
}

// Función para obtener descripción basada en puntuación
function getDescriptionByScore(score: number): string {
	const description = SEED_DESCRIPTIONS.find(desc => 
		score >= desc.min && score <= desc.max
	);
	return description?.text || 'Bueno';
}

// Función para generar número de reseñas realista
function generateTotalReviews(seed: number): number {
	const random = seededRandom(seed);
	// Generar entre 50 y 2000 reseñas
	return Math.floor(50 + random * 1950);
}

// Función principal para generar reviews de un hotel
function generateHotelReviews(hotelId: number): HotelReviewsData {
	// Usar el hotelId como semilla base
	let seed = hotelId;
	
	// Generar calificación general
	const overallScore = generateScoreInRange([7.5, 9.8], seed++);
	const overallRating: OverallRating = {
		score: overallScore,
		description: getDescriptionByScore(overallScore),
		totalReviews: generateTotalReviews(seed++)
	};
	
	// Generar calificaciones por categoría
	const categoryRatings: CategoryRating[] = CATEGORY_RANGES.map(category => {
		const score = generateScoreInRange(category.range, seed++);
		return {
			name: category.name,
			score,
			percentage: calculatePercentage(score),
			isHigh: score > 9.0
		};
	});
	
	// Generar comentarios de usuarios
	const selectedNames = selectUniqueItems(SEED_NAMES, 3, seed++);
	const selectedComments = selectUniqueItems(SEED_COMMENTS, 3, seed++);
	const selectedCountries = selectUniqueItems(SEED_COUNTRIES, 3, seed++);
	
	const userReviews: HotelReview[] = selectedNames.map((name, index) => ({
		name,
		country: selectedCountries[index],
		comment: selectedComments[index],
		avatar: name.charAt(0).toUpperCase()
	}));
	
	return {
		overallRating,
		categoryRatings,
		userReviews
	};
}

// Estado inicial del store
const initialState: HotelReviewsState = {
	reviews: new Map()
};

// Crear el store
function createHotelReviewsStore() {
	const { subscribe, set, update } = writable<HotelReviewsState>(initialState);

	return {
		subscribe,
		
		// Obtener reviews para un hotel específico
		getReviewsForHotel: (hotelId: number): HotelReviewsData | null => {
			const state = get();
			return state.reviews.get(hotelId) || null;
		},
		
		// Generar y guardar reviews para un hotel
		generateReviewsForHotel: (hotelId: number): HotelReviewsData => {
			let generatedReviews: HotelReviewsData;
			update(state => {
				// Verificar si ya existen reviews para este hotel
				if (state.reviews.has(hotelId)) {
					generatedReviews = state.reviews.get(hotelId)!;
				} else {
					// Generar nuevos reviews
					generatedReviews = generateHotelReviews(hotelId);
					state.reviews.set(hotelId, generatedReviews);
				}
				return state;
			});
			return generatedReviews;
		},
		
		// Obtener calificación general
		getOverallRating: (hotelId: number): OverallRating | null => {
			const state = get();
			const reviews = state.reviews.get(hotelId);
			return reviews?.overallRating || null;
		},
		
		// Obtener calificación de una categoría específica
		getCategoryRating: (hotelId: number, categoryName: string): CategoryRating | null => {
			const state = get();
			const reviews = state.reviews.get(hotelId);
			return reviews?.categoryRatings.find(cat => cat.name === categoryName) || null;
		},
		
		// Obtener comentarios de usuarios
		getUserReviews: (hotelId: number): HotelReview[] => {
			const state = get();
			const reviews = state.reviews.get(hotelId);
			return reviews?.userReviews || [];
		},
		
		// Limpiar todos los reviews
		clearReviews: () => {
			set(initialState);
		},
		
		// Limpiar reviews de un hotel específico
		clearHotelReviews: (hotelId: number) => {
			update(state => {
				state.reviews.delete(hotelId);
				return state;
			});
		}
	};
}

export const hotelReviewsStore = createHotelReviewsStore();
