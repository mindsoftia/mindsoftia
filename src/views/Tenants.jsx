import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Tenants() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmpresas = async () => {
    try {
      // Usamos import.meta.env.VITE_API_URL o relativo
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://mindsoftia.com'}/api/empresas`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });
      setEmpresas(response.data);
    } catch (error) {
      console.error("Error cargando empresas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  return (
    <>
      <div className="card mb-3">
        <div className="card-header bg-light">
          <div className="row align-items-center">
            <div className="col">
              <h5 className="mb-0">Gestión de Empresas (Tenants)</h5>
            </div>
            <div className="col-auto">
              <button className="btn btn-primary btn-sm">
                <span className="fas fa-plus me-1"></span>Nueva Empresa
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <p className="mb-0">Aquí podrás administrar las empresas suscritas a Mindsoftia.</p>
        </div>
      </div>
      
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive scrollbar">
            <table className="table table-sm table-striped fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th>Nombre de la Empresa</th>
                  <th>RUC / NIT</th>
                  <th>Email de Contacto</th>
                  <th className="text-center">Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-3">Cargando...</td></tr>
                ) : empresas.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-3">No hay empresas registradas.</td></tr>
                ) : (
                  empresas.map((empresa) => (
                    <tr key={empresa.id}>
                      <td className="align-middle fw-semi-bold">{empresa.nombre}</td>
                      <td className="align-middle">{empresa.ruc_nit || '-'}</td>
                      <td className="align-middle">{empresa.email || '-'}</td>
                      <td className="align-middle text-center">
                        {empresa.is_active ? (
                          <span className="badge badge rounded-pill d-block p-1 fs--2 badge-subtle-success">Activo</span>
                        ) : (
                          <span className="badge badge rounded-pill d-block p-1 fs--2 badge-subtle-danger">Inactivo</span>
                        )}
                      </td>
                      <td className="align-middle text-end">
                        <button className="btn btn-sm btn-outline-primary me-2">Editar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Tenants;
