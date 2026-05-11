import ascii_dict from "./ascii.js";
import tabla_opcodes from "./opcodes.js";
import tabla_operandos from "./modrm.js";

export default class traductor_objeto {
    constructor() {
        this.ascii_dict = ascii_dict;
        this.registros = Object.keys(tabla_operandos.registros);
        this.tabla_simbolos = []; 
    }

    int_binario(num, bits) {
        let mask = bits === 8 ? 0xff : (bits === 16 ? 0xffff : 0xffffffff);
        let val = (num & mask) >>> 0; 
        return val.toString(2).padStart(bits, '0');
    }

    float_binario(num) {
        const float_array = new Float32Array(1);
        float_array[0] = num;
        const int_array = new Int32Array(float_array.buffer);
        return (int_array[0] >>> 0).toString(2).padStart(32, '0');
    }

    dividir_bytes(bin_str) {
        const bytes = [];
        for (let i = 0; i < bin_str.length; i += 8) {
            bytes.push(bin_str.slice(i, i + 8));
        }
        return bytes.reverse() // little endian
    }

    // logica de memoria y operandos

    identificar_tipo_operando(operando) {
        if (!operando) return null;
        // limpieza para quitar directivas y pasar a mayusculas
        let op = operando.toUpperCase().replace(/BYTE PTR|WORD PTR/gi, '').trim();
        
        if (this.registros.includes(op)) return "Reg";
        if (op.startsWith("[") && op.endsWith("]")) return "Mem";
        if (/^-?\d+$/.test(op) || /^[0-9A-F]+h$/i.test(op)) return "Vi";
        if (/^".*"$/.test(op) || /^'.*'$/.test(op)) return "Vi";
        
        return "Mem"; 
    }

    obtener_offset_variable(nombre) {
        const simbolo = this.tabla_simbolos.find(s => s.variable === nombre);
        // si existe devolvemos su offset en binario de 16 bits
        return simbolo ? simbolo.offset : "0000000000000000"; 
    }

    // procesamiento de segmentos

    traducir_data(lineas_data) {
        const resultado_memoria = [];
        let offset_actual = 0; 
        const regex_variable = /^\s*([a-zA-Z0-9_]+)\s+(DB|DW|DD)\s*,?\s*(.+)$/i;
        const regex_dup = /^(\d+)\s+DUP\((.+)\)$/i;

        for (let linea of lineas_data) {
            const match = linea.match(regex_variable);
            if (match) {
                const nombre_var = match[1];
                const tipo_var = match[2].toUpperCase();
                let valor_original = match[3].replace(/^,\s*/, '').trim();

                let bits = tipo_var === 'DB' ? 8 : (tipo_var === 'DW' ? 16 : 32);
                let array_de_bytes = [];

                if (/^".*"$/.test(valor_original)){
                    // procesamiento de strings caracter por caracter
                    const texto = valor_original.slice(1, -1);
                    for (let char of texto) {
                        const ascii = this.ascii_dict[char] || 0;
                        array_de_bytes.push(this.int_binario(ascii, 8));
                    }
                } else if (regex_dup.test(valor_original)) {
                    // procesamiento de directiva dup para repeticiones
                    const dup_match = valor_original.match(regex_dup);
                    const repeticiones = parseInt(dup_match[1], 10);
                    const contenido = dup_match[2].trim();
                    let base = this.dividir_bytes(this.int_binario(contenido === '?' ? 0 : parseInt(contenido), bits));
                    for (let j = 0; j < repeticiones; j++) array_de_bytes.push(...base);
                } else {
                    // procesamiento de valores numericos directos
                    let val = parseInt(valor_original.toLowerCase().endsWith('h') ? valor_original.slice(0, -1) : valor_original, 10);
                    array_de_bytes = this.dividir_bytes(this.int_binario(val, bits));
                }

                const offset_bin = this.int_binario(offset_actual, 16);
                resultado_memoria.push({ variable: nombre_var, offset: offset_bin, bytes: array_de_bytes });
                offset_actual += array_de_bytes.length;
            }
        }
        return resultado_memoria;
    }

    traducir_code(lineas_code) {
        const resultado_codigo = [];
        let offset_instruccion = 0;

        // auxiliar para agrupar bits en bloques de 8 con espacios
        const empaquetado = (cadenaBits) => {
            if (!cadenaBits || cadenaBits === "---") return cadenaBits;
            const bytes = [];
            for (let i = 0; i < cadenaBits.length; i += 8) {
                let bloque = cadenaBits.slice(i, i + 8);
                // relleno a la derecha para completar el byte
                bytes.push(bloque.padEnd(8, '0'));
            }
            return bytes.join(' ');
        };

        for (let linea of lineas_code) {
            // filtrar etiquetas y directivas de proceso
            if (linea.includes(":") || linea.toUpperCase().includes("PROC") || linea.toUpperCase().includes("ENDP")) {
                resultado_codigo.push({ tipo: "etiqueta", original: linea, binario: "" });
                continue;
            }

            const partes = linea.trim().split(/\s+(.+)/);
            if (partes.length < 1) continue;

            const mnemonico = partes[0].toUpperCase();
            // limpieza profunda de directivas de tamaño
            const ops_str = partes[1] ? partes[1].replace(/BYTE PTR|WORD PTR/gi, '').trim() : "";
            const ops_raw = ops_str ? ops_str.split(',').map(o => o.trim()) : [];

            const operandos = ops_raw.map(op => ({
                valor: op,
                tipo: this.identificar_tipo_operando(op)
            }));

            let binario_sucio = "";
            const variantes = tabla_opcodes[mnemonico];
            
            if (variantes) {
                const firma = operandos.map(o => o.tipo);
                const plantilla = variantes.find(v => JSON.stringify(v.operandos) === JSON.stringify(firma));

                if (plantilla) {
                    // logica de tamaño para definir el bit w
                    let w_bit = "1"; 
                    operandos.forEach(op => {
                        let opNorm = op.valor.toUpperCase().replace(/BYTE PTR|WORD PTR/gi, '').trim();
                        let regInfo = tabla_operandos.registros[opNorm];
                        if (regInfo && regInfo.w === "0") w_bit = "0";
                    });

                    let opcode = plantilla.opcode
                        .replace('w', w_bit)
                        .replace('d', '1') 
                        .replace('s', '0');
                        
                    let modrm = "";
                    let desplazamiento = "";
                    let inmediato = "";

                    if (plantilla.modrm) {
                        let mod = "11", reg = "000", rm = "000";

                        operandos.forEach((op, i) => {
                            let valNorm = op.valor.toUpperCase().replace(/BYTE PTR|WORD PTR/gi, '').trim();
                            
                            if (op.tipo === "Reg") {
                                let code = tabla_operandos.registros[valNorm].rm;
                                // asignacion de registros en campos reg o rm
                                if (operandos.length === 1) rm = code; 
                                else { if (i === 0) reg = code; else rm = code; }
                            } 
                            else if (op.tipo === "Mem") {
                                if (valNorm === "[DI]") {
                                    mod = "00"; rm = "101"; 
                                } else {
                                    mod = "00"; rm = "110"; 
                                    let off_bin = this.obtener_offset_variable(valNorm);
                                    // aplicacion de little endian al offset de memoria
                                    desplazamiento = this.dividir_bytes(off_bin).join('');
                                }
                            } 
                            else if (op.tipo === "Vi") {
                                let rawVal = op.valor.replace(/"|'/g, '');
                                let num = /^\d+$/.test(rawVal) ? parseInt(rawVal, 10) : (this.ascii_dict[rawVal] || 0);
                                if (rawVal.toLowerCase().endsWith('h')) num = parseInt(rawVal.slice(0, -1), 16);
                                
                                let bits_vi = (w_bit === "0" || mnemonico === "INT") ? 8 : 16;
                                let vi_puro = this.int_binario(num, bits_vi);
                                // aplicacion de little endian si el inmediato es de 16 bits
                                inmediato = (bits_vi === 16) ? this.dividir_bytes(vi_puro).join('') : vi_puro;
                            }
                        });

                        if (plantilla.reg_ext) reg = plantilla.reg_ext;
                        modrm = mod + reg + rm;
                    } else {
                        // formato corto opcode de 5 bits mas 3 bits de registro
                        if (opcode.length === 5 && operandos[0]?.tipo === "Reg") {
                            let regCode = tabla_operandos.registros[operandos[0].valor.toUpperCase()].rm;
                            opcode = opcode + regCode;
                        }
                        
                        const vi = operandos.find(o => o.tipo === "Vi");
                        if (vi) {
                            let rawVal = vi.valor.replace(/"|'/g, '');
                            let num = /^\d+$/.test(rawVal) ? parseInt(rawVal, 10) : (this.ascii_dict[rawVal] || 0);
                            if (rawVal.toLowerCase().endsWith('h')) num = parseInt(rawVal.slice(0, -1), 16);
                            
                            let bits_vi = (mnemonico === "INT") ? 8 : 16;
                            let vi_puro = this.int_binario(num, bits_vi);
                            inmediato = (bits_vi === 16) ? this.dividir_bytes(vi_puro).join('') : vi_puro;
                        }
                    }
                    
                    binario_sucio = opcode + modrm + desplazamiento + inmediato;
                }
            }

            resultado_codigo.push({
                mnemonico,
                original: linea,
                binario: empaquetado(binario_sucio) || "---",
                offset: this.int_binario(offset_instruccion, 16)
            });

            if (binario_sucio) {
                // avance del offset segun la longitud en bytes de la instruccion
                offset_instruccion += (binario_sucio.length / 8);
            }
        }
        return resultado_codigo;
    }

    traducir(asm_array) {
        let l_data = [], l_code = [], seg = null;
        
        asm_array.forEach(linea => {
            let l = linea.trim();
            if (l.toLowerCase() === '.data') seg = 'd';
            else if (l.toLowerCase() === '.code') seg = 'c';
            else if (seg === 'd' && l) l_data.push(l);
            else if (seg === 'c' && l) l_code.push(l);
        });

        this.tabla_simbolos = this.traducir_data(l_data);
        return {
            segmento_data: this.tabla_simbolos,
            segmento_code: this.traducir_code(l_code)
        };
    }
}