const Tokens = [
  { tipo: 'ESPACIO', regex: /^\s+/ },
  
  // delimitadores de programa
  { tipo: 'INI_PROG', regex: /^<\?/ },
  { tipo: 'FIN_PROG', regex: /^\?>/ },
  
  // palabras reservadas
  { tipo: 'PA_RES', regex: /^\b(programa|crear|mostrar|si|sino|mas|menos|por|entre|mayor|menor|igual)\b/ },

  
  { tipo: 'CADENA', regex: /^"[a-zA-Z0-9\s!?. ,:\-_+*/]*"/ },
  
  //regla para detectar ERROR de cadena sin cerrar
  // atrapa la comilla y todo lo que le sigue que parezca cadena pero no cierra
  { tipo: 'ERROR_CADENA', regex: /^"[a-zA-Z0-9\s!?. ,:\-_+*/]*/ },
  
  { tipo: 'NUMERO', regex: /^[0-9]+/ },
  { tipo: 'IDENT', regex: /^[a-zA-Z][a-zA-Z0-9]*/ },
  
  // simbolos y Operadores
  { tipo: 'IGUAL',    regex: /^=/ },
  { tipo: 'PT_COMA',  regex: /^;/ },
  { tipo: 'PAR_IZQ',  regex: /^\(/ },
  { tipo: 'PAR_DER',  regex: /^\)/ },
  { tipo: 'LLAVE_IZQ', regex: /^\{/ },
  { tipo: 'LLAVE_DER', regex: /^\}/ }
];

const Tokens2 = [
  // 1. Delimitadores de programa (Símbolos compuestos)
  { tipo: 'INI_PROG', regex: /^<\?/, LF: 19 },
  { tipo: 'FIN_PROG', regex: /^\?>/, LF: 20 },

  // 2. Palabras Reservadas (Estructura de control)
  { tipo: 'PROGRAMA', regex: /^programa\b/, LF: 1 },
  { tipo: 'CREAR',    regex: /^crear\b/, LF: 2 },
  { tipo: 'MOSTRAR',  regex: /^mostrar\b/, LF: 3 },
  { tipo: 'SI',       regex: /^si\b/, LF: 4 },
  { tipo: 'SINO',     regex: /^sino\b/, LF: 5 },

  // 3. Operadores escritos (Terminales de la gramática)
  { tipo: 'MAS',      regex: /^mas\b/, LF: 6 },
  { tipo: 'MENOS',    regex: /^menos\b/, LF: 7 },
  { tipo: 'POR',      regex: /^por\b/, LF: 8 },
  { tipo: 'ENTRE',    regex: /^entre\b/, LF: 9 },
  { tipo: 'MAYOR',    regex: /^mayor\b/, LF: 10 },
  { tipo: 'MENOR',    regex: /^menor\b/, LF: 11 },
  { tipo: 'IGUAL_TXT', regex: /^igual\b/, LF: 12 },

  // 4. Símbolos de puntuación y operadores
  { tipo: 'ASIGNACION', regex: /^=/, LF: 13 },
  { tipo: 'PT_COMA',    regex: /^;/, LF: 14 },
  { tipo: 'PAR_IZQ',    regex: /^\(/, LF: 15 },
  { tipo: 'PAR_DER',    regex: /^\)/, LF: 16 },
  { tipo: 'LLAVE_IZQ',  regex: /^\{/, LF: 17 },
  { tipo: 'LLAVE_DER',  regex: /^\}/, LF: 18 },

  // 5. Cadenas de texto (Manejo de Literales)
  // Captura todo lo que esté entre comillas dobles que no sea otra comilla
  { tipo: 'CADENA', regex: /^"([^"\n]*)"/, LF: 36 },

  // 6. Tokens dinámicos (Identificadores y Números)
  { tipo: 'IDENT',  regex: /^[a-zA-Z][a-zA-Z0-9]*/, LF: 21 },
  { tipo: 'NUMERO', regex: /^\d+/, LF: 22 },

  // 7. Símbolos permitidos individualmente (Terminales para <caracteres>)
  { tipo: 'EXCLAMACION',  regex: /^!/, LF: 25 },
  { tipo: 'INTERROGACION', regex: /^\?/, LF: 26 },
  { tipo: 'PUNTO',        regex: /^\./, LF: 27 },
  { tipo: 'COMA',         regex: /^,/, LF: 28 },
  { tipo: 'DOS_PUNTOS',   regex: /^:/, LF: 29 },
  { tipo: 'GUION',        regex: /^-/, LF: 30 },
  { tipo: 'GUION_BAJO',   regex: /^_/, LF: 31 },
  { tipo: 'SUMA',         regex: /^\+/, LF: 32 },
  { tipo: 'ASTERISCO',    regex: /^\*/, LF: 33 },
  { tipo: 'DIAGONAL',     regex: /^\//, LF: 34 },
  { tipo: 'BETA',         regex: /^β/, LF: 35 },
  { tipo: 'COMILLA',      regex: /^"/, LF: 23 },

  // 8. Espacios y saltos (Ignorar en el análisis sintáctico)
  { tipo: 'ESPACIO', regex: /^\s+/, LF: 24 },

  // 9. MANEJO DE ERRORES
  // Error de cadena: Comilla abierta que no cierra antes del fin de línea
  { tipo: 'ERROR_CADENA', regex: /^"[^"\n]*/, LF: 37 },
  // Error léxico: Cualquier carácter que no encaje en las reglas anteriores
  { tipo: 'ERROR_LEXICO', regex: /^./, LF: 38 }
];


export default Tokens2;