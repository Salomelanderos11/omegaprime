const Tokens = [
  { tipo: 'ESPACIO', regex: /^\s+/ },
  
  // Delimitadores de Programa
  { tipo: 'INI_PROG', regex: /^<\?/ },
  { tipo: 'FIN_PROG', regex: /^\?>/ },
  
  // Palabras Reservadas (Terminales de control)
  { tipo: 'PA_RES', regex: /^\b(programa|crear|mostrar|si|sino|mas|menos|por|entre|mayor|menor|igual)\b/ },
  
  /**
   * ACTUALIZACIÓN REGLA 19 Y 20:
   * La Regex ahora incluye todos los caracteres definidos en tu regla <caracteres>:
   * letra, digito, espacio, !, ?, ., ,, :, -, _, +, *, /
   */
  { tipo: 'CADENA', regex: /^"[a-zA-Z0-9\s!?. ,:\-_+*/]*"/ },
  
  { tipo: 'NUMERO', regex: /^[0-9]+/ },
  { tipo: 'IDENT', regex: /^[a-zA-Z][a-zA-Z0-9]*/ },
  
  // Símbolos y Operadores
  { tipo: 'IGUAL',    regex: /^=/ },
  { tipo: 'PT_COMA',  regex: /^;/ },
  { tipo: 'PAR_IZQ',  regex: /^\(/ },
  { tipo: 'PAR_DER',  regex: /^\)/ },
  { tipo: 'LLAVE_IZQ', regex: /^\{/ },
  { tipo: 'LLAVE_DER', regex: /^\}/ }
];
export default Tokens;
