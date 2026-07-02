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
      loginAttempts: 0,    // Contador de intentos fallidos
      lockoutUntil: null,  // Timestamp de bloqueo por fuerza bruta

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

      login: async (email, password) => {
        const { loginAttempts, lockoutUntil } = get();

        // 1. Verificar si el usuario está bloqueado temporalmente (Brute Force Protection)
        if (lockoutUntil && Date.now() < lockoutUntil) {
          const segundosRestantes = Math.ceil((lockoutUntil - Date.now()) / 1000);
          const errorMsg = `Demasiados intentos fallidos. Intente nuevamente en ${segundosRestantes} segundos.`;
          set({ error: errorMsg });
          return { success: false, error: errorMsg };
        }

        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;

          const session = data.session;
          const user    = data.user;

          // Login exitoso: Resetear contadores de seguridad y setear sesión
          set({
            session,
            user,
            isLoading: false,
            error: null,
            loginAttempts: 0,
            lockoutUntil: null
          });

          // Inmediatamente después pedimos el perfil al backend
          await get().fetchProfile(session.access_token);

          return { success: true };
        } catch (err) {
          // Incremento del contador de intentos fallidos
          const newAttempts = get().loginAttempts + 1;
          const maxAttempts = 3; // Límite estricto de intentos
          let lockTime = null;
          let finalError = err.message;

          if (newAttempts >= maxAttempts) {
            lockTime = Date.now() + (60 * 1000); // Bloqueo de 60 segundos
            finalError = `Acceso bloqueado por múltiples fallos. Espere 60 segundos.`;
          }

          set({ 
            isLoading: false, 
            error: finalError,
            loginAttempts: newAttempts,
            lockoutUntil: lockTime
          });
          
          return { success: false, error: finalError };
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
        loginAttempts: state.loginAttempts,
        lockoutUntil: state.lockoutUntil,
      }),
    }
  )
);

export default useAuthStore;
