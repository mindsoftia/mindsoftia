import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

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
      navigate('/');
    } else {
      setError(result.error || 'Credenciales incorrectas. Inténtalo de nuevo.');
    }
  };

  return (
    <main className="main" id="top">
      <div className="container-fluid">
        <div className="row min-vh-100 flex-center g-0">

          {/* Panel izquierdo decorativo */}
          <div className="col-lg-6 col-xxl-5 py-3 position-relative d-none d-lg-block"
            style={{
              background: 'linear-gradient(135deg, #00B7FF 0%, #9D4DFF 100%)',
              minHeight: '100vh',
            }}
          >
            <div className="d-flex flex-column justify-content-center align-items-center h-100 text-white px-5">
              <div className="mb-4 d-flex justify-content-center">
                <div 
                  className="bg-white d-flex align-items-center justify-content-center shadow-lg" 
                  style={{ 
                    width: '130px', 
                    height: '130px', 
                    borderRadius: '50%', 
                    border: '5px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 0 20px rgba(255,255,255,0.2)'
                  }}
                >
                  <img src="/logo.png" alt="Mindsoftia Logo" style={{ maxHeight: '75px', maxWidth: '85%' }} />
                </div>
              </div>
              <p className="text-white-50 text-center fs-1" style={{ maxWidth: '340px' }}>
                Plataforma contable y fiscal inteligente para Colombia.
              </p>
              <div className="row g-3 mt-4 w-100" style={{ maxWidth: '380px' }}>
                {[
                  { icon: 'fa-file-invoice-dollar', text: 'Facturación DIAN' },
                  { icon: 'fa-users',               text: 'Multi-empresa' },
                  { icon: 'fa-robot',               text: 'IA Contable' },
                  { icon: 'fa-lock',                text: 'Seguridad Bancaria' },
                ].map(({ icon, text }) => (
                  <div key={text} className="col-6">
                    <div className="d-flex align-items-center gap-2"
                      style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 14px' }}>
                      <span className={`fas ${icon} text-white`}></span>
                      <span className="text-white fs--1 fw-medium">{text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel derecho — Formulario */}
          <div className="col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4 px-4 px-sm-5">
            <div className="text-center mb-5">
              <a href="/" className="d-inline-flex align-items-center mb-4">
                <img src="/logo.png" alt="Mindsoftia Logo" style={{ maxHeight: '55px', width: 'auto' }} />
              </a>
              <p className="text-700">Ingresa a tu cuenta para continuar</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                <span className="fas fa-exclamation-circle"></span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="email">
                  Correo electrónico
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <span className="fas fa-envelope text-primary"></span>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="correo@empresa.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="password">
                  Contraseña
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <span className="fas fa-lock text-primary"></span>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder="Tu contraseña"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <div className="row flex-between-center mb-4">
                <div className="col-auto">
                  <div className="form-check mb-0">
                    <input className="form-check-input" type="checkbox" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Recordarme
                    </label>
                  </div>
                </div>
                <div className="col-auto">
                  <a className="fs--1" href="/forgot-password">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Ingresando...
                  </>
                ) : (
                  <>
                    <span className="fas fa-sign-in-alt me-2"></span>
                    Iniciar Sesión
                  </>
                )}
              </button>
            </form>

            <hr className="my-4" />

            <p className="text-center fs--1 text-700">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="fw-semibold">
                Regístrate gratis
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}

export default Login;
