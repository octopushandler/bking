<script>
	import { createEventDispatcher, onMount } from 'svelte';
	
	// ===== PROPS =====
	export let checkInDate = '';
	export let checkOutDate = '';
	export let isOpen = false;
	export let minDate = null;
	export let maxDate = null;
	
	// ===== DISPATCHER =====
	const dispatch = createEventDispatcher();
	
	// ===== FUNCIONES DE CIERRE =====
	function handleClose() {
		dispatch('close');
	}
	
	// ===== ESTADO INTERNO =====
	let currentMonth = new Date();
	let selectedStartDate = null;
	let selectedEndDate = null;
	let isSelecting = false;
	let hoveredDate = null;
	let showFlexibilityOptions = false;
	let selectedFlexibility = 'exact';
	let isMobile = false;
	
	// ===== REACTIVIDAD PARA SEGUNDO MES =====
	$: secondMonth = (() => {
		const second = new Date(currentMonth);
		second.setMonth(second.getMonth() + 1);
		return second;
	})();
	
	// ===== REACTIVIDAD =====
	let lastCheckInDate = '';
	let lastCheckOutDate = '';
	
	$: if (checkInDate && checkInDate !== lastCheckInDate) {
		console.log('Props changed - checkInDate:', checkInDate);
		// Parsear fecha en zona horaria local
		const [year, month, day] = checkInDate.split('-').map(Number);
		selectedStartDate = createLocalDate(year, month - 1, day);
		currentMonth = new Date(selectedStartDate);
		console.log('Created selectedStartDate:', selectedStartDate, 'Local date:', selectedStartDate.toLocaleDateString());
		lastCheckInDate = checkInDate;
	}
	$: if (checkOutDate && checkOutDate !== lastCheckOutDate) {
		console.log('Props changed - checkOutDate:', checkOutDate);
		// Parsear fecha en zona horaria local
		const [year, month, day] = checkOutDate.split('-').map(Number);
		selectedEndDate = createLocalDate(year, month - 1, day);
		console.log('Created selectedEndDate:', selectedEndDate, 'Local date:', selectedEndDate.toLocaleDateString());
		lastCheckOutDate = checkOutDate;
	}
	
	// ===== FUNCIONES DE UTILIDAD =====
	function formatDate(date) {
		// Usar fecha local para evitar problemas de zona horaria
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
	
	function createLocalDate(year, month, day) {
		// Crear fecha en zona horaria local para evitar desplazamientos
		return new Date(year, month, day);
	}
	
	function isToday(date) {
		const today = new Date();
		return date.toDateString() === today.toDateString();
	}
	
	function isSameDay(date1, date2) {
		if (!date1 || !date2) return false;
		return date1.getTime() === date2.getTime();
	}
	
	function isInRange(date, start, end) {
		if (!start || !end) return false;
		const dateTime = date.getTime();
		const startTime = start.getTime();
		const endTime = end.getTime();
		// Incluir ambas fechas de inicio y fin
		return dateTime >= startTime && dateTime <= endTime;
	}
	
	function isDateDisabled(date) {
		if (minDate && date < minDate) return true;
		if (maxDate && date > maxDate) return true;
		return false;
	}
	
	// ===== FUNCIONES DE CALENDARIO =====
	function getDaysInMonth(date) {
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const daysInMonth = lastDay.getDate();
		const startingDayOfWeek = firstDay.getDay();
		
		const days = [];
		
		// Días del mes anterior
		for (let i = startingDayOfWeek - 1; i >= 0; i--) {
			const day = new Date(year, month, -i);
			days.push({ date: day, isCurrentMonth: false, isToday: isToday(day) });
		}
		
		// Días del mes actual
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, month, day);
			days.push({ 
				date, 
				isCurrentMonth: true, 
				isToday: isToday(date),
				isDisabled: isDateDisabled(date)
			});
		}
		
		// Días del mes siguiente para completar la grilla
		const remainingDays = 42 - days.length; // 6 semanas * 7 días
		for (let day = 1; day <= remainingDays; day++) {
			const date = new Date(year, month + 1, day);
			days.push({ date, isCurrentMonth: false, isToday: isToday(date) });
		}
		
		return days;
	}
	
	function getMonthName(date) {
		return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
	}
	
	// ===== FUNCIONES DE NAVEGACIÓN =====
	function previousMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
	}
	
	function nextMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
	}
	
	function goToToday() {
		currentMonth = new Date();
	}
	
	// ===== FUNCIONES DE SELECCIÓN =====
	function handleDateClick(day) {
		if (!day.isCurrentMonth || day.isDisabled) return;
		
		console.log('Date clicked:', day.date, 'Current state:', { selectedStartDate, selectedEndDate, isSelecting });
		
		// Si no hay fechas seleccionadas o ya hay un rango completo, iniciar nueva selección
		if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
			selectedStartDate = new Date(day.date);
			selectedEndDate = null;
			isSelecting = true;
			console.log('Started new selection:', selectedStartDate);
		} 
		// Si hay fecha de inicio pero no de fin, completar la selección
		else if (selectedStartDate && !selectedEndDate) {
			if (day.date < selectedStartDate) {
				selectedEndDate = new Date(selectedStartDate);
				selectedStartDate = new Date(day.date);
			} else {
				selectedEndDate = new Date(day.date);
			}
			isSelecting = false;
			console.log('Completed selection:', { selectedStartDate, selectedEndDate });
			emitDateChange();
		}
	}
	
	function handleDateHover(day) {
		if (!isSelecting || !day.isCurrentMonth || day.isDisabled) return;
		hoveredDate = day.date;
	}
	
	function emitDateChange() {
		if (selectedStartDate && selectedEndDate) {
			const checkIn = formatDate(selectedStartDate);
			const checkOut = formatDate(selectedEndDate);
			console.log('Emitting date change:', {
				selectedStartDate: selectedStartDate,
				selectedEndDate: selectedEndDate,
				checkIn,
				checkOut,
				flexibility: selectedFlexibility
			});
			dispatch('dateChange', {
				checkIn,
				checkOut,
				flexibility: selectedFlexibility
			});
		}
	}
	
	// ===== FUNCIONES DE FLEXIBILIDAD =====
	function handleFlexibilityChange(flexibility) {
		selectedFlexibility = flexibility;
		if (selectedStartDate && selectedEndDate) {
			emitDateChange();
		}
	}
	
	function applyFlexibility() {
		if (!selectedStartDate || !selectedEndDate) return;
		
		const days = parseInt(selectedFlexibility.replace(/\D/g, '') || '0');
		if (days === 0) return; // Fechas exactas
		
		const newStartDate = new Date(selectedStartDate);
		const newEndDate = new Date(selectedEndDate);
		
		newStartDate.setDate(newStartDate.getDate() - days);
		newEndDate.setDate(newEndDate.getDate() + days);
		
		selectedStartDate = newStartDate;
		selectedEndDate = newEndDate;
		emitDateChange();
	}
	
	// ===== FUNCIONES DE CLASE CSS =====
	function getDateClasses(day) {
		const classes = [
			'w-8 h-8 flex items-center justify-center text-xs rounded-full cursor-pointer transition-colors',
			'relative'
		];
		
		if (!day.isCurrentMonth) {
			classes.push('text-gray-300');
		} else if (day.isDisabled) {
			classes.push('text-gray-300 cursor-not-allowed');
		} else if (day.isToday) {
			classes.push('font-semibold text-[#003b95]');
		} else {
			classes.push('text-gray-700 hover:bg-gray-100');
		}
		
		// Debug logs para fechas seleccionadas
		if (day.date.getDate() === 15) { // Solo para el día 15 como ejemplo
			console.log('Day 15 classes check:', {
				dayDate: day.date,
				selectedStartDate,
				selectedEndDate,
				isSameDayStart: selectedStartDate ? isSameDay(day.date, selectedStartDate) : false,
				isSameDayEnd: selectedEndDate ? isSameDay(day.date, selectedEndDate) : false
			});
		}
		
		// Fecha seleccionada como inicio
		if (selectedStartDate && isSameDay(day.date, selectedStartDate)) {
			classes.push('bg-[#003b95] text-white font-semibold');
		}
		
		// Fecha seleccionada como fin
		if (selectedEndDate && isSameDay(day.date, selectedEndDate)) {
			classes.push('bg-[#003b95] text-white font-semibold');
		}
		
		// Rango seleccionado
		if (selectedStartDate && selectedEndDate && isInRange(day.date, selectedStartDate, selectedEndDate)) {
			classes.push('bg-blue-100 text-[#003b95]');
			// Debug log para rango
			if (day.date.getDate() >= 8 && day.date.getDate() <= 15) {
				console.log('Range check for day', day.date.getDate(), ':', {
					dayDate: day.date,
					selectedStartDate,
					selectedEndDate,
					isInRange: isInRange(day.date, selectedStartDate, selectedEndDate)
				});
			}
		}
		
		// Fecha hovered durante selección
		if (isSelecting && hoveredDate && isInRange(day.date, selectedStartDate, hoveredDate)) {
			classes.push('bg-blue-50');
		}
		
		return classes.join(' ');
	}
	
	// ===== FUNCIONES DE RESPONSIVE =====
	function checkMobile() {
		isMobile = window.innerWidth < 768; // md breakpoint
	}
	
	
	// ===== INICIALIZACIÓN =====
	onMount(() => {
		// Solo inicializar si no hay fechas seleccionadas
		if (checkInDate && !selectedStartDate) {
			const [year, month, day] = checkInDate.split('-').map(Number);
			selectedStartDate = createLocalDate(year, month - 1, day);
			currentMonth = new Date(selectedStartDate);
		}
		if (checkOutDate && !selectedEndDate) {
			const [year, month, day] = checkOutDate.split('-').map(Number);
			selectedEndDate = createLocalDate(year, month - 1, day);
		}
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	});
</script>

<!-- DatePicker Container -->
{#if isOpen}
	<button 
		class="fixed top-0 left-0 w-full h-full z-[99999] flex items-start justify-center pt-20 bg-black bg-opacity-50" 
		on:click|self={handleClose}
		on:keydown|self={(e) => e.key === 'Escape' && handleClose()}
		aria-label="Cerrar selector de fechas"
		style="cursor: default;"
	>
		<div class="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-3xl w-full mx-4 max-h-[70vh] overflow-y-auto">
		<!-- Calendarios Responsive -->
		<div class="flex {isMobile ? 'flex-col' : 'flex-row'} gap-6">
			<!-- Primer Mes -->
			<div class="flex-1">
				<!-- Header con navegación -->
				<div class="flex items-center justify-between mb-4">
					<button 
						on:click={previousMonth}
						class="p-2 hover:bg-gray-100 rounded-full transition-colors"
						aria-label="Mes anterior"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					
					<div class="flex items-center space-x-3">
						<h3 class="text-sm font-semibold text-gray-800">{getMonthName(currentMonth)}</h3>
						{#if currentMonth.getMonth() !== new Date().getMonth() || currentMonth.getFullYear() !== new Date().getFullYear()}
							<button 
								on:click={goToToday}
								class="text-xs text-[#003b95] hover:underline"
							>
								Hoy
							</button>
						{/if}
					</div>
					
					<button 
						on:click={nextMonth}
						class="p-2 hover:bg-gray-100 rounded-full transition-colors"
						aria-label="Mes siguiente"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>
				
				<!-- Calendario -->
				<div class="grid grid-cols-7 gap-1 mb-3">
					<!-- Días de la semana -->
					{#each ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as day}
						<div class="text-center text-xs font-medium text-gray-500 py-1">
							{day}
						</div>
					{/each}
					
					<!-- Días del mes -->
					{#each getDaysInMonth(currentMonth) as day}
						<button
							class={getDateClasses(day)}
							on:click={() => handleDateClick(day)}
							on:mouseenter={() => handleDateHover(day)}
							disabled={day.isDisabled}
						>
							{day.date.getDate()}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Segundo Mes (Solo en Desktop) -->
			{#if !isMobile}
				<div class="flex-1">
				<!-- Header del segundo mes -->
				<div class="flex items-center justify-center mb-3">
					<h3 class="text-sm font-semibold text-gray-800">{getMonthName(secondMonth)}</h3>
				</div>
				
				<!-- Calendario del segundo mes -->
				<div class="grid grid-cols-7 gap-1 mb-3">
					<!-- Días de la semana -->
					{#each ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as day}
						<div class="text-center text-xs font-medium text-gray-500 py-1">
							{day}
						</div>
					{/each}
					
					<!-- Días del segundo mes -->
					{#each getDaysInMonth(secondMonth) as day}
						<button
							class={getDateClasses(day)}
							on:click={() => handleDateClick(day)}
							on:mouseenter={() => handleDateHover(day)}
							disabled={day.isDisabled}
						>
							{day.date.getDate()}
						</button>
					{/each}
				</div>
				</div>
			{/if}
		</div>
		
		<!-- Separador -->
		<hr class="border-gray-200 my-3" />
		
		<!-- Opciones de flexibilidad -->
		<div class="space-y-2">
			<h4 class="text-xs font-medium text-gray-700">Flexibilidad de fechas</h4>
			<div class="flex flex-wrap gap-1">
				<button
					class="px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap {selectedFlexibility === 'exact' ? 'bg-[#003b95] text-white border-[#003b95]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}"
					on:click={() => handleFlexibilityChange('exact')}
				>
					Fechas exactas
				</button>
				<button
					class="px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap {selectedFlexibility === '1' ? 'bg-[#003b95] text-white border-[#003b95]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}"
					on:click={() => handleFlexibilityChange('1')}
				>
					± 1 día
				</button>
				<button
					class="px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap {selectedFlexibility === '2' ? 'bg-[#003b95] text-white border-[#003b95]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}"
					on:click={() => handleFlexibilityChange('2')}
				>
					± 2 días
				</button>
				<button
					class="px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap {selectedFlexibility === '3' ? 'bg-[#003b95] text-white border-[#003b95]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}"
					on:click={() => handleFlexibilityChange('3')}
				>
					± 3 días
				</button>
				<button
					class="px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap {selectedFlexibility === '7' ? 'bg-[#003b95] text-white border-[#003b95]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}"
					on:click={() => handleFlexibilityChange('7')}
				>
					± 7 días
				</button>
			</div>
		</div>
		</div>
	</button>
{/if}
