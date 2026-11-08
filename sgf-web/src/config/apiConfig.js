// src/config/apiConfig.js
export const BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:3333';

export default {
  BASE_URL,
  LOGIN_URL: `${BASE_URL}/sgf-api/security/auth/login`,
};
