import React, { useState } from 'react';

function UserRoles() {
  const [activeTab, setActiveTab] = useState('roles');

  // Mocks de Roles y Permisos (Fase de Diseño)
  const defaultRoles = [
    { id: 1, name: 'Propietario', isSystem: true, description: 'Acceso total y control de la empresa.' },
    { id: 2, name: 'Cajero / POS', isSystem: false, description: 'Acceso exclusivo al Punto de Venta y cobros.' },
    { id: 3, name: 'Contador', isSystem: false, description: 'Acceso a balances, PUC y reportes financieros.' },
    { id: 4, name: 'Vendedor', isSystem: false, description: 'Puede crear cotizaciones y clientes, sin ver márgenes.' },
  ];

  const permissionsMatrix = [
    { module: 'Ventas e Ingresos', keys: ['ventas.ver', 'ventas.crear', 'ventas.anular'] },
    { module: 'Punto de Venta (POS)', keys: ['pos.acceso', 'pos.cierre_caja', 'pos.descuentos'] },
    { module: 'Inventario', keys: ['inventario.ver', 'inventario.ajustar', 'inventario.costos'] },
    { module: 'Contabilidad', keys: ['contabilidad.ver', 'contabilidad.asientos', 'contabilidad.reportes'] },
    { module: 'Ajustes de Empresa', keys: ['ajustes.ver', 'ajustes.usuarios'] },
  ];

  // Mock estado de permisos por rol (Solo visual)
  const [rolePermissions, setRolePermissions] = useState({
    2: ['pos.acceso', 'pos.cierre_caja'], // Cajero
    3: ['contabilidad.ver', 'contabilidad.asientos', 'contabilidad.reportes'], // Contador
    4: ['ventas.ver', 'ventas.crear', 'inventario.ver'], // Vendedor
  });

  const handleTogglePermission = (roleId, permissionKey) => {
    setRolePermissions(prev => {
      const rolePerms = prev[roleId] || [];
      if (rolePerms.includes(permissionKey)) {
        return { ...prev, [roleId]: rolePerms.filter(k => k !== permissionKey) };
      } else {
        return { ...prev, [roleId]: [...rolePerms, permissionKey] };
      }
    });
  };

  const renderRolesTab = () => (
    <div className="card shadow-none border">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 className="mb-0 text-primary">Matriz de Roles y Permisos</h5>
        <button className="btn btn-outline-primary btn-sm">
          <span className="fas fa-plus me-2"></span>Nuevo Rol
        </button>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive scrollbar">
          <table className="table table-bordered table-striped mb-0">
            <thead className="bg-200 text-900">
              <tr>
                <th className="align-middle" style={{ minWidth: '200px' }}>Módulo / Permiso</th>
                {defaultRoles.map(role => (
                  <th key={role.id} className="text-center align-middle" style={{ minWidth: '150px' }}>
                    {role.name}
                    {role.isSystem && <span className="badge bg-danger ms-2" style={{ fontSize: '0.6rem' }}>Core</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionsMatrix.map((moduleGroup, idx) => (
                <React.Fragment key={idx}>
                  <tr className="bg-100">
                    <td colSpan={defaultRoles.length + 1} className="fw-bold text-dark py-2">
                      <span className="fas fa-folder-open me-2 text-primary"></span>
                      {moduleGroup.module}
                    </td>
                  </tr>
                  {moduleGroup.keys.map(permKey => (
                    <tr key={permKey}>
                      <td className="ps-4">
                        <code className="text-500">{permKey}</code>
                      </td>
                      {defaultRoles.map(role => {
                        if (role.isSystem) {
                          return (
                            <td key={role.id} className="text-center align-middle">
                              <span className="fas fa-check-circle text-success fs-1"></span>
                            </td>
                          );
                        }
                        
                        const isChecked = (rolePermissions[role.id] || []).includes(permKey);
                        return (
                          <td key={role.id} className="text-center align-middle">
                            <div className="form-check form-switch d-flex justify-content-center mb-0">
                              <input 
                                className="form-check-input" 
                                type="checkbox" 
                                role="switch" 
                                checked={isChecked}
                                onChange={() => handleTogglePermission(role.id, permKey)}
                                style={{ cursor: 'pointer' }}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card-footer bg-light text-end">
        <button className="btn btn-primary btn-sm">
          <span className="fas fa-save me-2"></span>Guardar Cambios
        </button>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="card shadow-none border">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 className="mb-0 text-primary">Directorio de Empleados</h5>
        <button className="btn btn-primary btn-sm">
          <span className="fas fa-user-plus me-2"></span>Invitar Usuario
        </button>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="bg-200 text-900">
              <tr>
                <th>Usuario</th>
                <th>Rol Asignado</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="avatar avatar-xl me-2">
                      <div className="avatar-name rounded-circle bg-primary-subtle text-primary"><span>AM</span></div>
                    </div>
                    <div>
                      <h6 className="mb-0">Andres Mendoza</h6>
                      <small className="text-500">andres@empresa.com</small>
                    </div>
                  </div>
                </td>
                <td><span className="badge bg-primary">Propietario</span></td>
                <td><span className="badge bg-success-subtle text-success">Activo</span></td>
                <td className="text-end">
                  <button className="btn btn-link text-600 p-0 me-2"><span className="fas fa-edit"></span></button>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="avatar avatar-xl me-2">
                      <div className="avatar-name rounded-circle bg-warning-subtle text-warning"><span>LC</span></div>
                    </div>
                    <div>
                      <h6 className="mb-0">Laura Cajera</h6>
                      <small className="text-500">laura.c@empresa.com</small>
                    </div>
                  </div>
                </td>
                <td>
                  <select className="form-select form-select-sm w-auto">
                    <option>Propietario</option>
                    <option selected>Cajero / POS</option>
                    <option>Contador</option>
                    <option>Vendedor</option>
                  </select>
                </td>
                <td><span className="badge bg-warning-subtle text-warning">Pendiente (Invitación)</span></td>
                <td className="text-end">
                  <button className="btn btn-link text-600 p-0 me-2" title="Re-enviar invitación"><span className="fas fa-envelope"></span></button>
                  <button className="btn btn-link text-danger p-0" title="Revocar acceso"><span className="fas fa-trash"></span></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid px-0">
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-transparent-50 overflow-hidden">
            <div className="card-header position-relative">
              <div className="bg-holder d-none d-md-block bg-card z-index-1" style={{ backgroundImage: 'url(/falcon/assets/img/illustrations/corner-2.png)', backgroundSize: '250px', backgroundPosition: 'right bottom' }}></div>
              <div className="position-relative z-index-2">
                <h3 className="text-primary mb-1">Control de Acceso (RBAC)</h3>
                <p className="mb-0 text-700">Gestiona quién tiene acceso a cada módulo de tu empresa. Configura switches de permisos por cada rol.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {/* Tabs Nav */}
          <ul className="nav nav-tabs mb-3" role="tablist">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'roles' ? 'active fw-bold' : ''}`}
                onClick={() => setActiveTab('roles')}
              >
                <span className="fas fa-shield-alt me-2"></span>Roles y Permisos
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'users' ? 'active fw-bold' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <span className="fas fa-users me-2"></span>Empleados (Usuarios)
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'roles' && renderRolesTab()}
            {activeTab === 'users' && renderUsersTab()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserRoles;
