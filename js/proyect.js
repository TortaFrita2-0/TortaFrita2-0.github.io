// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAoCjv7bFfCznmoD5VmWdPq2WFH7VaTraY",
    authDomain: "tobo-b8f82.firebaseapp.com",
    databaseURL: "https://tobo-b8f82-default-rtdb.firebaseio.com",
    projectId: "tobo-b8f82",
    storageBucket: "tobo-b8f82.appspot.com",
    messagingSenderId: "442613776186",
    appId: "1:442613776186:web:8a9aadf6464f2540d2da03",
    measurementId: "G-47D8CR6F0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Obtener el ID del proyecto desde la URL
const params = new URLSearchParams(window.location.search);
const projectId = params.get('id');

// Generar y obtener usuario anónimo
function generarUsuario() {
    const usuario = 'anon_' + Math.floor(Math.random() * (2000000 - 1000000) + 1000000);
    localStorage.setItem('usuario', usuario);
    return usuario;
}

function obtenerUsuario() {
    return localStorage.getItem('usuario') || generarUsuario();
}

// Función para agregar un comentario
function agregarComentario() {
    const usuario = obtenerUsuario();
    const texto = document.getElementById('comentario-texto').value;
    const estrellasSeleccionadas = document.querySelectorAll('.estrella.seleccionada').length;

    if (texto.trim() === "" || estrellasSeleccionadas === 0) {
        alert("Por favor completa el comentario y selecciona estrellas.");
        return;
    }

    const comentariosRef = ref(db, `proyectos/${projectId}/comentarios`);

    // Verificar si el usuario ya comentó
    onValue(comentariosRef, (snapshot) => {
        let yaComentado = false;
        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.val().usuario === usuario) {
                yaComentado = true;
            }
        });

        if (yaComentado) {
            document.getElementById('mensaje-unico').style.display = 'block';
        } else {
            push(comentariosRef, {
                usuario,
                texto,
                estrellas: estrellasSeleccionadas,
                timestamp: Date.now()
            }).then(() => {
                document.getElementById('comentario-texto').value = ''; // Limpiar texto
                document.querySelectorAll('.estrella').forEach(star => star.classList.remove('seleccionada')); // Reiniciar estrellas
            }).catch(console.error);
        }
    }, { onlyOnce: true });
}

// Mostrar los comentarios
function mostrarComentarios() {
    const comentariosDiv = document.getElementById('comentarios-lista');
    comentariosDiv.innerHTML = "";

    const comentariosRef = ref(db, `proyectos/${projectId}/comentarios`);
    onValue(comentariosRef, (snapshot) => {
        comentariosDiv.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const comentario = childSnapshot.val();
            comentario.id = childSnapshot.key;

            const usuarioActual = obtenerUsuario();
            const esPropio = comentario.usuario === usuarioActual;

            comentariosDiv.innerHTML += `
                <div class="comentario">
                    <strong>${comentario.usuario}</strong> (${comentario.estrellas} estrellas)
                    <p>${comentario.texto}</p>
                    ${esPropio ? `
                        <button onclick="mostrarFormularioEdicion('${comentario.id}', '${comentario.texto}', ${comentario.estrellas})">Editar</button>
                    ` : ''}
                </div>
            `;
        });
    });
}

// Mostrar formulario para editar comentario
window.mostrarFormularioEdicion = function (id, textoOriginal, estrellasOriginales) {
    const overlay = document.getElementById('overlay');
    const formulario = document.getElementById('formulario-editar');

    document.getElementById('editar-texto').value = textoOriginal;
    document.querySelectorAll('.estrella-editar').forEach((estrella, i) => {
        estrella.classList.toggle('seleccionada', i < estrellasOriginales);
    });

    formulario.dataset.idComentario = id;
    overlay.style.display = 'block';
}

// Función para guardar los cambios de edición
function guardarEdicion() {
    const idComentario = document.getElementById('formulario-editar').dataset.idComentario;
    const nuevoTexto = document.getElementById('editar-texto').value;
    const nuevasEstrellas = document.querySelectorAll('.estrella-editar.seleccionada').length;

    if (nuevoTexto.trim() === "" || nuevasEstrellas === 0) {
        alert("Por favor completa todos los campos.");
        return;
    }

    const comentarioRef = ref(db, `proyectos/${projectId}/comentarios/${idComentario}`);
    update(comentarioRef, {
        texto: nuevoTexto,
        estrellas: nuevasEstrellas
    }).then(() => {
        cerrarFormularioEdicion();
        mostrarComentarios();
    }).catch(console.error);
}

// Función para eliminar el comentario
window.eliminarComentario = function () {
    const idComentario = document.getElementById('formulario-editar').dataset.idComentario;
    const comentarioRef = ref(db, `proyectos/${projectId}/comentarios/${idComentario}`);

    // Confirmar que el usuario quiere eliminar el comentario
    const confirmacion = confirm("¿Estás seguro de que quieres eliminar este comentario?");
    if (confirmacion) {
        // Eliminar el comentario de Firebase
        remove(comentarioRef).then(() => {
            cerrarFormularioEdicion();
            mostrarComentarios(); // Volver a cargar los comentarios sin el eliminado
        }).catch(console.error);
    }
}

// Función para cerrar el formulario de edición
function cerrarFormularioEdicion() {
    document.getElementById('overlay').style.display = 'none';
}

// Inicializar estrellas interactivas
function hacerEstrellasInteractivas() {
    const estrellas = document.querySelectorAll('.estrella');
    estrellas.forEach((estrella, index) => {
        estrella.addEventListener('click', () => actualizarEstrellas(estrellas, index + 1));
    });

    const estrellasEditar = document.querySelectorAll('.estrella-editar');
    estrellasEditar.forEach((estrella, index) => {
        estrella.addEventListener('click', () => actualizarEstrellas(estrellasEditar, index + 1));
    });
}

// Actualizar estrellas visualmente
function actualizarEstrellas(estrellas, cantidad) {
    estrellas.forEach((estrella, i) => {
        estrella.classList.toggle('seleccionada', i < cantidad);
    });
}

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    mostrarComentarios();
    hacerEstrellasInteractivas();

    document.getElementById('enviar-comentario').addEventListener('click', agregarComentario);
    document.getElementById('guardar-edicion').addEventListener('click', guardarEdicion);
    document.getElementById('cerrar-edicion').addEventListener('click', cerrarFormularioEdicion);
    document.getElementById('eliminar-comentario').addEventListener('click', eliminarComentario);
});