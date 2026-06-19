import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import useAuthStore from '../../store/authStore';

import Swal from 'sweetalert2';

function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, role, logout } = useAuthStore();

  const handleLogout = async (e) => {
    e.preventDefault();
    
    Swal.fire({
      title: 'Saliendo de MINDSOFTIA',
      html: '<span style="color: #9D4DFF">Cerrando sesión segura...</span>',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      color: '#00B7FF',
      backdrop: 'rgba(0, 183, 255, 0.15)', // Un fondo semi-transparente del color primario
      didOpen: () => {
        Swal.showLoading();
      }
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
            >
              <span className="fas fa-cog fa-spin fs-1"></span>
            </button>
          </li>

          {/* Notifications */}
          <li className="nav-item position-relative">
            <button className="btn btn-link text-600 p-1 position-relative">
              <span className="fas fa-bell"></span>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                3
              </span>
            </button>
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
