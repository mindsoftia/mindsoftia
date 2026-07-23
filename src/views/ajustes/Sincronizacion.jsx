import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const Sincronizacion = () => {
    const { tenantId, hasPermission } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({
        dian: { estado: 'ok', pendientes: 0, ultima_sync: 'Hace 5 min' },
        contabilidad: { estado: 'warning', pendientes: 12, ultima_sync: 'Ayer' },
        local: { estado: 'offline', pendientes: 45, ultima_sync: 'Hace 2 horas' }
    });

    const fetchStatus = async () => {
        if (!tenantId) return;
        try {
            setLoading(true);
            const response = await api.get('/sync/status', {
                headers: { 'X-Tenant-ID': tenantId }
            });
            if (response.data?.success) {
                setStatus(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching sync status:', error);
            // Si el backend aún no está listo, conservamos el estado dummy para la maqueta
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [tenantId]);

    const handleForceSync = async (tipo) => {
        if (!tenantId) return;
        try {
            setLoading(true);
            const response = await api.post('/sync/force', { tipo }, {
                headers: { 'X-Tenant-ID': tenantId }
            });
            if (response.data?.success) {
                // Actualizar estado luego de sincronizar
                fetchStatus();
            }
        } catch (error) {
            console.error(`Error forcing sync for ${tipo}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (estado) => {
        switch(estado) {
            case 'ok': return 'success';
            case 'warning': return 'warning';
            case 'error': return 'danger';
            case 'offline': return 'secondary';
            default: return 'primary';
        }
    };

    const getStatusIcon = (estado) => {
        switch(estado) {
            case 'ok': return 'fa-check-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'error': return 'fa-times-circle';
            case 'offline': return 'fa-wifi-slash';
            default: return 'fa-info-circle';
        }
    };

    return (
        <>
            <div className="d-flex mb-4 mt-3">
                <span className="fa-stack me-2 ms-n1">
                    <i className="fas fa-circle fa-stack-2x text-300"></i>
                    <i className="fa-inverse fa-stack-1x text-primary fas fa-sync-alt"></i>
                </span>
                <div className="col">
                    <h5 className="mb-0 text-primary position-relative">
                        <span className="bg-200 dark__bg-1100 pe-3">Centro de Sincronización</span>
                        <span className="border position-absolute top-50 translate-middle-y w-100 start-0 z-n1"></span>
                    </h5>
                    <p className="mb-0">Monitorea y fuerza la sincronización de datos operativos con la contabilidad y la DIAN.</p>
                </div>
            </div>

            <div className="row g-3 mb-3">
                {/* 1. Sincronización DIAN/RADIAN */}
                <div className="col-lg-4 col-md-6">
                    <div className="card h-100">
                        <div className="card-header bg-light d-flex flex-between-center py-2">
                            <h6 className="mb-0">
                                <i className="fas fa-file-invoice me-2 text-primary"></i>DIAN & RADIAN
                            </h6>
                            <span className={`badge rounded-pill badge-soft-${getStatusColor(status.dian.estado)}`}>
                                <i className={`fas ${getStatusIcon(status.dian.estado)} me-1`}></i>
                                {status.dian.estado.toUpperCase()}
                            </span>
                        </div>
                        <div className="card-body d-flex flex-column">
                            <p className="fs--1 text-600 mb-3">
                                Envíos de Facturación Electrónica (UBL 2.1), Notas de Ajuste y eventos RADIAN.
                            </p>
                            <div className="d-flex align-items-center mb-3">
                                <div className="avatar avatar-3xl me-3">
                                    <div className={`avatar-name rounded-circle bg-soft-${status.dian.pendientes > 0 ? 'warning' : 'success'} text-${status.dian.pendientes > 0 ? 'warning' : 'success'}`}>
                                        <span>{status.dian.pendientes}</span>
                                    </div>
                                </div>
                                <div>
                                    <h6 className="mb-1">Pendientes por enviar</h6>
                                    <p className="fs--2 text-500 mb-0">Última sync: {status.dian.ultima_sync}</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <button 
                                    className="btn btn-outline-primary btn-sm w-100" 
                                    onClick={() => handleForceSync('dian')}
                                    disabled={loading || status.dian.pendientes === 0}
                                >
                                    <i className="fas fa-paper-plane me-2"></i>Forzar Envío DIAN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Centralización Contable */}
                <div className="col-lg-4 col-md-6">
                    <div className="card h-100">
                        <div className="card-header bg-light d-flex flex-between-center py-2">
                            <h6 className="mb-0">
                                <i className="fas fa-book me-2 text-success"></i>Contabilidad (NIIF)
                            </h6>
                            <span className={`badge rounded-pill badge-soft-${getStatusColor(status.contabilidad.estado)}`}>
                                <i className={`fas ${getStatusIcon(status.contabilidad.estado)} me-1`}></i>
                                {status.contabilidad.estado.toUpperCase()}
                            </span>
                        </div>
                        <div className="card-body d-flex flex-column">
                            <p className="fs--1 text-600 mb-3">
                                Asientos contables automáticos, Kardex de inventario y saldos de cuentas PUC.
                            </p>
                            <div className="d-flex align-items-center mb-3">
                                <div className="avatar avatar-3xl me-3">
                                    <div className={`avatar-name rounded-circle bg-soft-${status.contabilidad.pendientes > 0 ? 'warning' : 'success'} text-${status.contabilidad.pendientes > 0 ? 'warning' : 'success'}`}>
                                        <span>{status.contabilidad.pendientes}</span>
                                    </div>
                                </div>
                                <div>
                                    <h6 className="mb-1">Comprobantes sin asentar</h6>
                                    <p className="fs--2 text-500 mb-0">Última sync: {status.contabilidad.ultima_sync}</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <button 
                                    className="btn btn-outline-success btn-sm w-100" 
                                    onClick={() => handleForceSync('contabilidad')}
                                    disabled={loading || status.contabilidad.pendientes === 0}
                                >
                                    <i className="fas fa-sync-alt me-2"></i>Centralizar Contabilidad
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Ecosistema Local / Nube */}
                <div className="col-lg-4 col-md-6">
                    <div className="card h-100">
                        <div className="card-header bg-light d-flex flex-between-center py-2">
                            <h6 className="mb-0">
                                <i className="fas fa-cloud-upload-alt me-2 text-info"></i>Nube vs Local
                            </h6>
                            <span className={`badge rounded-pill badge-soft-${getStatusColor(status.local.estado)}`}>
                                <i className={`fas ${getStatusIcon(status.local.estado)} me-1`}></i>
                                {status.local.estado.toUpperCase()}
                            </span>
                        </div>
                        <div className="card-body d-flex flex-column">
                            <p className="fs--1 text-600 mb-3">
                                Datos del Punto de Venta offline pendientes por subir al servidor de MindSoftia.
                            </p>
                            <div className="d-flex align-items-center mb-3">
                                <div className="avatar avatar-3xl me-3">
                                    <div className={`avatar-name rounded-circle bg-soft-${status.local.pendientes > 0 ? 'secondary' : 'success'} text-${status.local.pendientes > 0 ? 'secondary' : 'success'}`}>
                                        <span>{status.local.pendientes}</span>
                                    </div>
                                </div>
                                <div>
                                    <h6 className="mb-1">Paquetes Offline</h6>
                                    <p className="fs--2 text-500 mb-0">Última sync: {status.local.ultima_sync}</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <button 
                                    className="btn btn-outline-info btn-sm w-100" 
                                    onClick={() => handleForceSync('local')}
                                    disabled={loading || status.local.pendientes === 0}
                                >
                                    <i className="fas fa-cloud-upload-alt me-2"></i>Subir a la Nube
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header bg-light">
                    <h6 className="mb-0"><i className="fas fa-history me-2"></i>Historial de Sincronización</h6>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-sm table-striped fs--1 mb-0 overflow-hidden">
                            <thead className="bg-200 text-900">
                                <tr>
                                    <th className="sort pe-1 align-middle white-space-nowrap">Fecha y Hora</th>
                                    <th className="sort pe-1 align-middle white-space-nowrap">Tipo</th>
                                    <th className="sort pe-1 align-middle white-space-nowrap">Estado</th>
                                    <th className="sort pe-1 align-middle white-space-nowrap">Detalles</th>
                                </tr>
                            </thead>
                            <tbody className="list">
                                <tr>
                                    <td colSpan="4" className="text-center py-3 text-500">
                                        El historial de logs se cargará próximamente al integrar la tabla de base de datos.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sincronizacion;
