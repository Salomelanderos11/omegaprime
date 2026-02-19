const Tokens2 = [
  // 1. Delimitadores de programa
  { tipo: 'INI_PROG', regex: /^<\?/, LF: 19 },
  { tipo: 'FIN_PROG', regex: /^\?>/, LF: 20 },

  // 2. Palabras Reservadas (Estructura de control)
  { tipo: 'PROGRAMA', regex: /^programa\b/, LF: 1 },
  { tipo: 'CREAR',    regex: /^crear\b/, LF: 2 },
  { tipo: 'MOSTRAR',  regex: /^mostrar\b/, LF: 3 },
  { tipo: 'SI',       regex: /^si\b/, LF: 4 },
  { tipo: 'SINO',     regex: /^sino\b/, LF: 5 },

  // 3. Tipos de Datos (Nuevos para tipado estático)
  { tipo: 'TIPO_INT',    regex: /^int\b/, LF: 40 },
  { tipo: 'TIPO_FLOAT',  regex: /^float\b/, LF: 41 },
  { tipo: 'TIPO_STRING', regex: /^String\b/, LF: 42 },

  // 4. Operadores escritos (Terminales de la gramática)
  { tipo: 'MAS',      regex: /^mas\b/, LF: 6 },
  { tipo: 'MENOS',    regex: /^menos\b/, LF: 7 },
  { tipo: 'POR',      regex: /^por\b/, LF: 8 },
  { tipo: 'ENTRE',    regex: /^entre\b/, LF: 9 },
  { tipo: 'MAYOR',    regex: /^mayor\b/, LF: 10 },
  { tipo: 'MENOR',    regex: /^menor\b/, LF: 11 },
  { tipo: 'IGUAL_TXT', regex: /^igual\b/, LF: 12 },

  // 5. Símbolos de puntuación y operadores
  { tipo: 'ASIGNACION', regex: /^=/, LF: 13 },
  { tipo: 'PT_COMA',    regex: /^;/, LF: 14 },
  { tipo: 'PAR_IZQ',    regex: /^\(/, LF: 15 },
  { tipo: 'PAR_DER',    regex: /^\)/, LF: 16 },
  { tipo: 'LLAVE_IZQ',  regex: /^\{/, LF: 17 },
  { tipo: 'LLAVE_DER',  regex: /^\}/, LF: 18 },
  { tipo: 'COMA',       regex: /^,/, LF: 28 },
  { tipo: 'PUNTO',      regex: /^\./, LF: 27 },

  // 6. Cadenas de texto (Manejo de Literales)
  { tipo: 'CADENA', regex: /^"([^"\n]*)"/, LF: 36 },

  // 7. Tokens dinámicos (Identificadores y Números)
  // Nota: La regex de NUMERO ahora incluye soporte para decimales (float)
  { tipo: 'IDENT',  regex: /^[a-zA-Z][a-zA-Z0-9]*/, LF: 21 },
  { tipo: 'NUMERO', regex: /^\d+(\.\d+)?/, LF: 22 },

  // 8. Espacios y saltos (LF 24 para que el Parser los filtre)
  { tipo: 'ESPACIO', regex: /^\s+/, LF: 24 },

  // 9. MANEJO DE ERRORES
  { tipo: 'ERROR_CADENA', regex: /^"[^"\n]*/, LF: 37 },
  { tipo: 'ERROR_LEXICO', regex: /^./, LF: 38 }
];

export default Tokens2;