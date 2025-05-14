<template>
  <div class="hello">
    <VideoItem :video="videoData" />
  </div>
</template>

<script>
import VideoItem from './BookItem.vue'

export default {
  name: 'HelloWorld',
  components: {
    VideoItem // Register a component
  },
  props: {
    msg: String
  },
  data() {
    return {
      videoData: {
        title: "Video title",
        author: "Video author",
        cover: "/covers/default.png"
      }
    }
  }
}
</script>