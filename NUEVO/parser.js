import Tokens2 from "./tokens.js"; 

export default class Parser {
  constructor(tokens) {
    // Filtramos los espacios (LF 24) para que no interfieran en la sintaxis
    this.tokens = tokens.filter(t => t.LF !== 24); 
    this.posicion = 0;
  }

  // --- MÉTODOS DE APOYO ---
  encontrarLF(lf) {
    const t = Tokens2.find(tok => tok.LF === lf);
    return t ? t.tipo : "DESCONOCIDO";
  }

  tokenActual() {
    return this.tokens[this.posicion] ?? { LF: -1, tipo: 'FIN', valor: 'FIN' };
  }

  consumir(tipoLF) {
    const token = this.tokenActual();
    if (token.LF === tipoLF) {
      this.posicion++;
      return token;
    }
    throw new Error(`Se esperaba ${this.encontrarLF(tipoLF)} pero se encontró '${token.valor}' (LF: ${token.LF})`);
  }

  comprobar(tipoLF) {
    return this.tokenActual().LF === tipoLF;
  }

  // --- PRODUCCIONES DE LA GRAMÁTICA ---

  // <programa> ::= programa <identificador> <? <lista_sentencias> ?>
  programa() {
    const tProg = this.consumir(1);   // programa
    const tId = this.consumir(21);     // identificador
    const tIni = this.consumir(19);    // <?
    const nodoLista = this.lista_sentencias();
    const tFin = this.consumir(20);    // ?>

    // Verificación de fin de cadena
    if (this.posicion < this.tokens.length) {
      throw new Error(`Tokens inesperados tras el cierre del programa: ${this.tokenActual().valor}`);
    }

    return { tipo: '<programa>', hijos: [tProg, tId, tIni, nodoLista, tFin] };
  }

  // <cuerpo> ::= { <lista_sentencias> }
  cuerpo() {
    const tIzq = this.consumir(17); // {
    const nodoLista = this.lista_sentencias();
    const tDer = this.consumir(18); // }
    return { tipo: '<cuerpo>', hijos: [tIzq, nodoLista, tDer] };
  }

  // <lista_sentencias> ::= <sentencia> <lista_sentencias> | ε
  lista_sentencias() {
    const hijos = [];
    // crear(2), ident(21), mostrar(3), si(4)
    const inicios = [2, 21, 3, 4]; 
    while (inicios.includes(this.tokenActual().LF)) {
      hijos.push(this.sentencia());
    }
    return { tipo: '<lista_sentencias>', hijos: hijos.length > 0 ? hijos : [{ valor: 'ε' }] };
  }

  // <sentencia> ::= <declaracion> ; | <asignacion> ; | <impresion> ; | <condicional>
  sentencia() {
    let nodo;
    if (this.comprobar(2)) { 
      nodo = this.declaracion();
      this.consumir(14); // ;
    } else if (this.comprobar(21) && this.tokens[this.posicion + 1]?.LF === 13) { 
      nodo = this.asignacion();
      this.consumir(14); // ;
    } else if (this.comprobar(3)) { 
      nodo = this.impresion();
      this.consumir(14); // ;
    } else if (this.comprobar(4)) { 
      nodo = this.condicional();
    } else {
      throw new Error(`Sentencia inválida iniciando con: ${this.tokenActual().valor}`);
    }
    return { tipo: '<sentencia>', hijos: [nodo] };
  }

  // <tipo> ::= int | float | String
  tipo() {
    const lf = this.tokenActual().LF;
    if ([40, 41, 42].includes(lf)) {
      return this.consumir(lf);
    }
    throw new Error(`Se esperaba un tipo de dato (int, float, String) pero se encontró '${this.tokenActual().valor}'`);
  }

  // <declaracion> ::= crear <tipo> <identificador> <opc_asig>
  declaracion() {
    const tCrear = this.consumir(2);
    const nodoTipo = this.tipo();
    const tId = this.consumir(21);
    const nodoOpc = this.opc_asig();
    return { tipo: '<declaracion>', hijos: [tCrear, nodoTipo, tId, nodoOpc] };
  }

  // <opc_asig> ::= = <expresion> | ε
  opc_asig() {
    if (this.comprobar(13)) {
      const tAsig = this.consumir(13);
      const nodoExpr = this.expresion();
      return { tipo: '<opc_asig>', hijos: [tAsig, nodoExpr] };
    }
    return { tipo: '<opc_asig>', valor: 'ε', hijos: [] };
  }

  // <asignacion> ::= <identificador> = <expresion>
  asignacion() {
    const tId = this.consumir(21);
    const tEq = this.consumir(13);
    const nodoExpr = this.expresion();
    return { tipo: '<asignacion>', hijos: [tId, tEq, nodoExpr] };
  }

  // <impresion> ::= mostrar ( <expresion> )
  impresion() {
    const tM = this.consumir(3);
    const tI = this.consumir(15);
    const nodoE = this.expresion();
    const tD = this.consumir(16);
    return { tipo: '<impresion>', hijos: [tM, tI, nodoE, tD] };
  }

  // <condicional> ::= si ( <comparacion> ) <cuerpo> <alternativa>
  condicional() {
    const tSi = this.consumir(4);
    const tIzq = this.consumir(15);
    const nodoComp = this.comparacion();
    const tDer = this.consumir(16);
    const nodoCuerpo = this.cuerpo();
    const nodoAlt = this.alternativa();
    return { tipo: '<condicional>', hijos: [tSi, tIzq, nodoComp, tDer, nodoCuerpo, nodoAlt] };
  }

  // <alternativa> ::= sino <cuerpo> | ε
  alternativa() {
    if (this.comprobar(5)) {
      const tSino = this.consumir(5);
      const nodoCuerpo = this.cuerpo();
      return { tipo: '<alternativa>', hijos: [tSino, nodoCuerpo] };
    }
    return { tipo: '<alternativa>', valor: 'ε', hijos: [] };
  }

  // <comparacion> ::= <expresion> <op_rel> <expresion>
  comparacion() {
    const e1 = this.expresion();
    const rel = this.op_rel();
    const e2 = this.expresion();
    return { tipo: '<comparacion>', hijos: [e1, rel, e2] };
  }

  op_rel() {
    const lf = this.tokenActual().LF;
    if ([10, 11, 12].includes(lf)) return this.consumir(lf);
    throw new Error("Se esperaba un operador relacional (mayor, menor, igual)");
  }

  // <expresion> ::= <termino> <expresion_p>
  expresion() {
    const t = this.termino();
    const ep = this.expresion_p();
    return { tipo: '<expresion>', hijos: [t, ep] };
  }

  // <expresion_p> ::= <op_suma> <termino> <expresion_p> | ε
  expresion_p() {
    if (this.comprobar(6) || this.comprobar(7)) {
      const op = this.consumir(this.tokenActual().LF);
      const t = this.termino();
      const ep = this.expresion_p();
      return { tipo: '<expresion_p>', hijos: [op, t, ep] };
    }
    return { tipo: '<expresion_p>', valor: 'ε', hijos: [] };
  }

  // <termino> ::= <factor> <termino_p>
  termino() {
    const f = this.factor();
    const tp = this.termino_p();
    return { tipo: '<termino>', hijos: [f, tp] };
  }

  // <termino_p> ::= <op_mult> <factor> <termino_p> | ε
  termino_p() {
    if (this.comprobar(8) || this.comprobar(9)) {
      const op = this.consumir(this.tokenActual().LF);
      const f = this.factor();
      const tp = this.termino_p();
      return { tipo: '<termino_p>', hijos: [op, f, tp] };
    }
    return { tipo: '<termino_p>', valor: 'ε', hijos: [] };
  }

  // <factor> ::= ( <expresion> ) | <identificador> | <numero> | <cadena>
  factor() {
    const t = this.tokenActual();
    if (t.LF === 15) { // (
      this.consumir(15);
      const e = this.expresion();
      this.consumir(16); // )
      return { tipo: '<factor>', hijos: [e] };
    } 
    if (t.LF === 21) return this.consumir(21); // ident
    if (t.LF === 22) return this.consumir(22); // numero
    if (t.LF === 36) return this.consumir(36); // cadena
    throw new Error(`Se esperaba un valor (número, texto o variable) pero se encontró '${t.valor}'`);
  }

  analizar() {
    try {
      const arbol = this.programa();
      return { exito: true, arbol, errores: [] };
    } catch (error) {
      return { exito: false, arbol: null, errores: [error.message] };
    }
  }
}