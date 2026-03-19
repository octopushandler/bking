{#if show}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px]"
		role="dialog"
		aria-modal="true"
		aria-label="Transacción en proceso"
	>
		<div class="flex flex-col items-center gap-5 px-6 text-center">
			<div class="relative flex h-20 w-20 items-center justify-center">
				<div class="absolute inset-0 rounded-full border-4 border-white/15"></div>
				<div class="h-20 w-20 animate-spin rounded-full border-4 border-transparent border-t-white border-r-sky-300"></div>
			</div>
			<p class="text-base font-medium text-white sm:text-lg">
				Transacción en proceso, espera...
			</p>
		</div>
	</div>
{/if}

<script lang="ts">
	export let show = false;
</script>
