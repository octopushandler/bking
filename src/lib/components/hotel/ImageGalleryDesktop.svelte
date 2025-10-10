<script lang="ts">
	// Recibe un array de imágenes
	export let images: { src: string; alt?: string }[] = [];
  
	const img = (i: number) => images[i]?.src ?? "";
	const alt = (i: number) => images[i]?.alt ?? `Foto ${i + 1}`;
	const extra = Math.max(0, images.length - 8); // fotos adicionales
  </script>
  
  <div class="parent">
	<!-- 1) Imagen principal -->
	<figure class="div1 frame">
	  <img src={img(0)} alt={alt(0)} />
	</figure>
  
	<!-- 2) Columna derecha con 2 imágenes apiladas -->
	<div class="div2">
	  <figure class="frame">
		<img src={img(1)} alt={alt(1)} />
	  </figure>
	  <figure class="frame">
		<img src={img(2)} alt={alt(2)} />
	  </figure>
	</div>
  
	<!-- 3) Fila inferior con 5 miniaturas -->
	<div class="div3">
	  {#each [3,4,5,6,7] as i, idx}
		<figure class="frame">
		  <img src={img(i)} alt={alt(i)} />
		  {#if idx === 4 && extra > 0}
			<span class="badge">+{extra} fotos</span>
		  {/if}
		</figure>
	  {/each}
	</div>
  </div>
  
  <style>
	.parent {
	  display: grid;
	  grid-template-columns: repeat(5, 1fr);
	  grid-template-rows: repeat(5, 1fr);
	  gap: 8px;
	  height: 420px; /* ajusta según lo que quieras */
	}
  
	/* 1) Principal: 3 columnas × 4 filas */
	.div1 {
	  grid-column: 1 / span 3;
	  grid-row: 1 / span 4;
	}
  
	/* 2) Columna derecha: 2 columnas × 4 filas, con 2 imágenes apiladas */
	.div2 {
	  grid-column: 4 / span 2;
	  grid-row: 1 / span 4;
	  display: grid;
	  grid-template-rows: 1fr 1fr;
	  gap: 8px;
	}
  
	/* 3) Fila inferior: ocupa toda la fila 5 (5 columnas) */
	.div3 {
	  grid-column: 1 / span 5;
	  grid-row: 5 / span 1;
	  display: grid;
	  grid-template-columns: repeat(5, 1fr);
	  gap: 8px;
	}
  
	.frame {
	  position: relative;
	  overflow: hidden;
	  border-radius: 12px;
	}
  
	.frame img {
	  width: 100%;
	  height: 100%;
	  object-fit: cover;
	  display: block;
	}
  
	.badge {
	  position: absolute;
	  right: 8px;
	  bottom: 8px;
	  background: rgba(0, 0, 0, 0.7);
	  color: #fff;
	  font-size: 12px;
	  padding: 4px 8px;
	  border-radius: 6px;
	}
  </style>
  