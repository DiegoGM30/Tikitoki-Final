// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import { API_BASE } from './config.js'
import './style.css' // Import the global stylesheet
import auth from './auth'; // Import the auth store

// Base URL para todas las peticiones
axios.defaults.baseURL = API_BASE;

// Axios interceptor for handling 401 errors (optional but good practice)
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // If a 401 error occurs (e.g., token expired or invalid)
      // and the user is currently marked as authenticated, log them out.
      if (auth.state.isAuthenticated) {
        console.warn('Axios interceptor: Unauthorized (401). Logging out.');
        auth.logout(); // This will also redirect to /login
      }
    }
    return Promise.reject(error);
  }
);

// The auth store's checkAuth() is already called when it's imported,
// and it updates Axios headers internally.
// No need to call auth.checkAuth() here again.

const app = createApp(App);

// Provide auth state globally if needed by many components,
// or components can import it directly.
// app.provide('auth', auth); // Optional: provide for deep components

app.use(router);
app.mount('#app');
