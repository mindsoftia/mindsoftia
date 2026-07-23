import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const PerfilEmpresa = () => {
    const { tenantId } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const [formData, setFormData] = useState({
        nombre: '',
        nombre_comercial: '',
        tipo_persona: 'Jurídica',
        tipo_documento_id: '31',
        ruc_nit: '',
        digito_verificacion: '',
        codigo_ciiu: '',
        direccion_fiscal: '',
        codigo_postal: '',
        codigo_departamento: '',
        codigo_municipio: '',
        email: '',
        email_facturacion: '',
        matricula_mercantil: '',
        telefono: ''
    });

    useEffect(() => {
        if (!tenantId) return;
        
        const fetchPerfil = async () => {
            try {
                const response = await api.get('/empresa/perfil', {
                    headers: { 'X-Tenant-ID': tenantId }
                });
                if (response.data?.success) {
                    const data = response.data.data;
                    setFormData({
                        nombre: data.nombre || '',
                        nombre_comercial: data.nombre_comercial || '',
                        tipo_persona: data.tipo_persona || 'Jurídica',
                        tipo_documento_id: data.tipo_documento_id || '31',
                        ruc_nit: data.ruc_nit || '',
                        digito_verificacion: data.digito_verificacion || '',
                        codigo_ciiu: data.codigo_ciiu || '',
                        direccion_fiscal: data.direccion_fiscal || '',
                        codigo_postal: data.codigo_postal || '',
                        codigo_departamento: data.codigo_departamento || '',
                        codigo_municipio: data.codigo_municipio || '',
                        email: data.email || '',
                        email_facturacion: data.email_facturacion || '',
                        matricula_mercantil: data.matricula_mercantil || '',
                        telefono: data.telefono || ''
                    });
                }
            } catch (err) {
                setErrorMsg('Error al cargar el perfil de la empresa.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPerfil();
    }, [tenantId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const response = await api.put('/empresa/perfil', formData, {
                headers: { 'X-Tenant-ID': tenantId }
            });
            if (response.data?.success) {
                setSuccessMsg('Perfil actualizado correctamente.');
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Error al guardar los cambios.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0 text-primary fw-bold">
                    <i className="bi bi-building me-2"></i>Perfil de Empresa
                </h2>
                <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={saving}
                >
                    {saving ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Guardando...</>
                    ) : (
                        <><i className="bi bi-save me-2"></i>Guardar Cambios</>
                    )}
                </button>
            </div>

            {errorMsg && (
                <div className="alert alert-danger shadow-sm border-0 mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorMsg}
                </div>
            )}
            
            {successMsg && (
                <div className="alert alert-success shadow-sm border-0 mb-4" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>{successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="row g-4">
                    {/* Tarjeta 1: Información General */}
                    <div className="col-12 col-xl-6">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                                <h5 className="mb-0 text-dark fw-bold">Información General</h5>
                                <p className="text-muted small">Datos básicos de identificación comercial.</p>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Razón Social <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Nombre Comercial</label>
                                    <input type="text" className="form-control" name="nombre_comercial" value={formData.nombre_comercial} onChange={handleChange} placeholder="Si es diferente a la razón social" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Matrícula Mercantil</label>
                                    <input type="text" className="form-control" name="matricula_mercantil" value={formData.matricula_mercantil} onChange={handleChange} />
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Teléfono</label>
                                        <input type="text" className="form-control" name="telefono" value={formData.telefono} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Email Principal</label>
                                        <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta 2: Identificación Tributaria DIAN */}
                    <div className="col-12 col-xl-6">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                                <h5 className="mb-0 text-dark fw-bold">Identificación Tributaria (DIAN)</h5>
                                <p className="text-muted small">Información requerida para Facturación Electrónica UBL 2.1.</p>
                            </div>
                            <div className="card-body">
                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Tipo de Persona <span className="text-danger">*</span></label>
                                        <select className="form-select" name="tipo_persona" value={formData.tipo_persona} onChange={handleChange} required>
                                            <option value="Jurídica">Persona Jurídica</option>
                                            <option value="Natural">Persona Natural</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Tipo Documento <span className="text-danger">*</span></label>
                                        <select className="form-select" name="tipo_documento_id" value={formData.tipo_documento_id} onChange={handleChange} required>
                                            <option value="31">NIT (31)</option>
                                            <option value="13">Cédula de Ciudadanía (13)</option>
                                            <option value="22">Cédula de Extranjería (22)</option>
                                            <option value="42">Documento de Identificación Extranjero (42)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row g-3 mb-3">
                                    <div className="col-md-8">
                                        <label className="form-label fw-semibold">Número de Identificación (NIT) <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" name="ruc_nit" value={formData.ruc_nit} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">D.V.</label>
                                        <input type="text" className="form-control text-center" name="digito_verificacion" value={formData.digito_verificacion} onChange={handleChange} maxLength="1" />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Actividad Económica Principal (Código CIIU)</label>
                                    <input type="text" className="form-control" name="codigo_ciiu" value={formData.codigo_ciiu} onChange={handleChange} placeholder="Ej: 6201" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta 3: Localización */}
                    <div className="col-12 col-xl-12">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                                <h5 className="mb-0 text-dark fw-bold">Localización y Recepción</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label fw-semibold">Dirección Fiscal Completa</label>
                                        <input type="text" className="form-control" name="direccion_fiscal" value={formData.direccion_fiscal} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-2 mb-3">
                                        <label className="form-label fw-semibold">Cód. DANE Depto</label>
                                        <input type="text" className="form-control" name="codigo_departamento" value={formData.codigo_departamento} onChange={handleChange} placeholder="Ej: 11" maxLength="2" />
                                    </div>
                                    <div className="col-md-2 mb-3">
                                        <label className="form-label fw-semibold">Cód. DANE Mun</label>
                                        <input type="text" className="form-control" name="codigo_municipio" value={formData.codigo_municipio} onChange={handleChange} placeholder="Ej: 001" maxLength="3" />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label fw-semibold">Email Recepción Electrónica (RADIAN)</label>
                                        <input type="email" className="form-control" name="email_facturacion" value={formData.email_facturacion} onChange={handleChange} placeholder="fe@miempresa.com" />
                                        <div className="form-text text-muted">Buzón exclusivo para recepción de facturas electrónicas.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PerfilEmpresa;
