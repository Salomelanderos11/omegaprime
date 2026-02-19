export default class AnalizadorSemantico {
    constructor (arbol){
        this.arbol = arbol;
        this.tabla = {};
        this.errores = [];
    }
    recorrer(nodo){
        if (!nodo){return }
        this.tiponodo=nodo.tipo;

        if(nodo.hijos.length > 0){
            nodo.hijos.forEach(nodohijo => {
                recorrer(nodohijo);
            });
        }

        if (nodo.tipo == '<declaracion>'){
            let nombre, valor, tipo;
            
            nodo.hijos.forEach(hijo => {
                if (hijo.tipo == '<identificador>'){
                    nombre= hijo.valor   
                }
                

            });
        
            this.tabla[nombre] = { tipo: "NUMERO", valor: "25" };

        }
        
        

    }
    validadortipo(){
        if (hijo.LF == 21 || hijo.LF == 22 || hijo.LF == 36){

        }
            
    }
}
