import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import useAuthStore from '../../store/authStore';

import Swal from 'sweetalert2';

function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, role, logout } = useAuthStore();

  const handleLogout = async (e) => {
    e.preventDefault();
    
    Swal.fire({
      html: `
        <div class="d-flex flex-column align-items-center justify-content-center my-3">
          <div class="preloader-content" style="width: 140px; height: 140px; margin: 0 auto;">
            <div class="preloader-spinner" style="border-width: 3px;"></div>
            <img src="/logo.png" alt="Mindsoftia" class="preloader-logo" style="width: 90px; margin-bottom: 0;" />
          </div>
          <h4 class="mt-4 mb-2 text-primary font-sans-serif fw-bold">Mindsoftia</h4>
          <span class="text-600" style="color: #9D4DFF !important">Cerrando sesión segura...</span>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: 'transparent',
      backdrop: 'rgba(11, 23, 39, 0.85)' // Un fondo oscuro elegante
    });

    await logout();
    
    // Pequeño delay de UX para mostrar el cargador
    setTimeout(() => {
      Swal.close();
      navigate('/login');
    }, 1000);
  };

  const handleToggle = (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle('navbar-vertical-collapsed');
  };

  return (
    <nav className="navbar navbar-light navbar-glass navbar-top navbar-expand">
      <div className="w-100 d-flex align-items-center justify-content-between">
        {/* Left Side: Mobile Toggler, Brand Logo and Search */}
        <div className="d-flex align-items-center">
          <button 
            className="btn navbar-toggler-humburger-icon navbar-toggler me-1 me-sm-3" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarVerticalCollapse" 
            aria-controls="navbarVerticalCollapse" 
            aria-expanded="false" 
            aria-label="Toggle Navigation"
          >
            <span className="navbar-toggle-icon"><span className="toggle-line"></span></span>
          </button>
          
          <Link className="navbar-brand me-1 me-sm-3" to="/">
            <div className="d-flex align-items-center">
              <img src="/logo.png" alt="Mindsoftia Logo" className="me-2" style={{ maxHeight: '35px', width: 'auto' }} />
            </div>
          </Link>
        </div>

        {/* Right Side: Icons & Dropdowns */}
        <ul className="navbar-nav align-items-center gap-2">
          {/* Theme Control Toggle */}
          <li className="nav-item">
            <button 
              className="btn btn-link text-600 p-1"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              style={{ border: 'none', background: 'none' }}
            >
              {theme === 'dark' ? (
                <span className="fas fa-sun text-warning"></span>
              ) : (
                <span className="fas fa-moon text-primary"></span>
              )}
            </button>
          </li>

          {/* Personalizador Lateral (Settings) */}
          <li className="nav-item">
            <button 
              className="btn btn-link text-600 p-1"
              title="Personalizar Tema"
              style={{ border: 'none', background: 'none' }}
              data-bs-toggle="offcanvas" 
              data-bs-target="#settings-offcanvas" 
            >
              <span className="fas fa-cog fa-spin fs-1"></span>
            </button>
          </li>

          {/* Sincronización POS */}
          <li className="nav-item">
            <button 
              className="btn btn-link text-600 p-1"
              title="Estado de Sincronización (Nube)"
              style={{ border: 'none', background: 'none' }}
            >
              <span className="fas fa-cloud-upload-alt text-success fs-1"></span>
            </button>
          </li>

          {/* Semáforo DIAN */}
          <li className="nav-item">
            <div 
              className="d-flex align-items-center justify-content-center p-1"
              title="Servicios DIAN Operativos"
              style={{ cursor: 'pointer' }}
            >
              <span className="badge badge-soft-success rounded-pill d-flex align-items-center">
                <i className="fas fa-shield-alt me-1"></i> DIAN
              </span>
            </div>
          </li>

          {/* Notifications */}
          <li className="nav-item position-relative">
            <button 
              className="btn btn-link text-600 p-1 position-relative"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              onBlur={() => setTimeout(() => setNotificationsOpen(false), 200)}
            >
              <span className="fas fa-bell fs-1"></span>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                3
              </span>
            </button>

            {/* Notifications Dropdown Panel */}
            {notificationsOpen && (
              <div className="dropdown-menu dropdown-menu-end show shadow-lg border" style={{ display: 'block', position: 'absolute', right: 0, top: '45px', zIndex: 1050, width: '320px', padding: 0 }}>
                <div className="card shadow-none">
                  <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0"><i className="fas fa-bell text-primary me-2"></i>Notificaciones</h6>
                    <a className="fs--2" href="#!">Marcar leídas</a>
                  </div>
                  <div className="card-body p-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <div className="list-group list-group-flush fs--1">
                      
                      <div className="list-group-item list-group-item-action border-bottom bg-200">
                        <div className="d-flex">
                          <div className="avatar avatar-xl me-3">
                            <div className="avatar-name rounded-circle bg-danger text-white"><i className="fas fa-certificate"></i></div>
                          </div>
                          <div className="flex-1">
                            <h6 className="mb-1 fw-bold text-danger">Certificado Digital por Vencer</h6>
                            <p className="mb-0 text-1000">El certificado de firma electrónica expira en 15 días. Renuévelo para evitar paralizar la Facturación Electrónica.</p>
                            <span className="text-500 fs--2">Hace 2 horas</span>
                          </div>
                        </div>
                      </div>

                      <div className="list-group-item list-group-item-action border-bottom">
                        <div className="d-flex">
                          <div className="avatar avatar-xl me-3">
                            <div className="avatar-name rounded-circle bg-warning text-white"><i className="fas fa-file-invoice"></i></div>
                          </div>
                          <div className="flex-1">
                            <h6 className="mb-1">Consecutivos FE por Agotarse</h6>
                            <p className="mb-0 text-1000">Resolución 18760000001 (Prefijo SETT). Quedan menos de 100 folios.</p>
                            <span className="text-500 fs--2">Hace 5 horas</span>
                          </div>
                        </div>
                      </div>

                      <div className="list-group-item list-group-item-action border-bottom">
                        <div className="d-flex">
                          <div className="avatar avatar-xl me-3">
                            <div className="avatar-name rounded-circle bg-success text-white"><i className="fas fa-check-double"></i></div>
                          </div>
                          <div className="flex-1">
                            <h6 className="mb-1">Acuse de Recibo RADIAN</h6>
                            <p className="mb-0 text-1000">El cliente 'Inversiones ABC' ha aceptado expresamente la factura FE-102.</p>
                            <span className="text-500 fs--2">Ayer</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                  <div className="card-footer bg-light p-0 border-top">
                    <a className="btn btn-link d-block w-100 py-2 fs--1" href="#!">Ver todas las notificaciones</a>
                  </div>
                </div>
              </div>
            )}
          </li>

          {/* User Dropdown */}
          <li className="nav-item dropdown position-relative">
            <button 
              className="btn p-0 border-0" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
            >
              <div className="avatar">
                <img 
                  className="rounded-circle bg-white p-1" 
                  src="/logo.png" 
                  alt="Mindsoftia Avatar" 
                  style={{ width: '32px', height: '32px', objectFit: 'contain', border: '1px solid #ddd' }}
                />
              </div>
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu dropdown-menu-end show" style={{ display: 'block', position: 'absolute', right: 0, top: '45px', zIndex: 1000 }}>
                <div className="bg-white dark__bg-1000 rounded-2 py-2 shadow-lg border">
                  {/* User Info Header */}
                  <div className="dropdown-item-text px-3 py-2 border-bottom mb-1">
                    <p className="mb-0 fw-bold text-dark" style={{ fontSize: '0.875rem' }}>
                      {user?.email || 'Usuario'}
                    </p>
                    <span className="badge bg-primary" style={{ fontSize: '0.7rem' }}>{role || 'Sin rol'}</span>
                  </div>

                  <a className="dropdown-item fw-bold text-primary" href="#!">
                    <span className="fas fa-user me-2"></span> Mi Perfil
                  </a>
                  <a className="dropdown-item" href="#!">
                    <span className="fas fa-cog me-2"></span> Ajustes
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item text-danger" href="#!" onClick={handleLogout}>
                    <span className="fas fa-sign-out-alt me-2"></span> Cerrar Sesión
                  </a>
                </div>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default TopNav;
