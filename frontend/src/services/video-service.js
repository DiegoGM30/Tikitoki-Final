import Service from './service.js';
import authHeader from './auth-header.js';
const resource = 'videos';

export default {
  getAll() {
    return Service.get(resource);
  },

  create(data) {
    return Service.post(resource, data, { headers: authHeader() });
  },

  upload(videoId, filename, video) {
    const formData = new FormData();
    formData.append("reelFile", filename);
    formData.append("creator", video.creator);
    formData.append("author", video.author);
    formData.append("description", video.description);
    return Service.post(`${resource}/${videoId}/upload`, formData, { headers: authHeader() });
  }
}
