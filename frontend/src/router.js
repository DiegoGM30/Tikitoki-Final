// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import VideoDetail from './views/VideoDetail.vue';
import Login from './views/Login.vue';
import Register from './views/Register.vue';
import VideoForm from './components/VideoForm.vue'; // Componente para el formulario de subida
import auth from './auth'; // Import the auth store

const routes = [
  { path: '/', name: 'Home', component: Home },
  { 
    path: '/video/:id', 
    name: 'VideoDetail', 
    component: VideoDetail,
    props: true // Permite pasar parámetros de ruta como props al componente
  },
  { path: '/login', name: 'Login', component: Login, meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: Register, meta: { guestOnly: true } },
  { 
    path: '/upload', 
    name: 'UploadVideo', 
    component: VideoForm, // Este debería ser el componente para el formulario de subida
    meta: { requiresAuth: true } // Añade meta field para rutas protegidas
  }
  // Puedes añadir una ruta catch-all para 404 si lo deseas:
  // { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('./views/NotFound.vue') }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // import.meta.env.BASE_URL para Vite
  routes,
  linkActiveClass: 'router-link-active', 
  linkExactActiveClass: 'router-link-exact-active', 
});

// Guardia de Navegación
router.beforeEach((to, from, next) => {
  const isAuthenticated = auth.state.isAuthenticated;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Esta ruta requiere autenticación, comprueba si está logueado
    // Si no, redirige a la página de login.
    if (!isAuthenticated) {
      next({
        name: 'Login',
        query: { redirectFrom: to.fullPath } // Guarda el destino deseado
      });
    } else {
      next(); // Procede a la ruta
    }
  } else if (to.matched.some(record => record.meta.guestOnly)) {
    // Esta ruta es solo para invitados (como login/register)
    // Si está autenticado, redirige a inicio.
    if (isAuthenticated) {
      next({ name: 'Home' });
    } else {
      next(); // Procede a la ruta
    }
  }
  else {
    next(); // ¡Asegúrate de llamar siempre a next()!
  }
});

export default router;
