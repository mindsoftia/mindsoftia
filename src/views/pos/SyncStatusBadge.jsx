/**
 * SyncStatusBadge.jsx — Indicador de estado de sincronización (Offline/Online).
 * Estilos: Falcon / Bootstrap 5 nativo.
 */
import React, { useState, useEffect } from 'react';
import { posDB } from '../../database/localPosDb';
import { posSyncService } from '../../services/posSyncService';

export default function SyncStatusBadge() {
  const [online, setOnline]       = useState(navigator.onLine);
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    const handleOnline  = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    // Conectar a Dexie para contar pendientes y sincronizar
    const checkPendientes = async () => {
      try {
        const count = await posDB.ventas.where('sync_status').equals('pending').count();
        setPendientes(count);
        
        // Si hay conexión y pendientes, intentar sincronizar
        if (navigator.onLine && count > 0) {
          const synced = await posSyncService.syncVentasPendientes();
          if (synced > 0) {
            const newCount = await posDB.ventas.where('sync_status').equals('pending').count();
            setPendientes(newCount);
          }
        }
      } catch (err) {
        console.error('Error verificando sync:', err);
      }
    };
    
    // Chequeo inicial
    checkPendientes();
    // Chequeo periódico cada 10 segundos
    const interval = setInterval(checkPendientes, 10000);

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
