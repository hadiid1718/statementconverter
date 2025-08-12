import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authServices';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate()
  
  // Check if user is logged in on first load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    const fetchUser = async () => {
      try {
        if (!token) return setUser(null);
        const currentUser = await authService.getCurrentUser();
        // 🔥 FIX: Include token in user object
        setUser({ ...currentUser, token });
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const { user: loggedInUser, token } = await authService.login(email, password);
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    // 🔥 FIX: Include token in user object
    setUser({ ...loggedInUser, token });
    return { ...loggedInUser, token };
  };

  const register = async (userData) => {
    const { user: newUser, token } = await authService.register(userData);
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    // 🔥 FIX: Include token in user object
    setUser({ ...newUser, token });
    return { ...newUser, token };
  };

  const logout = async () => {
    try { await authService.logout(); } catch {}
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate("/")
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);