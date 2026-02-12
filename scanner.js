import Tokens2 from "./tokens.js";

function escanear(codigo) {
  let posicion = 0;
  const tokensencontrados = [];
  const errores = [];

  console.log("--- Iniciando Analisis Lexico ---");

  while (posicion < codigo.length) {
    const cadenarestante = codigo.slice(posicion);
    let coincidencia = false;

    for (const { tipo, regex } of Tokens2) {
      const match = cadenarestante.match(regex);

      if (match) {
        const valor = match[0];

        //cadena sin cerrar
        if (tipo === 'ERROR_CADENA') {
          errores.push({
            caracter: valor,
            posicion: posicion,
            mensaje: `Error Lexico: Se abrio una cadena con '"' pero nunca se cerro.`
          });
          // avanzar el puntero toda la longitud de la cadena incompplta
          posicion += valor.length;
          coincidencia = true;
          break;
        }

        // si es un token valido y no es espacio lo guardamos
        if (tipo !== 'ESPACIO') {
          for (const tokenLf of tokensLf) {
                if (tokenLf.simbolo === valor) {
                    tokensencontrados.push({ tipo, valor, valorLf: tokenLf.valor });
                    break;
                }  
            }
        }
        
        
        posicion += valor.length;
        coincidencia = true;
        break; 
      }
    }

    // caracteres no permitidos
    if (!coincidencia) {
      const caracterIlegal = codigo[posicion];
      
      errores.push({
        caracter: caracterIlegal,
        posicion: posicion,
        mensaje: `Error Lexico: Caracter '${caracterIlegal}' no reconocido en el lenguaje.`
      });

      posicion++; // Avanzamos uno para no quedar en bucle infinito
    }
  }

  console.log("--- Analisis Finalizado ---");
  
  return {
    exito: errores.length === 0,
    tokens: tokensencontrados,
    errores: errores
  };
}

const tokensLf = [
  { simbolo: "programa", valor: 1 },
  { simbolo: "crear", valor: 2 },
  { simbolo: "mostrar", valor: 3 },
  { simbolo: "si", valor: 4 },
  { simbolo: "sino", valor: 5 },
  { simbolo: "mas", valor: 6 },
  { simbolo: "menos", valor: 7 },
  { simbolo: "por", valor: 8 },
  { simbolo: "entre", valor: 9 },
  { simbolo: "mayor", valor: 10 },
  { simbolo: "menor", valor: 11 },
  { simbolo: "igual", valor: 12 },
  { simbolo: "='", valor: 13 },
  { simbolo: ";", valor: 14 },
  { simbolo: "(", valor: 15 },
  { simbolo: ")", valor: 16 },
  { simbolo: "{", valor: 17 },
  { simbolo: "}", valor: 18 },
  { simbolo: "<?", valor: 19 },
  { simbolo: "?>", valor: 20 },
  { simbolo: "letra", valor: 21 },
  { simbolo: "digito", valor: 22 },
  { simbolo: "\"", valor: 23 },
  { simbolo: "β", valor: 24 },
  { simbolo: "!", valor: 25 },
  { simbolo: "?", valor: 26 },
  { simbolo: ".", valor: 27 },
  { simbolo: ",", valor: 28 },
  { simbolo: ":", valor: 29 },
  { simbolo: "-", valor: 30 },
  { simbolo: "_", valor: 31 },
  { simbolo: "+'", valor: 32 },
  { simbolo: "*", valor: 33 },
  { simbolo: "/", valor: 34 }
];

const ListaTokensUnificada = [
  // Delimitadores de programa
  { tipo: 'INI_PROG', regex: /^<\?/, valor: 19 },
  { tipo: 'FIN_PROG', regex: /^\?>/, valor: 20 },

  // Palabras reservadas (PA_RES)
  // Se usa \b para asegurar que coincida con la palabra completa y no sea parte de otra
  { tipo: 'PA_RES', regex: /^programa\b/, valor: 1 },
  { tipo: 'PA_RES', regex: /^crear\b/, valor: 2 },
  { tipo: 'PA_RES', regex: /^mostrar\b/, valor: 3 },
  { tipo: 'PA_RES', regex: /^si\b/, valor: 4 },
  { tipo: 'PA_RES', regex: /^sino\b/, valor: 5 },
  { tipo: 'PA_RES', regex: /^mas\b/, valor: 6 },
  { tipo: 'PA_RES', regex: /^menos\b/, valor: 7 },
  { tipo: 'PA_RES', regex: /^por\b/, valor: 8 },
  { tipo: 'PA_RES', regex: /^entre\b/, valor: 9 },
  { tipo: 'PA_RES', regex: /^mayor\b/, valor: 10 },
  { tipo: 'PA_RES', regex: /^menor\b/, valor: 11 },
  { tipo: 'PA_RES', regex: /^igual\b/, valor: 12 },

  // Símbolos y Operadores (Muchos requieren escape \ por ser caracteres reservados en Regex)
  { tipo: 'IGUAL', regex: /^=/, valor: 13 },
  { tipo: 'PT_COMA', regex: /^;/, valor: 14 },
  { tipo: 'PAR_IZQ', regex: /^\(/, valor: 15 },
  { tipo: 'PAR_DER', regex: /^\)/, valor: 16 },
  { tipo: 'LLAVE_IZQ', regex: /^\{/, valor: 17 },
  { tipo: 'LLAVE_DER', regex: /^\}/, valor: 18 },
  
  // Otros caracteres y símbolos especiales
  { tipo: 'COMILLA', regex: /^"/, valor: 23 },
  { tipo: 'ESPACIO', regex: /^\s+/, valor: 24 }, // Captura uno o más espacios en blanco
  { tipo: 'EXCLAMACION', regex: /^!/, valor: 25 },
  { tipo: 'INTERROGACION', regex: /^\?/, valor: 26 },
  { tipo: 'PUNTO', regex: /^\./, valor: 27 },
  { tipo: 'COMA', regex: /^,/, valor: 28 },
  { tipo: 'DOS_PUNTOS', regex: /^:/, valor: 29 },
  { tipo: 'GUION', regex: /^-/, valor: 30 },
  { tipo: 'GUION_BAJO', regex: /^_/, valor: 31 },
  { tipo: 'SUMA_ESPECIAL', regex: /^\+'/, valor: 32 },
  { tipo: 'ASTERISCO', regex: /^\*/, valor: 33 },
  { tipo: 'DIAGONAL', regex: /^\//, valor: 34 },

  // Definiciones genéricas (Identificadores y Números)
  // IDENT: Empieza con letra, seguido de letras o números
  { tipo: 'IDENT', regex: /^[a-zA-Z][a-zA-Z0-9]*/, valor: 21 },
  // NUMERO: Uno o más dígitos
  { tipo: 'NUMERO', regex: /^\d+/, valor: 22 }
];

export default escanear;