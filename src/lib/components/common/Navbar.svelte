<script lang="ts">
	// Componente Navbar
	let isMenuOpen = false;
	
	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}
</script>

<!-- TOP NAVBAR -->
<header class="flex items-center justify-between p-3">
	<a href="/" class="flex-shrink-0" aria-label="Booki - Página principal">
		<img src="/assets/navbar/booking_logo.png" class="w-[150px]" alt="Booki Logo"/>
	</a>

	<!-- PC -->
	<nav class="hidden md:flex items-center gap-6 text-white" aria-label="Navegación principal">
		<div class="flex items-center gap-2" role="button" tabindex="0" aria-label="Moneda: Peso colombiano">
			<span class="font-semibold">COP</span>
			<img src="/assets/navbar/col_icon.png" class="w-[27px]" alt="Bandera de Colombia"/>
		</div>
		<button class="cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded px-2 py-1" aria-label="Registra tu alojamiento">
			Registra tu alojamiento
		</button>
		<button class="bg-white text-blue-500 px-3 py-2 rounded-md text-sm font-semibold cursor-pointer border border-blue-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors" aria-label="Crear cuenta">
			Hazte una cuenta
		</button>
		<button class="bg-white text-blue-500 px-3 py-2 rounded-md text-sm font-semibold cursor-pointer border border-blue-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors" aria-label="Iniciar sesión">
			Inicia sesión
		</button>
	</nav>

	<!-- MOBILE -->
	<div class="md:hidden flex flex-row items-center gap-3">
		<button class="p-2 hover:bg-white hover:bg-opacity-10 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50" aria-label="Perfil de usuario">
			<img src="/assets/navbar/user_icon.png" class="w-[35px]" alt="Icono de usuario"/>
		</button>
		<button 
			class="p-2 hover:bg-white hover:bg-opacity-10 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50" 
			on:click={toggleMenu}
			aria-label="Menú de navegación"
			aria-expanded={isMenuOpen}
		>
			<img src="/assets/navbar/burguer_icon.png" class="w-[25px] h-[20px]" alt="Icono de menú"/>
		</button>
	</div>
</header>

<!-- NAVBAR -->
<nav class="flex flex-row items-center justify-start gap-3 md:gap-6 text-white text-sm p-3 overflow-x-scroll scrollbar-hidden" aria-label="Categorías de servicios">
	<button class="border border-white rounded-full flex items-center gap-2 px-4 py-2 cursor-pointer bg-[#1a4fa0] flex-shrink-0 whitespace-nowrap hover:bg-[#2a5fb0] focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors" aria-label="Buscar alojamientos" aria-current="page">
		<img src="/assets/navbar/alojamiento_icon.png" class="w-[20px]" alt=""/>
		<span>Alojamiento</span>
	</button>
	<button class="px-3 py-[8px] rounded-full hover:bg-[#1a4fa0] flex items-center gap-2 cursor-pointer flex-shrink-0 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors" aria-label="Buscar vuelos">
		<img src="/assets/navbar/vuelo_icon.png" class="w-[20px]" alt=""/>
		<span>Vuelos</span>
	</button>
	<button class="px-3 py-[8px] rounded-full hover:bg-[#1a4fa0] flex items-center gap-2 cursor-pointer flex-shrink-0 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors" aria-label="Buscar alquiler de autos">
		<img src="/assets/navbar/alquiler_icon.png" class="w-[20px]" alt=""/>
		<span>Alquiler</span>
	</button>
	<button class="px-3 py-[8px] rounded-full hover:bg-[#1a4fa0] flex items-center gap-2 cursor-pointer flex-shrink-0 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors" aria-label="Buscar atracciones">
		<img src="/assets/navbar/atracciones_icon.png" class="w-[20px]" alt=""/>
		<span>Atracciones</span>
	</button>
	<button class="px-3 py-[8px] rounded-full hover:bg-[#1a4fa0] flex items-center gap-2 cursor-pointer flex-shrink-0 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors" aria-label="Buscar taxis">
		<img src="/assets/navbar/taxi_icon.png" class="w-[20px]" alt=""/>
		<span>Taxi</span>
	</button>
</nav>

<!-- Slot para contenido adicional -->
<slot />

<style>
	/* Ocultar scrollbar en WebKit (Chrome, Safari, Edge) */
	.scrollbar-hidden::-webkit-scrollbar {
		display: none;
	}
	
	/* Ocultar scrollbar en Firefox */
	.scrollbar-hidden {
		scrollbar-width: none;
	}
	
	/* Mantener funcionalidad de scroll */
	.scrollbar-hidden {
		-ms-overflow-style: none;
	}
</style>
