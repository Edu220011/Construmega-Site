// Configuração da URL da API
const API_URL = process.env.REACT_APP_API_URL || '';

// Função para obter a URL da API com endpoint
export const getApiUrl = (endpoint = '') => {
  if (endpoint) {
    if (API_URL) {
      return `${API_URL}/${endpoint}`;
    } else {
      return `/${endpoint}`;
    }
  }
  return API_URL || '/';
};

export default API_URL;
