import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    nit: '',
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.password || !form.companyName || !form.nit) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email:    form.email,
        password: form.password,
        options: {
          data: {
            full_name:    form.fullName,
            company_name: form.companyName,
            nit:          form.nit,
          },
        },
      });

      if (signUpError) throw signUpError;

      setSuccess(
        'Registro exitoso. Revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.'
      );
    } catch (err) {
      setError(err.message || 'Error al registrar. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main" id="top">
      <div className="container-fluid">
        <div className="row min-vh-100 flex-center g-0">

          {/* Panel izquierdo decorativo */}
          <div
            className="col-lg-5 d-none d-lg-flex flex-column justify-content-center align-items-center text-white px-5"
            style={{
              background: 'linear-gradient(135deg, #27bcfd 0%, #2c7be5 100%)',
              minHeight: '100vh',
            }}
          >
            <span className="fas fa-building" style={{ fontSize: '3.5rem', opacity: 0.9 }}></span>
            <h2 className="fw-bold text-white mt-4 mb-2">Registra tu empresa</h2>
            <p className="text-white-50 text-center" style={{ maxWidth: '320px' }}>
              Crea tu cuenta Mindsoftia y comienza a gestionar tu contabilidad de manera inteligente.
            </p>
            <ul className="list-unstyled mt-4 text-white-50 fs--1">
              {[
                '✅ Facturación DIAN integrada',
                '✅ Multi-usuario por empresa',
                '✅ PUC NIIF preconfigurado',
                '✅ 14 días de prueba gratis',
              ].map((item) => (
                <li key={item} className="mb-2">{item}</li>
              ))}
            </ul>
          </div>

          {/* Formulario de Registro */}
          <div className="col-sm-10 col-md-8 col-lg-7 col-xl-6 col-xxl-5 px-4 px-sm-5 py-5">
            <div className="text-center mb-4">
              <a href="/" className="d-inline-flex align-items-center gap-2 mb-2">
                <span className="fas fa-chart-line text-primary" style={{ fontSize: '1.5rem' }}></span>
                <span className="font-sans-serif fw-bolder fs-4 text-primary">Mindsoftia</span>
              </a>
              <p className="text-700 mb-0">Crea tu cuenta gratuita</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2">
                <span className="fas fa-exclamation-circle"></span>
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="alert alert-success text-center">
                <span className="fas fa-check-circle me-2"></span>
                {success}
                <div className="mt-3">
                  <Link to="/login" className="btn btn-primary btn-sm">
                    Ir al inicio de sesión
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">

                  {/* Nombre completo */}
                  <div className="col-12">
                    <label className="form-label" htmlFor="fullName">
                      Nombre completo <span className="text-danger">*</span>
                    </label>
                    <input
                      id="fullName" name="fullName" type="text"
                      className="form-control" placeholder="Tu nombre"
                      value={form.fullName} onChange={handleChange} required
                    />
                  </div>

                  {/* Email */}
                  <div className="col-12">
                    <label className="form-label" htmlFor="reg-email">
                      Correo electrónico <span className="text-danger">*</span>
                    </label>
                    <input
                      id="reg-email" name="email" type="email"
                      className="form-control" placeholder="correo@empresa.com"
                      value={form.email} onChange={handleChange} required
                    />
                  </div>

                  {/* Nombre de la empresa */}
                  <div className="col-sm-7">
                    <label className="form-label" htmlFor="companyName">
                      Razón social <span className="text-danger">*</span>
                    </label>
                    <input
                      id="companyName" name="companyName" type="text"
                      className="form-control" placeholder="Mi Empresa S.A.S."
                      value={form.companyName} onChange={handleChange} required
                    />
                  </div>

                  {/* NIT */}
                  <div className="col-sm-5">
                    <label className="form-label" htmlFor="nit">
                      NIT <span className="text-danger">*</span>
                    </label>
                    <input
                      id="nit" name="nit" type="text"
                      className="form-control" placeholder="900123456-7"
                      value={form.nit} onChange={handleChange} required
                    />
                  </div>

                  {/* Contraseña */}
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="reg-password">
                      Contraseña <span className="text-danger">*</span>
                    </label>
                    <input
                      id="reg-password" name="password" type="password"
                      className="form-control" placeholder="Mínimo 8 caracteres"
                      value={form.password} onChange={handleChange} required
                    />
                  </div>

                  {/* Confirmar contraseña */}
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="confirmPassword">
                      Confirmar contraseña <span className="text-danger">*</span>
                    </label>
                    <input
                      id="confirmPassword" name="confirmPassword" type="password"
                      className="form-control" placeholder="Repite tu contraseña"
                      value={form.confirmPassword} onChange={handleChange} required
                    />
                  </div>

                  <div className="col-12">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="acceptTerms" required />
                      <label className="form-check-label fs--1" htmlFor="acceptTerms">
                        Acepto los{' '}
                        <a href="/terminos" target="_blank" rel="noreferrer">
                          Términos de servicio
                        </a>{' '}
                        y la{' '}
                        <a href="/privacidad" target="_blank" rel="noreferrer">
                          Política de privacidad
                        </a>
                      </label>
                    </div>
                  </div>

                  <div className="col-12">
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Registrando...
                        </>
                      ) : (
                        <>
                          <span className="fas fa-user-plus me-2"></span>
                          Crear cuenta
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            <hr className="my-4" />
            <p className="text-center fs--1 text-700">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="fw-semibold">
                Iniciar sesión
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}

export default Register;
