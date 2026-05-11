import escanear from "./scanner.js";
import Parser from "./parser.js"; 
import AnalizadorSemantico from "./semantico.js";
import traductor from "./traductor.js";
import traductor_objeto from "./traductor_seg_2.js";

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

    // Configuración del contenedor (Fondo Ultra Oscuro)
    contenedor.style.background = "#1a1a1a"; 
    contenedor.style.color = "#00ff3c";
    contenedor.style.padding = "30px";
    contenedor.style.borderRadius = "12px";
    contenedor.style.fontFamily = "'Courier New', Courier, monospace";
    contenedor.style.fontSize = "1.2rem";
    contenedor.style.fontWeight = "bold";
    
    contenedor.style.overflowX = "hidden"; 
    contenedor.style.overflowY = "auto";   
    contenedor.style.display = "block";
    contenedor.style.whiteSpace = "normal"; 
    
    contenedor.style.boxShadow = "inset 0 0 20px rgba(0,0,0,0.9)";
    contenedor.innerHTML = "";

    try {
        const traductorObj = new traductor_objeto();
        const { segmento_data, segmento_code } = traductorObj.traducir(asmArray);

        // Estilos de tabla con fondo oscuro forzado
        const estiloTabla = `width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 40px; background: #1a1a1a;`;
        const estiloCeldaOffset = `width: 220px; vertical-align: top; padding: 10px 10px 10px 0; color: #00ff3c; background: #1a1a1a; border: none;`;
        const estiloCeldaBytes = `vertical-align: top; padding: 10px 0; color: #00ff3c; background: #1a1a1a; border: none; letter-spacing: 2px; word-wrap: break-word; overflow-wrap: break-word;`;

        let html = "";

        // --- SEGMENTO DE DATOS ---
        html += `<div style="margin-bottom: 5px; color: #00ff3c;"> ==========================================</div>`;
        html += `<div style="margin-bottom: 5px; color: #00ff3c;">                     .DATA                 </div>`;
        html += `<div style="margin-bottom: 15px; color: #00ff3c;"> ==========================================</div>`;
        
        html += `<table style="${estiloTabla}">
                    <thead>
                        <tr style="background: #1a1a1a;">
                            <th style="${estiloCeldaOffset} text-align: left; border-bottom: 2px solid #00ff3c;">OFFSET</th>
                            <th style="${estiloCeldaBytes} text-align: left; border-bottom: 2px solid #00ff3c;">CONTENIDO BINARIO</th>
                        </tr>
                    </thead>
                    <tbody>`;

        segmento_data.forEach(item => {
            html += `<tr style="background: #1a1a1a;">
                        <td style="${estiloCeldaOffset}">${item.offset}</td>
                        <td style="${estiloCeldaBytes}">${item.bytes.join(' ')}</td>
                     </tr>`;
        });
        html += `</tbody></table>`;

        // --- SEGMENTO DE CÓDIGO ---
        html += `<div style="margin-bottom: 5px; color: #00ff3c;">==========================================</div>`;
        html += `<div style="margin-bottom: 5px; color: #00ff3c;">                    .CODE                  </div>`;
        html += `<div style="margin-bottom: 15px; color: #00ff3c;">==========================================</div>`;

        html += `<table style="${estiloTabla}">
                    <thead>
                        <tr style="background: #1a1a1a;">
                            <th style="${estiloCeldaOffset} text-align: left; border-bottom: 2px solid #00ff3c;">OFFSET</th>
                            <th style="${estiloCeldaBytes} text-align: left; border-bottom: 2px solid #00ff3c;">OPCODE </th>
                        </tr>
                    </thead>
                    <tbody>`;

        segmento_code.forEach(item => {
            if (item.tipo !== "etiqueta") {
                html += `<tr style="background: #1a1a1a;">
                            <td style="${estiloCeldaOffset}">${item.offset || "---"}</td>
                            <td style="${estiloCeldaBytes}">${item.binario || "---"}</td>
                         </tr>`;
            }
        });
        html += `</tbody></table>`;

        contenedor.innerHTML = html;

    } catch (error) {
        console.error("Error al traducir objeto:", error);
        contenedor.innerHTML = `<span style="color: #ff4d4d;">❌ ERROR: ${error.message}</span>`;
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

