// Configuração da URL base da API
// Em desenvolvimento: usa proxy do package.json (deixar vazio)
// Em produção: usa a URL completa da VPS/domínio

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Constrói a URL completa para chamadas de API
 * @param {string} path - Caminho da API (ex: 'login', 'api/produtos', etc.)
 * @returns {string} URL completa ou relativa dependendo do ambiente
 */
export const getApiUrl = (path) => {
  // Remove barra inicial se existir para evitar duplicação
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Se API_BASE_URL estiver vazio, retorna path relativo (desenvolvimento com proxy)
  // Se estiver definido, retorna URL completa (produção)
  return API_BASE_URL ? `${API_BASE_URL}/${cleanPath}` : `/${cleanPath}`;
};

/**
 * Verifica se está em modo de produção
 * @returns {boolean}
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Obtém a URL base configurada
 * @returns {string}
 */
export const getBaseUrl = () => {
  return API_BASE_URL;
};

export default API_BASE_URL;
