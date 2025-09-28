<script>
    import Footer from './Footer.svelte';
</script>

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
    <p class="text-zinc-500">Opciones más populares entre la comunidad viajera de Colombia</p>
    
    <div class="flex flex-col gap-4 mt-6 sm:grid sm:grid-cols-12">
        <!-- Primera fila: 2 columnas (2/3 y 1/3) -->
        <div class="h-[200px] relative overflow-hidden rounded-lg shadow-lg group cursor-pointer sm:col-span-8">
            <img src="/assets/common/bogota.jpg" alt="Bogotá" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>
            <div class="absolute top-4 left-4 flex items-center gap-2">
                <h3 class="text-white text-xl font-bold">Bogotá</h3>
                <img src="/assets/common/co.png" alt="Colombia" class="w-5 h-auto">
            </div>
        </div>
        
        <div class="h-[200px] relative overflow-hidden rounded-lg shadow-lg group cursor-pointer sm:col-span-4">
            <img src="/assets/common/medellin.jpg" alt="Medellín" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>
            <div class="absolute top-4 left-4 flex items-center gap-2">
                <h3 class="text-white text-xl font-bold">Medellín</h3>
                <img src="/assets/common/co.png" alt="Colombia" class="w-5 h-auto">
            </div>
        </div>
        
        <!-- Segunda fila: 3 columnas variadas -->
        <div class="h-[200px] relative overflow-hidden rounded-lg shadow-lg group cursor-pointer sm:col-span-5">
            <img src="/assets/common/cartagena.jpeg" alt="Cartagena" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>
            <div class="absolute top-4 left-4 flex items-center gap-2">
                <h3 class="text-white text-xl font-bold">Cartagena</h3>
                <img src="/assets/common/co.png" alt="Colombia" class="w-5 h-auto">
            </div>
        </div>
        
        <div class="h-[200px] relative overflow-hidden rounded-lg shadow-lg group cursor-pointer sm:col-span-4">
            <img src="/assets/common/santa_marta.jpeg" alt="Santa Marta" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>
            <div class="absolute top-4 left-4 flex items-center gap-2">
                <h3 class="text-white text-xl font-bold">Santa Marta</h3>
                <img src="/assets/common/co.png" alt="Colombia" class="w-5 h-auto">
            </div>
        </div>
        
        <div class="h-[200px] relative overflow-hidden rounded-lg shadow-lg group cursor-pointer sm:col-span-3">
            <img src="/assets/common/barranquilla.jpg" alt="Barranquilla" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>
            <div class="absolute top-4 left-4 flex items-center gap-2">
                <h3 class="text-white text-xl font-bold">Barranquilla</h3>
                <img src="/assets/common/co.png" alt="Colombia" class="w-5 h-auto">
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