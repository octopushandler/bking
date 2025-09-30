<script>
	// Props
	export let showText = true; // Por defecto muestra el texto
</script>

<div class="relative pb-[145px] md:pb-16 z-50">
	{#if showText}
		<p class="px-2 text-5xl font-bold text-white mt-10">Encuentra tu próxima estancia</p>
		<p class="px-2 text-white text-xl mt-2">Busca ofertas en hoteles, casas y mucho más...</p>
	{/if}
	<slot />
</div>
