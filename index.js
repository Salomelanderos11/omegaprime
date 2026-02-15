import escanear from "./scanner.js";
import Parser from "./parser.js"; // Importamos el Parser que creamos

const tokensDiv = document.getElementById("tokens");
const btnScan = document.getElementById("btn_scan");
const tablaTokens = document.getElementById("tokens-body");
// Supongamos que tienes un div para mensajes de error sintáctico
const mensajeSintactico = document.getElementById("mensaje-sintactico"); 

btnScan.addEventListener("click", () => {
  const codigoFuente = document.getElementById("codigo").value;
  
  try {
    // --- PASO 1: Escaneo Léxico ---
    const resultadoLexico = escanear(codigoFuente);
    const tokensencontrados = resultadoLexico.tokens;
    const erroresLexicos = resultadoLexico.errores;

    // Limpiar tabla y mensajes previos
    tablaTokens.innerHTML = "";
    if(mensajeSintactico) mensajeSintactico.textContent = "";

    // Mostrar tokens en la tabla
    tokensencontrados.forEach(token => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${token.tipo}</td>
        <td>${token.valor}</td>
        <td>${token.LF}</td>
      `;
      tablaTokens.appendChild(fila);
    });

    // Si hubo errores léxicos, avisar y no continuar al parser
    if (erroresLexicos.length > 0) {
      alert("Existen errores léxicos. Revisa la consola o los mensajes.");
      console.error("Errores Léxicos:", erroresLexicos);
      return;
    }

        // --- PASO 2: Análisis Sintáctico (Parser) ---
    const miParser = new Parser(resultadoLexico.tokens);
        const resultadoSintactico = miParser.analizar();

        if (resultadoSintactico.exito) {
          // ESTO ES LO QUE TE FALTA:
          console.log("🌳 ÁRBOL SINTÁCTICO:", resultadoSintactico.arbol);
          alert("¡Análisis Sintáctico Exitoso!");
        } else {
    console.error("❌ Errores:", resultadoSintactico.errores);
    console.log("Pila al fallar:", resultadoSintactico.pilaFinal); // Agrega esto para depurar
}
 

  } catch (error) {
    console.error(error);
    tokensDiv.textContent = "Error en el sistema: " + error.message;
  }
});