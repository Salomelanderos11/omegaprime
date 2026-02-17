export default class Parser {
  constructor(tokens) {
    // Filtramos los espacios (LF 24) antes de empezar
    this.tokens = tokens.filter(t => t.LF !== 24);
    this.posicion = 0;
    this.errores = [];
  }

  // --- MÉTODOS DE APOYO ---

  // Obtiene el token actual sin avanzar
  tokenActual() {
    return this.tokens[this.posicion] ?? { LF: -1, tipo: 'FIN', valor: 'FIN' };
  }

  // Comprueba si el token actual coincide con el esperado y avanza
  consumir(tipoLF) {
    const token = this.tokenActual();
    if (token.LF === tipoLF) {
      this.posicion++;
      return token;
    }
    throw new Error(`Se esperaba LF ${tipoLF} pero se encontró '${token.valor}' (LF: ${token.LF})`);
  }

  // Verifica si el token actual coincide sin lanzar error
  comprobar(tipoLF) {
    return this.tokenActual().LF === tipoLF;
  }

  // --- PRODUCCIONES DE LA GRAMÁTICA ---

  // <programa> ::= programa <identificador> <? <cuerpo> ?>
  programa() {
    const tInicio = this.consumir(1); // programa
    const tId = this.consumir(21);     // identificador
    const tAbreTag = this.consumir(19); // <?
    const nodoCuerpo = this.cuerpo();
    const tCierraTag = this.consumir(20); // ?>

    return {
      tipo: '<programa>',
      LF: 100,
      hijos: [tInicio, tId, tAbreTag, nodoCuerpo, tCierraTag]
    };
  }

  // <cuerpo> ::= { <lista_sentencias> }
  cuerpo() {
    const tIzq = this.consumir(17); // {
    const nodoLista = this.lista_sentencias();
    const tDer = this.consumir(18); // }
    return { tipo: '<cuerpo>', LF: 107, hijos: [tIzq, nodoLista, tDer] };
  }

  // <lista_sentencias> ::= <sentencia> <lista_sentencias> | ∈
  lista_sentencias() {
    const hijos = [];
    // Mientras el token actual pueda empezar una sentencia (crear, ident, mostrar, si)
    const iniciosSentencia = [2, 21, 3, 4];
    
    while (iniciosSentencia.includes(this.tokenActual().LF)) {
      hijos.push(this.sentencia());
    }

    return { 
      tipo: '<lista_sentencias>', 
      LF: 106, 
      hijos: hijos.length > 0 ? hijos : [{ tipo: 'EPSILON', valor: '∈' }] 
    };
  }

  // <sentencia> ::= <declaracion> ; | <asignacion> ; | <impresion> ; | <condicional>
  sentencia() {
    let nodo;
    const token = this.tokenActual();

    if (token.LF === 2) { // crear
      nodo = this.declaracion();
      this.consumir(14); // ;
    } else if (token.LF === 21 && this.tokens[this.posicion + 1]?.LF === 13) { // ident =
      nodo = this.asignacion();
      this.consumir(14); // ;
    } else if (token.LF === 3) { // mostrar
      nodo = this.impresion();
      this.consumir(14); // ;
    } else if (token.LF === 4) { // si
      nodo = this.condicional();
    } else {
      throw new Error(`Sentencia no reconocida: ${token.valor}`);
    }

    return { tipo: '<sentencia>', LF: 105, hijos: [nodo] };
  }

  // <declaracion> ::= crear <identificador> = <expresion> | crear <identificador>
  declaracion() {
    const tCrear = this.consumir(2);
    const tId = this.consumir(21);
    const hijos = [tCrear, tId];

    if (this.comprobar(13)) { // si viene un '='
      hijos.push(this.consumir(13));
      hijos.push(this.expresion());
    }
    return { tipo: '<declaracion>', LF: 104, hijos };
  }

  // <asignacion> ::= <identificador> = <expresion>
  asignacion() {
    const tId = this.consumir(21);
    const tEq = this.consumir(13);
    const nodoExpr = this.expresion();
    return { tipo: '<asignacion>', LF: 108, hijos: [tId, tEq, nodoExpr] };
  }

  // <impresion> ::= mostrar ( <expresion> )
  impresion() {
    const tMostrar = this.consumir(3);
    const tIzq = this.consumir(15);
    const nodoExpr = this.expresion();
    const tDer = this.consumir(16);
    return { tipo: '<impresion>', LF: 109, hijos: [tMostrar, tIzq, nodoExpr, tDer] };
  }

  // <condicional> ::= si ( <comparacion> ) { <cuerpo> } <alternativa>
  condicional() {
    const tSi = this.consumir(4);
    const tIzqP = this.consumir(15);
    const nodoComp = this.comparacion();
    const tDerP = this.consumir(16);
    
    // Según tu gramática literal: { <cuerpo> }
    const tIzqLl = this.consumir(17);
    const nodoCuerpo = this.cuerpo();
    const tDerLl = this.consumir(18);
    
    const nodoAlt = this.alternativa();

    return { 
      tipo: '<condicional>', 
      LF: 110, 
      hijos: [tSi, tIzqP, nodoComp, tDerP, tIzqLl, nodoCuerpo, tDerLl, nodoAlt] 
    };
  }

  // <alternativa> ::= sino { <cuerpo> } | ∈
  alternativa() {
    if (this.comprobar(5)) { // sino
      const tSino = this.consumir(5);
      const tIzq = this.consumir(17);
      const nodoCuerpo = this.cuerpo();
      const tDer = this.consumir(18);
      return { tipo: '<alternativa>', LF: 111, hijos: [tSino, tIzq, nodoCuerpo, tDer] };
    }
    return { tipo: '<alternativa>', LF: 111, hijos: [{ tipo: 'EPSILON', valor: '∈' }] };
  }

  // <comparacion> ::= <expresion> <op_rel> <expresion>
  comparacion() {
    const e1 = this.expresion();
    const rel = this.op_rel();
    const e2 = this.expresion();
    return { tipo: '<comparacion>', LF: 112, hijos: [e1, rel, e2] };
  }

  // <expresion> ::= <termino> { <op_suma> <termino> }
  expresion() {
    let nodo = this.termino();
    while (this.comprobar(6) || this.comprobar(7)) { // mas o menos
      const op = this.op_suma();
      const der = this.termino();
      nodo = { tipo: '<expresion>', LF: 103, hijos: [nodo, op, der] };
    }
    return nodo;
  }

  // <termino> ::= <factor> { <op_mult> <factor> }
  termino() {
    let nodo = this.factor();
    while (this.comprobar(8) || this.comprobar(9)) { // por o entre
      const op = this.op_mult();
      const der = this.factor();
      nodo = { tipo: '<termino>', LF: 102, hijos: [nodo, op, der] };
    }
    return nodo;
  }

  // <factor> ::= ( <expresion> ) | <identificador> | <numero> | <cadena>
  factor() {
    const token = this.tokenActual();
    if (token.LF === 15) { // (
      this.consumir(15);
      const expr = this.expresion();
      this.consumir(16);
      return { tipo: '<factor>', LF: 101, hijos: [expr] };
    } else if (token.LF === 21) { // ident
      return this.consumir(21);
    } else if (token.LF === 22) { // numero
      return this.consumir(22);
    } else if (token.LF === 36) { // cadena
      return this.consumir(36);
    }
    throw new Error(`Factor inválido: ${token.valor}`);
  }

  op_suma() { return this.tokenActual().LF === 6 ? this.consumir(6) : this.consumir(7); }
  op_mult() { return this.tokenActual().LF === 8 ? this.consumir(8) : this.consumir(9); }
  op_rel() { 
    const lf = this.tokenActual().LF;
    if (lf === 10 || lf === 11 || lf === 12) return this.consumir(lf);
    throw new Error("Se esperaba operador relacional");
  }

  // --- PUNTO DE ENTRADA ---
  analizar() {
    try {
      const arbol = this.programa();
      return { exito: true, arbol, errores: [] };
    } catch (error) {
      return { exito: false, arbol: null, errores: [error.message] };
    }
  }
}