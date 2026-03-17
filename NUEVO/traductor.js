export default class Traductor {
    constructor(arbol, tabla) {
        this.arbol = arbol;
        this.tabla = tabla;

        this.codigoIntermedio = [];
        this.errores          = [];
        this.contadorTemporales = 0;
        this.contadorEtiquetas  = 0;

        this.codigoAsm       = [];
        this.variablesMasm   = [];
        this.temporalesMasm  = {};
        this.strings         = [];
        this.contadorStrings = 0;
    }

    // apoyo tac
    nuevoTemporal() { return `t${this.contadorTemporales++}`; }
    nuevaEtiqueta() { return `L${this.contadorEtiquetas++}`; }
    emitir(i)       { this.codigoIntermedio.push(i); }

    resolverOperacionContinua(valIzq, nodoP) {
        if (!nodoP) return valIzq;
        if (nodoP.valor === 'e' || nodoP.valor === 'ε') return valIzq;
        if (!nodoP.hijos || nodoP.hijos.length === 0) return valIzq;
        const opToken = nodoP.hijos[0];
        if (!opToken || opToken.LF === undefined) return valIzq;
        const valDer = this.recorrer(nodoP.hijos[1]);
        const temp   = this.nuevoTemporal();
        let op = '';
        if (opToken.LF === 6) op = '+';
        else if (opToken.LF === 7) op = '-';
        else if (opToken.LF === 8) op = '*';
        else if (opToken.LF === 9) op = '/';
        this.emitir(`${temp} = ${valIzq} ${op} ${valDer}`);
        return this.resolverOperacionContinua(temp, nodoP.hijos[2]);
    }

    // metodo principal
    traducir() {
        this.recorrer(this.arbol);
        this._construirMapaVariables();
        this._generarMasm();
        return { tac: this.codigoIntermedio, asm: this.codigoAsm };
    }

    // recorrido ast -> tac
    recorrer(nodo) {
        if (!nodo) return null;
        const t = nodo.tipo;

        if (t === 'NUMERO' || t === 'CADENA') return nodo.valor;
        if (t === 'IDENT')                    return nodo.valor;

        if (t === '<programa>') {
            this.recorrer(nodo.hijos[3]);
        }
        else if (t === '<lista_sentencias>') {
            if (nodo.valor !== 'e' && nodo.valor !== 'ε' && nodo.hijos && nodo.hijos.length > 0)
                nodo.hijos.forEach(h => this.recorrer(h));
        }
        else if (t === '<sentencia>' || t === '<cuerpo>') {
            return this.recorrer(nodo.hijos[t === '<cuerpo>' ? 1 : 0]);
        }
        else if (t === '<declaracion>') {
            const tipoVar   = nodo.hijos[1].valor;
            const nombreVar = nodo.hijos[2].valor;
            const opcAsig   = nodo.hijos[3];
            if (opcAsig.valor !== 'e' && opcAsig.valor !== 'ε' && opcAsig.hijos && opcAsig.hijos.length > 0) {
                const res = this.recorrer(opcAsig.hijos[1]);
                this.emitir(`${nombreVar} = ${res}`);
            } else {
                const def = tipoVar === 'String' ? '""' : '0';
                this.emitir(`${nombreVar} = ${def}`);
            }
        }
        else if (t === '<asignacion>') {
            const res = this.recorrer(nodo.hijos[2]);
            this.emitir(`${nodo.hijos[0].valor} = ${res}`);
        }
        else if (t === '<impresion>') {
            const res = this.recorrer(nodo.hijos[2]);
            this.emitir(`print ${res}`);
        }
        else if (t === '<expresion>' || t === '<termino>') {
            const izq = this.recorrer(nodo.hijos[0]);
            return this.resolverOperacionContinua(izq, nodo.hijos[1]);
        }
        else if (t === '<factor>') {
            return this.recorrer(nodo.hijos[0]);
        }
        else if (t === '<condicional>') {
            const comp   = nodo.hijos[2];
            const cuerpo = nodo.hijos[4];
            const alt    = nodo.hijos[5];
            const izq    = this.recorrer(comp.hijos[0]);
            const der    = this.recorrer(comp.hijos[2]);
            const opTok  = comp.hijos[1];
            let opRel = '==';
            if (opTok.LF === 10) opRel = '>';
            else if (opTok.LF === 11) opRel = '<';
            const lV   = this.nuevaEtiqueta();
            const lF   = this.nuevaEtiqueta();
            const lFin = this.nuevaEtiqueta();
            this.emitir(`if ${izq} ${opRel} ${der} goto ${lV}`);
            this.emitir(`goto ${lF}`);
            this.emitir(`${lV}:`);
            this.recorrer(cuerpo);
            this.emitir(`goto ${lFin}`);
            this.emitir(`${lF}:`);
            if (alt.valor !== 'e' && alt.valor !== 'ε' && alt.hijos && alt.hijos.length > 0)
                this.recorrer(alt.hijos[1]);
            this.emitir(`${lFin}:`);
        }
        return null;
    }

    // mapa de variables y temporales
    _construirMapaVariables() {
        for (const simbolo of this.tabla) {
            if (!simbolo.tipo || simbolo.tipo.toUpperCase() === 'PROGRAMA') continue;
            if (!simbolo.nombre) continue;
            this.variablesMasm.push({ nombre: simbolo.nombre, tipo: simbolo.tipo });
        }
        for (const linea of this.codigoIntermedio) {
            const m = linea.match(/^(t\d+)\s*=/);
            if (m && !(m[1] in this.temporalesMasm))
                this.temporalesMasm[m[1]] = true;
        }
    }

    // formatea en 3 columnas: mnemonico | op1 | op2
    _asm(linea) {
        if (linea === '' || (/^[A-Za-z_.][A-Za-z0-9_.]*:?(\s+\w.*)?$/.test(linea) && !linea.startsWith(' '))) {
            this.codigoAsm.push(linea);
            return;
        }
        const sangria  = linea.match(/^(\s*)/)[1];
        const contenido = linea.trimStart();
        const espacio  = contenido.search(/\s/);
        if (espacio === -1) {
            this.codigoAsm.push(`${sangria}${contenido}`);
            return;
        }
        const mnem = contenido.slice(0, espacio);
        const resto = contenido.slice(espacio).trim();
        const coma  = resto.indexOf(',');
        if (coma === -1) {
            this.codigoAsm.push(`${sangria}${mnem.padEnd(12)}${resto}`);
        } else {
            const op1 = resto.slice(0, coma).trim();
            const op2 = resto.slice(coma + 1).trim();
            this.codigoAsm.push(`${sangria}${mnem.padEnd(12)}${op1.padEnd(20)}${op2}`);
        }
    }

    _nombrePrograma() {
        const p = this.tabla.find(s => s.tipo === 'PROGRAMA');
        const nombre = p ? p.nombre : 'programa';
        return nombre.slice(0, 8);
    }

    _esRef(nombre) {
        return this.variablesMasm.some(v => v.nombre === nombre) ||
               (nombre in this.temporalesMasm);
    }

    _tipoVar(nombre) {
        const s = this.tabla.find(s => s.nombre === nombre);
        return s ? s.tipo : 'int';
    }

    _registrarString(val) {
        const contenido = val.slice(1, -1);
        const etq = `str_${this.contadorStrings++}`;
        this.strings.push({ etiqueta: etq, valor: contenido });
        return etq;
    }

    _cargarAx(val) {
        if (this._esRef(val)) {
            this._asm(`    mov  ax, ${val}`);
        } else if (/^-?\d+$/.test(val)) {
            this._asm(`    mov  ax, ${val}`);
        } else if (val.startsWith('"')) {
            const etq = this._registrarString(val);
            this._asm(`    lea  ax, ${etq}`);
        } else {
            this._asm(`    mov  ax, 0`);
        }
    }

    _cargarEax(val) { this._cargarAx(val); }

    _generarMasm() {
        const prog = this._nombrePrograma();

        this._asm(`title    ${prog}`);
        this._asm('.model   small');
        this._asm('.stack   100h');
        this._asm('');
        this._asm('.data');
        this._asm('');

        if (this.variablesMasm.length > 0) {
            for (const v of this.variablesMasm) {
                const pad = v.nombre.padEnd(14);
                if (v.tipo === 'String') {
                    this._asm(`    ${pad} DB  128 DUP(0)`);
                } else {
                    this._asm(`    ${pad} DW  0`);
                }
            }
            this._asm('');
        }

        const tempsKeys = Object.keys(this.temporalesMasm);
        if (tempsKeys.length > 0) {
            for (const tNombre of tempsKeys) {
                this._asm(`    ${tNombre.padEnd(14)} DW  0`);
            }
            this._asm('');
        }

        this._asm('    buf_int         DB  7 DUP(?)');
        this._asm('');

        const stringsIdx = this.codigoAsm.length;
        this._asm('');

        this._asm('.code');
        this._asm('');

        // subrutina imprimir
        this._asm('IMPRIMIR PROC');
        this._asm('    push ax');
        this._asm('    mov  ah, 09h');
        this._asm('    int  21h');
        this._asm('    pop  ax');
        this._asm('    ret');
        this._asm('IMPRIMIR ENDP');
        this._asm('');

        // subrutina imprimir_int
        this._asm('IMPRIMIR_INT PROC');
        this._asm('    push ax');
        this._asm('    push bx');
        this._asm('    push cx');
        this._asm('    push dx');
        this._asm('    push di');
        this._asm('');
        this._asm('    lea  di, buf_int');
        this._asm('    mov  cx, 0');
        this._asm('    cmp  ax, 0');
        this._asm('    jge  .positivo');
        this._asm('    mov  BYTE PTR [di], "-"');
        this._asm('    inc  di');
        this._asm('    neg  ax');
        this._asm('.positivo:');
        this._asm('    mov  bx, 10');
        this._asm('.loop_div:');
        this._asm('    xor  dx, dx');
        this._asm('    div  bx');
        this._asm('    push dx');
        this._asm('    inc  cx');
        this._asm('    cmp  ax, 0');
        this._asm('    jne  .loop_div');
        this._asm('.loop_str:');
        this._asm('    pop  dx');
        this._asm('    add  dl, "0"');
        this._asm('    mov  [di], dl');
        this._asm('    inc  di');
        this._asm('    loop .loop_str');
        this._asm('    mov  BYTE PTR [di], "$"');
        this._asm('');
        this._asm('    lea  dx, buf_int');
        this._asm('    call IMPRIMIR');
        this._asm('');
        this._asm('    pop  di');
        this._asm('    pop  dx');
        this._asm('    pop  cx');
        this._asm('    pop  bx');
        this._asm('    pop  ax');
        this._asm('    ret');
        this._asm('IMPRIMIR_INT ENDP');
        this._asm('');

        this._asm(`${prog} PROC`);
        this._asm('    mov  ax, @data');
        this._asm('    mov  ds, ax');
        this._asm('');

        for (const linea of this.codigoIntermedio) {
            this._traducirLinea(linea);
        }

        this._asm('    mov  ah, 4Ch');
        this._asm('    mov  al, 0');
        this._asm('    int  21h');
        this._asm('');
        this._asm(`${prog} ENDP`);
        this._asm('');
        this._asm(`END ${prog}`);

        if (this.strings.length > 0) {
            const lineasStrings = [];
            for (const s of this.strings) {
                const escaped = s.valor.replace(/"/g, "'");
                lineasStrings.push(`    ${s.etiqueta.padEnd(14)} DB  "${escaped}$"`);
            }
            lineasStrings.push('');
            this.codigoAsm.splice(stringsIdx, 1, ...lineasStrings);
        } else {
            this.codigoAsm.splice(stringsIdx, 1);
        }
    }

    _traducirLinea(linea) {

        // etiqueta
        if (/^L\d+:$/.test(linea.trim())) {
            this._asm(`${linea.trim()}`);
            return;
        }

        // salto condicional
        const mCond = linea.match(/^if\s+(\S+)\s+(==|>|<|>=|<=|!=)\s+(\S+)\s+goto\s+(\S+)$/);
        if (mCond) {
            const [, izq, op, der, etq] = mCond;
            this._cargarAx(izq);
            this._asm('    mov  cx, ax');
            this._cargarAx(der);
            this._asm('    cmp  cx, ax');
            const jmp = { '==':'je', '!=':'jne', '>':'jg', '<':'jl', '>=':'jge', '<=':'jle' }[op];
            this._asm(`    ${jmp}  ${etq}`);
            return;
        }

        // salto incondicional
        const mGoto = linea.match(/^goto\s+(\S+)$/);
        if (mGoto) {
            this._asm(`    jmp  ${mGoto[1]}`);
            return;
        }

        // impresion
        const mPrint = linea.match(/^print\s+(.+)$/);
        if (mPrint) {
            const val      = mPrint[1].trim();
            const esString = val.startsWith('"') || this._tipoVar(val) === 'String';
            if (esString) {
                if (val.startsWith('"')) {
                    const etq = this._registrarString(val);
                    this._asm(`    lea  dx, ${etq}`);
                } else {
                    this._asm(`    lea  dx, ${val}`);
                }
                this._asm('    call IMPRIMIR');
            } else {
                this._cargarAx(val);
                this._asm('    call IMPRIMIR_INT');
            }
            return;
        }

        // asignacion con operacion
        const mOp = linea.match(/^(\S+)\s*=\s*(\S+)\s*([+\-*/])\s*(\S+)$/);
        if (mOp) {
            const [, dest, izq, op, der] = mOp;
            this._cargarAx(izq);
            if (op === '+') {
                this._asm('    mov  cx, ax');
                this._cargarAx(der);
                this._asm('    add  cx, ax');
                this._asm('    mov  ax, cx');
            } else if (op === '-') {
                this._asm('    mov  cx, ax');
                this._cargarAx(der);
                this._asm('    sub  cx, ax');
                this._asm('    mov  ax, cx');
            } else if (op === '*') {
                this._asm('    mov  cx, ax');
                this._cargarAx(der);
                this._asm('    imul cx');
            } else if (op === '/') {
                this._asm('    mov  cx, ax');
                this._cargarAx(der);
                this._asm('    mov  bx, ax');
                this._asm('    mov  ax, cx');
                this._asm('    cwd');
                this._asm('    idiv bx');
            }
            if (this._esRef(dest)) this._asm(`    mov  ${dest}, ax`);
            return;
        }

        // asignacion simple
        const mAsig = linea.match(/^(\S+)\s*=\s*(.+)$/);
        if (mAsig) {
            const [, dest, src] = mAsig;
            this._cargarAx(src.trim());
            if (this._esRef(dest)) this._asm(`    mov  ${dest}, ax`);
            return;
        }

        this._asm(`    nop`);
    }
}