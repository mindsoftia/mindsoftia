import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';

function Settings() {
  const { tenantId, getToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    moneda_defecto: 'COP',
    impuesto_defecto: 19.00
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!tenantId) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/empresa/settings`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'X-Tenant-ID': tenantId
          }
        });
        if (response.ok) {
          const data = await response.json();
          setFormData({
            moneda_defecto: data.moneda_defecto || 'COP',
            impuesto_defecto: data.impuesto_defecto !== null ? data.impuesto_defecto : 19.00
          });
        }
      } catch (err) {
        console.error("Error cargando configuración", err);
      }
    };
    fetchSettings();
  }, [tenantId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/empresa/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({
          moneda_defecto: formData.moneda_defecto,
          impuesto_defecto: parseFloat(formData.impuesto_defecto)
        })
      });
      if (response.ok) {
        alert('Configuración guardada exitosamente');
      } else {
        alert('Error al guardar configuración');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header bg-light">
        <h5 className="mb-0">Configuración General</h5>
      </div>
      <div className="card-body">
        <form>
          <div className="row g-3 mb-4">
            <h6 className="text-primary mb-0 border-bottom pb-2">Perfil de la Organización</h6>
            <div className="col-md-6">
              <label className="form-label text-900" htmlFor="orgName">Nombre de la Organización</label>
              <input className="form-control" id="orgName" type="text" defaultValue="Mindsoftia Corp" />
            </div>
            <div className="col-md-6">
              <label className="form-label text-900" htmlFor="orgEmail">Email de Contacto</label>
              <input className="form-control" id="orgEmail" type="email" defaultValue="contacto@mindsoftia.com" />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <h6 className="text-primary mb-0 border-bottom pb-2">Localización y Finanzas</h6>
            <div className="col-md-6">
              <label className="form-label text-900" htmlFor="monedaDefecto">Moneda Principal (ISO)</label>
              <select className="form-select" id="monedaDefecto" name="moneda_defecto" value={formData.moneda_defecto} onChange={handleChange}>
                <option value="COP">COP - Peso Colombiano</option>
                <option value="USD">USD - Dólar Estadounidense</option>
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label text-900" htmlFor="impuestoDefecto">Impuesto Base por Defecto (IVA %)</label>
              <input className="form-control" id="impuestoDefecto" name="impuesto_defecto" type="number" step="0.01" value={formData.impuesto_defecto} onChange={handleChange} />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <h6 className="text-primary mb-0 border-bottom pb-2">Preferencias del Sistema</h6>
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" id="notifyUpdates" type="checkbox" defaultChecked />
                <label className="form-check-label text-900" htmlFor="notifyUpdates">Recibir notificaciones de actualizaciones</label>
              </div>
              <div className="form-check form-switch mt-2">
                <input className="form-check-input" id="weeklyReports" type="checkbox" />
                <label className="form-check-label text-900" htmlFor="weeklyReports">Enviar reportes semanales por correo electrónico</label>
              </div>
            </div>
          </div>

          <div className="text-end">
            <button className="btn btn-primary" type="button" onClick={handleSave} disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
