// Importaciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAoCjv7vBfCznmoD5VmWdPq2WFH7VaTraY",
    authDomain: "tobo-b8f82.firebaseapp.com",
    databaseURL: "https://tobo-b8f82-default-rtdb.firebaseio.com",
    projectId: "tobo-b8f82",
    storageBucket: "tobo-b8f82.appspot.com",
    messagingSenderId: "442613776186",
    appId: "1:442613776186:web:8a9aadf6464f2540d2da03",
    measurementId: "G-47D8YCR6F0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Supongamos que tienes un mecanismo para obtener el UID del usuario autenticado
const usuarioId = "UID_DEL_USUARIO_AUTENTICADO"; // Cambia esto para obtener el UID del usuario autenticado

// Función para guardar el usuario en Firebase
export function guardarUsuario() {
    // Aquí puedes realizar cualquier acción para guardar el usuario
    // En este caso, se guarda el ID del usuario en una base de datos
    
    // Suponiendo que 'usuarios' es la referencia donde guardarás los usuarios
    set(ref(db, 'usuarios/' + usuarioId), {
        usuario: usuarioId,
        timestamp: Date.now() // O cualquier otro dato que desees guardar
    }).then(() => {
        console.log("Usuario guardado exitosamente");
    }).catch((error) => {
        console.error("Error al guardar el usuario: ", error);
    });
}

// Asegúrate de que la función se pueda invocar desde el HTML
window.guardarUsuario = guardarUsuario; // Hacemos la función accesible globalmente