
"use strict";

// Obtener los elementos del HTML
const expresion = document.getElementById("expresion");
const btnGenerar = document.getElementById("btnGenerar");
const btnLimpiar = document.getElementById("btnLimpiar");
const tablaTriplos = document.getElementById("tablaTriplos");
const tablaCuadruplos = document.getElementById("tablaCuadruplos");
const mensaje = document.getElementById("mensaje");
const resultadoFinal = document.getElementById("resultadoFinal");
function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = "text-center " + tipo;
}
function limpiarTablas() {
    tablaTriplos.innerHTML = "";
    tablaCuadruplos.innerHTML = "";
}
function esNumero(token) {
    return /^(?:\d+(?:\.\d+)?|\.\d+)$/.test(token);
}

function esVariable(token) {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token);
}
function obtenerTokens(exp) {
    const patron =
        /(?:\d+(?:\.\d+)?|\.\d+)|(?:[a-zA-Z_][a-zA-Z0-9_]*)|[+\-*/()]/g;

    const tokens = exp.match(patron) || [];
    const original = exp.replace(/\s/g, "");
    const reconstruida = tokens.join("");

    if (original !== reconstruida) {
        throw new Error("La expresión contiene caracteres no válidos.");
    }

    return tokens;
}
function obtenerPrioridad(op) {
    if (op === "u+" || op === "u-") return 3;
    if (op === "*" || op === "/") return 2;
    if (op === "+" || op === "-") return 1;
    return 0;
}
function convertirPostfija(tokens) {
    const salida = [];
    const pila = [];
    let esperarOperando = true;

    for (const token of tokens) {
        if (esNumero(token) || esVariable(token)) {
            if (!esperarOperando) {
                throw new Error("Falta un operador entre los operandos.");
            }

            salida.push(token);
            esperarOperando = false;

        } else if (token === "(") {
            if (!esperarOperando) {
                throw new Error("Falta un operador antes del paréntesis.");
            }

            pila.push(token);
            esperarOperando = true;

        } else if (token === ")") {
            if (esperarOperando) {
                throw new Error("Revisa el contenido de los paréntesis.");
            }

            while (pila.length && pila[pila.length - 1] !== "(") {
                salida.push(pila.pop());
            }

            if (!pila.length) {
                throw new Error("Hay un paréntesis de cierre sin pareja.");
            }

            pila.pop();
            esperarOperando = false;

        } else {
            let operador = token;
            if (esperarOperando) {
                if (token === "+") {
                    operador = "u+";
                } else if (token === "-") {
                    operador = "u-";
                } else {
                    throw new Error("La expresión tiene operadores incorrectos.");
                }
            } else {
                esperarOperando = true;
            }

            const prioridad = obtenerPrioridad(operador);
            const esUnario = operador === "u+" || operador === "u-";

            while (pila.length && pila[pila.length - 1] !== "(") {
                const cima = pila[pila.length - 1];
                const prioridadCima = obtenerPrioridad(cima);

                if (
                    prioridadCima > prioridad ||
                    (prioridadCima === prioridad && !esUnario)
                ) {
                    salida.push(pila.pop());
                } else {
                    break;
                }
            }

            pila.push(operador);
        }
    }

    if (esperarOperando) {
        throw new Error("La expresión está incompleta.");
    }

    while (pila.length) {
        const operador = pila.pop();

        if (operador === "(") {
            throw new Error("Hay un paréntesis de apertura sin pareja.");
        }

        salida.push(operador);
    }

    return salida;
}

function generarCodigo(exp) {
    exp = exp.trim();

    if (!exp) {
        throw new Error("Ingresa una expresión matemática.");
    }

    let destino = null;
    let parteExpresion = exp;
    const cantidadIguales = (exp.match(/=/g) || []).length;

    if (cantidadIguales > 1) {
        throw new Error("Solo se permite una asignación.");
    }

    if (cantidadIguales === 1) {
        const partes = exp.split("=");

        destino = partes[0].trim();
        parteExpresion = partes[1].trim();

        if (!esVariable(destino)) {
            throw new Error("El destino de la asignación no es válido.");
        }

        if (!parteExpresion) {
            throw new Error("Falta la expresión que se va a asignar.");
        }
    }

    const tokens = obtenerTokens(parteExpresion);
    const postfija = convertirPostfija(tokens);

    const pila = [];
    const triplos = [];
    const cuadruplos = [];
    let contadorTemporal = 1;
    for (const token of postfija) {
        if (esNumero(token) || esVariable(token)) {
            pila.push({
                triplo: token,
                cuadruplo: token,
                valor: esNumero(token) ? Number(token) : null
            });

        } else {
            const esUnario = token === "u+" || token === "u-";

            if (pila.length < (esUnario ? 1 : 2)) {
                throw new Error("Faltan operandos para una operación.");
            }

            let argumento1;
            let argumento2 = null;
            let operador = token;

            if (esUnario) {
                argumento1 = pila.pop();
            } else {
                argumento2 = pila.pop();
                argumento1 = pila.pop();
            }

            const numeroTriplo = triplos.length;
            const temporal = "T" + contadorTemporal++;

            triplos.push({
                numero: numeroTriplo,
                operador: operador,
                argumento1: argumento1.triplo,
                argumento2: esUnario ? "—" : argumento2.triplo
            });

            cuadruplos.push({
                numero: cuadruplos.length,
                operador: operador,
                argumento1: argumento1.cuadruplo,
                argumento2: esUnario ? "—" : argumento2.cuadruplo,
                resultado: temporal
            });
            let valor = null;

            if (
                argumento1.valor !== null &&
                (esUnario || argumento2.valor !== null)
            ) {
                if (operador === "+") {
                    valor = argumento1.valor + argumento2.valor;
                } else if (operador === "-") {
                    valor = argumento1.valor - argumento2.valor;
                } else if (operador === "*") {
                    valor = argumento1.valor * argumento2.valor;
                } else if (operador === "/") {
                    if (argumento2.valor === 0) {
                        throw new Error("No se puede dividir entre cero.");
                    }
                    valor = argumento1.valor / argumento2.valor;
                } else if (operador === "u-") {
                    valor = -argumento1.valor;
                } else if (operador === "u+") {
                    valor = argumento1.valor;
                }
            }

            pila.push({
                triplo: "(" + numeroTriplo + ")",
                cuadruplo: temporal,
                valor: valor
            });
        }
    }

    if (pila.length !== 1) {
        throw new Error("No se pudo completar el análisis de la expresión.");
    }

    const resultado = pila.pop();

    if (destino !== null) {
        triplos.push({
            numero: triplos.length,
            operador: "=",
            argumento1: resultado.triplo,
            argumento2: destino
        });

        cuadruplos.push({
            numero: cuadruplos.length,
            operador: "=",
            argumento1: resultado.cuadruplo,
            argumento2: "—",
            resultado: destino
        });
    }

    return {
        triplos: triplos,
        cuadruplos: cuadruplos,
        valor: resultado.valor,
        destino: destino
    };
}
function mostrarResultados(resultados) {
    limpiarTablas();

    resultados.triplos.forEach(function (fila) {
        const tr = document.createElement("tr");

        [
            fila.numero,
            fila.operador,
            fila.argumento1,
            fila.argumento2
        ].forEach(function (dato) {
            const td = document.createElement("td");
            td.textContent = dato;
            tr.appendChild(td);
        });

        tablaTriplos.appendChild(tr);
    });

    resultados.cuadruplos.forEach(function (fila) {
        const tr = document.createElement("tr");

        [
            fila.numero,
            fila.operador,
            fila.argumento1,
            fila.argumento2,
            fila.resultado
        ].forEach(function (dato) {
            const td = document.createElement("td");
            td.textContent = dato;
            tr.appendChild(td);
        });

        tablaCuadruplos.appendChild(tr);
    });
    if (resultados.valor !== null) {
        const valor = Number(resultados.valor.toPrecision(12));

        resultadoFinal.textContent =
            (resultados.destino ? resultados.destino + " = " : "") + valor;
    } else {
        resultadoFinal.textContent =
            "No calculable: la expresión contiene variables sin valores definidos.";
    }
}


btnGenerar.addEventListener("click", function () {
    try {
        const resultados = generarCodigo(expresion.value);

        mostrarResultados(resultados);

        mostrarMensaje(
            "¡Triplos y cuádruplos generados correctamente!",
            "text-success"
        );

    } catch (error) {
        limpiarTablas();

        tablaTriplos.innerHTML =
            '<tr><td colspan="4">No se generaron resultados.</td></tr>';

        tablaCuadruplos.innerHTML =
            '<tr><td colspan="5">No se generaron resultados.</td></tr>';

        resultadoFinal.textContent = "Sin resultado";
        mostrarMensaje(error.message, "text-danger");
    }
});

btnLimpiar.addEventListener("click", function () {
    expresion.value = "";
    limpiarTablas();

    tablaTriplos.innerHTML =
        '<tr><td colspan="4">Ingresa una expresión para generar los triplos.</td></tr>';

    tablaCuadruplos.innerHTML =
        '<tr><td colspan="5">Ingresa una expresión para generar los cuádruplos.</td></tr>';

    resultadoFinal.textContent = "Aquí aparecerá el resultado";
    mostrarMensaje("", "");
    expresion.focus();
});
