/**
 * SyncStatusBadge.jsx — Indicador de estado de sincronización (Offline/Online).
 * Estilos: Falcon / Bootstrap 5 nativo.
 */
import React, { useState, useEffect } from 'react';

export default function SyncStatusBadge() {
  const [online, setOnline]       = useState(navigator.onLine);
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    const handleOnline  = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    // TODO: Conectar a Dexie para contar pending
    const checkPendientes = () => {
      // Simulación temporal
      setPendientes(0);
    };
    const interval = setInterval(checkPendientes, 5000);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!online) {
    return (
      <div className="d-flex align-items-center">
        <span className="badge badge-soft-danger d-flex align-items-center py-2 px-3">
          <span className="fas fa-wifi-slash me-2 fs--1 text-danger"></span>
          <div className="text-start text-900" style={{ lineHeight: '1.2' }}>
            <div className="fw-bold text-danger">Sin Conexión</div>
            <div className="fs--2 fw-normal text-danger">Trabajando offline</div>
          </div>
        </span>
      </div>
    );
  }

  if (pendientes > 0) {
    return (
      <div className="d-flex align-items-center">
        <span className="badge badge-soft-warning d-flex align-items-center py-2 px-3" title={`${pendientes} ventas por subir a la nube`}>
          <span className="fas fa-cloud-upload-alt me-2 fs--1 text-warning spinner-grow spinner-grow-sm" style={{ animationDuration: '2s' }}></span>
          <div className="text-start text-900" style={{ lineHeight: '1.2' }}>
            <div className="fw-bold text-warning-dark">Sincronizando</div>
            <div className="fs--2 fw-normal text-warning-dark">{pendientes} pendientes</div>
          </div>
        </span>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center">
      <span className="badge badge-soft-success d-flex align-items-center py-2 px-3">
        <span className="fas fa-cloud-check me-2 fs--1 text-success"></span>
        <div className="text-start text-900" style={{ lineHeight: '1.2' }}>
          <div className="fw-bold text-success-dark">Sincronizado</div>
          <div className="fs--2 fw-normal text-success-dark">Todo al día</div>
        </div>
      </span>
    </div>
  );
}
