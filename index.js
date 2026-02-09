import Tokens from "./tokens.js";

const tokensDiv = document.getElementById("tokens");
const btnScan = document.getElementById("btn_scan");
const tablaTokens = document.getElementById("tokens-body");
  

btnScan.addEventListener("click", () => {
  const codigoFuente = document.getElementById("codigo").value;
  try {
    const tokensencontrados = escanear(codigoFuente).tokens;
    tablaTokens.innerHTML = ""; // limpiar la tabla antes de agregar nuevos tokens
    tokensencontrados.forEach(token => {
      const fila = document.createElement("tr");
      const celdaTipo = document.createElement("td");
      const celdaValor = document.createElement("td");
      celdaTipo.textContent = token.tipo;
      celdaValor.textContent = token.valor;
      fila.appendChild(celdaTipo);
      fila.appendChild(celdaValor);
      tablaTokens.appendChild(fila);
    });
  } catch (error) {
    tokensDiv.textContent = error.message;
  }
});

function escanear(codigo) {
  let posicion = 0;
  const tokensencontrados = [];
  const errores = [];

  console.log("--- Iniciando Análisis Léxico ---");

  while (posicion < codigo.length) {
    const cadenarestante = codigo.slice(posicion);
    let coincidencia = false;

    for (const { tipo, regex } of Tokens) {
      const match = cadenarestante.match(regex);

      if (match) {
        const valor = match[0];

        //cadena sin cerrar
        if (tipo === 'ERROR_CADENA') {
          errores.push({
            caracter: valor,
            posicion: posicion,
            mensaje: `Error Léxico: Se abrió una cadena con '"' pero nunca se cerró.`
          });
          // avanzar el puntero toda la longitud de la cadena incompplta
          posicion += valor.length;
          coincidencia = true;
          break;
        }

        // si es un token valido y no es espacio lo guardamos
        if (tipo !== 'ESPACIO') {
          tokensencontrados.push({ tipo, valor });
        }
        
        posicion += valor.length;
        coincidencia = true;
        break; 
      }
    }

    // caracteres no permitidos
    if (!coincidencia) {
      const caracterIlegal = codigo[posicion];
      
      errores.push({
        caracter: caracterIlegal,
        posicion: posicion,
        mensaje: `Error Léxico: Carácter '${caracterIlegal}' no reconocido en el lenguaje.`
      });

      posicion++; // Avanzamos uno para no quedar en bucle infinito
    }
  }

  console.log("--- Análisis Finalizado ---");
  
  return {
    exito: errores.length === 0,
    tokens: tokensencontrados,
    errores: errores
  };
}