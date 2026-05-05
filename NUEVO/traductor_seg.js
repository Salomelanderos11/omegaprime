import ascii_dict from "./ascii.js";
export default class traductor_objeto {
  constructor() {
    // el diccionario ascii pa traducir las letras compa
    this.ascii_dict = ascii_dict;
  }

  // aqui pasamos los numeros enteros a binario dependiendo de los bits que pidan (8, 16)
  int_binario(num, bits) {
    let mask = 0xffffffff;
    if (bits === 8) mask = 0xff;
    else if (bits === 16) mask = 0xffff;
    
    let val = (num & mask) >>> 0; 
    return val.toString(2).padStart(bits, '0');
  }

  // convertir floats a binario
  float_binario(num) {
    const float_array = new Float32Array(1);
    float_array[0] = num;
    const int_array = new Int32Array(float_array.buffer);
    return (int_array[0] >>> 0).toString(2).padStart(32, '0');
  }

  // dividir la cadena en bytes y darle la vuelta 
  dividir_bytes(bin_str) {
    const bytes = [];
    for (let i = 0; i < bin_str.length; i += 8) {
        bytes.push(bin_str.slice(i, i + 8));
    }
    return bytes.reverse();
  }

  // funcion principal
  traducir(asm_array) {
    let en_segmento_data = false;
    const resultado_memoria = [];
    let offset_actual = 0; 

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
                let valor_original = match[3];
                valor_original = valor_original.replace(/,/g, '').trim();

                let bits = 16; 
                if (tipo_var === 'DB') bits = 8;
                else if (tipo_var === 'DW') bits = 16;
                else if (tipo_var === 'DD') bits = 32;
                
                let array_de_bytes = [];

                // strings
                if (/^".*"$/.test(valor_original)){
                    const texto = valor_original.slice(1, -1);
                    for (let j = 0; j < texto.length; j++) {
                        const ascii_val = this.ascii_dict[texto[j]] !== undefined ? this.ascii_dict[texto[j]] : 0;
                        array_de_bytes.push(this.int_binario(ascii_val, 8));
                    }
                } 
                // los  duplicados 
                else if (regex_dup.test(valor_original)) {
                    const dup_match = valor_original.match(regex_dup);
                    const repeticiones = parseInt(dup_match[1], 10);
                    const contenido_str = dup_match[2].trim();
                    
                    let base_bytes = [];
                    if (contenido_str === '?') {
                         base_bytes = this.dividir_bytes(this.int_binario(0, bits));
                    } else if (contenido_str.includes('.')) {
                         base_bytes = this.dividir_bytes(this.float_binario(parseFloat(contenido_str)));
                    } else {
                         base_bytes = this.dividir_bytes(this.int_binario(parseInt(contenido_str, 10), bits));
                    }
                    
                    for (let j = 0; j < repeticiones; j++) {
                        array_de_bytes.push(...base_bytes);
                    }
                } 
                // numeros float
                else if (valor_original.includes('.')) {
                    const float_val = parseFloat(valor_original);
                    if (!isNaN(float_val)) {
                        array_de_bytes = this.dividir_bytes(this.float_binario(float_val));
                    }
                }
                // enteros
                else {
                    const int_val = parseInt(valor_original, 10);
                    if (!isNaN(int_val)) {
                        array_de_bytes = this.dividir_bytes(this.int_binario(int_val, bits));
                    }
                }

                // sacamos el offset en binarioa 16 bits, o sea 2 bytes
                const offset_binario = this.int_binario(offset_actual, 16);

                // metemos todo al arra
                resultado_memoria.push([nombre_var, offset_binario, array_de_bytes]);

                // le sumamos al offset pa que avance en la memoria
                if (array_de_bytes.length > 0) {
                    offset_actual += array_de_bytes.length;
                }
            }
        }
    }

    return resultado_memoria;
  }
}