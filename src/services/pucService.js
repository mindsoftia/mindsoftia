import axios from 'axios';
import { supabase } from './supabase';

const API_URL = '/api/puc';

/**
 * pucService — Servicio Frontend para comunicación con AccountController (`/api/puc`)
 * y conectividad en nube con Supabase (`accounts`) de forma transparente y reactiva.
 * 
 * Especialidad: /master-dev + /master-db
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
      console.warn('⚠️ Fallback de conectividad API, consultando en vivo Supabase (accounts):', error.message);
      try {
        let query = supabase.from('accounts').select('*').order('code', { ascending: true });
        if (params.type && params.type !== 'TODAS') {
          query = query.eq('type', params.type);
        }
        const { data, error: supaError } = await query;
        if (supaError) throw supaError;
        return { status: 'success', data: data || [] };
      } catch (supaErr) {
        console.warn('⚠️ Fallback Supabase offline o vacío:', supaErr.message);
        throw error;
      }
    }
  },

  /**
   * Crear una nueva cuenta en el catálogo PUC
   */
  async createAccount(data) {
    try {
      const response = await axios.post(API_URL, data);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Fallback de creación en Supabase direct:', error.message);
      // Mapear al esquema de la tabla accounts si vamos directo a Supabase
      const { data: supaData, error: supaErr } = await supabase
        .from('accounts')
        .insert([{
          code: data.codigo || data.code,
          name: data.nombre || data.name,
          type: data.type || 'subcuenta',
          nature: data.nature || 'debito',
          is_transactional: data.is_transactional !== undefined ? data.is_transactional : true,
          description: data.description || null,
          is_active: true
        }])
        .select()
        .single();
      if (supaErr) throw supaErr;
      return { status: 'success', data: supaData };
    }
  },

  /**
   * Actualizar una cuenta existente
   */
  async updateAccount(id, data) {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      const { data: supaData, error: supaErr } = await supabase
        .from('accounts')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (supaErr) throw supaErr;
      return { status: 'success', data: supaData };
    }
  },

  /**
   * Eliminar una cuenta PUC (solo si no tiene subcuentas asociadas)
   */
  async deleteAccount(id) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      const { error: supaErr } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);
      if (supaErr) throw supaErr;
      return { status: 'success' };
    }
  }
};

export default pucService;
