import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Swal from 'sweetalert2';

function Login() {
  const navigate  = useNavigate();
  const { login } = useAuthStore();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);

    if (result.success) {
      Swal.fire({
        html: `
          <div class="d-flex flex-column align-items-center justify-content-center my-3">
            <div class="preloader-content" style="width: 140px; height: 140px; margin: 0 auto;">
              <div class="preloader-spinner" style="border-width: 3px;"></div>
              <img src="/logo.png" alt="Mindsoftia" class="preloader-logo" style="width: 90px; margin-bottom: 0;" />
            </div>
            <h4 class="mt-4 mb-2 text-primary font-sans-serif fw-bold">Bienvenido a Mindsoftia</h4>
            <span class="text-600" style="color: #9D4DFF !important">Preparando tu espacio de trabajo...</span>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        background: 'transparent',
        backdrop: 'rgba(11, 23, 39, 0.85)' // Un fondo oscuro elegante
      });

      setTimeout(() => {
        Swal.close();
        navigate('/');
      }, 1500);
    } else {
      setError(result.error || 'Credenciales incorrectas. Inténtalo de nuevo.');
    }
  };

  return (
    <main className="main" id="top">
      <div className="container-fluid">
        <div className="row min-vh-100 bg-100">
          
          {/* Panel Izquierdo - Imagen de fondo */}
          <div className="col-6 d-none d-lg-block position-relative">
            <div 
              className="bg-holder" 
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop)',
                backgroundPosition: '50% 20%',
                backgroundSize: 'cover'
              }}
            ></div>
          </div>
          
          {/* Panel Derecho - Formulario Card compacto */}
          <div className="col-sm-10 col-md-6 px-sm-0 align-self-center mx-auto py-5">
            <div className="row justify-content-center g-0">
              <div className="col-lg-9 col-xl-8 col-xxl-6">
                <div className="card shadow-sm">
                  
                  {/* Card Header (Estilo Falcon Split) */}
                  <div className="card-header bg-circle-shape bg-shape text-center p-3" style={{ backgroundColor: '#00B7FF' }}>
                    <Link className="d-flex flex-column align-items-center justify-content-center z-index-1 position-relative text-decoration-none" to="/">
                      <img 
                        src="/logo.png" 
                        alt="Mindsoftia Logo" 
                        style={{ maxHeight: '55px', width: 'auto' }} 
                      />
                      <span className="font-sans-serif fw-bolder fs-4 text-white mt-2">Mindsoftia</span>
                    </Link>
                  </div>
                  
                  <div className="card-body p-4">
                    <div className="row flex-between-center mb-2">
                      <div className="col-auto">
                        <h4 className="mb-0">Login</h4>
                      </div>
                      <div className="col-auto fs--1 text-600">
                        <span className="mb-0 fw-semi-bold">¿Nuevo Usuario? </span> 
                        <Link to="/register">Crear cuenta</Link>
                      </div>
                    </div>

                    {error && (
                      <div className="alert alert-danger p-2 mt-3 mb-0" role="alert">
                        <span className="fas fa-exclamation-circle me-2"></span>{error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-4">
                      <div className="mb-3">
                        <label className="form-label" htmlFor="email">Correo electrónico</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          className="form-control"
                          value={form.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label" htmlFor="password">Contraseña</label>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          className="form-control"
                          value={form.password}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="row flex-between-center mb-4">
                        <div className="col-auto">
                          <div className="form-check mb-0">
                            <input className="form-check-input" type="checkbox" id="split-checkbox" />
                            <label className="form-check-label" htmlFor="split-checkbox">Recordarme</label>
                          </div>
                        </div>
                        <div className="col-auto">
                          <a className="fs--1" href="/forgot-password">¿Olvidaste la contraseña?</a>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="btn btn-primary d-block w-100" 
                        disabled={loading} 
                        style={{ backgroundColor: '#00B7FF', border: 'none' }}
                      >
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}

export default Login;
