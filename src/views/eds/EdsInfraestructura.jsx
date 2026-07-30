import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function EdsInfraestructura() {
  const [islas, setIslas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [nuevaIsla, setNuevaIsla] = useState('');
  
  const [nuevoSurtidor, setNuevoSurtidor] = useState({ islaId: '', codigo: '' });
  const [nuevaManguera, setNuevaManguera] = useState({ surtidorId: '', codigo: '', combustible: 'Corriente', color_hex: '#dc3545', precio_actual: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/eds/dashboard');
      setIslas(res.data.islas || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearIsla = async (e) => {
    e.preventDefault();
    if (!nuevaIsla) return;
    try {
      await axios.post('/api/eds/islas', { nombre: nuevaIsla, estado: true });
      setNuevaIsla('');
      fetchData();
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Isla creada', showConfirmButton: false, timer: 1500 });
    } catch (error) {
      Swal.fire('Error', 'No se pudo crear la isla', 'error');
    }
  };

  const handleCrearSurtidor = async (e) => {
    e.preventDefault();
    if (!nuevoSurtidor.islaId || !nuevoSurtidor.codigo) return;
    try {
      await axios.post(`/api/eds/islas/${nuevoSurtidor.islaId}/surtidores`, { codigo: nuevoSurtidor.codigo, estado: true });
      setNuevoSurtidor({ islaId: '', codigo: '' });
      fetchData();
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Surtidor creado', showConfirmButton: false, timer: 1500 });
    } catch (error) {
      Swal.fire('Error', 'No se pudo crear el surtidor', 'error');
    }
  };

  const handleCrearManguera = async (e) => {
    e.preventDefault();
    if (!nuevaManguera.surtidorId || !nuevaManguera.codigo || !nuevaManguera.precio_actual) return;
    try {
      await axios.post(`/api/eds/surtidores/${nuevaManguera.surtidorId}/mangueras`, { 
        codigo: nuevaManguera.codigo, 
        combustible: nuevaManguera.combustible,
        color_hex: nuevaManguera.color_hex,
        precio_actual: nuevaManguera.precio_actual,
        estado: true 
      });
      setNuevaManguera({ surtidorId: '', codigo: '', combustible: 'Corriente', color_hex: '#dc3545', precio_actual: '' });
      fetchData();
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Manguera creada', showConfirmButton: false, timer: 1500 });
    } catch (error) {
      Swal.fire('Error', 'No se pudo crear la manguera', 'error');
    }
  };

  if (loading) return <div className="p-4 text-center">Cargando infraestructura...</div>;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex mb-4 align-items-center justify-content-between">
        <h3 className="mb-0 text-800"><i className="fas fa-gas-pump text-primary me-2"></i>Infraestructura EDS</h3>
      </div>

      <div className="row g-3">
        {/* Formularios de Creación */}
        <div className="col-lg-4">
          <div className="card shadow-none border mb-3">
            <div className="card-header bg-light">
              <h6 className="mb-0">Crear Isla</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleCrearIsla} className="d-flex gap-2">
                <input type="text" className="form-control form-control-sm" placeholder="Nombre (Ej: Isla 1)" value={nuevaIsla} onChange={e => setNuevaIsla(e.target.value)} required />
                <button type="submit" className="btn btn-sm btn-primary">Crear</button>
              </form>
            </div>
          </div>

          <div className="card shadow-none border mb-3">
            <div className="card-header bg-light">
              <h6 className="mb-0">Crear Surtidor</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleCrearSurtidor}>
                <select className="form-select form-select-sm mb-2" value={nuevoSurtidor.islaId} onChange={e => setNuevoSurtidor({...nuevoSurtidor, islaId: e.target.value})} required>
                  <option value="">Seleccione Isla...</option>
                  {islas.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                </select>
                <div className="d-flex gap-2">
                  <input type="text" className="form-control form-control-sm" placeholder="Código (Ej: SURT-01)" value={nuevoSurtidor.codigo} onChange={e => setNuevoSurtidor({...nuevoSurtidor, codigo: e.target.value})} required />
                  <button type="submit" className="btn btn-sm btn-primary">Crear</button>
                </div>
              </form>
            </div>
          </div>

          <div className="card shadow-none border">
            <div className="card-header bg-light">
              <h6 className="mb-0">Añadir Manguera</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleCrearManguera}>
                <select className="form-select form-select-sm mb-2" value={nuevaManguera.surtidorId} onChange={e => setNuevaManguera({...nuevaManguera, surtidorId: e.target.value})} required>
                  <option value="">Seleccione Surtidor...</option>
                  {islas.map(i => i.surtidores?.map(s => <option key={s.id} value={s.id}>{i.nombre} - {s.codigo}</option>))}
                </select>
                <input type="text" className="form-control form-control-sm mb-2" placeholder="Código (Ej: MANG-01)" value={nuevaManguera.codigo} onChange={e => setNuevaManguera({...nuevaManguera, codigo: e.target.value})} required />
                <select className="form-select form-select-sm mb-2" value={nuevaManguera.combustible} onChange={e => setNuevaManguera({...nuevaManguera, combustible: e.target.value})} required>
                  <option value="Corriente">Corriente</option>
                  <option value="Extra">Extra</option>
                  <option value="ACPM">ACPM / Diésel</option>
                  <option value="GNV">GNV</option>
                </select>
                <div className="d-flex gap-2 mb-2">
                  <input type="color" className="form-control form-control-color form-control-sm" value={nuevaManguera.color_hex} onChange={e => setNuevaManguera({...nuevaManguera, color_hex: e.target.value})} title="Color de la manguera" />
                  <input type="number" step="0.01" className="form-control form-control-sm" placeholder="Precio x Galón" value={nuevaManguera.precio_actual} onChange={e => setNuevaManguera({...nuevaManguera, precio_actual: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-sm btn-primary w-100">Añadir Manguera</button>
              </form>
            </div>
          </div>
        </div>

        {/* Árbol Visual */}
        <div className="col-lg-8">
          <div className="card shadow-none border h-100">
            <div className="card-header bg-light">
              <h6 className="mb-0">Mapa Estructural</h6>
            </div>
            <div className="card-body bg-100">
              {islas.length === 0 ? (
                <div className="text-center text-500 py-5">No hay islas registradas. Cree la primera isla para comenzar.</div>
              ) : (
                islas.map(isla => (
                  <div key={isla.id} className="card shadow-none mb-3 border-0 bg-white">
                    <div className="card-body p-3">
                      <h5 className="border-bottom pb-2 mb-3"><i className="fas fa-layer-group text-secondary me-2"></i>{isla.nombre}</h5>
                      <div className="row g-3">
                        {isla.surtidores?.map(surt => (
                          <div key={surt.id} className="col-md-6">
                            <div className="border rounded p-2 bg-light">
                              <h6 className="text-primary mb-2"><i className="fas fa-charging-station me-1"></i> Surtidor: {surt.codigo}</h6>
                              <div className="d-flex flex-column gap-1">
                                {surt.mangueras?.length === 0 ? <small className="text-muted">Sin mangueras</small> : ''}
                                {surt.mangueras?.map(mang => (
                                  <div key={mang.id} className="d-flex justify-content-between align-items-center bg-white border p-1 rounded">
                                    <span className="fs--1 fw-semi-bold">
                                      <span className="fas fa-tint me-1" style={{color: mang.color_hex}}></span>
                                      {mang.codigo} ({mang.combustible})
                                    </span>
                                    <span className="fs--2 text-success fw-bold">${Number(mang.precio_actual).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!isla.surtidores || isla.surtidores.length === 0) && <div className="text-muted fs--1">Esta isla no tiene surtidores aún.</div>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EdsInfraestructura;
