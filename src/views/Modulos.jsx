import React, { useState } from 'react';

function Modulos() {
  const [modules, setModules] = useState([
    {
      id: 'dian',
      name: 'Facturación Electrónica DIAN',
      category: 'ERP Mindsoftia',
      description: 'Emisión y recepción de documentos electrónicos validados directamente por la DIAN.',
      icon: 'fas fa-file-invoice-dollar',
      color: 'primary',
      active: true
    },
    {
      id: 'nomina',
      name: 'Nómina Electrónica',
      category: 'ERP Mindsoftia',
      description: 'Transmisión del documento soporte de pago de nómina electrónica a la DIAN.',
      icon: 'fas fa-users',
      color: 'info',
      active: true
    },
    {
      id: 'comercial-pos',
      name: 'Gestión Comercial & POS',
      category: 'ERP Mindsoftia',
      description: 'Gestión de clientes (CRM), control de inventario, facturación POS y embudos de ventas integrados.',
      icon: 'fas fa-store',
      color: 'success',
      active: true
    },
    {
      id: 'contabilidad',
      name: 'Contabilidad NIIF',
      category: 'ERP Mindsoftia',
      description: 'Gestión de libros contables, PUC dinámico, balances y estados financieros.',
      icon: 'fas fa-calculator',
      color: 'warning',
      active: true
    },
    {
      id: 'ai-n8n',
      name: 'Inteligencia Artificial',
      category: 'Automatización',
      description: 'Módulo de IA integrado con n8n para el procesamiento y orquestación de múltiples solicitudes.',
      icon: 'fas fa-brain',
      color: 'secondary',
      active: false
    },
    {
      id: 'knowledge-base',
      name: 'Base de Conocimiento',
      category: 'Soporte & Ayuda',
      description: 'Plataforma de aprendizaje y manuales de usuario interactivos para dominar todas las herramientas del sistema.',
      icon: 'fas fa-book-open',
      color: 'info',
      active: true
    }
  ]);

  const toggleModule = (id) => {
    setModules(modules.map(mod => mod.id === id ? { ...mod, active: !mod.active } : mod));
  };

  return (
    <>
      <div className="card mb-3">
        <div className="card-header bg-light">
          <div className="row flex-between-center">
            <div className="col-auto">
              <h5 className="mb-0">
                <span className="fas fa-cubes me-2 text-primary"></span>App Store de Módulos
              </h5>
              <p className="fs--1 text-500 mb-0 mt-1">
                Catálogo global del sistema. Gestiona y configura el comportamiento de los grandes submódulos de la arquitectura.
              </p>
            </div>
            <div className="col-auto">
              <button className="btn btn-falcon-primary btn-sm">
                <span className="fas fa-sync-alt me-1"></span>Sincronizar Catálogo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {modules.map((mod) => (
          <div className="col-sm-6 col-lg-4" key={mod.id}>
            <div className={`card h-100 border ${mod.active ? 'border-primary' : ''}`}>
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-start mb-3">
                  <div className={`icon-item icon-item-lg bg-${mod.color}-subtle shadow-none me-3 flex-shrink-0`}>
                    <span className={`${mod.icon} text-${mod.color} fs-1`}></span>
                  </div>
                  <div className="flex-1">
                    <h5 className="mb-1 fs-0">{mod.name}</h5>
                    <span className={`badge rounded-pill badge-subtle-${mod.category.includes('Marketing') ? 'danger' : 'primary'} fs--2`}>
                      {mod.category}
                    </span>
                  </div>
                </div>
                <p className="fs--1 text-600 mb-4 flex-1">{mod.description}</p>
                <div className="d-flex justify-content-between align-items-center mt-auto border-top pt-3">
                  <div className="form-check form-switch mb-0">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id={`switch-${mod.id}`} 
                      checked={mod.active}
                      onChange={() => toggleModule(mod.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label 
                      className={`form-check-label fs--1 ${mod.active ? 'text-primary fw-bold' : 'text-500'}`} 
                      htmlFor={`switch-${mod.id}`}
                      style={{ cursor: 'pointer' }}
                    >
                      {mod.active ? 'Módulo Activo' : 'Módulo Inactivo'}
                    </label>
                  </div>
                  <button className={`btn btn-sm ${mod.active ? 'btn-falcon-primary' : 'btn-falcon-default'}`}>
                    <span className="fas fa-cog me-1"></span>Ajustes
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Modulos;
