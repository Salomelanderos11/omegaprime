import escanear from "./scanner.js";
import Parser from "./parser2.js"; 

const btnScan = document.getElementById("btn_scan");
const tablaTokens = document.getElementById("tokens-body");

btn_seman.addEventListener("click", function() {
    // Verificación de seguridad: ¿Ya corrimos el parser?
    if (!resultadoSintactico || !resultadoSintactico.arbol) {
        alert("⚠️ Primero debes ejecutar el Parser (botón azul).");
        return;
    }

    try {
        // --- LIMPIEZA DE TABLAS ---
        // Asegúrate de que estas variables apunten a los ID del HTML: 
        // simbolos-body y errores-semanticos-body
        const tablaSimbolos = document.getElementById("simbolos-body");
        const tablaErroresSem = document.getElementById("errores-semanticos-body");
        
        tablaSimbolos.innerHTML = "";
        tablaErroresSem.innerHTML = "";

        // --- EJECUCIÓN DEL ANALIZADOR ---
        // Creamos la instancia y ejecutamos la validación
        semantico = new analizadorsemantico(resultadoSintactico.arbol);
        semantico.validacion();
        
        const errores = semantico.errores; 
        const simbolos = semantico.tabla; 

        // --- LLENAR TABLA DE SÍMBOLOS ---
        simbolos.forEach(simbolo => {
            const fila = document.createElement("tr");
            
            // Aquí agregamos la columna de dirección (offset)
            fila.innerHTML = `
                <td>${simbolo.nombre}</td>
                <td>${simbolo.tipo}</td>
                <td>${simbolo.valor !== null ? simbolo.valor : "---"}</td>
                <td>${simbolo.direccion}</td>
            `;
            
            tablaSimbolos.appendChild(fila);
        });

        // --- LLENAR TABLA DE ERRORES ---
        if (errores.length > 0) {
            errores.forEach((error, index) => {
                const fila = document.createElement("tr");
                fila.style.color = "#f76363"; // Color de error
                
                fila.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${error}</td>
                `;
                
                tablaErroresSem.appendChild(fila);
            });
            alert("❌ Se encontraron errores semánticos.");
        } else {
            alert("✅ Análisis semántico completado sin errores.");
        }

    } catch (error) {
        console.error("Error en análisis semántico:", error);
        alert("Hubo un fallo en el proceso semántico.");
    }
});