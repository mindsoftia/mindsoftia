import React from 'react';

const RoadmapCalendar = () => {
  // Datos del plan estratégico
  const events = [
    { id: 1, title: 'Arquitectura Base y Multi-Tenant', date: '01 Jun, 2026 - 15 Jun, 2026', color: 'primary' },
    { id: 2, title: 'Implementación Planes, UI y PWA', date: '16 Jun, 2026 - 22 Jun, 2026', color: 'success' },
    { id: 3, title: 'Sprint: Facturación Electrónica DIAN', date: '23 Jun, 2026 - 30 Jun, 2026', color: 'warning' },
    { id: 4, title: 'POS Cloud Offline-first', date: '01 Jul, 2026 - 15 Jul, 2026', color: 'danger' }
  ];

  return (
    <div className="card h-100">
      <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
        <button className="btn btn-primary btn-sm">
          <span className="fas fa-plus me-1"></span>Nuevo Hito
        </button>
        <div className="btn-group btn-group-sm" role="group">
          <button className="btn btn-outline-secondary shadow-none" type="button"><span className="fas fa-chevron-left"></span></button>
          <button className="btn btn-outline-secondary shadow-none" type="button">Hoy</button>
          <button className="btn btn-outline-secondary shadow-none" type="button"><span className="fas fa-chevron-right"></span></button>
        </div>
      </div>
      <div className="card-body p-0">
        <div className="row g-0 h-100">
          <div className="col-md-6 border-end-md border-200">
            <div className="p-3">
              <div className="d-flex justify-content-between text-center fw-semi-bold text-500 fs--1 mb-3">
                <div style={{ width: '14%' }}>Dom</div>
                <div style={{ width: '14%' }}>Lun</div>
                <div style={{ width: '14%' }}>Mar</div>
                <div style={{ width: '14%' }}>Mié</div>
                <div style={{ width: '14%' }}>Jue</div>
                <div style={{ width: '14%' }}>Vie</div>
                <div style={{ width: '14%' }}>Sáb</div>
              </div>
              
              <div className="d-flex flex-wrap text-center fs--1 text-700 align-items-center">
                {/* 31 May */}
                <div className="text-400 py-2" style={{ width: '14%' }}>31</div>
                {/* 1-6 */}
                <div className="py-2 bg-soft-primary" style={{ width: '14%', borderTopLeftRadius: '50px', borderBottomLeftRadius: '50px' }}>1</div>
                <div className="py-2 bg-soft-primary" style={{ width: '14%' }}>2</div>
                <div className="py-2 bg-soft-primary" style={{ width: '14%' }}>3</div>
                <div className="py-2 bg-soft-primary" style={{ width: '14%' }}>4</div>
                <div className="py-2 bg-soft-primary" style={{ width: '14%' }}>5</div>
                <div className="py-2 bg-soft-primary" style={{ width: '14%' }}>6</div>
                
                {/* 7-13 */}
                <div className="py-2 bg-soft-primary" style={{ width: '14%' }}>7</div>
                <div className="py-2 bg-soft-primary" style={{ width: '14%' }}>8</div>
                <div className="py-2 bg-soft-primary" style={{ width: '14%' }}>9</div>
                <div className="py-2 bg-soft-primary" style={{ width: '14%' }}>10</div>
                <div className="py-2 bg-soft-primary" style={{ width: '14%' }}>11</div>
                <div className="py-2 bg-soft-primary" style={{ width: '14%' }}>12</div>
                <div className="py-2 bg-soft-primary" style={{ width: '14%' }}>13</div>

                {/* 14-20 */}
                <div className="py-2 bg-soft-primary" style={{ width: '14%' }}>14</div>
                <div className="py-2 bg-soft-primary" style={{ width: '14%', borderTopRightRadius: '50px', borderBottomRightRadius: '50px' }}>15</div>
                <div className="py-2 border border-success border-end-0" style={{ width: '14%', borderTopLeftRadius: '50px', borderBottomLeftRadius: '50px' }}>16</div>
                <div className="py-2 border border-success border-start-0 border-end-0" style={{ width: '14%' }}>17</div>
                <div className="py-2 border border-success border-start-0 border-end-0" style={{ width: '14%' }}>18</div>
                <div className="py-2 border border-success border-start-0 border-end-0" style={{ width: '14%' }}>19</div>
                <div className="py-2 border border-success border-start-0 border-end-0" style={{ width: '14%' }}>20</div>

                {/* 21-27 (Today is 22) */}
                <div className="py-2 border border-success border-start-0" style={{ width: '14%', borderTopRightRadius: '50px', borderBottomRightRadius: '50px' }}>21</div>
                <div style={{ width: '14%' }} className="d-flex justify-content-center">
                  <div className="py-2 bg-primary text-white rounded-circle shadow-sm d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px' }}>22</div>
                </div>
                <div className="py-2 bg-soft-warning" style={{ width: '14%', borderTopLeftRadius: '50px', borderBottomLeftRadius: '50px' }}>23</div>
                <div className="py-2 bg-soft-warning" style={{ width: '14%' }}>24</div>
                <div className="py-2 bg-soft-warning" style={{ width: '14%' }}>25</div>
                <div className="py-2 bg-soft-warning" style={{ width: '14%' }}>26</div>
                <div className="py-2 bg-soft-warning" style={{ width: '14%' }}>27</div>

                {/* 28-30 */}
                <div className="py-2 bg-soft-warning" style={{ width: '14%' }}>28</div>
                <div className="py-2 bg-soft-warning" style={{ width: '14%' }}>29</div>
                <div className="py-2 bg-soft-warning" style={{ width: '14%', borderTopRightRadius: '50px', borderBottomRightRadius: '50px' }}>30</div>
                <div className="py-2 text-400" style={{ width: '14%' }}>1</div>
                <div className="py-2 text-400" style={{ width: '14%' }}>2</div>
                <div className="py-2 text-400" style={{ width: '14%' }}>3</div>
                <div className="py-2 text-400" style={{ width: '14%' }}>4</div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="p-3 h-100 d-flex flex-column">
              <h4 className="mb-0 text-800">Junio 2026</h4>
              <p className="fs--1 text-500 mb-4">Lunes, 22 de Junio</p>
              
              <div className="flex-1">
                {events.map((evt, idx) => (
                  <div key={evt.id} className={`ps-3 border-start border-3 border-${evt.color} ${idx !== events.length - 1 ? 'mb-4 pb-3 border-bottom border-200' : ''}`}>
                    <h6 className="mb-1 text-800 fw-semi-bold">{evt.title}</h6>
                    <p className="fs--2 text-500 mb-0">{evt.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapCalendar;
