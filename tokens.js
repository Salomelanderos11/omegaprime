const Tokens = [
  // 1. Delimitadores de Programa (Terminales de estructura)
  { tipo: 'INI_PROG',    regex: /^<\?/ },
  { tipo: 'FIN_PROG',       regex: /^\?>/ },

  // 2. Palabras Reservadas (Terminales de control)
  // Nota: \b asegura que coincida con la palabra completa y no con parte de otra
  { tipo: 'PA_RES', regex: /^\b(programa|crear|mostrar|si|sino|mas|menos|por|entre|mayor|menor|igual)\b/ },

  // 3. Símbolos y Operadores (Terminales de puntuación)
  { tipo: 'IGUAL',          regex: /^=/ },
  { tipo: 'PT_COMA',     regex: /^;/ },
  { tipo: 'PAR_IZQ',        regex: /^\(/ },
  { tipo: 'PAR_DER',        regex: /^\)/ },
  { tipo: 'LLAVE_IZQ',      regex: /^\{/ },
  { tipo: 'LLAVE_DER',      regex: /^\}/ },

  // 4. Literales (Reglas 19 y 20 de la gramática)
  // Cadena: cualquier secuencia alfanumérica entre comillas
  { tipo: 'CADENA',         regex: /^"[a-zA-Z0-9]*"/ },
  // Número: uno o más dígitos
  { tipo: 'NUMERO',         regex: /^[0-9]+/ },

  // 5. Identificadores (Reglas 17 y 18)
  // Debe empezar con letra, seguido de letras o dígitos
  { tipo: 'IDENT',  regex: /^[a-zA-Z][a-zA-Z0-9]*/ },

  // 6. Espacios en blanco (Para ser ignorados por el scanner)
  { tipo: 'ESPACIO',        regex: /^\s+/ },
];
export default Tokens;
