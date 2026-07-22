import axios from 'axios';
import useAuthStore from '../store/authStore';

/**
 * Cliente Axios centralizado para el backend Laravel.
 * Inyecta automáticamente el JWT de Supabase en cada petición.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
  timeout: 15000,
});

// ─── Interceptor de Request ──────────────────────────────────────────────────
// Inyecta el token Bearer en cada petición saliente.
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor de Response ─────────────────────────────────────────────────
// Maneja errores globales de autenticación: si el JWT expiró (401),
// cierra la sesión y redirige al login automáticamente.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Sesión expirada o token inválido → cerrar sesión
      await useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
