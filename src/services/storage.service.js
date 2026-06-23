import { supabase } from './supabase';

/**
 * Servicio para manejar archivos (Storage) con arquitectura Multi-Tenant.
 * Asume que los archivos se guardan en el bucket "archivos_empresas" y
 * que la ruta base siempre comienza con el tenant_id.
 */

const BUCKET_NAME = 'archivos_empresas';

export const StorageService = {
  /**
   * Sube un archivo al espacio específico del tenant.
   * @param {File} file - El archivo a subir
   * @param {string} tenantId - El ID de la empresa (UUID)
   * @param {string} folder - (Opcional) Subcarpeta interna, ej: 'logos', 'documentos'
   * @returns {Promise<{path: string, error: any}>}
   */
  async uploadTenantFile(file, tenantId, folder = 'general') {
    try {
      if (!tenantId) throw new Error("tenantId es requerido para aislar el archivo.");
      
      // Limpiamos el nombre del archivo para evitar caracteres raros
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const uniqueFileName = `${Date.now()}_${cleanFileName}`;
      
      // Construimos la ruta estricta: {tenant_id}/{carpeta}/{nombre_archivo}
      const filePath = `${tenantId}/${folder}/${uniqueFileName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false // No sobrescribir por defecto
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error al subir archivo:', error);
      return { data: null, error };
    }
  },

  /**
   * Obtiene la URL pública de un archivo.
   * @param {string} filePath - La ruta guardada en la base de datos (ej: tenantId/folder/archivo.png)
   */
  getPublicUrl(filePath) {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  },

  /**
   * Elimina un archivo del storage
   * @param {string} filePath - La ruta completa del archivo
   */
  async deleteFile(filePath) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
      
    return { data, error };
  }
};
