import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    industria: '',
    moneda: 'COP',
    telefono: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 1. Obtener la sesión activa de Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión primero.');
      }

      const token = session.access_token;
      
      // 2. Enviar los datos al Backend Laravel
      const response = await fetch(`${import.meta.env.VITE_API_URL}/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al crear la empresa');
      }

      // Éxito: Simular un pequeño delay de UI para que el usuario vea el spinner de éxito
      setTimeout(() => {
        setIsLoading(false);
        navigate('/');
      }, 1500);

    } catch (error) {
      console.error('Onboarding Error:', error);
      alert('Hubo un problema: ' + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center p-0">
      <div className="row g-0 w-100 h-100">
        
        {/* Lado Izquierdo: Branding y Progreso */}
        <div className="col-lg-5 col-xl-4 bg-primary text-white d-flex flex-column justify-content-between p-5" style={{ minHeight: '100vh' }}>
          <div>
            <div className="d-flex align-items-center mb-5">
              <span className="fas fa-brain fs-3 me-2 text-white"></span>
              <span className="fs-2 fw-bolder font-sans-serif">Mindsoftia</span>
            </div>
            <h3 className="text-white mb-3">Configuremos tu entorno de trabajo</h3>
            <p className="text-primary-100">En solo dos pasos prepararemos tu infraestructura en la nube, aislada, segura y lista para operar.</p>
          </div>
          
          {/* Indicadores de Pasos */}
          <div className="mb-5">
            <div className={`d-flex align-items-center mb-4 ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
              <div className="rounded-circle d-flex align-items-center justify-content-center border border-white" style={{ width: '35px', height: '35px', backgroundColor: step > 1 ? 'white' : 'transparent', color: step > 1 ? '#2c7be5' : 'white' }}>
                {step > 1 ? <span className="fas fa-check"></span> : 1}
              </div>
              <div className="ms-3">
                <h6 className="text-white mb-0">Información General</h6>
                <small className="text-primary-100">Datos principales de la empresa</small>
              </div>
            </div>
            
            <div className={`d-flex align-items-center mb-4 ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
              <div className="rounded-circle d-flex align-items-center justify-content-center border border-white" style={{ width: '35px', height: '35px', backgroundColor: step > 2 ? 'white' : 'transparent', color: step > 2 ? '#2c7be5' : 'white' }}>
                {step > 2 ? <span className="fas fa-check"></span> : 2}
              </div>
              <div className="ms-3">
                <h6 className="text-white mb-0">Configuración Fiscal</h6>
                <small className="text-primary-100">Industria y Parámetros</small>
              </div>
            </div>

            <div className={`d-flex align-items-center ${step === 3 ? 'opacity-100' : 'opacity-50'}`}>
              <div className="rounded-circle d-flex align-items-center justify-content-center border border-white" style={{ width: '35px', height: '35px', backgroundColor: step === 3 ? 'white' : 'transparent', color: step === 3 ? '#2c7be5' : 'white' }}>
                3
              </div>
              <div className="ms-3">
                <h6 className="text-white mb-0">¡Listo para iniciar!</h6>
                <small className="text-primary-100">Generando tu base de datos</small>
              </div>
            </div>
          </div>
          
          <p className="fs--2 text-primary-200 mb-0">© 2026 Mindsoftia SaaS. Cifrado de extremo a extremo.</p>
        </div>

        {/* Lado Derecho: Formulario Wizard */}
        <div className="col-lg-7 col-xl-8 d-flex align-items-center justify-content-center p-5">
          <div className="w-100" style={{ maxWidth: '600px' }}>
            
            <form onSubmit={handleFinish}>
              {/* PASO 1 */}
              {step === 1 && (
                <div className="fade-in">
                  <h3 className="mb-4">Información de tu Empresa</h3>
                  <div className="mb-4">
                    <label className="form-label" htmlFor="nombre">Razón Social o Nombre del Negocio <span className="text-danger">*</span></label>
                    <input 
                      className="form-control form-control-lg" 
                      id="nombre" 
                      name="nombre"
                      type="text" 
                      placeholder="Ej. Mindsoftia Corp S.A.S" 
                      value={formData.nombre}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label" htmlFor="nit">Número de Identificación Tributaria (NIT/RUT) <span className="text-danger">*</span></label>
                    <input 
                      className="form-control form-control-lg" 
                      id="nit" 
                      name="nit"
                      type="text" 
                      placeholder="Sin dígitos de verificación" 
                      value={formData.nit}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="mb-5">
                    <label className="form-label" htmlFor="telefono">Teléfono Corporativo</label>
                    <input 
                      className="form-control form-control-lg" 
                      id="telefono" 
                      name="telefono"
                      type="tel" 
                      placeholder="+57 300 000 0000" 
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="d-flex justify-content-end">
                    <button type="button" className="btn btn-primary btn-lg px-5" onClick={handleNext} disabled={!formData.nombre || !formData.nit}>
                      Siguiente Paso <span className="fas fa-chevron-right ms-2"></span>
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 2 */}
              {step === 2 && (
                <div className="fade-in">
                  <h3 className="mb-4">Configuración Fiscal y Contable</h3>
                  <p className="text-600 mb-4">Esta información nos ayuda a precargar el Plan Único de Cuentas (PUC) y las normativas correctas para tu negocio.</p>
                  
                  <div className="mb-4">
                    <label className="form-label" htmlFor="industria">Sector / Industria</label>
                    <select 
                      className="form-select form-select-lg" 
                      id="industria" 
                      name="industria"
                      value={formData.industria}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona tu industria...</option>
                      <option value="comercio">Comercio al por mayor y detal</option>
                      <option value="servicios">Servicios Profesionales / Consultoría</option>
                      <option value="tecnologia">Tecnología y Software</option>
                      <option value="salud">Salud y Estética</option>
                      <option value="restaurante">Gastronomía y Restaurantes</option>
                      <option value="otro">Otro sector</option>
                    </select>
                  </div>

                  <div className="mb-5">
                    <label className="form-label" htmlFor="moneda">Moneda Principal</label>
                    <select 
                      className="form-select form-select-lg" 
                      id="moneda" 
                      name="moneda"
                      value={formData.moneda}
                      onChange={handleChange}
                    >
                      <option value="COP">Peso Colombiano (COP)</option>
                      <option value="USD">Dólar Estadounidense (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="MXN">Peso Mexicano (MXN)</option>
                    </select>
                  </div>

                  <div className="d-flex justify-content-between">
                    <button type="button" className="btn btn-light btn-lg px-4" onClick={handlePrev}>
                      <span className="fas fa-chevron-left me-2"></span> Volver
                    </button>
                    <button type="button" className="btn btn-primary btn-lg px-5" onClick={handleNext}>
                      Finalizar Configuración <span className="fas fa-check ms-2"></span>
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3: CARGANDO */}
              {step === 3 && (
                <div className="text-center fade-in py-5">
                  <div className="spinner-border text-primary mb-4" style={{ width: '4rem', height: '4rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h3 className="mb-2">Construyendo tu ecosistema...</h3>
                  <p className="text-600 mb-0">Estamos aprovisionando tu base de datos aislada, enrutando el almacenamiento seguro y configurando tu Inteligencia Artificial.</p>
                  <p className="text-500 fs--1 mt-3">Por favor no cierres esta ventana.</p>
                  
                  {/* Botón oculto real que se dispara automáticamente o le podemos dar click si queremos simularlo sin auto-submit */}
                  <div className="mt-4">
                    <button type="submit" className="btn btn-success px-5" disabled={isLoading}>
                      {isLoading ? 'Conectando con Supabase...' : 'Ir a mi Panel de Control'}
                    </button>
                  </div>
                </div>
              )}
            </form>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingWizard;
