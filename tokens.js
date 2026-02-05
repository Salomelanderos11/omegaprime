const Tokens = [
  // 1. Delimitadores de Programa (Tus terminales <? y ?>)
  { tipo: 'INICIO_BLOQUE', regex: /^<\?/ },
  { tipo: 'FIN_BLOQUE',    regex: /^\?>/ },

  // 2. Palabras Reservadas (Terminales de control y flujo)
  // Usamos \b para asegurar que coincida con la palabra completa
  { tipo: 'PALABRA_RESERVADA', regex: /^\b(programa|crear|mostrar|si|sino|mas|menos|por|entre|mayor|menor|igual)\b/ },

  // 3. Símbolos de Puntuación y Agrupación
  { tipo: 'IGUAL',         regex: /^=/ },
  { tipo: 'PUNTO_COMA',    regex: /^;/ },
  { tipo: 'PAR_IZQ',       regex: /^\(/ },
  { tipo: 'PAR_DER',       regex: /^\)/ },
  { tipo: 'LLAVE_IZQ',     regex: /^\{/ },
  { tipo: 'LLAVE_DER',     regex: /^\}/ },

  // 4. Literales (Reglas 19 y 20 de tu gramática)
  { tipo: 'CADENA',        regex: /^"[a-zA-Z0-9]*"/ }, // "letra*"
  { tipo: 'NUMERO',        regex: /^[0-9]+/ },         // digito+

  // 5. Identificadores (Reglas 17 y 18)
  { tipo: 'IDENTIFICADOR', regex: /^[a-zA-Z][a-zA-Z0-9]*/ },

  // 6. Espacios en blanco (Para ignorar)
  { tipo: 'ESPACIO',       regex: /^\s+/ },
];
export default tokens;
