// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080, // Puedes cambiar el puerto de desarrollo si es necesario
    // proxy: { // Descomenta y configura si necesitas un proxy para tu API en desarrollo
    //   '/api': {
    //     target: 'http://localhost:3000', // Tu URL del backend
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, '') 
    //   }
    // }
  }
})
