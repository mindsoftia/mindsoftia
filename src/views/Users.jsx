import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

function Users() {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ id: null, name: '', email: '', id_rol: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Cargar datos al montar
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener Roles
      const { data: rolesData } = await supabase.from('cnf_roles').select('*');
      if (rolesData) setRoles(rolesData);

      // Obtener Usuarios (Asumiendo que hay una tabla 'users' o similar en public)
      // Ajustar 'users' al nombre exacto de tu tabla de perfiles en Supabase si es distinto
      const { data: usersData, error } = await supabase
        .from('users') // Cambiar por el nombre real de la tabla pública de usuarios si es otra
        .select(`
          id,
          name,
          email,
          created_at
          /* id_rol */ 
        `);
      
      if (error) throw error;
      
      // Mapeo temporal si la estructura cambia
      const formattedUsers = (usersData || []).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || 'N/A', // Asumiendo que puede haber un campo phone
        id_rol: u.id_rol || 3, // Fallback
        role: rolesData?.find(r => r.id_rol === (u.id_rol || 3))?.nombre_rol || 'Usuario',
        registered: new Date(u.created_at).toLocaleDateString(),
        initials: u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'US'
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      // Fallback temporal visual si no existe la tabla
      setUsers([
        { id: 1, name: 'Ana Silva', email: 'ana.silva@example.com', phone: '(201) 200-1851', role: 'Super Administrador', registered: '12/05/2026', initials: 'AS' },
        { id: 2, name: 'Juan Carlos', email: 'juan.carlos@example.com', phone: '(212) 228-8403', role: 'Analista de Cartera', registered: '05/01/2026', initials: 'JC' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ id: null, name: '', email: '', id_rol: '' });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      id_rol: user.id_rol
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      
      fetchData(); // Recargar tras eliminar
    } catch (error) {
      alert('Error eliminando: ' + error.message);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        id_rol: formData.id_rol || null
      };

      if (isEditing) {
        const { error } = await supabase.from('users').update(payload).eq('id', formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('users').insert([payload]);
        if (error) throw error;
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Error guardando usuario: ' + error.message);
    }
  };

  return (
    <>
      <div className="card mb-3">
        <div className="card-header border-bottom">
          <div className="row flex-between-end">
            <div className="col-auto align-self-center">
              <h5 className="mb-0" data-anchor="data-anchor">Usuarios del Sistema</h5>
            </div>
            <div className="col-auto ms-auto">
              <div className="d-flex align-items-center">
                <button className="btn btn-sm btn-outline-secondary me-2" onClick={fetchData}>
                  <span className="fas fa-sync-alt"></span> Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          <div className="table-responsive scrollbar">
            <table className="table table-sm table-striped fs--1 mb-0 overflow-hidden">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="pe-1 align-middle text-center" style={{ width: '28px' }}>
                    <div className="form-check mb-0 fs-0">
                      <input className="form-check-input" type="checkbox" />
                    </div>
                  </th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Nombre</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Email</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Rol</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Fecha Registro</th>
                  <th className="align-middle no-sort"></th>
                </tr>
              </thead>
              <tbody className="list">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-3">Cargando usuarios...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-3">No hay usuarios registrados.</td></tr>
                ) : (
                  users.map((u) => (
                    <tr className="btn-reveal-trigger" key={u.id}>
                      <td className="align-middle text-center">
                        <div className="form-check mb-0 fs-0">
                          <input className="form-check-input" type="checkbox" id={`user-${u.id}`} />
                        </div>
                      </td>
                      <td className="name align-middle white-space-nowrap py-2">
                        <div className="d-flex d-flex align-items-center">
                          <div className="avatar avatar-xl me-2">
                            <div className="avatar-name rounded-circle"><span>{u.initials}</span></div>
                          </div>
                          <div className="flex-1">
                            <h5 className="mb-0 fs--1">{u.name}</h5>
                          </div>
                        </div>
                      </td>
                      <td className="email align-middle py-2"><a href={`mailto:${u.email}`}>{u.email}</a></td>
                      <td className="role align-middle white-space-nowrap py-2">{u.role}</td>
                      <td className="joined align-middle py-2">{u.registered}</td>
                      <td className="align-middle white-space-nowrap py-2 text-end">
                        <div className="dropdown font-sans-serif position-static">
                          <button className="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span className="fas fa-ellipsis-h fs--1"></span>
                          </button>
                          <div className="dropdown-menu dropdown-menu-end border py-0">
                            <div className="py-2">
                              <button className="dropdown-item" onClick={() => openEditModal(u)}>Editar</button>
                              <button className="dropdown-item text-danger" onClick={() => handleDelete(u.id)}>Eliminar</button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Botón Flotante Circular (FAB) */}
      <button 
        className="btn btn-primary rounded-circle shadow-lg position-fixed d-flex align-items-center justify-content-center"
        style={{ width: '60px', height: '60px', bottom: '30px', right: '30px', zIndex: 1050 }}
        onClick={openAddModal}
      >
        <span className="fas fa-plus fs-2"></span>
      </button>

      {/* Modal Auténtico Estilo Falcon */}
      {showModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content position-relative border-0 shadow-lg">
                <div className="modal-header bg-shape" style={{ backgroundColor: '#004DCC' }}>
                  <h5 className="modal-title text-white">{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h5>
                  <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <form>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="name">Nombre Completo</label>
                      <input 
                        className="form-control" id="name" type="text" 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="email">Correo Electrónico</label>
                      <input 
                        className="form-control" id="email" type="email" 
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                        disabled={isEditing} // Generalmente no se edita el correo de login
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="role">Rol en el Sistema</label>
                      <select 
                        className="form-select" id="role"
                        value={formData.id_rol} onChange={e => setFormData({...formData, id_rol: e.target.value})}
                      >
                        <option value="">Selecciona un rol...</option>
                        {roles.map(r => (
                          <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
                        ))}
                      </select>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary btn-sm" type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="btn btn-primary btn-sm" type="button" onClick={handleSave}>
                    {isEditing ? 'Actualizar Cambios' : 'Guardar Usuario'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
}

export default Users;
