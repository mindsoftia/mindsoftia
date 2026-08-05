import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

export default function Academy() {
  const [courses, setCourses] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCourseFilter, setActiveCourseFilter] = useState('all');
  const [activeArticleFilter, setActiveArticleFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('cursos'); // 'cursos' | 'kb'
  const [courseViewMode, setCourseViewMode] = useState('cards'); // 'cards' | 'table'
  const [articleViewMode, setArticleViewMode] = useState('list'); // 'list' | 'table'

  useEffect(() => {
    const fetchAcademyData = async () => {
      try {
        setLoading(true);
        const [coursesRes, articlesRes] = await Promise.all([
          api.get('/academy/courses'),
          api.get('/academy/kb/articles')
        ]);
        
        if (coursesRes.data?.success) {
          setCourses(coursesRes.data.data);
        }
        if (articlesRes.data?.success) {
          setArticles(articlesRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching academy data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAcademyData();
  }, []);

  // Extraer categorías únicas
  const courseCategories = useMemo(() => {
    const cats = courses.map(c => c.category);
    return [...new Set(cats)];
  }, [courses]);

  const articleCategories = useMemo(() => {
    const cats = articles.map(a => a.category);
    return [...new Set(cats)];
  }, [articles]);

  // Filtrar
  const filteredCourses = useMemo(() => {
    let result = courses;
    if (activeCourseFilter !== 'all') {
      result = result.filter(c => c.category === activeCourseFilter);
    }
    if (search) {
      result = result.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }, [courses, activeCourseFilter, search]);

  const filteredArticles = useMemo(() => {
    let result = articles;
    if (activeArticleFilter !== 'all') {
      result = result.filter(a => a.category === activeArticleFilter);
    }
    if (search) {
      result = result.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }, [articles, activeArticleFilter, search]);

  return (
    <div className="pb-5">
      {/* HERO SECTION */}
      <div className="card mb-3 bg-light overflow-hidden shadow-sm border-0">
        <div className="card-body p-4 p-md-5 position-relative">
          <div className="row justify-content-between align-items-center">
            <div className="col-lg-7 position-relative z-index-1">
              <span className="badge badge-soft-primary mb-2 px-3 py-2 fs--1 rounded-pill"><i className="fas fa-bolt me-1 text-warning"></i> Nuevo Módulo Abierto</span>
              <h1 className="fw-bold text-primary mb-3 display-5">MindSoftia Academy</h1>
              <p className="lead text-700 mb-4 fw-semi-bold">
                Domina la normatividad DIAN, las NIIF y maximiza el uso del ecosistema ERP con cursos y artículos en vivo creados por expertos.
              </p>
              <div className="input-group mb-3 shadow-lg rounded-3 overflow-hidden">
                <span className="input-group-text bg-white border-0 ps-4 text-primary"><i className="fas fa-search fs-1"></i></span>
                <input 
                  type="text" 
                  className="form-control form-control-lg border-0 bg-white" 
                  placeholder="¿Qué quieres aprender hoy? (Ej: CUFE, Nómina, Retefuente)" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ boxShadow: 'none' }}
                />
                <button className="btn btn-primary px-4 fw-bold" type="button">
                  Buscar
                </button>
              </div>
            </div>
            <div className="col-lg-4 d-none d-lg-block text-center position-relative">
               <div className="bg-white rounded-circle position-absolute top-50 start-50 translate-middle" style={{ width: '300px', height: '300px', filter: 'blur(60px)', opacity: 0.5, zIndex: 0 }}></div>
               <img src="https://illustrations.popsy.co/amber/student-going-to-school.svg" alt="Academy" className="img-fluid position-relative z-index-1" style={{ maxHeight: '280px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* PESTAÑAS (TABS) */}
      <ul className="nav nav-tabs mb-4" id="academyTabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'cursos' ? 'active fw-bold' : ''}`} 
            onClick={() => setActiveTab('cursos')}
          >
            <i className="fas fa-graduation-cap me-2"></i>Cursos Especializados
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'kb' ? 'active fw-bold' : ''}`} 
            onClick={() => setActiveTab('kb')}
          >
            <i className="fas fa-book-open me-2"></i>Base de Conocimiento
          </button>
        </li>
      </ul>

      {/* CONTENIDO DE PESTAÑAS */}
      <div className="tab-content">
        
        {/* PESTAÑA: CURSOS */}
        {activeTab === 'cursos' && (
          <div className="tab-pane fade show active">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
              <h4 className="fw-bold mb-3 mb-md-0 text-700">Explora nuestro catálogo</h4>
              <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
                <div className="d-flex gap-2 flex-wrap">
                  <button className={`btn btn-sm ${activeCourseFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setActiveCourseFilter('all')}>Todos</button>
                  {courseCategories.map(cat => (
                     <button key={cat} className={`btn btn-sm ${activeCourseFilter === cat ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setActiveCourseFilter(cat)}>{cat}</button>
                  ))}
                </div>
                <div className="btn-group btn-group-sm" role="group">
                  <button type="button" className={`btn ${courseViewMode === 'cards' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setCourseViewMode('cards')}><i className="fas fa-th-large"></i></button>
                  <button type="button" className={`btn ${courseViewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setCourseViewMode('table')}><i className="fas fa-table"></i></button>
                </div>
              </div>
            </div>
            
            <div className="mb-5">
              {loading ? (
                <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
              ) : filteredCourses.length === 0 ? (
                 <div className="text-center py-4 text-500">No se encontraron cursos para esta categoría o búsqueda.</div>
              ) : (
                courseViewMode === 'cards' ? (
                  <div className="row g-3">
                    {filteredCourses.map(course => (
                      <div key={course.id} className="col-md-6 col-xl-4">
                        <div className="card h-100 hover-shadow transition-base cursor-pointer border-0 shadow-sm overflow-hidden rounded-3">
                          <div className="position-relative">
                             <img src={course.thumbnail} className="card-img-top" alt={course.title} style={{ height: '200px', objectFit: 'cover' }} />
                             <div className="position-absolute top-0 end-0 p-2">
                                 <span className="badge bg-white text-dark shadow-sm px-2 py-1 fs--2 rounded-pill fw-bold"><i className="fas fa-star text-warning me-1"></i>4.9</span>
                             </div>
                          </div>
                          
                          <div className="card-body d-flex flex-column p-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="badge badge-soft-info px-2 py-1">{course.category}</span>
                              <span className="badge badge-soft-secondary px-2 py-1"><i className="fas fa-signal me-1"></i>{course.level}</span>
                            </div>
                            <h5 className="card-title fw-bold text-1000 mb-2">{course.title}</h5>
                            <p className="card-text text-600 fs--1 flex-1">{course.description}</p>
                            
                            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                              <span className="fs--2 text-700 fw-semi-bold"><i className="fas fa-video me-1 text-primary"></i> {course.lessons_count} Clases</span>
                              <span className="fs--2 text-700 fw-semi-bold"><i className="fas fa-clock me-1 text-warning"></i> {course.duration}</span>
                            </div>
                            
                            {course.progress > 0 && (
                              <div className="mt-3">
                                <div className="d-flex justify-content-between fs--2 mb-1">
                                  <span className="fw-bold text-700">Progreso</span>
                                  <span className="text-primary fw-bold">{course.progress}%</span>
                                </div>
                                <div className="progress bg-200 rounded-pill" style={{ height: '6px' }}>
                                  <div className="progress-bar bg-primary rounded-pill" role="progressbar" style={{ width: `${course.progress}%` }}></div>
                                </div>
                              </div>
                            )}
                            
                            <button className={`btn btn-sm w-100 mt-3 fw-bold ${course.progress > 0 ? 'btn-outline-primary' : 'btn-primary'}`}>
                              {course.progress > 0 ? 'Continuar Curso' : 'Iniciar Curso'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card shadow-sm border-0 rounded-3">
                    <div className="table-responsive">
                      <table className="table table-hover table-sm border-bottom mb-0">
                         <thead className="bg-200">
                           <tr>
                             <th className="border-0 align-middle py-3 px-4">Curso</th>
                             <th className="border-0 align-middle py-3">Categoría</th>
                             <th className="border-0 align-middle py-3">Nivel</th>
                             <th className="border-0 align-middle py-3">Clases / Duración</th>
                             <th className="border-0 align-middle py-3">Progreso</th>
                             <th className="border-0 align-middle py-3 text-end px-4">Acción</th>
                           </tr>
                         </thead>
                         <tbody>
                            {filteredCourses.map(course => (
                              <tr key={course.id} className="align-middle transition-base hover-bg-light cursor-pointer">
                                <td className="py-3 px-4">
                                  <div className="d-flex align-items-center">
                                    <div className="avatar avatar-xl me-3 d-none d-md-block" style={{width: '60px', height: '60px'}}>
                                      <img src={course.thumbnail} alt="" className="rounded shadow-sm" style={{ objectFit: 'cover' }} />
                                    </div>
                                    <div>
                                      <h6 className="mb-1 fw-bold text-primary">{course.title}</h6>
                                      <p className="mb-0 fs--2 text-500 text-truncate" style={{maxWidth: '300px'}}>{course.description}</p>
                                    </div>
                                  </div>
                                </td>
                                <td><span className="badge badge-soft-info">{course.category}</span></td>
                                <td><span className="badge badge-soft-secondary">{course.level}</span></td>
                                <td>
                                  <div className="fs--2 text-700 fw-semi-bold">
                                    <i className="fas fa-video text-primary me-1"></i>{course.lessons_count} Clases <br />
                                    <i className="fas fa-clock text-warning me-1"></i>{course.duration}
                                  </div>
                                </td>
                                <td>
                                   {course.progress > 0 ? (
                                     <div className="d-flex align-items-center gap-2" style={{minWidth: '100px'}}>
                                       <div className="progress flex-1" style={{ height: '6px' }}>
                                         <div className="progress-bar bg-primary rounded-pill" style={{ width: `${course.progress}%` }}></div>
                                       </div>
                                       <span className="fs--2 fw-bold text-700">{course.progress}%</span>
                                     </div>
                                   ) : <span className="badge badge-soft-secondary fs--2">No iniciado</span>}
                                </td>
                                <td className="text-end px-4">
                                   <button className={`btn btn-sm fw-bold ${course.progress > 0 ? 'btn-outline-primary' : 'btn-primary'}`}>
                                     {course.progress > 0 ? 'Continuar' : 'Iniciar'}
                                   </button>
                                </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA: KNOWLEDGE BASE */}
        {activeTab === 'kb' && (
          <div className="tab-pane fade show active">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
              <h4 className="fw-bold mb-3 mb-md-0 text-700">Artículos y Resoluciones DIAN</h4>
              <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
                <div className="d-flex gap-2 flex-wrap">
                  <button className={`btn btn-sm ${activeArticleFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setActiveArticleFilter('all')}>Todos</button>
                  {articleCategories.map(cat => (
                     <button key={cat} className={`btn btn-sm ${activeArticleFilter === cat ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setActiveArticleFilter(cat)}>{cat}</button>
                  ))}
                </div>
                <div className="btn-group btn-group-sm" role="group">
                  <button type="button" className={`btn ${articleViewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setArticleViewMode('list')}><i className="fas fa-list"></i></button>
                  <button type="button" className={`btn ${articleViewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setArticleViewMode('table')}><i className="fas fa-table"></i></button>
                </div>
              </div>
            </div>
            
            <div className="card shadow-sm border-0 rounded-3 mb-5">
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
                ) : filteredArticles.length === 0 ? (
                   <div className="text-center py-4 text-500">No se encontraron artículos para esta categoría o búsqueda.</div>
                ) : (
                  articleViewMode === 'list' ? (
                    <div className="list-group list-group-flush">
                      {filteredArticles.map(article => (
                        <a key={article.id} href="#!" className="list-group-item list-group-item-action p-4 d-flex align-items-center transition-base hover-bg-light border-bottom">
                          <div className="avatar avatar-xl me-3 d-none d-md-block">
                            <div className="avatar-name rounded-circle bg-soft-primary text-primary fs-1"><i className="fas fa-file-alt"></i></div>
                          </div>
                          <div className="flex-1">
                            <h6 className="mb-1 fw-bold text-primary fs-0">{article.title}</h6>
                            <span className="badge badge-soft-secondary me-2 fs--2">{article.category}</span>
                            <span className="text-500 fs--2"><i className="fas fa-calendar-alt me-1"></i>{article.date}</span>
                          </div>
                          <div className="d-none d-sm-block text-end fs--2 text-600 fw-semi-bold">
                            <span className="me-3"><i className="fas fa-eye me-1 text-primary"></i>{article.views} lecturas</span>
                            <span className="text-success"><i className="fas fa-thumbs-up me-1"></i>{article.helpful} útiles</span>
                          </div>
                          <div className="ms-3 d-none d-md-block">
                             <span className="fas fa-chevron-right text-300"></span>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover table-sm border-bottom mb-0">
                         <thead className="bg-200">
                           <tr>
                             <th className="border-0 align-middle py-3 px-4">Documento / Artículo</th>
                             <th className="border-0 align-middle py-3">Categoría</th>
                             <th className="border-0 align-middle py-3">Vigencia / Fecha</th>
                             <th className="border-0 align-middle py-3 text-center"><i className="fas fa-eye text-500"></i> Lecturas</th>
                             <th className="border-0 align-middle py-3 text-center"><i className="fas fa-thumbs-up text-500"></i> Útiles</th>
                           </tr>
                         </thead>
                         <tbody>
                            {filteredArticles.map(article => (
                              <tr key={article.id} className="align-middle cursor-pointer transition-base hover-bg-light">
                                <td className="py-3 px-4">
                                  <a href="#!" className="fw-bold text-primary">{article.title}</a>
                                </td>
                                <td><span className="badge badge-soft-secondary">{article.category}</span></td>
                                <td className="text-600 fs--1"><i className="fas fa-calendar-alt me-1 text-500"></i>{article.date}</td>
                                <td className="text-center fw-semi-bold text-600 fs--1">{article.views}</td>
                                <td className="text-center fw-semi-bold text-success fs--1">{article.helpful}</td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
              <div className="card-footer bg-light text-center p-3 border-0">
                <a href="#!" className="fw-bold fs--1 text-primary">Ver todo el catálogo de artículos <i className="fas fa-angle-right ms-1"></i></a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
