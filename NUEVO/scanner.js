import Tokens2 from "./tokens.js";

function escanear(codigo) {
  let posicion = 0;
  const tokensencontrados = [];
  const errores = [];

  console.log("%c--- Iniciando Análisis Léxico ---", "color: #e67e22; font-weight: bold;");

  while (posicion < codigo.length) {
    const cadenarestante = codigo.slice(posicion);
    let coincidencia = false;

    // Recorremos la lista refactorizada de tokens
    for (const { tipo, regex, LF } of Tokens2) {
      const match = cadenarestante.match(regex);

      if (match) {
        const valor = match[0];

        // 1. Manejo de Errores: Cadenas mal cerradas
        if (tipo === 'ERROR_CADENA') {
          const errorToken = {
            tipo,
            LF,
            valor,
            posicion,
            error: true,
            mensaje: `Error Léxico (${LF}): Se encontró una comilla de apertura pero no el cierre antes del fin de línea.`
          };
          tokensencontrados.push(errorToken);
          errores.push(errorToken);
          posicion += valor.length;
          coincidencia = true;
          break;
        }

        // 2. Manejo de Símbolos Ilegales (Detectados por el regex '.' al final de Tokens2)
        if (tipo === 'ERROR_LEXICO') {
          const errorToken = {
            tipo,
            LF,
            valor,
            posicion,
            error: true,
            mensaje: `Error Léxico (${LF}): Símbolo '${valor}' no permitido en este lenguaje.`
          };
          tokensencontrados.push(errorToken);
          errores.push(errorToken);
          posicion += valor.length;
          coincidencia = true;
          break;
        }

        // 3. Registro de Tokens Válidos
        // Filtramos el LF 24 (ESPACIO) para que el Parser no tenga que lidiar con ellos
        if (LF !== 24) {
          tokensencontrados.push({ 
            tipo, 
            valor, 
            LF, 
            posicion 
          });
        }
        
        // Avanzamos el puntero de lectura
        posicion += valor.length;
        coincidencia = true;
        break; 
      }
    }

    // 4. Fallback de seguridad: Caracteres totalmente desconocidos
    if (!coincidencia) {
      const caracterIlegal = codigo[posicion];
      const errorToken = {
        tipo: 'ERROR_DESCONOCIDO',
        LF: 38,
        valor: caracterIlegal,
        posicion,
        error: true,
        mensaje: `Error Crítico: El carácter '${caracterIlegal}' no pertenece al alfabeto definido.`
      };
      tokensencontrados.push(errorToken);
      errores.push(errorToken);
      posicion++;
    }
  }

  console.log("%c--- Análisis Léxico Finalizado ---", "color: #27ae60; font-weight: bold;");
  
  return {
    exito: errores.length === 0,
    tokens: tokensencontrados,
    errores: errores
  };
}

export default escanear;