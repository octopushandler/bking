import { writable, derived } from 'svelte/store';
import type { 
	Notification, 
	NotificationType, 
	NotificationConfig,
	NotificationAction 
} from '$lib/utils/notificationHelpers';
import { 
	createNotification, 
	DEFAULT_CONFIG, 
	DURATION_BY_TYPE 
} from '$lib/utils/notificationHelpers';

// Estado del store
interface NotificationState {
	notifications: Notification[];
	config: NotificationConfig;
}

// Estado inicial
const initialState: NotificationState = {
	notifications: [],
	config: DEFAULT_CONFIG
};

// Store principal
const notificationStore = writable<NotificationState>(initialState);

// Store derivado para obtener solo las notificaciones
export const notifications = derived(notificationStore, $state => $state.notifications);

// Store derivado para obtener la configuración
export const notificationConfig = derived(notificationStore, $state => $state.config);

// Funciones para manejar notificaciones
export const notificationActions = {
	/**
	 * Agregar una nueva notificación
	 */
	add: (notification: Notification) => {
		notificationStore.update(state => {
			const newNotifications = [...state.notifications, notification];
			
			// Limitar el número máximo de notificaciones
			if (newNotifications.length > state.config.maxNotifications) {
				// Remover las más antiguas
				const sorted = newNotifications
					.sort((a, b) => a.createdAt - b.createdAt);
				return {
					...state,
					notifications: sorted.slice(-state.config.maxNotifications)
				};
			}
			
			return {
				...state,
				notifications: newNotifications
			};
		});
	},

	/**
	 * Remover una notificación por ID
	 */
	remove: (id: string) => {
		notificationStore.update(state => ({
			...state,
			notifications: state.notifications.filter(n => n.id !== id)
		}));
	},

	/**
	 * Limpiar todas las notificaciones
	 */
	clear: () => {
		notificationStore.update(state => ({
			...state,
			notifications: []
		}));
	},

	/**
	 * Actualizar configuración
	 */
	updateConfig: (newConfig: Partial<NotificationConfig>) => {
		notificationStore.update(state => ({
			...state,
			config: { ...state.config, ...newConfig }
		}));
	},

	/**
	 * Ejecutar acción de una notificación
	 */
	executeAction: (notificationId: string, actionId: string) => {
		notificationStore.update(state => {
			const notification = state.notifications.find(n => n.id === notificationId);
			if (notification?.actions) {
				const action = notification.actions.find(a => a.id === actionId);
				if (action) {
					action.action();
				}
			}
			return state;
		});
	}
};

// API simplificada para crear notificaciones
export const notificationAPI = {
	/**
	 * Mostrar notificación de éxito
	 */
	success: (title: string, message: string, options?: {
		duration?: number;
		actions?: NotificationAction[];
		persistent?: boolean;
	}) => {
		const notification = createNotification('success', title, message, options);
		notificationActions.add(notification);
		return notification.id;
	},

	/**
	 * Mostrar notificación de error
	 */
	error: (title: string, message: string, options?: {
		duration?: number;
		actions?: NotificationAction[];
		persistent?: boolean;
	}) => {
		const notification = createNotification('error', title, message, options);
		notificationActions.add(notification);
		return notification.id;
	},

	/**
	 * Mostrar notificación de advertencia
	 */
	warning: (title: string, message: string, options?: {
		duration?: number;
		actions?: NotificationAction[];
		persistent?: boolean;
	}) => {
		const notification = createNotification('warning', title, message, options);
		notificationActions.add(notification);
		return notification.id;
	},

	/**
	 * Mostrar notificación informativa
	 */
	info: (title: string, message: string, options?: {
		duration?: number;
		actions?: NotificationAction[];
		persistent?: boolean;
	}) => {
		const notification = createNotification('info', title, message, options);
		notificationActions.add(notification);
		return notification.id;
	},

	/**
	 * Mostrar notificación personalizada
	 */
	show: (type: NotificationType, title: string, message: string, options?: {
		duration?: number;
		actions?: NotificationAction[];
		persistent?: boolean;
	}) => {
		const notification = createNotification(type, title, message, options);
		notificationActions.add(notification);
		return notification.id;
	},

	/**
	 * Remover notificación
	 */
	dismiss: (id: string) => {
		notificationActions.remove(id);
	},

	/**
	 * Limpiar todas las notificaciones
	 */
	clear: () => {
		notificationActions.clear();
	}
};

// Exportar el store principal para casos avanzados
export { notificationStore };
