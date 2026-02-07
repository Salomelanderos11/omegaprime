const Tokens = [
  { tipo: 'ESPACIO', regex: /^\s+/ },// se usa como regex para identificar y descar los espacios
  { tipo: 'INI_PROG', regex: /^<\?/ },
  { tipo: 'FIN_PROG', regex: /^\?>/ },
  { tipo: 'PA_RES', regex: /^\b(programa|crear|mostrar|si|sino|mas|menos|por|entre|mayor|menor|igual)\b/ },
  { tipo: 'CADENA', regex: /^"[a-zA-Z?=0,-9\s+]*"/ },
  { tipo: 'NUMERO', regex: /^[0-9]+/ },
  { tipo: 'IDENT', regex: /^[a-zA-Z][a-zA-Z0-9]*/ },
  { tipo: 'IGUAL',    regex: /^=/ },
  { tipo: 'PT_COMA',  regex: /^;/ },
  { tipo: 'PAR_IZQ',  regex: /^\(/ },
  { tipo: 'PAR_DER',  regex: /^\)/ },
  { tipo: 'LLAVE_IZQ', regex: /^\{/ },
  { tipo: 'LLAVE_DER', regex: /^\}/ }
];
export default Tokens;
