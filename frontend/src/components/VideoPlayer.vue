<template>
  <div>
    <video
      ref="shakaVideo"
      controls
      width="720"
      height="400"
      style="width: 100%; max-width: 720px;"
      poster="http://192.168.56.101:3000{{ video.thumbnailPath }}"
    ></video>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import shaka from 'shaka-player'

const props = defineProps({
  video: { type: Object, required: true }
})

const shakaVideo = ref(null)
let player = null

function loadShaka(manifestUrl) {
  if (!player) player = new shaka.Player(shakaVideo.value)
  player.load(manifestUrl)
    .then(() => console.log('Shaka: Video loaded!'))
    .catch(err => console.error('Shaka error:', err))
}

onMounted(() => {
  shaka.polyfill.installAll()
  loadShaka(`http://192.168.56.101:3000${props.video.manifestPath}`)
})

onBeforeUnmount(() => {
  if (player) {
    player.destroy()
    player = null
  }
})

// Reactivo si cambia el vídeo:
watch(() => props.video.manifestPath, (newManifest) => {
  if (player && newManifest) {
    loadShaka(`http://192.168.56.101:3000${newManifest}`)
  }
})
</script>

<style scoped>
video {
  width: 100%;
  height: auto;
  background: #000;
}
</style>
