import api from './api';

const academyAdminService = {
  // COURSES
  getCourses: () => api.get('/admin/academy/courses'),
  createCourse: (data) => api.post('/admin/academy/courses', data),
  updateCourse: (id, data) => api.put(`/admin/academy/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/academy/courses/${id}`),

  // LESSONS
  getLessons: (courseId) => api.get(`/admin/academy/courses/${courseId}/lessons`),
  createLesson: (courseId, data) => api.post(`/admin/academy/courses/${courseId}/lessons`, data),
  updateLesson: (courseId, lessonId, data) => api.put(`/admin/academy/courses/${courseId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId, lessonId) => api.delete(`/admin/academy/courses/${courseId}/lessons/${lessonId}`),

  // ARTICLES
  getArticles: () => api.get('/admin/academy/articles'),
  createArticle: (data) => api.post('/admin/academy/articles', data),
  updateArticle: (id, data) => api.put(`/admin/academy/articles/${id}`, data),
  deleteArticle: (id) => api.delete(`/admin/academy/articles/${id}`),
};

export default academyAdminService;
