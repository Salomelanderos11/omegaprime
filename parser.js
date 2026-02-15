// parser.js
export default class Parser {
  constructor(tokens) {
    // Solo ignora espacios (LF 24). NO hay soporte de comentarios.
    this.tokens = tokens.filter(t => t.LF !== 24);
    this.pila = [];
    this.posicion = 0;
    this.errores = [];
  }

  verSiguiente() {
    return this.tokens[this.posicion] ?? { LF: -1, tipo: 'FIN', valor: 'FIN' };
  }

  matchLF(seq) {
    if (this.pila.length < seq.length) return false;
    for (let i = 0; i < seq.length; i++) {
      const idx = this.pila.length - seq.length + i;
      if (this.pila[idx].LF !== seq[i]) return false;
    }
    return true;
  }

  aplicar(nuevoTipo, numElementos, nuevoLF) {
    const hijos = this.pila.splice(this.pila.length - numElementos);
    const nodo = { tipo: nuevoTipo, LF: nuevoLF, hijos };
    this.pila.push(nodo);
    console.log(`%c[REDUCCIÓN] → ${nuevoTipo} (LF: ${nuevoLF})`, "color:#00b341;font-weight:bold;");
    return true;
  }

  // ---------------------------------------
  //   Predicción: ¿se puede reducir ahora?
  // ---------------------------------------
  sePuedeReducir() {
    const sig = this.verSiguiente().LF;

    const SUMA = [6, 7];       // mas, menos
    const MULT = [8, 9];       // por, entre
    const REL  = [10, 11, 12]; // mayor, menor, igual

    // ---------- ÁTOMOS → <factor> ----------
    // NUMERO
    if (this.matchLF([22])) return true;

    // IDENT: NO subir a <factor> si está justo después de CREAR (LF 2)
    if (this.matchLF([21])) {
      const izq = this.pila[this.pila.length - 2]?.LF;
      const vieneDeCrear = (izq === 2);
      if (!vieneDeCrear && sig !== 19 && sig !== 13) return true;
    }

    // CADENA
    if (this.matchLF([36])) return true;

    // *** PRIORIDAD: MOSTRAR ( EXPR ) -> <impresion> ***
    if (this.matchLF([3, 15, 103, 16])) return true;

    // Paréntesis: ( <expresion> ) -> <factor>
    if (this.matchLF([15, 103, 16])) return true;

    // ---------- <factor> → <termino> ----------
    if (this.matchLF([101])) return true;

    // ---------- MULT/DIV (prioridad alta) ----------
    if (this.matchLF([102, 8, 101])) return true;  // termino * factor
    if (this.matchLF([102, 9, 101])) return true;  // termino / factor
    if (this.matchLF([102, 8, 102])) return true;  // (si el derecho ya subió a termino)
    if (this.matchLF([102, 9, 102])) return true;

    // ---------- SUMA/RESTA (antes de 102→103) ----------
    if (this.matchLF([103, 6, 102])) return true;  // expresion + termino
    if (this.matchLF([103, 7, 102])) return true;  // expresion - termino

    // ---------- Promoción <termino> → <expresion> ----------
    if (this.matchLF([102])) {
      const a = this.pila[this.pila.length - 2]?.LF;
      const b = this.pila[this.pila.length - 3]?.LF;
      const haySumaIzq = (b === 103) && (a === 6 || a === 7);
      if (!haySumaIzq && (SUMA.includes(sig) || ![...SUMA, ...MULT, ...REL].includes(sig))) {
        return true;
      }
    }

    // ---------- COMPARACIÓN ----------
    if (this.matchLF([103, 10, 103])) return true; // mayor
    if (this.matchLF([103, 11, 103])) return true; // menor
    if (this.matchLF([103, 12, 103])) return true; // igual

    // ---------- DECLARACIÓN ----------
    if (this.matchLF([2, 21, 13, 103])) return true;   // crear ident = expr
    if (this.matchLF([2, 21]) && sig !== 13) return true; // crear ident (sin init)

    // ---------- ASIGNACIÓN ----------
    if (this.matchLF([21, 13, 103])) return true; // ident = expr

    // ---------- IMPRESIÓN ----------
    // (ya está arriba, antes de los paréntesis)

    // ---------- SENTENCIAS ----------
    if (this.matchLF([104, 14])) return true; // declaracion ;
    if (this.matchLF([108, 14])) return true; // asignacion ;
    if (this.matchLF([109, 14])) return true; // impresion ;
    if (this.matchLF([110])) return true;     // condicional

    // ---------- ALTERNATIVA ----------
    if (this.matchLF([5, 17, 106, 18])) return true; // sino { lista }

    // ---------- CONDICIONAL (con y sin 'sino') ----------
    if (this.matchLF([4, 15, 112, 16, 17, 106, 18, 111])) return true;         // si (...) { lista } alternativa
    if (this.matchLF([4, 15, 112, 16, 17, 106, 18]) && sig !== 5) return true; // si (...) { lista } (sin 'sino' detrás)

    // ---------- LISTA DE SENTENCIAS ----------
    if (this.matchLF([106, 105])) return true; // <lista> <sentencia> → <lista>
    if (this.matchLF([105])) return true;      // arranca lista con 1a sentencia

    // Bloque vacío: materializa ε para la lista si viene { }
    if (this.matchLF([17]) && sig === 18) return true;

    // ---------- CUERPO y PROGRAMA ----------
    if (this.matchLF([17, 106, 18])) return true;           // { lista } -> <cuerpo>
    if (this.matchLF([1, 21, 19, 107, 20])) return true;    // programa ident <? <cuerpo> ?>

    return false;
  }

  // ------------------------
  //       Reducciones
  // ------------------------
  reducir() {
    const sig = this.verSiguiente().LF;
    const SUMA = [6, 7];
    const MULT = [8, 9];

    // ----- <factor> -----
    // NUMERO
    if (this.matchLF([22])) return this.aplicar('<factor>', 1, 101);

    // IDENT (evitar "crear IDENT ..." hasta decidir declaración)
    if (this.matchLF([21])) {
      const izq = this.pila[this.pila.length - 2]?.LF;
      const vieneDeCrear = (izq === 2);
      if (!vieneDeCrear && sig !== 19 && sig !== 13) {
        return this.aplicar('<factor>', 1, 101);
      }
    }

    // CADENA
    if (this.matchLF([36])) return this.aplicar('<factor>', 1, 101);

    // *** PRIORIDAD: <impresion> ***
    if (this.matchLF([3, 15, 103, 16])) {
      return this.aplicar('<impresion>', 4, 109);
    }

    // Paréntesis
    if (this.matchLF([15, 103, 16])) return this.aplicar('<factor>', 3, 101);

    // ----- <termino> -----
    if (this.matchLF([101])) return this.aplicar('<termino>', 1, 102);
    if (this.matchLF([102, 8, 101])) return this.aplicar('<termino>', 3, 102); // * factor
    if (this.matchLF([102, 9, 101])) return this.aplicar('<termino>', 3, 102); // / factor
    if (this.matchLF([102, 8, 102])) return this.aplicar('<termino>', 3, 102); // * termino
    if (this.matchLF([102, 9, 102])) return this.aplicar('<termino>', 3, 102); // / termino

    // ----- SUMA/RESTA -----
    if (this.matchLF([103, 6, 102])) {
      if (!MULT.includes(sig)) return this.aplicar('<expresion>', 3, 103);
    }
    if (this.matchLF([103, 7, 102])) {
      if (!MULT.includes(sig)) return this.aplicar('<expresion>', 3, 103);
    }

    // ----- <expresion> desde <termino> -----
    if (this.matchLF([102])) {
      const a = this.pila[this.pila.length - 2]?.LF;
      const b = this.pila[this.pila.length - 3]?.LF;
      const haySumaIzq = (b === 103) && (a === 6 || a === 7);
      if (!haySumaIzq && (SUMA.includes(sig) || ![...SUMA, ...MULT].includes(sig))) {
        return this.aplicar('<expresion>', 1, 103);
      }
    }

    // ----- <comparacion> -----
    if (this.matchLF([103, 10, 103])) return this.aplicar('<comparacion>', 3, 112); // mayor
    if (this.matchLF([103, 11, 103])) return this.aplicar('<comparacion>', 3, 112); // menor
    if (this.matchLF([103, 12, 103])) return this.aplicar('<comparacion>', 3, 112); // igual

    // ----- <declaracion> -----
    if (this.matchLF([2, 21, 13, 103])) return this.aplicar('<declaracion>', 4, 104); // crear ident = expr
    if (this.matchLF([2, 21]) && sig !== 13) return this.aplicar('<declaracion>', 2, 104); // crear ident

    // ----- <asignacion> -----
    if (this.matchLF([21, 13, 103])) return this.aplicar('<asignacion>', 3, 108);

    // ----- <sentencia> -----
    if (this.matchLF([109, 14])) return this.aplicar('<sentencia>', 2, 105); // impresion ;
    if (this.matchLF([104, 14])) return this.aplicar('<sentencia>', 2, 105); // declaracion ;
    if (this.matchLF([108, 14])) return this.aplicar('<sentencia>', 2, 105); // asignacion ;
    if (this.matchLF([110]))      return this.aplicar('<sentencia>', 1, 105); // condicional

    // ----- <alternativa> -----
    if (this.matchLF([5, 17, 106, 18])) return this.aplicar('<alternativa>', 4, 111); // sino { lista }

    // ----- <condicional> (con y sin 'sino') -----
    if (this.matchLF([4, 15, 112, 16, 17, 106, 18, 111])) {
      return this.aplicar('<condicional>', 8, 110);
    }
    if (this.matchLF([4, 15, 112, 16, 17, 106, 18]) && this.verSiguiente().LF !== 5) {
      return this.aplicar('<condicional>', 7, 110);
    }

    // ----- <lista_sentencias> -----
    if (this.matchLF([106, 105])) return this.aplicar('<lista_sentencias>', 2, 106); // concatena
    if (this.matchLF([105]))      return this.aplicar('<lista_sentencias>', 1, 106); // arranca

    // Bloque vacío: { } → inyectar lista ε para poder reducir a <cuerpo>
    if (this.matchLF([17]) && this.verSiguiente().LF === 18) {
      this.pila.push({
        tipo: '<lista_sentencias>',
        LF: 106,
        hijos: [{ tipo: 'EPSILON', LF: 999, valor: '∈' }]
      });
      return true;
    }

    // ----- <cuerpo> -----
    if (this.matchLF([17, 106, 18])) return this.aplicar('<cuerpo>', 3, 107);

    // ----- <programa> -----
    if (this.matchLF([1, 21, 19, 107, 20])) return this.aplicar('<programa>', 5, 100);

    return false;
  }

  reportarError() {
    const token = this.verSiguiente();
    this.errores.push(
      `Error Sintáctico cerca de '${token?.valor}' (LF: ${token?.LF}, tipo: ${token?.tipo})`
    );
  }

  analizar() {
    this.pila = [];
    this.posicion = 0;

    console.log('--- Iniciando Análisis Sintáctico (LF Mode) ---');

    while (this.posicion < this.tokens.length || this.sePuedeReducir()) {
      if (this.sePuedeReducir()) {
        if (!this.reducir()) break;
      } else if (this.posicion < this.tokens.length) {
        const t = this.tokens[this.posicion];
        console.log(`%c[DESPLAZAR] ${t.tipo} (${t.LF})`, "color:#00acee");
        this.pila.push(t);
        this.posicion++;
      } else {
        break;
      }
    }

    // Reducciones finales
    let hubo;
    do { hubo = this.reducir(); } while (hubo);

    const exito = this.pila.length === 1 && this.pila[0].LF === 100; // <programa>
    if (!exito) {
      console.warn("⚠️ Análisis fallido. Estado de la pila:", JSON.parse(JSON.stringify(this.pila)));
      this.reportarError();
    }

    return {
      exito,
      arbol: exito ? this.pila[0] : null,
      errores: this.errores,
      pilaFinal: JSON.parse(JSON.stringify(this.pila))
    };
  }
}