import escanear from "./scanner.js";
import Parser from "./parser.js"; 
import AnalizadorSemantico from "./semantico.js";

const btnScan = document.getElementById("btn_scan");
const btn_parser = document.getElementById("btn_azul");
const tablaTokens = document.getElementById("tokens-body");
const mensajeSintactico = document.getElementById("mensaje-sintactico"); 
let resultadoLexico;
let resultadoSintactico;
let semantico;
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
      semantico = new AnalizadorSemantico(resultadoSintactico.arbol);
      semantico.validacion();
      

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




