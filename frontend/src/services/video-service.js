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

  upload(videoId, videoMetadata, file) {
  const formData = new FormData();
  formData.append("reelFile", file);
  formData.append("title", videoMetadata.title);
  formData.append("creator", videoMetadata.creator);
  formData.append("description", videoMetadata.description);
  
  return Service.post(`${resource}/${videoId}/upload`, formData, { headers: authHeader() });
}

}
