/**
 * ProductoGrid.jsx — Grilla de productos del POS.
 * Estilos: Falcon / Bootstrap 5 nativo.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { posDB } from '../../database/localPosDb';
import api from '../../services/api';

export default function ProductoGrid({ onAgregar }) {
  const [busqueda, setBusqueda]   = useState('');
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [clickedId, setClickedId] = useState(null);
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 24;

  // Cargar productos: primero del caché local, luego nube
  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        // 1. Caché local (instantáneo)
        const local = await posDB.productos_cache.toArray();
        if (local.length) setProductos(local);

        // 2. Actualizar desde la nube en background
        const { data } = await api.get('/inventario/productos');
        const lista = Array.isArray(data) ? data : data.data ?? [];
        setProductos(lista);
        await posDB.productos_cache.bulkPut(lista);
      } catch {
        // Si falla la nube, los del caché local siguen disponibles
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const filtrados = useCallback(() => {
    let result = productos;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      result = productos.filter(p =>
        p.nombre?.toLowerCase().includes(q) ||
        p.referencia?.toLowerCase().includes(q) ||
        p.codigo_barras?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [busqueda, productos])();

  // Resetear página al buscar
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);
  const productosPaginados = filtrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const handleClick = (producto) => {
    if (producto.estado === false) return;
    setClickedId(producto.id);
    onAgregar(producto);
    setTimeout(() => setClickedId(null), 350);
  };

  return (
    <div>
      {/* Pestañas de Categorías */}
      <div className="d-flex gap-2 overflow-auto pb-2 mb-3" style={{ whiteSpace: 'nowrap' }}>
        <button className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm fs--2">Todos</button>
        <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 bg-white shadow-sm border-0 fs--2">Bebidas</button>
        <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 bg-white shadow-sm border-0 fs--2">Snacks</button>
        <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 bg-white shadow-sm border-0 fs--2">Electrónica</button>
        <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 bg-white shadow-sm border-0 fs--2">Servicios</button>
      </div>

      {/* Buscador */}
      <div className="mb-2">
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-100">
            <span className="fas fa-search text-muted"></span>
          </span>
          <input
            id="pos-busqueda"
            type="text"
            className="form-control"
            placeholder="Buscar por nombre, código o referencia..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            autoComplete="off"
            autoFocus
          />
          {busqueda && (
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setBusqueda('')}>
              <span className="fas fa-times"></span>
            </button>
          )}
        </div>
        <div className="text-muted fs--2 mt-1 ms-1">
          {filtrados.length} producto{filtrados.length !== 1 ? 's' : ''}
          {busqueda && ` encontrado${filtrados.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Grid de productos */}
      {cargando ? (
        <div className="text-center py-5 text-muted">
          <span className="spinner-border spinner-border-sm me-2"></span>Cargando productos...
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <span className="fas fa-box-open fa-2x mb-2 d-block"></span>
          {busqueda ? 'No se encontraron productos' : 'Sin productos en inventario'}
          {!busqueda && (
            <div className="mt-2 fs--1">
              Ve a <strong>Inventario</strong> para agregar productos
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="pos-productos-grid">
            {productosPaginados.map(producto => (
              <button
                key={producto.id}
                className={`pos-producto-card ${clickedId === producto.id ? 'clicked' : ''}`}
                disabled={producto.estado === false}
                onClick={() => handleClick(producto)}
                title={producto.nombre}
              >
                {/* Icono */}
                <div className="text-center mb-1">
                  <span
                    className="fas fa-cube"
                    style={{ fontSize: '1.2rem', color: '#2c7be5' }}
                  ></span>
                </div>

                {/* Nombre */}
                <div
                  className="fw-semi-bold text-800 fs--2 text-center"
                  style={{
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: '1.2',
                    minHeight: '2.4em',
                  }}
                >
                  {producto.nombre}
                </div>

                {/* Precio */}
                <div className="text-center mt-1">
                  <span className="fw-bold text-success fs--2">
                    ${parseFloat(producto.precio_venta_1 || producto.precio_venta || 0).toLocaleString('es-CO')}
                  </span>
                </div>

                {/* Referencia / código */}
                {producto.codigo_sku && (
                  <div className="text-muted text-center fs--2 mt-1">
                    {producto.codigo_sku}
                  </div>
                )}

                {/* Badge estado */}
                {producto.estado === false && (
                  <div className="text-center mt-1">
                    <span className="badge bg-danger fs--2">Inactivo</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Controles de Paginación */}
          {totalPaginas > 1 && (
            <div className="d-flex justify-content-center align-items-center mt-4 mb-2 gap-2">
              <button 
                className="btn btn-sm btn-outline-primary"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(p => p - 1)}
              >
                <span className="fas fa-chevron-left"></span>
              </button>
              
              <span className="fs--1 text-600 fw-semi-bold px-2">
                Página {paginaActual} de {totalPaginas}
              </span>
              
              <button 
                className="btn btn-sm btn-outline-primary"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(p => p + 1)}
              >
                <span className="fas fa-chevron-right"></span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
