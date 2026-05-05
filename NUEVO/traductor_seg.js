export default class trudctor_objeto {
  constructor() {
    // Diccionario ASCII para la traducción de caracteres
    this.asciiDict = {
      " ": 32, "!": 33, "\"": 34, "#": 35, "$": 36, "%": 37, "&": 38, "'": 39,
      "(": 40, ")": 41, "*": 42, "+": 43, ",": 44, "-": 45, ".": 46, "/": 47,
      "0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54, "7": 55,
      "8": 56, "9": 57, ":": 58, ";": 59, "<": 60, "=": 61, ">": 62, "?": 63,
      "@": 64, "A": 65, "B": 66, "C": 67, "D": 68, "E": 69, "F": 70, "G": 71,
      "H": 72, "I": 73, "J": 74, "K": 75, "L": 76, "M": 77, "N": 78, "O": 79,
      "P": 80, "Q": 81, "R": 82, "S": 83, "T": 84, "U": 85, "V": 86, "W": 87,
      "X": 88, "Y": 89, "Z": 90, "[": 91, "\\": 92, "]": 93, "^": 94, "_": 95,
      "`": 96, "a": 97, "b": 98, "c": 99, "d": 100, "e": 101, "f": 102, "g": 103,
      "h": 104, "i": 105, "j": 106, "k": 107, "l": 108, "m": 109, "n": 110, "o": 111,
      "p": 112, "q": 113, "r": 114, "s": 115, "t": 116, "u": 117, "v": 118, "w": 119,
      "x": 120, "y": 121, "z": 122, "{": 123, "|": 124, "}": 125, "~": 126,
      "Ç": 128, "ü": 129, "é": 130, "â": 131, "ä": 132, "à": 133, "å": 134, "ç": 135,
      "ê": 136, "ë": 137, "è": 138, "ï": 139, "î": 140, "ì": 141, "Ä": 142, "Å": 143,
      "É": 144, "æ": 145, "Æ": 146, "ô": 147, "ö": 148, "ò": 149, "û": 150, "ù": 151,
      "ÿ": 152, "Ö": 153, "Ü": 154, "¢": 155, "£": 156, "¥": 157, "₧": 158, "ƒ": 159,
      "¡": 161, "¢": 162, "£": 163, "¤": 164, "¥": 165, "¦": 166, "§": 167, "¨": 168,
      "©": 169, "ª": 170, "«": 171, "¬": 172, "®": 174, "¯": 175, "°": 176, "±": 177,
      "²": 178, "³": 179, "´": 180, "µ": 181, "¶": 182, "·": 183, "¸": 184, "¹": 185,
      "º": 186, "»": 187, "¼": 188, "½": 189, "¾": 190, "¿": 191,
      "À": 192, "Á": 193, "Â": 194, "Ã": 195, "Ä": 196, "Å": 197, "Æ": 198, "Ç": 199,
      "È": 200, "É": 201, "Ê": 202, "Ë": 203, "Ì": 204, "Í": 205, "Î": 206, "Ï": 207,
      "Ð": 208, "Ñ": 209, "Ò": 210, "Ó": 211, "Ô": 212, "Õ": 213, "Ö": 214, "×": 215,
      "Ø": 216, "Ù": 217, "Ú": 218, "Û": 219, "Ü": 220, "Ý": 221, "Þ": 222, "ß": 223,
      "à": 224, "á": 225, "â": 226, "ã": 227, "ä": 228, "å": 229, "æ": 230, "ç": 231,
      "è": 232, "é": 233, "ê": 234, "ë": 235, "ì": 236, "í": 237, "î": 238, "ï": 239,
      "ð": 240, "ñ": 241, "ò": 242, "ó": 243, "ô": 244, "õ": 245, "ö": 246, "÷": 247,
      "ø": 248, "ù": 249, "ú": 250, "û": 251, "ü": 252, "ý": 253, "þ": 254, "ÿ": 255
    };
  }

  // Convierte enteros al binario del tamaño solicitado (8, 16 o 32 bits)
  _intToBinString(num, bits) {
    let mask = 0xFFFFFFFF;
    if (bits === 8) mask = 0xFF;
    else if (bits === 16) mask = 0xFFFF;
    
    let val = (num & mask) >>> 0; 
    return val.toString(2).padStart(bits, '0');
  }

  // Convierte flotantes al estándar IEEE 754 (32 bits)
  _floatTo32BitBinaryString(num) {
    const floatArray = new Float32Array(1);
    floatArray[0] = num;
    const intArray = new Int32Array(floatArray.buffer);
    return (intArray[0] >>> 0).toString(2).padStart(32, '0');
  }

  // Divide una cadena binaria larga en fragmentos de 8 bits (Bytes)
  _splitIntoBytes(binStr) {
    const bytes = [];
    for (let i = 0; i < binStr.length; i += 8) {
        bytes.push(binStr.slice(i, i + 8));
    }
    return bytes;
  }

  // Método principal expuesto para procesar el código ensamblador
  traducir(asmArray) {
    let enSegmentoData = false;
    const resultadoMemoria = [];
    let currentOffset = 0; 

    const regexVariable = /^\s*([a-zA-Z0-9_]+)\s+(DB|DW|DD)\s+(.+)$/i;
    const regexDup = /^(\d+)\s+DUP\((.+)\)$/i;

    for (let i = 0; i < asmArray.length; i++) {
        let linea = asmArray[i].trim();

        if (linea.toLowerCase() === '.data') {
            enSegmentoData = true;
            continue;
        }

        if (enSegmentoData && (linea.toLowerCase() === '.code' || linea.startsWith('.'))) {
            break; 
        }

        if (enSegmentoData && linea !== '') {
            const match = linea.match(regexVariable);

            if (match) {
                const tipoVar = match[2].toUpperCase();
                const valorOriginal = match[3];
                
                let bits = 16; 
                if (tipoVar === 'DB') bits = 8;
                else if (tipoVar === 'DW') bits = 16;
                else if (tipoVar === 'DD') bits = 32;
                
                let arrayDeBytes = [];

                // 1. Strings
                if (valorOriginal.startsWith('"') && valorOriginal.endsWith('"')) {
                    const texto = valorOriginal.slice(1, -1);
                    for (let j = 0; j < texto.length; j++) {
                        const asciiVal = this.asciiDict[texto[j]] !== undefined ? this.asciiDict[texto[j]] : 0;
                        arrayDeBytes.push(this._intToBinString(asciiVal, 8));
                    }
                } 
                // 2. Duplicaciones (DUP)
                else if (regexDup.test(valorOriginal)) {
                    const dupMatch = valorOriginal.match(regexDup);
                    const repeticiones = parseInt(dupMatch[1], 10);
                    const contenidoStr = dupMatch[2].trim();
                    
                    let baseBytes = [];
                    if (contenidoStr === '?') {
                         baseBytes = this._splitIntoBytes(this._intToBinString(0, bits));
                    } else if (contenidoStr.includes('.')) {
                         baseBytes = this._splitIntoBytes(this._floatTo32BitBinaryString(parseFloat(contenidoStr)));
                    } else {
                         baseBytes = this._splitIntoBytes(this._intToBinString(parseInt(contenidoStr, 10), bits));
                    }
                    
                    for (let j = 0; j < repeticiones; j++) {
                        arrayDeBytes.push(...baseBytes);
                    }
                } 
                // 3. Flotantes
                else if (valorOriginal.includes('.')) {
                    const floatVal = parseFloat(valorOriginal);
                    if (!isNaN(floatVal)) {
                        arrayDeBytes = this._splitIntoBytes(this._floatTo32BitBinaryString(floatVal));
                    }
                }
                // 4. Enteros
                else {
                    const intVal = parseInt(valorOriginal, 10);
                    if (!isNaN(intVal)) {
                        arrayDeBytes = this._splitIntoBytes(this._intToBinString(intVal, bits));
                    }
                }

                // Generar el Offset en formato binario de 32 bits (4 bytes)
                const offsetBinario = this._intToBinString(currentOffset, 32);

                // Insertar en el arreglo
                resultadoMemoria.push([offsetBinario, arrayDeBytes]);

                // Actualizar el Offset incrementándolo
                currentOffset += arrayDeBytes.length;
            }
        }
    }

    return resultadoMemoria;
  }
}