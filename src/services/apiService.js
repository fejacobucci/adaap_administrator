import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

// Request interceptor - add JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Response interceptor - handle 401/403
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Authentication
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/admin/login', { email, password });
      if (response.data.success && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || { msg: 'Erro ao conectar com o servidor' };
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/';
  },

  getUser: () => {
    try {
      const user = localStorage.getItem('adminUser');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }
};

// Dashboard / Analytics
export const dashboardService = {
  getMetrics: async () => {
    try {
      const response = await api.get('/admin/analytics/dashboard');
      return response.data;
    } catch (error) {
      console.error('Dashboard error:', error);
      throw error.response?.data || { msg: 'Erro ao carregar métricas' };
    }
  },

  getUserStats: async () => {
    try {
      const response = await api.get('/admin/analytics/users');
      return response.data;
    } catch (error) {
      console.error('User stats error:', error);
      throw error.response?.data || { msg: 'Erro ao carregar estatísticas de usuários' };
    }
  },

  getExerciseStats: async () => {
    try {
      const response = await api.get('/admin/analytics/exercises');
      return response.data;
    } catch (error) {
      console.error('Exercise stats error:', error);
      throw error.response?.data || { msg: 'Erro ao carregar estatísticas de exercícios' };
    }
  }
};

// User Management
export const userService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error.response?.data || { msg: 'Erro ao carregar usuários' };
    }
  },

  getById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error.response?.data || { msg: 'Erro ao carregar usuário' };
    }
  },

  search: async (query) => {
    try {
      const response = await api.post('/admin/users/search', { query });
      return response.data;
    } catch (error) {
      console.error('Search users error:', error);
      throw error.response?.data || { msg: 'Erro ao buscar usuários' };
    }
  },

  updateStatus: async (userId, status) => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update status error:', error);
      throw error.response?.data || { msg: 'Erro ao atualizar status' };
    }
  },

  blockUser: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/block`);
      return response.data;
    } catch (error) {
      console.error('Block user error:', error);
      throw error.response?.data || { msg: 'Erro ao bloquear usuário' };
    }
  },

  unblockUser: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/unblock`);
      return response.data;
    } catch (error) {
      console.error('Unblock user error:', error);
      throw error.response?.data || { msg: 'Erro ao desbloquear usuário' };
    }
  },

  deleteUser: async (userId, hardDelete = false) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`, {
        params: { hardDelete }
      });
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error.response?.data || { msg: 'Erro ao excluir usuário' };
    }
  },

  resetPassword: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/reset-password`);
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error.response?.data || { msg: 'Erro ao resetar senha' };
    }
  }
};

// Exercise Management
export const exerciseService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/admin/exercises', { params });
      return response.data;
    } catch (error) {
      console.error('Get exercises error:', error);
      throw error.response?.data || { msg: 'Erro ao carregar exercícios' };
    }
  },

  getById: async (exerciseId) => {
    try {
      const response = await api.get(`/admin/exercises/${exerciseId}`);
      return response.data;
    } catch (error) {
      console.error('Get exercise error:', error);
      throw error.response?.data || { msg: 'Erro ao carregar exercício' };
    }
  },

  create: async (exerciseData) => {
    try {
      const response = await api.post('/admin/exercises', exerciseData);
      return response.data;
    } catch (error) {
      console.error('Create exercise error:', error);
      throw error.response?.data || { msg: 'Erro ao criar exercício' };
    }
  },

  update: async (exerciseId, exerciseData) => {
    try {
      const response = await api.put(`/admin/exercises/${exerciseId}`, exerciseData);
      return response.data;
    } catch (error) {
      console.error('Update exercise error:', error);
      throw error.response?.data || { msg: 'Erro ao atualizar exercício' };
    }
  },

  delete: async (exerciseId) => {
    try {
      const response = await api.delete(`/admin/exercises/${exerciseId}`);
      return response.data;
    } catch (error) {
      console.error('Delete exercise error:', error);
      throw error.response?.data || { msg: 'Erro ao excluir exercício' };
    }
  },

  bulkUpload: async (exercises, assignToPersonalId = null) => {
    try {
      const response = await api.post('/admin/exercises/bulk-upload', {
        exercises,
        assignToPersonalId
      });
      return response.data;
    } catch (error) {
      console.error('Bulk upload error:', error);
      throw error.response?.data || { msg: 'Erro ao importar exercícios' };
    }
  },

  validateBulk: async (exercises) => {
    try {
      const response = await api.post('/admin/exercises/validate-bulk', { exercises });
      return response.data;
    } catch (error) {
      console.error('Validate bulk error:', error);
      throw error.response?.data || { msg: 'Erro ao validar exercícios' };
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/admin/exercises/categories');
      return response.data;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error.response?.data || { msg: 'Erro ao carregar categorias' };
    }
  },

  getProfessionals: async () => {
    try {
      const response = await api.get('/admin/professionals');
      return response.data;
    } catch (error) {
      console.error('Get professionals error:', error);
      throw error.response?.data || { msg: 'Erro ao carregar profissionais' };
    }
  }
};

export default api;
