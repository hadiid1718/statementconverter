import api from './api';

const adminService = {
  // Admin login
  login: async (username, password) => {
    const res = await api.post('/admin/login', { username, password });
    return res.data;
  },

  // Get all users (admin only)
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },

  // Logout admin
  logout: async () => {
    await api.post('/auth/logout');
  },
};

export default adminService;
