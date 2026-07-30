import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function EdsDashboard() {
  const [islas, setIslas] = useState([]);
  const [turnoActual, setTurnoActual] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/eds/dashboard');
      setIslas(res.data.islas || []);
      setTurnoActual(res.data.turnoActual || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirTurno = async () => {
    try {
      const res = await axios.post('/api/eds/turnos/abrir');
      setTurnoActual(res.data);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Turno Abierto', showConfirmButton: false, timer: 1500 });
      
      // En un flujo real, aquí pediríamos las lecturas iniciales iterando sobre las mangueras.
      // Por brevedad simularemos que ya se abrieron.
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'No se pudo abrir el turno', 'error');
    }
  };

  const handleCerrarTurno = async () => {
    if (!turnoActual) return;
    
    // Simular el ingreso de lecturas finales y cierre de turno.
    const { isConfirmed } = await Swal.fire({
      title: '¿Cerrar Turno?',
      text: '¿Has ingresado las lecturas finales de los surtidores?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Cerrar Turno',
      cancelButtonText: 'Cancelar'
    });

    if (isConfirmed) {
      try {
        await axios.post(`/api/eds/turnos/cerrar/${turnoActual.id}`);
        setTurnoActual(null);
        Swal.fire('Turno Cerrado', 'Se ha guardado el arqueo.', 'success');
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'No se pudo cerrar el turno', 'error');
      }
    }
  };

  const handleDespachar = (manguera) => {
    if (!turnoActual) {
      Swal.fire('Atención', 'Debes abrir turno primero para poder despachar.', 'warning');
      return;
    }
    
    // Simulación táctil rápida de despacho
    Swal.fire({
      title: `Despachando ${manguera.combustible}`,
      html: `Manguera: <b>${manguera.codigo}</b><br/>Precio Galón: $${Number(manguera.precio_actual).toLocaleString()}`,
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false
    });
  };

  if (loading) return <div className="p-4 text-center">Cargando tablero operativo...</div>;

  return (
    <div className="container-fluid py-4">
      <div className="card mb-3 border-0 shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h4 className="mb-0 text-danger fw-bold">
            <span className="fas fa-gas-pump me-2"></span>
            Tablero Operativo EDS
          </h4>
          <div>
            {turnoActual ? (
              <>
                <span className="badge bg-success fs--1 me-3 p-2">
                  <span className="fas fa-check me-1"></span>Turno Abierto
                </span>
                <button onClick={handleCerrarTurno} className="btn btn-outline-danger btn-sm fw-bold">
                  <span className="fas fa-lock me-2"></span>Cerrar Turno (Arqueo)
                </button>
              </>
            ) : (
              <span className="badge bg-secondary fs--1 p-2">
                <span className="fas fa-ban me-1"></span>Caja Cerrada
              </span>
            )}
          </div>
        </div>
      </div>

      {!turnoActual ? (
        <div className="card shadow-none border py-6">
          <div className="card-body text-center">
            <h2 className="text-500 mb-4">No hay un turno operativo en curso.</h2>
            <button onClick={handleAbrirTurno} className="btn btn-primary btn-lg shadow fw-bold px-5 py-3 fs-1">
              ABRIR TURNO AHORA
            </button>
            <p className="mt-3 text-muted fs--1">Al abrir turno se te solicitará la lectura inicial de los galómetros.</p>
          </div>
        </div>
      ) : (
        <div className="row g-3 mb-3">
          {/* Contenedor Dinámico de Islas y Surtidores */}
          <div className="col-12 col-xxl-9">
            {islas.length === 0 ? (
              <div className="alert alert-warning">No hay infraestructura configurada. Ve al módulo de Infraestructura EDS.</div>
            ) : (
              islas.map(isla => (
                <div key={isla.id} className="card shadow-none border mb-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0 text-700"><i className="fas fa-layer-group me-2"></i>{isla.nombre}</h5>
                  </div>
                  <div className="card-body bg-100">
                    <div className="row g-4">
                      {isla.surtidores?.map(surt => (
                        <div key={surt.id} className="col-12">
                          <h6 className="text-600 mb-3 border-bottom pb-2">Surtidor: {surt.codigo}</h6>
                          <div className="row g-3">
                            {surt.mangueras?.length === 0 && <div className="col-12 text-muted fs--1">No hay mangueras en este surtidor.</div>}
                            {surt.mangueras?.map(mang => (
                              <div key={mang.id} className="col-md-6 col-xl-4">
                                <div className="card h-100 shadow-sm" style={{ borderTop: `4px solid ${mang.color_hex}` }}>
                                  <div className="card-body text-center d-flex flex-column justify-content-between p-3">
                                    <div>
                                      <h4 className="fw-bold fs-2 mb-1" style={{color: mang.color_hex}}>{mang.combustible.toUpperCase()}</h4>
                                      <p className="fs--1 text-600 mb-2">{mang.codigo}</p>
                                    </div>
                                    
                                    <div className="bg-light rounded border p-2 mb-3">
                                      <div className="fs-3 fw-bold text-900">$ {Number(mang.precio_actual).toLocaleString()}</div>
                                      <div className="fs--1 text-600">Precio x Galón</div>
                                    </div>
                                    
                                    <button 
                                      onClick={() => handleDespachar(mang)}
                                      className="btn btn-lg w-100 fw-bold fs-1 py-3 text-white" 
                                      style={{ backgroundColor: mang.color_hex, borderColor: mang.color_hex, touchAction: 'manipulation' }}
                                    >
                                      DESPACHAR
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Resumen de Turno */}
          <div className="col-12 col-xxl-3">
            <div className="card h-100 shadow-sm border-0 sticky-top" style={{top: '80px', zIndex: 1}}>
              <div className="card-header bg-dark text-white">
                <h6 className="mb-0 fs--1 text-white"><i className="fas fa-receipt me-2"></i>Resumen del Turno Actual</h6>
              </div>
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fs--1 text-600">Inicio de Turno:</span>
                  <span className="fs--1 fw-semi-bold">{new Date(turnoActual.fecha_apertura).toLocaleTimeString()}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fs--1 text-600">Operador:</span>
                  <span className="fs--1 fw-semi-bold">Usuario Actual</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fs--1 text-600">Total Efectivo:</span>
                  <span className="fs-0 fw-semi-bold">$0.00</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fs--1 text-600">Total Tarjetas:</span>
                  <span className="fs-0 fw-semi-bold">$0.00</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded border">
                  <span className="fs-0 fw-bold text-800">Total Ventas:</span>
                  <span className="fs-2 fw-bold text-900 text-success">$0.00</span>
                </div>
                
                <div className="mt-auto pt-4">
                  <button className="btn btn-outline-secondary w-100 py-3 fw-bold">
                    <span className="fas fa-print me-2"></span>Imprimir Comprobante (Copia)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EdsDashboard;
