import React, { useState, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

function Dashboard() {
  const { tenantId, user } = useAuthStore();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener las métricas desde el backend (para el Tenant actual)
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const tid = tenantId || user?.app_metadata?.empresa_id || user?.app_metadata?.tenant_id;
      const response = await api.get('/dashboard/metrics', {
        headers: { 'X-Tenant-ID': tid }
      });
      if (response.data.success) {
        setMetrics(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener métricas del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [tenantId]);

  const currentDate = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="pb-5">
      {/* Falcon Welcome Widget */}
      <div className="card shadow-none border mb-4 mt-3 bg-light overflow-hidden">
        {/* Background graphic (optional if needed) */}
        <div className="bg-holder bg-card" style={{ backgroundImage: 'url(../img/illustrations/corner-3.png)', opacity: 0.3 }}></div>
        <div className="card-body position-relative">
          <div className="row flex-between-center g-3">
            <div className="col-auto">
              <h5 className="text-600 fw-normal mb-1">Bienvenido a</h5>
              <h2 className="text-primary fw-bold mb-0">
                {loading ? 'Cargando...' : metrics?.empresa_nombre || 'Tu Empresa'}
              </h2>
            </div>
            <div className="col-auto">
              <div className="d-flex align-items-center">
                <span className="text-500 fs--1 me-2 fw-semi-bold">Datos de hoy:</span>
                <div className="input-group input-group-sm border rounded bg-white shadow-sm" style={{ width: '220px' }}>
                  <span className="input-group-text bg-white border-0"><span className="fas fa-calendar-alt text-primary"></span></span>
                  <input type="text" className="form-control border-0 fw-semi-bold text-700 bg-white" value={currentDate} readOnly />
                </div>
                <button className="btn btn-sm btn-falcon-default ms-2 shadow-sm" onClick={fetchMetrics} disabled={loading} title="Actualizar">
                  <span className={`fas fa-sync-alt ${loading ? 'fa-spin text-primary' : 'text-primary'}`}></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILA DE KPIs (Módulos) */}
      <div className="row g-3 mb-4">
        {/* POS (Ventas Hoy) */}
        <div className="col-sm-6 col-md-3">
          <div className="card h-100 shadow-sm border-0 border-top border-3 border-success">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h6 className="fs--1 text-700 mb-0">POS (Punto de Venta)</h6>
                <span className="fas fa-cash-register text-success"></span>
              </div>
              <h3 className="mb-0 text-success fw-bold">
                ${loading ? '...' : (metrics?.kpis?.ventas_hoy || 0).toLocaleString()}
              </h3>
              <p className="fs--2 text-500 mb-0">
                {loading ? '...' : (metrics?.kpis?.tickets_hoy || 0)} tickets emitidos hoy
              </p>
            </div>
          </div>
        </div>

        {/* Terceros / Clientes */}
        <div className="col-sm-6 col-md-3">
          <div className="card h-100 shadow-sm border-0 border-top border-3 border-primary">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h6 className="fs--1 text-700 mb-0">Clientes / Terceros</h6>
                <span className="fas fa-users text-primary"></span>
              </div>
              <h3 className="mb-0 text-primary fw-bold">
                {loading ? '...' : (metrics?.kpis?.clientes_activos || 0)}
              </h3>
              <p className="fs--2 text-500 mb-0">Terceros registrados</p>
            </div>
          </div>
        </div>

        {/* Contabilidad */}
        <div className="col-sm-6 col-md-3">
          <div className="card h-100 shadow-sm border-0 border-top border-3 border-warning">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h6 className="fs--1 text-700 mb-0">Contabilidad</h6>
                <span className="fas fa-file-invoice-dollar text-warning"></span>
              </div>
              <h3 className="mb-0 text-warning fw-bold">
                {loading ? '...' : (metrics?.kpis?.asientos_contables || 0)}
              </h3>
              <p className="fs--2 text-500 mb-0">Asientos registrados</p>
            </div>
          </div>
        </div>

        {/* PUC */}
        <div className="col-sm-6 col-md-3">
          <div className="card h-100 shadow-sm border-0 border-top border-3 border-info">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h6 className="fs--1 text-700 mb-0">Plan Único de Cuentas</h6>
                <span className="fas fa-book text-info"></span>
              </div>
              <h3 className="mb-0 text-info fw-bold">
                {loading ? '...' : (metrics?.kpis?.cuentas_puc || 0)}
              </h3>
              <p className="fs--2 text-500 mb-0">Cuentas activas (PUC)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Tabla Actividad Reciente */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Actividad Reciente (POS)</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm table-striped table-hover mb-0 fs--1">
                  <thead className="bg-200 text-900">
                    <tr>
                      <th className="py-2 ps-3">Ticket</th>
                      <th className="py-2">Total</th>
                      <th className="py-2">Estado</th>
                      <th className="py-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-500">
                          <span className="fas fa-spinner fa-spin me-2"></span>Cargando actividad...
                        </td>
                      </tr>
                    ) : metrics?.ultimas_ventas?.length > 0 ? (
                      metrics.ultimas_ventas.map((venta) => (
                        <tr key={venta.id}>
                          <td className="align-middle ps-3 fw-semi-bold text-primary">{venta.ticket}</td>
                          <td className="align-middle fw-bold">${Number(venta.total).toLocaleString()}</td>
                          <td className="align-middle">
                            <span className="badge badge-soft-success">{venta.estado}</span>
                          </td>
                          <td className="align-middle text-500">{venta.fecha}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-5 text-500">
                          <span className="fas fa-receipt fs-3 d-block mb-2 text-300"></span>
                          No hay ventas registradas recientemente.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">Inventario Rápido</h5>
            </div>
            <div className="card-body p-4 text-center">
              <span className="fas fa-boxes text-primary fs-4 mb-3"></span>
              <h3 className="fw-bold mb-1">{loading ? '...' : (metrics?.kpis?.total_productos || 0)}</h3>
              <p className="text-500 fs--1 mb-4">Productos activos en catálogo</p>
              
              <button className="btn btn-outline-primary btn-sm w-100">Ir al Inventario</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
