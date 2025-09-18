// Configuración de variables de entorno
// En producción, estas variables deben estar en .env

interface EnvConfig {
	RAPIDAPI_KEY: string;
	RAPIDAPI_HOST: string;
}

export const ENV_CONFIG: EnvConfig = {
	RAPIDAPI_KEY: 'f6ab88621dmsh873547794e47243p17758bjsn68fe60b5daf0',
	RAPIDAPI_HOST: 'booking-com.p.rapidapi.com'
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
