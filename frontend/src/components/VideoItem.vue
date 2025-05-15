<template>
  <div class="video">
    <div class="box">
      <div v-if="!showPlayer" class="thumbnail" @click="playVideo">
        <img :src="`${baseURL}/${video.file}`" alt="Video Thumbnail" />
        <button class="play-button">▶️</button>
      </div>
      <div v-else ref="playerContainer"></div>

      <p>
        <strong>{{ video.title }}</strong>
        <br>
        <em v-if="video.creator">{{ video.creator }}</em>
        <br>
        {{ video.description }}
      </p>
    </div>
  </div>
</template>

<script>
import dashjs from 'dashjs';
import baseURL from '../config.js';

export default {
  name: 'VideoItem',
  props: {
    video: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      baseURL: baseURL,
      player: null,
      observer: null,
      showPlayer: false
    };
  },
  methods: {
    playVideo() {
      this.showPlayer = true;
      this.$nextTick(() => {
        this.initializePlayer();
        this.setupObserver();
      });
    },
initializePlayer() {
  const videoElement = document.createElement('video');
  videoElement.controls = true;
  videoElement.muted = true;
  videoElement.loop = true;
  this.$refs.playerContainer.appendChild(videoElement);

  this.player = dashjs.MediaPlayer().create();
  const videoUrl = `${this.baseURL}/${this.video.video}`; 
  console.log("Video URL usada:", videoUrl); 
  this.player.initialize(videoElement, videoUrl, false);
}


    setupObserver() {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
      };
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.player.play();
          } else {
            this.player.pause();
          }
        });
      }, options);
      this.observer.observe(this.$refs.playerContainer);
    }
  },
  beforeUnmount() {
    if (this.observer) this.observer.disconnect();
    if (this.player) this.player.reset();
  }
};
</script>

<style scoped>
.box {
  max-width: 60%;
  padding-bottom: 15px;
  border-radius: 5px;
  border: 1px solid darkgrey;
  margin: 5px auto;
  text-align: center;
}
.thumbnail {
  position: relative;
  cursor: pointer;
}
.thumbnail img {
  width: 100%;
  border-radius: 5px;
}
.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.6);
  border: none;
  color: white;
  font-size: 2rem;
  border-radius: 50%;
  padding: 0.5rem;
}
</style>
