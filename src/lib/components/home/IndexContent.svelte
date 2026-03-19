<script>
    import Footer from '../common/footer.svelte';
    import { PRICE_DISCOUNT } from '$lib/config/discount';
    
    function scrollToTop() {
        const mainContent = document.querySelector('#main-content');
        if (mainContent) {
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Calcular el porcentaje de descuento para mostrar
    const discountPercentage = Math.round(PRICE_DISCOUNT * 100);
</script>

<!-- BANNER BLACK DAYS - 20% OFF -->
<section class="max-w-[1100px] mx-auto mt-40 md:mt-20 px-4 mb-12">
    <div class="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 transform transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
        <!-- Efecto de brillo animado -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        <!-- Patrón de fondo decorativo -->
        <div class="absolute inset-0 opacity-20">
            <div class="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div class="absolute bottom-0 right-0 w-40 h-40 bg-primary-300 rounded-full blur-3xl"></div>
        </div>
        
        <!-- Contenido del banner -->
        <div class="relative z-10 px-6 py-8 md:px-12 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <!-- Texto principal -->
            <div class="flex-1 text-center md:text-left">
                <div class="inline-block mb-2 px-3 py-1 bg-white/90 text-primary-700 text-xs md:text-sm font-bold rounded-full animate-pulse shadow-lg">
                    🎉 OFERTA ESPECIAL
                </div>
                <h2 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-2" style="font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">
                    <span class="text-white">{discountPercentage}% OFF</span>
                </h2>
                <p class="text-xl md:text-3xl lg:text-4xl text-white font-bold mb-1" style="font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);">
                    POR BLACK DAYS
                </p>
                <p class="text-sm md:text-base text-white/90 mt-2">
                    Aprovecha esta increíble oferta en todas tus reservas
                </p>
            </div>
            
            <!-- Badge de descuento animado -->
            <div class="flex-shrink-0">
                <div class="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                    <!-- Círculo exterior animado -->
                    <div class="absolute inset-0 border-4 border-white/80 rounded-full animate-spin-slow" style="animation: spin 8s linear infinite;"></div>
                    <div class="absolute inset-2 border-2 border-primary-300 rounded-full"></div>
                    
                    <!-- Contenido del badge -->
                    <div class="relative z-10 bg-white rounded-full w-24 h-24 md:w-32 md:h-32 flex flex-col items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                        <span class="text-primary-600 font-bold text-2xl md:text-4xl" style="font-family: 'Bebas Neue', sans-serif;">{discountPercentage}%</span>
                        <span class="text-primary-700 font-bold text-xs md:text-sm" style="font-family: 'Bebas Neue', sans-serif;">OFF</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Efectos de partículas decorativas -->
        <div class="absolute top-4 right-4 w-2 h-2 bg-white rounded-full animate-ping"></div>
        <div class="absolute bottom-4 left-4 w-2 h-2 bg-primary-300 rounded-full animate-ping" style="animation-delay: 0.5s;"></div>
        
        <!-- Flecha apuntando hacia arriba -->
        <div class="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 animate-bounce-arrow">
            <div class="flex flex-col items-center cursor-pointer group/arrow" on:click={scrollToTop} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && scrollToTop()}>
                <svg class="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg transform group-hover/arrow:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"></path>
                </svg>
                <span class="text-white text-xs font-bold mt-1 opacity-80">Buscar</span>
            </div>
        </div>
    </div>
</section>

<style>
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .animate-spin-slow {
        animation: spin 8s linear infinite;
    }
    @keyframes bounceArrow {
        0%, 100% { transform: translate(-50%, 0); }
        50% { transform: translate(-50%, -8px); }
    }
    .animate-bounce-arrow {
        animation: bounceArrow 2s ease-in-out infinite;
    }
</style>

<!-- SECCIÓN DE POR QUÉ ELEGIRNOS -->
<section class="max-w-[1100px] mx-auto mt-40 md:mt-20 px-4">
    <p class="text-2xl font-bold mb-5">¿Por qué elegirnos?</p>
    <!-- Mobile Layout: Lista vertical -->
    <div class="block sm:hidden">
        <div class="bg-white">
            <div class="flex items-center p-4 border-b border-gray-200">
                <div class="w-[60px] h-[60px] flex items-center justify-center mr-4">
                    <img src="/assets/common/free_cancellation.png" class="w-[50px] object-contain">
                </div>
                <div class="flex-1">
                    <p class="font-bold text-md mb-1">Reserva ahora, paga en el alojamiento</p>
                    <p class="text-sm text-gray-600">Cancelación GRATIS en la mayoría de las habitaciones</p>
                </div>
            </div>
            <div class="flex items-center p-4 border-b border-gray-200">
                <div class="w-[60px] h-[60px] flex items-center justify-center mr-4">
                    <img src="/assets/common/reviews.png" class="w-[50px] object-contain">
                </div>
                <div class="flex-1">
                    <p class="font-bold text-md mb-1">Más de 300 millones de comentarios de la comunidad viajera</p>
                    <p class="text-sm text-gray-600">Consigue información fiable de gente que viaja como tú</p>
                </div>
            </div>
            <div class="flex items-center p-4 border-b border-gray-200">
                <div class="w-[60px] h-[60px] flex items-center justify-center mr-4">
                    <img src="/assets/common/tripsglobe.png" class="w-[40px] object-contain">
                </div>
                <div class="flex-1">
                    <p class="font-bold text-md mb-1">Más de dos millones de alojamientos en todo el mundo</p>
                    <p class="text-sm text-gray-600">Hoteles, hostales, apartamentos y mucho más...</p>
                </div>
            </div>
            <div class="flex items-center p-4">
                <div class="w-[60px] h-[60px] flex items-center justify-center mr-4">
                    <img src="/assets/common/customsupport.png" class="w-[40px] object-contain">
                </div>
                <div class="flex-1">
                    <p class="font-bold text-md mb-1">Atención al cliente de confianza, 24/7</p>
                    <p class="text-sm text-gray-600">Te ayudamos cuando lo necesites</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Desktop/Tablet Layout: Grid -->
    <div class="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card bg-zinc-100">
            <div class="h-[60px] flex items-end justify-start">
                <img src="/assets/common/free_cancellation.png" class="w-[70px] object-contain">
            </div>
            <p class="font-bold text-md mb-2">Reserva ahora, paga en el alojamiento</p>
            <p class="text-sm">Cancelación GRATIS en la mayoría de las habitaciones</p>
        </div>
        <div class="card bg-zinc-100">
            <div class="h-[60px] flex items-end justify-start">
                <img src="/assets/common/reviews.png" class="w-[70px] object-contain">
            </div>
            <p class="font-bold text-md mb-2">Más de 300 millones de comentarios de la comunidad viajera</p>
            <p class="text-sm">Consigue información fiable de gente que viaja como tú</p>
        </div>
        <div class="card bg-zinc-100">
            <div class="h-[60px] flex items-end justify-start">
                <img src="/assets/common/tripsglobe.png" class="w-[50px] object-contain">
            </div>
            <p class="font-bold text-md mb-2">Más de dos millones de alojamientos en todo el mundo</p>
            <p class="text-sm">Hoteles, hostales, apartamentos y mucho más...</p>
        </div>
        <div class="card bg-zinc-100">
            <div class="h-[60px] flex items-end justify-start">
                <img src="/assets/common/customsupport.png" class="w-[50px] object-contain">
            </div>
            <p class="font-bold text-md mb-2">Atención al cliente de confianza, 24/7</p>
            <p class="text-sm">Te ayudamos cuando lo necesites</p>
        </div>
    </div>
</section>

<!-- SECCIÓN DE DESTINOS NACIONALES POPULARES -->
<section class="max-w-[1100px] mx-auto mt-20 px-4">
    <p class="text-2xl font-bold mb-2">Destinos de moda</p>
    <p class="text-zinc-500">Opciones más populares entre la comunidad viajera de Ecuador</p>
    
    <div class="flex flex-col gap-4 mt-6 sm:grid sm:grid-cols-12">
        <!-- Primera fila: 2 columnas (2/3 y 1/3) -->
        <div class="h-[200px] relative overflow-hidden rounded-lg shadow-lg group cursor-pointer sm:col-span-8">
            <img src="/assets/common/galapagos.jpg" alt="Galápagos" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>
            <div class="absolute top-4 left-4 flex items-center gap-2">
                <h3 class="text-white text-xl font-bold">Galápagos</h3>
                <img src="/assets/common/ec.png" alt="Ecuador" class="w-5 h-auto">
            </div>
        </div>
        
        <div class="h-[200px] relative overflow-hidden rounded-lg shadow-lg group cursor-pointer sm:col-span-4">
            <img src="/assets/common/Quito.png" alt="Quito" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>
            <div class="absolute top-4 left-4 flex items-center gap-2">
                <h3 class="text-white text-xl font-bold">Quito</h3>
                <img src="/assets/common/ec.png" alt="Ecuador" class="w-5 h-auto">
            </div>
        </div>
        
        <!-- Segunda fila: 3 columnas variadas -->
        <div class="h-[200px] relative overflow-hidden rounded-lg shadow-lg group cursor-pointer sm:col-span-5">
            <img src="/assets/common/cuenca.jpg" alt="Cuenca" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>
            <div class="absolute top-4 left-4 flex items-center gap-2">
                <h3 class="text-white text-xl font-bold">Cuenca</h3>
                <img src="/assets/common/ec.png" alt="Ecuador" class="w-5 h-auto">
            </div>
        </div>
        
        <div class="h-[200px] relative overflow-hidden rounded-lg shadow-lg group cursor-pointer sm:col-span-4">
            <img src="/assets/common/agua_santa.png" alt="Baños de Agua Santa" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>
            <div class="absolute top-4 left-4 flex items-center gap-2">
                <h3 class="text-white text-xl font-bold">Baños de Agua Santa</h3>
                <img src="/assets/common/ec.png" alt="Ecuador" class="w-5 h-auto">
            </div>
        </div>
        
        <div class="h-[200px] relative overflow-hidden rounded-lg shadow-lg group cursor-pointer sm:col-span-3">
            <img src="/assets/common/guayaquil.png" alt="Guayaquil" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>
            <div class="absolute top-4 left-4 flex items-center gap-2">
                <h3 class="text-white text-xl font-bold">Guayaquil</h3>
                <img src="/assets/common/ec.png" alt="Ecuador" class="w-5 h-auto">
            </div>
        </div>
    </div>
</section>


<!-- SECCIÓN DE ALQUILERES VACACIONALES -->
<section class="max-w-[1100px] mx-auto mt-20 pl-4 pr-0 mb-20">
    <div class="p-4 flex flex-col gap-5 md:flex-row justify-between items-center rounded-lg md:overflow-hidden border border-1 border-gray-100 w-full md:h-[200px]">
        <div>
            <p class="text-2xl font-bold text-wrap mb-2">¿Quieres sentirte como en casa en tu próxima aventura?</p>
            <button class="hover:bg-primary-600 transition-colors duration-300 bg-primary-500 text-white px-4 py-2 rounded-lg">
                Descubre los alquileres vacacionales
            </button>
        </div>
        <img src="/assets/common/item.png" class="w-full">
    </div>
</section>

<Footer />
