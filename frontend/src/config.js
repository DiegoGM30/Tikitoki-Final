const WEBSERVER_IP = process.env.WEBSERVER_IP || 'localhost';
const WEBSERVER_PORT = process.env.WEBSERVER_PORT || '18080';
const baseURL = `http://${WEBSERVER_IP}:${WEBSERVER_PORT}`;

export default baseURL;