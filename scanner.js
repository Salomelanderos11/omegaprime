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
          const errorToken = {
            tipo,
            LF,
            valor,
            posicion: posicion,
            error: true,
            mensaje: `Error Léxico (${LF}): Se abrió comilla [ " ] pero no se encontró el cierre.`
          };
          
          // Agregar tanto a tokens (para la tabla) como a errores (para validación)
          tokensencontrados.push(errorToken);
          errores.push(errorToken);
          
          posicion += valor.length;
          coincidencia = true;
          break;
        }

        // 2. Caso: Carácter ilegal (Cualquier cosa que cayó en el '.' del final del array)
        if (tipo === 'ERROR_LEXICO') {
          const errorToken = {
            tipo,
            LF,
            valor,
            posicion: posicion,
            error: true,
            mensaje: `Error Léxico (${LF}): Símbolo '${valor}' no permitido en el alfabeto del lenguaje.`
          };
          
          // Agregar tanto a tokens (para la tabla) como a errores (para validación)
          tokensencontrados.push(errorToken);
          errores.push(errorToken);
          
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
      const errorToken = {
        tipo: 'ERROR_DESCONOCIDO',
        LF: 38,
        valor: caracterIlegal,
        posicion: posicion,
        error: true,
        mensaje: `Error Crítico: Carácter '${caracterIlegal}' fuera de control.`
      };
      
      // Agregar tanto a tokens (para la tabla) como a errores (para validación)
      tokensencontrados.push(errorToken);
      errores.push(errorToken);
      
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