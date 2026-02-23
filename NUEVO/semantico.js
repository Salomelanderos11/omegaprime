export default class analizadorsemantico {
    constructor(arbol) {
        this.arbol = arbol;
        this.tabla = []; // array para los simbolos
        this.errores = [];
        this.contadorme = 0; // contador para direcciones de memoria

        //tamaños de tipo variable 
        this.tamaños = {
            "int": 4,
            "float": 8,
            "String": 2 
        };
    }
    //funcion principal que activa el analisis
    validacion() {
        this.tabla = [];
        this.errores = [];
        this.contadorme = 0;
        this.recorrer(this.arbol);
        console.log("tabla de simbolos final:", this.tabla);
    }
    //funcion para pasar por cad nodo del arbol sintactico que da el parser
    recorrer(nodo) {
        if (!nodo) return;
        let tiponodo = nodo.tipo;

        // --- deteccion del nombre del programa ---
        if (tiponodo == "<programa>") {
            let nombreapp = nodo.hijos[1].valor;
            console.log("%cnombre del programa detectado: " + nombreapp, "color: #3498db; font-weight: bold;");
            
            this.tabla.push({
                nombre: nombreapp,
                tipo: "PROGRAMA",
                valor: "0",
                direccion: "----"
            });
        }

        // --- declaraciones de variables ---
        if (tiponodo == "<declaracion>") {
            let nombrevar = nodo.hijos[2].valor;
            let tipo = nodo.hijos[1].valor;
            let valor = 0;

            if (nodo.hijos[3] && nodo.hijos[3].hijos && nodo.hijos[3].hijos.length > 1) {
                let expresion = nodo.hijos[3].hijos[1];
                let termino = expresion.hijos[0];
                let factor = termino.hijos[0];

                if (factor) {
                    let expresionp = expresion.hijos[1];
                    if (expresionp && expresionp.hijos && expresionp.hijos.length > 0) {
                        valor = 0;
                    } else {
                        valor = factor.valor;
                    }

                    // validacion de tipos
                    if (tipo == "int" || tipo == "float") {
                        if (factor.tipo == "CADENA") {
                            this.errores.push(`error: no se puede asignar CADENA a '${nombrevar}' (${tipo})`);
                        }
                    } else if (tipo == "String" && factor.tipo == "NUMERO") {
                        this.errores.push(`error: no se puede asignar NUMERO a '${nombrevar}' (String)`);
                    }
                }
            }
            //verificar si existe en la tabla
            let existe = this.tabla.find(simbolo => simbolo.nombre === nombrevar);

            if (existe) {
                this.errores.push(`error semantico: la variable '${nombrevar}' ya ha sido declarada.`);
            } else {
                // direcciones de memoria 
                    let direccionasig = this.contadorme; 
                    let bytes = this.tamaños[tipo] || 1; 

                    this.tabla.push({
                        nombre: nombrevar,
                        tipo: tipo,
                        valor: valor,
                        direccion: direccionasig 
                    });

                    this.contadorme += bytes;
            }
        }

        // ---verificacion de que las variables ya estan declaradas antes de usarse en las expresiones ---
        if (tiponodo == "<expresion>") {
            if (nodo.hijos && nodo.hijos[0] && nodo.hijos[0].hijos) {
                let candidato = nodo.hijos[0].hijos[0];
                if (candidato.tipo == "IDENT") {
                    let nombrevar = candidato.valor;
                    let encontrado = this.tabla.find(simbolo => simbolo.nombre === nombrevar);
                    if (!encontrado) {
                        this.errores.push(`error semantico: la variable '${nombrevar}' no ha sido declarada.`);
                    }
                }
            }
        }

        // --- validacion de asignaciones.verificar si una variable a la que se le esta asignando un valor ya fue declarada
        // que el tipo de valor que se le asigna sea correcto  ---
        if (tiponodo == "<asignacion>") {
            let nombrevar = nodo.hijos[0].valor;
            let simboloexistente = this.tabla.find(simbolo => simbolo.nombre === nombrevar);

            if (!simboloexistente) {
                this.errores.push(`error semantico: la variable '${nombrevar}' no ha sido declarada.`);
            } else {
                let tipooriginal = simboloexistente.tipo;
                let expresion = nodo.hijos[2];
                let tokennuevo = expresion.hijos[0].hijos[0];

                if (tokennuevo) {
                    let expresionpasig = expresion.hijos[1];

                    if ((tipooriginal == "int" || tipooriginal == "float") && tokennuevo.tipo == "CADENA") {
                        this.errores.push(`error de tipo: '${nombrevar}' (${tipooriginal}) no acepta cadenas.`);
                    } else if (tipooriginal == "String" && tokennuevo.tipo == "NUMERO") {
                        this.errores.push(`error de tipo: '${nombrevar}' (String) no acepta numeros.`);
                    } else {
                        if (expresionpasig && expresionpasig.hijos && expresionpasig.hijos.length > 0) {
                            simboloexistente.valor = 0;
                        } else {
                            simboloexistente.valor = tokennuevo.valor;
                        }
                    }
                }
            }
        }

        // recorrido recursivo 
        if (nodo.hijos && nodo.hijos.length > 0) {
            nodo.hijos.forEach(element => {
                this.recorrer(element);
            });
        }
    }
}