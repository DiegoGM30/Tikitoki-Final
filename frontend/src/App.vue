<template>
  <div id="app-layout">
    <nav class="navbar">
      <router-link to="/" class="nav-brand">TikiToki</router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Inicio</router-link>
        <template v-if="auth.state.isAuthenticated">
          <router-link to="/upload" class="nav-link">Subir Video</router-link>
          <button @click="handleLogout" class="nav-button logout-button">Logout ({{ auth.state.user?.username }})</button>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">Login</router-link>
          <router-link to="/register" class="nav-link">Registro</router-link>
        </template>
      </div>
    </nav>
    <main class="container">
      <router-view />
    </main>
    <footer class="app-footer">
      <p>&copy; {{ new Date().getFullYear() }} TikiToki App</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import auth from './auth'; // Import the auth store

const router = useRouter();

const handleLogout = () => {
  auth.logout();
  // No need to push to router here, auth.logout() already does it.
  // router.push('/login'); 
};
</script>

<style>
/* Basic App Layout Styles (can be moved to style.css or scoped) */
#app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Arial', sans-serif; /* Example font */
}

.navbar {
  background-color: #343a40; /* Dark background for navbar */
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff; /* White text for brand */
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
}

.nav-link {
  color: #adb5bd; /* Light grey for links */
  text-decoration: none;
  margin-left: 1.5rem;
  padding: 0.5rem 0;
  position: relative; /* For underline effect */
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-exact-active { /* Highlight active link */
  color: #fff; /* White on hover/active */
}

.nav-link::after { /* Underline effect for links */
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: #007bff; /* Blue underline */
  transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.router-link-exact-active::after {
  width: 100%;
}


.nav-button, .logout-button {
  background-color: #007bff; /* Blue button */
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  text-decoration: none;
  margin-left: 1.5rem;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.nav-button:hover, .logout-button:hover {
  background-color: #0056b3; /* Darker blue on hover */
}

.logout-button {
  background-color: #dc3545; /* Red for logout */
}
.logout-button:hover {
  background-color: #c82333; /* Darker red on hover */
}

.container {
  flex: 1; /* Takes up remaining vertical space */
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #ffffff; /* White background for content */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

.app-footer {
  text-align: center;
  padding: 1rem;
  background-color: #f8f9fa; /* Light grey footer */
  color: #6c757d; /* Grey text for footer */
  border-top: 1px solid #e7e7e7;
  font-size: 0.9rem;
}

/* Global styles from your style.css will also apply */
</style>
