# Sistema de Notificaciones Centralizado

## 📋 Descripción

Sistema centralizado para manejar todas las notificaciones, alertas y mensajes de la aplicación. Reemplaza las implementaciones inconsistentes anteriores con un sistema unificado y escalable.

## 🏗️ Arquitectura

### Archivos principales:
- `src/lib/utils/notificationHelpers.ts` - Tipos, helpers y configuración
- `src/lib/stores/notifications.ts` - Store centralizado y API
- `src/lib/components/common/NotificationToast.svelte` - Componente individual de notificación
- `src/lib/components/common/NotificationContainer.svelte` - Contenedor de notificaciones

### Integración:
- `src/routes/+layout.svelte` - Integración global del sistema

## 🚀 Uso

### API Simplificada

```typescript
import { notificationAPI } from '$lib/stores/notifications';

// Notificaciones básicas
notificationAPI.success('Éxito', 'Operación completada');
notificationAPI.error('Error', 'Algo salió mal');
notificationAPI.warning('Advertencia', 'Ten cuidado');
notificationAPI.info('Información', 'Datos actualizados');

// Notificaciones con opciones
notificationAPI.error('Error de conexión', 'No se pudo conectar al servidor', {
  duration: 10000, // 10 segundos
  actions: [
    {
      id: 'retry',
      label: 'Reintentar',
      action: () => retryConnection(),
      variant: 'primary'
    }
  ],
  persistent: false
});
```

### Tipos de Notificación

- **success**: Verde, 4 segundos por defecto
- **error**: Rojo, 8 segundos por defecto  
- **warning**: Amarillo, 6 segundos por defecto
- **info**: Azul, 5 segundos por defecto

### Configuración

```typescript
import { notificationActions } from '$lib/stores/notifications';

// Actualizar configuración global
notificationActions.updateConfig({
  maxNotifications: 5,
  defaultDuration: 6000,
  position: 'top-left',
  spacing: 20
});
```

## 🎨 Características

### Visual
- ✅ Colores consistentes por tipo
- ✅ Iconos apropiados para cada tipo
- ✅ Animaciones suaves de entrada/salida
- ✅ Barra de progreso para auto-dismiss
- ✅ Diseño responsivo

### Funcional
- ✅ Cola automática de notificaciones
- ✅ Pausar timer al hacer hover
- ✅ Botones de acción personalizables
- ✅ Notificaciones persistentes
- ✅ Auto-dismiss configurable

### Accesibilidad
- ✅ ARIA labels apropiados
- ✅ Navegación por teclado
- ✅ Contraste de colores adecuado
- ✅ Screen reader friendly

## 🔧 Migración

### Antes (legacy):
```svelte
{#if errorMessage}
  <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
    {errorMessage}
  </div>
{/if}
```

### Después (nuevo sistema):
```typescript
notificationAPI.error('Error', errorMessage);
```

## 📊 Beneficios

1. **Consistencia**: Todas las notificaciones tienen el mismo diseño
2. **Mantenibilidad**: Un solo lugar para modificar el comportamiento
3. **Escalabilidad**: Fácil agregar nuevos tipos o funcionalidades
4. **UX mejorada**: Animaciones y interacciones consistentes
5. **Accesibilidad**: Cumple estándares de accesibilidad web
6. **Testing**: Más fácil de testear y debuggear

## 🚨 Notas Importantes

- Las notificaciones se muestran en la esquina superior derecha por defecto
- Máximo 3 notificaciones simultáneas (configurable)
- Las notificaciones con acciones no se auto-dismissan
- El sistema es completamente reactivo y funciona con SSR
