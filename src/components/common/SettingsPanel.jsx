import React, { useState, useEffect } from 'react';

function SettingsPanel() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isFluid, setIsFluid] = useState(JSON.parse(localStorage.getItem('isFluid')) || false);
  const [navbarStyle, setNavbarStyle] = useState(localStorage.getItem('navbarStyle') || 'card');

  useEffect(() => {
    const handleStorageChange = () => {
      setIsFluid(JSON.parse(localStorage.getItem('isFluid')) || false);
      setNavbarStyle(localStorage.getItem('navbarStyle') || 'card');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleFluidChange = () => {
    const newVal = !isFluid;
    setIsFluid(newVal);
    localStorage.setItem('isFluid', newVal);
    window.dispatchEvent(new Event('storage'));
  };

  const handleNavbarStyleChange = (style) => {
    setNavbarStyle(style);
    localStorage.setItem('navbarStyle', style);
    window.dispatchEvent(new Event('storage'));
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  }

  return (
    <>
      <a className="settings-toggle d-flex align-items-center justify-content-center shadow-lg" 
         data-bs-toggle="offcanvas" 
         data-bs-target="#settings-offcanvas" 
         style={{
           position: 'fixed', 
           right: 0, 
           top: '50%', 
           transform: 'translateY(-50%)', 
           zIndex: 1040, 
           backgroundColor: '#fff', 
           border: '1px solid #e3e6ed', 
           borderRight: 0, 
           padding: '15px 5px', 
           borderTopLeftRadius: '0.35rem', 
           borderBottomLeftRadius: '0.35rem', 
           writingMode: 'vertical-rl', 
           textOrientation: 'mixed', 
           cursor: 'pointer', 
           color: '#2c7be5', 
           fontWeight: 600, 
           textDecoration: 'none',
           transition: 'all 0.2s ease-in-out'
         }}
         onMouseOver={(e) => e.currentTarget.style.paddingRight = '10px'}
         onMouseOut={(e) => e.currentTarget.style.paddingRight = '5px'}
      >
        <span className="fas fa-cog fs--1 me-2 mb-2" style={{transform: 'rotate(90deg)'}}></span> <span className="fs--1">Mindsoftia</span>
      </a>

      <div className="offcanvas offcanvas-end" id="settings-offcanvas" tabIndex="-1" aria-labelledby="settings-offcanvas-label" style={{width: '350px'}}>
        <div className="offcanvas-header bg-shape bg-primary text-white d-flex align-items-start">
          <div className="d-flex flex-column">
            <h5 className="offcanvas-title text-white d-flex align-items-center mb-1" id="settings-offcanvas-label">
              <span className="fas fa-palette me-2 fs-0"></span> Configuración
            </h5>
            <p className="mb-0 fs--1 text-white opacity-75">Define tu propio estilo personalizado</p>
          </div>
          <div>
            <button className="btn btn-sm btn-light btn-opacity-75 bg-transparent border-white text-white me-2" style={{opacity: 0.8}} onClick={handleReset}>
              <span className="fas fa-redo-alt me-1 fs--2"></span>Restablecer
            </button>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
        </div>
        <div className="offcanvas-body scrollbar p-4">
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="fs--1 mb-0"><span className="fas fa-arrows-alt-h me-2"></span>Diseño Fluido</h6>
              <p className="fs--2 mb-0 text-500">Alternar el ancho máximo del contenedor</p>
            </div>
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" checked={isFluid} onChange={handleFluidChange} />
            </div>
          </div>

          <hr className="bg-200" />

          <h6 className="fs--1 mb-1 mt-4">Estilo del Menú Lateral</h6>
          <p className="fs--2 text-500 mb-3">Cambia entre los diferentes diseños visuales</p>
          
          <div className="row g-2">
            <div className="col-6">
              <input type="radio" className="btn-check" name="navbar-style" id="navbar-transparent" checked={navbarStyle === 'transparent'} onChange={() => handleNavbarStyleChange('transparent')} />
              <label className="btn btn-outline-primary w-100 p-2" htmlFor="navbar-transparent">
                <div className="bg-200 rounded-1 w-100 mb-2" style={{height: '60px', opacity: 0.5}}></div>
                Transparente
              </label>
            </div>
            <div className="col-6">
              <input type="radio" className="btn-check" name="navbar-style" id="navbar-inverted" checked={navbarStyle === 'inverted'} onChange={() => handleNavbarStyleChange('inverted')} />
              <label className="btn btn-outline-primary w-100 p-2" htmlFor="navbar-inverted">
                <div className="d-flex w-100 mb-2">
                  <div className="bg-dark rounded-start-1" style={{height: '60px', width: '30%'}}></div>
                  <div className="bg-200 rounded-end-1" style={{height: '60px', width: '70%', opacity: 0.5}}></div>
                </div>
                Invertido
              </label>
            </div>
            <div className="col-6">
              <input type="radio" className="btn-check" name="navbar-style" id="navbar-card" checked={navbarStyle === 'card'} onChange={() => handleNavbarStyleChange('card')} />
              <label className="btn btn-outline-primary w-100 p-2" htmlFor="navbar-card">
                <div className="d-flex w-100 mb-2 p-1 bg-200 rounded-1">
                  <div className="bg-white rounded-1 shadow-sm" style={{height: '52px', width: '30%'}}></div>
                  <div className="bg-transparent" style={{height: '52px', width: '70%'}}></div>
                </div>
                Tarjeta
              </label>
            </div>
            <div className="col-6">
              <input type="radio" className="btn-check" name="navbar-style" id="navbar-vibrant" checked={navbarStyle === 'vibrant'} onChange={() => handleNavbarStyleChange('vibrant')} />
              <label className="btn btn-outline-primary w-100 p-2" htmlFor="navbar-vibrant">
                <div className="d-flex w-100 mb-2">
                  <div className="bg-primary rounded-start-1" style={{height: '60px', width: '30%'}}></div>
                  <div className="bg-200 rounded-end-1" style={{height: '60px', width: '70%', opacity: 0.5}}></div>
                </div>
                Vibrante
              </label>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default SettingsPanel;
