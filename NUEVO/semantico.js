export default class AnalizadorSemantico {
    constructor (arbol){
        this.arbol = arbol;
        this.tabla = {};
        this.errores = [];
    }


    validacion(){
        this.tabla = {};
        this.recorrer(this.arbol);
        console.log(this.tabla);
    }

    recorrer(nodo){
        if (!nodo){return }
        let tiponodo=nodo.tipo;
        //console.log(tiponodo);
        //verificar si la variable adeclarar ya esta declarada  
        if (tiponodo == "<declaracion>") {
            let nombrevariable = nodo.hijos[2].valor;
            let tipo = nodo.hijos[1].valor;
            let valor = 0; // Inicializar como null por defecto
            
            // Verificamos si hay una asignación (= ...)
            if (nodo.hijos[3] && nodo.hijos[3].hijos && nodo.hijos[3].hijos.length > 1) {
                // Ruta segura al valor:
                // hijos[3] es <opc_asig> -> el hijo [1] es <expresion>
                let expresion = nodo.hijos[3].hijos[1];
                
                // <expresion> hijo [0] es <termino>
                let termino = expresion.hijos[0];
                
                // <termino> hijo [0] es <factor>
                let factor = termino.hijos[0];
                
                // <factor> hijo [0] es el TOKEN final (el número 10)
                //let tokenFinal = factor.valor;
                
                if (factor) {
                    if(tipo == "int" || tipo == "float"){
                        if (factor.tipo=="CADENA"){
                            this.errores.push(`Error: Valor incorrecto para para el tipo de variable (IDENT : '${nombrevariable}´', Valor : '${factor.valor}). `)
                        }
                    }else{
                        if (factor.tipo=="NUMERO"){
                            this.errores.push(`Error: Valor incorrecto para para el tipo de variable (IDENT : '${nombrevariable}', Valor : '${factor.valor}'). `)
                        }

                    }
                    
                    valor = factor.valor;

                }
            }

            if (this.tabla[nombrevariable]) {
                this.errores.push(`Error semántico: variable ${nombrevariable} ya declarada`);
            } else {
                // Guardamos el valor capturado (si no hubo asignación, será null)
                this.tabla[nombrevariable] = { tipo: tipo, valor: valor };
            }
        }

        if (tiponodo == "<expresion>") {
            if (nodo.hijos && nodo.hijos[0] && nodo.hijos[0].hijos) {
                let candidato = nodo.hijos[0].hijos[0]; // Captura IDENT o NUMERO
                if (candidato.tipo == "IDENT") {
                    let nombrevariable = candidato.valor;
                    
                    // DEPURACIÓN: Ver qué hay en la tabla en este instante
                   // console.log(`Buscando '${nombrevariable}' en tabla:`, Object.keys(this.tabla));

                    if (!this.tabla[nombrevariable]) {
                        this.errores.push(`Error semántico: la variable '${nombrevariable}' no ha sido declarada.`);
                    } else {
                        console.log("Variable encontrada con éxito.");
                    }
                }
            }
        }

        if (tiponodo == "<asignacion>") {
            let nombrevariable = nodo.hijos[0].valor;
            
            // 1. ¿La variable existe en la tabla?
            if (!this.tabla[nombrevariable]) {
                this.errores.push(`Error semántico: la variable '${nombrevariable}' no ha sido declarada.`);
            } else {
                let tipoOriginal = this.tabla[nombrevariable].tipo;
                
                // 2. Navegamos al valor (hijo 2 es <expresion>)
                let expresion = nodo.hijos[2];
                let tokenNuevo = expresion.hijos[0].hijos[0]; // termino -> valor/ident

                if (tokenNuevo) {
                    // 3. Chequeo de tipos
                    if ((tipoOriginal == "int" || tipoOriginal == "float") && tokenNuevo.tipo == "CADENA") {
                        this.errores.push(`Error de tipo: La variable '${nombrevariable}' es ${tipoOriginal} y no acepta cadenas.`);
                    } else if (tipoOriginal == "String" && tokenNuevo.tipo == "NUMERO") {
                        this.errores.push(`Error de tipo: La variable '${nombrevariable}' es String y no acepta números.`);
                    } else {
                        // 4. Actualización exitosa
                        this.tabla[nombrevariable].valor = tokenNuevo.valor;
                    }
                }
            }
        }



        if(nodo.hijos && nodo.hijos.length > 0){
            nodo.hijos.forEach(element => {
                this.recorrer(element);
            });
        }


    }


}