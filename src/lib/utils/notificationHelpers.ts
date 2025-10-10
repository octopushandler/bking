/**
 * Sistema centralizado de notificaciones
 * Proporciona tipos, helpers y configuración para el manejo de notificaciones
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationAction {
	id: string;
	label: string;
	action: () => void;
	variant?: 'primary' | 'secondary' | 'danger';
}

export interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	duration?: number; // en milisegundos, 0 = persistente
	actions?: NotificationAction[];
	persistent?: boolean;
	createdAt: number;
}

export interface NotificationConfig {
	maxNotifications: number;
	defaultDuration: number;
	position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
	spacing: number;
}

// Configuración por defecto
export const DEFAULT_CONFIG: NotificationConfig = {
	maxNotifications: 3,
	defaultDuration: 5000, // 5 segundos
	position: 'bottom-right',
	spacing: 16 // 1rem en px
};

// Configuración de duración por tipo
export const DURATION_BY_TYPE: Record<NotificationType, number> = {
	success: 4000,
	error: 8000,
	warning: 6000,
	info: 5000
};

// Configuración de colores por tipo
export const COLORS_BY_TYPE: Record<NotificationType, {
	background: string;
	border: string;
	text: string;
	icon: string;
}> = {
	success: {
		background: 'bg-green-50',
		border: 'border-green-200',
		text: 'text-green-800',
		icon: 'text-green-400'
	},
	error: {
		background: 'bg-red-50',
		border: 'border-red-200',
		text: 'text-red-800',
		icon: 'text-red-400'
	},
	warning: {
		background: 'bg-yellow-50',
		border: 'border-yellow-200',
		text: 'text-yellow-800',
		icon: 'text-yellow-400'
	},
	info: {
		background: 'bg-blue-50',
		border: 'border-blue-200',
		text: 'text-blue-800',
		icon: 'text-blue-400'
	}
};

// Iconos por tipo
export const ICONS_BY_TYPE: Record<NotificationType, string> = {
	success: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
		<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
	</svg>`,
	error: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
		<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
	</svg>`,
	warning: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
		<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
	</svg>`,
	info: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
		<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
	</svg>`
};

// Helper para generar ID único
export function generateNotificationId(): string {
	return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper para crear notificación
export function createNotification(
	type: NotificationType,
	title: string,
	message: string,
	options: Partial<Omit<Notification, 'id' | 'type' | 'title' | 'message' | 'createdAt'>> = {}
): Notification {
	return {
		id: generateNotificationId(),
		type,
		title,
		message,
		duration: options.duration ?? DURATION_BY_TYPE[type],
		actions: options.actions,
		persistent: options.persistent ?? false,
		createdAt: Date.now()
	};
}
