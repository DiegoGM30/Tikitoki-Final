import axios from 'axios';

const BACKEND_IP = process.env.BACKEND_IP || 'localhost';
const BACKEND_PORT = process.env.BACKEND_PORT || '63000';
const baseURL = `http://${BACKEND_IP}:${BACKEND_PORT}`;

export default axios.create({
    baseURL,
});