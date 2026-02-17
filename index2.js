import escanear from "./scanner.js";
import Parser from "./parser2.js"; 

const btnScan = document.getElementById("btn_scan");
const tablaTokens = document.getElementById("tokens-body");

btnScan.addEventListener("click", () => {
  const codigoFuente = document.getElementById("codigo").value;
  
  try {
    // --- PASO 1: Escaneo Léxico ---
    const resultadoLexico = escanear(codigoFuente);
    
    // Limpiar interfaz
    tablaTokens.innerHTML = "";

    // Llenar tabla de tokens para feedback visual
    resultadoLexico.tokens.forEach(token => {
      const fila = document.createElement("tr");
      fila.innerHTML = `<td>${token.tipo}</td><td>${token.valor}</td><td>${token.LF}</td>`;
      tablaTokens.appendChild(fila);
    });

    // Validar si hubo errores léxicos antes de pasar al Parser
    if (!resultadoLexico.exito) {
      alert("Error Léxico: Revisa los símbolos ingresados.");
      return;
    }

    // --- PASO 2: Análisis Sintáctico (Nuevo Parser) ---
    // Pasamos el array de tokens generado por el scanner
    const miParser = new Parser(resultadoLexico.tokens);
    const resultadoSintactico = miParser.analizar();

    if (resultadoSintactico.exito) {
      console.log("✅ Estructura válida según la gramática.");
      console.log("🌳 Árbol Generado:", resultadoSintactico.arbol);
      alert("¡Análisis Sintáctico Exitoso!");
    } else {
      // Mostramos el primer error encontrado por el Parser
      console.error("❌ Error Sintáctico:", resultadoSintactico.errores[0]);
      alert("Error Sintáctico: " + resultadoSintactico.errores[0]);
    }

  } catch (error) {
    console.error("Error inesperado:", error);
  }
});