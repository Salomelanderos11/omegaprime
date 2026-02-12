
function parsear(codigo) {
  const resultadoEscaneo = escanear(codigo);
  
  if (!resultadoEscaneo.exito) {
    throw new Error("Error Lexico: No se pudo completar el analisis debido a errores lexicos.");
  }

  const tokens = resultadoEscaneo.tokens;
  let correcto = false;
  let posicion = 0;
  
  // Aquí iría la lógica para construir el árbol sintáctico a partir de los tokens
  // Por ahora, simplemente retornamos los tokens encontrados
  return tokens;
}

function programa(tokens) {
  let posicion = 0;
  const secuencia = [19, 21,1, 17, 2, 21, 13 ]; // Secuencia esperada de tokens para un programa
  if (tokens[posicion].tipo === 19) { // INI_PROG
    posicion++;
    if (tokens[posicion].tipo === 21) { // IDENT
      posicion++;
      if (tokens[posicion].tipo === 1) { // PA_RES 'programa'
        posicion++;
        if (tokens[posicion].tipo === 17) { // LLAVE_IZQ
          posicion++;
          if (tokens[posicion].tipo === 2) { // PA_RES 'crear'
            posicion++;
            if (tokens[posicion].tipo === 21) { // IDENT
              posicion++;
              if (tokens[posicion].tipo === 13) { // IGUAL
                posicion++;
                if (tokens[posicion].tipo === ) { // PA_RES 'programa'
    return true;
  }
  return false;
}

export default parsear; 


//////{ tipo: 'INI_PROG', regex: /^<\?/, valor: 19 },
  //////{ tipo: 'FIN_PROG', regex: /^\?>/, valor: 20 },

  // Palabras reservadas (PA_RES)
  // Se usa \b para asegurar que coincida con la palabra completa y no sea parte de otra
  ////////{ tipo: 'PA_RES', regex: /^programa\b/, valor: 1 },
  ////////{ tipo: 'PA_RES', regex: /^crear\b/, valor: 2 },
  ////////{ tipo: 'PA_RES', regex: /^mostrar\b/, valor: 3 },
  ////////{ tipo: 'PA_RES', regex: /^si\b/, valor: 4 },
  ////////{ tipo: 'PA_RES', regex: /^sino\b/, valor: 5 },
  ////////{ tipo: 'PA_RES', regex: /^mas\b/, valor: 6 },
  ////////{ tipo: 'PA_RES', regex: /^menos\b/, valor: 7 },
  ////////{ tipo: 'PA_RES', regex: /^por\b/, valor: 8 },
  ////////{ tipo: 'PA_RES', regex: /^entre\b/, valor: 9 },
  ////////{ tipo: 'PA_RES', regex: /^mayor\b/, valor: 10 },
  ////////{ tipo: 'PA_RES', regex: /^menor\b/, valor: 11 },
  ////////{ tipo: 'PA_RES', regex: /^igual\b/, valor: 12 },

  // Símbolos y Operadores (Muchos requieren escape \ por ser caracteres reservados en Regex)
//  //////{ tipo: 'IGUAL', regex: /^=/, valor: 13 },
 // //////{ tipo: 'PT_COMA', regex: /^;/, valor: 14 },
  ////////{ tipo: 'PAR_IZQ', regex: /^\(/, valor: 15 },
  ////////{ tipo: 'PAR_DER', regex: /^\)/, valor: 16 },
 // //////{ tipo: 'LLAVE_IZQ', regex: /^\{/, valor: 17 },
  ////////{ tipo: 'LLAVE_DER', regex: /^\}/, valor: 18 },
  
  // Otros caracteres y símbolos especiales
 // //////{ tipo: 'COMILLA', regex: /^"/, valor: 23 },
 // ////{ tipo: 'ESPACIO', regex: /^\s+/, valor: 24 }, // Captura uno o más espacios en blanco
 // ////{ tipo: 'EXCLAMACION', regex: /^!/, valor: 25 },
 // ////{ tipo: 'INTERROGACION', regex: /^\?/, valor: 26 },
  //////{ tipo: 'PUNTO', regex: /^\./, valor: 27 },
  ////{ tipo: 'COMA', regex: /^,/, valor: 28 },
  //////{ tipo: 'DOS_PUNTOS', regex: /^:/, valor: 29 },
  //////{ tipo: 'GUION', regex: /^-/, valor: 30 },
  //////{ tipo: 'GUION_BAJO', regex: /^_/, valor: 31 },
  //////{ tipo: 'SUMA_ESPECIAL', regex: /^\+'/, valor: 32 },
  //////{ tipo: 'ASTERISCO', regex: /^\*/, valor: 33 },
  //////{ tipo: 'DIAGONAL', regex: /^\//, valor: 34 },

  // Definiciones genéricas (Identificadores y Números)
  // IDENT: Empieza con letra, seguido de letras o números
  //////{ tipo: 'IDENT', regex: /^[a-zA-Z][a-zA-Z0-9]*/, valor: 21 },
  // NUMERO: Uno o más dígitos
  ////////{ tipo: 'NUMERO', regex: /^\d+/, valor: 22 }