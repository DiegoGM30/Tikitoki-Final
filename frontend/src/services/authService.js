// src/services/authService.js
import axios from 'axios';
import { API_BASE } from '../config.js';
// No se debe importar 'router' aquí directamente.
// La lógica de navegación que depende del estado de autenticación
// se maneja en src/auth.js (el store de autenticación).

export default {
  login(credentials) {
    // Llama al endpoint de login del backend.
    // El backend debería devolver { token, id, username } en caso de éxito.
    return axios.post(`${API_BASE}/login`, credentials);
  },
  register(userData) {
    // Llama al endpoint de registro del backend.
    // El backend debería devolver un mensaje de éxito o error.
    return axios.post(`${API_BASE}/signup`, userData);
  },
  // Esta función es para cualquier lógica de logout que necesite el backend,
  // como invalidar un token del lado del servidor.
  // El logout del lado del cliente (limpiar localStorage, estado de Vue, redirigir)
  // lo maneja auth.js.
  logoutBackend() { 
    // Ejemplo: si tuvieras un endpoint en el backend para invalidar el token
    // return axios.post(`${API_BASE}/logout`); 
    console.log("authService.logoutBackend() called. This would be for backend token invalidation if implemented.");
    return Promise.resolve(); // Por ahora, no hace nada en el backend
  }
};
