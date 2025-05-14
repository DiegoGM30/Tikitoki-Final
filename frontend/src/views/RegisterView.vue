<template>
  <h1>Register</h1>
     <hr/>
  <div class>
    <form name="form" @submit.prevent="handleRegister">
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
          <span>Register</span>            
        </button>
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
  name: 'RegisterView',
  data() {
    return {
      user: new User('', ''),
      loading: false,
      message: '',
      errors: {}
    };
  },
  methods: {    
    async handleRegister() {
      this.loading = true;

      if (this.user.username && this.user.password) {
        try {
          // Login
          await this.$store.dispatch('auth/register', this.user);
          await this.$router.push('/login');
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