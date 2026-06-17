import React from 'react';

function Settings() {
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
            <button className="btn btn-primary" type="button">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
