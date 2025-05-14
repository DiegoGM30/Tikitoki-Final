<template>
  <div class="upload-video">
    <h1>Upload</h1>
    <hr />
    <div class>
      <form name="form" @submit.prevent="handleUpload">
        <div>
          <label for="title">Title</label>
          <input v-model="video.title" type="text" name="title" />
        </div>
        <div>
          <label for="author">Author</label>
          <input v-model="video.author" type="text" name="author" />
        </div>
        <div>
          <label for="description">Description</label>
          <input v-model="video.description" type="text" name="description" />
        </div>
        <div>
          <label for="videoFile"> Video File</label>
          <input type="file" @change="onFileChange" />
        </div>
        <div>
          <button :disabled="!this.selectedFile || uploading">
            <span>Upload</span>
          </button>
        </div>
        <div>
          <div v-if="message" role="alert">{{ message }}</div>
        </div>
      </form>
    </div>
  </div>
</template>


<script>
import Video from '../models/video-model.js';
import videoService from '../services/video-service.js';

export default {
  name: "UploadView",
  components: {
  },
  data() {
    return {
      message: "",
      selectedFile: "",
      video: new Video('', ''),
      uploading: false,
    };
  },
  methods: {
    onFileChange(e) {
      this.selectedFile = e.target.files[0];
    },
    async handleUpload() {
      this.loading = true;

      // All fields are mandatory
      if (this.video.title && this.video.author && this.video.description && this.selectedFile) {
        try {
          // Create the video
          const response = await videoService.create(this.video);
          // Upload video
          await videoService.upload(response.data.id, this.selectedFile);
          await this.$router.push('/');
        }
        catch (error) {
          this.loading = false;
          this.message =
            (error.response && error.response.data) ||
            error.message ||
            error.toString();
        }
      }
    },
  }
};
</script>

<style></style>