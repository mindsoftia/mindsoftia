import React from 'react';

function Users() {
  const users = [
    { name: 'Ana Silva', email: 'ana.silva@example.com', role: 'Administrador', status: 'Activo', registered: '12 May, 2026' },
    { name: 'Juan Carlos', email: 'juan.carlos@example.com', role: 'Editor', status: 'Inactivo', registered: '05 Ene, 2026' },
    { name: 'Sofía Castro', email: 'sofia.castro@example.com', role: 'Suscriptor', status: 'Activo', registered: '22 Feb, 2026' }
  ];

  return (
    <div className="card h-100">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Gestión de Usuarios</h5>
        <button className="btn btn-sm btn-primary">
          <span className="fas fa-user-plus me-1"></span> Invitar Usuario
        </button>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped mb-0">
            <thead className="bg-200 text-900">
              <tr>
                <th className="ps-3">Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th className="pe-3">Registro</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={idx} className="align-middle">
                  <td className="ps-3 fw-semi-bold">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className={`badge rounded-pill badge-soft-${u.status === 'Activo' ? 'success' : 'secondary'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="pe-3">{u.registered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Users;
