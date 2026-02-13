import Tokens2 from "./tokens.js";

function escanear(codigo) {
  let posicion = 0;
  const tokensencontrados = [];
  const errores = [];

  console.log("--- Iniciando Análisis Léxico ---");

  while (posicion < codigo.length) {
    const cadenarestante = codigo.slice(posicion);
    let coincidencia = false;

    for (const { tipo, regex, LF } of Tokens2) {
      const match = cadenarestante.match(regex);

      if (match) {
        const valor = match[0];

        // 1. Caso: Cadena sin cerrar (Error detectado por Regex)
        if (tipo === 'ERROR_CADENA') {
          errores.push({
            tipo,
            LF,
            caracter: valor,
            posicion: posicion,
            mensaje: `Error Léxico (${LF}): Se abrió comilla [ " ] pero no se encontró el cierre.`
          });
          posicion += valor.length;
          coincidencia = true;
          break;
        }

        // 2. Caso: Carácter ilegal (Cualquier cosa que cayó en el '.' del final del array)
        if (tipo === 'ERROR_LEXICO') {
          errores.push({
            tipo,
            LF,
            caracter: valor,
            posicion: posicion,
            mensaje: `Error Léxico (${LF}): Símbolo '${valor}' no permitido en el alfabeto del lenguaje.`
          });
          posicion += valor.length;
          coincidencia = true;
          break;
        }

        // 3. Caso: Tokens válidos (No espacios)
        if (tipo !== 'ESPACIO') {
          tokensencontrados.push({ 
            tipo, 
            valor, 
            LF, 
            posicion // Guardar la posición es útil para el Parser más adelante
          });
        }
        
        // Avanzamos el puntero según el tamaño de lo encontrado
        posicion += valor.length;
        coincidencia = true;
        break; 
      }
    }

    // 4. Caso de Respaldo: Si nada en Tokens2 coincidió (Fallback de seguridad)
    if (!coincidencia) {
      const caracterIlegal = codigo[posicion];
      errores.push({
        tipo: 'ERROR_DESCONOCIDO',
        LF: 38,
        caracter: caracterIlegal,
        posicion: posicion,
        mensaje: `Error Crítico: Carácter '${caracterIlegal}' fuera de control.`
      });
      posicion++;
    }
  }

  console.log("--- Análisis Finalizado ---");
  
  return {
    exito: errores.length === 0,
    tokens: tokensencontrados,
    errores: errores
  };
}

export default escanear;