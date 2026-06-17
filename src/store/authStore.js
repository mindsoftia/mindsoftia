import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../services/supabase';

/**
 * authStore — Estado global de autenticación
 * Persiste la sesión en localStorage para sobrevivir recargas de página.
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // ─── State ──────────────────────────────────────────────────────────────
      session: null,       // Objeto de sesión de Supabase (incluye el JWT)
      user: null,          // Datos del usuario autenticado
      tenantId: null,      // ID de la empresa activa
      role: null,          // Rol: 'admin' | 'contador' | 'asistente'
      permissions: [],     // Permisos específicos del usuario (ej. ['cartera.ver'])
      isLoading: false,
      error: null,

      // ─── Actions ─────────────────────────────────────────────────────────────

      /**
       * Carga el perfil completo desde el backend Laravel (permisos, rol real).
       */
      fetchProfile: async (token) => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
          const res = await fetch(`${apiUrl}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          if (res.ok) {
            const profile = await res.json();
            set({
              tenantId: profile.tenant_id || null,
              role: profile.role || null,
              permissions: profile.permissions || []
            });
          }
        } catch (err) {
          console.error("Error fetching profile from backend", err);
        }
      },

      /**
       * Inicia sesión con email y contraseña usando Supabase Auth.
       */
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;

          const session = data.session;
          const user    = data.user;

          // Primero seteamos la sesión para que las peticiones tengan token
          set({
            session,
            user,
            isLoading: false,
            error: null,
          });

          // Inmediatamente después pedimos el perfil al backend
          await get().fetchProfile(session.access_token);

          return { success: true };
        } catch (err) {
          set({ isLoading: false, error: err.message });
          return { success: false, error: err.message };
        }
      },

      /**
       * Cierra la sesión del usuario en Supabase y limpia el store.
       */
      logout: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null, tenantId: null, role: null, permissions: [], error: null });
      },

      /**
       * Restaura la sesión activa desde Supabase (útil al recargar la página).
       */
      restoreSession: async () => {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          set({
            session:  data.session,
            user: data.session.user,
          });
          // Recuperar permisos si recargamos la página
          await get().fetchProfile(data.session.access_token);
        }
      },

      /**
       * Helpers de Permisos y Roles
       */
      hasPermission: (permissionCode) => {
        return get().permissions.includes(permissionCode);
      },

      hasRole: (roleName) => {
        return get().role === roleName;
      },

      /**
       * Selectores de conveniencia.
       */
      isAuthenticated: () => !!get().session,
      getToken: () => get().session?.access_token || null,
    }),
    {
      name: 'mindsoftia-auth', // Clave en localStorage
      partialize: (state) => ({
        session:  state.session,
        user:     state.user,
        tenantId: state.tenantId,
        role:     state.role,
        permissions: state.permissions,
      }),
    }
  )
);

export default useAuthStore;
