import api from './api';

const authService = {
  // Login user
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  // Register new user
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  // Logout current user
  logout: async () => {
    await api.post('/auth/logout');
  },

  // Get currently logged-in user
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export default authService;
