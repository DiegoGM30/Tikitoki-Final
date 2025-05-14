<template>
  <h1>Login</h1>
     <hr/>
  <div class>
    <form name="form" @submit.prevent="handleLogin">
      <div>
        <label for="username">Username</label>
        <input
          v-model="user.username"            
          type="text"
          name="username"
        />
      </div>
      <div>
        <label for="password">Password</label>
        <input
          v-model="user.password"            
          type="password" 
          name="password"
        />
      </div>
      <div>
        <button :disabled="loading">
          <span>Login</span>            
        </button>
        <router-link to="/register">Register</router-link>
      </div>
      <div>
        <div v-if="message" role="alert">{{ message }}</div>
      </div>
    </form>
  </div>
</template>

<script>
import User from '../models/user-model.js';

export default {
  name: 'LoginView',
  data() {
    return {
      user: new User('', ''),
      loading: false,
      message: '',
      errors: {}
    };
  },
  methods: {    
    async handleLogin() {
      this.loading = true;

      if (this.user.username && this.user.password) {
        try {
          // Login
          await this.$store.dispatch('auth/login', this.user);
          await this.$router.push('/me');
        }
        catch ( error) {
          this.loading = false;
            this.message =
              (error.response && error.response.data) ||
              error.message ||
              error.toString();
        }
      }
    }
  }
};
</script>

<style>
</style>