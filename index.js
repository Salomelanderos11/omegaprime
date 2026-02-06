import Tokens from "./tokens.js";


const codigo = document.getElementById("codigo").textContent;
const tokensDiv = document.getElementById("tokens");
const btnScan = document.getElementById("btn_scan");
const tablaTokens = document.getElementById("tokens-body");
  

btnScan.addEventListener("click", () => {
  const codigoFuente = document.getElementById("codigo").value;
  try {
    const tokensEncontrados = escanear(codigoFuente);
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




function escanear(codigo) {
  let posicion = 0;
  const tokensEncontrados = [];

  while (posicion < codigo.length) {
    const cadenaRestante = codigo.slice(posicion);
    let coincidenciaEncontrada = false;

    for (const { tipo, regex } of Tokens) {
      const match = cadenaRestante.match(regex);

      if (match) {
        const valor = match[0];
        if (tipo !== 'ESPACIO') {
          tokensEncontrados.push({ tipo, valor });
        }
        posicion += valor.length;
        coincidenciaEncontrada = true;
        break;
      }
    }

    if (!coincidenciaEncontrada) {
      throw new Error(`Error Léxico: Carácter inesperado en la posición ${posicion}: ${codigo[posicion]}`);
    }
  }

  return tokensEncontrados;
}

// Ejemplo de uso con tu gramática:
//const codigoFuente = 'vamonos a calcular 2 mas (4){ } ';
//console.log(escanear(codigoFuente));