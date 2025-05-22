<template>
  <div class="login-container">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="username">Usuario:</label>
        <input type="text" id="username" v-model="username" required autocomplete="username" />
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" id="password" v-model="password" required autocomplete="current-password" />
      </div>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <button type="submit" class="submit-button" :disabled="isLoading">
        <span v-if="isLoading">Ingresando...</span>
        <span v-else>Login</span>
      </button>
    </form>
    <p class="register-link">
      ¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import authService from '../services/authService';
import authStore from '../auth'; // Import the auth store

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const router = useRouter();
const route = useRoute();

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await authService.login({
      username: username.value,
      password: password.value,
    });
    // Asumiendo que el backend devuelve { id, username, token }
    const { token, id, username: loggedInUsername } = response.data;
    await authStore.login(token, { id, username: loggedInUsername }); // Actualiza el estado global de autenticación

    // Redirige a la página deseada o a inicio
    const redirectPath = route.query.redirectFrom || '/';
    router.push(redirectPath);

  } catch (error) {
    isLoading.value = false;
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage.value = error.response.data.error;
    } else if (error.response && error.response.status === 401) { // Manejo específico para 401 desde login
      errorMessage.value = 'Usuario o contraseña incorrectos.';
    }
     else {
      errorMessage.value = 'Error al iniciar sesión. Inténtalo de nuevo.';
    }
    console.error('Login failed:', error);
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
}

.login-form .form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

/* Los estilos de input y button se heredan de style.css o App.vue si son globales */
/* Puedes añadir estilos específicos aquí si es necesario */
.form-group input { /* Asegurando que los inputs tengan estilos base si no son globales */
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
}

.form-group input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: none;
}


.error-message { /* Estilos definidos en style.css pueden aplicar, o puedes especificarlos aquí */
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 0.9rem;
}

.submit-button { /* Hereda de style.css pero puedes sobreescribir */
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
}
.submit-button:hover{
  background-color: #0056b3;
}
.submit-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}


.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
}
.register-link a {
  color: #007bff;
  text-decoration: none;
}
.register-link a:hover {
  text-decoration: underline;
}
</style>
