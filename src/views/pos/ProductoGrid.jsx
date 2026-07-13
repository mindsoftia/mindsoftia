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
    if (!busqueda.trim()) return productos;
    const q = busqueda.toLowerCase();
    return productos.filter(p =>
      p.nombre?.toLowerCase().includes(q) ||
      p.referencia?.toLowerCase().includes(q) ||
      p.codigo_barras?.toLowerCase().includes(q)
    );
  }, [busqueda, productos])();

  const handleClick = (producto) => {
    if (producto.estado === false) return;
    setClickedId(producto.id);
    onAgregar(producto);
    setTimeout(() => setClickedId(null), 350);
  };

  return (
    <div>
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
        <div className="pos-productos-grid">
          {filtrados.map(producto => (
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
                  style={{ fontSize: '1.4rem', color: '#2c7be5' }}
                ></span>
              </div>

              {/* Nombre */}
              <div
                className="fw-semi-bold text-800 fs--1 text-center"
                style={{
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.3',
                  minHeight: '2.6em',
                }}
              >
                {producto.nombre}
              </div>

              {/* Precio */}
              <div className="text-center mt-1">
                <span className="fw-bold text-success fs--1">
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
      )}
    </div>
  );
}
