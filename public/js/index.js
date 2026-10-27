
"use strict";

const textoEntrada = document.getElementById("textoEntrada");
const palabraBuscar = document.getElementById("palabraBuscar");
const palabraReemplazo = document.getElementById("palabraReemplazo");
const resultado = document.getElementById("resultado");
const totalEncontrado = document.getElementById("totalEncontrado");
const btnBuscar = document.getElementById("btnBuscar");
const btnReemplazar = document.getElementById("btnReemplazar");
const btnLimpiar = document.getElementById("btnLimpiar");
const mensaje = document.getElementById("mensaje");


function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = "alert text-center " + tipo;
    mensaje.hidden = texto === "";
}
function escaparRegex(texto) {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function buscarPalabra() {
    const texto = textoEntrada.value;
    const palabra = palabraBuscar.value.trim();

    resultado.replaceChildren();
    totalEncontrado.textContent = "";

    if (texto.trim() === "" || palabra === "") {
        mostrarMensaje(
            "Escribe un texto y la palabra que deseas buscar.",
            "alert-warning"
        );
        return;
    }

    const expresion = new RegExp(escaparRegex(palabra), "gi");
    const coincidencias = texto.match(expresion);
    const total = coincidencias ? coincidencias.length : 0;

    const fragmento = document.createDocumentFragment();
    let posicion = 0;
    let coincidencia;

    while ((coincidencia = expresion.exec(texto)) !== null) {
        fragmento.appendChild(
            document.createTextNode(
                texto.slice(posicion, coincidencia.index)
            )
        );

        const resaltado = document.createElement("mark");
        resaltado.textContent = coincidencia[0];
        fragmento.appendChild(resaltado);

        posicion = coincidencia.index + coincidencia[0].length;
    }

    fragmento.appendChild(
        document.createTextNode(texto.slice(posicion))
    );

    resultado.appendChild(fragmento);

    totalEncontrado.textContent =
        `Número de veces que aparece: ${total}`;

    if (total > 0) {
        mostrarMensaje(
            "Búsqueda realizada correctamente.",
            "alert-success"
        );
    } else {
        mostrarMensaje(
            "No se encontró la palabra o carácter buscado.",
            "alert-danger"
        );
    }
}


function reemplazarPalabra() {
    const texto = textoEntrada.value;
    const palabra = palabraBuscar.value.trim();
    const nuevaPalabra = palabraReemplazo.value;

    resultado.replaceChildren();
    totalEncontrado.textContent = "";

    if (texto.trim() === "" || palabra === "") {
        mostrarMensaje(
            "Escribe un texto y la palabra que deseas reemplazar.",
            "alert-warning"
        );
        return;
    }

    const expresion = new RegExp(escaparRegex(palabra), "gi");
    const coincidencias = texto.match(expresion);
    const total = coincidencias ? coincidencias.length : 0;

    if (total === 0) {
        resultado.textContent = texto;

        mostrarMensaje(
            "No se encontró la palabra que deseas reemplazar.",
            "alert-danger"
        );
        return;
    }

    textoEntrada.value = texto.replace(expresion, function () {
        return nuevaPalabra;
    });

    resultado.textContent = textoEntrada.value;

    totalEncontrado.textContent =
        `Número de reemplazos realizados: ${total}`;

    mostrarMensaje(
        "Reemplazo realizado correctamente.",
        "alert-success"
    );
}


function limpiar() {
    textoEntrada.value = "";
    palabraBuscar.value = "";
    palabraReemplazo.value = "";
    resultado.replaceChildren();
    totalEncontrado.textContent = "";
    mostrarMensaje("", "");
    textoEntrada.focus();
}


btnBuscar.addEventListener("click", buscarPalabra);
btnReemplazar.addEventListener("click", reemplazarPalabra);
btnLimpiar.addEventListener("click", limpiar);


textoEntrada.addEventListener("keydown", function (evento) {
    if (evento.ctrlKey && evento.key === "Enter") {
        buscarPalabra();
    }
});
palabraBuscar.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        buscarPalabra();
    }
});
palabraReemplazo.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        reemplazarPalabra();
    }
});
