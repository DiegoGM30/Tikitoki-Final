<template>
  <div class="video-detail-container">
    <div v-if="isLoading" class="loading-message">
      <p>Cargando video...</p>
      <div class="spinner"></div>
    </div>
    <div v-else-if="errorMessage" class="error-message">
      <p>Error al cargar el video: {{ errorMessage }}</p>
      <router-link to="/" class="button-style">Volver a Inicio</router-link>
    </div>
    <div v-else-if="video" class="video-content">
      <header class="video-header">
        <h2>{{ video.title }}</h2>
        <p class="creator-info">Subido por: {{ video.creator?.username || 'Desconocido' }}</p>
      </header>
      
      <div ref="videoContainerRef" class="video-player-wrapper shaka-player-container">
        <video
          ref="videoPlayerRef"
          id="tikitoki-video-player"
          class="shaka-video-element" 
          preload="auto"
          :poster="getThumbnailUrl(video.thumbnailPath)"
          style="width: 100%; height: 100%;" 
        >
          </video>
      </div>

      <section class="video-description">
        <h3>Descripción:</h3>
        <p>{{ video.description }}</p>
      </section>
      
    </div>
    <div v-else class="info-message">
      <p>Video no encontrado.</p>
      <router-link to="/" class="button-style">Volver a Inicio</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import videoService from '../services/videoService';
import { API_BASE } from '../config';
import shaka from 'shaka-player/dist/shaka-player.ui'; 
// Importar los CSS de la UI de Shaka Player
import 'shaka-player/dist/controls.css';


const route = useRoute();
const video = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');
const videoPlayerRef = ref(null); 
const videoContainerRef = ref(null); // Referencia al contenedor de la UI
let shakaPlayer = null; 
let shakaUi = null; // Instancia de la UI de Shaka

const placeholderThumbnail = 'https://placehold.co/640x360/e1e1e1/777777?text=Video';

const fetchVideoDetails = async (videoId) => {
  isLoading.value = true;
  errorMessage.value = '';
  
  if (shakaUi) {
    try {
      await shakaUi.destroy();
    } catch(e) { console.warn("Error destroying Shaka UI", e); }
    shakaUi = null;
  }
  if (shakaPlayer) { 
    try {
      await shakaPlayer.destroy();
    } catch(e) {
      console.warn("Error destroying previous Shaka player instance during fetch:", e);
    }
    shakaPlayer = null;
  }
  video.value = null; // Reset video data before fetching

  try {
    const response = await videoService.getById(videoId);
    video.value = response.data; 
    
    if (!(video.value && video.value.manifestPath)) {
      if(video.value) { 
        console.warn('Video data loaded, but no manifestPath found for Shaka playback.');
        errorMessage.value = 'No se encontró la ruta del manifiesto para este video.';
      } else { 
         errorMessage.value = 'Video no encontrado (sin datos).';
      }
    }
    // La inicialización del player ahora se maneja completamente en el watcher
  } catch (error) {
    video.value = null; 
    console.error(`Error fetching video details for ID ${videoId}:`, error);
    if (error.response && error.response.status === 404) {
      errorMessage.value = 'Video no encontrado (404).';
    } else if (error.response && error.response.data && error.response.data.error) {
      errorMessage.value = error.response.data.error;
    } else {
      errorMessage.value = 'No se pudo cargar la información del video.';
    }
  } finally {
    isLoading.value = false;
  }
};

const getThumbnailUrl = (thumbnailPath) => {
  if (!thumbnailPath || thumbnailPath.includes('default.png') || !thumbnailPath.startsWith('/users')) {
    return placeholderThumbnail;
  }
  return `${API_BASE}${thumbnailPath}`;
};

const initializeShakaPlayer = async () => {
  if (!videoPlayerRef.value || !videoContainerRef.value || !video.value || !video.value.manifestPath) {
    console.error("InitializeShakaPlayer called with incomplete data or unavailable player/container element.");
    errorMessage.value = "No se pudo inicializar el reproductor: datos o elementos no listos.";
    return;
  }

  const manifestURL = `${API_BASE}${video.value.manifestPath}`;
  console.log("Attempting to initialize Shaka Player with manifest URL:", manifestURL);

  shaka.polyfill.installAll();
  if (!shaka.Player.isBrowserSupported()) {
    errorMessage.value = 'Este navegador no es compatible con Shaka Player.';
    console.error('Browser not supported by Shaka Player.');
    return;
  }

  if (shakaPlayer) { // Destruye la instancia de player si existe
    try { await shakaPlayer.destroy(); } catch(e) { console.warn("Error destroying Shaka player for reinit:", e); }
  }
  if (shakaUi) { // Destruye la instancia de UI si existe
    try { await shakaUi.destroy(); } catch(e) { console.warn("Error destroying Shaka UI for reinit:", e); }
  }
  
  shakaPlayer = new shaka.Player(); // No se pasa el elemento video aquí si se usa la UI
  await shakaPlayer.attach(videoPlayerRef.value); // Adjuntar el player al elemento video

  // Configuración de la UI de Shaka Player
  const uiConfig = {
    // Aquí puedes añadir configuraciones específicas para la UI, por ejemplo:
    // 'controlPanelElements': ['play_pause', 'time_and_duration', 'spacer', 'volume', 'fullscreen', 'overflow_menu'],
    // 'overflowMenuButtons': ['captions', 'quality', 'language', 'picture_in_picture', 'cast']
    // Por defecto, 'quality' (selector de calidad) debería estar en el overflowMenuButtons
  };
  
  // Crea e inicializa la UI de Shaka Player
  shakaUi = new shaka.ui.Overlay(
    shakaPlayer,
    videoContainerRef.value, // El contenedor general del video
    videoPlayerRef.value     // El elemento <video>
  );
  shakaUi.configure(uiConfig); // Aplica la configuración de la UI

  shakaPlayer.addEventListener('error', (event) => {
    console.error('Shaka Player Error code:', event.detail.code, 'object:', event.detail);
    errorMessage.value = `Error del reproductor Shaka: ${event.detail.code} - ${event.detail.message || 'Error desconocido'}`;
  });
  
  shakaPlayer.addEventListener('loaded', () => {
      console.log('Shaka Player: Media loaded successfully.');
  });

  try {
    await shakaPlayer.load(manifestURL);
    console.log('Shaka Player: Video manifest loaded successfully!');
  } catch (error) {
    console.error('Shaka Player: Error loading manifest:', error);
    if (error.code) {
       errorMessage.value = `Shaka Error ${error.code}: ${error.message || 'No se pudo cargar el video.'}`;
    } else {
       errorMessage.value = `Shaka Error: ${error.message || 'No se pudo cargar el video.'}`;
    }
  }
};

watch([() => video.value?.manifestPath, videoPlayerRef, videoContainerRef], ([newManifestPath, playerElement, containerElement]) => {
  if (newManifestPath && playerElement && containerElement) {
    console.log("Watcher: manifestPath, videoPlayerRef, and videoContainerRef are ready. Initializing Shaka Player and UI.");
    initializeShakaPlayer();
  } else if (newManifestPath && (!playerElement || !containerElement)) {
    console.warn("Watcher: manifestPath is ready, but videoPlayerRef or videoContainerRef is not yet. Waiting for refs to be set.");
  } else if (!newManifestPath && shakaPlayer) {
    console.log("Watcher: manifestPath cleared. Destroying Shaka player and UI.");
    if (shakaUi) {
      shakaUi.destroy().catch(e => console.warn("Error destroying UI on manifest clear:", e));
      shakaUi = null;
    }
    if (shakaPlayer) {
      shakaPlayer.destroy().catch(e => console.warn("Error destroying player on manifest clear:", e));
      shakaPlayer = null;
    }
  }
}, { 
  deep: false, 
});


onMounted(() => {
  const videoId = route.params.id;
  if (videoId) {
    fetchVideoDetails(videoId); 
  } else {
    errorMessage.value = "No se especificó un ID de video.";
    isLoading.value = false;
  }
});

onBeforeUnmount(async () => {
  if (shakaUi) {
    console.log("Destroying Shaka UI instance on component unmount.");
    try { await shakaUi.destroy(); } catch (e) { console.error("Error destroying Shaka UI on unmount:", e); }
    shakaUi = null;
  }
  if (shakaPlayer) {
    console.log("Destroying Shaka Player instance on component unmount.");
    try { await shakaPlayer.destroy(); } catch (e) { console.error("Error destroying Shaka player on unmount:", e); }
    shakaPlayer = null;
  }
});

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    console.log(`Route ID changed from ${oldId} to ${newId}. Fetching new video details.`);
    fetchVideoDetails(newId);
  }
});

</script>

<style scoped>
/* Importa los estilos de los controles de Shaka Player */
/* Esto es crucial para que la UI se vea correctamente */
/* @import 'shaka-player/dist/controls.css'; Ya se importa en el script setup */

.video-detail-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.video-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.video-header h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.3rem;
}

.creator-info {
  font-size: 1rem;
  color: #555;
}

.video-player-wrapper {
  background-color: #000;
  margin-bottom: 25px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  position: relative; /* Necesario para la UI de Shaka */
  /* Puedes ajustar el aspect ratio si lo deseas */
  /* padding-top: 56.25%; */ /* 16:9 Aspect Ratio */
}

/* La clase 'shaka-video-element' es un ejemplo, no es necesaria por defecto */
/* Shaka UI se adjunta al contenedor y al elemento video */
.shaka-video-element, #tikitoki-video-player { 
  width: 100%; 
  height: 100%; /* Para que ocupe el wrapper si usas aspect ratio con padding-top */
  /* Si no usas padding-top para aspect ratio, puedes usar height: auto; */
  /* height: auto; */
  max-height: 70vh; 
  display: block;
  border-radius: 8px; /* Puede ser redundante si el wrapper ya lo tiene */
}

.video-description {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.video-description h3 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 10px;
}

.video-description p {
  font-size: 1rem;
  color: #444;
  line-height: 1.7;
  white-space: pre-wrap;
}

.button-style {
  margin-top: 1rem;
}

.loading-message,
.error-message,
.info-message {
  text-align: center;
  padding: 40px 20px;
  border-radius: 8px;
}
.loading-message p,
.error-message p,
.info-message p {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 20px;
}
.error-message {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}
.info-message {
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
