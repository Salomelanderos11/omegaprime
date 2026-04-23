/*Duplicar elementos de un arreglo

Escribir una función llamada duplicar que reciba un arreglo de números y retorne un nuevo arreglo donde cada número esté multiplicado por dos (2).
 escribe tu función acá*/

// código de prueba

function duplicar (array){
    newarray = [];
    array.forEach(element => {
        newarray.push(element*2);
    });
    return newarray;
}
/**
console.log(duplicar([1, 2, 3])) // [2, 4, 6]
console.log(duplicar([])) // []
 */

/*
Escribir una función llamada empiezanConA que reciba un arreglo de strings y retorne un nuevo arreglo con todas las palabras que empiecen por "a" (mayúscula o minúscula).
// escribe tu función acá
 */
function empiezanConA(array){
    newarray =[];
    array.forEach(element => {
        if (element[0] == "a" || element[0]== "A" ){
            newarray.push(element);
        }
    });

    return newarray
}

/*
// código de prueba
console.log(empiezanConA(["beta", "alfa", "Arbol", "gama"])) // ["alfa", "Arbol"]
console.log(empiezanConA(["beta", "delta", "gama"])) // []
console.log(empiezanConA([])) // []


Escribir una función llamada terminanConS que reciba un arreglo de strings y retorne un nuevo arreglo con todas las palabras que terminan con "s" (mayúscula o minúscula).
// escribe tu función acá
*/


function terminanConS(array){
    newarray =[];
    array.forEach(element => {
        if (element[element.length-1] == "s" || element[element.length-1]== "S" ){
            newarray.push(element);
        }
    });

    return newarray
}

/* código de prueba
console.log(terminanConS(["pruebas", "arroz", "árbol", "tokens"])) // ["pruebas", "tokens"]
console.log(terminanConS(["beta", "delta", "gama"])) // []
console.log(terminanConS([])) // []


scribir una función llamada distancia que reciba dos strings y retorne el número de caracteres diferentes (comparando posición por posición).
Nota: Puedes asumir que los strings siempre tienen la misma longitud. Sin embargo, si quieres agregarle más dificultad puedes pensar cómo solucionarlo si un string es más largo que el otro (la diferencia entre las longitudes agregaría al resultado).
// escribe tu función acá
*/

function distancia (st1, st2){
    diferencias=0;
    diferentes = st1.length != st2.length ? true : false;
    if (diferentes == true){
        corto= st1.length < st2.length ? st1: st2;
        largo= st1.length > st2.length ? st1: st2;
        console.log(corto,largo);
        for (i=0; i <= corto.length-1;i++){
            if(corto[i] != largo[i]){
                diferencias+=1;
            } 
        }
        dif= largo.length-corto.length
        diferencias += dif;
        
    }
    else{
        for (i=0; i <= corto.length;i++){
            if(st1[i] != st2[i]){
                diferencias+=1;
            } 
        }

    }
    
    
    return diferencias

}


// código de prueba
console.log(distancia("hola", "holast")) // 0
console.log(distancia("sol", "tol")) // 1
console.log(distancia("carro", "correr")) // 3