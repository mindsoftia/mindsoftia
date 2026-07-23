import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

function Sidebar() {
  const location = useLocation();
  const { role, user, hasModule } = useAuthStore();

  const superAdminMenu = [
    {
      title: 'Dashboard y Analíticas',
      icon: 'fas fa-chart-pie',
      path: '/'
    },
    {
      title: 'Empresas',
      icon: 'fas fa-building',
      id: 'empresasMenu',
      children: [
        { title: 'Directorio Global', path: '/empresas/directorio' },
        { title: 'Certificados DIAN (.p12)', path: '/empresas/certificados' },
        { title: 'Solicitudes de Alta', path: '/empresas/solicitudes' },
        { title: 'Métricas de Consumo', path: '/empresas/metricas' }
      ]
    },
    {
      title: 'Suscripciones y Pagos',
      icon: 'fas fa-credit-card',
      id: 'billingMenu',
      children: [
        { title: 'Suscripciones Activas', path: '/facturacion/suscripciones' },
        { title: 'Planes y Precios', path: '/facturacion/planes' },
        { title: 'Historial de Pagos', path: '/facturacion/historial' },
        { title: 'Cupones y Descuentos', path: '/facturacion/cupones' }
      ]
    },
    {
      title: 'App Store (Módulos)',
      icon: 'fas fa-cubes',
      path: '/modulos'
    },
    {
      title: 'Soporte y Helpdesk',
      icon: 'fas fa-headset',
      path: '/soporte'
    },
    {
      title: 'Configuración Global',
      icon: 'fas fa-cog',
      id: 'configuracionMenu',
      children: [
        { title: 'Ajustes Generales', path: '/configuracion' },
        { title: 'Integraciones Maestras', path: '/integraciones' },
        { title: 'Roles y Permisos', path: '/permisos' }
      ]
    },
    {
      title: 'Roadmap Dev',
      icon: 'fas fa-map-signs',
      path: '/roadmap'
    }
  ];

  const tenantMenu = [
    {
      title: 'Tablero Gerencial',
      icon: 'fas fa-chart-pie',
      path: '/'
    },
    {
      title: 'Contactos',
      icon: 'fas fa-users',
      id: 'contactosMenu',
      children: [
        { title: 'Clientes', path: '/contactos/clientes' },
        { title: 'Proveedores', path: '/contactos/proveedores' }
      ]
    },
    {
      title: 'Catálogo e Inventario',
      icon: 'fas fa-boxes',
      id: 'inventarioMenu',
      children: [
        { title: 'Productos y Servicios', path: '/inventario/productos' },
        { title: 'Categorías y Familias', path: '/inventario/categorias' },
        { title: 'Bodegas y Sucursales', path: '/inventario/bodegas' },
        { title: 'Movimientos (Kardex)', path: '/inventario/movimientos' }
      ]
    }
  ];

  if (hasModule && hasModule('pos')) {
    tenantMenu.push({
      title: 'Vender (POS)',
      icon: 'fas fa-cash-register', // Icono más orientado a la acción de cobrar
      path: '/pos'
    });
  }

  if (hasModule && hasModule('facturacion')) {
    tenantMenu.push({
      title: 'Ventas',
      icon: 'fas fa-file-invoice-dollar',
      id: 'ventasMenu',
      children: [
        { title: 'Facturación Electrónica', path: '/ventas/facturas' },
        { title: 'Bandeja RADIAN (Recepción)', path: '/ventas/radian' },
        { title: 'Historial POS (Cierres)', path: '/ventas/pos-historial' },
        { title: 'Notas Crédito / Débito', path: '/ventas/notas' },
        { title: 'Cotizaciones / Pedidos', path: '/ventas/cotizaciones' },
        { title: 'Recibos de Caja', path: '/ventas/recibos' },
        { title: 'Cartera (CxC)', path: '/ventas/cartera' },
        { title: 'Reportes e Informes', path: '/ventas/reportes' }
      ]
    });
  }

  if (hasModule && hasModule('compras')) {
    tenantMenu.push({
      title: 'Compras y Gastos',
      icon: 'fas fa-shopping-cart',
      id: 'comprasMenu',
      children: [
        { title: 'Facturas de Compra', path: '/compras/facturas' },
        { title: 'Órdenes de Compra', path: '/compras/ordenes' },
        { title: 'Comprobantes de Egreso', path: '/compras/egresos' },
        { title: 'Cuentas por Pagar', path: '/compras/cuentas-por-pagar' }
      ]
    });
  }

  if (hasModule && hasModule('contabilidad')) {
    tenantMenu.push({
      title: 'Contabilidad Electrónica',
      icon: 'fas fa-book',
      id: 'contabilidadMenu',
      children: [
        { title: 'Plan de Cuentas (PUC)', path: '/contabilidad/puc' },
        { title: 'Asientos Contables', path: '/contabilidad/asientos' },
        { title: 'Conciliación Bancaria', path: '/contabilidad/conciliacion' },
        { title: 'Impuestos y Retenciones', path: '/contabilidad/impuestos' },
        { title: 'Reportes Financieros', path: '/contabilidad/reportes' },
        { title: 'Cierre Contable', path: '/contabilidad/cierre' }
      ]
    });
  }

  if (hasModule && hasModule('nomina')) {
    tenantMenu.push({
      title: 'Nómina Electrónica',
      icon: 'fas fa-users-cog',
      id: 'nominaMenu',
      children: [
        { title: 'Empleados', path: '/nomina/empleados' },
        { title: 'Novedades y Préstamos', path: '/nomina/novedades' },
        { title: 'Liquidación', path: '/nomina/liquidacion' },
        { title: 'Transmisión DIAN', path: '/nomina/dian' },
        { title: 'Reportes', path: '/nomina/reportes' }
      ]
    });
  }

  // El módulo de IA/Automatización se eliminó para que sea transparente al cliente

  tenantMenu.push({
    title: 'Ajustes',
    icon: 'fas fa-cog',
    id: 'tenantConfig',
    children: [
      { title: 'Perfil de Empresa', path: '/ajustes/perfil-empresa' },
      { title: 'Usuarios y Roles', path: '/ajustes/usuarios' },
      { title: 'Configuración POS', path: '/ajustes/pos' },
      { title: 'Resoluciones DIAN', path: '/ajustes/resoluciones' },
      { title: 'Sincronización', path: '/ajustes/sincronizacion' }
    ]
  });

  // Si el rol es admin (Superadmin) o si es tu correo de propietario, cargamos su menú.
  const isSuperAdmin = role === 'admin' || 
                       user?.email === 'amadomora@gmail.com';

  const menuItems = isSuperAdmin ? superAdminMenu : tenantMenu;

  const handleToggle = (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle('navbar-vertical-collapsed');
  };

  const [navbarStyle, setNavbarStyle] = React.useState(localStorage.getItem('navbarStyle') || 'card');

  React.useEffect(() => {
    // Force collapsed mode on mount
    document.documentElement.classList.add('navbar-vertical-collapsed');
    localStorage.setItem('isNavbarVerticalCollapsed', true);
    
    const handleStorageChange = () => {
      setNavbarStyle(localStorage.getItem('navbarStyle') || 'card');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  let navbarClass = 'navbar-light';
  if (navbarStyle === 'inverted') navbarClass = 'navbar-dark';
  else if (navbarStyle === 'card') navbarClass = 'navbar-light navbar-card';
  else if (navbarStyle === 'vibrant') navbarClass = 'navbar-dark navbar-vibrant';

  const handleMouseEnter = () => {
    if (document.documentElement.classList.contains('navbar-vertical-collapsed')) {
      document.documentElement.classList.add('navbar-vertical-collapsed-hover');
    }
  };

  const handleMouseLeave = () => {
    if (document.documentElement.classList.contains('navbar-vertical-collapsed-hover')) {
      document.documentElement.classList.remove('navbar-vertical-collapsed-hover');
    }
  };

  return (
    <nav 
      className={`navbar ${navbarClass} navbar-vertical navbar-expand-xl`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="d-flex align-items-center">
        <div className="toggle-icon-wrapper">
          <button 
            className="btn navbar-toggler-humburger-icon navbar-vertical-toggle" 
            onClick={handleToggle}
            type="button"
            title="Toggle Navigation"
          >
            <span className="navbar-toggle-icon"><span className="toggle-line"></span></span>
          </button>
        </div>
        <Link className="navbar-brand" to="/">
          <div className="d-flex align-items-center py-3">
            <img src="/logo.png" alt="Mindsoftia Logo" className="me-2" style={{ maxHeight: '35px', width: 'auto' }} />
          </div>
        </Link>
      </div>
      
      <div className="collapse navbar-collapse" id="navbarVerticalCollapse">
        <div className="navbar-vertical-content scrollbar">
          <ul className="navbar-nav flex-column mb-3" id="navbarVerticalNav">
            <li className="nav-item">
              <div className="row navbar-vertical-label-wrapper mt-3 mb-2">
                <div className="col-auto navbar-vertical-label">Navegación</div>
                <div className="col ps-0">
                  <hr className="mb-0 navbar-vertical-divider" />
                </div>
              </div>
              
              {menuItems.map((item, idx) => {
                if (item.children) {
                  const isActive = item.children.some(child => location.pathname === child.path);
                  return (
                    <React.Fragment key={idx}>
                      <a 
                        className={`nav-link dropdown-indicator ${isActive ? '' : 'collapsed'}`}
                        href={`#${item.id}`} 
                        role="button" 
                        data-bs-toggle="collapse" 
                        aria-expanded={isActive} 
                        aria-controls={item.id}
                      >
                        <div className="d-flex align-items-center">
                          <span className="nav-link-icon">
                            <span className={item.icon}></span>
                          </span>
                          <span className="nav-link-text ps-1">{item.title}</span>
                        </div>
                      </a>
                      <ul className={`nav collapse ${isActive ? 'show' : ''}`} id={item.id}>
                        {item.children.map((child, cIdx) => (
                          <li className="nav-item" key={cIdx}>
                            <Link 
                              className={`nav-link ${location.pathname === child.path ? 'active' : ''}`} 
                              to={child.path}
                            >
                              <div className="d-flex align-items-center">
                                <span className="nav-link-text ps-1">{child.title}</span>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </React.Fragment>
                  );
                }

                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={idx} 
                    className={`nav-link ${isActive ? 'active' : ''}`} 
                    to={item.path}
                    role="button"
                  >
                    <div className="d-flex align-items-center">
                      <span className="nav-link-icon">
                        <span className={item.icon}></span>
                      </span>
                      <span className="nav-link-text ps-1">{item.title}</span>
                    </div>
                  </Link>
                );
              })}
            </li>
          </ul>
          
          <div className="settings mb-3 px-3">
            <div className="card shadow-none text-center p-3 bg-transparent border-0">
              <img src="/logo.png" alt="Mindsoftia Logo" className="mx-auto mb-2" style={{ maxHeight: '45px', width: 'auto', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }} />
              <p className="fs--2 mt-2 mb-0 text-500 font-sans-serif fw-bold">Mindsoftia</p>
            </div>
          </div>
          
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;
