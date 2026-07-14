import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Updater PWA
import UpdaterPWA from './components/common/UpdaterPWA';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Guards
import ProtectedRoute from './components/routes/ProtectedRoute';

// Auth Views
import Login    from './views/auth/Login';
import Register from './views/auth/Register';
import OnboardingWizard from './views/auth/OnboardingWizard';

// Dashboard Views
import DashboardRouter from './views/DashboardRouter';
import Tenants    from './views/Tenants';
import Users      from './views/Users';
import Settings   from './views/Settings';
import RolesPermissions from './views/RolesPermissions';
import RoadmapDev from './views/RoadmapDev';
import Modulos    from './views/Modulos';

// Tenant Settings Views
import UserRoles  from './views/tenant/settings/UserRoles';
import POSSettings from './views/tenant/settings/POSSettings';

// Empresas Views
import Certificados from './views/empresas/Certificados';

// ── NexoPOS: Módulo POS e Inventario ────────────────────────────────
import POSLayout      from './views/pos/POSLayout';
import InventarioAdmin from './views/pos/InventarioAdmin';
import CategoriasList  from './views/inventario/CategoriasList';
import BodegasList     from './views/inventario/BodegasList';
import KardexList      from './views/inventario/KardexList';
import ProveedoresList from './views/contactos/ProveedoresList';
import ClientesList    from './views/contactos/ClientesList';
import FacturasCompraList from './views/compras/FacturasCompraList';
import FacturaCompraForm from './views/compras/FacturaCompraForm';
import ProductoCreate  from './views/productos/ProductoCreate';
import ProductosList   from './views/productos/ProductosList';
import StoreFront      from './views/tienda/StoreFront';

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

  // Temporizador de inactividad para cierre de sesión automático (15 minutos)
  useEffect(() => {
    let timeoutId;
    
    const logoutUser = async () => {
      try {
        const { supabase } = await import('./services/supabase');
        await supabase.auth.signOut();
        window.location.href = '/login';
      } catch (error) {
        console.error("Error al cerrar sesión por inactividad", error);
      }
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 15 minutos de inactividad = 900000 milisegundos
      timeoutId = setTimeout(logoutUser, 900000); 
    };

    // Eventos que reinician el temporizador indicando que el usuario sigue ahí
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    
    resetTimer(); // Iniciar la primera vez

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, []);

  return (
    <Router>
      <UpdaterPWA />
      <Routes>

        {/* ── Rutas Públicas ─────────────────────────────────────────── */}
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/no-autorizado" element={<NoAutorizado />} />
        <Route path="/onboarding"    element={<OnboardingWizard />} />
        <Route path="/tienda"        element={<StoreFront />} />

        {/* ── Rutas Privadas (requieren sesión) ──────────────────────── */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index        element={<DashboardRouter />} />
          <Route path="empresas/directorio" element={<Tenants />} />
          <Route path="empresas/certificados" element={<Certificados />} />
          <Route path="empresas/solicitudes"  element={<div className="card m-3"><div className="card-body">Próximamente: Bandeja de Solicitudes de Alta y Onboarding</div></div>} />
          <Route path="empresas/metricas"     element={<div className="card m-3"><div className="card-body">Próximamente: Dashboard de Telemetría y Consumo SaaS</div></div>} />
          <Route path="modulos"      element={<Modulos />} />
          <Route path="usuarios"     element={<Users />} />
          <Route path="configuracion" element={<Settings />} />
          <Route path="permisos"     element={<RolesPermissions />} />
          <Route path="roadmap"      element={<RoadmapDev />} />

          {/* ── Ajustes Inquilino (Empresa) ────────────────────────── */}
          <Route element={<ProtectedRoute requiredPermission="ajustes.usuarios" />}>
            <Route path="ajustes/usuarios" element={<UserRoles />} />
            <Route path="ajustes/pos" element={<POSSettings />} />
          </Route>

          {/* ── Facturación y Suscripciones (SaaS SuperAdmin) ──────────────────────── */}
          <Route path="facturacion/suscripciones" element={<Suscripciones />} />
          <Route path="facturacion/planes"        element={<Planes />} />
          <Route path="facturacion/historial"     element={<HistorialPagos />} />
          <Route path="facturacion/cupones"       element={<Cupones />} />

          {/* ── NexoPOS: Punto de Venta ───────────────── */}
          <Route element={<ProtectedRoute requiredModule="pos" requiredPermission="pos.acceso" />}>
            <Route path="pos" element={<POSLayout />} />
          </Route>

          {/* ── Catálogo e Inventario ───────────────── */}
          <Route element={<ProtectedRoute requiredPermission="inventario.ver" />}>
            <Route path="inventario/productos" element={<ProductosList />} />
            <Route path="inventario/stock" element={<InventarioAdmin />} />
            <Route path="inventario/categorias" element={<CategoriasList />} />
            <Route path="inventario/bodegas" element={<BodegasList />} />
            <Route path="productos" element={<Navigate to="/inventario/productos" replace />} />
            <Route path="inventario" element={<Navigate to="/inventario/productos" replace />} />
          </Route>

          {/* Rutas de Inventario con Permisos Especiales */}
          <Route path="inventario/movimientos" element={
            <ProtectedRoute requiredPermission="inventario.kardex">
              <KardexList />
            </ProtectedRoute>
          } />
          <Route path="productos/add-product" element={
            <ProtectedRoute requiredPermission="inventario.crear">
              <ProductoCreate />
            </ProtectedRoute>
          } />

          {/* ── Compras y Gastos ───────────────── */}
          <Route element={<ProtectedRoute requiredModule="compras" requiredPermission="compras.ingresar" />}>
            <Route path="compras/facturas" element={<FacturasCompraList />} />
            <Route path="compras/facturas/nueva" element={<FacturaCompraForm />} />
          </Route>

          {/* ── Contactos ───────────────── */}
          <Route path="contactos/proveedores" element={<ProveedoresList />} />
          <Route path="contactos/clientes" element={<ClientesList />} />
          <Route path="contactos" element={<Navigate to="/contactos/proveedores" replace />} />

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
