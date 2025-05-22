<template>
  <div class="video-form-container">
    <h2>Subir Nuevo Video</h2>
    <form @submit.prevent="handleUpload" enctype="multipart/form-data" class="upload-form">
      <div class="form-group">
        <label for="title">Título del Video:</label>
        <input type="text" id="title" v-model="title" required />
      </div>
      <div class="form-group">
        <label for="description">Descripción:</label>
        <textarea id="description" v-model="description" rows="4" required></textarea>
      </div>
      <div class="form-group">
        <label for="reelFile">Archivo de Video:</label>
        <input type="file" id="reelFile" @change="handleFileChange" accept="video/*" required />
        <div v-if="filePreview" class="file-preview">
          <p>Archivo seleccionado: {{ filePreview.name }} ({{ (filePreview.size / 1024 / 1024).toFixed(2) }} MB)</p>
        </div>
      </div>

      <div v-if="uploadProgress > 0 && uploadProgress < 100" class="progress-bar-container">
        <div class="progress-bar" :style="{ width: uploadProgress + '%' }">
          {{ uploadProgress }}%
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <button type="submit" class="submit-button" :disabled="isLoading">
        <span v-if="isLoading">Subiendo...</span>
        <span v-else>Subir Video</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import videoService from '../services/videoService';

const title = ref('');
const description = ref('');
const reelFile = ref(null);
const filePreview = ref(null); // Para mostrar nombre y tamaño del archivo

const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const uploadProgress = ref(0);

const router = useRouter();

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    reelFile.value = file;
    filePreview.value = { name: file.name, size: file.size };
  } else {
    reelFile.value = null;
    filePreview.value = null;
  }
};

const handleUpload = async () => {
  if (!title.value || !description.value || !reelFile.value) {
    errorMessage.value = 'Todos los campos son obligatorios, incluyendo el archivo de video.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  uploadProgress.value = 0;

  const formData = new FormData();
  formData.append('title', title.value);
  formData.append('description', description.value);
  formData.append('reelFile', reelFile.value);

  try {
    const response = await videoService.upload(formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      }
    });
    successMessage.value = response.data.message || '¡Video subido con éxito!';
    // Redirigir al detalle del video subido o a la home
    if (response.data.video && response.data.video.id) {
      setTimeout(() => {
        router.push({ name: 'VideoDetail', params: { id: response.data.video.id } });
      }, 1500);
    } else {
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  } catch (error) {
    uploadProgress.value = 0; // Reset progress on error
    if (error.response && error.response.data) {
      if (error.response.data.error) {
         errorMessage.value = error.response.data.error;
      } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
         errorMessage.value = error.response.data.errors.map(e => e.msg || e.message).join(', ');
      } else {
         errorMessage.value = 'Error al subir el video.';
      }
    } else {
      errorMessage.value = 'Error de conexión o error inesperado al subir el video.';
    }
    console.error('Upload failed:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.video-form-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
}

.upload-form .form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

input[type="file"] {
  border: 1px solid #ced4da;
  padding: 8px; /* Ajustar padding para input file */
}
input[type="file"]::-webkit-file-upload-button { /* Estilos para el botón del input file en Chrome/Safari */
  padding: 8px 12px;
  margin-right: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
input[type="file"]::-webkit-file-upload-button:hover {
  background-color: #0056b3;
}
/* Para Firefox, el botón es más difícil de estilizar directamente sin ::file-selector-button */
input[type="file"]::file-selector-button { /* Estándar moderno */
  padding: 8px 12px;
  margin-right: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
input[type="file"]::file-selector-button:hover {
   background-color: #0056b3;
}


.file-preview {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #666;
  background-color: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  border: 1px dashed #ced4da;
}

.progress-bar-container {
  width: 100%;
  background-color: #e9ecef;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  overflow: hidden; /* Para que la barra de progreso no se salga */
}

.progress-bar {
  height: 20px;
  background-color: #28a745; /* Verde para progreso */
  color: white;
  text-align: center;
  line-height: 20px; /* Centra el texto verticalmente */
  font-size: 0.8rem;
  border-radius: 0.25rem;
  transition: width 0.4s ease;
}

.submit-button { /* Hereda de style.css pero puedes sobreescribir */
  width: 100%;
  background-color: #28a745; /* Verde para subir */
  border-color: #28a745;
}
.submit-button:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

/* Estilos para .error-message, .success-message ya están en style.css */
</style>
