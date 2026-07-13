import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * ProtectedRoute — Guarda de rutas privadas.
 *
 * Si no hay sesión activa, redirige al /login guardando la ruta original
 * en el estado de navegación para retornar después del login.
 *
 * Uso:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/" element={<Dashboard />} />
 *   </Route>
 *
 * Con restricción de rol:
 *   <Route element={<ProtectedRoute allowedRoles={['admin', 'contador']} />}>
 *     <Route path="/admin" element={<AdminPanel />} />
 *   </Route>
 */
function ProtectedRoute({ children, allowedRoles, requiredModule, requiredPermission }) {
  const { session, role, restoreSession, hasModule, hasPermission } = useAuthStore();
  const location = useLocation();

  // Intentar restaurar sesión desde localStorage si no existe en store,
  // o si falta el tenantId (para recuperar permisos y contexto de BD actualizados).
  useEffect(() => {
    if (!session || !useAuthStore.getState().tenantId) {
      restoreSession();
    }
  }, []);

  // Sin sesión → redirigir al login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Con restricción de rol → redirigir a no autorizado
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  // 🛡️ Seguridad /master-sec: Bloqueo de acceso directo por URL a módulos no contratados
  if (requiredModule && !hasModule(requiredModule)) {
    if (role !== 'admin' && role !== 'propietario') {
      return <Navigate to="/no-autorizado" replace />;
    }
  }

  // 🛡️ Seguridad /master-sec: Bloqueo de acceso directo por URL si no tiene permiso RBAC
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (role !== 'admin' && role !== 'propietario') {
      return <Navigate to="/no-autorizado" replace />;
    }
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
