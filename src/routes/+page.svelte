<script>
	import Header from '$lib/components/Header.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import SearchForm from '$lib/components/SearchForm.svelte';
</script>

<svelte:head>
	<title>Booki - Reserva hoteles, vuelos y más</title>
	<meta name="description" content="Reserva alojamientos, vuelos, atracciones y más con Booki. Encuentra las mejores ofertas en hoteles y destinos para tu próximo viaje." />
</svelte:head>

<main id="main-content">
	<Header>
		<Navbar />
		<Hero>
			<SearchForm />
		</Hero>
	</Header>
	
</main>