import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/token/', credentials),
  register: (userData) => api.post('/users/register/', userData),
  getCurrentUser: () => api.get('/users/me/'),
};

// Documents API
export const documentsAPI = {
  getDocuments: () => api.get('/documents/'),
  uploadDocument: (formData) => api.post('/documents/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteDocument: (id) => api.delete(`/documents/${id}/`),
  updateDocument: (id, data) => api.put(`/documents/${id}/`, data),
};

// AI API
export const aiAPI = {
  askQuestion: (documentId, question) => api.post('/ai/ask/', { document_id: documentId, question }),
};

export default api; 