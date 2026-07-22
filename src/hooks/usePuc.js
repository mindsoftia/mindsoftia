import { useState, useCallback } from 'react';
import pucService from '../services/pucService';

/**
 * usePuc — Custom Hook para la lógica y autodefinición NIIF del Plan Único de Cuentas
 * 
 * Especialidad: /master-dev + /master-cont
 * Propósito: Proveer a los componentes React (como PucIndex) métodos reactivos para
 * analizar códigos PUC en tiempo real, determinar cuenta padre, nivel y naturaleza,
 * además de gestionar el estado del catálogo en sesión/API.
 */
export function usePuc(initialAccounts = []) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Analizar en vivo un código ingresado por el usuario en el modal (Ej: `110505`)
   * Retorna metadatos contables automáticos según normas NIIF Colombia.
   */
  const analyzeCode = useCallback((codigo, cuentasExistentes = []) => {
    const code = (codigo || '').trim();
    const len = code.length;

    if (len === 0) {
      return { nivel: null, tipo: '', naturaleza: 'debito', padreDetectado: null };
    }

    // 1. Determinar nivel / tipo según longitud
    let tipo = 'auxiliar';
    let nivel = 5;
    if (len === 1) { tipo = 'clase'; nivel = 1; }
    else if (len === 2) { tipo = 'grupo'; nivel = 2; }
    else if (len === 4) { tipo = 'cuenta'; nivel = 3; }
    else if (len === 6) { tipo = 'subcuenta'; nivel = 4; }

    // 2. Determinar naturaleza por el 1er dígito NIIF (1,5,6,7,8 = Débito; 2,3,4,9 = Crédito)
    const primerDigito = code.substring(0, 1);
    const naturaleza = ['1', '5', '6', '7', '8'].includes(primerDigito) ? 'debito' : 'credito';

    // 3. Buscar cuenta padre potencial
    let padreDetectado = null;
    if (len > 1) {
      const prefijosBuscar = [];
      if (len > 6) prefijosBuscar.push(code.substring(0, 6));
      if (len > 4) prefijosBuscar.push(code.substring(0, 4));
      if (len > 2) prefijosBuscar.push(code.substring(0, 2));
      prefijosBuscar.push(code.substring(0, 1));

      for (const prefijo of prefijosBuscar) {
        const p = cuentasExistentes.find(c => (c.codigo || c.code) === prefijo);
        if (p) {
          padreDetectado = p;
          break;
        }
      }
    }

    return { nivel, tipo, naturaleza, padreDetectado };
  }, []);

  /**
   * Crear nueva cuenta contable y sincronizar con backend
   */
  const createAccount = async (accountData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await pucService.createAccount(accountData);
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al crear cuenta PUC';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    analyzeCode,
    createAccount
  };
}

export default usePuc;
