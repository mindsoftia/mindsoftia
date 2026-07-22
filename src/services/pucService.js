import axios from 'axios';

const API_URL = '/api/puc';

/**
 * pucService — Servicio Frontend para comunicación con AccountController (`/api/puc`)
 * 
 * Especialidad: /master-dev
 */
export const pucService = {
  /**
   * Obtener el listado de cuentas PUC del tenant actual
   */
  async getAccounts(params = {}) {
    try {
      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.warn('⚠️ Fallback de conectividad local en pucService:', error.message);
      throw error;
    }
  },

  /**
   * Crear una nueva cuenta en el catálogo PUC
   */
  async createAccount(data) {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  /**
   * Actualizar una cuenta existente
   */
  async updateAccount(id, data) {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar una cuenta PUC (solo si no tiene subcuentas asociadas)
   */
  async deleteAccount(id) {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  }
};

export default pucService;
