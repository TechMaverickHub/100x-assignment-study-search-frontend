import axios from 'axios';
import { BASE_URL, LOGIN_API_URL, SIGNUP_API_URL, API_ENDPOINTS } from '../constants';

// Create axios instance with base URL
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh (optional - can be implemented later)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Token refresh endpoint would go here if implemented
          // const response = await axios.post(API_ENDPOINTS.REFRESH_TOKEN, { refresh: refreshToken });
          // localStorage.setItem('accessToken', response.data.access);
          // originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          // return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  // Login with email and password (uses BASE_URL + LOGIN_URL)
  login: async (email, password) => {
    const response = await axios.post(LOGIN_API_URL, {
      email,
      password,
    });
    return response.data;
  },

  // Sign up with email, password, and other details (uses BASE_URL + SIGNUP_URL)
  signup: async (email, password, firstName, lastName) => {
    const response = await axios.post(SIGNUP_API_URL, {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    });
    return response.data;
  },

  // Logout (if backend has logout endpoint)
  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Even if logout fails, clear local storage
      console.error('Logout error:', error);
    }
  },

  // Refresh token (if needed) - uses full URL since it doesn't need access token
  refreshToken: async (refreshToken) => {
    const response = await axios.post(BASE_URL + API_ENDPOINTS.REFRESH_TOKEN, {
      refresh: refreshToken,
    });
    return response.data;
  },
};

// File Search APIs
export const fileSearchAPI = {
  // Upload PDF with title
  uploadPDF: async (file, title = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name || 'Untitled Document');
    const response = await api.post(API_ENDPOINTS.FILE_UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Query document by document_id
  query: async (query, documentId) => {
    const response = await api.post(API_ENDPOINTS.FILE_QUERY, {
      query,
      document_id: documentId,
    });
    return response.data;
  },

  // List all stores (legacy - non-paginated)
  listStores: async () => {
    const response = await api.get(API_ENDPOINTS.FILE_STORES_LIST);
    return response.data;
  },

  // List stores with pagination and filters
  listStoresFiltered: async (page = 1, pageSize = 10, title = '') => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (title) {
      params.append('title', title);
    }
    const response = await api.get(`${API_ENDPOINTS.FILE_STORES_LIST_FILTER}?${params.toString()}`);
    return response.data;
  },
};

// Admin APIs (assuming these exist or will be created)
export const adminAPI = {
  // Get all stores (admin view)
  getAllStores: async () => {
    const response = await api.get(API_ENDPOINTS.ADMIN_STORES);
    return response.data;
  },

  // Get system metrics
  getMetrics: async () => {
    const response = await api.get(API_ENDPOINTS.ADMIN_METRICS);
    return response.data;
  },

  // Get all users (if user management exists)
  getUsers: async () => {
    const response = await api.get(API_ENDPOINTS.ADMIN_USERS);
    return response.data;
  },
};

// Personalization APIs
export const personalizationAPI = {
  // Save user preferences
  savePreferences: async (name, tone) => {
    const response = await api.post(API_ENDPOINTS.PERSONALIZATION_PREFERENCES, {
      name,
      tone,
    });
    return response.data;
  },

  // Get user preferences
  getPreferences: async () => {
    const response = await api.get(API_ENDPOINTS.PERSONALIZATION_PREFERENCES);
    return response.data;
  },
};

// Evaluation/RAGAS APIs
export const evaluationAPI = {
  // Run RAGAS evaluation
  runEvaluation: async (qaPairs) => {
    const response = await api.post(API_ENDPOINTS.EVALUATION_RAGAS, {
      qa_pairs: qaPairs,
    });
    return response.data;
  },

  // Get evaluation metrics
  getMetrics: async () => {
    const response = await api.get(API_ENDPOINTS.EVALUATION_METRICS);
    return response.data;
  },
};

export default api;

