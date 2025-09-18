# Booki - Plataforma de Reservas

Una aplicación moderna de reservas de hoteles y viajes construida con SvelteKit, inspirada en Booking.com.

## 🚀 Características

- **Búsqueda Inteligente**: Autocompletado de destinos con API de Booking.com
- **Formulario Avanzado**: Selección de fechas, huéspedes y habitaciones
- **Diseño Responsivo**: Optimizado para móviles y escritorio
- **Accesibilidad**: Cumple con estándares WCAG 2.1
- **SEO Optimizado**: Meta tags, structured data y Open Graph
- **TypeScript**: Tipado fuerte para mejor desarrollo
- **Manejo de Errores**: Sistema robusto de manejo de errores global
- **Loading States**: Estados de carga elegantes

## 🛠️ Tecnologías

- **SvelteKit** - Framework principal
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos y diseño
- **Vite** - Build tool y dev server
- **RapidAPI** - Integración con Booking.com

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd booki-svelte

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
# Editar .env con tu API key de RapidAPI
```

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
npm run dev -- --open
```

## 🏗️ Construcción

```bash
# Construir para producción
npm run build

# Preview de la construcción
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── lib/
│   ├── components/          # Componentes reutilizables
│   │   ├── Header.svelte
│   │   ├── Navbar.svelte
│   │   ├── Hero.svelte
│   │   ├── SearchForm.svelte
│   │   ├── ErrorBoundary.svelte
│   │   └── LoadingSpinner.svelte
│   ├── config/             # Configuración de API
│   │   ├── api.ts
│   │   └── env.ts
│   ├── stores/             # Estado global
│   │   └── app.ts
│   └── index.ts            # Exportaciones principales
├── routes/                 # Páginas de SvelteKit
│   ├── +layout.svelte
│   └── +page.svelte
└── app.css                 # Estilos globales
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
RAPIDAPI_KEY=tu_clave_api_aqui
RAPIDAPI_HOST=booking-com.p.rapidapi.com
```

### API de Booking.com

El proyecto utiliza la API de Booking.com a través de RapidAPI para:
- Búsqueda de destinos
- Autocompletado de ciudades y hoteles
- Información de ubicaciones

## 🎨 Personalización

### Colores

Los colores principales están definidos en `tailwind.config.js`:

```javascript
colors: {
  booking: {
    yellow: '#ffb700',
    blue: '#006ce4',
    darkBlue: '#003b95'
  }
}
```

### Componentes

Todos los componentes están en `src/lib/components/` y pueden ser importados desde `$lib`:

```svelte
<script>
  import { SearchForm, ErrorBoundary } from '$lib';
</script>
```

## ♿ Accesibilidad

El proyecto incluye:
- Navegación por teclado
- Etiquetas ARIA apropiadas
- Contraste de colores optimizado
- Lectores de pantalla compatibles
- Skip links para navegación

## 🔍 SEO

Optimizaciones incluidas:
- Meta tags dinámicos
- Open Graph y Twitter Cards
- Structured data (Schema.org)
- Sitemap automático
- URLs semánticas

## 🚀 Despliegue

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Netlify

```bash
# Build del proyecto
npm run build

# Desplegar carpeta build/
```

## 📝 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construcción para producción
- `npm run preview` - Preview de la construcción
- `npm run check` - Verificación de tipos TypeScript

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [SvelteKit](https://kit.svelte.dev/) - Framework principal
- [Tailwind CSS](https://tailwindcss.com/) - Sistema de estilos
- [Booking.com API](https://rapidapi.com/booking/api/booking-com) - Datos de reservas
- [RapidAPI](https://rapidapi.com/) - Plataforma de APIs
