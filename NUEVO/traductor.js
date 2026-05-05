export default class traductor {
    constructor(arbol, tabla) {
        this.arbol = arbol;
        this.tabla = tabla;

        this.codigo_intermedio   = [];
        this.errores             = [];
        this.contador_temporales = 0;
        this.contador_etiquetas  = 0;

        this.codigo_asm      = [];
        this.variables_masm  = [];
        this.temporales_masm = {};
        this.strings         = [];
        this.contador_strings = 0;
    }

    // apoyo tac
    nuevo_temporal() { return `t${this.contador_temporales++}`; }
    nueva_etiqueta() { return `L${this.contador_etiquetas++}`; }
    emitir(i)        { this.codigo_intermedio.push(i); }

    resolver_operacion(val_izq, nodo_p) {
        if (!nodo_p) return val_izq;
        if (nodo_p.valor === 'e' || nodo_p.valor === 'ε') return val_izq;
        if (!nodo_p.hijos || nodo_p.hijos.length === 0) return val_izq;
        const op_token = nodo_p.hijos[0];
        if (!op_token || op_token.LF === undefined) return val_izq;
        const val_der = this.recorrer(nodo_p.hijos[1]);
        const temp    = this.nuevo_temporal();
        let op = '';
        if (op_token.LF === 6) op = '+';
        else if (op_token.LF === 7) op = '-';
        else if (op_token.LF === 8) op = '*';
        else if (op_token.LF === 9) op = '/';
        this.emitir(`${temp} = ${val_izq} ${op} ${val_der}`);
        return this.resolver_operacion(temp, nodo_p.hijos[2]);
    }

    // metodo principal
    traducir() {
        this.recorrer(this.arbol);
        this.construir_mapa();
        this.generar_masm();
        return { tac: this.codigo_intermedio, asm: this.codigo_asm };
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
            const tipo_var   = nodo.hijos[1].valor;
            const nombre_var = nodo.hijos[2].valor;
            const opc_asig   = nodo.hijos[3];
            if (opc_asig.valor !== 'e' && opc_asig.valor !== 'ε' && opc_asig.hijos && opc_asig.hijos.length > 0) {
                const res = this.recorrer(opc_asig.hijos[1]);
                this.emitir(`${nombre_var} = ${res}`);
            } else {
                const def = tipo_var === 'String' ? '""' : '0';
                this.emitir(`${nombre_var} = ${def}`);
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
            return this.resolver_operacion(izq, nodo.hijos[1]);
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
            const op_tok = comp.hijos[1];
            let op_rel = '==';
            if (op_tok.LF === 10) op_rel = '>';
            else if (op_tok.LF === 11) op_rel = '<';
            const lv   = this.nueva_etiqueta();
            const lf   = this.nueva_etiqueta();
            const lfin = this.nueva_etiqueta();
            this.emitir(`if ${izq} ${op_rel} ${der} goto ${lv}`);
            this.emitir(`goto ${lf}`);
            this.emitir(`${lv}:`);
            this.recorrer(cuerpo);
            this.emitir(`goto ${lfin}`);
            this.emitir(`${lf}:`);
            if (alt.valor !== 'e' && alt.valor !== 'ε' && alt.hijos && alt.hijos.length > 0)
                this.recorrer(alt.hijos[1]);
            this.emitir(`${lfin}:`);
        }
        return null;
    }

    // mapa de variables y temporales
    construir_mapa() {
        for (const simbolo of this.tabla) {
            if (!simbolo.tipo || simbolo.tipo.toUpperCase() === 'PROGRAMA') continue;
            if (!simbolo.nombre) continue;
            // --- MODIFICACIÓN: Ahora extraemos también el "valor" de la tabla ---
            this.variables_masm.push({ 
                nombre: simbolo.nombre, 
                tipo: simbolo.tipo, 
                valor: simbolo.valor // Extraemos el valor original
            });
        }
        for (const linea of this.codigo_intermedio) {
            const m = linea.match(/^(t\d+)\s*=/);
            if (m && !(m[1] in this.temporales_masm))
                this.temporales_masm[m[1]] = true;
        }
    }

    // formatea en 3 columnas
    asm(linea) {
        if (linea === '' || (/^[A-Za-z_.][A-Za-z0-9_.]*:?(\s+\w.*)?$/.test(linea) && !linea.startsWith(' '))) {
            this.codigo_asm.push(linea);
            return;
        }
        const sangria   = linea.match(/^(\s*)/)[1];
        const contenido = linea.trimStart();
        const espacio   = contenido.search(/\s/);
        if (espacio === -1) {
            this.codigo_asm.push(`${sangria}${contenido}`);
            return;
        }
        const mnem  = contenido.slice(0, espacio);
        const resto = contenido.slice(espacio).trim();
        const coma  = resto.indexOf(',');
        
        if (coma === -1) {
            // forzamos el espacio agregando " " antes de resto y subimos el pad a 20
            this.codigo_asm.push(`${sangria}${mnem.padEnd(20)} ${resto}`);
        } else {
            const op1 = resto.slice(0, coma).trim();
            const op2 = resto.slice(coma + 1).trim();
            // mismo ajuste para instrucciones con dos operandos
            this.codigo_asm.push(`${sangria}${mnem.padEnd(20)} ${op1.padEnd(15)} ${op2}`);
        }
    }
    

    nombre_programa() {
        const p = this.tabla.find(s => s.tipo === 'PROGRAMA');
        const nombre = p ? p.nombre : 'programa';
        return nombre.slice(0, 8);
    }

    es_ref(nombre) {
        return this.variables_masm.some(v => v.nombre === nombre) ||
               (nombre in this.temporales_masm);
    }

    tipo_var(nombre) {
        const s = this.tabla.find(s => s.nombre === nombre);
        return s ? s.tipo : 'int';
    }

    registrar_string(val) {
        const contenido = val.slice(1, -1);
        const etq = `str_${this.contador_strings++}`;
        this.strings.push({ etiqueta: etq, valor: contenido });
        return etq;
    }

    cargar_ax(val) {
        if (this.es_ref(val)) {
            this.asm(`    mov  ax, ${val}`);
        } else if (/^-?\d+$/.test(val)) {
            this.asm(`    mov  ax, ${val}`);
        } else if (val.startsWith('"')) {
            const etq = this.registrar_string(val);
            this.asm(`    lea  ax, ${etq}`);
        } else {
            this.asm(`    mov  ax, 0`);
        }
    }

    // generador masm
    generar_masm() {
        const prog = this.nombre_programa();

        this.asm(`title    ${prog}`);
        this.asm('.model   small');
        this.asm('.stack   100h');
        this.asm('');
        this.asm('.data');
        this.asm('');

        if (this.variables_masm.length > 0) {
            for (const v of this.variables_masm) {
                const pad = v.nombre.padEnd(14);
                
                // --- MODIFICACIÓN: Rescatar el valor inicial ---
                let valor_inicial = v.valor !== undefined && v.valor !== null ? v.valor : 0;

                if (v.tipo === 'String') {
                    // Validamos si tiene un string válido en su valor inicial
                    if (valor_inicial !== 0 && valor_inicial !== '0' && valor_inicial !== "" && valor_inicial !== '""') {
                        // Limpiamos las comillas que traiga desde el analizador
                        let cadenaLimpia = String(valor_inicial).replace(/^["']|["']$/g, '');
                        // Ensamblamos el string original en memoria terminado en '$'
                        this.asm(`    ${pad} DB  "${cadenaLimpia}$"`);
                    } else {
                        // Si no se inicializó con cadena de texto, dejamos buffer libre
                        this.asm(`    ${pad} DB  128 DUP(0)`);
                    }
                } else {
                    // Inyectar en memoria DW el número inicial
                    this.asm(`    ${pad} DW  ${valor_inicial}`);
                }
            }
            this.asm('');
        }

        const temps = Object.keys(this.temporales_masm);
        if (temps.length > 0) {
            for (const t of temps) {
                this.asm(`    ${t.padEnd(14)} DW  0`);
            }
            this.asm('');
        }

        this.asm('    buf_int         DB  7 DUP(?)');
        this.asm('');

        const strings_idx = this.codigo_asm.length;
        this.asm('');

        this.asm('.code');
        this.asm('');

        // subrutina imprimir
        this.asm('IMPRIMIR PROC');
        this.asm('    push ax');
        this.asm('    mov  ah, 09h');
        this.asm('    int  21h');
        this.asm('    pop  ax');
        this.asm('    ret');
        this.asm('IMPRIMIR ENDP');
        this.asm('');

        // subrutina imprimir_int
        this.asm('IMPRIMIR_INT PROC');
        this.asm('    push ax');
        this.asm('    push bx');
        this.asm('    push cx');
        this.asm('    push dx');
        this.asm('    push di');
        this.asm('');
        this.asm('    lea  di, buf_int');
        this.asm('    mov  cx, 0');
        this.asm('    cmp  ax, 0');
        this.asm('    jge  .positivo');
        this.asm('    mov  BYTE PTR [di], "-"');
        this.asm('    inc  di');
        this.asm('    neg  ax');
        this.asm('.positivo:');
        this.asm('    mov  bx, 10');
        this.asm('.loop_div:');
        this.asm('    xor  dx, dx');
        this.asm('    div  bx');
        this.asm('    push dx');
        this.asm('    inc  cx');
        this.asm('    cmp  ax, 0');
        this.asm('    jne  .loop_div');
        this.asm('.loop_str:');
        this.asm('    pop  dx');
        this.asm('    add  dl, "0"');
        this.asm('    mov  [di], dl');
        this.asm('    inc  di');
        this.asm('    loop .loop_str');
        this.asm('    mov  BYTE PTR [di], "$"');
        this.asm('');
        this.asm('    lea  dx, buf_int');
        this.asm('    call IMPRIMIR');
        this.asm('');
        this.asm('    pop  di');
        this.asm('    pop  dx');
        this.asm('    pop  cx');
        this.asm('    pop  bx');
        this.asm('    pop  ax');
        this.asm('    ret');
        this.asm('IMPRIMIR_INT ENDP');
        this.asm('');

        this.asm(`${prog} PROC`);
        this.asm('    mov  ax, @data');
        this.asm('    mov  ds, ax');
        this.asm('');

        for (const linea of this.codigo_intermedio) {
            this.traducir_linea(linea);
        }

        this.asm('    mov  ah, 4Ch');
        this.asm('    mov  al, 0');
        this.asm('    int  21h');
        this.asm('');
        this.asm(`${prog} ENDP`);
        this.asm('');
        this.asm(`END ${prog}`);

        if (this.strings.length > 0) {
            const lineas = [];
            for (const s of this.strings) {
                const escaped = s.valor.replace(/"/g, "'");
                lineas.push(`    ${s.etiqueta.padEnd(14)} DB  "${escaped}$"`);
            }
            lineas.push('');
            this.codigo_asm.splice(strings_idx, 1, ...lineas);
        } else {
            this.codigo_asm.splice(strings_idx, 1);
        }
    }

    // traduccion de lineas tac -> masm
    traducir_linea(linea) {

        // etiqueta
        if (/^L\d+:$/.test(linea.trim())) {
            this.asm(`${linea.trim()}`);
            return;
        }

        // salto condicional
        const m_cond = linea.match(/^if\s+(\S+)\s+(==|>|<|>=|<=|!=)\s+(\S+)\s+goto\s+(\S+)$/);
        if (m_cond) {
            const [, izq, op, der, etq] = m_cond;
            this.cargar_ax(izq);
            this.asm('    mov  cx, ax');
            this.cargar_ax(der);
            this.asm('    cmp  cx, ax');
            const jmp = { '==':'je', '!=':'jne', '>':'jg', '<':'jl', '>=':'jge', '<=':'jle' }[op];
            this.asm(`    ${jmp}  ${etq}`);
            return;
        }

        // salto incondicional
        const m_goto = linea.match(/^goto\s+(\S+)$/);
        if (m_goto) {
            this.asm(`    jmp  ${m_goto[1]}`);
            return;
        }

        // impresion
        const m_print = linea.match(/^print\s+(.+)$/);
        if (m_print) {
            const val       = m_print[1].trim();
            const es_string = val.startsWith('"') || this.tipo_var(val) === 'String';
            if (es_string) {
                if (val.startsWith('"')) {
                    const etq = this.registrar_string(val);
                    this.asm(`    lea  dx, ${etq}`);
                } else {
                    this.asm(`    lea  dx, ${val}`);
                }
                this.asm('    call IMPRIMIR');
            } else {
                this.cargar_ax(val);
                this.asm('    call IMPRIMIR_INT');
            }
            return;
        }

        // asignacion con operacion
        const m_op = linea.match(/^(\S+)\s*=\s*(\S+)\s*([+\-*/])\s*(\S+)$/);
        if (m_op) {
            const [, dest, izq, op, der] = m_op;
            this.cargar_ax(izq);
            if (op === '+') {
                this.asm('    mov  cx, ax');
                this.cargar_ax(der);
                this.asm('    add  cx, ax');
                this.asm('    mov  ax, cx');
            } else if (op === '-') {
                this.asm('    mov  cx, ax');
                this.cargar_ax(der);
                this.asm('    sub  cx, ax');
                this.asm('    mov  ax, cx');
            } else if (op === '*') {
                this.asm('    mov  cx, ax');
                this.cargar_ax(der);
                this.asm('    imul cx');
            } else if (op === '/') {
                this.asm('    mov  cx, ax');
                this.cargar_ax(der);
                this.asm('    mov  bx, ax');
                this.asm('    mov  ax, cx');
                this.asm('    cwd');
                this.asm('    idiv bx');
            }
            if (this.es_ref(dest)) this.asm(`    mov  ${dest}, ax`);
            return;
        }

        // asignacion simple
        const m_asig = linea.match(/^(\S+)\s*=\s*(.+)$/);
        if (m_asig) {
            const [, dest, src] = m_asig;
            this.cargar_ax(src.trim());
            if (this.es_ref(dest)) this.asm(`    mov  ${dest}, ax`);
            return;
        }

        this.asm(`    nop`);
    }
}