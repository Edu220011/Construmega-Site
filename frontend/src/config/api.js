// Configuração da URL da API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Função para obter a URL da API com endpoint
export const getApiUrl = (endpoint = '') => {
  if (endpoint) {
    return `${API_URL}/${endpoint}`;
  }
  return API_URL;
};

export default API_URL;
