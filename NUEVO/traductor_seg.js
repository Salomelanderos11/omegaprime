import ascii_dict from "./ascii.js";

export default class traductor_objeto {
  constructor() {
    // EL DICCIONARIO ASCII PA TRADUCIR LAS LETRAS COMPA
    this.ascii_dict = ascii_dict;
  }

  // AQUI PASAMOS LOS NUMEROS ENTEROS A BINARIO DEPENDIENDO DE LOS BITS QUE PIDAN (8, 16 O 32)
  _int_to_bin_string(num, bits) {
    let mask = 0xffffffff;
    if (bits === 8) mask = 0xff;
    else if (bits === 16) mask = 0xffff;
    
    let val = (num & mask) >>> 0; 
    return val.toString(2).padStart(bits, '0');
  }

  // ESTE ROLLO CONVIERTE LOS NUMEROS CON PUNTO AL ESTANDAR IEEE 754 DE 32 BITS
  _float_to_32_bit_binary_string(num) {
    const float_array = new Float32Array(1);
    float_array[0] = num;
    const int_array = new Int32Array(float_array.buffer);
    return (int_array[0] >>> 0).toString(2).padStart(32, '0');
  }

  // PICAMOS LA CADENA BINARIA EN PEDAZOS DE 8 BITS Y LE DAMOS LA VUELTA PARA EL LITTLE ENDIAN
  _split_into_bytes(bin_str) {
    const bytes = [];
    for (let i = 0; i < bin_str.length; i += 8) {
        bytes.push(bin_str.slice(i, i + 8));
    }
    // LE DAMOS LA VUELTA AL ARREGLO PA QUE QUEDE AL REVES Y CUMPLA CON EL LITTLE ENDIAN
    return bytes.reverse();
  }

  // ESTA ES LA FUNCION CHIDA QUE HACE TODA LA CHAMBA DE PROCESAR EL ENSAMBLADOR
  traducir(asm_array) {
    let en_segmento_data = false;
    const resultado_memoria = [];
    let current_offset = 0; 

    const regex_variable = /^\s*([a-zA-Z0-9_]+)\s+(DB|DW|DD)\s+(.+)$/i;
    const regex_dup = /^(\d+)\s+DUP\((.+)\)$/i;

    for (let i = 0; i < asm_array.length; i++) {
        let linea = asm_array[i].trim();

        if (linea.toLowerCase() === '.data') {
            en_segmento_data = true;
            continue;
        }

        if (en_segmento_data && (linea.toLowerCase() === '.code' || linea.startsWith('.'))) {
            break; 
        }

        if (en_segmento_data && linea !== '') {
            const match = linea.match(regex_variable);

            if (match) {
                const nombre_var = match[1];
                const tipo_var = match[2].toUpperCase();
                const valor_original = match[3];
                
                let bits = 16; 
                if (tipo_var === 'DB') bits = 8;
                else if (tipo_var === 'DW') bits = 16;
                else if (tipo_var === 'DD') bits = 32;
                
                let array_de_bytes = [];

                // 1. LAS CADENAS DE TEXTO (A ESTAS NO LES DAMOS LA VUELTA, SE QUEDAN ASI PORQUE SON LETRAS)
                if (valor_original.startsWith('"') && valor_original.endsWith('"')) {
                    const texto = valor_original.slice(1, -1);
                    for (let j = 0; j < texto.length; j++) {
                        const ascii_val = this.ascii_dict[texto[j]] !== undefined ? this.ascii_dict[texto[j]] : 0;
                        array_de_bytes.push(this._int_to_bin_string(ascii_val, 8));
                    }
                } 
                // 2. LOS CLONES O DUPLICADOS (EL FAMOSO DUP)
                else if (regex_dup.test(valor_original)) {
                    const dup_match = valor_original.match(regex_dup);
                    const repeticiones = parseInt(dup_match[1], 10);
                    const contenido_str = dup_match[2].trim();
                    
                    let base_bytes = [];
                    if (contenido_str === '?') {
                         base_bytes = this._split_into_bytes(this._int_to_bin_string(0, bits));
                    } else if (contenido_str.includes('.')) {
                         base_bytes = this._split_into_bytes(this._float_to_32_bit_binary_string(parseFloat(contenido_str)));
                    } else {
                         base_bytes = this._split_into_bytes(this._int_to_bin_string(parseInt(contenido_str, 10), bits));
                    }
                    
                    for (let j = 0; j < repeticiones; j++) {
                        array_de_bytes.push(...base_bytes);
                    }
                } 
                // 3. LOS NUMEROS FLOTANTES
                else if (valor_original.includes('.')) {
                    const float_val = parseFloat(valor_original);
                    if (!isNaN(float_val)) {
                        array_de_bytes = this._split_into_bytes(this._float_to_32_bit_binary_string(float_val));
                    }
                }
                // 4. LOS NUMEROS ENTEROS NORMALITOS
                else {
                    const int_val = parseInt(valor_original, 10);
                    if (!isNaN(int_val)) {
                        array_de_bytes = this._split_into_bytes(this._int_to_bin_string(int_val, bits));
                    }
                }

                // SACAMOS EL OFFSET EN BINARIO A 16 BITS, O SEA 2 BYTES
                const offset_binario = this._int_to_bin_string(current_offset, 16);

                // METEMOS TODO AL ARREGLO FINAL [NOMBRE, OFFSET, ARRAY CON BYTES]
                resultado_memoria.push([nombre_var, offset_binario, array_de_bytes]);

                // LE SUMAMOS AL OFFSET PA QUE AVANCE EN LA MEMORIA
                current_offset += array_de_bytes.length;
            }
        }
    }

    return resultado_memoria;
  }
}