// src/config/apiConfig.js
const defaultBaseUrl =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? window.location.origin
    : 'http://localhost:3333';

export const BASE_URL = process.env.REACT_APP_API_URL || defaultBaseUrl;

export default {
  BASE_URL,
  LOGIN_URL: `${BASE_URL}/sgf-api/security/auth/login`,
};
