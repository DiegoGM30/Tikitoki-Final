<template>
  <div>
    <VideoItem
      v-for="video in videos"
      :key="video.id"
      :video="video"
    />
  </div>
</template>

<script>
import videoService from '../services/videoService'
import VideoItem    from './VideoItem.vue'

export default {
  name: 'VideoList',
  components: { VideoItem },
  data() {
    return { videos: [] }
  },
  async mounted() {
    const res = await videoService.getAll()
    this.videos = res.data
  }
}
</script>
