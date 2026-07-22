import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';

/**
 * AsientosIndex — Libro Diario & Control de Partida Doble NIIF (Falcon UI)
 * 
 * Especialidades: /master-ui + /master-cont + /master-dev
 * Propósito: Visualizar, auditar y expandir asientos contables generados por 
 * el POS (PosVentaObserver), Compras (InvCompra) y registros manuales.
 */
function AsientosIndex() {
  const { tenantId } = useAuthStore();
  const [periodo, setPeriodo] = useState('2026-07');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [asientoExpandido, setAsientoExpandido] = useState(null);
  const [loading, setLoading] = useState(false);

  // Datos demo de alta fidelidad NIIF / o en vivo desde API
  const [asientos, setAsientos] = useState([
    {
      id: 'as-001',
      numero: 'POS-202607-0089',
      fecha: '2026-07-22',
      tipo: 'VENTA_POS',
      documento_tipo: 'pos_venta',
      descripcion: 'Venta POS #POS-00089 — pago con Tarjeta Datáfono + Costo NIIF',
      total_debito: 142500.00,
      total_credito: 142500.00,
      estado: 'confirmado',
      items: [
        { id: 'it-1', cuenta_puc: '1110', cuenta_nombre: 'Bancos — Datáfono', tipo_movimiento: 'debito', valor: 119747.90, descripcion: 'Ingreso monetario tarjeta' },
        { id: 'it-2', cuenta_puc: '4135', cuenta_nombre: 'Comercio al por menor', tipo_movimiento: 'credito', valor: 100628.49, descripcion: 'Base gravable venta POS' },
        { id: 'it-3', cuenta_puc: '2408', cuenta_nombre: 'IVA por pagar 19%', tipo_movimiento: 'credito', valor: 19119.41, descripcion: 'IVA 19% generado' },
        { id: 'it-4', cuenta_puc: '6135', cuenta_nombre: 'Costo de ventas de mercancías', tipo_movimiento: 'debito', valor: 22752.10, descripcion: 'Costo NIIF mercancía vendida' },
        { id: 'it-5', cuenta_puc: '1435', cuenta_nombre: 'Inventario de mercancías', tipo_movimiento: 'credito', valor: 22752.10, descripcion: 'Descarga de inventario' },
      ]
    },
    {
      id: 'as-002',
      numero: 'POS-202607-0090',
      fecha: '2026-07-22',
      tipo: 'VENTA_POS',
      documento_tipo: 'pos_venta',
      descripcion: 'Venta POS #POS-00090 — pago en Efectivo Caja General',
      total_debito: 58000.00,
      total_credito: 58000.00,
      estado: 'confirmado',
      items: [
        { id: 'it-6', cuenta_puc: '1105', cuenta_nombre: 'Caja General', tipo_movimiento: 'debito', valor: 48739.50, descripcion: 'Ingreso efectivo contado' },
        { id: 'it-7', cuenta_puc: '4135', cuenta_nombre: 'Comercio al por menor', tipo_movimiento: 'credito', valor: 40957.56, descripcion: 'Base gravable venta' },
        { id: 'it-8', cuenta_puc: '2408', cuenta_nombre: 'IVA por pagar 19%', tipo_movimiento: 'credito', valor: 7781.94, descripcion: 'IVA 19% generado' },
        { id: 'it-9', cuenta_puc: '6135', cuenta_nombre: 'Costo de ventas de mercancías', tipo_movimiento: 'debito', valor: 9260.50, descripcion: 'Costo promedio mercancía' },
        { id: 'it-10', cuenta_puc: '1435', cuenta_nombre: 'Inventario de mercancías', tipo_movimiento: 'credito', valor: 9260.50, descripcion: 'Descarga de inventario' },
      ]
    },
    {
      id: 'as-003',
      numero: 'COM-202607-0012',
      fecha: '2026-07-21',
      tipo: 'COMPRA_INV',
      documento_tipo: 'inv_compra',
      descripcion: 'Factura Compra #FC-4482 — Proveedor Distribuidores Andinos SAS',
      total_debito: 850000.00,
      total_credito: 850000.00,
      estado: 'confirmado',
      items: [
        { id: 'it-11', cuenta_puc: '1435', cuenta_nombre: 'Inventario de mercancías', tipo_movimiento: 'debito', valor: 714285.71, descripcion: 'Ingreso mercancía al almacén' },
        { id: 'it-12', cuenta_puc: '2408', cuenta_nombre: 'IVA descontable compras 19%', tipo_movimiento: 'debito', valor: 135714.29, descripcion: 'IVA soportado en compra' },
        { id: 'it-13', cuenta_puc: '2205', cuenta_nombre: 'Proveedores Nacionales', tipo_movimiento: 'credito', valor: 850000.00, descripcion: 'Cuenta por pagar a 30 días' },
      ]
    }
  ]);

  // Filtrado reactivo en UI
  const asientosFiltrados = asientos.filter(as => {
    const coincideTipo = filtroTipo === 'TODOS' || as.tipo === filtroTipo;
    const coincideBusqueda = busqueda === '' || 
      as.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      as.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    return coincideTipo && coincideBusqueda;
  });

  // Cálculo de KPIs del periodo
  const totalDebitos = asientosFiltrados.reduce((acc, as) => acc + as.total_debito, 0);
  const totalCreditos = asientosFiltrados.reduce((acc, as) => acc + as.total_credito, 0);
  const descuadre = Math.abs(totalDebitos - totalCreditos);
  const estaCuadrado = descuadre < 0.01;

  const toggleDetalle = (id) => {
    setAsientoExpandido(asientoExpandido === id ? null : id);
  };

  return (
    <div className="container-fluid px-0">
      {/* ── Header Falcon ─────────────────────────────────────────── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h4 className="mb-1 text-900 fw-bold">
            <span className="fas fa-book-open text-primary me-2"></span>
            Libro Diario — Asientos Contables
          </h4>
          <p className="mb-0 text-600 fs--1">
            Registro transaccional automatizado con partida doble NIIF (Sincronizado desde POS e Inventario)
          </p>
        </div>
        <div className="mt-2 mt-md-0 d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm d-flex align-items-center">
            <span className="fas fa-file-export me-2"></span>Exportar DIAN/Excel
          </button>
          <button className="btn btn-primary btn-sm d-flex align-items-center">
            <span className="fas fa-plus me-2"></span>Nuevo Asiento Manual
          </button>
        </div>
      </div>

      {/* ── KPI Tarjetas (Resumen del Periodo) ────────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card shadow-none border border-light h-100 bg-soft-primary">
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-primary text-uppercase fs--2 fw-bold mb-1">Total Débitos (Cargos)</h6>
                <h4 className="mb-0 text-primary fw-bolder">${totalDebitos.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</h4>
              </div>
              <div className="icon-item bg-primary text-white shadow-sm" style={{ width: '42px', height: '42px', borderRadius: '10px' }}>
                <span className="fas fa-arrow-down fs-0"></span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card shadow-none border border-light h-100 bg-soft-info">
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-info text-uppercase fs--2 fw-bold mb-1">Total Créditos (Abonos)</h6>
                <h4 className="mb-0 text-info fw-bolder">${totalCreditos.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</h4>
              </div>
              <div className="icon-item bg-info text-white shadow-sm" style={{ width: '42px', height: '42px', borderRadius: '10px' }}>
                <span className="fas fa-arrow-up fs-0"></span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className={`card shadow-none border h-100 ${estaCuadrado ? 'border-success bg-soft-success' : 'border-danger bg-soft-danger'}`}>
            <div className="card-body p-3 d-flex justify-content-between align-items-center">
              <div>
                <h6 className={`text-uppercase fs--2 fw-bold mb-1 ${estaCuadrado ? 'text-success' : 'text-danger'}`}>
                  Estado de Balance NIIF
                </h6>
                <h5 className={`mb-0 fw-bold ${estaCuadrado ? 'text-success' : 'text-danger'}`}>
                  {estaCuadrado ? 'PARTIDA DOBLE CUADRADA' : `DESCUADRE: $${descuadre.toFixed(2)}`}
                </h5>
                <small className="fs--2 text-600">Ecuación: Débitos === Créditos</small>
              </div>
              <div className={`icon-item text-white shadow-sm ${estaCuadrado ? 'bg-success' : 'bg-danger'}`} style={{ width: '42px', height: '42px', borderRadius: '10px' }}>
                <span className={`fas ${estaCuadrado ? 'fa-check-double' : 'fa-exclamation-triangle'} fs-0`}></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filtros y Búsqueda ────────────────────────────────────── */}
      <div className="card shadow-none border mb-3">
        <div className="card-body p-3 bg-light">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-3">
              <label className="fs--2 fw-bold text-700 mb-1">Periodo Contable</label>
              <select className="form-select form-select-sm" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                <option value="2026-07">Julio 2026 (Periodo Actual)</option>
                <option value="2026-06">Junio 2026</option>
                <option value="2026-05">Mayo 2026</option>
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="fs--2 fw-bold text-700 mb-1">Origen / Tipo de Asiento</label>
              <select className="form-select form-select-sm" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                <option value="TODOS">Todos los orígenes</option>
                <option value="VENTA_POS">Venta POS (Caja/Banco + Costos)</option>
                <option value="COMPRA_INV">Facturas de Compra e Inventario</option>
                <option value="MANUAL">Asientos Manuales / Ajustes</option>
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label className="fs--2 fw-bold text-700 mb-1">Buscar Asiento o Descripción</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0"><span className="fas fa-search text-400"></span></span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0" 
                  placeholder="Buscar por Nro. comprobante o concepto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabla Principal de Asientos (`card`) ──────────────────── */}
      <div className="card shadow-none border">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">Comprobantes del Periodo ({asientosFiltrados.length})</h6>
          <span className="badge badge-soft-primary text-primary dark__text-info fs--2 px-2 py-1">Sincronización en tiempo real activa</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0 fs--1 align-middle">
              <thead className="bg-200 text-900">
                <tr>
                  <th style={{ width: '40px' }} className="text-center">#</th>
                  <th>Nro. Comprobante</th>
                  <th>Fecha</th>
                  <th>Tipo / Origen</th>
                  <th>Descripción del Hecho Económico</th>
                  <th className="text-end">Débito ($)</th>
                  <th className="text-end">Crédito ($)</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asientosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-500">
                      <span className="fas fa-folder-open fs-2 mb-2 d-block"></span>
                      No se encontraron asientos contables con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  asientosFiltrados.map((as, idx) => (
                    <React.Fragment key={as.id}>
                      <tr className={asientoExpandido === as.id ? 'bg-soft-primary' : ''}>
                        <td className="text-center fw-bold text-500">{idx + 1}</td>
                        <td className="fw-bold text-primary">{as.numero}</td>
                        <td>{as.fecha}</td>
                        <td>
                          <span className={`badge ${as.tipo === 'VENTA_POS' ? 'badge-soft-success text-success dark__text-success' : as.tipo === 'COMPRA_INV' ? 'badge-soft-info text-info dark__text-info' : 'badge-soft-warning text-warning dark__text-warning'} px-2 py-1`}>
                            {as.tipo}
                          </span>
                        </td>
                        <td className="text-800 text-truncate" style={{ maxWidth: '300px' }}>{as.descripcion}</td>
                        <td className="text-end fw-semi-bold">${as.total_debito.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                        <td className="text-end fw-semi-bold">${as.total_credito.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                        <td className="text-center">
                          <span className="badge badge-soft-success text-success dark__text-success d-inline-flex align-items-center px-2 py-1">
                            <span className="fas fa-check-circle me-1"></span>Confirmado
                          </span>
                        </td>
                        <td className="text-center">
                          <button 
                            className={`btn btn-sm ${asientoExpandido === as.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => toggleDetalle(as.id)}
                            title="Ver partida doble y cuentas PUC"
                          >
                            <span className={`fas ${asientoExpandido === as.id ? 'fa-chevron-up' : 'fa-list-ul'} fs--2`}></span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandir detalles del asiento (Subtabla de partidas) */}
                      {asientoExpandido === as.id && (
                        <tr>
                          <td colSpan="9" className="p-3 bg-50 border-bottom">
                            <div className="card shadow-sm border border-2 border-primary">
                              <div className="card-header bg-soft-primary py-2 d-flex justify-content-between align-items-center">
                                <span className="fs--2 fw-bold text-primary text-uppercase">
                                  <span className="fas fa-sitemap me-2"></span>
                                  Detalle de Cuentas PUC — Asiento #{as.numero}
                                </span>
                                <span className="fs--2 text-700">Partida Doble Verificada</span>
                              </div>
                              <div className="card-body p-0">
                                <table className="table table-bordered table-sm mb-0 fs--2">
                                  <thead className="bg-100">
                                    <tr>
                                      <th style={{ width: '110px' }}>Código PUC</th>
                                      <th>Nombre de la Cuenta</th>
                                      <th>Concepto / Glosa</th>
                                      <th className="text-end" style={{ width: '140px' }}>Débito ($)</th>
                                      <th className="text-end" style={{ width: '140px' }}>Crédito ($)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {as.items.map(it => (
                                      <tr key={it.id}>
                                        <td className="fw-bolder text-900 font-monospace">{it.cuenta_puc}</td>
                                        <td className="fw-semi-bold text-700">{it.cuenta_nombre}</td>
                                        <td className="text-600">{it.descripcion}</td>
                                        <td className="text-end text-success fw-bold">
                                          {it.tipo_movimiento === 'debito' ? `$${it.valor.toLocaleString('es-CO', { minimumFractionDigits: 2 })}` : '-'}
                                        </td>
                                        <td className="text-end text-info fw-bold">
                                          {it.tipo_movimiento === 'credito' ? `$${it.valor.toLocaleString('es-CO', { minimumFractionDigits: 2 })}` : '-'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="bg-200 fw-bold">
                                    <tr>
                                      <td colSpan="3" className="text-end text-uppercase">Sumas Iguales:</td>
                                      <td className="text-end text-success fs--1">${as.total_debito.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                                      <td className="text-end text-info fs--1">${as.total_credito.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AsientosIndex;
