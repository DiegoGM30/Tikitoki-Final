import { createWebHistory, createRouter } from "vue-router"
import Video from '../views/VideosView.vue'

const routes = [
  {
    path: '/',
    name: 'Video',
    component: Video
  },
  {
    path: '/upload',
    name: 'Upload',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/UploadView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/me',
    name: 'Me',
    component: () => import('../views/MeView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',    
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',    
    component: () => import('../views/RegisterView.vue')
  },
]

const router = new createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/', '/login', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = sessionStorage.getItem('user');  // Get the User object (if existing)

  if (authRequired && !loggedIn) {
    return next('/login');
  }

  next();
})  

export default router