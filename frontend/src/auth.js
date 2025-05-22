// src/auth.js
import { reactive, readonly } from 'vue';
import axios from 'axios';
import router from './router'; // Importa el router para la navegación

// Estado reactivo para la autenticación
const state = reactive({
  isAuthenticated: false,
  user: null, // Almacenará información del usuario como { id, username }
  token: localStorage.getItem('token') || null, // Intenta cargar el token desde localStorage
});

// Función para actualizar las cabeceras de Axios con el token
function updateAxiosHeaders() {
  if (state.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

// Llama a la función una vez al inicio para configurar las cabeceras si ya existe un token
updateAxiosHeaders();

// Acciones para modificar el estado de autenticación
async function login(token, userData) {
  localStorage.setItem('token', token); // Guarda el token en localStorage
  state.token = token;
  state.isAuthenticated = true;
  state.user = userData; // Guarda los datos del usuario (ej. { id, username })
  updateAxiosHeaders(); // Actualiza las cabeceras de Axios

  // Redirige al usuario. Intenta ir a la página a la que quería acceder antes del login,
  // o a la página de inicio por defecto.
  const redirectPath = router.currentRoute.value.query.redirectFrom || '/';
  router.push(redirectPath); 
}

function logout() {
  localStorage.removeItem('token'); // Elimina el token de localStorage
  state.token = null;
  state.isAuthenticated = false;
  state.user = null;
  updateAxiosHeaders(); // Limpia las cabeceras de Axios
  router.push('/login'); // Redirige a la página de login
}

// Función para verificar el estado de autenticación al cargar la aplicación
function checkAuth() {
  if (state.token) {
    try {
      // Intenta decodificar el token para obtener información básica y verificar la expiración
      // NOTA: La decodificación del token en el cliente es para conveniencia (ej. mostrar nombre de usuario).
      // La validación REAL del token siempre debe hacerse en el backend.
      const payloadBase64 = state.token.split('.')[1];
      if (!payloadBase64) {
        // Si el token no tiene el formato esperado (ej. no tiene payload)
        console.warn('Invalid token format (missing payload), logging out.');
        logout(); // Considera el token inválido y cierra sesión
        return;
      }
      const payload = JSON.parse(atob(payloadBase64)); // Decodifica el payload del token

      // Comprueba si el token ha expirado
      if (payload.exp * 1000 > Date.now()) { // payload.exp está en segundos, Date.now() en milisegundos
        state.isAuthenticated = true;
        // Asume que el payload contiene id y username.
        // Idealmente, después de verificar la expiración, harías una llamada a un endpoint
        // del backend (ej. /api/me) para obtener los datos frescos del usuario y confirmar la validez del token.
        state.user = { id: payload.id, username: payload.username || 'Usuario' };
      } else {
        console.warn('Token expired, logging out.');
        logout(); // El token ha expirado
      }
    } catch (e) {
      // Si hay cualquier error al decodificar el token (ej. token malformado)
      console.error('Invalid token or error decoding token:', e);
      logout(); // Considera el token inválido y cierra sesión
    }
  } else {
    // No hay token en localStorage
    state.isAuthenticated = false;
    state.user = null;
  }
}

// Inicializa el estado de autenticación al cargar este módulo
checkAuth();

// Exporta el estado (como readonly para evitar mutaciones directas desde fuera) y las acciones
export default {
  state: readonly(state), 
  login,
  logout,
  checkAuth, // Exporta checkAuth por si necesitas llamarlo manualmente en algún caso extremo
};
