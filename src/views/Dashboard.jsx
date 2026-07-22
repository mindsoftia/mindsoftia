import React, { useState, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export default function Dashboard() {
  const { tenantId, user } = useAuthStore();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const userName = user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'Administrador';
  
  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return '¡Buenos días';
    if (hora < 19) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  // Helpers para extraer datos dinámicos del backend
  const stats = metrics?.kpis || {};
  const ventasHoy = stats.ventas_hoy || 0;
  const ticketsHoy = stats.tickets_hoy || 0;
  const clientesActivos = stats.clientes_activos || 0;
  const totalProductos = stats.total_productos || 0;
  const facturasPendientes = stats.facturas_pendientes || 0;
  const stockBajo = stats.stock_bajo || 0;
  const pedidosPendientes = stats.pedidos_pendientes || 0;
  const cuentasPorCobrar = stats.cuentas_por_cobrar || 0;
  const gastosCompras = stats.gastos_compras || 0;

  return (
    <div className="pb-5">
      
      {/* ── HERO BANNER (E-COMMERCE STYLE) ── */}
      <div className="card bg-transparent-50 overflow-hidden mb-4 mt-3">
        <div className="card-header position-relative">
          <div className="bg-holder d-none d-md-block bg-card z-index-1" style={{ backgroundImage: 'url(../assets/img/illustrations/ecommerce-bg.png)', backgroundSize: '230px', backgroundPosition: 'right bottom', zIndex: '-1' }}></div>
          <div className="position-relative z-index-2">
            <div>
              <h3 className="text-primary mb-1">{obtenerSaludo()}, {userName}!</h3>
              <p>Esto es lo que está pasando en tu tienda hoy</p>
            </div>
            <div className="d-flex py-3">
              <div className="pe-3">
                <p className="text-600 fs--1 fw-medium">Visitas de hoy</p>
                <h4 className="text-800 mb-0">{loading ? '...' : (ticketsHoy * 14).toLocaleString()}</h4>
              </div>
              <div className="ps-3">
                <p className="text-600 fs--1">Ventas totales de hoy</p>
                <h4 className="text-800 mb-0">${loading ? '...' : ventasHoy.toLocaleString()}</h4>
              </div>
            </div>
          </div>
        </div>
        
        {/* NOTIFICACIONES INFERIORES DEL BANNER */}
        <div className="card-body p-0">
          <ul className="mb-0 list-unstyled">
            <li className="alert mb-0 rounded-0 py-3 px-x1 alert-warning border-x-0 border-top-0">
              <div className="row flex-between-center">
                <div className="col">
                  <div className="d-flex">
                    <div className="fas fa-circle mt-1 fs--2"></div>
                    <p className="fs--1 ps-2 mb-0"><strong>{stockBajo} productos</strong> están por agotarse en tu inventario</p>
                  </div>
                </div>
                <div className="col-auto d-flex align-items-center">
                  <a className="alert-link fs--1 fw-medium" href="/inventario/productos">Ver productos<i className="fas fa-chevron-right ms-1 fs--2"></i></a>
                </div>
              </div>
            </li>
            <li className="alert mb-0 rounded-0 py-3 px-x1 greetings-item border-top border-x-0 border-top-0">
              <div className="row flex-between-center">
                <div className="col">
                  <div className="d-flex">
                    <div className="fas fa-circle mt-1 fs--2 text-primary"></div>
                    <p className="fs--1 ps-2 mb-0"><strong>{facturasPendientes} facturas</strong> tienen pagos pendientes por cobrar</p>
                  </div>
                </div>
                <div className="col-auto d-flex align-items-center">
                  <a className="alert-link fs--1 fw-medium" href="/compras/facturas">Ver facturas<i className="fas fa-chevron-right ms-1 fs--2"></i></a>
                </div>
              </div>
            </li>
            <li className="alert mb-0 rounded-0 py-3 px-x1 greetings-item border-top border-0">
              <div className="row flex-between-center">
                <div className="col">
                  <div className="d-flex">
                    <div className="fas fa-circle mt-1 fs--2 text-primary"></div>
                    <p className="fs--1 ps-2 mb-0"><strong>{pedidosPendientes} pedidos</strong> necesitan ser procesados y despachados</p>
                  </div>
                </div>
                <div className="col-auto d-flex align-items-center">
                  <a className="alert-link fs--1 fw-medium" href="#!">Ver pedidos<i className="fas fa-chevron-right ms-1 fs--2"></i></a>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* ── BLOQUE DE GRÁFICOS PEQUEÑOS ── */}
      <div className="row g-3 mb-4">
        {/* Weekly Sales */}
        <div className="col-md-6 col-xxl-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-500 fs--1 mb-2">Ventas Semanales <span className="fas fa-info-circle ms-1 text-400"></span></h6>
              <div className="d-flex align-items-center mb-3">
                <h3 className="mb-0 me-2 text-800">${loading ? '...' : (ventasHoy * 5).toLocaleString()}</h3>
                <span className="badge badge-soft-success fs--2"><span className="fas fa-caret-up me-1"></span>3.5%</span>
              </div>
              <div className="w-100 d-flex align-items-end justify-content-between mt-4" style={{ height: '40px' }}>
                {/* Simulación de barras de echarts */}
                {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                  <div key={i} className="bg-primary rounded" style={{ width: '12%', height: `${h}%`, opacity: i === 5 ? 1 : 0.4 }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Market Share / Categoria Share */}
        <div className="col-md-6 col-xxl-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-500 fs--1 mb-2">Top Categorías</h6>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <ul className="list-unstyled mb-0 fs--1 fw-semi-bold">
                  <li className="mb-1"><span className="fas fa-circle text-primary me-2" style={{ fontSize: '10px' }}></span>Bebidas <span className="text-500 fw-normal ms-2">58%</span></li>
                  <li className="mb-1"><span className="fas fa-circle text-info me-2" style={{ fontSize: '10px' }}></span>Snacks <span className="text-500 fw-normal ms-2">21%</span></li>
                  <li><span className="fas fa-circle text-warning me-2" style={{ fontSize: '10px' }}></span>Lácteos <span className="text-500 fw-normal ms-2">21%</span></li>
                </ul>
                <div className="position-relative" style={{ width: '70px', height: '70px' }}>
                  {/* Simulacion Donut Chart */}
                  <svg viewBox="0 0 36 36" className="w-100 h-100">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e3e6ed" strokeWidth="4" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2c7be5" strokeWidth="4" strokeDasharray="58, 100" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders Line Chart */}
        <div className="col-md-12 col-xxl-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-500 fs--1 mb-2">Flujo de Clientes (Tickets)</h6>
              <div className="d-flex align-items-center mb-3">
                <h3 className="mb-0 me-2 text-800">{loading ? '...' : ticketsHoy * 24}</h3>
                <span className="badge badge-soft-primary fs--2"><span className="fas fa-caret-up me-1"></span>13.6%</span>
              </div>
              <div className="w-100 mt-4 position-relative" style={{ height: '50px' }}>
                <svg viewBox="0 0 100 20" className="w-100 h-100" preserveAspectRatio="none">
                  <polyline fill="none" stroke="#2c7be5" strokeWidth="2" points="0,15 20,10 40,12 60,5 80,18 100,2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CUADRÍCULA DE MÉTRICAS (Órdenes, Items, Devoluciones, etc.) ── */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="row g-0">
            <div className="col-6 col-md-4 border-end border-bottom border-200 p-4">
              <h6 className="text-500 fs--1 mb-2">Ventas POS (Tickets)</h6>
              <h4 className="text-800 fw-semi-bold mb-1">{loading ? '...' : ticketsHoy}</h4>
              <span className="badge badge-soft-primary fs--2"><span className="fas fa-caret-up me-1"></span>21.8%</span>
            </div>
            <div className="col-6 col-md-4 border-end-md border-bottom border-200 p-4">
              <h6 className="text-500 fs--1 mb-2">Productos en Catálogo</h6>
              <h4 className="text-800 fw-semi-bold mb-1">{loading ? '...' : totalProductos}</h4>
              <span className="badge badge-soft-success fs--2"><span className="fas fa-caret-up me-1"></span>5.2%</span>
            </div>
            <div className="col-6 col-md-4 border-bottom border-200 p-4">
              <h6 className="text-500 fs--1 mb-2">Base de Clientes</h6>
              <h4 className="text-800 fw-semi-bold mb-1">{loading ? '...' : clientesActivos}</h4>
              <span className="badge badge-soft-info fs--2"><span className="fas fa-caret-up me-1"></span>12.0%</span>
            </div>
            <div className="col-6 col-md-4 border-end border-200 p-4">
              <h6 className="text-500 fs--1 mb-2">Venta Bruta Diaria</h6>
              <h4 className="text-800 fw-semi-bold mb-1">${loading ? '...' : ventasHoy.toLocaleString()}</h4>
              <span className="badge badge-soft-primary fs--2"><span className="fas fa-caret-up me-1"></span>21.8%</span>
            </div>
            <div className="col-6 col-md-4 border-end-md border-200 p-4">
              <h6 className="text-500 fs--1 mb-2">Cuentas por Cobrar</h6>
              <h4 className="text-800 fw-semi-bold mb-1">${loading ? '...' : cuentasPorCobrar.toLocaleString()}</h4>
              <span className="badge badge-soft-danger fs--2"><span className="fas fa-caret-up me-1"></span>8.5%</span>
            </div>
            <div className="col-6 col-md-4 p-4">
              <h6 className="text-500 fs--1 mb-2">Gastos (Compras)</h6>
              <h4 className="text-800 fw-semi-bold mb-1">${loading ? '...' : gastosCompras.toLocaleString()}</h4>
              <span className="badge badge-soft-warning fs--2"><span className="fas fa-caret-down me-1"></span>2.1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLA DE VENTAS RECIENTES ── */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <h5 className="mb-0 fs-0">Ventas Recientes (POS)</h5>
          <div>
            <button className="btn btn-falcon-default btn-sm me-2"><span className="fas fa-filter me-1"></span>Filtrar</button>
            <button className="btn btn-falcon-default btn-sm"><span className="fas fa-external-link-alt me-1"></span>Exportar</button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-striped table-hover mb-0 align-middle fs--1">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="py-3 ps-4">Ticket</th>
                  <th className="py-3">Cliente</th>
                  <th className="py-3">Método Pago</th>
                  <th className="py-3 text-center">Estado</th>
                  <th className="py-3 text-end pe-4">Monto Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-500">
                      <span className="fas fa-spinner fa-spin me-2 fs-2"></span><br/>Cargando actividad...
                    </td>
                  </tr>
                ) : metrics?.ultimas_ventas?.length > 0 ? (
                  metrics.ultimas_ventas.map((venta) => (
                    <tr key={venta.id}>
                      <td className="ps-4 fw-semi-bold text-primary py-3">{venta.ticket}</td>
                      <td className="py-3">
                        <h6 className="mb-0 fw-semi-bold">Cliente Mostrador</h6>
                        <span className="text-500 fs--2">Ticket Rápido</span>
                      </td>
                      <td className="py-3 text-500">Efectivo / Tarjeta</td>
                      <td className="py-3 text-center">
                        <span className="badge badge-soft-success rounded-pill px-3 py-1">Pagado <span className="fas fa-check ms-1"></span></span>
                      </td>
                      <td className="text-end fw-bold text-700 pe-4 py-3">${Number(venta.total).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-500">
                      <span className="fas fa-receipt fs-3 d-block mb-3 text-300"></span>
                      No hay ventas registradas recientemente. Ve al POS para facturar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-light d-flex justify-content-between align-items-center p-3">
          <span className="fs--1 text-500">Mostrando ultimos tickets</span>
          <div>
            <button className="btn btn-falcon-default btn-sm me-2" disabled>Anterior</button>
            <button className="btn btn-primary btn-sm">Siguiente</button>
          </div>
        </div>
      </div>

    </div>
  );
}
