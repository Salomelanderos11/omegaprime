import Tokens from "./tokens.js";


const codigo = document.getElementById("codigo").textContent;
const tokensDiv = document.getElementById("tokens");
const btnScan = document.getElementById("btn_scan");
const tablaTokens = document.getElementById("tokens-body");
  

btnScan.addEventListener("click", () => {
  const codigoFuente = document.getElementById("codigo").value;
  try {
    console.log(escanear(codigoFuente));
    const tokensEncontrados = escanear(codigoFuente).tokens;
    tablaTokens.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos tokens
    tokensEncontrados.forEach(token => {
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

let codigo1= "soy el mero aberce";
const cadenaRestante = codigo1.slice(0);
console.log(cadenaRestante);
function escanear(codigo) {
  let posicion = 0;
  const tokensEncontrados = [];
  const erroresEncontrados = []; // <--- Nuevo array para capturar errores

  console.log("--- Iniciando Análisis Léxico ---");

  while (posicion < codigo.length) {
    const cadenaRestante = codigo.slice(posicion);
    console.log(cadenaRestante);
    let coincidenciaEncontrada = false;

    for (const { tipo, regex } of Tokens) {
      console.log(tipo);
      const match = cadenaRestante.match(regex);
      console.log(match);
      if (match) {
        const valor = match[0];
        console.log(match[0]);

        if (tipo !== 'ESPACIO') {
          tokensEncontrados.push({ tipo, valor });
        }
        
        posicion += valor.length;
        coincidenciaEncontrada = true;
        break; 
      }
    }

    // SI NO HUBO COINCIDENCIA: En lugar de morir, recuperamos
    if (!coincidenciaEncontrada) {
      const caracterIlegal = codigo[posicion];
      
      // Guardamos el error con su posición para informar al usuario
      erroresEncontrados.push({
        caracter: caracterIlegal,
        posicion: posicion,
        mensaje: `Carácter '${caracterIlegal}' no reconocido`
      });

      // AVANZAMOS el puntero manualmente para ignorar el error y seguir
      posicion++; 
    }
  }

  console.log("--- Análisis Finalizado ---");
  
  // Retornamos un objeto con ambas listas
  return {
    exito: erroresEncontrados.length === 0,
    tokens: tokensEncontrados,
    errores: erroresEncontrados
  };
}