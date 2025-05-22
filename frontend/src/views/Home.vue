<template>
  <div class="home-container">
    <header class="home-header">
      <h1>Bienvenido a TikiToki</h1>
      <p>Explora los videos más recientes.</p>
    </header>

    <div v-if="isLoading" class="loading-message">
      <p>Cargando videos...</p>
      <div class="spinner"></div>
    </div>
    <div v-else-if="errorMessage" class="error-message">
      <p>Error al cargar los videos: {{ errorMessage }}</p>
      <button @click="fetchVideos" class="retry-button">Reintentar</button>
    </div>
    <div v-else-if="videos.length === 0" class="no-videos-message">
      <p>No hay videos disponibles en este momento. ¡Sube el primero!</p>
      <router-link v-if="auth.state.isAuthenticated" to="/upload" class="upload-link-button">
        Subir Video
      </router-link>
    </div>
    <div v-else class="video-grid">
      <div v-for="video in videos" :key="video.id" class="video-card">
        <router-link :to="{ name: 'VideoDetail', params: { id: video.id } }" class="video-link">
          <img 
            :src="getThumbnailUrl(video.thumbnailPath)" 
            :alt="`Miniatura de ${video.title}`" 
            class="video-thumbnail"
            @error="onImageError"
          />
          <div class="video-info">
            <h3 class="video-title">{{ video.title }}</h3>
            <p class="video-creator">Por: {{ video.creator?.username || 'Desconocido' }}</p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import videoService from '../services/videoService';
import auth from '../auth'; // Import auth store to check if user can upload
import { API_BASE } from '../config'; // To construct full image URLs

const videos = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');

const placeholderThumbnail = 'https://placehold.co/320x240/e1e1e1/777777?text=Video';

const fetchVideos = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await videoService.getAll();
    videos.value = response.data;
  } catch (error) {
    console.error('Error fetching videos:', error);
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage.value = error.response.data.error;
    } else {
      errorMessage.value = 'No se pudo conectar al servidor o ocurrió un error inesperado.';
    }
    videos.value = []; // Clear videos on error
  } finally {
    isLoading.value = false;
  }
};

const getThumbnailUrl = (thumbnailPath) => {
  if (!thumbnailPath || thumbnailPath.includes('default.png')) { // Assuming default.png means no specific thumbnail
    return placeholderThumbnail;
  }
  // Ensure the path starts with a slash for proper concatenation
  const cleanPath = thumbnailPath.startsWith('/') ? thumbnailPath : `/${thumbnailPath}`;
  return `${API_BASE}${cleanPath}`;
};

const onImageError = (event) => {
  event.target.src = placeholderThumbnail; // Fallback to placeholder if image fails to load
};

onMounted(() => {
  fetchVideos();
});
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.home-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.home-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.home-header p {
  font-size: 1.1rem;
  color: #666;
}

.loading-message,
.error-message,
.no-videos-message {
  text-align: center;
  padding: 40px 20px;
  border-radius: 8px;
}

.loading-message p,
.error-message p,
.no-videos-message p {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 20px;
}

.error-message {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.error-message p {
  color: #721c24;
}

.retry-button, .upload-link-button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.3s ease;
}

.retry-button:hover, .upload-link-button:hover {
  background-color: #0056b3;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.video-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.video-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.video-thumbnail {
  width: 100%;
  height: 180px;
  object-fit: cover; /* Ensures the image covers the area without distortion */
  display: block;
  background-color: #f0f0f0; /* Placeholder color */
}

.video-info {
  padding: 15px;
}

.video-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-creator {
  font-size: 0.9rem;
  color: #777;
  margin: 0;
}

.spinner {
  margin: 20px auto;
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #007bff;
  animation: spin 1s ease infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
