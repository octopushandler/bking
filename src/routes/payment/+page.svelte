<script lang="ts">
    import Header from '$lib/components/common/Header.svelte';
	import Navbar from '$lib/components/common/Navbar.svelte';
	import Footer from '$lib/components/common/footer.svelte';
</script>

<svelte:head>
	<title>Terminar Reserva - Holiday Inn Express Yopal</title>
	<meta name="description" content="Completa tu reserva de hotel" />
</svelte:head>

<style>
	/* Minimal custom styles */
	.step-line {
		position: absolute;
		top: 16px;
		left: 0;
		right: 0;
		height: 2px;
		background-color: #e5e7eb;
		z-index: 0;
	}
	.step-line-active {
		background-color: #0071c2;
	}
</style>

<Header>
	<Navbar />
</Header>

<main class="bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 py-8">
		<div class="mb-8">
			<div class="relative flex items-center justify-between max-w-3xl mx-auto">
				<div class="step-line step-line-active"></div>
				
				<div class="relative z-10 flex flex-col items-center">
					<div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold mb-2">
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
						</svg>
					</div>
					<span class="text-xs font-medium text-gray-900">Tu selección</span>
				</div>
				
				<div class="relative z-10 flex flex-col items-center">
					<div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold mb-2">
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
						</svg>
					</div>
					<span class="text-xs font-medium text-gray-900">Tus datos</span>
				</div>
				
				<div class="relative z-10 flex flex-col items-center">
					<div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold mb-2">
						3
					</div>
					<span class="text-xs font-medium text-gray-900">Terminar reserva</span>
				</div>
			</div>
		</div>

		<div class="flex flex-col md:flex-row gap-6">
			<div class="md:w-1/3 space-y-4">
				<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
					<img src="/assets/hotel/static1.jpg" alt="Holiday Inn Express Yopal" class="w-full h-48 object-cover">
					<div class="p-4">
						<div class="flex items-center gap-1 mb-2">
							<svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
								<path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
							</svg>
							<svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
								<path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
							</svg>
							<svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
								<path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
							</svg>
							<svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
								<path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
							</svg>
							<span class="ml-1 px-1.5 py-0.5 bg-yellow-400 text-white text-xs font-bold rounded">IH</span>
						</div>
						<h2 class="text-lg font-bold text-gray-900 mb-1">Holiday Inn Express Yopal by IHG</h2>
						<p class="text-sm text-gray-600 mb-2">Carrera 29 No. 13-64, 850001 Yopal, Colombia</p>
						<p class="text-xs text-green-700 mb-3">Excelente ubicación — 9,6</p>
						<div class="flex items-center gap-2 mb-2">
							<span class="px-2 py-1 bg-blue-600 text-white text-sm font-bold rounded">9,0</span>
							<div>
								<p class="text-sm font-semibold text-gray-900">Fantástico</p>
								<p class="text-xs text-gray-600">624 comentarios</p>
							</div>
						</div>
						<div class="space-y-1 text-sm text-gray-700">
							<div class="flex items-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
								</svg>
								<span>WiFi gratis</span>
							</div>
							<div class="flex items-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
								</svg>
								<span>Traslado aeropuerto</span>
							</div>
							<div class="flex items-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
								</svg>
								<span>Parking</span>
							</div>
							<div class="flex items-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"/>
								</svg>
								<span>Piscina</span>
							</div>
						</div>
					</div>
				</div>

				<div class="bg-white rounded-lg border border-gray-200 p-4">
					<h3 class="text-lg font-bold text-gray-900 mb-3">Los datos de tu reserva</h3>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<p class="text-sm font-semibold text-gray-900 mb-1">Entrada</p>
							<p class="text-sm text-gray-700">mar, 4 nov 2025</p>
							<p class="text-xs text-gray-600">De 16:00</p>
						</div>
						<div>
							<p class="text-sm font-semibold text-gray-900 mb-1">Salida</p>
							<p class="text-sm text-gray-700">jue, 6 nov 2025</p>
							<p class="text-xs text-gray-600">A 12:00</p>
						</div>
					</div>
				</div>

				<div class="bg-white rounded-lg border border-gray-200 p-4">
					<h3 class="text-lg font-bold text-gray-900 mb-3">Desglose del precio</h3>
					<div class="mb-4">
						<div class="flex justify-between items-start mb-2">
							<span class="text-xl font-bold text-gray-900">Precio</span>
							<span class="text-xl font-bold text-gray-900">COP 489.300</span>
						</div>
						<p class="text-xs text-gray-600 text-right">Se pueden aplicar otros cargos</p>
						<p class="text-xs text-gray-600 text-right">En la moneda del alojamiento: US$126,40</p>
					</div>
					
					<div class="border-t pt-3 space-y-3">
						<h4 class="text-sm font-semibold text-gray-900">Información sobre el precio</h4>
						
						<div class="flex gap-2 text-sm">
							<svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
							</svg>
							<p class="text-gray-700">No incluye <span class="font-semibold">COP 92.980</span> de impuestos y cargos</p>
						</div>
						<p class="text-sm text-gray-700 ml-7">19% IVA <span class="float-right">COP 92.980</span></p>
						
						<div class="flex gap-2 text-sm">
							<svg class="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
							<p class="text-gray-700">En función de la nacionalidad, pueden aplicarse cargos por IVA adicional. Se aceptan exenciones y deben enviarse a las autoridades antes de tu llegada.</p>
						</div>
					</div>
				</div>
				
				<div class="bg-white rounded-lg border border-gray-200 p-4">
					<h3 class="text-lg font-bold text-gray-900 mb-3">¿Cuánto cuesta cancelar?</h3>
					<p class="text-sm font-semibold text-green-700 mb-2">Cancelación gratis antes del 28 oct</p>
					<div class="flex justify-between text-sm text-gray-700">
						<span>A partir de las 0:00 del 28 oct</span>
						<span class="font-semibold">COP 244.660</span>
					</div>
				</div>

				<div class="bg-white rounded-lg border border-gray-200 p-4">
					<h3 class="text-lg font-bold text-gray-900 mb-3">Información del pago</h3>
					<div class="flex justify-between text-sm mb-4">
						<span class="text-gray-700">El alojamiento te cobrará</span>
						<span class="font-semibold text-gray-900">COP 582.280</span>
					</div>
					
					<div class="border-t pt-4">
						<h4 class="text-sm font-semibold text-gray-900 mb-3">¿Tienes un código promocional?</h4>
						<label for="promo-code" class="block text-sm text-gray-900 mb-2">Introduce tu código promocional</label>
						<input id="promo-code" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2">
						<button class="px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded hover:bg-blue-50">
							Aplicar
						</button>
					</div>
				</div>
			</div>

			<div class="md:w-2/3 space-y-4">
				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<h3 class="text-xl font-bold text-gray-900 mb-4">Paga cuando te alojes</h3>
					<div class="flex gap-3">
						<svg class="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
						</svg>
						<p class="text-sm text-gray-900">El alojamiento gestionará el pago. La fecha del cobro dependerá de las condiciones de tu reserva.</p>
					</div>
				</div>

				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<h3 class="text-xl font-bold text-gray-900 mb-4">¿Cómo quieres pagar?</h3>
					
					<div class="flex gap-3 mb-6">
						<img src="/placeholder.svg?height=30&width=50" alt="American Express" class="h-8 border border-gray-200 rounded">
						<img src="/placeholder.svg?height=30&width=50" alt="Diners Club" class="h-8 border border-gray-200 rounded">
						<img src="/placeholder.svg?height=30&width=50" alt="Mastercard" class="h-8 border border-gray-200 rounded">
						<img src="/placeholder.svg?height=30&width=50" alt="Visa" class="h-8 border border-gray-200 rounded">
					</div>

					<div class="space-y-4">
					<div>
						<label for="card-name" class="block text-sm font-medium text-gray-900 mb-2">Nombre del titular de la tarjeta <span class="text-red-600">*</span></label>
						<input id="card-name" type="text" placeholder="aa bbbb" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
					</div>

					<div>
						<label for="card-number" class="block text-sm font-medium text-gray-900 mb-2">Número de la tarjeta <span class="text-red-600">*</span></label>
						<div class="relative">
							<input id="card-number" type="text" class="w-full px-3 py-2 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
								<svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
								</svg>
							</div>
						</div>

					<div class="w-48">
						<label for="card-expiry" class="block text-sm font-medium text-gray-900 mb-2">Fecha de caducidad <span class="text-red-600">*</span></label>
						<input id="card-expiry" type="text" placeholder="MM / AA" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
					</div>
					</div>
				</div>

				<div class="bg-white rounded-lg border border-gray-200 p-6">
					<h3 class="text-xl font-bold text-gray-900 mb-4">Necesario para completar la reserva</h3>
					
					<div class="space-y-4">
						<label class="flex items-start gap-3">
							<input type="checkbox" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0">
							<div class="text-sm">
							<span class="text-gray-900">Acepto que mis datos se recopilen y se procesen de acuerdo con la <a href="/privacy" class="text-blue-600 hover:underline">Política de privacidad</a> <span class="text-red-600">*</span></span>
							<p class="text-gray-600 mt-1">Para más información, consulta nuestra <a href="/privacy" class="text-blue-600 hover:underline">Política de privacidad</a>.</p>
							</div>
						</label>

						<label class="flex items-start gap-3">
							<input type="checkbox" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0">
							<div class="text-sm">
								<span class="text-gray-900">Acepto recibir emails de marketing de Booking.com con promociones, recomendaciones personalizadas, premios, experiencias de viaje y novedades sobre los productos y servicios de Booking.com.</span>
								<p class="text-gray-600 mt-2">Al suscribirte, nos permites adaptar las ofertas y el contenido a tus intereses monitorizando cómo usas Booking.com a través de tecnologías de seguimiento. Puedes darte de baja en cualquier momento a través del enlace de tu cuenta o en el enlace que aparece en el email de marketing. Lee nuestra <a href="/privacy" class="text-blue-600 hover:underline">política de privacidad</a>.</p>
							</div>
						</label>

						<div class="pt-4 border-t text-sm text-gray-700">
							<p class="mb-2">Tu reserva se ha hecho directamente con Holiday Inn Express Yopal by IHG y al completarla aceptas las <a href="/terms" class="text-blue-600 hover:underline">condiciones de la reserva</a>, las <a href="/terms" class="text-blue-600 hover:underline">condiciones generales</a>, la <a href="/privacy" class="text-blue-600 hover:underline">política de privacidad</a> y los <a href="/wallet-terms" class="text-blue-600 hover:underline">términos del Monedero</a>.</p>
						</div>
					</div>
				</div>

				<div class="flex flex-col items-end gap-3 pt-4">
					<button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded text-lg w-full md:w-auto">
						Completa la reserva
					</button>
					<a href="/reservation-conditions" class="text-sm text-blue-600 hover:underline">¿Cuáles son las condiciones de mi reserva?</a>
				</div>
			</div>
		</div>
	</div>
</main>

<Footer />
