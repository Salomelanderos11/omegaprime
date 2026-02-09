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
export default Tokens;
