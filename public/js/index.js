"use strict";

const tipoConversion = document.getElementById("tipoConversion");
const textoEntrada = document.getElementById("textoEntrada");
const resultado = document.getElementById("resultado");
const btnConvertir = document.getElementById("btnConvertir");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnCopiar = document.getElementById("btnCopiar");
const mensaje = document.getElementById("mensaje");

// Equivalencias del alfabeto Morse.
const codigoMorse = {
    A: ".-", B: "-...", C: "-.-.", D: "-..",
    E: ".", F: "..-.", G: "--.", H: "....",
    I: "..", J: ".---", K: "-.-", L: ".-..",
    M: "--", N: "-.", O: "---", P: ".--.",
    Q: "--.-", R: ".-.", S: "...", T: "-",
    U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..",

    0: "-----", 1: ".----", 2: "..---",
    3: "...--", 4: "....-", 5: ".....",
    6: "-....", 7: "--...", 8: "---..",
    9: "----.",

    ".": ".-.-.-",
    ",": "--..--",
    "?": "..--..",
    "!": "-.-.--",
    "'": ".----.",
    "/": "-..-.",
    "(": "-.--.",
    ")": "-.--.-",
    ":": "---...",
    ";": "-.-.-.",
    "=": "-...-",
    "+": ".-.-.",
    "-": "-....-",
    "_": "..--.-",
    "\"": ".-..-.",
    "@": ".--.-.",
    "&": ".-..."
};

// Muestra mensajes de éxito o error.
function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = "text-center mb-3 " + tipo;
}

// Convierte texto normal a código Morse.
function convertirTextoAMorse(texto) {
    const caracteres = Array.from(texto.toUpperCase());
    const codigos = [];

    caracteres.forEach(function (caracter) {
        if (caracter === " ") {
            codigos.push("/");
        } else if (Object.hasOwn(codigoMorse, caracter)) {
            codigos.push(codigoMorse[caracter]);
        } else {
            throw new Error(
                "El carácter \"" + caracter + "\" no está permitido."
            );
        }
    });

    return codigos.join(" ");
}

// Convierte código Morse a texto normal.
function convertirMorseATexto(texto) {
    const palabras = texto.trim().split(/\s*\/\s*/);
    const resultadoTexto = [];

    palabras.forEach(function (palabra) {
        if (palabra.trim() === "") {
            throw new Error("Hay una palabra vacía en el código Morse.");
        }

        const codigos = palabra.trim().split(/\s+/);
        const letras = [];

        codigos.forEach(function (codigo) {
            const caracter = Object.keys(codigoMorse).find(
                function (letra) {
                    return codigoMorse[letra] === codigo;
                }
            );

            if (caracter === undefined) {
                throw new Error(
                    "El código Morse \"" + codigo + "\" no es válido."
                );
            }

            letras.push(caracter);
        });

        resultadoTexto.push(letras.join(""));
    });

    return resultadoTexto.join(" ");
}

// Ejecuta la conversión seleccionada.
function convertir() {
    const entrada = textoEntrada.value.trim();

    resultado.value = "";

    if (entrada === "") {
        mostrarMensaje(
            "Debes escribir un texto o código Morse.",
            "text-danger"
        );
        textoEntrada.focus();
        return;
    }

    try {
        let conversion;

        if (tipoConversion.value === "textoMorse") {
            conversion = convertirTextoAMorse(entrada);
        } else {
            conversion = convertirMorseATexto(entrada);
        }

        resultado.value = conversion;

        mostrarMensaje(
            "Conversión realizada correctamente.",
            "text-success"
        );
    } catch (error) {
        mostrarMensaje(error.message, "text-danger");
    }
}

// Limpia los campos y los mensajes.
function limpiar() {
    textoEntrada.value = "";
    resultado.value = "";
    mostrarMensaje("", "");
    textoEntrada.focus();
}

// Copia el resultado.
async function copiarResultado() {
    if (resultado.value.trim() === "") {
        mostrarMensaje(
            "No hay ningún resultado para copiar.",
            "text-danger"
        );
        return;
    }

    try {
        await navigator.clipboard.writeText(resultado.value);
        mostrarMensaje(
            "Resultado copiado correctamente.",
            "text-success"
        );
    } catch (error) {
        resultado.focus();
        resultado.select();

        const copiado = document.execCommand("copy");

        mostrarMensaje(
            copiado
                ? "Resultado copiado correctamente."
                : "No se pudo copiar. Selecciona el resultado manualmente.",
            copiado ? "text-success" : "text-danger"
        );
    }
}

// Eventos de los botones.
btnConvertir.addEventListener("click", convertir);
btnLimpiar.addEventListener("click", limpiar);
btnCopiar.addEventListener("click", copiarResultado);

// Permite cambiar la indicación según la conversión.
tipoConversion.addEventListener("change", function () {
    resultado.value = "";
    mostrarMensaje("", "");

    if (tipoConversion.value === "textoMorse") {
        textoEntrada.placeholder =
            "Escribe el texto que deseas convertir...";
    } else {
        textoEntrada.placeholder =
            "Usa puntos, guiones, espacios y / para separar palabras...";
    }
});

// Permite convertir usando Ctrl + Enter.
textoEntrada.addEventListener("keydown", function (evento) {
    if (evento.ctrlKey && evento.key === "Enter") {
        convertir();
    }
});
