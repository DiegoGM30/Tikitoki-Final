// src/services/videoService.js
import axios from 'axios';
import { API_BASE } from '../config.js';

const VIDEOS_API_URL = `${API_BASE}/videos`;

export default {
  getAll() {
    return axios.get(VIDEOS_API_URL);
  },
  getById(id) {
    return axios.get(`${VIDEOS_API_URL}/${id}`);
  },
  getLatest() {
    return axios.get(`${VIDEOS_API_URL}/latest`);
  },
  upload(formData) { // El token ya se añade globalmente a través de auth.js -> updateAxiosHeaders
    return axios.post(VIDEOS_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // No es necesario añadir 'Authorization' aquí si auth.js lo maneja globalmente
      }
    });
  }
  // Aquí podrías añadir más funciones como deleteVideo, updateVideo, etc.
};
