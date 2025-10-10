// Utilidades para manejo de API con retry y timeout

export interface ApiRequestOptions {
	timeout?: number;
	maxRetries?: number;
	retryDelay?: number;
}

export interface ApiError extends Error {
	status?: number;
	statusText?: string;
	url?: string;
	isTimeout?: boolean;
	isNetworkError?: boolean;
}

// Función para hacer fetch con timeout
export async function fetchWithTimeout(
	url: string, 
	options: RequestInit = {}, 
	timeout: number = 10000
): Promise<Response> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);
	
	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal
		});
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		if (error instanceof Error && error.name === 'AbortError') {
			const timeoutError = new Error(`Request timeout after ${timeout}ms`) as ApiError;
			timeoutError.isTimeout = true;
			timeoutError.url = url;
			throw timeoutError;
		}
		throw error;
	}
}

// Función para hacer fetch con retry automático
export async function fetchWithRetry(
	url: string,
	options: RequestInit = {},
	requestOptions: ApiRequestOptions = {}
): Promise<Response> {
	const {
		timeout = 10000,
		maxRetries = 3,
		retryDelay = 1000
	} = requestOptions;
	
	let lastError: ApiError;
	
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			const response = await fetchWithTimeout(url, options, timeout);
			
			// Si la respuesta es exitosa, la devolvemos
			if (response.ok) {
				return response;
			}
			
			// Si es un error del servidor (5xx), intentamos de nuevo
			if (response.status >= 500 && attempt < maxRetries) {
				console.warn(`⚠️ Intento ${attempt + 1}/${maxRetries + 1} falló con status ${response.status}, reintentando...`);
				await delay(retryDelay * Math.pow(2, attempt)); // Backoff exponencial
				continue;
			}
			
			// Si es un error del cliente (4xx), no reintentamos
			const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as ApiError;
			error.status = response.status;
			error.statusText = response.statusText;
			error.url = url;
			throw error;
			
		} catch (error) {
			lastError = error as ApiError;
			
			// Si es un error de timeout o red, intentamos de nuevo
			if ((lastError.isTimeout || lastError.isNetworkError) && attempt < maxRetries) {
				console.warn(`⚠️ Intento ${attempt + 1}/${maxRetries + 1} falló por ${lastError.isTimeout ? 'timeout' : 'red'}, reintentando...`);
				await delay(retryDelay * Math.pow(2, attempt));
				continue;
			}
			
			// Si no podemos reintentar, lanzamos el error
			throw lastError;
		}
	}
	
	throw lastError!;
}

// Función helper para delay
function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para manejar errores de API de manera consistente
export function handleApiError(error: ApiError, context: string = 'API'): string {
	console.error(`❌ Error en ${context}:`, error);
	
	if (error.isTimeout) {
		return 'La solicitud tardó demasiado tiempo. Verifica tu conexión a internet.';
	}
	
	if (error.isNetworkError || !navigator.onLine) {
		return 'Error de conexión. Verifica tu conexión a internet.';
	}
	
	if (error.status) {
		switch (error.status) {
			case 400:
				return 'Solicitud inválida. Verifica los parámetros de búsqueda.';
			case 401:
				return 'Error de autenticación. La API key puede ser inválida.';
			case 403:
				return 'Acceso denegado. Verifica los permisos de la API.';
			case 404:
				return 'No se encontraron resultados para la búsqueda.';
			case 429:
				return 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.';
			case 500:
				return 'Error interno del servidor. Intenta de nuevo más tarde.';
			case 502:
			case 503:
			case 504:
				return 'Servicio temporalmente no disponible. Intenta de nuevo más tarde.';
			default:
				return `Error del servidor (${error.status}). Intenta de nuevo.`;
		}
	}
	
	// Error genérico
	return error.message || 'Error desconocido. Intenta de nuevo.';
}

// Función para crear una función de retry personalizada
export function createRetryFunction<T extends any[], R>(
	fn: (...args: T) => Promise<R>,
	options: ApiRequestOptions = {}
) {
	return async (...args: T): Promise<R> => {
		const { maxRetries = 3, retryDelay = 1000 } = options;
		let lastError: Error;
		
		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				return await fn(...args);
			} catch (error) {
				lastError = error as Error;
				
				if (attempt < maxRetries) {
					console.warn(`⚠️ Intento ${attempt + 1}/${maxRetries + 1} falló, reintentando...`);
					await delay(retryDelay * Math.pow(2, attempt));
					continue;
				}
				
				throw lastError;
			}
		}
		
		throw lastError!;
	};
}
