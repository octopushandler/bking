// Configuración de variables de entorno
// Las variables deben estar en .env con prefijo VITE_

interface EnvConfig {
	RAPIDAPI_KEY: string;
	RAPIDAPI_HOST: string;
}

// Usar variables de entorno de Vite con fallbacks para desarrollo
export const ENV_CONFIG: EnvConfig = {
	RAPIDAPI_KEY: import.meta.env.VITE_RAPIDAPI_KEY || 'f6ab88621dmsh873547794e47243p17758bjsn68fe60b5daf0',
	RAPIDAPI_HOST: import.meta.env.VITE_RAPIDAPI_HOST || 'booking-com.p.rapidapi.com'
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
