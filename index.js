
import escanear from "./scanner.js";


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
      const celdaValorLf = document.createElement("td");
      celdaTipo.textContent = token.tipo;
      celdaValor.textContent = token.valor;
      celdaValorLf.textContent = token.valorLf;
      fila.appendChild(celdaTipo);
      fila.appendChild(celdaValor);
      fila.appendChild(celdaValorLf);
      tablaTokens.appendChild(fila);
    });
  } catch (error) {
    tokensDiv.textContent = error.message;
  }
});

