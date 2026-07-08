import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { posDB } from '../../database/localPosDb';
import { posSyncService } from '../../services/posSyncService';
import { supabase } from '../../services/supabase';
import useAuthStore from '../../store/authStore';

function CategoriasList() {
  const { tenantId } = useAuthStore();
  const categorias = useLiveQuery(() => posDB.categorias_cache.toArray(), []);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    cuenta_contable_ingreso: '',
    cuenta_contable_costo: '',
    cuenta_contable_inventario: ''
  });

  const handleSync = async () => {
    setLoading(true);
    await posSyncService.syncCategorias();
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (cat) => {
    setFormData({
      nombre: cat.nombre,
      descripcion: cat.descripcion || '',
      cuenta_contable_ingreso: cat.cuenta_contable_ingreso || '',
      cuenta_contable_costo: cat.cuenta_contable_costo || '',
      cuenta_contable_inventario: cat.cuenta_contable_inventario || ''
    });
    setCurrentId(cat.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta categoría? Los productos asociados quedarán sin categoría.")) return;
    try {
      const { error } = await supabase.from('inv_categorias').delete().eq('id', id);
      if (error) throw error;
      await posSyncService.syncCategorias();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const openNewModal = () => {
    setFormData({ nombre: '', descripcion: '', cuenta_contable_ingreso: '', cuenta_contable_costo: '', cuenta_contable_inventario: '' });
    setCurrentId(null);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        empresa_id: tenantId,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        cuenta_contable_ingreso: formData.cuenta_contable_ingreso,
        cuenta_contable_costo: formData.cuenta_contable_costo,
        cuenta_contable_inventario: formData.cuenta_contable_inventario
      };
      
      let error;
      if (isEditing) {
        const res = await supabase.from('inv_categorias').update(payload).eq('id', currentId);
        error = res.error;
      } else {
        const res = await supabase.from('inv_categorias').insert([payload]);
        error = res.error;
      }
      
      
      if (error) throw error;
      
      // Sincronizar inmediatamente tras insertar en la nube
      await posSyncService.syncCategorias();
      setShowModal(false);
      setFormData({ nombre: '', descripcion: '', cuenta_contable_ingreso: '', cuenta_contable_costo: '', cuenta_contable_inventario: '' });
    } catch (err) {
      console.error("Error al guardar la categoría:", err);
      alert("Hubo un error al guardar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#F9FAFD', minHeight: '100vh' }}>
      
      {/* Header Actions */}
      <div className="card mb-3 shadow-none border">
        <div className="card-body p-3">
          <div className="row flex-between-center">
            <div className="col-sm-auto mb-2 mb-sm-0">
              <h5 className="mb-0 fw-bold">Catálogo de Categorías</h5>
            </div>
            <div className="col-sm-auto">
              <button className="btn btn-falcon-default btn-sm px-3" onClick={handleSync} disabled={loading}>
                <span className={`fas fa-sync-alt me-1 text-primary ${loading ? 'fa-spin' : ''}`}></span> Sincronizar Caché
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-none border mb-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0 fs--1">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="sort pe-1 align-middle white-space-nowrap">Nombre de Familia</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Descripción</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Cta. Ingreso</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Cta. Costo</th>
                  <th className="sort pe-1 align-middle white-space-nowrap">Cta. Inventario</th>
                  <th className="sort pe-1 align-middle text-end">Acciones</th>
                </tr>
              </thead>
              <tbody className="list">
                {categorias?.length > 0 ? (
                  categorias.map(cat => (
                    <tr key={cat.id}>
                      <td className="align-middle fw-bold">{cat.nombre}</td>
                      <td className="align-middle">{cat.descripcion || '-'}</td>
                      <td className="align-middle">
                        <span className="badge bg-success-subtle text-success">{cat.cuenta_contable_ingreso || 'N/A'}</span>
                      </td>
                      <td className="align-middle">
                        <span className="badge bg-danger-subtle text-danger">{cat.cuenta_contable_costo || 'N/A'}</span>
                      </td>
                      <td className="align-middle">
                        <span className="badge bg-info-subtle text-info">{cat.cuenta_contable_inventario || 'N/A'}</span>
                      </td>
                      <td className="align-middle text-end">
                        <button className="btn btn-link p-0 ms-2" title="Editar" onClick={() => handleEdit(cat)}>
                          <span className="text-500 fas fa-edit"></span>
                        </button>
                        <button className="btn btn-link p-0 ms-2 text-danger" title="Eliminar" onClick={() => handleDelete(cat.id)}>
                          <span className="text-500 fas fa-trash-alt"></span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No hay categorías en caché. Presiona "Sincronizar" o crea una nueva.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para Nueva Categoría */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(11,23,39,0.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-header bg-light">
                <h5 className="modal-title">{isEditing ? 'Editar Categoría' : 'Crear Categoría'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Nombre de la Categoría</label>
                      <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej. Lácteos, Electrodomésticos" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Descripción</label>
                      <textarea className="form-control" name="descripcion" value={formData.descripcion} onChange={handleChange} rows="2"></textarea>
                    </div>
                    <div className="row g-2">
                      <div className="col-md-4">
                        <label className="form-label fs--1">Cta. Ingreso (PUC)</label>
                        <input type="text" className="form-control form-control-sm" name="cuenta_contable_ingreso" value={formData.cuenta_contable_ingreso} onChange={handleChange} placeholder="Ej. 4135" />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fs--1">Cta. Costo (PUC)</label>
                        <input type="text" className="form-control form-control-sm" name="cuenta_contable_costo" value={formData.cuenta_contable_costo} onChange={handleChange} placeholder="Ej. 6135" />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fs--1">Cta. Inventario (PUC)</label>
                        <input type="text" className="form-control form-control-sm" name="cuenta_contable_inventario" value={formData.cuenta_contable_inventario} onChange={handleChange} placeholder="Ej. 1435" />
                      </div>
                    </div>
                    <div className="mt-2 text-muted fs--2">
                      <i className="fas fa-info-circle me-1"></i>
                      Asignar el PUC permitirá que el Motor Contable Invisible genere los comprobantes diarios automáticamente por cada venta.
                    </div>
                  </div>
                  <div className="modal-footer bg-light border-top-0">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary btn-sm px-4" disabled={loading}>
                      {loading ? <span className="fas fa-spinner fa-spin me-2"></span> : <span className="fas fa-save me-2"></span>}
                      {isEditing ? 'Actualizar' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button 
        className="btn btn-primary rounded-circle shadow d-flex align-items-center justify-content-center" 
        style={{ position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', zIndex: 1050 }}
        onClick={openNewModal}
        title="Crear Categoría"
      >
        <span className="fas fa-plus fs-2"></span>
      </button>

    </div>
  );
}

export default CategoriasList;
