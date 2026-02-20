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
        console.log(tiponodo);
        if (tiponodo == "<declaracion>"){
            let nombre = nodo.hijos[2].valor;
            let tipo = nodo.hijos[1].valor;
            let valor ;
            if (nodo.hijos[3].hijos && nodo.hijos[3].hijos.length > 0){
                
            }
            if (this.tabla[nombre]){
                this.errores.push(`Error semántico: variable ${nombre} ya declarada`);
            }
            else{
            this.tabla[nombre] = { tipo: tipo, valor: null };
            }
        }
        if(nodo.hijos && nodo.hijos.length > 0){
            nodo.hijos.forEach(element => {
                this.recorrer(element);
            });
        }
        
        
        
        

    }

            
    
}
