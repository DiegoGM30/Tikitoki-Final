<template>
  <div class="register-container">
    <h2>Crear Cuenta</h2>
    <form @submit.prevent="handleRegister" class="register-form">
      <div class="form-group">
        <label for="username">Usuario:</label>
        <input type="text" id="username" v-model="username" required autocomplete="username" />
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" id="password" v-model="password" required autocomplete="new-password"/>
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirmar Contraseña:</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" required autocomplete="new-password"/>
      </div>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      <button type="submit" class="submit-button" :disabled="isLoading">
        <span v-if="isLoading">Registrando...</span>
        <span v-else>Registrarse</span>
      </button>
    </form>
     <p class="login-link">
      ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión aquí</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);

const router = useRouter();

const handleRegister = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.';
    return;
  }
  // Aquí puedes añadir más validaciones de contraseña si es necesario
  // (ej. longitud mínima, caracteres especiales), aunque el backend también debería validar.
  if (password.value.length < 8) { 
    errorMessage.value = 'La contraseña debe tener al menos 8 caracteres.';
    return;
  }

  isLoading.value = true;
  try {
    const response = await authService.register({
      username: username.value,
      password: password.value,
    });
    successMessage.value = response.data.message || '¡Registro exitoso! Serás redirigido al login.';
    
    setTimeout(() => {
      router.push('/login');
    }, 2500); // Espera 2.5 segundos antes de redirigir
  } catch (error) {
    isLoading.value = false;
    if (error.response && error.response.data) {
      if (error.response.data.error) { 
         errorMessage.value = error.response.data.error;
         if (error.response.data.details && Array.isArray(error.response.data.details)) {
           errorMessage.value += ': ' + error.response.data.details.join(' ');
         }
      } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) { 
         errorMessage.value = error.response.data.errors.map(e => e.msg || e.message).join(', ');
      } else if (error.response.status === 409) { // Conflicto, ej. nombre de usuario ya existe
         errorMessage.value = 'El nombre de usuario ya está en uso.';
      }
      else {
         errorMessage.value = 'Error en el registro. Inténtalo de nuevo más tarde.';
      }
    } else {
      errorMessage.value = 'Error en el registro. Por favor, revisa tu conexión e inténtalo de nuevo.';
    }
    console.error('Registration failed:', error);
  }
};
</script>

<style scoped>
.register-container {
  max-width: 450px;
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

.register-form .form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.form-group input { /* Asegurando que los inputs tengan estilos base si no son globales */
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
}

.form-group input:focus {
  border-color: #28a745; /* Green focus for register */
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
  outline: none;
}

.error-message, .success-message { /* Estilos definidos en style.css pueden aplicar, o puedes especificarlos aquí */
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 0.9rem;
}

.error-message {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.success-message {
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}


.submit-button { /* Hereda de style.css pero puedes sobreescribir */
  width: 100%;
  padding: 12px;
  background-color: #28a745; /* Green for register */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
}
.submit-button:hover {
  background-color: #218838; /* Darker green on hover */
  border-color: #1e7e34;
}
.submit-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
}
.login-link a {
  color: #007bff;
  text-decoration: none;
}
.login-link a:hover {
  text-decoration: underline;
}
</style>
