// API Configuration Constants
export const BASE_URL = 'http://localhost:8000/api/';
export const LOGIN_URL = 'user/login/';

// Full login URL (BASE_URL + LOGIN_URL)
export const LOGIN_API_URL = BASE_URL + LOGIN_URL;

// Relative API endpoints (used with axios instance that has baseURL)
export const API_ENDPOINTS = {
  LOGOUT: 'user/logout/',
  REFRESH_TOKEN: 'user/refresh/',
  FILE_UPLOAD: 'filesearch/upload/',
  FILE_QUERY: 'filesearch/query/',
  FILE_STORES_LIST: 'filesearch/stores/list/',
  PERSONALIZATION_PREFERENCES: 'personalization/preferences/',
  EVALUATION_RAGAS: 'evaluation/ragas/',
  EVALUATION_METRICS: 'evaluation/metrics/',
  ADMIN_STORES: 'admin/stores/',
  ADMIN_METRICS: 'admin/metrics/',
  ADMIN_USERS: 'admin/users/',
};

