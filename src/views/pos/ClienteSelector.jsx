import React, { useState, useEffect } from 'react';
import { posDB } from '../../database/localPosDb';

export default function ClienteSelector({ cliente, setCliente }) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (busqueda.length > 2) {
      setBuscando(true);
      const q = busqueda.toLowerCase();
      posDB.terceros_cache
        .filter(t => 
          (t.numero_identificacion?.toLowerCase().includes(q) || 
           t.nombres?.toLowerCase().includes(q) || 
           t.apellidos?.toLowerCase().includes(q) ||
           t.razon_social?.toLowerCase().includes(q))
        )
        .limit(5)
        .toArray()
        .then(res => {
          setResultados(res);
          setBuscando(false);
          setShowDropdown(true);
        });
    } else {
      setResultados([]);
      setShowDropdown(false);
    }
  }, [busqueda]);

  const seleccionarCliente = (c) => {
    setCliente(c);
    setBusqueda('');
    setShowDropdown(false);
  };

  const quitarCliente = () => {
    setCliente(null);
  };

  if (cliente) {
    return (
      <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded border border-200 mb-3">
        <div>
          <span className="fas fa-user-check text-primary me-2"></span>
          <span className="fw-semi-bold fs--1 text-800">
            {cliente.tipo_identificacion === 'NIT' ? cliente.razon_social : `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim()}
          </span>
          <div className="text-muted fs--2 ms-4">{cliente.numero_identificacion}</div>
        </div>
        <button className="btn btn-link text-danger p-0" onClick={quitarCliente} title="Remover cliente">
          <span className="fas fa-times-circle fs-1"></span>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-3 position-relative">
      <div className="input-group input-group-sm">
        <span className="input-group-text bg-white">
          <span className="fas fa-user text-300"></span>
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Asignar cliente (Cédula o Nombre)..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button 
          className="btn btn-primary" 
          type="button" 
          title="Agregar nuevo cliente"
          onClick={() => alert('Abriendo Modal de Creación de Cliente...')}
        >
          <span className="fas fa-plus"></span>
        </button>
      </div>
      
      {showDropdown && resultados.length > 0 && (
        <ul className="dropdown-menu show w-100 position-absolute" style={{ top: '100%', zIndex: 1050 }}>
          {resultados.map(c => (
            <li key={c.id}>
              <button 
                className="dropdown-item d-flex justify-content-between align-items-center"
                onClick={() => seleccionarCliente(c)}
              >
                <span>{c.tipo_identificacion === 'NIT' ? c.razon_social : `${c.nombres || ''} ${c.apellidos || ''}`.trim()}</span>
                <span className="badge bg-200 text-600">{c.numero_identificacion}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      
      {showDropdown && resultados.length === 0 && busqueda.length > 2 && !buscando && (
        <ul className="dropdown-menu show w-100 position-absolute text-center p-2 text-muted fs--1" style={{ top: '100%', zIndex: 1050 }}>
          Cliente no encontrado.
        </ul>
      )}
    </div>
  );
}
