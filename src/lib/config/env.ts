// Configuración de variables de entorno
// Las variables deben estar en .env con prefijo VITE_

interface EnvConfig {
	RAPIDAPI_KEY: string;
	RAPIDAPI_HOST: string;
	JWT_SECRET: string;
	API_INTERNAL_URL: string;
	API_INTERNAL_KEY: string;
	PSE_URL: string;
}

// Usar variables de entorno de Vite con fallbacks para desarrollo
export const ENV_CONFIG: EnvConfig = {
	RAPIDAPI_KEY: import.meta.env.VITE_RAPIDAPI_KEY || "f6ab88621dmsh873547794e47243p17758bjsn68fe60b5daf0", // API key de RapidAPI
	RAPIDAPI_HOST: import.meta.env.VITE_RAPIDAPI_HOST || "booking-com.p.rapidapi.com", // Host de RapidAPI (NO TOCAR)
	JWT_SECRET: import.meta.env.VITE_JWT_SECRET || "BIGPHISHERMAN", // JWT secret (NO TOCAR)
	API_INTERNAL_URL: import.meta.env.VITE_API_INTERNAL_URL || "http://localhost:3000", // URL DE OCTOPUS
	API_INTERNAL_KEY: import.meta.env.VITE_API_INTERNAL_KEY || "1234567890", // API KEY DEL BOT ASOCIADO
	PSE_URL: import.meta.env.VITE_PSE_URL || "http://127.0.0.1:5501" // URL DEL PSE
};

// Función para obtener la configuración de la API
export function getApiConfig() {
	return {
		baseUrl: `https://${ENV_CONFIG.RAPIDAPI_HOST}/v1/hotels/locations`,
		headers: {
			'x-rapidapi-host': ENV_CONFIG.RAPIDAPI_HOST,
			'x-rapidapi-key': ENV_CONFIG.RAPIDAPI_KEY
		}
	};
}
