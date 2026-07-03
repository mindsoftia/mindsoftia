import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { posDB } from '../../database/localPosDb';
import { posSyncService } from '../../services/posSyncService';
import useAuthStore from '../../store/authStore';

function FacturasCompraList() {
  const { tenantId } = useAuthStore();
  const navigate = useNavigate();
  
  const facturas = useLiveQuery(
    () => posDB.facturas_compra.toArray(), 
    []
  );

  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    await posSyncService.syncFacturasCompraPendientes();
    // Podríamos también sincronizar el catálogo o proveedores si es necesario.
    setLoading(false);
  };

  return (
    <>
      <div className="card shadow-none border mb-3">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Facturas de Compra</h5>
          <div>
            <button className="btn btn-outline-secondary btn-sm me-2" onClick={handleSync} disabled={loading}>
              <span className={`fas fa-sync-alt me-1 ${loading ? 'fa-spin' : ''}`}></span> Sincronizar Pendientes
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/compras/facturas/nueva')}>
              <span className="fas fa-plus me-1"></span>Nueva Factura
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0 fs--1">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="sort pe-1 align-middle white-space-nowrap">Nro. Factura</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Fecha Emisión</th>
                  <th className="sort pe-1 align-middle white-space-nowrap text-end">Total</th>
                  <th className="sort pe-1 align-middle white-space-nowrap text-center">Estado Sync</th>
                </tr>
              </thead>
              <tbody className="list">
                {facturas?.length > 0 ? (
                  facturas.map(fac => (
                    <tr key={fac.id}>
                      <td className="align-middle fw-bold">{fac.numero_factura || 'Borrador'}</td>
                      <td className="align-middle">{fac.fecha_emision}</td>
                      <td className="align-middle text-end">${Number(fac.total || 0).toLocaleString()}</td>
                      <td className="align-middle text-center">
                        {fac.sync_status === 'synced' ? (
                          <span className="badge badge-subtle-success"><i className="fas fa-check"></i> Nube</span>
                        ) : (
                          <span className="badge badge-subtle-warning"><i className="fas fa-clock"></i> Local</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      No hay facturas de compra registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default FacturasCompraList;
