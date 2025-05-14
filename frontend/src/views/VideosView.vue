<template>
  <h1>Videos View</h1>
  <VideoItem v-for="(video, index) in videos" :key="index" :video="video" />
</template>

<script>
import videoService from '../services/video-service'
import VideoItem from '../components/VideoItem.vue'

export default {
    name: "VideosView",
    components: {
      VideoItem
    },
    created() {
      videoService.getAll()
        .then(videos => this.videos = videos.data);
    },
    data() {
      return {
          videos: []
      }
    }
}
</script>

<style>
</style>