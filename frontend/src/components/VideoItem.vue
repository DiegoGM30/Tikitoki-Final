<template>
  <div class="video-item">
    <router-link :to="`/video/${video.id}`">
      <h3>{{ video.title }}</h3>
      <p>{{ video.description }}</p>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'VideoItem',
  props: { video: Object }
}
</script>
