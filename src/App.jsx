import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Guards
import ProtectedRoute from './components/routes/ProtectedRoute';

// Auth Views
import Login    from './views/auth/Login';
import Register from './views/auth/Register';

// Dashboard Views
import Dashboard  from './views/Dashboard';
import Tenants    from './views/Tenants';
import Users      from './views/Users';
import Settings   from './views/Settings';
import RolesPermissions from './views/RolesPermissions';
import RoadmapDev from './views/RoadmapDev';
import Modulos    from './views/Modulos';

// Empresas Views
import Certificados from './views/empresas/Certificados';

// Facturación Views
import Suscripciones from './views/facturacion/Suscripciones';
import Planes from './views/facturacion/Planes';
import HistorialPagos from './views/facturacion/HistorialPagos';
import Cupones from './views/facturacion/Cupones';

// Página de acceso denegado
function NoAutorizado() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center px-4">
      <span className="fas fa-ban text-danger" style={{ fontSize: '4rem' }}></span>
      <h3 className="mt-4 mb-2">Acceso restringido</h3>
      <p className="text-700">No tienes permisos para acceder a esta sección.</p>
      <a href="/" className="btn btn-primary mt-2">
        <span className="fas fa-arrow-left me-2"></span>Volver al inicio
      </a>
    </div>
  );
}

function App() {
  useEffect(() => {
    const preloader = document.getElementById('mindsoftia-preloader');
    if (preloader) {
      setTimeout(() => {
        preloader.classList.add('preloader-fade-out');
        setTimeout(() => preloader.remove(), 600);
      }, 800); // Pequeño delay para apreciar la animación
    }
  }, []);

  return (
    <Router>
      <Routes>

        {/* ── Rutas Públicas ─────────────────────────────────────────── */}
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/no-autorizado" element={<NoAutorizado />} />

        {/* ── Rutas Privadas (requieren sesión) ──────────────────────── */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index        element={<Dashboard />} />
          <Route path="empresas/directorio" element={<Tenants />} />
          <Route path="empresas/certificados" element={<Certificados />} />
          <Route path="empresas/solicitudes"  element={<div className="card m-3"><div className="card-body">Próximamente: Bandeja de Solicitudes de Alta y Onboarding</div></div>} />
          <Route path="empresas/metricas"     element={<div className="card m-3"><div className="card-body">Próximamente: Dashboard de Telemetría y Consumo SaaS</div></div>} />
          <Route path="modulos"      element={<Modulos />} />
          <Route path="usuarios"     element={<Users />} />
          <Route path="configuracion" element={<Settings />} />
          <Route path="permisos"     element={<RolesPermissions />} />
          <Route path="roadmap"      element={<RoadmapDev />} />

          {/* ── Facturación y Suscripciones ──────────────────────── */}
          <Route path="facturacion/suscripciones" element={<Suscripciones />} />
          <Route path="facturacion/planes"        element={<Planes />} />
          <Route path="facturacion/historial"     element={<HistorialPagos />} />
          <Route path="facturacion/cupones"       element={<Cupones />} />

          {/* ── Fase A: Contabilidad (próximas semanas) ─────────────── */}
          {/* <Route path="contabilidad/puc"      element={<PucIndex />} /> */}
          {/* <Route path="terceros"              element={<TercerosIndex />} /> */}
          {/* <Route path="contabilidad/asientos" element={<AsientosIndex />} /> */}
        </Route>

        {/* Ruta de fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
