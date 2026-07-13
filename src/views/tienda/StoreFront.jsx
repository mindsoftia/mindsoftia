import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { posDB } from '../../database/localPosDb';
import useAuthStore from '../../store/authStore';

export default function StoreFront() {
  const { tenantId } = useAuthStore();
  const productos = useLiveQuery(() => posDB.productos_cache.toArray(), []);
  const [carrito, setCarrito] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setIsCartOpen(true);
  };

  const modificarCantidad = (id, delta) => {
    setCarrito(prev => prev.map(item => {
      if (item.id === id) {
        const nuevaCant = item.cantidad + delta;
        return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : item;
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = carrito.reduce((acc, item) => acc + (item.precio_venta_base * item.cantidad), 0);
  // Asumiendo un IVA del 19% si no está definido en el producto
  const impuestos = carrito.reduce((acc, item) => acc + ((item.precio_venta_base * (item.iva_porcentaje || 19) / 100) * item.cantidad), 0);
  const total = subtotal + impuestos;

  return (
    <div className="bg-100 min-vh-100 pb-5">
      {/* ── HEADER B2C PREMIUM ── */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <a className="navbar-brand fw-bolder text-primary d-flex align-items-center" href="#!">
            <span className="fas fa-store me-2 fs-1"></span>
            Mindsoftia <span className="text-500 fw-light ms-1">| Tienda</span>
          </a>
          <div className="d-flex ms-auto">
            <button className="btn btn-outline-primary rounded-pill position-relative" onClick={() => setIsCartOpen(!isCartOpen)}>
              <span className="fas fa-shopping-cart me-2"></span>
              Mi Carrito
              {carrito.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {carrito.reduce((acc, item) => acc + item.cantidad, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div className="container mt-4">
        <div className="card bg-dark text-white border-0 overflow-hidden mb-5 rounded-3 shadow-sm">
          <div className="bg-holder" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070)', opacity: 0.4 }}></div>
          <div className="card-body position-relative p-5 text-center">
            <h1 className="text-white fw-bold display-4 mb-3">Catálogo en Línea</h1>
            <p className="lead text-300 mb-0">Explora nuestros productos y compra al instante.</p>
          </div>
        </div>
      </div>

      {/* ── PRODUCT GRID ── */}
      <div className="container">
        <div className="row g-4">
          {productos?.map(prod => (
            <div className="col-sm-6 col-md-4 col-lg-3" key={prod.id}>
              <div className="card h-100 border-0 shadow-sm product-card transition-base">
                <div className="position-relative">
                  <img src={prod.imagen_url || 'https://via.placeholder.com/400x300?text=Sin+Imagen'} className="card-img-top object-fit-cover" alt={prod.nombre} style={{ height: '200px' }} />
                  {prod.stock_actual <= 0 && (
                    <div className="position-absolute top-0 end-0 bg-danger text-white px-2 py-1 m-2 rounded-1 fs--2 fw-bold">AGOTADO</div>
                  )}
                  {/* Floating Circular Button */}
                  <button 
                    className="btn btn-primary rounded-circle shadow position-absolute bottom-0 end-0 translate-middle p-0 d-flex align-items-center justify-content-center" 
                    style={{ width: '45px', height: '45px', marginBottom: '-10px', marginRight: '-10px' }}
                    onClick={() => agregarAlCarrito(prod)}
                    disabled={prod.stock_actual <= 0}
                    title="Agregar al carrito"
                  >
                    <span className="fas fa-cart-plus fs-1"></span>
                  </button>
                </div>
                <div className="card-body d-flex flex-column pt-4">
                  <div className="mb-2">
                    <span className="badge badge-soft-info mb-2">{prod.codigo_sku}</span>
                    <h6 className="card-title text-900 mb-1 text-truncate" title={prod.nombre}>{prod.nombre}</h6>
                  </div>
                  <div className="mt-auto">
                    <h5 className="text-success fw-bold mb-0">${Number(prod.precio_venta_base).toLocaleString()}</h5>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {productos?.length === 0 && (
            <div className="col-12 text-center py-5">
              <span className="fas fa-box-open fs-4 text-300 mb-3 d-block"></span>
              <h5 className="text-500">No hay productos disponibles por ahora.</h5>
            </div>
          )}
        </div>
      </div>

      {/* ── OFFCANVAS CARRITO (Estilo Modal Lateral) ── */}
      {isCartOpen && (
        <div className="offcanvas offcanvas-end show" style={{ visibility: 'visible', width: '400px', borderLeft: 'none', boxShadow: '-5px 0 15px rgba(0,0,0,0.1)' }} tabIndex="-1">
          <div className="offcanvas-header bg-light border-bottom border-200">
            <h5 className="offcanvas-title fw-bold text-primary">
              <span className="fas fa-shopping-bag me-2"></span>Tu Pedido
            </h5>
            <button type="button" className="btn-close text-reset" onClick={() => setIsCartOpen(false)}></button>
          </div>
          
          <div className="offcanvas-body p-0 d-flex flex-column bg-white">
            <div className="flex-grow-1 overflow-auto p-3">
              {carrito.length === 0 ? (
                <div className="text-center mt-5 text-400">
                  <span className="fas fa-shopping-cart fs-4 mb-3 d-block text-300"></span>
                  <p>Tu carrito está vacío.</p>
                </div>
              ) : (
                carrito.map(item => (
                  <div className="d-flex align-items-center mb-3 pb-3 border-bottom border-200" key={item.id}>
                    <img src={item.imagen_url || 'https://via.placeholder.com/100x100?text=Img'} className="rounded" alt={item.nombre} style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                    <div className="ms-3 flex-grow-1">
                      <h6 className="mb-1 text-800 fs--1 text-truncate" style={{ maxWidth: '180px' }}>{item.nombre}</h6>
                      <div className="text-success fw-semi-bold fs--1">${Number(item.precio_venta_base).toLocaleString()} x {item.cantidad}</div>
                      <div className="d-flex align-items-center mt-2">
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2 fs--2" onClick={() => modificarCantidad(item.id, -1)}>-</button>
                        <span className="mx-2 fs--1 fw-semi-bold">{item.cantidad}</span>
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2 fs--2" onClick={() => modificarCantidad(item.id, 1)}>+</button>
                      </div>
                    </div>
                    <button className="btn btn-link text-danger p-0 ms-2" onClick={() => eliminarDelCarrito(item.id)}>
                      <span className="fas fa-trash-alt fs--1"></span>
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {/* FOOTER CHECKOUT */}
            {carrito.length > 0 && (
              <div className="p-3 bg-light border-top border-200 shadow-sm mt-auto">
                <div className="d-flex justify-content-between mb-1 fs--1 text-600">
                  <span>Subtotal</span>
                  <span>${Number(subtotal).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 fs--1 text-600">
                  <span>Impuestos estimados</span>
                  <span>${Number(impuestos).toLocaleString()}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-bold text-900 fs-1">Total</span>
                  <span className="fw-bold text-primary fs-1">${Number(total).toLocaleString()}</span>
                </div>
                <button className="btn btn-primary w-100 fw-bold fs-0 py-2">
                  Proceder al Pago <span className="fas fa-arrow-right ms-2"></span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* OVERLAY PARA EL OFFCANVAS */}
      {isCartOpen && <div className="offcanvas-backdrop fade show" onClick={() => setIsCartOpen(false)}></div>}
    </div>
  );
}
