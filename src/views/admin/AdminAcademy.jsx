import React, { useState, useEffect } from 'react';
import academyAdminService from '../../services/academyAdminService';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function AdminAcademy() {
  const [activeTab, setActiveTab] = useState('courses'); // courses | articles | lessons
  const [courses, setCourses] = useState([]);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lessons State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);

  // Form states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  
  const [currentCourse, setCurrentCourse] = useState({ title: '', category_id: '', description: '', level: 'Básico', thumbnail_url: '', is_published: true });
  const [currentArticle, setCurrentArticle] = useState({ title: '', category_id: '', content: '', is_published: true });
  const [currentLesson, setCurrentLesson] = useState({ title: '', video_url: '', duration_minutes: 0, order: 1, is_free_preview: false, description: '' });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await academyAdminService.getCourses();
      if (res.data?.success) {
        setCourses(res.data.data.courses);
        if (activeTab === 'courses') setCategories(res.data.data.categories);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await academyAdminService.getArticles();
      if (res.data?.success) {
        setArticles(res.data.data.articles);
        if (activeTab === 'articles') setCategories(res.data.data.categories);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchLessons = async (courseId) => {
    setLoading(true);
    try {
      const res = await academyAdminService.getLessons(courseId);
      if (res.data?.success) {
        setLessons(res.data.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'courses') fetchCourses();
    if (activeTab === 'articles') fetchArticles();
    if (activeTab === 'lessons' && selectedCourse) fetchLessons(selectedCourse.id);
  }, [activeTab]);

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCourse.id) {
        await academyAdminService.updateCourse(currentCourse.id, currentCourse);
      } else {
        await academyAdminService.createCourse(currentCourse);
      }
      setShowCourseModal(false);
      fetchCourses();
    } catch (err) { alert("Error guardando el curso"); }
  };

  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentArticle.id) {
        await academyAdminService.updateArticle(currentArticle.id, currentArticle);
      } else {
        await academyAdminService.createArticle(currentArticle);
      }
      setShowArticleModal(false);
      fetchArticles();
    } catch (err) { alert("Error guardando el artículo"); }
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentLesson.id) {
        await academyAdminService.updateLesson(selectedCourse.id, currentLesson.id, currentLesson);
      } else {
        await academyAdminService.createLesson(selectedCourse.id, currentLesson);
      }
      setShowLessonModal(false);
      fetchLessons(selectedCourse.id);
    } catch (err) { alert("Error guardando la lección"); }
  };

  const openLessonsView = (course) => {
    setSelectedCourse(course);
    setActiveTab('lessons');
  };

  const closeLessonsView = () => {
    setSelectedCourse(null);
    setActiveTab('courses');
  };

  return (
    <div className="container-fluid pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold text-primary"><i className="fas fa-cogs me-2"></i>CMS Academia MindSoftia</h2>
      </div>

      {activeTab !== 'lessons' && (
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'courses' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('courses')}>
              <i className="fas fa-graduation-cap me-2"></i>Cursos LMS
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'articles' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('articles')}>
              <i className="fas fa-book me-2"></i>Artículos y Resoluciones
            </button>
          </li>
        </ul>
      )}

      {/* TABS CONTENT */}
      {loading ? (
        <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            
            {activeTab === 'courses' && (
              <>
                <div className="d-flex justify-content-between mb-3">
                  <h5 className="mb-0 fw-bold">Listado de Cursos</h5>
                  <button className="btn btn-sm btn-primary" onClick={() => { setCurrentCourse({ title: '', category_id: '', description: '', level: 'Básico', thumbnail_url: '', is_published: true }); setShowCourseModal(true); }}>
                    <i className="fas fa-plus me-1"></i>Nuevo Curso
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Título</th>
                        <th>Categoría</th>
                        <th>Nivel</th>
                        <th>Estado</th>
                        <th>Lecciones</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map(c => (
                        <tr key={c.id}>
                          <td className="fw-semi-bold">{c.title}</td>
                          <td>{c.category?.name}</td>
                          <td><span className="badge badge-soft-secondary">{c.level}</span></td>
                          <td>{c.is_published ? <span className="badge badge-soft-success">Publicado</span> : <span className="badge badge-soft-warning">Borrador</span>}</td>
                          <td>{c.lessons_count || 0}</td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-primary me-2 px-3" onClick={() => openLessonsView(c)} title="Ver Lecciones">
                              <i className="fas fa-list me-1"></i> Lecciones
                            </button>
                            <button className="btn btn-sm btn-link p-0 me-2" onClick={() => { setCurrentCourse(c); setShowCourseModal(true); }}><i className="fas fa-edit"></i></button>
                            <button className="btn btn-sm btn-link p-0 text-danger" onClick={async () => { if(window.confirm('¿Borrar curso?')) { await academyAdminService.deleteCourse(c.id); fetchCourses(); } }}><i className="fas fa-trash"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'lessons' && selectedCourse && (
              <>
                <div className="d-flex justify-content-between mb-3 align-items-center">
                  <div className="d-flex align-items-center">
                    <button className="btn btn-sm btn-outline-secondary me-3" onClick={closeLessonsView}>
                      <i className="fas fa-arrow-left me-1"></i> Volver
                    </button>
                    <h5 className="mb-0 fw-bold">Lecciones: <span className="text-primary">{selectedCourse.title}</span></h5>
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={() => { setCurrentLesson({ title: '', video_url: '', duration_minutes: 0, order: lessons.length + 1, is_free_preview: false, description: '' }); setShowLessonModal(true); }}>
                    <i className="fas fa-plus me-1"></i>Nueva Lección
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Orden</th>
                        <th>Título de la Lección</th>
                        <th>Duración (min)</th>
                        <th>Preview Gratis</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lessons.length === 0 ? (
                        <tr><td colSpan="5" className="text-center text-muted py-4">No hay lecciones en este curso.</td></tr>
                      ) : (
                        lessons.map(l => (
                          <tr key={l.id}>
                            <td>{l.order}</td>
                            <td className="fw-semi-bold">{l.title}</td>
                            <td>{l.duration_minutes}</td>
                            <td>{l.is_free_preview ? <i className="fas fa-check text-success"></i> : '-'}</td>
                            <td className="text-end">
                              <button className="btn btn-sm btn-link p-0 me-2" onClick={() => { setCurrentLesson(l); setShowLessonModal(true); }}><i className="fas fa-edit"></i></button>
                              <button className="btn btn-sm btn-link p-0 text-danger" onClick={async () => { if(window.confirm('¿Borrar lección?')) { await academyAdminService.deleteLesson(selectedCourse.id, l.id); fetchLessons(selectedCourse.id); } }}><i className="fas fa-trash"></i></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'articles' && (
              <>
                <div className="d-flex justify-content-between mb-3">
                  <h5 className="mb-0 fw-bold">Listado de Artículos</h5>
                  <button className="btn btn-sm btn-primary" onClick={() => { setCurrentArticle({ title: '', category_id: '', content: '', is_published: true }); setShowArticleModal(true); }}>
                    <i className="fas fa-plus me-1"></i>Nuevo Artículo
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Título</th>
                        <th>Categoría</th>
                        <th>Estado</th>
                        <th>Lecturas</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map(a => (
                        <tr key={a.id}>
                          <td className="fw-semi-bold text-primary">{a.title}</td>
                          <td>{a.category?.name}</td>
                          <td>{a.is_published ? <span className="badge badge-soft-success">Publicado</span> : <span className="badge badge-soft-warning">Borrador</span>}</td>
                          <td>{a.views}</td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-link p-0 me-2" onClick={() => { setCurrentArticle(a); setShowArticleModal(true); }}><i className="fas fa-edit"></i></button>
                            <button className="btn btn-sm btn-link p-0 text-danger" onClick={async () => { if(window.confirm('¿Borrar artículo?')) { await academyAdminService.deleteArticle(a.id); fetchArticles(); } }}><i className="fas fa-trash"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* COURSE MODAL */}
      {showCourseModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0">
              <form onSubmit={handleCourseSubmit}>
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-bold">{currentCourse.id ? 'Editar Curso' : 'Nuevo Curso'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCourseModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label">Título del Curso</label>
                      <input type="text" className="form-control" value={currentCourse.title} onChange={e => setCurrentCourse({...currentCourse, title: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Categoría</label>
                      <select className="form-select" value={currentCourse.category_id} onChange={e => setCurrentCourse({...currentCourse, category_id: e.target.value})} required>
                        <option value="">Seleccione...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Descripción</label>
                      <textarea className="form-control" rows="3" value={currentCourse.description} onChange={e => setCurrentCourse({...currentCourse, description: e.target.value})} required></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nivel</label>
                      <select className="form-select" value={currentCourse.level} onChange={e => setCurrentCourse({...currentCourse, level: e.target.value})} required>
                        <option value="Básico">Básico</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">URL de Miniatura (Thumbnail)</label>
                      <input type="url" className="form-control" value={currentCourse.thumbnail_url} onChange={e => setCurrentCourse({...currentCourse, thumbnail_url: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="coursePublished" checked={currentCourse.is_published} onChange={e => setCurrentCourse({...currentCourse, is_published: e.target.checked})} />
                        <label className="form-check-label" htmlFor="coursePublished">Publicado</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCourseModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* LESSON MODAL */}
      {showLessonModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content border-0">
              <form onSubmit={handleLessonSubmit}>
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-bold">{currentLesson.id ? 'Editar Lección' : 'Nueva Lección'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowLessonModal(false)}></button>
                </div>
                <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label">Título de la Lección</label>
                      <input type="text" className="form-control" value={currentLesson.title} onChange={e => setCurrentLesson({...currentLesson, title: e.target.value})} required />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Orden (#)</label>
                      <input type="number" className="form-control" value={currentLesson.order} onChange={e => setCurrentLesson({...currentLesson, order: e.target.value})} required min="1" />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Duración (min)</label>
                      <input type="number" className="form-control" value={currentLesson.duration_minutes} onChange={e => setCurrentLesson({...currentLesson, duration_minutes: e.target.value})} required min="0" />
                    </div>
                    <div className="col-12">
                      <label className="form-label">URL del Video (Vimeo, YouTube, etc.)</label>
                      <input type="url" className="form-control" value={currentLesson.video_url} onChange={e => setCurrentLesson({...currentLesson, video_url: e.target.value})} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label mb-1">Contenido de la Lección (Texto, PDFs, Apuntes)</label>
                      <div className="mb-2">
                        <ReactQuill 
                          theme="snow" 
                          value={currentLesson.description} 
                          onChange={(content) => setCurrentLesson({...currentLesson, description: content})} 
                          style={{ height: '250px', marginBottom: '50px' }}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch mt-2">
                        <input className="form-check-input" type="checkbox" id="lessonFree" checked={currentLesson.is_free_preview} onChange={e => setCurrentLesson({...currentLesson, is_free_preview: e.target.checked})} />
                        <label className="form-check-label" htmlFor="lessonFree">Lección Gratuita (Preview)</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowLessonModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar Lección</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ARTICLE MODAL */}
      {showArticleModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content border-0">
              <form onSubmit={handleArticleSubmit}>
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-bold">{currentArticle.id ? 'Editar Artículo' : 'Nuevo Artículo'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowArticleModal(false)}></button>
                </div>
                <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label">Título del Documento</label>
                      <input type="text" className="form-control" value={currentArticle.title} onChange={e => setCurrentArticle({...currentArticle, title: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Categoría</label>
                      <select className="form-select" value={currentArticle.category_id} onChange={e => setCurrentArticle({...currentArticle, category_id: e.target.value})} required>
                        <option value="">Seleccione...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label mb-1">Contenido Enriquecido del Artículo</label>
                      <div className="mb-2">
                        <ReactQuill 
                          theme="snow" 
                          value={currentArticle.content} 
                          onChange={(content) => setCurrentArticle({...currentArticle, content: content})} 
                          style={{ height: '350px', marginBottom: '50px' }}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch mt-2">
                        <input className="form-check-input" type="checkbox" id="articlePublished" checked={currentArticle.is_published} onChange={e => setCurrentArticle({...currentArticle, is_published: e.target.checked})} />
                        <label className="form-check-label" htmlFor="articlePublished">Publicado</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowArticleModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar Artículo</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
