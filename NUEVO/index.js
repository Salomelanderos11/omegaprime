import escanear from "./scanner.js";
import Parser from "./parser.js"; 
import AnalizadorSemantico from "./semantico.js";
import traductor from "./traductor.js";
import traductor_objeto from "./traductor_seg.js";

const btnScan = document.getElementById("btn_scan");
const btn_parser = document.getElementById("btn_azul");
const tablaTokens = document.getElementById("tokens-body");
const mensajeSintactico = document.getElementById("mensaje-sintactico"); 
const btn_seman = document.getElementById("btn_seman");
const panelTac= document.getElementById("panelTac");
const btnTac = document.getElementById("btn_tac");
const panelAsm = document.getElementById("panelAsm");
const consolaSalida = document.getElementById("consola-salida");
const btnObjeto = document.getElementById("btn_objeto");
let resultadoLexico;
let resultadoSintactico;
let semantico;
let asmGlobal = null;
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

        // Guardamos el ASM globalmente para usarlo después
        asmGlobal = asm; 

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

        console.log("%c🚀 TAC", "color: #9b59b6; font-weight: bold;", tac);
        console.log("%c⚙️  ASM", "color: #e67e22; font-weight: bold;", asm);
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

function mostrarTraductorObjeto(asmArray) {
    const contenedor = document.getElementById("errores-semanticos-contenido");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    try {
        // Importa tu clase (o usa tu instancia)
        const traductorObj = new traductor_objeto();
        const resultadoMemoria = traductorObj.traducir(asmArray);

        if (resultadoMemoria.length === 0) {
            contenedor.innerHTML = "<p>// No hay registros de memoria que mostrar.</p>";
            return;
        }

        let html = `
            <table style="width: 100%; table-layout: fixed; border-collapse: collapse; text-align: left; font-family: monospace; white-space: normal;">
                <thead>
                    <tr style="background: #1e272c; color: #00ff3c; border-bottom: 2px solid #00ff3c;">
                        <th style="padding: 8px; width: 25%;">Variable</th>
                        <th style="padding: 8px; width: 30%;">Offset (Binario)</th>
                        <th style="padding: 8px; width: 45%;">Bytes en Memoria</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Ahora desestructuramos 3 elementos: variable, offset y bytesArray
        resultadoMemoria.forEach(([variable, offset, bytesArray]) => {
            html += `
                <tr style="border-bottom: 1px solid #4a4a4a; line-height: 1.2;">
                    <td style="padding: 2px 5px; color: #f1c40f; font-size: 0.95rem; word-wrap: break-word;">
                        ${variable}
                    </td>
                    <td style="padding: 2px 5px; color: #74b9ff; font-size: 0.95rem; word-wrap: break-word;">
                        ${offset}
                    </td>
                    <td style="padding: 2px 5px; word-break: break-all; font-size: 0.95rem;">
                        ${bytesArray.join(' ')}
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        contenedor.innerHTML = html;
    } catch (error) {
        console.error("Error al traducir objeto:", error);
        contenedor.innerHTML = `<p style="color: #ff7675;">Error al procesar el traductor de objetos.</p>`;
    }
}


if (btnObjeto) {
    btnObjeto.addEventListener("click", function () {
        if (!asmGlobal || asmGlobal.length === 0) {
            alert("⚠️ Primero debes generar el código ensamblador (botón TAC).");
            return;
        }

        // Ejecutamos la función de traducción al objeto con el ASM guardado
        mostrarTraductorObjeto(asmGlobal);
    });
}

