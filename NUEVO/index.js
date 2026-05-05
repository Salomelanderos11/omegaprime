import escanear from "./scanner.js";
import Parser from "./parser.js"; 
import AnalizadorSemantico from "./semantico.js";
import traductor from "./traductor.js";

const btnScan = document.getElementById("btn_scan");
const btn_parser = document.getElementById("btn_azul");
const tablaTokens = document.getElementById("tokens-body");
const mensajeSintactico = document.getElementById("mensaje-sintactico"); 
const btn_seman = document.getElementById("btn_seman");
const panelTac= document.getElementById("panelTac");
const btnTac = document.getElementById("btn_tac");
const panelAsm = document.getElementById("panelAsm");
const consolaSalida = document.getElementById("consola-salida");
let resultadoLexico;
let resultadoSintactico;
let semantico;
const tablaSimbolos = document.getElementById("simbolos-body");
const tablaErroresSem = document.getElementById("errores-semanticos-body");
btnScan.addEventListener("click", function () {
  const codigoFuente = document.getElementById("codigo").value;
  
  try {
    // --- LIMPIEZA PREVIA ---
    tablaTokens.innerHTML = "";
    if(mensajeSintactico) mensajeSintactico.textContent = "";

    // --- PASO 1: ANÁLISIS LÉXICO (SCANNER) ---
    resultadoLexico = escanear(codigoFuente);
    
    resultadoLexico.tokens.forEach(token => {
      const fila = document.createElement("tr");
      if (token.error) fila.style.backgroundColor = "#ff7675";

      const celdaTipo = document.createElement("td");
      celdaTipo.textContent = token.tipo;

      const celdaValor = document.createElement("td");
      celdaValor.textContent = token.valor;

      const celdaLF = document.createElement("td");
      celdaLF.textContent = token.LF;

      fila.appendChild(celdaTipo);
      fila.appendChild(celdaValor);
      fila.appendChild(celdaLF);
      tablaTokens.appendChild(fila);
    });

    if (!resultadoLexico.exito) {
      alert("❌ Existen errores léxicos. Revisa la tabla.");
      return;
    }


  } 
  catch (error) {
    console.error("⚠️ Error Crítico:", error);
    alert("Error inesperado: " + error.message);
  }

});



btn_parser.addEventListener("click",function(){
  try {
    const miParser = new Parser(resultadoLexico.tokens);
    resultadoSintactico = miParser.analizar();

    if (resultadoSintactico.exito) {
      // Mensaje en consola con el árbol
      console.log("%c🌳 ÁRBOL SINTÁCTICO GENERADO:", "color: #0984e3; font-weight: bold;", resultadoSintactico.arbol);
      
      // --- PASO 3: ANÁLISIS SEMÁNTICO ---
      
      

      // Actualización de la interfaz
      if(mensajeSintactico) {
        mensajeSintactico.style.color = "#2ecc71";
        mensajeSintactico.textContent = "Estado: Correcto";
      }

      // --- ALERTA SOLICITADA ---
      alert("✅ ¡El programa es sintácticamente correcto!");

      // --- PASO 3: ANÁLISIS SEMÁNTICO (PRÓXIMAMENTE) ---
      /* const semantico = new AnalizadorSemantico(resultadoSintactico.arbol);
      // ... lógica semántica
      */

    } else {
      console.error("❌ Errores Sintácticos:", resultadoSintactico.errores);
      if(mensajeSintactico) {
        mensajeSintactico.style.color = "#e74c3c";
        mensajeSintactico.textContent = "Error: " + resultadoSintactico.errores[0];
      }
      alert("❌ Error Sintáctico: " + resultadoSintactico.errores[0]);
    }
  } catch (error) {
    console.log(error);
    
  }

});  

// Referencias a los nuevos cuerpos de tabla


btn_seman.addEventListener("click", function() {
    if (!resultadoSintactico || !resultadoSintactico.arbol) {
        alert("⚠️ Primero debes ejecutar el Parser (botón azul).");
        return;
    }

    try {
        // --- LIMPIEZA DE TABLAS ---
        tablaSimbolos.innerHTML = "";
        tablaErroresSem.innerHTML = "";

        // --- EJECUCIÓN DEL ANALIZADOR ---
        semantico = new AnalizadorSemantico(resultadoSintactico.arbol);
        semantico.validacion();
        
        const errores = semantico.errores; // Asumiendo que es un array de strings
        const simbolos = semantico.tabla;   // Asumiendo que es un Map o Array de objetos

        // --- LLENAR TABLA DE SÍMBOLOS ---
        // Si 'simbolos' es un objeto/mapa, lo iteramos
        console.log(typeof(simbolos));
        simbolos.forEach(simbolo => {
            const fila = document.createElement("tr");
            
            fila.innerHTML = `
                <td>${simbolo.nombre || simbolo.id}</td>
                <td>${simbolo.tipo}</td>
                <td>${simbolo.valor !== undefined ? simbolo.valor : "---"}</td>
                <td>${simbolo.direccion}</td>
            `;
            
            tablaSimbolos.appendChild(fila);
        });

        // --- LLENAR TABLA DE ERRORES ---
        if (errores.length > 0) {
            errores.forEach((error, index) => {
                const fila = document.createElement("tr");
                fila.classList.add("errores"); // Usamos tu clase CSS de color rojo
                
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

btnTac.addEventListener("click", function () {
    if (!semantico || semantico.errores.length > 0) {
        alert("⚠️ Primero debes ejecutar el Análisis Semántico sin errores.");
        return;
    }
 
    try {
        if (panelTac) panelTac.innerHTML = "";
        if (panelAsm) panelAsm.innerHTML = "";
        if (consolaSalida && !panelTac) consolaSalida.innerHTML = "";
 
        const mi_traductor = new traductor(resultadoSintactico.arbol, semantico.tabla);
        const { tac, asm } = mi_traductor.traducir();
 
        // ── Mostrar TAC ─────────────────────────────────────────────────────
        if (panelTac) {
            panelTac.innerHTML = tac.length === 0
                ? "// No se generó TAC."
                : tac.join("\n");
        } else if (consolaSalida) {
            consolaSalida.innerHTML = tac.join("\n");
        }
 
        // ── Mostrar ASM ─────────────────────────────────────────────────────
        if (panelAsm) {
            panelAsm.innerHTML = asm.length === 0
                ? "// No se generó ensamblador."
                : asm.map(escapeHtml).join("\n");
        }
        console.log("aqui",asm);
        console.log("%c🚀 TAC",         "color: #9b59b6; font-weight: bold;", tac);
        console.log("%c⚙️  ASM",         "color: #e67e22; font-weight: bold;", asm);
        alert("✅ Código generado con éxito.");
 
    } catch (error) {
        console.error("Error en la generación de código:", error);
        alert("❌ Hubo un fallo en la traducción: " + error.message);
    }
});
 
// Utilidad: escapar HTML para mostrar en <pre>
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}



