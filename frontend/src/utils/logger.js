// Sistema de logging seguro para frontend
// Remove logs do console em produção

const isDevelopment = process.env.NODE_ENV === 'development';

// Lista de dados sensíveis que nunca devem ser logados
const SENSITIVE_KEYS = ['senha', 'password', 'token', 'cpf', 'email', 'accessToken'];

// Sanitizar dados antes de logar
function sanitizeData(data) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Logger wrapper que só funciona em desenvolvimento
const logger = {
  log: (...args) => {
    if (isDevelopment) {
      const sanitized = args.map(arg => 
        typeof arg === 'object' ? sanitizeData(arg) : arg
      );
      console.log(...sanitized);
    }
  },
  
  error: (...args) => {
    if (isDevelopment) {
      const sanitized = args.map(arg => 
        typeof arg === 'object' ? sanitizeData(arg) : arg
      );
      console.error(...sanitized);
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      const sanitized = args.map(arg => 
        typeof arg === 'object' ? sanitizeData(arg) : arg
      );
      console.warn(...sanitized);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      const sanitized = args.map(arg => 
        typeof arg === 'object' ? sanitizeData(arg) : arg
      );
      console.info(...sanitized);
    }
  }
};

export default logger;
