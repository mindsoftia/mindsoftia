import React, { useState, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

function RolesPermissions() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuthStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resRoles, resPerms] = await Promise.all([
        api.get('/roles'),
        api.get('/permisos')
      ]);
      setRoles(resRoles.data);
      setPermissions(resPerms.data); // This is grouped by module
      setLoading(false);
    } catch (error) {
      console.error("Error cargando datos", error);
      setLoading(false);
    }
  };

  const handleToggle = async (roleId, permissionId, hasIt) => {
    // If it's SuperAdmin, block it early or disable the checkbox
    if (roleId === 1) return;

    // Find the role and toggle locally first (optimistic UI)
    const newRoles = roles.map(r => {
      if (r.id_rol === roleId) {
        let newPerms = [...r.permisos];
        if (hasIt) {
          newPerms = newPerms.filter(p => p.id_permiso !== permissionId);
        } else {
          newPerms.push({ id_permiso: permissionId });
        }
        return { ...r, permisos: newPerms };
      }
      return r;
    });
    setRoles(newRoles);

    // Get the array of IDs to send
    const roleToUpdate = newRoles.find(r => r.id_rol === roleId);
    const permIds = roleToUpdate.permisos.map(p => p.id_permiso);

    try {
      await api.post(`/roles/${roleId}/permisos`, { permisos_ids: permIds });
      // Toast success
    } catch (error) {
      console.error("Error guardando", error);
      // Revert if error
      fetchData();
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;

  if (!hasPermission('seguridad.editar')) {
    return (
      <div className="card shadow-none border border-danger">
        <div className="card-body p-4 text-center">
          <span className="fas fa-lock text-danger fs-3 mb-3"></span>
          <h5 className="text-danger">Acceso Denegado</h5>
          <p className="mb-0">No tienes permisos para ver o modificar la matriz de seguridad.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-3">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0 text-primary"><span className="fas fa-shield-alt me-2"></span> Matriz de Permisología</h5>
          <p className="fs--1 mb-0 text-600">Otorga o revoca accesos a los roles del sistema con un solo clic.</p>
        </div>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive scrollbar">
          <table className="table table-sm table-bordered table-hover mb-0 fs--1">
            <thead className="bg-200 text-900">
              <tr>
                <th className="align-middle border-bottom border-200" style={{ minWidth: '200px' }}>Módulo / Acción</th>
                {roles.map(rol => (
                  <th key={rol.id_rol} className="align-middle border-bottom text-center" style={{ minWidth: '120px' }}>
                    {rol.nombre_rol}
                    {rol.id_rol === 1 && <span className="ms-1 fas fa-lock text-500" title="Inmodificable"></span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(permissions).map(([modulo, listaPermisos]) => (
                <React.Fragment key={modulo}>
                  {/* Fila del nombre del Módulo */}
                  <tr className="bg-100">
                    <td colSpan={roles.length + 1} className="fw-bold text-dark py-2">
                      <span className="fas fa-cube text-primary me-2"></span> Módulo: {modulo}
                    </td>
                  </tr>
                  {/* Filas de las acciones (Crear, Editar, etc) */}
                  {listaPermisos.map(permiso => (
                    <tr key={permiso.id_permiso}>
                      <td className="ps-4 text-700">
                        {permiso.accion_permiso} 
                        <span className="badge badge-soft-secondary ms-2 fw-normal">{permiso.codigo_permiso}</span>
                      </td>
                      {roles.map(rol => {
                        const hasPerm = rol.permisos.some(p => p.id_permiso === permiso.id_permiso);
                        const isSuperAdmin = rol.id_rol === 1;
                        return (
                          <td key={`${rol.id_rol}-${permiso.id_permiso}`} className="text-center align-middle">
                            <div className="form-check form-switch d-flex justify-content-center mb-0">
                              <input 
                                className="form-check-input" 
                                type="checkbox" 
                                style={{ cursor: isSuperAdmin ? 'not-allowed' : 'pointer' }}
                                checked={isSuperAdmin ? true : hasPerm}
                                disabled={isSuperAdmin}
                                onChange={() => handleToggle(rol.id_rol, permiso.id_permiso, hasPerm)}
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
    </div>
  );
}

export default RolesPermissions;
